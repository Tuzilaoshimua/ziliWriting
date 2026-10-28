import type { Chapter, ProjectState, Scene } from '../data/projectStorage'
import { confirmedCurrentMemory, type ChapterMemoryBundle } from '../data/storyMemoryStorage'
import type { AdvisorDirection, AdvisorSession, CreativeBrief, OutlineLevel, OutlineNode } from '../data/creativeStorage'
import type { AiSettings } from './settings'
import { AiRequestError, generateStructured } from './client'

function text(value: unknown, maximum = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function briefContext(brief: CreativeBrief) {
  return JSON.stringify({
    premise: brief.premise,
    genre: brief.genre,
    coreExperience: brief.coreExperience,
    theme: brief.theme,
    protagonistDesire: brief.protagonistDesire,
    stakes: brief.stakes,
    centralConflict: brief.centralConflict,
    lengthTarget: brief.lengthTarget,
    endingTendency: brief.endingTendency,
  })
}

export async function developCreativeBrief(
  settings: AiSettings,
  apiKey: string,
  projectTitle: string,
  current: CreativeBrief,
  authorInput: string,
  signal?: AbortSignal,
): Promise<{ brief: CreativeBrief; questions: string[] }> {
  if (!authorInput.trim() && !Object.values(current).some((value) => typeof value === 'string' && value.trim())) {
    throw new AiRequestError('请先描述你想写的故事')
  }
  const result = await generateStructured<{ brief?: Record<string, unknown>; questions?: unknown[] }>(settings, apiKey, {
    temperature: 0.35,
    maxTokens: 2600,
    signal,
    metadata: { projectId: current.projectId, taskType: 'creative_brief', promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `你是小说创作顾问。根据作者输入整理一份可编辑创作简报，不替作者擅自拍板。信息不足时保留已有字段，并只追问最多 3 个真正影响故事方向的问题。
返回 JSON：{"brief":{"premise":"一句话故事前提","genre":"类型","coreExperience":"读者核心体验","theme":"主题","protagonistDesire":"主角欲望","stakes":"失败代价","centralConflict":"主要矛盾","lengthTarget":"篇幅倾向","endingTendency":"结局倾向"},"questions":["问题"]}。
不要一次生成章节大纲，不要模仿特定作者。`,
      },
      { role: 'user', content: `作品：${projectTitle}\n现有简报：${briefContext(current)}\n作者补充：${authorInput.trim() || '无新增补充，请整理现有内容'}` },
    ],
  })
  const source = result.brief ?? {}
  const updatedAt = Date.now()
  const brief: CreativeBrief = {
    ...current,
    premise: text(source.premise, 1000) || current.premise,
    genre: text(source.genre, 300) || current.genre,
    coreExperience: text(source.coreExperience, 1000) || current.coreExperience,
    theme: text(source.theme, 800) || current.theme,
    protagonistDesire: text(source.protagonistDesire, 800) || current.protagonistDesire,
    stakes: text(source.stakes, 800) || current.stakes,
    centralConflict: text(source.centralConflict, 1000) || current.centralConflict,
    lengthTarget: text(source.lengthTarget, 300) || current.lengthTarget,
    endingTendency: text(source.endingTendency, 500) || current.endingTendency,
    updatedAt,
  }
  const questions = (Array.isArray(result.questions) ? result.questions : []).map((item) => text(item, 300)).filter(Boolean).slice(0, 3)
  return { brief, questions }
}

export async function generateOutlineLayer(
  settings: AiSettings,
  apiKey: string,
  projectTitle: string,
  brief: CreativeBrief,
  existing: OutlineNode[],
  level: OutlineLevel,
  authorInstruction: string,
  signal?: AbortSignal,
): Promise<OutlineNode[]> {
  if (!brief.premise.trim()) throw new AiRequestError('请先完成创作简报中的故事前提')
  const locked = existing.filter((node) => node.locked).map((node) => ({ level: node.level, title: node.title, summary: node.summary }))
  const currentLayer = existing.filter((node) => node.level === level).map((node) => ({ title: node.title, summary: node.summary, locked: node.locked }))
  const result = await generateStructured<{ nodes?: Array<{ title?: unknown; summary?: unknown }> }>(settings, apiKey, {
    temperature: 0.45,
    maxTokens: 3200,
    signal,
    metadata: { projectId: brief.projectId, taskType: 'outline_generation', promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `你是小说分层大纲顾问。只生成用户指定的一层，不能一次扩展成几十章。必须遵守锁定内容，不覆盖作者已经锁定的决定。
返回 JSON：{"nodes":[{"title":"节点标题","summary":"该节点的目标、冲突和结果"}]}。生成 3 至 6 个明显连贯但仍可编辑的节点，最多 8 个。`,
      },
      {
        role: 'user',
        content: `作品：${projectTitle}\n创作简报：${briefContext(brief)}\n目标层级：${level}\n锁定内容：${JSON.stringify(locked)}\n当前层已有内容：${JSON.stringify(currentLayer)}\n作者要求：${authorInstruction.trim() || '根据简报推演这一层'}`,
      },
    ],
  })
  const now = Date.now()
  const startOrder = existing.reduce((maximum, node) => Math.max(maximum, node.sortOrder), -1) + 1
  return (Array.isArray(result.nodes) ? result.nodes : []).slice(0, 8).flatMap((item, index): OutlineNode[] => {
    const title = text(item.title, 120)
    const summary = text(item.summary, 1200)
    if (!title || !summary) return []
    return [{
      id: crypto.randomUUID(),
      projectId: brief.projectId,
      parentId: null,
      level,
      title,
      summary,
      locked: false,
      sortOrder: startOrder + index,
      source: 'ai',
      updatedAt: now,
    }]
  })
}

