export type AdvancedAgentIntent =
  | { kind: 'voice'; character: string; situation: string }
  | { kind: 'relationship'; first: string; second: string; scenario: string }
  | { kind: 'reader'; audience: string; focus: string }
  | { kind: 'research'; question: string }
  | { kind: 'plan'; note: string }
  | { kind: 'plot'; question: string }
  | { kind: 'pacing'; focus: string }
  | { kind: 'debts' }
  | { kind: 'recap'; note: string }

function cleanName(value: string) {
  return value.replace(/[“”"'《》]/g, '').replace(/(?:这个|这名|该)角色/g, '').trim().slice(0, 30)
}

export function detectAdvancedAgentIntent(request: string): AdvancedAgentIntent | null {
  const normalized = request.normalize('NFKC').trim()
  const relationship = normalized.match(/(?:推演|模拟|分析|测试)\s*([^，。与和\n]{1,20})\s*(?:和|与)\s*([^，。\n]{1,20}?)(?:的)?(?:关系|互动|冲突|对手戏)/)
  if (relationship) return { kind: 'relationship', first: cleanName(relationship[1]), second: cleanName(relationship[2]), scenario: normalized }
  const voice = normalized.match(/(?:测试|模拟|检查|设计)\s*([^，。\n]{1,24}?)(?:的)?(?:口吻|说话方式|人物声音|对白风格|台词风格)/)
  if (voice) return { kind: 'voice', character: cleanName(voice[1]), situation: normalized }
  if (/(?:模拟|扮演).{0,8}(?:读者|试读)|(?:读者|试读).{0,8}(?:反应|反馈|感受|期待)/.test(normalized)) return { kind: 'reader', audience: '目标类型小说读者', focus: normalized }
  if (/(?:研究卡片|来源卡片|资料卡片).{0,12}(?:综合|整理|回答|归纳|研究)|(?:根据|使用).{0,8}(?:研究卡片|来源卡片)/.test(normalized)) return { kind: 'research', question: normalized }
  if (/(?:制定|生成|整理|调整).{0,10}(?:写作计划|码字计划|完稿计划|里程碑)/.test(normalized)) return { kind: 'plan', note: normalized }
  if (/(?:推演|模拟|比较).{0,10}(?:剧情|走向|发展方向|后续方向)|(?:剧情|后续).{0,8}(?:怎么发展|有哪些方向|几种走向)/.test(normalized)) return { kind: 'plot', question: normalized }
  if (/(?:检查|分析|诊断).{0,8}(?:场景节奏|叙事节奏|张力曲线|拖沓点)|(?:场景|这一段).{0,8}(?:太慢|拖沓|节奏)/.test(normalized)) return { kind: 'pacing', focus: normalized }
  if (/(?:情节欠账|故事欠账|未回收|没回收).{0,10}(?:伏笔|承诺|秘密|剧情线)?|(?:还有哪些|列出).{0,8}(?:伏笔|承诺|秘密|剧情线).{0,8}(?:没|未)/.test(normalized)) return { kind: 'debts' }
  if (/(?:复盘|总结).{0,10}(?:本次写作|这次写作|今天写作|刚才修改)|(?:刚才|本次).{0,8}(?:写了什么|改了什么)/.test(normalized)) return { kind: 'recap', note: normalized }
  return null
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function lines(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : []
}

export function formatAdvancedAgentResult(intent: AdvancedAgentIntent, result: unknown) {
  const source = asRecord(result)
  if (intent.kind === 'plot') {
    const directions = (Array.isArray(source.directions) ? source.directions : []).map((item, index) => {
      const row = asRecord(item)
      return `${index + 1}. ${row.title}\n下一拍：${row.immediateBeat}\n人物影响：${row.characterImpact}\n后续代价：${row.futureCost}\n连续性风险：${row.continuityRisk}`
    })
    return `当前局面：${source.currentSituation}\n\n${directions.join('\n\n')}\n\n需要作者决定：${lines(source.decisionQuestions).join('；') || '暂无'}`
  }
  if (intent.kind === 'pacing') {
    const stagnation = (Array.isArray(source.stagnationPoints) ? source.stagnationPoints : []).map((item) => {
      const row = asRecord(item)
      return `“${row.quote}”：${row.reason}`
    })
    return `场景目标：${source.sceneGoal}\n张力曲线：${source.tensionCurve}\n\n停滞点：\n${stagnation.join('\n') || '未发现有可靠原文依据的停滞点'}\n\n修改优先级：${lines(source.revisionPriorities).join('；') || '暂无'}`
  }
  if (intent.kind === 'debts') {
    const debts = Array.isArray(result) ? result : []
    if (debts.length === 0) return '已确认故事记忆中没有仍处于进行中的伏笔、承诺、秘密或剧情线。'
    return debts.slice(0, 30).map((item, index) => {
      const row = asRecord(item)
      return `${index + 1}. ${row.title}（${row.urgency === 'high' ? '高' : row.urgency === 'medium' ? '中' : '低'}优先级，距上次提及 ${row.chaptersSinceMention} 章）\n${row.detail}`
    }).join('\n\n')
  }
  if (intent.kind === 'recap') return `本次写作：${source.summary}\n\n新增：${lines(source.additions).join('；') || '无'}\n删除或替换：${lines(source.removals).join('；') || '无'}\n可能影响故事记忆：${lines(source.storyChanges).join('；') || '无'}\n后续：${lines(source.followUps).join('；') || '无'}`
  if (intent.kind === 'voice') {
    const samples = (Array.isArray(source.sampleLines) ? source.sampleLines : []).map((item, index) => { const row = asRecord(item); return `${index + 1}. “${row.line}”\n意图：${row.intent}\n适配原因：${row.whyFits}\n风险：${row.risk}` })
    return `${source.profileSummary}\n\n${samples.join('\n\n')}\n\n待确认：${lines(source.unknowns).join('；') || '无'}`
  }
  if (intent.kind === 'relationship') {
    const directions = (Array.isArray(source.directions) ? source.directions : []).map((item, index) => { const row = asRecord(item); return `${index + 1}. ${row.title}：${row.change}\n收益：${row.benefit}\n代价：${row.cost}\n风险：${row.risk}\n下一拍：${row.nextBeat}` })
    return `当前关系：${source.currentDynamic}\n潜在张力：${lines(source.tensions).join('；') || '暂无'}\n\n${directions.join('\n\n')}`
  }
  if (intent.kind === 'reader') return `第一印象：${source.firstImpression}\n情绪曲线：${source.emotionalCurve}\n期待：${lines(source.expectations).join('；') || '暂无'}\n节奏观察：${lines(source.pacingNotes).join('；') || '暂无'}`
  if (intent.kind === 'research') return `${source.answer}\n\n仍缺资料：${lines(source.gaps).join('；') || '无'}\n建议继续检索：${lines(source.suggestedQueries).join('；') || '无'}`
  return `当前评估：${source.currentAssessment}\n预计总字数：${asRecord(source.forecast).estimatedTotalWords || '未确定'}\n下一次写作：${lines(source.nextSession).join('；') || '暂无'}`
}
