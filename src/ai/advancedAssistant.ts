import type { Chapter, ProjectState, Scene } from '../data/projectStorage'
import { confirmedCurrentMemory, type ChapterMemoryBundle } from '../data/storyMemoryStorage'
import type { CreativeWorkspace } from '../data/creativeStorage'
import type { ResearchSourceCard } from '../data/advancedAiStorage'
import type { AiSettings } from './settings'
import { AiRequestError, generateStructured } from './client'

export type VoiceTestResult = {
  profileSummary: string
  sampleLines: Array<{ line: string; intent: string; whyFits: string; risk: string }>
  consistencyChecks: string[]
  unknowns: string[]
}

export type RelationshipSimulationResult = {
  currentDynamic: string
  evidenceUsed: string[]
  tensions: string[]
  directions: Array<{ title: string; change: string; benefit: string; cost: string; risk: string; nextBeat: string }>
}

export type ReaderSimulationResult = {
  firstImpression: string
  emotionalCurve: string
  expectations: string[]
  confusions: Array<{ point: string; quote: string }>
  pacingNotes: string[]
  strongestMoment: { quote: string; reason: string } | null
}

export type ResearchSynthesisResult = {
  answer: string
  findings: Array<{ sourceId: string; claim: string; application: string; caution: string }>
  gaps: string[]
  suggestedQueries: string[]
}

export type WritingPlanResult = {
  currentAssessment: string
  milestones: Array<{ title: string; targetWords: number; focus: string; dependencies: string[] }>
  plotThreads: Array<{ name: string; status: string; nextAction: string; risk: string }>
  forecast: { estimatedTotalWords: number; remainingWords: number; paceNote: string }
  nextSession: string[]
}

export type PlotSimulationResult = {
  currentSituation: string
  assumptions: string[]
  directions: Array<{
    title: string
    immediateBeat: string
    characterImpact: string
    threadImpact: string
    futureCost: string
    continuityRisk: string
  }>
  decisionQuestions: string[]
}

export type ScenePacingResult = {
  sceneGoal: string
  beats: Array<{ beat: string; function: string; tension: number }>
  stagnationPoints: Array<{ quote: string; reason: string }>
  tensionCurve: string
  revisionPriorities: string[]
}

export type StoryDebtItem = {
  candidateId: string
  kind: string
  title: string
  detail: string
  firstChapterId: string
  lastChapterId: string
  chaptersSinceMention: number
  urgency: 'low' | 'medium' | 'high'
  owner: string
  target: string
}

export type WritingSessionRecapResult = {
  summary: string
  additions: string[]
  removals: string[]
  storyChanges: string[]
  followUps: string[]
}

function text(value: unknown, maximum = 1200) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function texts(value: unknown, maximumItems = 10, maximumLength = 500) {
  return (Array.isArray(value) ? value : []).map((item) => text(item, maximumLength)).filter(Boolean).slice(0, maximumItems)
}

function confirmedMemory(memories: ChapterMemoryBundle[], project: ProjectState) {
  return confirmedCurrentMemory(memories, project)
    .slice(0, 100)
    .map((candidate) => ({ kind: candidate.kind, title: candidate.title, detail: candidate.detail, evidenceQuote: candidate.evidenceQuote, metadata: candidate.metadata }))
}

