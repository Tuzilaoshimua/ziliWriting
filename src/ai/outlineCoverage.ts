import type { OutlineNode } from '../data/creativeStorage'
import type { Chapter } from '../data/projectStorage'

export type OutlineCoverageStatus = 'covered' | 'partial' | 'missing'

export type OutlineCoverageSource = 'linked' | 'text'

export type OutlineCoverageItem = {
  node: OutlineNode
  status: OutlineCoverageStatus
  matchedChapterId: string | null
  matchedChapterTitle: string | null
  /** 0–1，表示该大纲节拍的关键词在正文中被找到的比例 */
  coverage: number
  /** 覆盖不足时列出没有在正文中出现的关键词 */
  unmatchedTokens: string[]
  /** linked = 作者显式绑定章节；text = 关键词推断 */
  source: OutlineCoverageSource
  /** 该节点已绑定的章节 */
  linkedChapterIds: string[]
}

export type OutlineCoverageReport = {
  total: number
  covered: number
  partial: number
  missing: number
  linked: number
  items: OutlineCoverageItem[]
}

const SPLIT = /[\s，。；、,.!?！？：:；（）()\[\]【】“”"'《》<>·…—\-\n\r\t]+/
const STOPWORDS = new Set([
  '的', '了', '在', '是', '和', '与', '及', '等', '这', '那', '一', '不', '也',
  '都', '要', '把', '被', '很', '有', '到', '对', '上', '下', '中', '里', '会',
  '就', '而', '但', '可', '以', '让', '给', '从', '向', '为', '之', '其', '它',
  '他', '她', '我', '你', '们', '着', '过', '了', '么', '的', '地', '得', '个',
  '时', '后', '前', '现', '没', '没有', '将', '并', '或', '再', '又', '已', '当',
])

function normalize(value: string) {
  return value.normalize('NFKC').replace(/[“”"'‘’《》「」『』]/g, '').replace(/\s+/g, '')
}

function extractTokens(value: string): string[] {
  const source = normalize(value)
  const tokens = source.split(SPLIT).map((token) => token.trim()).filter(Boolean)
  const filtered = tokens.filter((token) => token.length >= 2 && !STOPWORDS.has(token))
  // 中文没有空格分词时，拆成双字组合词以便跨正文匹配。
  const bigrams = new Set<string>()
  for (const token of filtered) {
    bigrams.add(token)
    if (token.length > 2) {
      for (let index = 0; index <= token.length - 2; index += 1) {
        bigrams.add(token.slice(index, index + 2))
      }
    }
  }
  return [...bigrams].slice(0, 40)
}

function titleMatched(nodeTitle: string, chapterTitle: string) {
  const node = normalize(nodeTitle)
  const chapter = normalize(chapterTitle)
  if (!node || !chapter) return false
  return chapter.includes(node) || node.includes(chapter) || node.startsWith(chapter) || chapter.startsWith(node)
}

function countOccurrences(text: string, token: string) {
  const normalized = normalize(text)
  let count = 0
  let index = normalized.indexOf(token)
  while (index >= 0) {
    count += 1
    index = normalized.indexOf(token, index + 1)
  }
  return count
}

export function analyzeOutlineCoverage(
  outline: OutlineNode[],
  chapters: Chapter[],
  links: Array<{ nodeId: string; chapterId: string }> = [],
): OutlineCoverageReport {
  const beatNodes = outline.filter((node) => node.level === 'chapter' || node.level === 'scene')
  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]))
  const chapterBodies = chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    text: `${chapter.title}\n${chapter.plainText}`,
  }))
  const linksByNode = new Map<string, string[]>()
  for (const link of links) {
    if (!chapterById.has(link.chapterId)) continue
    const list = linksByNode.get(link.nodeId) ?? []
    if (!list.includes(link.chapterId)) list.push(link.chapterId)
    linksByNode.set(link.nodeId, list)
  }

  const items: OutlineCoverageItem[] = beatNodes.map((node) => {
    const linkedChapterIds = linksByNode.get(node.id) ?? []
    if (linkedChapterIds.length > 0) {
      const first = chapterById.get(linkedChapterIds[0])
      return {
        node,
        status: 'covered' as const,
        matchedChapterId: first?.id ?? null,
        matchedChapterTitle: first?.title ?? null,
        coverage: 1,
        unmatchedTokens: [],
        source: 'linked' as const,
        linkedChapterIds,
      }
    }

    const tokens = extractTokens(`${node.title} ${node.summary}`)
    if (tokens.length === 0) {
      return {
        node,
        status: 'partial' as const,
        matchedChapterId: null,
        matchedChapterTitle: null,
        coverage: 0,
        unmatchedTokens: [],
        source: 'text' as const,
        linkedChapterIds: [],
      }
    }
    let bestScore = -1
    let bestChapter: { id: string; title: string } | null = null
    for (const chapter of chapterBodies) {
      const titleBonus = titleMatched(node.title, chapter.title) ? 0.6 : 0
      const found = tokens.filter((token) => countOccurrences(chapter.text, token) > 0).length
      const ratio = found / tokens.length
      const score = ratio + titleBonus
      if (score > bestScore) {
        bestScore = score
        bestChapter = { id: chapter.id, title: chapter.title }
      }
    }
    const unmatched = tokens.filter((token) => !chapterBodies.some((chapter) => countOccurrences(chapter.text, token) > 0))
    const coverage = Math.max(0, Math.min(1, bestScore))
    let status: OutlineCoverageStatus
    if (bestScore >= 0.8) status = 'covered'
    else if (bestScore >= 0.35) status = 'partial'
    else status = 'missing'
    return {
      node,
      status,
      matchedChapterId: bestChapter?.id ?? null,
      matchedChapterTitle: bestChapter?.title ?? null,
      coverage,
      unmatchedTokens: unmatched.slice(0, 8),
      source: 'text' as const,
      linkedChapterIds: [],
    }
  })

  const ordered = [...items].sort((left, right) => {
    const rank = { missing: 0, partial: 1, covered: 2 } as const
    return rank[left.status] - rank[right.status]
  })
  const covered = items.filter((item) => item.status === 'covered').length
  const partial = items.filter((item) => item.status === 'partial').length
  const missing = items.filter((item) => item.status === 'missing').length
  const linked = items.filter((item) => item.source === 'linked').length
  return { total: items.length, covered, partial, missing, linked, items: ordered }
}
