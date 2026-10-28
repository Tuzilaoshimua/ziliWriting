import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { BookOpenText, FileText, Layers, ListTree, Paperclip, Search, TextSearch, X } from 'lucide-react'
import type { ProjectState, Scene } from '../data/projectStorage'
import type { Attachment } from '../data/attachmentStorage'
import type { ReferenceText } from '../data/referenceStorage'
import type { ChapterMemoryBundle } from '../data/storyMemoryStorage'
import { MEMORY_KIND_LABELS } from '../ai/storyMemory'

type SearchScope = 'all' | 'chapters' | 'titles' | 'scenes' | 'memory' | 'files'

const SCOPE_OPTIONS: Array<{ value: SearchScope; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'chapters', label: '正文' },
  { value: 'titles', label: '标题' },
  { value: 'scenes', label: '场景' },
  { value: 'memory', label: '记忆' },
  { value: 'files', label: '资料' },
]

type ChapterSearchResult = {
  chapterId: string
  title: string
  volumeTitle: string
  chapterNumber: number
  count: number
  snippet: string
  needle: string
}

type TitleSearchResult = {
  kind: 'volume' | 'chapter' | 'scene'
  id: string
  title: string
  subtitle: string
  chapterId: string | null
  sceneId: string | null
}

type SceneSearchResult = {
  scene: Scene
  chapterTitle: string
  chapterNumber: number
  field: string
  snippet: string
}

type MemorySearchResult = {
  kind: string
  title: string
  detail: string
  snippet: string
  status: string
  chapterTitle: string
  chapterNumber: number
}

type FileSearchResult = {
  kind: 'reference' | 'attachment'
  id: string
  name: string
  extension: string
  scopeLabel: string
}

