import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webDeleteWhere, webList, webPut } from './webDatabase'

/**
 * 写作会话统计：只记录正文字数的增量，用于日更曲线、连续天数与各章耗时。
 * 不回溯历史，旧项目从启用后开始积累。
 */

export type WritingSession = {
  id: string
  projectId: string
  chapterId: string | null
  startedAt: number
  endedAt: number
  wordsAdded: number
  wordsRemoved: number
  activeMs: number
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function listWritingSessions(projectId: string, since = 0): Promise<WritingSession[]> {
  if (!isTauri()) {
    const rows = await webList<WritingSession>('writingSessions', { projectId })
    return rows.filter((row) => row.startedAt >= since).sort((left, right) => left.startedAt - right.startedAt)
  }
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string | null
    started_at: number
    ended_at: number
    words_added: number
    words_removed: number
    active_ms: number
  }>>(
    'SELECT id, project_id, chapter_id, started_at, ended_at, words_added, words_removed, active_ms FROM writing_sessions WHERE project_id = $1 AND started_at >= $2 ORDER BY started_at ASC',
    [projectId, since],
  )
  return rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    chapterId: row.chapter_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    wordsAdded: row.words_added,
    wordsRemoved: row.words_removed,
    activeMs: row.active_ms,
  }))
}

export async function upsertWritingSession(session: WritingSession): Promise<void> {
  if (!isTauri()) {
    await webPut('writingSessions', session.id, session, { projectId: session.projectId })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO writing_sessions (id, project_id, chapter_id, started_at, ended_at, words_added, words_removed, active_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT(id) DO UPDATE SET
       ended_at = excluded.ended_at,
       words_added = excluded.words_added,
       words_removed = excluded.words_removed,
       active_ms = excluded.active_ms,
       chapter_id = excluded.chapter_id`,
    [session.id, session.projectId, session.chapterId, session.startedAt, session.endedAt, session.wordsAdded, session.wordsRemoved, session.activeMs],
  )
}

export async function clearWritingSessions(projectId: string): Promise<void> {
  if (!isTauri()) {
    await webDeleteWhere<WritingSession>('writingSessions', (session) => session.projectId === projectId)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM writing_sessions WHERE project_id = $1', [projectId])
}

export type DailyWritingStat = {
  date: string
  added: number
  removed: number
  activeMs: number
  chapterCount: number
}

export type ChapterWritingTotal = {
  chapterId: string
  added: number
  removed: number
  activeMs: number
}

export type WritingStatsSummary = {
  todayAdded: number
  weekAdded: number
  monthAdded: number
  totalAdded: number
  totalRemoved: number
  totalActiveMs: number
  streakDays: number
  days: DailyWritingStat[]
  chapterTotals: ChapterWritingTotal[]
  sessionCount: number
}

function dayKey(timestamp: number) {
  const date = new Date(timestamp)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function emptyWritingStats(days = 30, now = Date.now()): WritingStatsSummary {
  const buckets: DailyWritingStat[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    buckets.push({ date: dayKey(now - offset * 86_400_000), added: 0, removed: 0, activeMs: 0, chapterCount: 0 })
  }
  return {
    todayAdded: 0,
    weekAdded: 0,
    monthAdded: 0,
    totalAdded: 0,
    totalRemoved: 0,
    totalActiveMs: 0,
    streakDays: 0,
    days: buckets,
    chapterTotals: [],
    sessionCount: 0,
  }
}

export function aggregateWritingStats(sessions: WritingSession[], options: { days?: number; now?: number } = {}): WritingStatsSummary {
  const days = Math.max(7, Math.min(90, options.days ?? 30))
  const now = options.now ?? Date.now()
  const summary = emptyWritingStats(days, now)
  const byDate = new Map(summary.days.map((day) => [day.date, day]))
  const byChapter = new Map<string, ChapterWritingTotal>()
  const chaptersByDate = new Map<string, Set<string>>()

  for (const session of sessions) {
    const key = dayKey(session.startedAt)
    const day = byDate.get(key)
    const chapterSet = chaptersByDate.get(key) ?? new Set<string>()
    if (session.chapterId) chapterSet.add(session.chapterId)
    chaptersByDate.set(key, chapterSet)
    if (day) {
      day.added += session.wordsAdded
      day.removed += session.wordsRemoved
      day.activeMs += session.activeMs
    }
    if (session.chapterId) {
      const total = byChapter.get(session.chapterId) ?? { chapterId: session.chapterId, added: 0, removed: 0, activeMs: 0 }
      total.added += session.wordsAdded
      total.removed += session.wordsRemoved
      total.activeMs += session.activeMs
      byChapter.set(session.chapterId, total)
    }
    summary.totalAdded += session.wordsAdded
    summary.totalRemoved += session.wordsRemoved
    summary.totalActiveMs += session.activeMs
    summary.sessionCount += 1
  }

  for (const day of summary.days) {
    day.chapterCount = chaptersByDate.get(day.date)?.size ?? 0
  }

  const last = summary.days[summary.days.length - 1]
  summary.todayAdded = last?.added ?? 0
  summary.weekAdded = summary.days.slice(-7).reduce((total, day) => total + day.added, 0)
  summary.monthAdded = summary.days.reduce((total, day) => total + day.added, 0)

  // 连续写作天数：从今天往前数；今天还没写不算断，从昨天开始算。
  let streak = 0
  for (let index = summary.days.length - 1; index >= 0; index -= 1) {
    const day = summary.days[index]
    if (day.added > 0) {
      streak += 1
      continue
    }
    if (index === summary.days.length - 1) continue
    break
  }
  summary.streakDays = streak
  summary.chapterTotals = [...byChapter.values()].sort((left, right) => right.added - left.added)
  return summary
}