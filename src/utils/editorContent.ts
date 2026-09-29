import type { Chapter, Scene } from '../data/projectStorage'
import { createChapterDocument } from '../data/projectStorage'
import { splitPlainTextSections } from '../data/plainTextImport'

export function plainText(html: string) {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent ?? ''
}

export function escapeHtml(text: string) {
  const element = document.createElement('div')
  element.textContent = text
  return element.innerHTML
}

export function escapeMarkdown(text: string) {
  return text.replace(/([\\`*_\[\]{}<>#+.!|~-])/g, '\\$1')
}

export function htmlToMarkdown(html: string, imageSources: Map<string, string>) {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const blocks: string[] = []
  for (const element of parsed.body.children) {
    const image = element instanceof HTMLImageElement ? element : element.querySelector('img')
    if (image && (element instanceof HTMLImageElement || element.matches('figure') || !element.textContent?.trim())) {
      const figure = image.closest('figure')
      const caption = figure?.getAttribute('data-caption') ?? figure?.querySelector('figcaption')?.textContent ?? image.alt
      blocks.push(`![${escapeMarkdown(caption)}](${imageSources.get(image.src) ?? image.src})`)
      continue
    }
    const text = element.textContent?.trim()
    if (!text) continue
    if (element.tagName === 'BLOCKQUOTE') blocks.push(text.split('\n').map((line) => `> ${escapeMarkdown(line)}`).join('\n'))
    else blocks.push(escapeMarkdown(text))
  }
  return blocks.join('\n\n')
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function toChineseNumber(value: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (value < 10) return digits[value]
  if (value < 20) return `十${value % 10 === 0 ? '' : digits[value % 10]}`
  if (value < 100) return `${digits[Math.floor(value / 10)]}十${value % 10 === 0 ? '' : digits[value % 10]}`
  if (value < 1000) {
    const remainder = value % 100
    return `${digits[Math.floor(value / 100)]}百${remainder === 0 ? '' : remainder < 10 ? `零${digits[remainder]}` : toChineseNumber(remainder)}`
  }
  const remainder = value % 1000
  return `${digits[Math.floor(value / 1000)]}千${remainder === 0 ? '' : remainder < 100 ? `零${toChineseNumber(remainder)}` : toChineseNumber(remainder)}`
}

export function nextDefaultName(existingTitles: string[], unit: '卷' | '章'): string {
  let sequence = existingTitles.length + 1
  let candidate = `第${toChineseNumber(sequence)}${unit}`
  while (existingTitles.includes(candidate)) {
    sequence += 1
    candidate = `第${toChineseNumber(sequence)}${unit}`
  }
  return candidate
}

export function createScene(chapterId: string, existingTitles: string[] = []): Scene {
  let sequence = existingTitles.length + 1
  let title = `场景 ${sequence}`
  while (existingTitles.includes(title)) {
    sequence += 1
    title = `场景 ${sequence}`
  }
  return {
    id: crypto.randomUUID(),
    chapterId,
    title,
    goal: '',
    notes: '',
    summary: '',
    startNodeId: '',
    endNodeId: '',
    updatedAt: Date.now(),
  }
}

export function createScenesForChapters(chapters: Chapter[]) {
  return chapters.map((chapter) => createScene(chapter.id))
}

export function splitImportedText(
  text: string,
  fallbackTitle: string,
  volumeId: string,
  headingMode: 'explicit' | 'title-only' | 'single',
): Chapter[] {
  return splitPlainTextSections(text, fallbackTitle, headingMode).map((section) => {
    const content = section.lines
      .map((line) => line.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join('')
    return {
      id: crypto.randomUUID(),
      volumeId,
      title: section.title,
      ...createChapterDocument(content),
      updatedAt: Date.now(),
    }
  })
}