export async function testCharacterVoice(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  memories: ChapterMemoryBundle[],
  characterName: string,
  situation: string,
  signal?: AbortSignal,
): Promise<VoiceTestResult> {
  const name = characterName.trim()
  if (!name) throw new AiRequestError('请先输入要测试的人物名称')
  const confirmed = confirmedMemory(memories, project)
  const related = confirmed.filter((item) => `${item.title} ${item.detail} ${item.evidenceQuote}`.includes(name)).slice(0, 30)
  if (related.length === 0) throw new AiRequestError('已确认故事资料中没有找到这个人物，请先分析并确认相关人物资料')
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.45,
    maxTokens: 3000,
    signal,
    metadata: { projectId: project.id, taskType: 'character_voice_test', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是小说人物声音顾问。只依据已确认资料分析人物表达习惯，示例对白只是候选，不是已经发生的剧情。不得模仿特定现实作者。返回 JSON：{"profileSummary":"声音轮廓","sampleLines":[{"line":"候选对白","intent":"说话意图","whyFits":"为何符合","risk":"可能偏离人物之处"}],"consistencyChecks":["作者检查项"],"unknowns":["资料不足之处"]}。生成 3 条明显不同的对白候选。' },
      { role: 'user', content: `作品：${project.title}\n人物：${name}\n测试情境：${situation.trim() || '在压力下回应一项意外要求'}\n已确认资料：${JSON.stringify(related)}` },
    ],
  })
  const sampleLines = (Array.isArray(result.sampleLines) ? result.sampleLines : []).flatMap((item): VoiceTestResult['sampleLines'] => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const line = text(source.line, 500)
    if (!line) return []
    return [{ line, intent: text(source.intent), whyFits: text(source.whyFits), risk: text(source.risk) }]
  }).slice(0, 5)
  const profileSummary = text(result.profileSummary, 1800)
  if (!profileSummary || sampleLines.length < 2) throw new AiRequestError('AI 没有返回完整的人物声音测试')
  return { profileSummary, sampleLines, consistencyChecks: texts(result.consistencyChecks), unknowns: texts(result.unknowns) }
}

export async function simulateRelationship(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  memories: ChapterMemoryBundle[],
  firstCharacter: string,
  secondCharacter: string,
  scenario: string,
  signal?: AbortSignal,
): Promise<RelationshipSimulationResult> {
  const first = firstCharacter.trim()
  const second = secondCharacter.trim()
  if (!first || !second || first === second) throw new AiRequestError('请输入两个不同的人物名称')
  const confirmed = confirmedMemory(memories, project)
  const related = confirmed.filter((item) => {
    const source = `${item.title} ${item.detail} ${item.evidenceQuote}`
    return source.includes(first) || source.includes(second)
  }).slice(0, 40)
  if (!related.some((item) => `${item.title} ${item.detail}`.includes(first)) || !related.some((item) => `${item.title} ${item.detail}`.includes(second))) {
    throw new AiRequestError('已确认资料不足以识别这两个人物，请先补充并确认人物资料')
  }
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.5,
    maxTokens: 3600,
    signal,
    metadata: { projectId: project.id, taskType: 'relationship_simulation', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是小说人物关系顾问。区分已确认关系与假设推演，不把可能性写成事实。返回 JSON：{"currentDynamic":"当前关系判断","evidenceUsed":["使用的已确认信息"],"tensions":["潜在张力"],"directions":[{"title":"方向","change":"关系如何变化","benefit":"叙事收益","cost":"代价","risk":"失真风险","nextBeat":"下一场可验证行动"}]}。给出 3 至 4 个有明显差异的方向。' },
      { role: 'user', content: `作品：${project.title}\n人物 A：${first}\n人物 B：${second}\n假设情境：${scenario.trim() || '两人必须在利益冲突下共同完成一件事'}\n已确认资料：${JSON.stringify(related)}` },
    ],
  })
  const directions = (Array.isArray(result.directions) ? result.directions : []).flatMap((item): RelationshipSimulationResult['directions'] => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const title = text(source.title, 120)
    const change = text(source.change)
    return title && change ? [{ title, change, benefit: text(source.benefit), cost: text(source.cost), risk: text(source.risk), nextBeat: text(source.nextBeat) }] : []
  }).slice(0, 5)
  const currentDynamic = text(result.currentDynamic, 1800)
  if (!currentDynamic || directions.length < 2) throw new AiRequestError('AI 没有返回完整的关系推演')
  return { currentDynamic, evidenceUsed: texts(result.evidenceUsed), tensions: texts(result.tensions), directions }
}

