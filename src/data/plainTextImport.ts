export type PlainTextSection = {
  title: string
  lines: string[]
}

export type PlainTextImportAnalysis = {
  explicitHeadings: Array<{ lineIndex: number; title: string }>
  titleOnlyHeadings: Array<{ lineIndex: number; title: string }>
}

const numberedHeading = /^(?:正文\s*)?第\s*(?:\d{1,6}|[零〇一二三四五六七八九十百千万两]{1,12})\s*[章回节](?:\s*[：:·\-—]?\s*.{0,40})?$/
const westernHeading = /^(?:chapter|part)\s+\d{1,6}(?:\s*[.:：·\-—]?\s*.{0,60})?$/i
const specialHeading = /^(?:序章|序言|楔子|引子|前言|终章|尾声|后记|大结局|番外(?:篇)?(?:\s*[一二三四五六七八九十\d]+)?)(?:\s*[：:·\-—]?\s*.{0,30})?$/

function explicitHeadingTitle(line: string) {
  const trimmed = line.trim()
  const markdown = /^(#{1,3})\s+(.+)$/.exec(trimmed)
  if (markdown) return markdown[2].trim()
  if (numberedHeading.test(trimmed) || westernHeading.test(trimmed) || specialHeading.test(trimmed)) return trimmed
  return ''
}

function isTitleOnlyCandidate(lines: string[], lineIndex: number) {
  const title = lines[lineIndex].trim()
  if (title.length < 2 || title.length > 30) return false
  if (lineIndex > 0 && lines[lineIndex - 1].trim()) return false
  if (lineIndex < lines.length - 1 && lines[lineIndex + 1].trim()) return false
  if (/^[\-—_*#>「『“‘（(\d]/.test(title)) return false
  if (/[。！？!?；;，,、…：:]$/.test(title)) return false
  if (/^(?:本章|这一章|下一章|上章|正文|作者有话说)$/.test(title)) return false
  return true
}

export function analyzePlainTextImport(source: string): PlainTextImportAnalysis {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const explicitHeadings = lines.flatMap((line, lineIndex) => {
    const title = explicitHeadingTitle(line)
    return title ? [{ lineIndex, title }] : []
  })
  if (explicitHeadings.length > 0) return { explicitHeadings, titleOnlyHeadings: [] }

  const rawCandidates = lines.flatMap((_, lineIndex) => isTitleOnlyCandidate(lines, lineIndex)
    ? [{ lineIndex, title: lines[lineIndex].trim() }]
    : [])
  const titleOnlyHeadings = rawCandidates.filter((candidate, index) => {
    const nextLine = rawCandidates[index + 1]?.lineIndex ?? lines.length
    const body = lines.slice(candidate.lineIndex + 1, nextLine).filter((line) => line.trim())
    const bodyCharacters = body.reduce((total, line) => total + line.trim().length, 0)
    return body.length >= 2 && bodyCharacters >= 80
  })
  return { explicitHeadings, titleOnlyHeadings: titleOnlyHeadings.length >= 2 ? titleOnlyHeadings : [] }
}

export function splitPlainTextSections(
  source: string,
  fallbackTitle: string,
  headingMode: 'explicit' | 'title-only' | 'single',
): PlainTextSection[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const analysis = analyzePlainTextImport(source)
  const headings = headingMode === 'explicit'
    ? analysis.explicitHeadings
    : headingMode === 'title-only'
      ? analysis.titleOnlyHeadings
      : []
  if (headings.length === 0) return [{ title: fallbackTitle, lines }]

  const headingByLine = new Map(headings.map((heading) => [heading.lineIndex, heading.title]))
  const sections: PlainTextSection[] = []
  let current = { title: fallbackTitle, lines: [] as string[] }
  for (const [lineIndex, line] of lines.entries()) {
    const heading = headingByLine.get(lineIndex)
    if (heading) {
      if (current.lines.some((item) => item.trim())) sections.push(current)
      current = { title: heading, lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  if (current.lines.some((item) => item.trim()) || sections.length === 0) sections.push(current)
  return sections
}
