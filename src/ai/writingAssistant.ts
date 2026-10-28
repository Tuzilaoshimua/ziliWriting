import type { Chapter, ProjectState, Scene } from '../data/projectStorage'
import { confirmedCurrentMemory, type ChapterMemoryBundle } from '../data/storyMemoryStorage'
import type { CreativeBrief, OutlineNode } from '../data/creativeStorage'
import type { DraftCandidate, DraftMode, DraftValidation } from '../data/draftStorage'
import type { StyleProfile } from '../data/styleStorage'
import type { AiSettings } from './settings'
import { AiRequestError, generateStructured } from './client'
import { findReferenceOverlap } from './styleAssistant'
import { formatAiStyleIssue, formatAntiAiStylePrompt, lintAiStyle } from './antiAiStyle'

export type DraftTask = {
  mode: DraftMode
  targetLength: number
  mustInclude: string
  mustAvoid: string
  noNewFacts: boolean
  styleInstruction: string
  selectedText: string
  pov?: string
  endingBeat?: string
  withhold?: string
}

function text(value: unknown, maximum = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function strings(value: unknown, limit = 20, maximum = 500) {
  return (Array.isArray(value) ? value : []).map((item) => text(item, maximum)).filter(Boolean).slice(0, limit)
}

function findOverlap(candidate: string, source: string) {
  const normalizedCandidate = candidate.replace(/\s+/g, '')
  const normalizedSource = source.replace(/\s+/g, '')
  const size = 36
  if (normalizedCandidate.length < size || normalizedSource.length < size) return ''
  for (let index = 0; index <= normalizedCandidate.length - size; index += 12) {
    const fragment = normalizedCandidate.slice(index, index + size)
    if (normalizedSource.includes(fragment)) return fragment
  }
  return ''
}

export async function generateDraftCandidates(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  chapter: Chapter,
  scene: Scene | undefined,
  brief: CreativeBrief,
  outline: OutlineNode[],
  memories: ChapterMemoryBundle[],
  styleProfile: StyleProfile,
  task: DraftTask,
  anchorFrom: number,
  anchorTo: number,
  signal?: AbortSignal,
): Promise<DraftCandidate[]> {
  if (task.mode === 'rewrite' && !task.selectedText.trim()) throw new AiRequestError('改写模式需要先在正文中选择文字')
  const confirmed = confirmedCurrentMemory(memories, project).slice(0, 50)
    .map((candidate) => ({ kind: candidate.kind, title: candidate.title, detail: candidate.detail, metadata: candidate.metadata }))
  const relevantOutline = outline.filter((node) => node.locked || ['chapter', 'scene'].includes(node.level)).slice(0, 40)
    .map((node) => ({ level: node.level, title: node.title, summary: node.summary, locked: node.locked }))
  const prefix = chapter.plainText.slice(-16000)
  const result = await generateStructured<{
    candidates?: Array<{
      title?: unknown
      text?: unknown
      validation?: Record<string, unknown>
    }>
  }>(settings, apiKey, {
    temperature: 0.65,
    maxTokens: 6500,
    signal,
    metadata: { projectId: project.id, taskType: `draft_${task.mode}`, promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `你是小说作者按需调用的协作者。只生成有限候选文本，不能声称候选已经写入正文。必须遵守任务约束和已确认正典，不得擅自复制特定作者表达。必须遵守下面的“去 AI 腔写作契约”，不要把文字修得工整、完整、对称；宁可留下粗粝的动作和停顿。
返回 JSON：{"candidates":[{"title":"方案名","text":"候选正文","validation":{"newFacts":["新增事实"],"usedContext":["使用的已知资料"],"conflicts":["潜在冲突"],"goalCoverage":"目标完成情况","styleNotes":["风格说明"]}}]}。
提供 2 至 3 个明显不同的候选方案。每个方案都要自行校验；无法确定的事实必须列入 newFacts 或 conflicts。不要输出 Markdown 代码块。`,
      },
      {
        role: 'user',
        content: `作品：${project.title}\n任务模式：${task.mode}\n目标长度：约 ${task.targetLength} 字\n必须发生：${task.mustInclude || '无'}\n禁止发生：${task.mustAvoid || '无'}\n视角人物：${task.pov?.trim() || '沿用当前章节视角'}\n退出节拍：${task.endingBeat?.trim() || '停在具体动作、画面或对话上，不总结、不升华'}\n必须暂时隐瞒：${task.withhold?.trim() || '无'}\n是否禁止新增正典事实：${task.noNewFacts ? '是' : '否，但新增事实仍需列出'}\n表达要求：${task.styleInstruction || '保持当前章节语气和节奏'}\n抽象风格档案：${JSON.stringify({ sentenceRhythm: styleProfile.sentenceRhythm, paragraphRhythm: styleProfile.paragraphRhythm, compositionBalance: styleProfile.compositionBalance, pointOfView: styleProfile.pointOfView, narrativeDistance: styleProfile.narrativeDistance, emotionalTone: styleProfile.emotionalTone, editableGuidance: styleProfile.editableGuidance })}\n${formatAntiAiStylePrompt(styleProfile)}\n当前场景：${scene ? JSON.stringify({ title: scene.title, goal: scene.goal, notes: scene.notes }) : '未设置'}\n创作简报：${JSON.stringify(brief)}\n相关大纲：${JSON.stringify(relevantOutline)}\n已确认资料：${JSON.stringify(confirmed)}\n选区：${task.selectedText || '无'}\n当前章节前文：\n${prefix}`,
      },
    ],
  })
  const now = Date.now()
  return (Array.isArray(result.candidates) ? result.candidates : []).slice(0, 3).flatMap((item): DraftCandidate[] => {
    const candidateText = text(item.text, 10000)
    const title = text(item.title, 120)
    if (!candidateText || !title) return []
    const validationSource = item.validation ?? {}
    const overlap = findOverlap(candidateText, task.mode === 'rewrite' ? chapter.plainText.replace(task.selectedText, '') : chapter.plainText)
    const referenceOverlap = findReferenceOverlap(candidateText, styleProfile.referenceFingerprints)
    const styleWarnings = lintAiStyle(candidateText, styleProfile).map(formatAiStyleIssue)
    const validation: DraftValidation = {
      newFacts: strings(validationSource.newFacts),
      usedContext: strings(validationSource.usedContext),
      conflicts: strings(validationSource.conflicts),
      goalCoverage: text(validationSource.goalCoverage, 1000),
      styleNotes: strings(validationSource.styleNotes),
      overlapWarnings: [
        ...(overlap ? [`与现有正文存在较长连续重合：“${overlap}”`] : []),
        ...(referenceOverlap ? [`与参考文本存在较长连续重合：“${referenceOverlap}”`] : []),
      ],
      styleWarnings,
    }
    if (task.noNewFacts && validation.newFacts.length > 0) validation.conflicts.unshift('任务要求不新增事实，但该候选包含新增事实')
    return [{
      id: crypto.randomUUID(),
      projectId: project.id,
      chapterId: chapter.id,
      mode: task.mode,
      title,
      text: candidateText,
      status: 'candidate',
      anchorFrom,
      anchorTo,
      sourceText: task.selectedText,
      taskJson: JSON.stringify(task),
      validation,
      createdAt: now,
      updatedAt: now,
    }]
  })
}

export const DRAFT_MODE_LABELS: Record<DraftMode, string> = {
  continue: '有限续写',
  rewrite: '改写选区',
  dialogue: '对白示例',
  transition: '过渡段落',
}