export async function simulateReaderResponse(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  chapter: Chapter,
  audience: string,
  focus: string,
  signal?: AbortSignal,
): Promise<ReaderSimulationResult> {
  const sourceText = chapter.plainText.trim()
  if (!sourceText) throw new AiRequestError('当前章节没有可供模拟阅读的正文')
  if (sourceText.length > 50000) throw new AiRequestError('当前章节过长，请拆分后再进行读者模拟')
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.3,
    maxTokens: 3400,
    signal,
    metadata: { projectId: project.id, taskType: 'reader_simulation', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是试读反馈助手，不替作者改写正文。反馈必须区分文本证据和主观反应，引用必须逐字来自输入正文。返回 JSON：{"firstImpression":"第一印象","emotionalCurve":"情绪变化","expectations":["接下来期待"],"confusions":[{"point":"困惑点","quote":"原文短引"}],"pacingNotes":["节奏观察"],"strongestMoment":{"quote":"原文短引","reason":"为何有效"}}。无法判断时明确说资料不足。' },
      { role: 'user', content: `作品：${project.title}\n章节：${chapter.title}\n模拟读者：${audience.trim() || '首次接触本作的普通类型小说读者'}\n关注重点：${focus.trim() || '理解、期待、节奏和情绪'}\n\n正文：\n${sourceText}` },
    ],
  })
  const confusions = (Array.isArray(result.confusions) ? result.confusions : []).flatMap((item): ReaderSimulationResult['confusions'] => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const point = text(source.point)
    const quote = text(source.quote, 500)
    return point && quote && sourceText.includes(quote) ? [{ point, quote }] : []
  }).slice(0, 10)
  let strongestMoment: ReaderSimulationResult['strongestMoment'] = null
  if (result.strongestMoment && typeof result.strongestMoment === 'object') {
    const source = result.strongestMoment as Record<string, unknown>
    const quote = text(source.quote, 500)
    const reason = text(source.reason)
    if (quote && reason && sourceText.includes(quote)) strongestMoment = { quote, reason }
  }
  const firstImpression = text(result.firstImpression, 1800)
  if (!firstImpression) throw new AiRequestError('AI 没有返回有效的试读反馈')
  return {
    firstImpression,
    emotionalCurve: text(result.emotionalCurve, 1800),
    expectations: texts(result.expectations),
    confusions,
    pacingNotes: texts(result.pacingNotes),
    strongestMoment,
  }
}

export async function synthesizeResearchSources(
  settings: AiSettings,
  apiKey: string,
  projectId: string,
  question: string,
  sources: ResearchSourceCard[],
  signal?: AbortSignal,
): Promise<ResearchSynthesisResult> {
  const prompt = question.trim()
  if (!prompt) throw new AiRequestError('请先输入要研究的问题')
  const usable = sources.filter((source) => source.title.trim() && source.excerpt.trim()).slice(0, 20)
  if (usable.length === 0) throw new AiRequestError('请先添加至少一张包含来源摘录的研究卡片')
  const sourceIds = new Set(usable.map((source) => source.id))
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.15,
    maxTokens: 3600,
    signal,
    metadata: { projectId, taskType: 'research_synthesis', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是小说资料研究助手。只能依据作者提供的来源卡片，不得编造链接、出处或卡片中不存在的事实。返回 JSON：{"answer":"综合回答","findings":[{"sourceId":"真实卡片 id","claim":"该来源支持的结论","application":"对小说的可选用法","caution":"局限或待核验点"}],"gaps":["仍缺少的信息"],"suggestedQueries":["作者可继续检索的关键词"]}。来源未核验时要在 caution 中提醒。' },
      { role: 'user', content: `研究问题：${prompt}\n来源卡片：${JSON.stringify(usable.map((source) => ({ id: source.id, title: source.title, url: source.url, excerpt: source.excerpt.slice(0, 8000), notes: source.notes, verified: source.verified })))}` },
    ],
  })
  const findings = (Array.isArray(result.findings) ? result.findings : []).flatMap((item): ResearchSynthesisResult['findings'] => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const sourceId = text(source.sourceId, 120)
    const claim = text(source.claim, 1500)
    return sourceIds.has(sourceId) && claim ? [{ sourceId, claim, application: text(source.application, 1200), caution: text(source.caution, 1000) }] : []
  }).slice(0, 20)
  const answer = text(result.answer, 3500)
  if (!answer || findings.length === 0) throw new AiRequestError('AI 没有返回带有效来源引用的研究结果')
  return { answer, findings, gaps: texts(result.gaps), suggestedQueries: texts(result.suggestedQueries) }
}

