import type { AuthorVoiceFingerprint, StyleProfile } from '../data/styleStorage'

export type AiStyleRule =
  | 'banned-phrase'
  | 'banned-pattern'
  | 'summary-ending'
  | 'abstract-emotion'
  | 'sentence-uniformity'
  | 'paragraph-uniformity'
  | 'adverb-density'
  | 'comma-density'
  | 'repeated-opening'
  | 'dialogue-ratio'

export type AiStyleIssue = {
  id: string
  rule: AiStyleRule
  severity: 'info' | 'warning'
  message: string
  quote: string
}

export const AI_STYLE_RULE_LABELS: Record<AiStyleRule, string> = {
  'banned-phrase': '套话词句',
  'banned-pattern': '套路句式',
  'summary-ending': '段尾总结',
  'abstract-emotion': '直接命名情绪',
  'sentence-uniformity': '句长过于整齐',
  'paragraph-uniformity': '段落过于整齐',
  'adverb-density': '副词密度偏高',
  'comma-density': '逗号密度偏高',
  'repeated-opening': '句首重复',
  'dialogue-ratio': '对白占比偏低',
}

export const ANTI_AI_STYLE_CONTRACT = `【去 AI 腔写作契约】
1. 不写段尾总结、升华、点题。场景可以停在动作、画面、对话或未解释的细节上。
2. 不直接命名情绪（如“她感到震惊”“心中五味杂陈”）。用动作、生理反应、停顿、物件变化、对话错位来呈现。
3. 不连续使用相同句式、相同段长、相同开头。句长要有明显长短差；允许短句、残句、单句成段。
4. 不用“不是……而是……”“既……又……”“不仅……而且……”等对仗模板；不用三段排比。
5. 少用抽象形容词和副词堆叠，每段至少有一个具体可感的动作、物件、声音、气味、触感或空间变化。
6. 对话不追求信息完整和礼貌。允许答非所问、沉默、打断、重复、说半句；潜台词优先于解释。
7. 不写“仿佛/似乎/像是”式的万能比喻；比喻必须来自人物当下能接触到的事物，且不要连续使用。
8. 不解释象征意义，不替读者总结“这意味着什么”。
9. 不为凑字数增加解释、回忆、形容或情绪复述；扩写时优先增加具体动作链、环境反馈和人物选择。
10. 保留作者原有的口语、粗粝感、停顿和不完美；不要把所有句子修得工整。

对照示例：
AI 写法：她心中五味杂陈，泪水不禁涌了出来。
自然写法：她把碗放回桌上，手停在半空，汤沿着桌沿滴下去。她说：“我吃过了。”
AI 写法：这一刻，他终于明白，原来一切都是命运的安排。
自然写法：他把那张纸折好，塞回口袋，没有再打开。`

export const DEFAULT_BANNED_PHRASES = [
  '五味杂陈', '难以言喻', '无法言喻', '心中涌起', '心头一紧', '心猛地一沉',
  '仿佛整个世界', '时间仿佛静止', '空气仿佛凝固', '空气安静得', '落针可闻',
  '不禁', '不由得', '不由自主', '情不自禁', '微微一怔', '瞳孔骤缩',
  '倒吸一口凉气', '如遭雷击', '嘴角勾起', '眼底闪过一丝', '意味深长',
  '若有所思', '不易察觉', '几不可闻', '似乎在诉说', '仿佛在诉说',
  '命运的齿轮', '心底最柔软的地方', '像一把钥匙', '如潮水般', '如同潮水般',
  '不知过了多久', '时间一分一秒', '像是下定了某种决心', '仿佛做出了什么决定',
  '与此同时', '值得一提的是', '总而言之', '综上所述', '一切都', '仿佛一切',
]

export const DEFAULT_BANNED_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: '顿悟式总结', pattern: /(?:这一刻|在此刻|那一瞬间)[^。！？]{0,50}(?:明白|懂了|意识到|知道|醒悟)/g },
  { label: '段尾点题', pattern: /(?:终于|或许|也许|原来)[^。！？]{0,40}(?:明白|懂得|意义|答案|命运|安排)/g },
  { label: '对仗模板', pattern: /(?:不是[^。！？]{1,40}而是|既[^。！？]{1,30}又|不仅[^。！？]{1,40}而且)/g },
  { label: '直接命名情绪', pattern: /(?:感到|心中|心里|内心)[^。！？]{0,12}(?:震惊|愤怒|悲伤|喜悦|恐惧|无奈|绝望|温暖|心酸|五味杂陈)/g },
  { label: '万能比喻', pattern: /(?:仿佛|似乎|像是)[^。！？]{0,40}(?:整个世界|时间|空气|命运|灵魂|潮水)/g },
]

