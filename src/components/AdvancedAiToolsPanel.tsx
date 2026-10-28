import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Sparkles, Trash2 } from 'lucide-react'
import type { AiSettings } from '../ai/settings'
import type { AiDataPermissions } from '../ai/privacy'
import {
  createWritingPlan,
  createWritingSessionRecap,
  buildStoryDebtLedger,
  diagnoseScenePacing,
  recordTitle,
  simulatePlotDirections,
  simulateReaderResponse,
  simulateRelationship,
  synthesizeResearchSources,
  testCharacterVoice,
  type ReaderSimulationResult,
  type RelationshipSimulationResult,
  type ResearchSynthesisResult,
  type VoiceTestResult,
  type WritingPlanResult,
  type WritingSessionRecapResult,
  type PlotSimulationResult,
  type ScenePacingResult,
  type StoryDebtItem,
} from '../ai/advancedAssistant'
import { listRevisions, type Chapter, type ProjectState, type Scene } from '../data/projectStorage'
import { getProjectMemory } from '../data/storyMemoryStorage'
import { emptyCreativeBrief, loadCreativeWorkspace } from '../data/creativeStorage'
import {
  deleteAdvancedAiRecord,
  deleteResearchSourceCard,
  loadAdvancedAiWorkspace,
  saveAdvancedAiRecord,
  saveResearchSourceCard,
  type AdvancedAiRecord,
  type AdvancedAiToolKind,
  type ResearchSourceCard,
} from '../data/advancedAiStorage'

type ToolTab = 'people' | 'story' | 'reader' | 'research' | 'plan'

type Props = {
  project: ProjectState
  chapter: Chapter
  scene?: Scene
  aiSettings: AiSettings
  apiKey: string
  dataPermissions: AiDataPermissions
  openAiSettings: () => void
  confirmDelete: (message: string, title: string) => Promise<boolean>
}