export async function createWritingPlan(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  workspace: CreativeWorkspace,
  memories: ChapterMemoryBundle[],
  targetTotalWords: number,
  dailyWords: number,
  deadline: string,
  note: string,
  signal?: AbortSignal,
): Promise<WritingPlanResult> {
  const currentWords = project.chapters.reduce((total, chapter) => total + chapter.plainText.replace(/\s/g, '').length, 0)
  const target = Math.max(currentWords, Math.min(10000000, Math.round(targetTotalWords) || currentWords))
  const pace = Math.max(1, Math.min(100000, Math.round(dailyWords) || 1000))
  const confirmed = confirmedMemory(memories, project).filter((item) => ['event', 'claim', 'foreshadowing'].includes(item.kind)).slice(0, 50)
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.25,
    maxTokens: 4000,
    signal,
    metadata: { projectId: project.id, taskType: 'writing_plan', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是长篇小说写作计划助手。计划是可编辑预测，不是承诺。只依据作品统计、创作简报、大纲和已确认资料评估剧情线，不把未确认推测写成事实。返回 JSON：{"currentAssessment":"当前进度判断","milestones":[{"title":"里程碑","targetWords":数字,"focus":"创作重点","dependencies":["前置条件"]}],"plotThreads":[{"name":"剧情线","status":"活跃度与依据","nextAction":"建议推进动作","risk":"长期不推进的风险"}],"forecast":{"estimatedTotalWords":数字,"remainingWords":数字,"paceNote":"按当前目标的说明"},"nextSession":["下一次写作可执行任务"]}。最多 6 个里程碑和 8 条剧情线。' },
      { role: 'user', content: `作品：${project.title}\n当前字数：${currentWords}\n章节数：${project.chapters.length}\n目标总字数：${target}\n每日目标：${pace}\n目标日期：${deadline || '未设置'}\n作者补充：${note.trim() || '无'}\n创作简报：${JSON.stringify(workspace.brief)}\n大纲：${JSON.stringify(workspace.outline.slice(0, 80))}\n已确认剧情资料：${JSON.stringify(confirmed)}` },
    ],
  })
  const milestones = (Array.isArray(result.milestones) ? result.milestones : []).flatMap((item): WritingPlanResult['milestones'] => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const title = text(source.title, 160)
    if (!title) return []
    return [{ title, targetWords: Math.max(0, Math.min(target, Math.round(Number(source.targetWords)) || 0)), focus: text(source.focus), dependencies: texts(source.dependencies, 8, 300) }]
  }).slice(0, 6)
  const plotThreads = (Array.isArray(result.plotThreads) ? result.plotThreads : []).flatMap((item): WritingPlanResult['plotThreads'] => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const name = text(source.name, 160)
    return name ? [{ name, status: text(source.status), nextAction: text(source.nextAction), risk: text(source.risk) }] : []
  }).slice(0, 8)
  const forecastSource = result.forecast && typeof result.forecast === 'object' ? result.forecast as Record<string, unknown> : {}
  const estimatedTotalWords = Math.max(currentWords, Math.min(10000000, Math.round(Number(forecastSource.estimatedTotalWords)) || target))
  const remainingWords = Math.max(0, estimatedTotalWords - currentWords)
  const currentAssessment = text(result.currentAssessment, 2200)
  if (!currentAssessment || milestones.length === 0) throw new AiRequestError('AI 没有返回完整的写作计划')
  return {
    currentAssessment,
    milestones,
    plotThreads,
    forecast: { estimatedTotalWords, remainingWords, paceNote: text(forecastSource.paceNote, 1000) || `按每日 ${pace} 字计算，约需 ${Math.ceil(remainingWords / pace)} 个写作日` },
    nextSession: texts(result.nextSession, 8, 500),
  }
}

