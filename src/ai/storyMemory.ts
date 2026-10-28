import type { Chapter, DocumentNode, ProjectState } from '../data/projectStorage'
import type { AiConversationMessage } from '../data/aiConversationStorage'
import {
  defaultMemoryMetadata,
  memoryBundleIsCurrent,
  type ChapterMemoryBundle,
  type MemoryCandidate,
  type MemoryCandidateKind,
  type MemoryCandidateMetadata,
  type MemoryInformationNature,
  type MemoryLifecycle,
} from '../data/storyMemoryStorage'
import type { AiSettings } from './settings'
import { AiRequestError, chatCompletion, clearStreamProgress, generateStructured } from './client'
import { sanitizeCitationClaim, stripInlineEvidenceMarkers } from './citations'

type Passage = {
  nodeId: string
  text: string
}

export type ProjectAnswerCitation = {
  evidenceId: string
  chapterId: string
  chapterTitle: string
  nodeId: string
  quote: string
  claim: string
}

export type ProjectAnswer = {
  answer: string
  citations: ProjectAnswerCitation[]
}

type ExtractedMemory = {
  summary?: unknown
  candidates?: Array<{
    kind?: unknown
    title?: unknown
    detail?: unknown
    confidence?: unknown
    evidenceNodeId?: unknown
    evidenceQuote?: unknown
    nature?: unknown
    knower?: unknown
    lifecycle?: unknown
    storyTime?: unknown
    storyTimePrecision?: unknown
    participants?: unknown
    location?: unknown
    affectedScope?: unknown
    aliases?: unknown
    subject?: unknown
    stateAspect?: unknown
    stateValue?: unknown
    previousStateValue?: unknown
    responsibleParty?: unknown
    target?: unknown
  }>
}

export type ChapterMemoryAnalysisResult = {
  summary: string
  candidates: MemoryCandidate[]
  diagnostics: {
    initialCandidateCount: number
    retryCandidateCount: number
    acceptedCandidateCount: number
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function firstField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) if (source[key] !== undefined && source[key] !== null) return source[key]
  return undefined
}

const MEMORY_KIND_ALIASES: Record<string, MemoryCandidateKind> = {
  character: 'character',
  '人物': 'character',
  '角色': 'character',
  '人物信息': 'character',
  '角色档案': 'character',
  characterstate: 'character_state',
  '人物状态': 'character_state',
  '角色状态': 'character_state',
  location: 'location',
  '地点': 'location',
  '地点设定': 'location',
  organization: 'organization',
  '组织': 'organization',
  '势力': 'organization',
  item: 'item',
  '物品': 'item',
  '道具': 'item',
  world: 'world',
  '世界观': 'world',
  '世界设定': 'world',
  '规则': 'world',
  event: 'event',
  '事件': 'event',
  relationship: 'relationship',
  '关系': 'relationship',
  '人物关系': 'relationship',
  dialogue: 'dialogue',
  '对话': 'dialogue',
  '关键台词': 'dialogue',
  commitment: 'commitment',
  '承诺': 'commitment',
  '任务': 'commitment',
  '威胁': 'commitment',
  secret: 'secret',
  '秘密': 'secret',
  plot: 'plot',
  '剧情': 'plot',
  '剧情线': 'plot',
  claim: 'claim',
  '说法': 'claim',
  '传闻': 'claim',
  '观点': 'claim',
  foreshadowing: 'foreshadowing',
  '伏笔': 'foreshadowing',
}

function normalizeMemoryKind(value: unknown) {
  if (typeof value !== 'string') return value
  const key = value.trim().toLocaleLowerCase().replace(/[\s_-]+/g, '')
  return MEMORY_KIND_ALIASES[key] ?? value.trim()
}

