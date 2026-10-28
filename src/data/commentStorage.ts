import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webDeleteWhere, webList, webPut } from './webDatabase'

export type ChapterComment = {
  id: string
  projectId: string
  chapterId: string
  anchor: string
  quote: string
  comment: string
  author: string
  createdAt: number
  resolved: boolean
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

type Row = {
  id: string
  project_id: string
  chapter_id: string
  anchor: string
  quote: string
  comment: string
  author: string
  created_at: number
  resolved: number
}

function toComment(row: Row): ChapterComment {
  return {
    id: row.id,
    projectId: row.project_id,
    chapterId: row.chapter_id,
    anchor: row.anchor,
    quote: row.quote,
    comment: row.comment,
    author: row.author,
    createdAt: row.created_at,
    resolved: row.resolved === 1,
  }
}

export async function listChapterComments(projectId: string): Promise<ChapterComment[]> {
  if (!isTauri()) {
    const rows = await webList<ChapterComment>('chapterComments', { projectId })
    return rows.sort((left, right) => left.createdAt - right.createdAt)
  }
  const database = await getDatabase()
  const rows = await database.select<Row[]>(
    'SELECT id, project_id, chapter_id, anchor, quote, comment, author, created_at, resolved FROM chapter_comments WHERE project_id = $1 ORDER BY created_at ASC',
    [projectId],
  )
  return rows.map(toComment)
}

export async function replaceChapterComments(projectId: string, comments: ChapterComment[]): Promise<void> {
  if (!isTauri()) {
    await webDeleteWhere<ChapterComment>('chapterComments', (value) => value.projectId === projectId)
    for (const comment of comments) await webPut('chapterComments', comment.id, comment, { projectId })
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM chapter_comments WHERE project_id = $1', [projectId])
  for (const comment of comments) {
    await database.execute(
      'INSERT INTO chapter_comments (id, project_id, chapter_id, anchor, quote, comment, author, created_at, resolved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [comment.id, projectId, comment.chapterId, comment.anchor, comment.quote, comment.comment, comment.author, comment.createdAt, comment.resolved ? 1 : 0],
    )
  }
}

export async function upsertChapterComment(comment: ChapterComment): Promise<void> {
  if (!isTauri()) {
    await webPut('chapterComments', comment.id, comment, { projectId: comment.projectId })
    return
  }
  const database = await getDatabase()
  await database.execute(
    'INSERT INTO chapter_comments (id, project_id, chapter_id, anchor, quote, comment, author, created_at, resolved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT(id) DO UPDATE SET resolved = $9',
    [comment.id, comment.projectId, comment.chapterId, comment.anchor, comment.quote, comment.comment, comment.author, comment.createdAt, comment.resolved ? 1 : 0],
  )
}

export async function deleteChapterComment(id: string): Promise<void> {
  if (!isTauri()) {
    await webDeleteWhere<ChapterComment>('chapterComments', (value) => value.id === id)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM chapter_comments WHERE id = $1', [id])
}

export async function clearChapterComments(projectId: string): Promise<void> {
  if (!isTauri()) {
    await webDeleteWhere<ChapterComment>('chapterComments', (value) => value.projectId === projectId)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM chapter_comments WHERE project_id = $1', [projectId])
}