export async function simulatePlotDirections(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  chapter: Chapter,
  workspace: CreativeWorkspace,
  memories: ChapterMemoryBundle[],
  question: string,
  signal?: AbortSignal,
): Promise<PlotSimulationResult> {
  const confirmed = confirmedMemory(memories, project).filter((item) => ['character', 'character_state', 'relationship', 'event', 'commitment', 'secret', 'plot', 'foreshadowing', 'world'].includes(item.kind)).slice(0, 80)
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.5,
    maxTokens: 4200,
    signal,
    metadata: { projectId: project.id, taskType: 'plot_simulation', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是小说剧情推演工具。只把已确认正文和设定视为事实；所有未来方向必须标记为假设，不能自动写入正文或正典。返回 JSON：{"currentSituation":"当前局面","assumptions":["推演前提"],"directions":[{"title":"方向","immediateBeat":"下一场行动","characterImpact":"人物影响","threadImpact":"剧情线和伏笔影响","futureCost":"后续代价","continuityRisk":"连续性风险"}],"decisionQuestions":["作者做选择前需要回答的问题"]}。给出 3 个因果链明显不同的方向，不得只改变措辞。' },
      { role: 'user', content: `作品：${project.title}\n当前章节：${chapter.title}\n作者问题：${question.trim() || '从当前局面出发，后续剧情有哪些真正不同的推进方向？'}\n创作简报：${JSON.stringify(workspace.brief)}\n相关大纲：${JSON.stringify(workspace.outline.slice(0, 80))}\n已确认资料：${JSON.stringify(confirmed)}\n当前章末：${chapter.plainText.slice(-12000)}` },
    ],
  })
  const directions = (Array.isArray(result.directions) ? result.directions : []).flatMap((item): PlotSimulationResult['directions'] => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const title = text(source.title, 160)
    const immediateBeat = text(source.immediateBeat, 1200)
    return title && immediateBeat ? [{ title, immediateBeat, characterImpact: text(source.characterImpact), threadImpact: text(source.threadImpact), futureCost: text(source.futureCost), continuityRisk: text(source.continuityRisk) }] : []
  }).slice(0, 4)
  const currentSituation = text(result.currentSituation, 2200)
  if (!currentSituation || directions.length < 2) throw new AiRequestError('AI 没有返回完整的剧情推演')
  return { currentSituation, assumptions: texts(result.assumptions), directions, decisionQuestions: texts(result.decisionQuestions) }
}

function documentText(node: import('../data/projectStorage').DocumentNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  return (node.content ?? []).map(documentText).join('')
}

function sceneText(chapter: Chapter, scene?: Scene) {
  if (!scene?.startNodeId) return chapter.plainText
  const blocks = chapter.contentJson.content ?? []
  const start = blocks.findIndex((node) => node.attrs?.nodeId === scene.startNodeId)
  const end = scene.endNodeId ? blocks.findIndex((node) => node.attrs?.nodeId === scene.endNodeId) : -1
  if (start < 0) return chapter.plainText
  return blocks.slice(start, end >= start ? end + 1 : undefined).map(documentText).join('\n').trim() || chapter.plainText
}

export async function diagnoseScenePacing(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  chapter: Chapter,
  scene: Scene | undefined,
  focus: string,
  signal?: AbortSignal,
): Promise<ScenePacingResult> {
  const source = sceneText(chapter, scene).slice(0, 50000)
  if (!source.trim()) throw new AiRequestError('当前场景没有可分析的正文')
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.2,
    maxTokens: 3600,
    signal,
    metadata: { projectId: project.id, taskType: 'scene_pacing', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是小说场景节奏诊断工具，不直接改写。所有引用必须逐字来自输入正文。返回 JSON：{"sceneGoal":"场景实际目标","beats":[{"beat":"行动拍点","function":"叙事功能","tension":0到100}],"stagnationPoints":[{"quote":"原文短引","reason":"停滞原因"}],"tensionCurve":"张力曲线判断","revisionPriorities":["优先修改项"]}。区分必要铺垫与无效停滞，不以动作数量代替节奏。' },
      { role: 'user', content: `作品：${project.title}\n章节：${chapter.title}\n场景规划：${JSON.stringify(scene ? { title: scene.title, goal: scene.goal, notes: scene.notes, summary: scene.summary } : {})}\n关注重点：${focus.trim() || '目标、冲突、转折、结果和信息推进'}\n正文：\n${source}` },
    ],
  })
  const beats = (Array.isArray(result.beats) ? result.beats : []).flatMap((item): ScenePacingResult['beats'] => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const beat = text(row.beat, 500)
    return beat ? [{ beat, function: text(row.function, 700), tension: Math.max(0, Math.min(100, Math.round(Number(row.tension)) || 0)) }] : []
  }).slice(0, 16)
  const stagnationPoints = (Array.isArray(result.stagnationPoints) ? result.stagnationPoints : []).flatMap((item): ScenePacingResult['stagnationPoints'] => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const quote = text(row.quote, 500)
    return quote && source.includes(quote) ? [{ quote, reason: text(row.reason, 900) }] : []
  }).slice(0, 10)
  const sceneGoal = text(result.sceneGoal, 1600)
  if (!sceneGoal || beats.length === 0) throw new AiRequestError('AI 没有返回完整的场景节奏诊断')
  return { sceneGoal, beats, stagnationPoints, tensionCurve: text(result.tensionCurve, 1600), revisionPriorities: texts(result.revisionPriorities) }
}