function normalizeMemoryCandidate(value: unknown): NonNullable<ExtractedMemory['candidates']>[number] | null {
  const source = record(value)
  if (!source) return null
  return {
    kind: normalizeMemoryKind(firstField(source, ['kind', 'type', 'category', '类型', '类别'])),
    title: firstField(source, ['title', 'name', '标题', '名称']),
    detail: firstField(source, ['detail', 'description', 'content', '内容', '详情']),
    confidence: firstField(source, ['confidence', 'score', '置信度']),
    evidenceNodeId: firstField(source, ['evidenceNodeId', 'evidence_node_id', 'nodeId', 'node_id', '证据节点']),
    evidenceQuote: firstField(source, ['evidenceQuote', 'evidence_quote', 'quote', '引用', '证据原文']),
    nature: firstField(source, ['nature', 'informationNature', '信息性质']),
    knower: firstField(source, ['knower', '知情角色']),
    lifecycle: firstField(source, ['lifecycle', '状态']),
    storyTime: firstField(source, ['storyTime', 'story_time', '故事时间']),
    storyTimePrecision: firstField(source, ['storyTimePrecision', 'story_time_precision', '时间精度']),
    participants: firstField(source, ['participants', '人物', '参与者']),
    location: firstField(source, ['location', '地点']),
    affectedScope: firstField(source, ['affectedScope', 'affected_scope', '影响范围']),
    aliases: firstField(source, ['aliases', '别名']),
    subject: firstField(source, ['subject', '主体', '人物']),
    stateAspect: firstField(source, ['stateAspect', 'state_aspect', '状态维度']),
    stateValue: firstField(source, ['stateValue', 'state_value', '当前状态']),
    previousStateValue: firstField(source, ['previousStateValue', 'previous_state_value', '旧状态']),
    responsibleParty: firstField(source, ['responsibleParty', 'responsible_party', '负责人']),
    target: firstField(source, ['target', '目标']),
  }
}

