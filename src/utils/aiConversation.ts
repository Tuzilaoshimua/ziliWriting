import type { AgentDraftTransaction } from '../ai/agentDraftTransactions'
import { DRAFT_MODE_LABELS } from '../ai/writingAssistant'
import type { AiConversationMessage } from '../data/aiConversationStorage'
import type { DraftCandidate } from '../data/draftStorage'

export function conversationPayload<T>(message: AiConversationMessage): T | null {
  if (!message.payloadJson) return null
  try {
    return JSON.parse(message.payloadJson) as T
  } catch {
    return null
  }
}

export type AgentDraftTaskMetadata = {
  source?: string
  request?: string
  targetAction?: 'insert' | 'new_chapter'
  targetChapterTitle?: string
  acceptedTargetChapterId?: string
  transaction?: AgentDraftTransaction
}

export function agentDraftTask(candidate: DraftCandidate): AgentDraftTaskMetadata {
  try {
    const task = JSON.parse(candidate.taskJson || '{}') as AgentDraftTaskMetadata
    if (task.targetAction || !task.request || !/(?:新建|新增|创建|另起|单独形成).{0,12}(?:章节|一章|尾声)|(?:第\s*)?\d{1,6}\s*章\s*尾声/.test(task.request)) return task
    const explicit = task.request.match(/(?:第\s*)?(\d{1,6})\s*章(?:\s*[：:·\-]?\s*([^\n，。；]{1,30}))?/)
    const subtitle = (explicit?.[2] ?? '')
      .replace(/[》】)]/g, '')
      .replace(/(?:并|然后|接着|用来|作为)?(?:续写|扩写|补写|重写|改写|润色|生成|写出|写入|创建候选|作为候选).*$/, '')
      .trim()
    return {
      ...task,
      targetAction: 'new_chapter',
      targetChapterTitle: explicit ? `第${explicit[1]}章${subtitle ? ` ${subtitle}` : ''}` : undefined,
    }
  } catch {
    return {}
  }
}

export function draftModeLabel(candidate: DraftCandidate) {
  return agentDraftTask(candidate).targetAction === 'new_chapter' ? '新建章节' : DRAFT_MODE_LABELS[candidate.mode]
}

export function agentConversationTitle(message: string) {
  const source = message
    .replace(/\[[A-Z][A-Z0-9_]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:我想|我希望|请你?|麻烦你?|能不能|可不可以|可以请你|帮我|请帮我)\s*/, '')
  if (!source) return '新对话'
  const scope = source.match(/最后一章|最终章|本章|当前章|第\s*\d{1,6}\s*章|结局|大纲|人物|世界观|故事记忆|回收站|参考文本/)?.[0]?.replace(/\s+/g, '') ?? ''
  const action = source.match(/扩写|续写|改写|重写|润色|分析|讨论|推演|梳理|检查|总结|查找|寻找|描写|新建/)?.[0] ?? ''
  const length = source.match(/(?:大概|大约|约)?\s*(\d{2,6})\s*字/)?.[1]
  const structured = [...new Set([scope, action, length ? `${length}字` : ''].filter(Boolean))].join('')
  const fallback = source
    .replace(/^(?:在|从|关于)\s*/, '')
    .split(/[，。！？；：]/)[0]
    .replace(/(?:的内容|这件事|这个问题)$/, '')
    .trim()
  return Array.from(structured.length >= 4 ? structured : fallback).slice(0, 16).join('') || '新对话'
}
