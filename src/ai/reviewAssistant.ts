import type { Chapter, DocumentNode, ProjectState } from '../data/projectStorage'
import { confirmedCurrentMemory, type ChapterMemoryBundle } from '../data/storyMemoryStorage'
import type { CreativeBrief, OutlineNode } from '../data/creativeStorage'
import type { ReviewCategory, ReviewEvidence, ReviewIssue, ReviewSeverity, ReviewSource } from '../data/reviewStorage'
import type { AiSettings } from './settings'
import { AiRequestError, generateStructured } from './client'

export type ReviewPassage = { nodeId: string; text: string; startOffsetInNode?: number; endOffsetInNode?: number }
export type ReviewTextScope = 'selection' | 'scene' | 'chapter' | 'range'
export type ReviewTarget = {
  scope: ReviewTextScope
  label: string
  chapters: Array<{ chapter: Chapter; passages?: ReviewPassage[]; sceneId?: string; sceneTitle?: string; sceneGoal?: string; sceneNotes?: string }>
}
const CATEGORIES: ReviewCategory[] = ['character', 'timeline', 'knowledge', 'world', 'motivation', 'repetition', 'pacing', 'foreshadowing', 'ai_fact']
const SEVERITIES: ReviewSeverity[] = ['info', 'warning', 'error']

function textFromNode(node: DocumentNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  return (node.content ?? []).map(textFromNode).join('')
}

export function passagesFromChapter(chapter: Chapter) {
  const passages: ReviewPassage[] = []
  const visit = (node: DocumentNode) => {
    const nodeId = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
    const content = textFromNode(node).trim()
    if (nodeId && content && ['paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem'].includes(node.type)) {
      passages.push({ nodeId, text: content, startOffsetInNode: 0, endOffsetInNode: content.length })
      return
    }
    for (const child of node.content ?? []) visit(child)
  }
  visit(chapter.contentJson)
  return passages
}

function clean(value: unknown, maximum = 1600) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function makeIssue(projectId: string, chapter: Chapter, index: number, category: ReviewCategory, severity: ReviewSeverity, title: string, detail: string, suggestion: string, evidence: ReviewEvidence[]): ReviewIssue {
  const now = Date.now()
  return {
    id: `auto-${chapter.id}-${chapter.contentHash}-${category}-${index}`,
    projectId,
    chapterId: chapter.id,
    category,
    severity,
    status: 'open',
    source: 'automatic',
    title,
    detail,
    suggestion,
    evidence,
    contentHash: chapter.contentHash,
    createdAt: now,
    updatedAt: now,
  }
}

export function runAutomaticChecks(projectId: string, chapter: Chapter): ReviewIssue[] {
  const passages = passagesFromChapter(chapter)
  const issues: ReviewIssue[] = []
  for (let index = 1; index < passages.length; index += 1) {
    const current = passages[index]
    const previous = passages[index - 1]
    if (current.text.length >= 8 && current.text.replace(/\s+/g, '') === previous.text.replace(/\s+/g, '')) {
      issues.push(makeIssue(projectId, chapter, issues.length, 'repetition', 'warning', '相邻段落内容重复', '连续两个段落的文字完全相同，可能是重复粘贴。', '确认是否需要删除其中一段。', [
        { chapterId: chapter.id, chapterTitle: chapter.title, nodeId: current.nodeId, quote: current.text.slice(0, 300) },
      ]))
    }
  }
  for (const passage of passages) {
    if (passage.text.length > 800) {
      issues.push(makeIssue(projectId, chapter, issues.length, 'pacing', 'info', '段落较长', `该段约 ${passage.text.length} 字，阅读节奏可能过于集中。`, '检查是否可以按动作、视角或信息变化拆段。', [
        { chapterId: chapter.id, chapterTitle: chapter.title, nodeId: passage.nodeId, quote: passage.text.slice(0, 300) },
      ]))
    }
  }
  const openingQuotes = (chapter.plainText.match(/“/g) ?? []).length
  const closingQuotes = (chapter.plainText.match(/”/g) ?? []).length
  if (openingQuotes !== closingQuotes && passages.length > 0) {
    issues.push(makeIssue(projectId, chapter, issues.length, 'repetition', 'warning', '对话引号可能未闭合', `本章检测到 ${openingQuotes} 个左引号和 ${closingQuotes} 个右引号。`, '检查引号是否成对出现。', [
      { chapterId: chapter.id, chapterTitle: chapter.title, nodeId: passages[passages.length - 1].nodeId, quote: passages[passages.length - 1].text.slice(0, 300) },
    ]))
  }
  return issues
}