function normalizeExtractedMemory(value: unknown): ExtractedMemory {
  const queue: unknown[] = [value]
  const visited = new Set<unknown>()
  let summary: unknown
  let candidates: unknown
  for (let depth = 0; depth < 4 && queue.length > 0; depth += 1) {
    const level = queue.splice(0)
    for (const item of level) {
      if (visited.has(item)) continue
      visited.add(item)
      if (typeof item === 'string' && /^\s*[\[{]/.test(item)) {
        try { queue.push(JSON.parse(item) as unknown) } catch { /* keep looking */ }
        continue
      }
      if (Array.isArray(item)) {
        candidates ??= item
        continue
      }
      const source = record(item)
      if (!source) continue
      summary ??= firstField(source, ['summary', 'chapterSummary', 'chapter_summary', 'answer', '摘要', '章节摘要', '本章摘要'])
      candidates ??= firstField(source, ['candidates', 'memories', 'memoryItems', 'memory_items', 'items', 'facts', '候选资料', '资料', '记忆'])
      for (const key of ['data', 'result', 'output', 'content', 'memory', 'chapterMemory', 'chapter_memory']) {
        if (source[key] !== undefined) queue.push(source[key])
      }
    }
  }
  return {
    summary,
    candidates: (Array.isArray(candidates) ? candidates : []).map(normalizeMemoryCandidate).filter((item): item is NonNullable<typeof item> => item !== null),
  }
}

function returnedShape(value: unknown) {
  if (Array.isArray(value)) return `数组（${value.length} 项）`
  const source = record(value)
  return source ? `字段：${Object.keys(source).slice(0, 12).join('、') || '无'}` : typeof value
}

function partialJsonStringField(source: string, field: string) {
  const start = new RegExp(`"${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*"`, 'i').exec(source)
  if (!start || start.index === undefined) return ''
  let escaped = false
  let encoded = ''
  for (let index = start.index + start[0].length; index < source.length; index += 1) {
    const character = source[index]
    if (!escaped && character === '"') {
      try { return JSON.parse(`"${encoded}"`) as string } catch { return '' }
    }
    encoded += character
    if (escaped) escaped = false
    else if (character === '\\') escaped = true
  }
  return ''
}

const MEMORY_KINDS: MemoryCandidateKind[] = ['character', 'character_state', 'location', 'organization', 'item', 'world', 'event', 'relationship', 'dialogue', 'commitment', 'secret', 'plot', 'claim', 'foreshadowing']
const INFORMATION_NATURES: MemoryInformationNature[] = ['objective', 'witnessed', 'belief', 'statement', 'rumor', 'dream', 'inference']
const LIFECYCLES: MemoryLifecycle[] = ['active', 'resolved', 'superseded', 'abandoned']
const STORY_TIME_PRECISIONS: MemoryCandidateMetadata['storyTimePrecision'][] = ['exact', 'approximate', 'relative', 'unknown']

function textFromNode(node: DocumentNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  return (node.content ?? []).map(textFromNode).join('')
}

function collectPassages(node: DocumentNode, passages: Passage[]) {
  const nodeId = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
  const text = textFromNode(node).trim()
  if (nodeId && text && ['paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem'].includes(node.type)) {
    passages.push({ nodeId, text })
    return
  }
  for (const child of node.content ?? []) collectPassages(child, passages)
}

function cleanText(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function compactTextWithOffsets(value: string) {
  let compact = ''
  const offsets: number[] = []
  for (let index = 0; index < value.length; index += 1) {
    if (/\s/u.test(value[index])) continue
    compact += value[index]
    offsets.push(index)
  }
  return { compact, offsets }
}

function locateCandidateEvidence(passages: Passage[], requestedNodeId: string, requestedQuote: string) {
  const quote = requestedQuote.replace(/^[\s"'“”‘’《》【】]+|[\s"'“”‘’《》【】]+$/g, '')
  if (!quote) return null
  const preferred = passages.find((passage) => passage.nodeId === requestedNodeId)
  const ordered = preferred ? [preferred, ...passages.filter((passage) => passage !== preferred)] : passages
  for (const passage of ordered) {
    const exactOffset = passage.text.indexOf(quote)
    if (exactOffset >= 0) return { passage, quote, offset: exactOffset }
    const source = compactTextWithOffsets(passage.text)
    const compactQuote = quote.replace(/\s+/gu, '')
    const compactOffset = source.compact.indexOf(compactQuote)
    if (compactOffset < 0 || compactQuote.length < 4) continue
    const start = source.offsets[compactOffset]
    const end = source.offsets[compactOffset + compactQuote.length - 1] + 1
    return { passage, quote: passage.text.slice(start, end), offset: start }
  }
  const fragments = quote.split(/[，。！？；：,.!?;:]|\.{2,}/u).map((item) => item.trim()).filter((item) => item.length >= 8).sort((left, right) => right.length - left.length)
  for (const fragment of fragments) {
    for (const passage of ordered) {
      const offset = passage.text.indexOf(fragment)
      if (offset >= 0) return { passage, quote: fragment, offset }
    }
  }
  return null
}

function buildChapterMemoryCandidates(items: NonNullable<ExtractedMemory['candidates']>, passages: Passage[], chapter: Chapter): MemoryCandidate[] {
  const now = Date.now()
  return items.slice(0, 12).flatMap((item): MemoryCandidate[] => {
    const kind = typeof item.kind === 'string' && MEMORY_KINDS.includes(item.kind as MemoryCandidateKind)
      ? item.kind as MemoryCandidateKind
      : null
    const title = cleanText(item.title, 80)
    const detail = cleanText(item.detail, 800)
    const evidence = locateCandidateEvidence(passages, cleanText(item.evidenceNodeId, 100), cleanText(item.evidenceQuote, 500))
    if (!kind || !title || !detail || !evidence) return []
    const nature = typeof item.nature === 'string' && INFORMATION_NATURES.includes(item.nature as MemoryInformationNature)
      ? item.nature as MemoryInformationNature : kind === 'claim' ? 'statement' : 'objective'
    const lifecycle = typeof item.lifecycle === 'string' && LIFECYCLES.includes(item.lifecycle as MemoryLifecycle)
      ? item.lifecycle as MemoryLifecycle : 'active'
    const storyTimePrecision = typeof item.storyTimePrecision === 'string' && STORY_TIME_PRECISIONS.includes(item.storyTimePrecision as MemoryCandidateMetadata['storyTimePrecision'])
      ? item.storyTimePrecision as MemoryCandidateMetadata['storyTimePrecision'] : 'unknown'
    return [{
      id: crypto.randomUUID(),
      projectId: '',
      chapterId: chapter.id,
      kind,
      title,
      detail,
      status: 'candidate',
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)),
      evidenceNodeId: evidence.passage.nodeId,
      evidenceQuote: evidence.quote,
      metadata: {
        ...defaultMemoryMetadata(chapter.id),
        nature,
        knower: cleanText(item.knower, 120),
        lifecycle,
        storyTime: cleanText(item.storyTime, 120),
        storyTimePrecision,
        participants: cleanText(item.participants, 240),
        location: cleanText(item.location, 160),
        affectedScope: cleanText(item.affectedScope, 300),
        aliases: (Array.isArray(item.aliases) ? item.aliases : []).map((alias) => cleanText(alias, 80)).filter(Boolean).slice(0, 20),
        subject: cleanText(item.subject, 120),
        stateAspect: cleanText(item.stateAspect, 80),
        stateValue: cleanText(item.stateValue, 240),
        previousStateValue: cleanText(item.previousStateValue, 240),
        responsibleParty: cleanText(item.responsibleParty, 120),
        target: cleanText(item.target, 240),
        evidenceStartOffset: evidence.offset,
        evidenceEndOffset: evidence.offset + evidence.quote.length,
        evidenceRole: 'support',
      },
      createdAt: now,
      updatedAt: now,
    }]
  })
}

async function requestChapterCandidateFallback(
  settings: AiSettings,
  apiKey: string,
  projectId: string,
  projectTitle: string,
  chapter: Chapter,
  source: string,
  signal?: AbortSignal,
) {
  const fallback = await generateStructured<unknown>({ ...settings, streamResponses: false }, apiKey, {
    temperature: 0,
    maxTokens: 1400,
    responseFormat: 'json_object',
    signal,
    repairStructuredOutput: false,
    metadata: { projectId, taskType: 'chapter_memory_candidates_retry', promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `[ZILI_CHAPTER_MEMORY_CANDIDATES_ONLY]\n你只负责从小说章节中提取对后续创作持续有用的资料。返回严格 JSON：{"candidates":[{"kind":"character|character_state|location|organization|item|world|event|relationship|dialogue|commitment|secret|plot|claim|foreshadowing","title":"短标题","detail":"资料内容","confidence":0到1,"evidenceNodeId":"输入中的段落nodeId","evidenceQuote":"从该段落逐字复制的连续短引文"}]}。逐个检查正文中的具名人物；只要某个具名人物被明确说明了身份、别名、外貌、背景、能力、长期动机、说话方式或稳定性格，就必须至少为该人物输出一条 character 候选，不能因为是配角、刚出场或戏份较少而省略。关系变化、世界规则、任务、秘密和伏笔也应提取。单次动作和短暂情绪不要当成稳定性格。每条必须使用真实 nodeId，并逐字复制 8 至 80 个字符作为证据；不要改写引文，不要输出摘要、Markdown 或思考过程。即使没有其他资料，也必须返回 {"candidates":[]}。`,
      },
      { role: 'user', content: `作品：${projectTitle}\n章节：${chapter.title}\n\n${source}` },
    ],
  })
  return normalizeExtractedMemory(fallback).candidates ?? []
}

export function isUsableChapterSummary(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const summary = value.trim()
  if (!summary || summary.length > 1200) return false
  const han = summary.match(/[\p{Script=Han}]/gu)?.length ?? 0
  const latin = summary.match(/[A-Za-z]/g)?.length ?? 0
  if (han < 12 || latin > Math.max(24, han * 0.35)) return false
  return !/(?:here(?:'s| is)\s+(?:a\s+)?thinking process|analy[sz]e user input|identify key elements|task constraints|final check against constraints|self[- ]correction|verification against constraints|output generation|思考过程|分析用户输入|约束检查|自我修正)/i.test(summary)
}

function recoverChapterSummary(value: unknown) {
  if (typeof value !== 'string') return ''
  let source = value.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/think>/gi, '').trim()
  const finalSection = /(?:^|\n)\s*(?:\*{0,2})?(?:Final (?:Answer|Summary)|最终摘要|本章摘要|章节摘要)(?:\*{0,2})?\s*[：:]?\s*\n([\s\S]+)/i.exec(source)?.[1]
  if (finalSection) source = finalSection
  source = source
    .split(/(?:^|\n)\s*(?:\d{1,2}[.)、]\s*)?(?:\*{0,2})?(?:Final Check|Self[- ]Correction|Verification|Output Generation|最终检查|自我修正|约束检查)(?:\*{0,2})?\s*[：:]?/im)[0]
    .replace(/^```(?:text|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^(?:章节摘要|本章摘要|摘要)\s*[：:]\s*/i, '')
    .trim()
  if (isUsableChapterSummary(source)) return source
  const chineseParagraphs = source.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter((paragraph) => {
    const han = paragraph.match(/[\p{Script=Han}]/gu)?.length ?? 0
    const latin = paragraph.match(/[A-Za-z]/g)?.length ?? 0
    return han >= 20 && latin <= Math.max(12, han * 0.2) && !/^[-*\d.)、\s]+/.test(paragraph)
  })
  const recovered = chineseParagraphs.at(-1) ?? ''
  return isUsableChapterSummary(recovered) ? recovered : ''
}

async function requestChapterSummary(
  settings: AiSettings,
  apiKey: string,
  projectId: string,
  projectTitle: string,
  chapter: Chapter,
  source: string,
  signal?: AbortSignal,
) {
  const response = await chatCompletion({ ...settings, streamResponses: false }, apiKey, {
    temperature: 0.1,
    maxTokens: 700,
    responseFormat: 'json_object',
    signal,
    allowReasoningFallback: false,
    metadata: { projectId, taskType: 'chapter_memory_summary', promptVersion: '3' },
    messages: [
      {
        role: 'system',
        content: `[ZILI_CHAPTER_SUMMARY_ONLY]
你只负责为小说作者整理当前章节摘要。严格依据正文，概括本章发生的事件、人物决定、关系或状态变化，以及对后续剧情有意义的信息。不得续写、评价或推测。只输出紧凑 JSON：{"summary":"150至300个汉字的章节摘要"}。不要输出 Markdown、说明或思考过程；如果服务支持 reasoning_content，内部思考只能放在那里。`,
      },
      { role: 'user', content: `作品：${projectTitle}\n章节：${chapter.title}\n\n${source}` },
    ],
  })
  const withoutThinking = response.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  const normalized = normalizeExtractedMemory(withoutThinking)
  const structuredSummary = recoverChapterSummary(normalized.summary)
  if (structuredSummary) return structuredSummary
  const plain = recoverChapterSummary(withoutThinking)
  if (!plain) throw new AiRequestError('AI 返回的是思考过程，没有可用的中文章节摘要')
  return plain
}

export async function analyzeChapterMemory(
  settings: AiSettings,
  apiKey: string,
  projectId: string,
  projectTitle: string,
  chapter: Chapter,
  signal?: AbortSignal,
): Promise<ChapterMemoryAnalysisResult> {
  const passages: Passage[] = []
  collectPassages(chapter.contentJson, passages)
  if (passages.length === 0 || !chapter.plainText.trim()) throw new AiRequestError('当前章节没有可分析的正文')

  const source = passages.map((passage) => `<段落 nodeId="${passage.nodeId}">\n${passage.text}\n</段落>`).join('\n')
  if (source.length > 60000) throw new AiRequestError('当前章节过长，请拆分章节后再更新故事记忆')

  const systemPrompt = `[ZILI_CHAPTER_MEMORY_V2]
你是小说作者的资料整理助手。只能整理输入正文明确表达的内容，不得补写、推测或把修辞当成事实。
返回一个 JSON 对象，结构必须是：
{"summary":"本章摘要","candidates":[{"kind":"character|character_state|location|organization|item|world|event|relationship|dialogue|commitment|secret|plot|claim|foreshadowing","title":"短标题","detail":"资料内容","confidence":0到1,"evidenceNodeId":"原文段落nodeId","evidenceQuote":"该段落中逐字一致的短引文","nature":"objective|witnessed|belief|statement|rumor|dream|inference","knower":"拥有该认知的角色，可空","lifecycle":"active|resolved|superseded|abandoned","storyTime":"故事内时间，可空","storyTimePrecision":"exact|approximate|relative|unknown","participants":"参与人物，顿号分隔","location":"发生地点，可空","affectedScope":"影响的人物、关系、剧情线或世界规则","aliases":["正文明确出现的别名"],"subject":"状态主体或任务负责人，可空","stateAspect":"位置|伤势|能力|持有物|阵营|关系|生死|情绪|认知或其他，可空","stateValue":"本章结束时的状态值，可空","previousStateValue":"正文明确说明的旧状态，可空","responsibleParty":"承诺或任务负责人，可空","target":"承诺、任务、威胁或伏笔指向的目标，可空"}]}
摘要使用 150 至 300 个汉字并放在 JSON 的第一个字段。只提取对后续创作有持续价值的资料，最多 12 条；detail 不超过 120 个汉字，evidenceQuote 不超过 80 个汉字，所有无内容的可选字段直接省略。character 只记录正文明确说明且相对稳定的身份、别名、外貌、背景、能力、长期动机、说话方式或稳定性格；单次行动、临时情绪和他人评价不得写成稳定人物档案。人物的位置、伤势、能力、持有物、阵营、生死、情绪、认知或当前目标发生变化时使用 character_state，并填写 subject、stateAspect、stateValue；临时情绪只有在本章结束时仍然有效且会影响后续时才记录，不要用 character_state 重复静态人物介绍。人物之间的关系及态度变化使用 relationship，并填写 participants；角色说法、传闻、计划、他人评价和推测使用 claim，不要写成确定事实。推动剧情或带伏笔的原话使用 dialogue，承诺、任务或威胁使用 commitment，尚未公开或知情范围受限的信息使用 secret，剧情线推进或停滞使用 plot。每条候选资料必须有一处直接证据，引文必须从对应段落原样复制。只输出紧凑 JSON，不要输出思考过程、Markdown 或说明。`
  const userPrompt = `作品：${projectTitle}\n章节：${chapter.title}\n章节修订：${chapter.revisionNumber}\n\n${source}`
  try {
    let streamedExtraction = ''
    const extractionRequest = generateStructured<unknown>(settings, apiKey, {
      temperature: 0.1,
      maxTokens: 1800,
      responseFormat: 'json_object',
      signal,
      repairStructuredOutput: false,
      metadata: { projectId, taskType: 'chapter_memory', promptVersion: '3' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }, (content) => { streamedExtraction = content }, (response) => {
      if (!streamedExtraction) streamedExtraction = response.content
    })
    const [extractionOutcome] = await Promise.allSettled([extractionRequest])
    if (signal?.aborted) throw new AiRequestError('AI 请求已停止')
    const rawResult = extractionOutcome.status === 'fulfilled' ? extractionOutcome.value : null
    const result = normalizeExtractedMemory(rawResult)

    const extractedCandidates = Array.isArray(result.candidates) ? result.candidates : []
    let candidates = buildChapterMemoryCandidates(extractedCandidates, passages, chapter)
    let retryCandidateCount = 0
    const extractedSummary = recoverChapterSummary(result.summary) || recoverChapterSummary(partialJsonStringField(streamedExtraction, 'summary'))
    if (candidates.length === 0 && !signal?.aborted) {
      try {
        const fallbackCandidates = await requestChapterCandidateFallback(settings, apiKey, projectId, projectTitle, chapter, source, signal)
        retryCandidateCount = fallbackCandidates.length
        candidates = buildChapterMemoryCandidates(fallbackCandidates, passages, chapter)
      } catch (error) {
        if (signal?.aborted) throw error
        // The summary can still be useful when the focused candidate audit fails.
      }
    }

    const candidateSummaryText = candidates.slice(0, 8).map((candidate) => candidate.detail).join('；').slice(0, 800)
    const candidateSummary = (candidateSummaryText.match(/[\p{Script=Han}]/gu)?.length ?? 0) >= 60
      ? recoverChapterSummary(candidateSummaryText)
      : ''
    let summary = extractedSummary
      || candidateSummary
    if (!summary) {
      try {
        summary = await requestChapterSummary(settings, apiKey, projectId, projectTitle, chapter, chapter.plainText, signal)
      } catch (error) {
        throw error
      }
    }
    if (!summary) {
      if (extractionOutcome.status === 'rejected' && extractionOutcome.reason instanceof Error) throw extractionOutcome.reason
      throw new AiRequestError(`AI 返回的结构中仍没有可用章节摘要（${returnedShape(rawResult)}）`)
    }
    return {
      summary,
      candidates,
      diagnostics: {
        initialCandidateCount: extractedCandidates.length,
        retryCandidateCount,
        acceptedCandidateCount: candidates.length,
      },
    }
  } finally {
    clearStreamProgress('chapter_memory', projectId)
  }
}

export async function proposeAuthorMemoryCandidates(
  settings: AiSettings,
  apiKey: string,
  projectId: string,
  chapter: Chapter,
  authorRequest: string,
  sourceMessageId: string,
  conversation: AiConversationMessage[],
  signal?: AbortSignal,
): Promise<MemoryCandidate[]> {
  const discussion = conversation
    .filter((message) => message.status === 'complete' && message.content.trim())
    .slice(-10)
    .map((message) => `${message.role === 'user' ? '作者' : '助手'}：${message.content.trim().slice(0, 4000)}`)
    .join('\n\n')
  const raw = await generateStructured<unknown>({ ...settings, streamResponses: false }, apiKey, {
    temperature: 0.1,
    maxTokens: 1600,
    responseFormat: 'json_object',
    signal,
    repairStructuredOutput: true,
    metadata: { projectId, taskType: 'agent_memory_proposal', promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `[ZILI_AGENT_MEMORY_PROPOSAL]\n你负责把作者明确陈述或明确批准的小说设定整理为待确认的故事资料。只能提取作者说过的内容，以及作者在当前请求中明确要求采纳的上一轮助手方案；不得擅自补充、推测或把助手未获批准的建议写成设定。返回严格 JSON：{"candidates":[{"kind":"character|character_state|location|organization|item|world|event|relationship|dialogue|commitment|secret|plot|claim|foreshadowing","title":"短标题","detail":"独立可读的设定内容","confidence":0到1,"nature":"objective|belief|statement|inference","aliases":[],"subject":"可空","stateAspect":"可空","stateValue":"可空","participants":"可空","location":"可空","affectedScope":"可空"}]}。最多 8 条，不要输出 Markdown、说明或思考过程。`,
      },
      { role: 'user', content: `最近对话：\n${discussion || '无'}\n\n作者当前要求：${authorRequest}` },
    ],
  })
  const items = normalizeExtractedMemory(raw).candidates ?? []
  const now = Date.now()
  const sourceQuote = authorRequest.trim().slice(0, 500)
  return items.slice(0, 8).flatMap((item): MemoryCandidate[] => {
    const kind = typeof item.kind === 'string' && MEMORY_KINDS.includes(item.kind as MemoryCandidateKind)
      ? item.kind as MemoryCandidateKind
      : null
    const title = cleanText(item.title, 80)
    const detail = cleanText(item.detail, 800)
    if (!kind || !title || !detail) return []
    const nature = typeof item.nature === 'string' && INFORMATION_NATURES.includes(item.nature as MemoryInformationNature)
      ? item.nature as MemoryInformationNature : 'objective'
    return [{
      id: crypto.randomUUID(),
      projectId,
      chapterId: chapter.id,
      kind,
      title,
      detail,
      status: 'candidate',
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.95)),
      evidenceNodeId: `agent-message:${sourceMessageId}`,
      evidenceQuote: sourceQuote,
      metadata: {
        ...defaultMemoryMetadata(chapter.id),
        nature,
        aliases: (Array.isArray(item.aliases) ? item.aliases : []).map((alias) => cleanText(alias, 80)).filter(Boolean).slice(0, 20),
        subject: cleanText(item.subject, 120),
        stateAspect: cleanText(item.stateAspect, 80),
        stateValue: cleanText(item.stateValue, 240),
        participants: cleanText(item.participants, 240),
        location: cleanText(item.location, 160),
        affectedScope: cleanText(item.affectedScope, 300),
        sourceRevisionNumber: 0,
        archivalSource: 'author',
      },
      createdAt: now,
      updatedAt: now,
    }]
  })
}

function searchTerms(query: string) {
  const normalized = query.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ')
  const terms = normalized.split(/\s+/).filter((term) => term.length >= 2)
  const chinese = normalized.match(/[\p{Script=Han}]{2,}/gu) ?? []
  for (const group of chinese) {
    for (let index = 0; index < group.length - 1; index += 1) terms.push(group.slice(index, index + 2))
  }
  return [...new Set(terms)]
}

function relevance(text: string, terms: string[]) {
  const source = text.toLowerCase()
  return terms.reduce((score, term) => score + (source.includes(term) ? Math.max(1, term.length - 1) : 0), 0)
}

function requestedChapterIndex(project: ProjectState, question: string): number | null {
  const numbered = question.match(/第\s*(\d+)\s*章/)
  if (numbered) {
    const index = Number(numbered[1]) - 1
    return index >= 0 && index < project.chapters.length ? index : null
  }
  const named = project.chapters.findIndex((chapter) => question.includes(chapter.title))
  return named >= 0 ? named : null
}

export async function askProjectQuestion(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  memories: ChapterMemoryBundle[],
  question: string,
  signal?: AbortSignal,
  options?: { allowedChapterIds?: Set<string>; includeConfirmedMemory?: boolean },
): Promise<ProjectAnswer> {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion) throw new AiRequestError('请先输入要询问的问题')
  const terms = searchTerms(trimmedQuestion)
  const temporalChapterIndex = requestedChapterIndex(project, trimmedQuestion)
  const chapterIndexById = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  const chapterMemory = new Map(memories.filter((bundle) => bundle.memory).map((bundle) => [bundle.memory!.chapterId, bundle]))
  const rankedChapters = project.chapters.map((chapter, index) => {
    const bundle = chapterMemory.get(chapter.id)
    const currentBundle = bundle && memoryBundleIsCurrent(bundle, project) ? bundle : null
    const confirmed = options?.includeConfirmedMemory === false ? [] : currentBundle?.candidates.filter((candidate) => {
      if (candidate.status !== 'confirmed' || temporalChapterIndex === null) return candidate.status === 'confirmed'
      const from = chapterIndexById.get(candidate.metadata?.validFromChapterId || candidate.chapterId) ?? index
      const to = candidate.metadata?.validToChapterId ? chapterIndexById.get(candidate.metadata.validToChapterId) : null
      return from <= temporalChapterIndex && (to === null || to === undefined || temporalChapterIndex < to)
    }) ?? []
    const storedSummary = currentBundle?.memory?.summary ?? ''
    const chapterSummary = isUsableChapterSummary(storedSummary) ? storedSummary : ''
    const memoryText = `${chapter.title}\n${chapterSummary}\n${confirmed.map((candidate) => `${candidate.title} ${candidate.detail}`).join('\n')}`
    return { chapter, index, score: relevance(memoryText, terms), confirmed }
  }).filter((item) => !options?.allowedChapterIds || options.allowedChapterIds.has(item.chapter.id))
    .filter((item) => temporalChapterIndex === null || item.index <= temporalChapterIndex)
    .sort((left, right) => right.score - left.score || right.index - left.index)

  const selectedChapterIds = new Set(rankedChapters.slice(0, Math.min(8, rankedChapters.length)).map((item) => item.chapter.id))
  const evidence = rankedChapters.flatMap(({ chapter, confirmed }) => {
    const passages: Passage[] = []
    collectPassages(chapter.contentJson, passages)
    const confirmedNodeIds = new Set(confirmed.map((candidate) => candidate.evidenceNodeId))
    return passages.map((passage, index) => ({
      evidenceId: `${chapter.id}|${passage.nodeId}`,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      nodeId: passage.nodeId,
      quote: passage.text,
      score: relevance(`${chapter.title} ${passage.text}`, terms) + (confirmedNodeIds.has(passage.nodeId) ? 4 : 0) + (selectedChapterIds.has(chapter.id) && index < 2 ? 1 : 0),
    }))
  }).sort((left, right) => right.score - left.score).slice(0, 28)

  if (evidence.length === 0) throw new AiRequestError('作品中还没有可用于回答的正文')
  const context = evidence.map((item) => `<证据 id="${item.evidenceId}" chapter="${item.chapterTitle}">\n${item.quote}\n</证据>`).join('\n')
  if (context.length > 55000) throw new AiRequestError('本次检索内容过多，请把问题描述得更具体')

  const result = await generateStructured<{ answer?: unknown; citations?: Array<{ evidenceId?: unknown; claim?: unknown }> }>(settings, apiKey, {
    temperature: 0.1,
    maxTokens: 3000,
    signal,
    metadata: { projectId: project.id, taskType: 'project_qa', promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `你是小说作者的作品资料助手。只能依据提供的原文证据回答，不得使用常识补全作品事实，不得把角色说法、传闻、计划或推测当成客观事实。
返回 JSON：{"answer":"清晰、直接的回答","citations":[{"evidenceId":"证据id","claim":"该证据支持的回答要点"}]}。
每个事实性结论都必须有引用。若证据不足，在 answer 中明确说明缺少什么，不要猜测。citations 只能使用输入中真实存在的证据 id。`,
      },
      { role: 'user', content: `作品：${project.title}\n问题：${trimmedQuestion}\n故事时点限制：${temporalChapterIndex === null ? '未指定' : `仅可使用第 ${temporalChapterIndex + 1} 章及以前的信息`}\n\n${context}` },
    ],
  })

  const answer = stripInlineEvidenceMarkers(cleanText(result.answer, 5000))
  if (!answer) throw new AiRequestError('AI 没有返回有效回答')
  const evidenceById = new Map(evidence.map((item) => [item.evidenceId, item]))
  const used = new Set<string>()
  const citations = (Array.isArray(result.citations) ? result.citations : []).flatMap((citation): ProjectAnswerCitation[] => {
    const evidenceId = cleanText(citation.evidenceId, 220)
    const source = evidenceById.get(evidenceId)
    if (!source || used.has(evidenceId)) return []
    used.add(evidenceId)
    return [{ ...source, claim: sanitizeCitationClaim(cleanText(citation.claim, 500), answer) }]
  })
  if (citations.length === 0) throw new AiRequestError('AI 回答没有提供可验证的原文引用')
  return { answer, citations }
}

export const MEMORY_KIND_LABELS: Record<MemoryCandidateKind, string> = {
  character: '人物',
  character_state: '人物状态',
  location: '地点',
  organization: '组织',
  item: '物品',
  world: '世界设定',
  event: '剧情事件',
  relationship: '人物关系',
  dialogue: '关键对白',
  commitment: '承诺与任务',
  secret: '秘密',
  plot: '剧情线',
  claim: '说法与认知',
  foreshadowing: '伏笔',
}