function parseRecord<T>(record: AdvancedAiRecord | null): T | null {
  if (!record) return null
  try { return JSON.parse(record.outputJson) as T } catch { return null }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

export function AdvancedAiToolsPanel({ project, chapter, scene, aiSettings, apiKey, dataPermissions, openAiSettings, confirmDelete }: Props) {
  const [tab, setTab] = useState<ToolTab>('people')
  const [peopleMode, setPeopleMode] = useState<'voice' | 'relationship'>('voice')
  const [storyMode, setStoryMode] = useState<'plot' | 'pacing' | 'debts' | 'recap'>('plot')
  const [records, setRecords] = useState<AdvancedAiRecord[]>([])
  const [sources, setSources] = useState<ResearchSourceCard[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [busy, setBusy] = useState<AdvancedAiToolKind | null>(null)
  const [message, setMessage] = useState('')
  const [characterOne, setCharacterOne] = useState('')
  const [characterTwo, setCharacterTwo] = useState('')
  const [peopleScenario, setPeopleScenario] = useState('')
  const [storyPrompt, setStoryPrompt] = useState('')
  const [readerAudience, setReaderAudience] = useState('')
  const [readerFocus, setReaderFocus] = useState('')
  const [researchQuestion, setResearchQuestion] = useState('')
  const [sourceDraft, setSourceDraft] = useState({ title: '', url: '', excerpt: '', notes: '' })
  const currentWords = useMemo(() => project.chapters.reduce((total, item) => total + item.plainText.replace(/\s/g, '').length, 0), [project.chapters])
  const [planTarget, setPlanTarget] = useState(() => Math.max(100000, currentWords))
  const [planDaily, setPlanDaily] = useState(1500)
  const [planDeadline, setPlanDeadline] = useState('')
  const [planNote, setPlanNote] = useState('')
  const controller = useRef<AbortController | null>(null)

  const activeKind: AdvancedAiToolKind = tab === 'people' ? peopleMode : tab === 'story' ? storyMode : tab
  const matchingRecords = records.filter((record) => record.kind === activeKind)
  const selectedRecord = records.find((record) => record.id === selectedRecordId && record.kind === activeKind) ?? matchingRecords[0] ?? null

  useEffect(() => {
    let cancelled = false
    void loadAdvancedAiWorkspace(project.id).then((workspace) => {
      if (cancelled) return
      setRecords(workspace.records)
      setSources(workspace.sources)
    }).catch((error) => {
      if (!cancelled) setMessage(error instanceof Error ? error.message : '无法读取创作工具记录')
    })
    return () => {
      cancelled = true
      controller.current?.abort()
    }
  }, [project.id])

  useEffect(() => {
    setSelectedRecordId(matchingRecords[0]?.id ?? null)
  }, [activeKind])

  useEffect(() => {
    setMessage('')
  }, [peopleMode, storyMode, tab])

  const execute = async <T,>(kind: AdvancedAiToolKind, input: Record<string, unknown>, runner: (signal: AbortSignal) => Promise<T>, requiresAi = true) => {
    if (busy) {
      controller.current?.abort()
      return
    }
    if (requiresAi && (!apiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim())) {
      setMessage('请先完成 AI 服务配置')
      return
    }
    if (['reader', 'pacing', 'recap'].includes(kind) && !dataPermissions.currentChapter) {
      setMessage('当前作品禁止向 AI 发送当前章节，无法运行读者模拟')
      return
    }
    const requestController = new AbortController()
    controller.current = requestController
    setBusy(kind)
    setMessage('正在整理作品上下文并分析...')
    try {
      const result = await runner(requestController.signal)
      if (controller.current !== requestController) return
      const now = Date.now()
      const titleInput = kind === 'relationship' ? `${characterOne} / ${characterTwo}`
        : ['reader', 'pacing', 'recap'].includes(kind) ? chapter.title : kind === 'research' ? researchQuestion : ['plan', 'debts'].includes(kind) ? project.title : kind === 'plot' ? storyPrompt || chapter.title : characterOne
      const record: AdvancedAiRecord = {
        id: crypto.randomUUID(), projectId: project.id, kind, chapterId: ['reader', 'voice', 'relationship', 'plot', 'pacing', 'recap'].includes(kind) ? chapter.id : null,
        sceneId: ['voice', 'relationship', 'plot', 'pacing'].includes(kind) ? scene?.id ?? null : null,
        title: recordTitle(kind, titleInput, scene), inputJson: JSON.stringify(input), outputJson: JSON.stringify(result), createdAt: now, updatedAt: now,
      }
      await saveAdvancedAiRecord(record)
      setRecords((current) => [record, ...current])
      setSelectedRecordId(record.id)
      setMessage('分析完成，结果已作为工具记录保存，不会自动写入正文或正典')
    } catch (error) {
      if (controller.current !== requestController) return
      setMessage(requestController.signal.aborted ? '任务已停止，可保留输入后重新运行' : error instanceof Error ? error.message : '分析失败')
    } finally {
      if (controller.current === requestController) {
        controller.current = null
        setBusy(null)
      }
    }
  }

  const runPeopleTool = async () => {
    if (!dataPermissions.confirmedMemory) {
      setMessage('当前作品禁止发送已确认故事资料，无法运行人物工具')
      return
    }
    const memories = (await getProjectMemory(project.id)).filter((bundle) => bundle.memory?.chapterId === chapter.id ? dataPermissions.currentChapter : dataPermissions.otherChapters)
    if (peopleMode === 'voice') {
      await execute('voice', { characterName: characterOne, situation: peopleScenario }, (signal) =>
        testCharacterVoice(aiSettings, apiKey, project, memories, characterOne, peopleScenario, signal))
    } else {
      await execute('relationship', { firstCharacter: characterOne, secondCharacter: characterTwo, scenario: peopleScenario }, (signal) =>
        simulateRelationship(aiSettings, apiKey, project, memories, characterOne, characterTwo, peopleScenario, signal))
    }
  }

  const runPlan = async () => {
    const [workspace, memories] = await Promise.all([loadCreativeWorkspace(project.id), getProjectMemory(project.id)])
    const permittedWorkspace = dataPermissions.creativePlanning
      ? workspace
      : { brief: emptyCreativeBrief(project.id), outline: [], sessions: [] }
    await execute('plan', { targetTotalWords: planTarget, dailyWords: planDaily, deadline: planDeadline, note: planNote }, (signal) =>
      createWritingPlan(aiSettings, apiKey, project, permittedWorkspace, dataPermissions.confirmedMemory ? memories.filter((bundle) => bundle.memory?.chapterId === chapter.id ? dataPermissions.currentChapter : dataPermissions.otherChapters) : [], planTarget, planDaily, planDeadline, planNote, signal))
  }

  const runStoryTool = async () => {
    if (storyMode === 'pacing') {
      await execute('pacing', { focus: storyPrompt }, (signal) => diagnoseScenePacing(aiSettings, apiKey, project, chapter, scene, storyPrompt, signal))
      return
    }
    const memories = await getProjectMemory(project.id)
    const permittedMemories = dataPermissions.confirmedMemory
      ? memories.filter((bundle) => bundle.memory?.chapterId === chapter.id ? dataPermissions.currentChapter : dataPermissions.otherChapters)
      : []
    if (storyMode === 'debts') {
      await execute('debts', {}, async () => buildStoryDebtLedger(project, permittedMemories), false)
      return
    }
    if (storyMode === 'recap') {
      const previous = (await listRevisions(chapter.id))[0]
      await execute('recap', { note: storyPrompt, revisionId: previous?.id ?? null }, (signal) => createWritingSessionRecap(aiSettings, apiKey, project, chapter, previous?.plainText ?? '', permittedMemories, storyPrompt, signal))
      return
    }
    const workspace = dataPermissions.creativePlanning ? await loadCreativeWorkspace(project.id) : { brief: emptyCreativeBrief(project.id), outline: [], sessions: [] }
    await execute('plot', { question: storyPrompt }, (signal) => simulatePlotDirections(aiSettings, apiKey, project, chapter, workspace, permittedMemories, storyPrompt, signal))
  }

  const addSource = async () => {
    if (!sourceDraft.title.trim() || !sourceDraft.excerpt.trim()) {
      setMessage('来源标题和摘录不能为空')
      return
    }
    const now = Date.now()
    const source: ResearchSourceCard = {
      id: crypto.randomUUID(), projectId: project.id, title: sourceDraft.title.trim(), url: sourceDraft.url.trim(), excerpt: sourceDraft.excerpt.trim(),
      notes: sourceDraft.notes.trim(), verified: false, createdAt: now, updatedAt: now,
    }
    await saveResearchSourceCard(source)
    setSources((current) => [source, ...current])
    setSourceDraft({ title: '', url: '', excerpt: '', notes: '' })
    setMessage('来源卡片已保存；核对原始出处后可标记为已核验')
  }

  const updateSource = async (source: ResearchSourceCard, update: Partial<ResearchSourceCard>) => {
    const next = { ...source, ...update, updatedAt: Date.now() }
    setSources((current) => current.map((item) => item.id === next.id ? next : item))
    await saveResearchSourceCard(next)
  }

  const removeSource = async (source: ResearchSourceCard) => {
    if (!await confirmDelete(`删除来源卡片“${source.title}”？已有研究记录仍会保留，但来源详情将不可再核对。`, '删除来源卡片')) return
    await deleteResearchSourceCard(source.id)
    setSources((current) => current.filter((item) => item.id !== source.id))
  }

  const removeRecord = async (record: AdvancedAiRecord) => {
    if (!await confirmDelete(`删除工具记录“${record.title}”？`, '删除工具记录')) return
    await deleteAdvancedAiRecord(record.id)
    setRecords((current) => current.filter((item) => item.id !== record.id))
    setSelectedRecordId(null)
  }

  const renderResult = () => {
    if (!selectedRecord) return <p className="advanced-empty">运行工具后，结果会作为独立记录保存在这里。</p>
    if (selectedRecord.kind === 'voice') {
      const result = parseRecord<VoiceTestResult>(selectedRecord)
      if (!result) return null
      return <div className="advanced-result"><p>{result.profileSummary}</p><div className="advanced-result-list">{result.sampleLines.map((line, index) => <article key={`${line.line}-${index}`}><strong>{line.line}</strong><dl><dt>意图</dt><dd>{line.intent}</dd><dt>依据</dt><dd>{line.whyFits}</dd><dt>风险</dt><dd>{line.risk || '未指出'}</dd></dl></article>)}</div>{result.consistencyChecks.length > 0 && <section><strong>一致性检查</strong><ul>{result.consistencyChecks.map((item) => <li key={item}>{item}</li>)}</ul></section>}{result.unknowns.length > 0 && <section><strong>资料不足</strong><ul>{result.unknowns.map((item) => <li key={item}>{item}</li>)}</ul></section>}</div>
    }
    if (selectedRecord.kind === 'relationship') {
      const result = parseRecord<RelationshipSimulationResult>(selectedRecord)
      if (!result) return null
      return <div className="advanced-result"><p>{result.currentDynamic}</p>{result.tensions.length > 0 && <section><strong>关系张力</strong><ul>{result.tensions.map((item) => <li key={item}>{item}</li>)}</ul></section>}<div className="advanced-result-list">{result.directions.map((direction) => <article key={direction.title}><strong>{direction.title}</strong><p>{direction.change}</p><dl><dt>收益</dt><dd>{direction.benefit}</dd><dt>代价</dt><dd>{direction.cost}</dd><dt>风险</dt><dd>{direction.risk}</dd><dt>下一拍</dt><dd>{direction.nextBeat}</dd></dl></article>)}</div></div>
    }
    if (selectedRecord.kind === 'plot') {
      const result = parseRecord<PlotSimulationResult>(selectedRecord)
      if (!result) return null
      return <div className="advanced-result"><p>{result.currentSituation}</p>{result.assumptions.length > 0 && <section><strong>推演前提</strong><ul>{result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></section>}<div className="advanced-result-list">{result.directions.map((direction) => <article key={direction.title}><strong>{direction.title}</strong><p>{direction.immediateBeat}</p><dl><dt>人物</dt><dd>{direction.characterImpact}</dd><dt>剧情线</dt><dd>{direction.threadImpact}</dd><dt>后续代价</dt><dd>{direction.futureCost}</dd><dt>连续性</dt><dd>{direction.continuityRisk}</dd></dl></article>)}</div>{result.decisionQuestions.length > 0 && <section><strong>决策前要回答</strong><ul>{result.decisionQuestions.map((item) => <li key={item}>{item}</li>)}</ul></section>}</div>
    }
    if (selectedRecord.kind === 'pacing') {
      const result = parseRecord<ScenePacingResult>(selectedRecord)
      if (!result) return null
      return <div className="advanced-result"><p>{result.sceneGoal}</p><section><strong>张力曲线</strong><p>{result.tensionCurve}</p></section><div className="advanced-result-list">{result.beats.map((beat, index) => <article key={`${beat.beat}-${index}`}><strong>{beat.tension} · {beat.beat}</strong><p>{beat.function}</p></article>)}</div>{result.stagnationPoints.length > 0 && <section><strong>可能停滞</strong>{result.stagnationPoints.map((item) => <blockquote key={item.quote}><span>原文</span>{item.quote}<small>{item.reason}</small></blockquote>)}</section>}<section><strong>修改优先级</strong><ul>{result.revisionPriorities.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    }
    if (selectedRecord.kind === 'debts') {
      const result = parseRecord<StoryDebtItem[]>(selectedRecord) ?? []
      return <div className="advanced-result"><p>当前共有 {result.length} 条仍处于进行中的伏笔、承诺、秘密或剧情线。</p><div className="advanced-result-list">{result.map((item) => <article key={item.candidateId}><strong>{item.urgency === 'high' ? '高优先' : item.urgency === 'medium' ? '需关注' : '近期'} · {item.title}</strong><p>{item.detail}</p><small>距最近记录 {item.chaptersSinceMention} 章{item.owner ? ` · 负责人/知情者：${item.owner}` : ''}{item.target ? ` · 指向：${item.target}` : ''}</small></article>)}</div></div>
    }
    if (selectedRecord.kind === 'recap') {
      const result = parseRecord<WritingSessionRecapResult>(selectedRecord)
      if (!result) return null
      return <div className="advanced-result"><p>{result.summary}</p>{([['新增内容', result.additions], ['删除或替换', result.removals], ['故事变化', result.storyChanges], ['后续事项', result.followUps]] as const).map(([title, items]) => items.length > 0 && <section key={title}><strong>{title}</strong><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div>
    }
    if (selectedRecord.kind === 'reader') {
      const result = parseRecord<ReaderSimulationResult>(selectedRecord)
      if (!result) return null
      return <div className="advanced-result"><p>{result.firstImpression}</p><section><strong>情绪变化</strong><p>{result.emotionalCurve || '未指出'}</p></section>{result.strongestMoment && <blockquote><span>最有力的片段</span>{result.strongestMoment.quote}<small>{result.strongestMoment.reason}</small></blockquote>}<section><strong>后续期待</strong><ul>{result.expectations.map((item) => <li key={item}>{item}</li>)}</ul></section><section><strong>困惑与节奏</strong><ul>{[...result.confusions.map((item) => `${item.point}（“${item.quote}”）`), ...result.pacingNotes].map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    }
    if (selectedRecord.kind === 'research') {
      const result = parseRecord<ResearchSynthesisResult>(selectedRecord)
      if (!result) return null
      return <div className="advanced-result"><p>{result.answer}</p><div className="advanced-result-list">{result.findings.map((finding, index) => { const source = sources.find((item) => item.id === finding.sourceId); return <article key={`${finding.sourceId}-${index}`}><strong>{source?.title ?? '来源卡片已删除'}</strong><p>{finding.claim}</p><dl><dt>用法</dt><dd>{finding.application}</dd><dt>注意</dt><dd>{finding.caution || '无'}</dd></dl>{source?.url && <small>{source.url}</small>}</article> })}</div><section><strong>仍需核验</strong><ul>{result.gaps.map((item) => <li key={item}>{item}</li>)}</ul></section><section><strong>建议检索词</strong><ul>{result.suggestedQueries.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    }
    const result = parseRecord<WritingPlanResult>(selectedRecord)
    if (!result) return null
    return <div className="advanced-result"><p>{result.currentAssessment}</p><div className="plan-forecast"><span>预计总字数<strong>{formatNumber(result.forecast.estimatedTotalWords)}</strong></span><span>预计剩余<strong>{formatNumber(result.forecast.remainingWords)}</strong></span></div><small>{result.forecast.paceNote}</small><div className="advanced-result-list">{result.milestones.map((milestone) => <article key={milestone.title}><strong>{milestone.title} · {formatNumber(milestone.targetWords)} 字</strong><p>{milestone.focus}</p>{milestone.dependencies.length > 0 && <small>前置：{milestone.dependencies.join('、')}</small>}</article>)}</div>{result.plotThreads.length > 0 && <section><strong>剧情线活跃度</strong>{result.plotThreads.map((thread) => <article className="plot-thread" key={thread.name}><strong>{thread.name}</strong><p>{thread.status}</p><small>下一步：{thread.nextAction}；风险：{thread.risk}</small></article>)}</section>}<section><strong>下一次写作</strong><ul>{result.nextSession.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
  }

  return <div className="advanced-tools-panel">
    <div className="advanced-tool-tabs">
      {([['people', '人物'], ['story', '故事'], ['reader', '读者'], ['research', '研究'], ['plan', '计划']] as const).map(([value, label]) => <button className={tab === value ? 'active' : ''} key={value} onClick={() => setTab(value)}>{label}</button>)}
    </div>
    {message && <p className="advanced-message">{message}</p>}
    {!apiKey.trim() && <div className="memory-config-notice"><span>已有工具记录可以离线查看；运行新分析前需要配置 AI 服务。</span><button onClick={openAiSettings}>AI 服务设置</button></div>}
    <div className="advanced-tools-scroll">
      {tab === 'people' && <section className="advanced-tool-form">
        <div className="advanced-segmented"><button className={peopleMode === 'voice' ? 'active' : ''} onClick={() => setPeopleMode('voice')}>声音测试</button><button className={peopleMode === 'relationship' ? 'active' : ''} onClick={() => setPeopleMode('relationship')}>关系推演</button></div>
        <label><span>{peopleMode === 'voice' ? '人物名称' : '人物 A'}</span><input value={characterOne} onChange={(event) => setCharacterOne(event.target.value)} placeholder="使用已确认资料中的人物名" /></label>
        {peopleMode === 'relationship' && <label><span>人物 B</span><input value={characterTwo} onChange={(event) => setCharacterTwo(event.target.value)} placeholder="另一个人物" /></label>}
        <label><span>测试情境</span><textarea value={peopleScenario} onChange={(event) => setPeopleScenario(event.target.value)} placeholder="人物此刻面对什么压力、选择或关系变化" /></label>
        <button className="advanced-run" onClick={() => void runPeopleTool()}><Sparkles size={14} />{busy === activeKind ? '停止' : peopleMode === 'voice' ? '生成对白候选' : '推演关系方向'}</button>
      </section>}
      {tab === 'story' && <section className="advanced-tool-form">
        <div className="advanced-segmented story-modes">{([['plot', '剧情推演'], ['pacing', '场景节奏'], ['debts', '情节欠账'], ['recap', '写作复盘']] as const).map(([mode, label]) => <button className={storyMode === mode ? 'active' : ''} key={mode} onClick={() => setStoryMode(mode)}>{label}</button>)}</div>
        {storyMode !== 'debts' && <label><span>{storyMode === 'plot' ? '推演问题' : storyMode === 'pacing' ? '关注重点' : '本次写作备注'}</span><textarea value={storyPrompt} onChange={(event) => setStoryPrompt(event.target.value)} placeholder={storyMode === 'plot' ? '例如：如果主角现在公开秘密，人物关系和主线会怎样变化？' : storyMode === 'pacing' ? '例如：检查冲突是否启动过晚、结尾是否缺少结果' : '例如：本次主要重写了地牢会面和人物态度'} /></label>}
        {storyMode === 'debts' && <p className="advanced-tool-note">根据已确认故事资料整理仍在进行中的伏笔、承诺、秘密和剧情线，不调用 AI。</p>}
        <button className="advanced-run" onClick={() => void runStoryTool()}><Sparkles size={14} />{busy === activeKind ? '停止' : storyMode === 'plot' ? '推演三个方向' : storyMode === 'pacing' ? '诊断当前场景' : storyMode === 'debts' ? '刷新欠账清单' : '生成写作复盘'}</button>
      </section>}
      {tab === 'reader' && <section className="advanced-tool-form">
        <label><span>模拟读者</span><input value={readerAudience} onChange={(event) => setReaderAudience(event.target.value)} placeholder="例如第一次接触本作的悬疑读者" /></label>
        <label><span>关注重点</span><textarea value={readerFocus} onChange={(event) => setReaderFocus(event.target.value)} placeholder="理解、期待、情绪、节奏或某个具体疑问" /></label>
        <button className="advanced-run" onClick={() => void execute('reader', { audience: readerAudience, focus: readerFocus }, (signal) => simulateReaderResponse(aiSettings, apiKey, project, chapter, readerAudience, readerFocus, signal))}><Sparkles size={14} />{busy === 'reader' ? '停止' : '模拟阅读本章'}</button>
      </section>}
      {tab === 'research' && <>
        <section className="advanced-tool-form research-question"><label><span>研究问题</span><textarea value={researchQuestion} onChange={(event) => setResearchQuestion(event.target.value)} placeholder="只会综合下方来源卡片，不会编造外部出处" /></label><button className="advanced-run" onClick={() => void execute('research', { question: researchQuestion, sourceIds: sources.map((source) => source.id) }, (signal) => synthesizeResearchSources(aiSettings, apiKey, project.id, researchQuestion, sources, signal))}><Sparkles size={14} />{busy === 'research' ? '停止' : '综合来源'}</button></section>
        <section className="source-card-create"><strong>添加来源卡片</strong><input value={sourceDraft.title} onChange={(event) => setSourceDraft((current) => ({ ...current, title: event.target.value }))} placeholder="来源标题" /><input value={sourceDraft.url} onChange={(event) => setSourceDraft((current) => ({ ...current, url: event.target.value }))} placeholder="来源网址或出处（可选）" /><textarea value={sourceDraft.excerpt} onChange={(event) => setSourceDraft((current) => ({ ...current, excerpt: event.target.value }))} placeholder="与研究问题相关的原文摘录" /><textarea value={sourceDraft.notes} onChange={(event) => setSourceDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="作者备注（可选）" /><button onClick={() => void addSource()}>保存来源</button></section>
        <div className="source-card-list">{sources.map((source) => <article key={source.id}><div><input value={source.title} onChange={(event) => setSources((current) => current.map((item) => item.id === source.id ? { ...item, title: event.target.value } : item))} onBlur={() => void updateSource(source, { title: sources.find((item) => item.id === source.id)?.title ?? source.title })} /><button title="删除来源" onClick={() => void removeSource(source)}><Trash2 size={13} /></button></div><input value={source.url} onChange={(event) => setSources((current) => current.map((item) => item.id === source.id ? { ...item, url: event.target.value } : item))} onBlur={() => void updateSource(source, { url: sources.find((item) => item.id === source.id)?.url ?? source.url })} placeholder="网址或出处" /><textarea value={source.excerpt} onChange={(event) => setSources((current) => current.map((item) => item.id === source.id ? { ...item, excerpt: event.target.value } : item))} onBlur={() => void updateSource(source, { excerpt: sources.find((item) => item.id === source.id)?.excerpt ?? source.excerpt })} /><label><input type="checkbox" checked={source.verified} onChange={(event) => void updateSource(source, { verified: event.target.checked })} /><span>{source.verified ? <><CheckCircle2 size={12} />已核验原始出处</> : '尚未核验出处'}</span></label></article>)}</div>
      </>}
      {tab === 'plan' && <section className="advanced-tool-form">
        <div className="current-word-summary"><span>当前正文</span><strong>{formatNumber(currentWords)} 字</strong></div>
        <label><span>目标总字数</span><input type="number" min={currentWords} max="10000000" step="10000" value={planTarget} onChange={(event) => setPlanTarget(Math.max(currentWords, Number(event.target.value) || currentWords))} /></label>
        <label><span>每日目标</span><input type="number" min="1" max="100000" step="100" value={planDaily} onChange={(event) => setPlanDaily(Math.max(1, Number(event.target.value) || 1))} /></label>
        <label><span>目标日期</span><input type="date" value={planDeadline} onChange={(event) => setPlanDeadline(event.target.value)} /></label>
        <label><span>作者补充</span><textarea value={planNote} onChange={(event) => setPlanNote(event.target.value)} placeholder="休息日、卷数、必须优先推进的剧情线等" /></label>
        <button className="advanced-run" onClick={() => void runPlan()}><Sparkles size={14} />{busy === 'plan' ? '停止' : '生成写作计划'}</button>
      </section>}

      <section className="advanced-records"><div><strong>工具记录</strong><span>{matchingRecords.length}</span></div>{matchingRecords.length > 0 && <div className="advanced-record-list">{matchingRecords.slice(0, 12).map((record) => <button className={selectedRecord?.id === record.id ? 'active' : ''} key={record.id} onClick={() => setSelectedRecordId(record.id)}><span>{record.title}</span><small>{new Date(record.updatedAt).toLocaleString('zh-CN')}</small></button>)}</div>}{selectedRecord && <div className="advanced-record-heading"><strong>{selectedRecord.title}</strong><button title="删除记录" onClick={() => void removeRecord(selectedRecord)}><Trash2 size={13} /></button></div>}{renderResult()}</section>
    </div>
  </div>
}