export async function reviewScopedContinuity(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  target: ReviewTarget,
  memories: ChapterMemoryBundle[],
  brief: CreativeBrief,
  outline: OutlineNode[],
  signal?: AbortSignal,
): Promise<ReviewIssue[]> {
  const scopedPassages = target.chapters.flatMap((entry) => {
    const passages = entry.passages ?? passagesFromChapter(entry.chapter)
    return passages.map((passage) => ({
      ...passage,
      evidenceId: `${entry.chapter.id}:${passage.nodeId}`,
      chapter: entry.chapter,
      sceneId: entry.sceneId,
      sceneTitle: entry.sceneTitle,
    }))
  })
  if (scopedPassages.length === 0) throw new AiRequestError('当前检查范围没有正文')
  const source = target.chapters.map((entry) => {
    const passages = scopedPassages.filter((passage) => passage.chapter.id === entry.chapter.id)
    const sceneContext = entry.sceneId
      ? `\n场景：${entry.sceneTitle || '未命名场景'}\n场景目标：${entry.sceneGoal || '未填写'}\n场景备注：${entry.sceneNotes || '未填写'}`
      : ''
    return `<章节 id="${entry.chapter.id}" title="${entry.chapter.title}">${sceneContext}\n${passages.map((passage) => `<证据 id="${passage.evidenceId}">${passage.text}</证据>`).join('\n')}\n</章节>`
  }).join('\n')
  if (source.length > 80000) throw new AiRequestError('检查范围过长，请缩小章节范围后重试')
  const confirmed = confirmedCurrentMemory(memories, project).slice(0, 80)
    .map((candidate) => ({ kind: candidate.kind, title: candidate.title, detail: candidate.detail, metadata: candidate.metadata }))
  const sourceById = new Map(scopedPassages.map((passage) => [passage.evidenceId, passage]))
  const reviewSource: ReviewSource = `${target.scope}_review` as ReviewSource
  const result = await generateStructured<{ issues?: Array<Record<string, unknown>> }>(settings, apiKey, {
    temperature: 0.1,
    maxTokens: 5000,
    signal,
    metadata: { projectId: project.id, taskType: reviewSource, promptVersion: '2' },
    messages: [
      {
        role: 'system',
        content: `你是小说连续性审稿助理。只报告有明确依据的问题，不要把个人偏好包装成错误。检查人物状态、时间线、认知边界、世界规则、动机、重复、节奏、伏笔和新增事实。
返回 JSON：{"issues":[{"category":"character|timeline|knowledge|world|motivation|repetition|pacing|foreshadowing|ai_fact","severity":"info|warning|error","title":"问题标题","detail":"为什么是问题","suggestion":"处理建议","evidenceNodeIds":["证据id"]}]}。
最多 20 条。证据只能使用输入中的真实 id。证据不足就不报告。`,
      },
      { role: 'user', content: `作品：${project.title}\n检查范围：${target.label}\n创作简报：${JSON.stringify(brief)}\n相关大纲：${JSON.stringify(outline.slice(0, 50))}\n已确认正典：${JSON.stringify(confirmed)}\n${source}` },
    ],
  })
  const now = Date.now()
  const singleChapter = target.chapters.length === 1 ? target.chapters[0].chapter : null
  const revisionHashes = Object.fromEntries(target.chapters.map((entry) => [entry.chapter.id, entry.chapter.contentHash]))
  return (Array.isArray(result.issues) ? result.issues : []).slice(0, 20).flatMap((item): ReviewIssue[] => {
    const category = typeof item.category === 'string' && CATEGORIES.includes(item.category as ReviewCategory) ? item.category as ReviewCategory : null
    const severity = typeof item.severity === 'string' && SEVERITIES.includes(item.severity as ReviewSeverity) ? item.severity as ReviewSeverity : null
    const title = clean(item.title, 160)
    const detail = clean(item.detail)
    const ids = (Array.isArray(item.evidenceNodeIds) ? item.evidenceNodeIds : []).map((id) => clean(id, 240)).filter((id) => sourceById.has(id)).slice(0, 4)
    if (!category || !severity || !title || !detail || ids.length === 0) return []
    return [{
      id: crypto.randomUUID(),
      projectId: project.id,
      chapterId: singleChapter?.id ?? null,
      category,
      severity,
      status: 'open',
      source: reviewSource,
      title,
      detail,
      suggestion: clean(item.suggestion),
      evidence: ids.map((id) => {
        const passage = sourceById.get(id)!
        return {
          chapterId: passage.chapter.id,
          chapterTitle: passage.chapter.title,
          sceneId: passage.sceneId,
          nodeId: passage.nodeId,
          quote: passage.text.slice(0, 500),
          revisionNumber: passage.chapter.revisionNumber,
          startOffsetInNode: passage.startOffsetInNode ?? 0,
          endOffsetInNode: Math.min(passage.endOffsetInNode ?? passage.text.length, (passage.startOffsetInNode ?? 0) + 500),
          role: 'support' as const,
        }
      }),
      contentHash: singleChapter?.contentHash ?? JSON.stringify(revisionHashes),
      createdAt: now,
      updatedAt: now,
    }]
  })
}

