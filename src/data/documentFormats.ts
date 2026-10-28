import type { ProjectState } from './projectStorage'

export type ImportedSection = {
  title: string
  html: string
}

function safeImageHtml(image: HTMLImageElement) {
  const figure = image.closest('figure')
  const width = figure?.getAttribute('data-width') ?? image.getAttribute('data-width') ?? '100'
  const align = figure?.getAttribute('data-align') ?? image.getAttribute('data-align') ?? 'center'
  const caption = figure?.getAttribute('data-caption') ?? image.getAttribute('data-caption') ?? figure?.querySelector('figcaption')?.textContent ?? ''
  const safeWidth = ['40', '60', '80', '100'].includes(width) ? width : '100'
  const safeAlign = ['left', 'center', 'right'].includes(align) ? align : 'center'
  return `<figure data-story-image="" data-width="${safeWidth}" data-align="${safeAlign}" data-caption="${escapeXml(caption)}"><img src="${escapeXml(image.src)}" alt="${escapeXml(image.alt)}">${caption ? `<figcaption>${escapeXml(caption)}</figcaption>` : ''}</figure>`
}

function safeContentHtml(element: Element) {
  if (element instanceof HTMLImageElement) return safeImageHtml(element)
  if (element.matches('figure[data-story-image], figure') && element.querySelector('img')) {
    return safeImageHtml(element.querySelector('img') as HTMLImageElement)
  }
  const standaloneImages = [...element.querySelectorAll('img')]
  if (standaloneImages.length > 0 && !element.textContent?.trim()) {
    return standaloneImages.map((image) => safeImageHtml(image)).join('')
  }
  const parts: string[] = []
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) parts.push(escapeXml(node.textContent ?? ''))
    else if (node instanceof HTMLImageElement) parts.push(safeImageHtml(node))
    else if (node instanceof HTMLBRElement) parts.push('<br>')
    else if (node instanceof Element) parts.push(escapeXml(node.textContent ?? ''))
  }
  const content = parts.join('').trim()
  if (!content) return ''
  return element.tagName.toLowerCase() === 'blockquote'
    ? `<blockquote>${content}</blockquote>`
    : `<p>${content}</p>`
}

type HtmlBlock =
  | { kind: 'text'; text: string }
  | { kind: 'image'; src: string; alt: string; caption: string; width: number; align: 'left' | 'center' | 'right' }

type ResolvedImage = {
  bytes: Uint8Array
  mediaType: string
  extension: 'png' | 'jpg' | 'gif'
  width: number
  height: number
}

function htmlBlocks(html: string): HtmlBlock[] {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const blocks: HtmlBlock[] = []
  for (const element of document.body.children) {
    if (element instanceof HTMLImageElement) {
      blocks.push(imageBlock(element))
      continue
    }
    const images = [...element.querySelectorAll('img')]
    if (images.length > 0 && (element.matches('figure') || !(element.textContent?.trim()))) {
      for (const image of images) blocks.push(imageBlock(image))
      continue
    }
    const text = element.textContent?.trim()
    if (text) blocks.push({ kind: 'text', text })
  }
  return blocks
}

function imageBlock(image: HTMLImageElement): Extract<HtmlBlock, { kind: 'image' }> {
  const figure = image.closest('figure')
  const widthValue = Number(figure?.getAttribute('data-width') ?? image.getAttribute('data-width') ?? 100)
  const alignValue = figure?.getAttribute('data-align') ?? image.getAttribute('data-align') ?? 'center'
  return {
    kind: 'image',
    src: image.src,
    alt: image.alt,
    caption: figure?.getAttribute('data-caption') ?? image.getAttribute('data-caption') ?? figure?.querySelector('figcaption')?.textContent ?? '',
    width: [40, 60, 80, 100].includes(widthValue) ? widthValue : 100,
    align: alignValue === 'left' || alignValue === 'right' ? alignValue : 'center',
  }
}

async function resolveImage(src: string): Promise<ResolvedImage> {
  const response = await fetch(src)
  if (!response.ok) throw new Error(`图片无法读取：${src}`)
  const blob = await response.blob()
  const mediaType = blob.type || 'image/png'
  const bitmap = await createImageBitmap(blob)
  let outputBlob = blob
  let outputMediaType = mediaType
  let extension: ResolvedImage['extension'] = mediaType.includes('jpeg') ? 'jpg' : mediaType.includes('gif') ? 'gif' : 'png'
  if (mediaType.includes('webp')) {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
    outputBlob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      (converted) => converted ? resolve(converted) : reject(new Error('WebP 图片转换失败')),
      'image/png',
    ))
    outputMediaType = 'image/png'
    extension = 'png'
  }
  const image = {
    bytes: new Uint8Array(await outputBlob.arrayBuffer()),
    mediaType: outputMediaType,
    extension,
    width: bitmap.width,
    height: bitmap.height,
  } satisfies ResolvedImage
  bitmap.close()
  return image
}