function HighlightSnippet({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>
  const lower = text.toLowerCase()
  const parts: ReactNode[] = []
  let cursor = 0
  let index = lower.indexOf(keyword)
  let guard = 0
  while (index >= 0 && guard < 24) {
    if (index > cursor) parts.push(<span key={`pre-${guard}`}>{text.slice(cursor, index)}</span>)
    parts.push(<mark key={`hit-${guard}`} className="search-hit">{text.slice(index, index + keyword.length)}</mark>)
    cursor = index + keyword.length
    index = lower.indexOf(keyword, cursor)
    guard += 1
  }
  if (cursor < text.length) parts.push(<span key="tail">{text.slice(cursor)}</span>)
  return <>{parts}</>
}

function boundedSnippet(text: string, matchIndex: number, matchLength: number, before = 30, after = 50): string {
  const lineStart = text.lastIndexOf('\n', matchIndex) + 1
  const lineEndRel = text.indexOf('\n', matchIndex)
  const lineEnd = lineEndRel === -1 ? text.length : lineEndRel
  let start = Math.max(lineStart, matchIndex - before)
  let end = Math.min(lineEnd, matchIndex + matchLength + after)
  return (start > lineStart ? '…' : '') + text.slice(start, end) + (end < lineEnd ? '…' : '')
}

function boundedNeedle(text: string, matchIndex: number, matchLength: number, before = 16, after = 16): string {
  const lineStart = text.lastIndexOf('\n', matchIndex) + 1
  const lineEndRel = text.indexOf('\n', matchIndex)
  const lineEnd = lineEndRel === -1 ? text.length : lineEndRel
  const start = Math.max(lineStart, matchIndex - before)
  const end = Math.min(lineEnd, matchIndex + matchLength + after)
  return text.slice(start, end).trim().slice(0, 80)
}

type GlobalSearchPanelProps = {
  project: ProjectState
  memories: ChapterMemoryBundle[]
  references: ReferenceText[]
  attachments: Attachment[]
  isClosing: boolean
  suppressEntry: boolean
  onClose: () => void
  onJumpToChapter: (chapterId: string, needle?: string) => void
  onOpenScene: (sceneId: string) => void
  onOpenMemory: (title: string) => void
  onOpenReferences: () => void
  onOpenAttachments: () => void
}

export function GlobalSearchPanel({
  project,
  memories,
  references,
  attachments,
  isClosing,
  suppressEntry,
  onClose,
  onJumpToChapter,
  onOpenScene,
  onOpenMemory,
  onOpenReferences,
  onOpenAttachments,
}: GlobalSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('all')
  const deferredQuery = useDeferredValue(query)
  const keyword = deferredQuery.trim().toLowerCase()

  const volumeTitleById = useMemo(() => new Map(project.volumes.map((volume) => [volume.id, volume.title])), [project.volumes])
  const chapterIndexById = useMemo(() => new Map(project.chapters.map((chapter, index) => [chapter.id, index])), [project.chapters])
  const chapterTitleById = useMemo(() => new Map(project.chapters.map((chapter) => [chapter.id, chapter.title])), [project.chapters])

  const chapterResults = useMemo<ChapterSearchResult[]>(() => {
    if (!keyword) return []
    const results: ChapterSearchResult[] = []
    for (const chapter of project.chapters) {
      const text = chapter.plainText
      if (!text) continue
      const lower = text.toLowerCase()
      const matches: number[] = []
      let from = 0
      while (matches.length < 500) {
        const index = lower.indexOf(keyword, from)
        if (index < 0) break
        matches.push(index)
        from = index + keyword.length
      }
      if (matches.length === 0) continue
      const first = matches[0]
      results.push({
        chapterId: chapter.id,
        title: chapter.title,
        volumeTitle: volumeTitleById.get(chapter.volumeId) ?? '',
        chapterNumber: (chapterIndexById.get(chapter.id) ?? 0) + 1,
        count: matches.length,
        snippet: boundedSnippet(text, first, keyword.length),
        needle: boundedNeedle(text, first, keyword.length) || keyword,
      })
    }
    return results
  }, [chapterIndexById, keyword, project.chapters, volumeTitleById])

  const titleResults = useMemo<TitleSearchResult[]>(() => {
    if (!keyword) return []
    const results: TitleSearchResult[] = []
    for (const volume of project.volumes) {
      if (volume.title.toLowerCase().includes(keyword)) {
        const firstChapter = project.chapters.find((chapter) => chapter.volumeId === volume.id)
        results.push({ kind: 'volume', id: volume.id, title: volume.title, subtitle: '卷', chapterId: firstChapter?.id ?? null, sceneId: null })
      }
    }
    for (const chapter of project.chapters) {
      if (chapter.title.toLowerCase().includes(keyword)) {
        results.push({
          kind: 'chapter',
          id: chapter.id,
          title: chapter.title,
          subtitle: `${volumeTitleById.get(chapter.volumeId) ?? ''} · 第 ${(chapterIndexById.get(chapter.id) ?? 0) + 1} 章`,
          chapterId: chapter.id,
          sceneId: null,
        })
      }
    }
    for (const scene of project.scenes) {
      if (scene.title.toLowerCase().includes(keyword)) {
        results.push({
          kind: 'scene',
          id: scene.id,
          title: scene.title,
          subtitle: `${chapterTitleById.get(scene.chapterId) ?? ''} · 场景`,
          chapterId: scene.chapterId,
          sceneId: scene.id,
        })
      }
    }
    return results
  }, [chapterIndexById, chapterTitleById, keyword, project.chapters, project.scenes, project.volumes, volumeTitleById])

  const sceneResults = useMemo<SceneSearchResult[]>(() => {
    if (!keyword) return []
    const results: SceneSearchResult[] = []
    for (const scene of project.scenes) {
      const fields: Array<[string, string]> = [
        ['标题', scene.title],
        ['目标', scene.goal],
        ['备注', scene.notes],
        ['摘要', scene.summary],
      ]
      for (const [label, value] of fields) {
        if (!value) continue
        const lower = value.toLowerCase()
        const index = lower.indexOf(keyword)
        if (index < 0) continue
        results.push({
          scene,
          chapterTitle: chapterTitleById.get(scene.chapterId) ?? '',
          chapterNumber: (chapterIndexById.get(scene.chapterId) ?? 0) + 1,
          field: label,
          snippet: boundedSnippet(value, index, keyword.length, 20, 34),
        })
        break
      }
    }
    return results
  }, [chapterIndexById, chapterTitleById, keyword, project.scenes])

  const memoryResults = useMemo<MemorySearchResult[]>(() => {
    if (!keyword) return []
    const results: MemorySearchResult[] = []
    for (const bundle of memories) {
      const chapterId = bundle.memory?.chapterId ?? bundle.candidates[0]?.chapterId
      if (!chapterId) continue
      const chapterTitle = chapterTitleById.get(chapterId) ?? ''
      const chapterNumber = (chapterIndexById.get(chapterId) ?? 0) + 1
      for (const candidate of bundle.candidates) {
        if (candidate.status !== 'confirmed' && candidate.status !== 'archived' && candidate.status !== 'stale') continue
        const fields: Array<[string, string]> = [
          ['标题', candidate.title],
          ['详情', candidate.detail],
          ['证据', candidate.evidenceQuote],
        ]
        for (const [label, value] of fields) {
          if (!value) continue
          const index = value.toLowerCase().indexOf(keyword)
          if (index < 0) continue
          results.push({
            kind: MEMORY_KIND_LABELS[candidate.kind],
            title: candidate.title,
            detail: candidate.detail,
            snippet: boundedSnippet(value, index, keyword.length, 16, 26),
            status: label,
            chapterTitle,
            chapterNumber,
          })
          break
        }
      }
      if (bundle.memory && bundle.memory.summary.toLowerCase().includes(keyword)) {
        const index = bundle.memory.summary.toLowerCase().indexOf(keyword)
        results.push({
          kind: '本章摘要',
          title: '章节摘要',
          detail: '',
          snippet: boundedSnippet(bundle.memory.summary, index, keyword.length, 16, 26),
          status: 'summary',
          chapterTitle,
          chapterNumber,
        })
      }
    }
    return results
  }, [chapterIndexById, chapterTitleById, keyword, memories])

  const fileResults = useMemo<FileSearchResult[]>(() => {
    if (!keyword) return []
    const results: FileSearchResult[] = []
    for (const reference of references) {
      if (reference.fileName.toLowerCase().includes(keyword)) {
        results.push({ kind: 'reference', id: reference.id, name: reference.fileName, extension: reference.extension, scopeLabel: '参考文本' })
      }
    }
    for (const attachment of attachments) {
      if (attachment.fileName.toLowerCase().includes(keyword)) {
        results.push({ kind: 'attachment', id: attachment.id, name: attachment.fileName, extension: attachment.extension, scopeLabel: '附件资料' })
      }
    }
    return results
  }, [attachments, keyword, references])

  const totalCount = chapterResults.length + titleResults.length + sceneResults.length + memoryResults.length + fileResults.length

  const visibleChapters = scope === 'all' || scope === 'chapters'
  const visibleTitles = scope === 'all' || scope === 'titles'
  const visibleScenes = scope === 'all' || scope === 'scenes'
  const visibleMemory = scope === 'all' || scope === 'memory'
  const visibleFiles = scope === 'all' || scope === 'files'

  return (
    <aside className={`asset-panel search-panel ${isClosing ? 'is-closing' : ''} ${suppressEntry ? 'suppress-entry' : ''}`} aria-label="全书检索">
      <div className="assistant-header">
        <div><TextSearch size={17} /><strong>全书检索</strong></div>
        <button className="icon-button small" onClick={onClose} title="关闭全书检索"><X size={17} /></button>
      </div>
      <div className="search-input-wrap">
        <label className="search-box">
          <Search size={15} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="检索全书正文、场景、记忆与资料" onKeyDown={(event) => { if (event.key === 'Escape') onClose() }} />
        </label>
        {query && <button className="search-clear" title="清空关键词" onClick={() => setQuery('')}><X size={14} /></button>}
      </div>
      <div className="search-scope-row" role="group" aria-label="检索范围">
        {SCOPE_OPTIONS.map((option) => (
          <button key={option.value} className={`search-scope-chip ${scope === option.value ? 'active' : ''}`} onClick={() => setScope(option.value)}>{option.label}</button>
        ))}
      </div>
      <div className="search-results">
        {!keyword && <p className="search-empty">输入关键词，检索全书正文、章节与场景标题、场景规划、故事记忆，以及参考文本和附件资料的文件名。</p>}
        {keyword && totalCount === 0 && <p className="search-empty">没有找到与「{deferredQuery.trim()}」相关的内容。</p>}
        {keyword && totalCount > 0 && <p className="search-summary">共找到 {totalCount} 处结果</p>}

        {visibleChapters && chapterResults.length > 0 && (
          <section className="search-section">
            <div className="search-section-heading"><span><FileText size={13} />正文</span><small>{chapterResults.length} 章</small></div>
            {chapterResults.map((result) => (
              <button key={`chapter-${result.chapterId}`} className="search-result-row" onClick={() => onJumpToChapter(result.chapterId, result.needle)}>
                <span className="search-result-title"><FileText size={14} /><strong>{result.title || '未命名章节'}</strong><small>{result.volumeTitle} · 第 {result.chapterNumber} 章 · {result.count} 处</small></span>
                <span className="search-result-snippet"><HighlightSnippet text={result.snippet} keyword={keyword} /></span>
              </button>
            ))}
          </section>
        )}

        {visibleTitles && titleResults.length > 0 && (
          <section className="search-section">
            <div className="search-section-heading"><span><Layers size={13} />标题</span><small>{titleResults.length} 处</small></div>
            {titleResults.map((result) => (
              <button key={`title-${result.kind}-${result.id}`} className="search-result-row" onClick={() => {
                if (result.kind === 'scene' && result.sceneId) onOpenScene(result.sceneId)
                else if (result.chapterId) onJumpToChapter(result.chapterId)
              }}>
                <span className="search-result-title">{result.kind === 'volume' ? <Layers size={14} /> : result.kind === 'scene' ? <ListTree size={14} /> : <FileText size={14} />}<strong>{result.title}</strong><small>{result.subtitle}</small></span>
              </button>
            ))}
          </section>
        )}

        {visibleScenes && sceneResults.length > 0 && (
          <section className="search-section">
            <div className="search-section-heading"><span><ListTree size={13} />场景规划</span><small>{sceneResults.length} 处</small></div>
            {sceneResults.map((result) => (
              <button key={`scene-${result.scene.id}`} className="search-result-row" onClick={() => onOpenScene(result.scene.id)}>
                <span className="search-result-title"><ListTree size={14} /><strong>{result.scene.title || '未命名场景'}</strong><small>{result.chapterTitle} · 第 {result.chapterNumber} 章 · {result.field}</small></span>
                <span className="search-result-snippet"><HighlightSnippet text={result.snippet} keyword={keyword} /></span>
              </button>
            ))}
          </section>
        )}

        {visibleMemory && memoryResults.length > 0 && (
          <section className="search-section">
            <div className="search-section-heading"><span><BookOpenText size={13} />故事记忆</span><small>{memoryResults.length} 条</small></div>
            {memoryResults.map((result, index) => (
              <button key={`memory-${index}`} className="search-result-row" onClick={() => onOpenMemory(result.title)}>
                <span className="search-result-title"><BookOpenText size={14} /><strong>{result.title}</strong><small>{result.kind} · {result.chapterTitle} · 第 {result.chapterNumber} 章</small></span>
                <span className="search-result-snippet"><HighlightSnippet text={result.snippet} keyword={keyword} /></span>
              </button>
            ))}
          </section>
        )}

        {visibleFiles && fileResults.length > 0 && (
          <section className="search-section">
            <div className="search-section-heading"><span><Paperclip size={13} />资料</span><small>{fileResults.length} 个文件</small></div>
            {fileResults.map((result) => (
              <button key={`file-${result.kind}-${result.id}`} className="search-result-row" onClick={() => result.kind === 'reference' ? onOpenReferences() : onOpenAttachments()}>
                <span className="search-result-title">{result.kind === 'reference' ? <BookOpenText size={14} /> : <Paperclip size={14} />}<strong>{result.name}</strong><small>{result.scopeLabel} · {result.extension.toUpperCase()}</small></span>
              </button>
            ))}
          </section>
        )}
      </div>
    </aside>
  )
}
