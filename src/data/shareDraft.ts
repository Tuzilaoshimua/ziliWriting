import type { Chapter, ProjectState } from '../data/projectStorage'

/**
 * 分享稿：单文件只读 HTML，每个正文块带稳定锚点 `ch-<chapterId>-p-<index>`，
 * 供读者批注后回传 `.zilicomments.json`。
 */

export type ShareComment = {
  chapterId: string
  anchor: string
  quote: string
  comment: string
  author: string
  createdAt: number
}

export type CommentBundle = {
  version: 1
  projectId: string
  projectTitle: string
  comments: ShareComment[]
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const SHARE_STYLE = `
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; background: #f6f4ef; color: #2c2b28; font-family: "Songti SC", "Noto Serif SC", "Source Han Serif SC", Georgia, serif; line-height: 1.9; }
main { max-width: 42em; margin: 0 auto; padding: 56px 28px 96px; background: #fffdf8; }
header.cover { border-bottom: 1px solid #e6e1d5; padding-bottom: 22px; margin-bottom: 34px; }
header.cover h1 { margin: 0 0 6px; font-size: 1.9em; letter-spacing: .04em; }
header.cover p { margin: 0; color: #8a857a; font-size: .85em; }
h2.volume { margin: 46px 0 18px; font-size: 1.05em; letter-spacing: .18em; color: #8a857a; font-weight: 500; }
article.chapter { margin: 0 0 44px; }
article.chapter h3 { margin: 0 0 18px; font-size: 1.25em; }
article.chapter h3 span { display: block; margin-top: 4px; color: #a29d92; font-size: .72em; font-weight: 400; letter-spacing: .08em; }
[data-anchor] { margin: 0 0 1.05em; text-indent: 2em; }
blockquote[data-anchor] { margin: 1.4em 0; padding: 4px 18px; border-left: 2px solid #d8d2c4; color: #5f5b52; text-indent: 0; }
h4[data-anchor], h5[data-anchor] { text-indent: 0; }
li[data-anchor] { text-indent: 0; }
figure[data-anchor] { text-indent: 0; text-align: center; }
figure[data-anchor] img { max-width: 100%; height: auto; border-radius: 3px; }
footer.share-footer { margin-top: 60px; padding-top: 18px; border-top: 1px solid #e6e1d5; color: #9a958a; font-size: .78em; line-height: 1.8; }
@media (prefers-color-scheme: dark) {
  body { background: #1c1d1b; color: #d9d6cf; }
  main { background: #232420; }
  header.cover { border-color: #3a3b36; }
  footer.share-footer { border-color: #3a3b36; }
  blockquote[data-anchor] { border-color: #45463f; color: #b8b4aa; }
}
@media print {
  body { background: #fff; }
  main { max-width: none; padding: 0; }
  article.chapter { break-inside: auto; }
}
`

function anchorBlocks(html: string, chapterId: string): string[] {
  if (typeof DOMParser === 'undefined') {
    const text = html.replace(/<[^>]+>/g, '').trim()
    return text ? [`<p data-anchor="ch-${escapeHtml(chapterId)}-p-0">${escapeHtml(text)}</p>`] : []
  }
  const document = new DOMParser().parseFromString(`<div id="share-root">${html}</div>`, 'text/html')
  const root = document.getElementById('share-root')
  if (!root) return []
  let counter = 0
  const blocks: string[] = []
  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase()
    if (tag === 'ul' || tag === 'ol') {
      const items: string[] = []
      for (const item of Array.from(child.querySelectorAll('li'))) {
        items.push(`<li data-anchor="ch-${escapeHtml(chapterId)}-p-${counter}">${item.innerHTML}</li>`)
        counter += 1
      }
      blocks.push(`<${tag}>${items.join('')}</${tag}>`)
      continue
    }
    blocks.push(`<${tag} data-anchor="ch-${escapeHtml(chapterId)}-p-${counter}">${child.innerHTML}</${tag}>`)
    counter += 1
  }
  return blocks
}

export function buildShareDraftHtml(project: ProjectState, chapters: Chapter[], options: { includeVolumes?: boolean } = {}): string {
  const includeVolumes = options.includeVolumes !== false
  const sections: string[] = []
  const orderedVolumes = includeVolumes ? project.volumes : []
  const rendered = new Set<string>()

  const renderChapter = (chapter: Chapter) => {
    rendered.add(chapter.id)
    const blocks = anchorBlocks(chapter.content, chapter.id)
    return `<article class="chapter" id="ch-${escapeHtml(chapter.id)}"><h3>${escapeHtml(chapter.title)}</h3>${blocks.join('\n') || '<p data-anchor="ch-' + escapeHtml(chapter.id) + '-p-0"></p>'}</article>`
  }

  if (includeVolumes) {
    for (const volume of orderedVolumes) {
      sections.push(`<h2 class="volume">${escapeHtml(volume.title)}</h2>`)
      for (const chapter of chapters.filter((item) => item.volumeId === volume.id)) sections.push(renderChapter(chapter))
    }
  }
  const rest = chapters.filter((chapter) => !rendered.has(chapter.id))
  if (rest.length > 0) {
    if (includeVolumes && orderedVolumes.length > 0) sections.push('<h2 class="volume">未分卷</h2>')
    for (const chapter of rest) sections.push(renderChapter(chapter))
  }

  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.plainText.replace(/\s/g, '').length, 0)
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(project.title)} · 分享稿</title>
<style>${SHARE_STYLE}</style>
</head>
<body>
<main>
<header class="cover">
<h1>${escapeHtml(project.title)}</h1>
<p>只读分享稿 · ${chapters.length} 章 · 约 ${totalWords.toLocaleString()} 字 · 导出于 ${new Date().toLocaleDateString()}</p>
</header>
${sections.join('\n')}
<footer class="share-footer">
<p>这是只读分享稿，无法直接编辑正文。如需批注，请记录段落锚点（右键检查元素可见 <code>data-anchor</code>），按 <code>.zilicomments.json</code> 格式回传：chapterId、anchor、quote、comment、author、createdAt。</p>
</footer>
</main>
</body>
</html>`
}

export function parseCommentBundle(raw: string): CommentBundle {
  const parsed = JSON.parse(raw) as Partial<CommentBundle> | null
  if (!parsed || typeof parsed !== 'object') throw new Error('批注文件格式无法识别')
  const comments = Array.isArray(parsed.comments) ? parsed.comments : []
  const normalized: ShareComment[] = comments
    .filter((item): item is ShareComment => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      chapterId: typeof item.chapterId === 'string' ? item.chapterId : '',
      anchor: typeof item.anchor === 'string' ? item.anchor : '',
      quote: typeof item.quote === 'string' ? item.quote : '',
      comment: typeof item.comment === 'string' ? item.comment : '',
      author: typeof item.author === 'string' ? item.author : '匿名读者',
      createdAt: Number(item.createdAt) || Date.now(),
    }))
    .filter((item) => item.comment.trim())
  if (normalized.length === 0) throw new Error('批注文件里没有有效批注')
  return {
    version: 1,
    projectId: typeof parsed.projectId === 'string' ? parsed.projectId : '',
    projectTitle: typeof parsed.projectTitle === 'string' ? parsed.projectTitle : '',
    comments: normalized,
  }
}