export async function validateProjectResources(project: ProjectState) {
  const issues: Array<{ chapterTitle: string; src: string }> = []
  for (const chapter of project.chapters) {
    for (const block of htmlBlocks(chapter.content)) {
      if (block.kind !== 'image') continue
      try {
        await resolveImage(block.src)
      } catch {
        issues.push({ chapterTitle: chapter.title, src: block.src })
      }
    }
  }
  return issues
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeZipPath(basePath: string, relativePath: string) {
  const parts = `${basePath}/${relativePath}`.split('/')
  const normalized: string[] = []
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') normalized.pop()
    else normalized.push(part)
  }
  return normalized.join('/')
}

function bytesToDataUrl(bytes: Uint8Array, mediaType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(new Blob([bytes], { type: mediaType }))
  })
}

export async function importDocx(buffer: ArrayBuffer): Promise<ImportedSection[]> {
  const mammoth = await import('mammoth')
  const result = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => ({
        src: `data:${image.contentType};base64,${await image.read('base64')}`,
      })),
    },
  )
  const document = new DOMParser().parseFromString(result.value, 'text/html')
  const hasNestedHeadings = Boolean(document.body.querySelector('h2, h3'))
  const headingSelector = hasNestedHeadings ? 'h2, h3' : 'h1, h2, h3'
  const sections: ImportedSection[] = []
  let current: ImportedSection | null = null
  for (const element of document.body.children) {
    if (element.matches(headingSelector)) {
      if (current?.html.trim()) sections.push(current)
      current = { title: element.textContent?.trim() || `第${sections.length + 1}章`, html: '' }
      continue
    }
    const html = safeContentHtml(element)
    if (!html) continue
    if (!current && hasNestedHeadings) continue
    if (!current) current = { title: '导入文档', html: '' }
    current.html += html
  }
  if (current?.html.trim()) sections.push(current)
  if (sections.length > 0) return sections
  const fallback = [...document.body.children].map(safeContentHtml).join('')
  return fallback ? [{ title: '导入文档', html: fallback }] : []
}

export async function exportDocx(project: ProjectState): Promise<Blob> {
  const { AlignmentType, Document, HeadingLevel, ImageRun, Packer, Paragraph } = await import('docx')
  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ text: project.title, heading: HeadingLevel.TITLE }),
  ]
  for (const volume of project.volumes) {
    children.push(new Paragraph({ text: volume.title, heading: HeadingLevel.HEADING_1 }))
    for (const chapter of project.chapters.filter((item) => item.volumeId === volume.id)) {
      children.push(new Paragraph({ text: chapter.title, heading: HeadingLevel.HEADING_2 }))
      for (const block of htmlBlocks(chapter.content)) {
        if (block.kind === 'text') {
          children.push(new Paragraph({
            text: block.text,
            indent: { firstLine: 480 },
          }))
          continue
        }
        const image = await resolveImage(block.src)
        const targetWidth = 560 * block.width / 100
        const scale = Math.min(1, targetWidth / image.width, 700 / image.height)
        const alignment = block.align === 'left' ? AlignmentType.LEFT
          : block.align === 'right' ? AlignmentType.RIGHT
            : AlignmentType.CENTER
        children.push(new Paragraph({
          alignment,
          children: [new ImageRun({
            data: image.bytes,
            type: image.extension,
            transformation: {
              width: Math.max(1, Math.round(image.width * scale)),
              height: Math.max(1, Math.round(image.height * scale)),
            },
            altText: block.alt ? {
              title: block.alt,
              description: block.alt,
              name: block.alt,
            } : undefined,
          })],
        }))
        if (block.caption) {
          children.push(new Paragraph({ text: block.caption, alignment }))
        }
      }
    }
  }
  const document = new Document({ sections: [{ children }] })
  return Packer.toBlob(document)
}

