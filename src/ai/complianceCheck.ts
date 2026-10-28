import type { Chapter } from '../data/projectStorage'

/**
 * 本地敏感词 / 合规自查。
 * 纯本地匹配，不联网、不上报；词表面向"平台审核容易踩雷"的通用类别，
 * 不做价值判断，作者应自行结合目标平台规则复核。
 */

export type ComplianceSeverity = 'info' | 'warn' | 'high'
export type ComplianceCategory = 'sexual' | 'violence' | 'illegal' | 'spam' | 'privacy' | 'custom'

export const COMPLIANCE_CATEGORY_LABELS: Record<ComplianceCategory, string> = {
  sexual: '露骨描写',
  violence: '暴力血腥',
  illegal: '违法违禁',
  spam: '导流广告',
  privacy: '隐私信息',
  custom: '自定义',
}

export const COMPLIANCE_SEVERITY_LABELS: Record<ComplianceSeverity, string> = {
  info: '提示',
  warn: '警告',
  high: '高风险',
}

export type ComplianceRule = {
  id: string
  label: string
  category: ComplianceCategory
  severity: ComplianceSeverity
  pattern: RegExp
}

export type ComplianceHit = {
  chapterId: string
  chapterTitle: string
  ruleId: string
  label: string
  category: ComplianceCategory
  severity: ComplianceSeverity
  match: string
  index: number
  context: string
}

export type ComplianceReport = {
  hits: ComplianceHit[]
  totalHits: number
  high: number
  warn: number
  info: number
  scannedChapters: number
  truncated: boolean
}

const BUILTIN_RULES: ComplianceRule[] = [
  { id: 'sexual-explicit', label: '露骨性描写', category: 'sexual', severity: 'high', pattern: /(?:性交|做爱|性行为|床戏|情色|裸体|全裸|赤裸)/g },
  { id: 'violence-gore', label: '血腥暴力', category: 'violence', severity: 'high', pattern: /(?:肢解|虐杀|开膛|剖腹|血肉模糊|碎尸|自残|自杀)/g },
  { id: 'illegal-drugs', label: '毒品枪支', category: 'illegal', severity: 'high', pattern: /(?:毒品|海洛因|冰毒|大麻|枪支|弹药|炸药|管制刀具)/g },
  { id: 'illegal-gambling', label: '赌博洗钱', category: 'illegal', severity: 'high', pattern: /(?:赌场|赌博|洗钱|诈骗|传销)/g },
  { id: 'spam-contact', label: '导流联系方式', category: 'spam', severity: 'warn', pattern: /(?:加微信|加QQ|加Q|扫码|私信我|私聊我|代写|代发|刷单|返现|博彩|下注)/g },
  { id: 'privacy-pii', label: '隐私信息', category: 'privacy', severity: 'info', pattern: /(?:身份证号|身份证号码|手机号|家庭住址|银行卡号)/g },
]

export const COMPLIANCE_RULES: ComplianceRule[] = BUILTIN_RULES

export function buildCustomRules(words: string[]): ComplianceRule[] {
  return [...new Set(words.map((word) => word.trim()).filter(Boolean))].slice(0, 200).map((word, index) => ({
    id: `custom-${index}`,
    label: word,
    category: 'custom' as const,
    severity: 'warn' as const,
    pattern: new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
  }))
}

function contextOf(text: string, index: number, length: number) {
  const start = Math.max(0, index - 16)
  const end = Math.min(text.length, index + length + 16)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ')}${end < text.length ? '…' : ''}`
}

export function scanCompliance(chapters: Chapter[], customWords: string[] = []): ComplianceReport {
  const rules = [...BUILTIN_RULES, ...buildCustomRules(customWords)]
  const hits: ComplianceHit[] = []
  const limit = 400
  let truncated = false

  for (const chapter of chapters) {
    const text = chapter.plainText
    if (!text) continue
    for (const rule of rules) {
      const pattern = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`)
      let match = pattern.exec(text)
      while (match) {
        if (hits.length >= limit) {
          truncated = true
          break
        }
        hits.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          ruleId: rule.id,
          label: rule.label,
          category: rule.category,
          severity: rule.severity,
          match: match[0],
          index: match.index,
          context: contextOf(text, match.index, match[0].length),
        })
        if (!pattern.global) break
        match = pattern.exec(text)
      }
      if (truncated) break
    }
    if (truncated) break
  }

  const high = hits.filter((hit) => hit.severity === 'high').length
  const warn = hits.filter((hit) => hit.severity === 'warn').length
  const info = hits.filter((hit) => hit.severity === 'info').length
  return { hits, totalHits: hits.length, high, warn, info, scannedChapters: chapters.filter((chapter) => chapter.plainText).length, truncated }
}

const WORDS_KEY = 'zili-compliance-words-v1'

export function loadComplianceWords(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(WORDS_KEY) || '[]') as unknown
    if (!Array.isArray(stored)) return []
    return stored.filter((word): word is string => typeof word === 'string' && Boolean(word.trim())).slice(0, 200)
  } catch {
    return []
  }
}

export function saveComplianceWords(words: string[]): void {
  try {
    localStorage.setItem(WORDS_KEY, JSON.stringify([...new Set(words.map((word) => word.trim()).filter(Boolean))].slice(0, 200)))
  } catch {
    // 存储失败不阻塞检测
  }
}