export function reviewChapterContinuity(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  chapter: Chapter,
  memories: ChapterMemoryBundle[],
  brief: CreativeBrief,
  outline: OutlineNode[],
  signal?: AbortSignal,
) {
  return reviewScopedContinuity(settings, apiKey, project, { scope: 'chapter', label: chapter.title, chapters: [{ chapter }] }, memories, brief, outline, signal)
}

export async function reviewProjectContinuity(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  memories: ChapterMemoryBundle[],
  signal?: AbortSignal,
): Promise<ReviewIssue[]> {
  const candidates = confirmedCurrentMemory(memories, project).slice(0, 160)
  if (candidates.length < 2) throw new AiRequestError('全书检查至少需要两条已确认故事资料')
  const chapterTitles = new Map(project.chapters.map((chapter) => [chapter.id, chapter.title]))
  const evidence = candidates.map((candidate) => ({
    id: candidate.id,
    chapterId: candidate.chapterId,
    chapterTitle: chapterTitles.get(candidate.chapterId) ?? '未知章节',
    nodeId: candidate.evidenceNodeId,
    quote: candidate.evidenceQuote,
    revisionNumber: project.chapters.find((chapter) => chapter.id === candidate.chapterId)?.revisionNumber,
    startOffsetInNode: candidate.metadata.evidenceStartOffset,
    endOffsetInNode: candidate.metadata.evidenceEndOffset,
    fact: `${candidate.title}：${candidate.detail}`,
    kind: candidate.kind,
    metadata: candidate.metadata,
  }))
  const result = await generateStructured<{ issues?: Array<Record<string, unknown>> }>(settings, apiKey, {
    temperature: 0.1,
    maxTokens: 5000,
    signal,
    metadata: { projectId: project.id, taskType: 'project_review', promptVersion: '1' },
    messages: [
      { role: 'system', content: `你是长篇小说审稿助理。根据作者已确认的正典资料查找跨章节矛盾、长期未推进事项和认知越界。不要仅因情节尚未解释就断言矛盾。
返回 JSON：{"issues":[{"category":"character|timeline|knowledge|world|motivation|repetition|pacing|foreshadowing|ai_fact","severity":"info|warning|error","title":"问题标题","detail":"判断依据","suggestion":"建议","evidenceIds":["资料id"]}]}。每条至少引用两条输入资料，最多 20 条。` },
      { role: 'user', content: `作品：${project.title}\n已确认资料：${JSON.stringify(evidence)}` },
    ],
  })
  const byId = new Map(evidence.map((item) => [item.id, item]))
  const now = Date.now()
  return (Array.isArray(result.issues) ? result.issues : []).slice(0, 20).flatMap((item): ReviewIssue[] => {
    const category = typeof item.category === 'string' && CATEGORIES.includes(item.category as ReviewCategory) ? item.category as ReviewCategory : null
    const severity = typeof item.severity === 'string' && SEVERITIES.includes(item.severity as ReviewSeverity) ? item.severity as ReviewSeverity : null
    const ids = (Array.isArray(item.evidenceIds) ? item.evidenceIds : []).map((id) => clean(id, 120)).filter((id) => byId.has(id)).slice(0, 5)
    const title = clean(item.title, 160)
    const detail = clean(item.detail)
    if (!category || !severity || !title || !detail || ids.length < 2) return []
    return [{
      id: crypto.randomUUID(), projectId: project.id, chapterId: null, category, severity, status: 'open', source: 'project_review', title, detail,
      suggestion: clean(item.suggestion),
      evidence: ids.map((id) => { const source = byId.get(id)!; return { chapterId: source.chapterId, chapterTitle: source.chapterTitle, nodeId: source.nodeId, quote: source.quote, revisionNumber: source.revisionNumber, startOffsetInNode: source.startOffsetInNode, endOffsetInNode: source.endOffsetInNode, role: 'support' as const } }),
      contentHash: '', createdAt: now, updatedAt: now,
    }]
  })
}

export const REVIEW_CATEGORY_LABELS: Record<ReviewCategory, string> = {
  character: '人物状态', timeline: '时间线', knowledge: '认知边界', world: '世界规则', motivation: '人物动机', repetition: '重复', pacing: '节奏', foreshadowing: '伏笔', ai_fact: '新增事实',
}