export function buildStoryDebtLedger(project: ProjectState, memories: ChapterMemoryBundle[]): StoryDebtItem[] {
  const order = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  const finalIndex = Math.max(0, project.chapters.length - 1)
  return confirmedCurrentMemory(memories, project)
    .filter((candidate) => ['foreshadowing', 'commitment', 'secret', 'plot'].includes(candidate.kind) && candidate.metadata.lifecycle === 'active')
    .map((candidate) => {
      const firstChapterId = candidate.metadata.firstSeenChapterId || candidate.chapterId
      const lastChapterId = candidate.metadata.validFromChapterId || candidate.chapterId
      const chaptersSinceMention = Math.max(0, finalIndex - (order.get(lastChapterId) ?? finalIndex))
      return {
        candidateId: candidate.id,
        kind: candidate.kind,
        title: candidate.title,
        detail: candidate.detail,
        firstChapterId,
        lastChapterId,
        chaptersSinceMention,
        urgency: chaptersSinceMention >= 20 ? 'high' as const : chaptersSinceMention >= 8 ? 'medium' as const : 'low' as const,
        owner: candidate.metadata.responsibleParty || candidate.metadata.knower || candidate.metadata.participants,
        target: candidate.metadata.target || candidate.metadata.affectedScope,
      }
    })
    .sort((left, right) => right.chaptersSinceMention - left.chaptersSinceMention || left.title.localeCompare(right.title, 'zh-CN'))
}

export async function createWritingSessionRecap(
  settings: AiSettings,
  apiKey: string,
  project: ProjectState,
  chapter: Chapter,
  previousText: string,
  memories: ChapterMemoryBundle[],
  note: string,
  signal?: AbortSignal,
): Promise<WritingSessionRecapResult> {
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.15,
    maxTokens: 3000,
    signal,
    metadata: { projectId: project.id, taskType: 'writing_session_recap', promptVersion: '1' },
    messages: [
      { role: 'system', content: '你是写作会话复盘工具。比较写作前版本与当前正文，只描述实际变化，不把推测升级为故事事实。返回 JSON：{"summary":"本次写作概述","additions":["新增内容"],"removals":["删除或替换内容"],"storyChanges":["可能需要更新故事记忆的变化"],"followUps":["下次写作或复核事项"]}。没有变化时明确说明。' },
      { role: 'user', content: `作品：${project.title}\n章节：${chapter.title}\n作者备注：${note.trim() || '无'}\n写作前版本：\n${previousText.slice(0, 24000)}\n\n当前正文：\n${chapter.plainText.slice(0, 30000)}\n\n当前已确认故事资料：${JSON.stringify(confirmedMemory(memories, project).filter((item) => `${item.title} ${item.detail}`.includes(chapter.title)).slice(0, 20))}` },
    ],
  })
  const summary = text(result.summary, 2200)
  if (!summary) throw new AiRequestError('AI 没有返回有效的写作复盘')
  return { summary, additions: texts(result.additions), removals: texts(result.removals), storyChanges: texts(result.storyChanges), followUps: texts(result.followUps) }
}

export function recordTitle(kind: 'voice' | 'relationship' | 'reader' | 'research' | 'plan' | 'plot' | 'pacing' | 'debts' | 'recap', input: string, scene?: Scene) {
  const prefix = kind === 'voice' ? '人物声音' : kind === 'relationship' ? '关系推演' : kind === 'reader' ? '读者模拟' : kind === 'research' ? '资料研究' : kind === 'plot' ? '剧情推演' : kind === 'pacing' ? '场景节奏' : kind === 'debts' ? '情节欠账' : kind === 'recap' ? '写作复盘' : '写作计划'
  return `${prefix} · ${input.trim().slice(0, 24) || scene?.title || new Date().toLocaleDateString('zh-CN')}`
}