const ADVERBS = ['缓缓', '静静', '默默', '轻轻', '微微', '深深', '淡淡', '悄悄', '偷偷', '渐渐', '慢慢', '不禁', '不由得', '不由自主', '似乎', '仿佛', '好像']
const SENTENCE_START_IGNORED = new Set(['他说', '她说', '我说', '他们', '她们', '我们', '你们', '这个', '那个', '这里', '那里', '然后', '但是', '可是', '所以', '因为'])

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

function quoteAround(text: string, index: number, radius = 24) {
  return text.slice(clamp(index - radius, 0, text.length), clamp(index + radius + 2, 0, text.length)).replace(/\s+/g, ' ').trim()
}

function splitSentences(text: string) {
  return text.replace(/\r\n?/g, '\n').split(/(?<=[。！？!?…])|\n+/).map((item) => item.trim()).filter((item) => item.length >= 2)
}

function splitParagraphs(text: string) {
  return text.replace(/\r\n?/g, '\n').split(/\n+/).map((item) => item.trim()).filter((item) => item.length >= 8)
}

function standardDeviation(values: number[]) {
  if (values.length === 0) return 0
  const mean = values.reduce((total, value) => total + value, 0) / values.length
  return Math.sqrt(values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length)
}

export function analyzeAuthorVoice(texts: string[]): AuthorVoiceFingerprint {
  const source = texts.join('\n\n').trim()
  const sentences = splitSentences(source)
  const paragraphs = splitParagraphs(source)
  const sentenceLengths = sentences.map((sentence) => sentence.replace(/\s/g, '').length)
  const paragraphLengths = paragraphs.map((paragraph) => paragraph.replace(/\s/g, '').length)
  const characters = source.replace(/\s/g, '').length
  const dialogueCharacters = (source.match(/[“"][^”"]{1,400}[”"]/g) ?? []).reduce((total, quote) => total + quote.replace(/\s/g, '').length, 0)
  const adverbCount = ADVERBS.reduce((total, adverb) => total + (source.match(new RegExp(adverb, 'g'))?.length ?? 0), 0)
  const commaCount = (source.match(/[，,]/g) ?? []).length
  const startCounts = new Map<string, number>()
  for (const sentence of sentences) {
    const start = sentence.replace(/^[“"'‘’\s]+/, '').slice(0, 2)
    if (start.length < 2 || SENTENCE_START_IGNORED.has(start)) continue
    startCounts.set(start, (startCounts.get(start) ?? 0) + 1)
  }
  return {
    sampleCharacters: characters,
    sentenceCount: sentences.length,
    averageSentenceLength: sentenceLengths.length ? sentenceLengths.reduce((total, value) => total + value, 0) / sentenceLengths.length : 0,
    sentenceLengthStdDev: standardDeviation(sentenceLengths),
    dialogueRatio: characters ? dialogueCharacters / characters : 0,
    paragraphCount: paragraphs.length,
    averageParagraphLength: paragraphLengths.length ? paragraphLengths.reduce((total, value) => total + value, 0) / paragraphLengths.length : 0,
    adverbPer1000: characters ? adverbCount / characters * 1000 : 0,
    commaPer1000: characters ? commaCount / characters * 1000 : 0,
    topSentenceStarts: [...startCounts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5).map(([start, count]) => `${start}（${count} 次）`),
    updatedAt: Date.now(),
  }
}

export function formatVoiceFingerprint(fingerprint: AuthorVoiceFingerprint | null | undefined) {
  if (!fingerprint || fingerprint.sampleCharacters < 200) return ''
  return `样本 ${fingerprint.sampleCharacters.toLocaleString('zh-CN')} 字；平均句长 ${fingerprint.averageSentenceLength.toFixed(1)} 字（标准差 ${fingerprint.sentenceLengthStdDev.toFixed(1)}）；对白占比 ${(fingerprint.dialogueRatio * 100).toFixed(1)}%；平均段长 ${fingerprint.averageParagraphLength.toFixed(0)} 字；每千字副词 ${fingerprint.adverbPer1000.toFixed(1)} 个；常用句首：${fingerprint.topSentenceStarts.join('、') || '暂无'}`
}

export function formatAntiAiStylePrompt(profile: StyleProfile | null | undefined) {
  const userPhrases = profile?.bannedPhrases ?? []
  const userPatterns = profile?.bannedPatterns ?? []
  const phrases = [...new Set([...DEFAULT_BANNED_PHRASES, ...userPhrases])].filter(Boolean)
  const patterns = [...new Set([...DEFAULT_BANNED_PATTERNS.map((item) => item.label), ...userPatterns])].filter(Boolean)
  const samples = (profile?.voiceSamples ?? []).map((sample) => sample.trim()).filter(Boolean).slice(0, 3)
  const fingerprint = profile?.voiceFingerprint ? formatVoiceFingerprint(profile.voiceFingerprint) : ''
  const sections = [
    ANTI_AI_STYLE_CONTRACT,
    `【本书明确禁用的词句】${phrases.slice(0, 50).join('、')}`,
    `【本书明确禁用的写法】${patterns.slice(0, 20).join('、')}`,
  ]
  if ((profile?.styleTaboos ?? '').trim()) sections.push(`【作者补充的文风禁区】${(profile?.styleTaboos ?? '').trim().slice(0, 800)}`)
  if (fingerprint) sections.push(`【作者自己的声音统计】${fingerprint}`)
  if (samples.length > 0) sections.push(`【作者自己的声音样本】\n${samples.map((sample, index) => `样本${index + 1}：${sample.slice(0, 700)}`).join('\n')}`)
  if ((profile?.learnedPreferences ?? []).length > 0) {
    sections.push(`【从本书作者手改中学到的偏好】${(profile?.learnedPreferences ?? []).slice(0, 20).join('；')}`)
  }
  const editSample = profile?.editSamples?.[0]
  if (editSample) {
    sections.push(`【最近一次手改对照】（只学习句长、措辞和节奏，不要复制其中事实）\nAI 原稿：${editSample.before.slice(0, 650)}\n作者改成：${editSample.after.slice(0, 650)}`)
  }
  return sections.join('\n\n')
}

export function lintAiStyle(text: string, profile?: StyleProfile | null, limit = 8): AiStyleIssue[] {
  const source = text.replace(/\r\n?/g, '\n').trim()
  if (source.length < 40) return []
  const issues: AiStyleIssue[] = []
  const userPhrases = new Set((profile?.bannedPhrases ?? []).map((phrase) => phrase.trim()).filter(Boolean))
  const phrases = [...new Set([...DEFAULT_BANNED_PHRASES, ...userPhrases])]
  for (const phrase of phrases) {
    const index = source.indexOf(phrase)
    if (index < 0) continue
    const userDefined = userPhrases.has(phrase)
    issues.push({
      id: `phrase:${phrase}`,
      rule: 'banned-phrase',
      severity: userDefined ? 'warning' : 'info',
      message: `${userDefined ? '命中你设置的禁用词' : '常见 AI 套话'}：“${phrase}”`,
      quote: quoteAround(source, index),
    })
    if (issues.length >= limit) break
  }
  for (const item of DEFAULT_BANNED_PATTERNS) {
    const match = item.pattern.exec(source)
    item.pattern.lastIndex = 0
    if (!match || match.index === undefined) continue
    const patternNotes: Record<string, string> = {
      '顿悟式总结': '顿悟式总结，容易像在替读者点题',
      '段尾点题': '段尾点题，容易像在替读者总结意义',
      '对仗模板': '对仗模板，句式过于工整，像套公式',
      '直接命名情绪': '直接命名情绪，缺少动作、场景和潜台词',
      '万能比喻': '万能比喻空泛，和人物当下能接触到的东西没有关系',
    }
    issues.push({
      id: `pattern:${item.label}`,
      rule: 'banned-pattern',
      severity: 'warning',
      message: `命中${item.label}：${patternNotes[item.label] ?? '容易显得像模板'}`,
      quote: quoteAround(source, match.index),
    })
    if (issues.length >= limit) break
  }
  const paragraphs = splitParagraphs(source)
  const sentences = splitSentences(source)
  const sentenceLengths = sentences.map((sentence) => sentence.replace(/\s/g, '').length)
  const paragraphLengths = paragraphs.map((paragraph) => paragraph.replace(/\s/g, '').length)
  const sentenceMean = sentenceLengths.reduce((total, value) => total + value, 0) / Math.max(1, sentenceLengths.length)
  const sentenceCv = sentenceMean > 0 ? standardDeviation(sentenceLengths) / sentenceMean : 0
  if (sentenceLengths.length >= 10 && sentenceCv < 0.3) {
    issues.push({
      id: 'sentence-uniformity',
      rule: 'sentence-uniformity',
      severity: 'info',
      message: `句长过于均匀（长短波动 ${(sentenceCv * 100).toFixed(0)}%），读起来容易像 AI 排好的节奏`,
      quote: `平均句长 ${sentenceMean.toFixed(1)} 字，共 ${sentenceLengths.length} 句`,
    })
  }
  const paragraphMean = paragraphLengths.reduce((total, value) => total + value, 0) / Math.max(1, paragraphLengths.length)
  const paragraphCv = paragraphMean > 0 ? standardDeviation(paragraphLengths) / paragraphMean : 0
  if (paragraphLengths.length >= 5 && paragraphCv < 0.28) {
    issues.push({
      id: 'paragraph-uniformity',
      rule: 'paragraph-uniformity',
      severity: 'info',
      message: `段落长度过于均匀（长短波动 ${(paragraphCv * 100).toFixed(0)}%），缺少疏密变化`,
      quote: `平均段长 ${paragraphMean.toFixed(0)} 字，共 ${paragraphLengths.length} 段`,
    })
  }
  const characters = source.replace(/\s/g, '').length
  const adverbCount = ADVERBS.reduce((total, adverb) => total + (source.match(new RegExp(adverb, 'g'))?.length ?? 0), 0)
  const adverbDensity = characters ? adverbCount / characters * 1000 : 0
  if (adverbDensity > 12) {
    issues.push({
      id: 'adverb-density',
      rule: 'adverb-density',
      severity: 'info',
      message: `副词密度偏高（每千字 ${adverbDensity.toFixed(1)} 个），“缓缓/静静/微微/仿佛”这类词容易形成 AI 腔`,
      quote: `共 ${adverbCount} 个常见副词`,
    })
  }
  const commaCount = (source.match(/[，,]/g) ?? []).length
  const commaDensity = characters ? commaCount / characters * 1000 : 0
  if (commaDensity > 70) {
    issues.push({
      id: 'comma-density',
      rule: 'comma-density',
      severity: 'info',
      message: `逗号密度偏高（每千字 ${commaDensity.toFixed(1)} 个），句子可能过长、修饰过多`,
      quote: `共 ${commaCount} 个逗号`,
    })
  }
  const openings = sentences.map((sentence) => sentence.replace(/^[“"'‘’\s]+/, '').slice(0, 2)).filter((start) => start.length === 2 && !SENTENCE_START_IGNORED.has(start))
  let repeated = 0
  for (let index = 1; index < openings.length; index += 1) if (openings[index] === openings[index - 1]) repeated += 1
  if (repeated >= 3) {
    issues.push({
      id: 'repeated-opening',
      rule: 'repeated-opening',
      severity: 'info',
      message: `有 ${repeated} 处相邻句子开头重复，句式可能过于整齐`,
      quote: openings.slice(0, 6).join(' / '),
    })
  }
  const dialogueCharacters = (source.match(/[“"][^”"]{1,400}[”"]/g) ?? []).reduce((total, quote) => total + quote.replace(/\s/g, '').length, 0)
  const dialogueRatio = characters ? dialogueCharacters / characters : 1
  if (characters > 800 && dialogueRatio < 0.05) {
    issues.push({
      id: 'dialogue-ratio',
      rule: 'dialogue-ratio',
      severity: 'info',
      message: '对白占比极低，叙述可能在替人物解释一切；确认这一段是否真的不需要人物开口',
      quote: `对白约占 ${(dialogueRatio * 100).toFixed(1)}%`,
    })
  }
  const lastParagraph = paragraphs.at(-1) ?? ''
  if (lastParagraph.length > 0 && lastParagraph.length < 200 && /(?:终于|明白|意识到|或许|也许|答案|意义|命运|从此|这一刻)/.test(lastParagraph)) {
    issues.push({
      id: 'summary-ending',
      rule: 'summary-ending',
      severity: 'info',
      message: '结尾段落有总结、点题或升华倾向，可以考虑停在更具体的动作或画面上',
      quote: lastParagraph.slice(0, 80),
    })
  }
  return issues
    .sort((left, right) => (left.severity === right.severity ? 0 : left.severity === 'warning' ? -1 : 1))
    .slice(0, limit)
}

export function formatAiStyleIssue(issue: AiStyleIssue) {
  return `${issue.message}${issue.quote ? `（${issue.quote}）` : ''}`
}
