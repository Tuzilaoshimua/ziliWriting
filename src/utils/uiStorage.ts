const EDITOR_VIEW_KEY = 'zili-writing-editor-view-v1'

export type StoredEditorView = { from: number; to: number; scrollTop: number }

export function loadEditorViews(): Record<string, StoredEditorView> {
  try {
    return JSON.parse(localStorage.getItem(EDITOR_VIEW_KEY) || '{}') as Record<string, StoredEditorView>
  } catch {
    return {}
  }
}

export function saveEditorView(chapterId: string, update: Partial<StoredEditorView>) {
  const views = loadEditorViews()
  const previous = views[chapterId]
  views[chapterId] = {
    from: update.from ?? previous?.from ?? 1,
    to: update.to ?? previous?.to ?? 1,
    scrollTop: update.scrollTop ?? previous?.scrollTop ?? 0,
  }
  const entries = Object.entries(views)
  if (entries.length > 500) delete views[entries[0][0]]
  localStorage.setItem(EDITOR_VIEW_KEY, JSON.stringify(views))
}

export function scheduleIdleTask(task: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 1500 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(task, 80)
  return () => window.clearTimeout(id)
}

export function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function formatStorageBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function aiProgressLabel(taskType: string) {
  if (taskType === 'chapter_memory') return '故事资料提取'
  if (taskType === 'chapter_memory_summary') return '章节摘要'
  if (taskType.startsWith('chapter_memory')) return '故事记忆'
  if (taskType.startsWith('writing_agent')) return '字里助手'
  if (taskType === 'project_qa') return '作品问答'
  return 'AI 任务'
}