export async function importEpub(buffer: ArrayBuffer): Promise<ImportedSection[]> {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const containerText = await zip.file('META-INF/container.xml')?.async('text')
  if (!containerText) throw new Error('EPUB 缺少容器信息')
  const container = new DOMParser().parseFromString(containerText, 'application/xml')
  const rootPath = container.querySelector('rootfile')?.getAttribute('full-path')
  if (!rootPath) throw new Error('EPUB 无法定位内容清单')
  const opfText = await zip.file(rootPath)?.async('text')
  if (!opfText) throw new Error('EPUB 内容清单不存在')
  const opf = new DOMParser().parseFromString(opfText, 'application/xml')
  const manifest = new Map(
    [...opf.querySelectorAll('manifest item')].map((item) => [
      item.getAttribute('id') ?? '',
      {
        href: item.getAttribute('href') ?? '',
        mediaType: item.getAttribute('media-type') ?? 'application/octet-stream',
      },
    ]),
  )
  const opfDirectory = rootPath.includes('/') ? rootPath.slice(0, rootPath.lastIndexOf('/')) : ''
  const mediaTypeByPath = new Map(
    [...manifest.values()].map((item) => [
      normalizeZipPath(opfDirectory, decodeURIComponent(item.href.split('#')[0])),
      item.mediaType,
    ]),
  )
  const sections: ImportedSection[] = []
  for (const itemref of opf.querySelectorAll('spine itemref')) {
    const manifestItem = manifest.get(itemref.getAttribute('idref') ?? '')
    if (!manifestItem?.href) continue
    const path = normalizeZipPath(opfDirectory, decodeURIComponent(manifestItem.href.split('#')[0]))
    const source = await zip.file(path)?.async('text')
    if (!source) continue
    const chapterDocument = new DOMParser().parseFromString(source, 'text/html')
    const title = chapterDocument.querySelector('h1, h2, title')?.textContent?.trim()
      || path.split('/').pop()?.replace(/\.[^.]+$/, '')
      || `第${sections.length + 1}章`
    const body = chapterDocument.body
    const chapterDirectory = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''
    const htmlParts: string[] = []
    for (const sourceElement of body.children) {
      if (/^H[1-3]$/.test(sourceElement.tagName)) continue
      const element = sourceElement.cloneNode(true) as Element
      const images = element instanceof HTMLImageElement
        ? [element]
        : [...element.querySelectorAll('img')]
      for (const image of images) {
        const originalSrc = image.getAttribute('src')
        if (!originalSrc) continue
        const imagePath = normalizeZipPath(chapterDirectory, decodeURIComponent(originalSrc.split('#')[0]))
        const bytes = await zip.file(imagePath)?.async('uint8array')
        if (!bytes) continue
        image.src = await bytesToDataUrl(bytes, mediaTypeByPath.get(imagePath) ?? 'image/png')
      }
      const html = safeContentHtml(element)
      if (html) htmlParts.push(html)
    }
    const html = htmlParts.join('')
    if (html) sections.push({ title, html })
  }
  if (sections.length === 0) throw new Error('EPUB 中没有可导入的正文')
  return sections
}

export async function exportEpub(project: ProjectState): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const bookId = `urn:uuid:${crypto.randomUUID()}`
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`)

  const manifest: string[] = []
  const spine: string[] = []
  const navigation: string[] = []
  let index = 0
  let imageIndex = 0
  const exportedImages = new Map<string, { href: string; id: string }>()
  for (const volume of project.volumes) {
    const chapterLinks: string[] = []
    for (const chapter of project.chapters.filter((item) => item.volumeId === volume.id)) {
      index += 1
      const id = `chapter-${index}`
      const filename = `${id}.xhtml`
      const contentBlocks: string[] = []
      for (const block of htmlBlocks(chapter.content)) {
        if (block.kind === 'text') {
          contentBlocks.push(`<p>${escapeXml(block.text)}</p>`)
          continue
        }
        let exported = exportedImages.get(block.src)
        if (!exported) {
          imageIndex += 1
          const image = await resolveImage(block.src)
          exported = { id: `image-${imageIndex}`, href: `images/image-${imageIndex}.${image.extension}` }
          zip.file(`OEBPS/${exported.href}`, image.bytes)
          manifest.push(`<item id="${exported.id}" href="${exported.href}" media-type="${image.mediaType}"/>`)
          exportedImages.set(block.src, exported)
        }
        contentBlocks.push(`<figure class="align-${block.align}" style="width:${block.width}%"><img src="${exported.href}" alt="${escapeXml(block.alt)}"/>${block.caption ? `<figcaption>${escapeXml(block.caption)}</figcaption>` : ''}</figure>`)
      }
      zip.file(`OEBPS/${filename}`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN"><head><meta charset="UTF-8"/><title>${escapeXml(chapter.title)}</title><link rel="stylesheet" href="style.css"/></head><body><h1>${escapeXml(chapter.title)}</h1>${contentBlocks.join('\n')}</body></html>`)
      manifest.push(`<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>`)
      spine.push(`<itemref idref="${id}"/>`)
      chapterLinks.push(`<li><a href="${filename}">${escapeXml(chapter.title)}</a></li>`)
    }
    navigation.push(`<li><span>${escapeXml(volume.title)}</span><ol>${chapterLinks.join('')}</ol></li>`)
  }
  zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="zh-CN"><head><title>目录</title></head><body><nav epub:type="toc"><h1>目录</h1><ol>${navigation.join('')}</ol></nav></body></html>`)
  zip.file('OEBPS/style.css', 'body{font-family:serif;line-height:1.8;margin:5%;}h1{font-size:1.4em;}p{text-indent:2em;margin:.8em 0;}figure{max-width:100%;margin-top:1.5em;margin-bottom:1.5em;text-align:center;}figure.align-left{margin-left:0;margin-right:auto;}figure.align-center{margin-left:auto;margin-right:auto;}figure.align-right{margin-left:auto;margin-right:0;}img{display:block;width:100%;height:auto;}figcaption{margin-top:.5em;color:#666;font-size:.85em;}')
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="zh-CN">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${bookId}</dc:identifier><dc:title>${escapeXml(project.title)}</dc:title><dc:language>zh-CN</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta></metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="style" href="style.css" media-type="text/css"/>${manifest.join('')}</manifest>
<spine>${spine.join('')}</spine></package>`)
  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip', compression: 'DEFLATE' })
}