export async function diagnoseWritingSituation(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  chapter: Chapter,
  scene: Scene | undefined,
  brief: CreativeBrief,
  outline: OutlineNode[],
  memories: ChapterMemoryBundle[],
  authorNote: string,
  previousSessions: AdvisorSession[] = [],
  signal?: AbortSignal,
): Promise<AdvisorSession> {
  if (!chapter.plainText.trim()) throw new AiRequestError('当前章节没有可分析的正文')
  const confirmed = confirmedCurrentMemory(memories, project).slice(0, 40)
    .map((candidate) => ({ kind: candidate.kind, title: candidate.title, detail: candidate.detail, metadata: candidate.metadata }))
  const relevantOutline = outline.filter((node) => node.locked || ['chapter', 'scene'].includes(node.level)).slice(0, 40)
    .map((node) => ({ level: node.level, title: node.title, summary: node.summary, locked: node.locked }))
  const chapterText = chapter.plainText.trim()
  if (chapterText.length > 45000) throw new AiRequestError('当前章节过长，请缩小章节后再梳理思路')
  const result = await generateStructured<{
    situation?: unknown
    obstacle?: unknown
    directions?: Array<Record<string, unknown>>
  }>(settings, apiKey, {
    temperature: 0.5,
    maxTokens: 4200,
    signal,
    metadata: { projectId: project.id, taskType: 'writing_diagnosis', promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `你是小说作者的创作顾问，不直接替作者写正文。先分析当前局面和真正的创作障碍，再提供 3 至 5 个明显不同的推进方向。方向必须解释收益、代价、风险和下一拍发生什么。
返回 JSON：{"situation":"当前局面总结","obstacle":"创作障碍分析","directions":[{"title":"方向名","approach":"推进方式","benefits":"收益","costs":"代价","risks":"风险","nextBeat":"下一场或下一拍"}]}。
不得把未确认资料当成正典，不得声称只有一个正确方向。`,
      },
      {
        role: 'user',
        content: `作品：${project.title}\n创作简报：${briefContext(brief)}\n当前章节：${chapter.title}\n当前场景：${scene ? JSON.stringify({ title: scene.title, goal: scene.goal, notes: scene.notes }) : '未设置'}\n相关大纲：${JSON.stringify(relevantOutline)}\n已确认资料：${JSON.stringify(confirmed)}\n此前讨论：${JSON.stringify(previousSessions.slice(0, 3).map((session) => ({ authorNote: session.userNote, situation: session.situation, obstacle: session.obstacle, directions: session.directions.map((direction) => ({ title: direction.title, approach: direction.approach })) })))}\n作者当前补充：${authorNote.trim() || '请判断当前最可能的创作障碍'}\n\n当前章节正文：\n${chapterText}`,
      },
    ],
  })
  const directions = (Array.isArray(result.directions) ? result.directions : []).slice(0, 5).flatMap((item): AdvisorDirection[] => {
    const title = text(item.title, 120)
    const approach = text(item.approach, 1000)
    if (!title || !approach) return []
    return [{
      id: crypto.randomUUID(),
      title,
      approach,
      benefits: text(item.benefits, 700),
      costs: text(item.costs, 700),
      risks: text(item.risks, 700),
      nextBeat: text(item.nextBeat, 800),
    }]
  })
  const situation = text(result.situation, 1800)
  const obstacle = text(result.obstacle, 1800)
  if (!situation || !obstacle || directions.length < 2) throw new AiRequestError('AI 没有返回完整的局面分析和方向')
  return {
    id: crypto.randomUUID(),
    projectId: project.id,
    chapterId: chapter.id,
    sceneId: scene?.id ?? null,
    situation,
    obstacle,
    directions,
    userNote: authorNote.trim(),
    createdAt: Date.now(),
  }
}

export const OUTLINE_LEVEL_LABELS: Record<OutlineLevel, string> = {
  world: '世界观',
  character: '人物',
  stage: '故事阶段',
  volume: '分卷',
  chapter: '章节',
  scene: '场景',
}
