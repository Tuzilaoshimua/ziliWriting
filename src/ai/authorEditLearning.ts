import { analyzeAuthorVoice, DEFAULT_BANNED_PHRASES } from './antiAiStyle'

export type AuthorEditLearning = {
  before: string
  after: string
  signals: string[]
}

function normalizeParagraph(value: string) {
  return value.replace(/\s+/g, '').replace(/^[“"'‘’]+|[”"'‘’]+$/g, '')
}

function bigrams(value: string) {
  const normalized = normalizeParagraph(value)
  const set = new Set<string>()
  for (let index = 0; index < normalized.length - 1; index += 1) set.add(normalized.slice(index, index + 2))
  return set
}

function paragraphSimilarity(left: string, right: string) {
  const a = bigrams(left)
  const b = bigrams(right)
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const item of a) if (b.has(item)) intersection += 1
  return (2 * intersection) / (a.size + b.size)
}

function lcsMatches(left: string[], right: string[]) {
  const leftNormalized = left.map(normalizeParagraph)
  const rightNormalized = right.map(normalizeParagraph)
  const rows = leftNormalized.length
  const columns = rightNormalized.length
  const table = Array.from({ length: rows + 1 }, () => new Uint16Array(columns + 1))
  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let column = columns - 1; column >= 0; column -= 1) {
      table[row][column] = leftNormalized[row] === rightNormalized[column]
        ? table[row + 1][column + 1] + 1
        : Math.max(table[row + 1][column], table[row][column + 1])
    }
  }
  const matches: Array<{ left: number; right: number }> = []
  let row = 0
  let column = 0
  while (row < rows && column < columns) {
    if (leftNormalized[row] === rightNormalized[column]) {
      matches.push({ left: row, right: column })
      row += 1
      column += 1
    } else if (table[row + 1][column] >= table[row][column + 1]) {
      row += 1
    } else {
      column += 1
    }
  }
  return matches
}

function summaryLike(paragraphs: string[]) {
  const last = paragraphs.at(-1) ?? ''
  return /(?:终于|明白|意识到|或许|也许|答案|意义|命运|从此|这一刻)/.test(last)
}

function truncate(value: string, maximum = 2200) {
  return value.length > maximum ? `${value.slice(0, maximum)}…` : value
}

/**
 * 比较“AI 候选原文”和“作者手改后的正文”，只提取可读的文风信号。
 * 所有结果都由调用方保存到当前作品的 StyleProfile，不写入任何全局设置。
 */
export function learnFromAuthorEdit(candidateText: string, chapterPlainText: string): AuthorEditLearning | null {
  const candidate = candidateText.replace(/\r\n?/g, '\n').trim()
  const chapter = chapterPlainText.replace(/\r\n?/g, '\n').trim()
  if (!candidate || !chapter || candidate === chapter) return null
  const candidateParagraphs = candidate.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  const chapterParagraphs = chapter.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  if (candidateParagraphs.length === 0 || chapterParagraphs.length === 0) return null

  let matches = lcsMatches(candidateParagraphs.slice(0, 400), chapterParagraphs.slice(0, 600))
  if (matches.length === 0) {
    // 单段改写常常整段都被重写，精确匹配会失效；用字符二元组相似度兜底。
    if (candidateParagraphs.length <= 3) {
      let best = { right: -1, score: 0 }
      for (let index = 0; index < chapterParagraphs.length; index += 1) {
        const score = paragraphSimilarity(candidate, chapterParagraphs[index])
        if (score > best.score) best = { right: index, score }
      }
      if (best.right >= 0 && best.score >= 0.28) {
        const before = candidate
        const after = chapterParagraphs[best.right]
        if (before !== after) return analyzePair(before, after)
      }
    }
    return null
  }

  const first = matches[0]
  const last = matches[matches.length - 1]
  const before = candidateParagraphs.slice(first.left, last.left + 1).join('\n\n')
  let after = chapterParagraphs.slice(first.right, last.right + 1).join('\n\n')
  if (!before || !after || before === after) return null
  return analyzePair(before, after)
}

function analyzePair(before: string, after: string): AuthorEditLearning | null {
  if (before === after) return null
  const beforeVoice = analyzeAuthorVoice([before])
  const afterVoice = analyzeAuthorVoice([after])
  const signals: string[] = []
  const removedPhrases = DEFAULT_BANNED_PHRASES.filter((phrase) => before.includes(phrase) && !after.includes(phrase)).slice(0, 3)
  if (removedPhrases.length > 0) signals.push(`删除了套话：${removedPhrases.join('、')}`)
  const beforeParagraphs = before.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  const afterParagraphs = after.split(/\n+/).map((item) => item.trim()).filter(Boolean)
  if (summaryLike(beforeParagraphs) && !summaryLike(afterParagraphs)) signals.push('删掉了段尾总结或点题')
  if (beforeVoice.sentenceCount >= 3 && afterVoice.averageSentenceLength > 0 && afterVoice.averageSentenceLength < beforeVoice.averageSentenceLength * 0.88) {
    signals.push('把句子改短了')
  }
  if (beforeVoice.adverbPer1000 > 0 && afterVoice.adverbPer1000 < beforeVoice.adverbPer1000 * 0.75) {
    signals.push('减少了副词')
  }
  if (afterVoice.dialogueRatio > beforeVoice.dialogueRatio + 0.05) signals.push('增加了对白')
  if (afterParagraphs.length < beforeParagraphs.length) signals.push('删减或合并了段落')
  return {
    before: truncate(before),
    after: truncate(after),
    signals: [...new Set(signals)].slice(0, 6),
  }
}
