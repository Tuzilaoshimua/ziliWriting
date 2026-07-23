import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webList, webPut } from './webDatabase'

export type DraftMode = 'continue' | 'rewrite' | 'dialogue' | 'transition'
export type DraftStatus = 'candidate' | 'accepted' | 'rejected'

export type DraftValidation = {
  newFacts: string[]
  usedContext: string[]
  conflicts: string[]
  goalCoverage: string
  styleNotes: string[]
  overlapWarnings: string[]
}

export type DraftCandidate = {
  id: string
  projectId: string
  chapterId: string
  mode: DraftMode
  title: string
  text: string
  status: DraftStatus
  anchorFrom: number
  anchorTo: number
  sourceText: string
  taskJson: string
  validation: DraftValidation
  createdAt: number
  updatedAt: number
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function listDraftCandidates(projectId: string, chapterId: string): Promise<DraftCandidate[]> {
  if (!isTauri()) return (await webList<DraftCandidate>('draftCandidates', { parentId: chapterId })).filter((item) => item.projectId === projectId).sort((a, b) => b.createdAt - a.createdAt)
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string
    mode: DraftMode
    title: string
    text: string
    status: DraftStatus
    anchor_from: number
    anchor_to: number
    source_text: string
    task_json: string
    validation_json: string
    created_at: number
    updated_at: number
  }>>('SELECT id, project_id, chapter_id, mode, title, text, status, anchor_from, anchor_to, source_text, task_json, validation_json, created_at, updated_at FROM ai_text_candidates WHERE project_id = $1 AND chapter_id = $2 ORDER BY created_at DESC', [projectId, chapterId])
  return rows.map((row) => {
    let validation: DraftValidation = { newFacts: [], usedContext: [], conflicts: [], goalCoverage: '', styleNotes: [], overlapWarnings: [] }
    try { validation = JSON.parse(row.validation_json) as DraftValidation } catch { /* keep fallback */ }
    return {
      id: row.id,
      projectId: row.project_id,
      chapterId: row.chapter_id,
      mode: row.mode,
      title: row.title,
      text: row.text,
      status: row.status,
      anchorFrom: row.anchor_from,
      anchorTo: row.anchor_to,
      sourceText: row.source_text,
      taskJson: row.task_json,
      validation,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  })
}

export async function saveDraftCandidate(candidate: DraftCandidate): Promise<void> {
  if (!isTauri()) {
    await webPut('draftCandidates', candidate.id, candidate, { projectId: candidate.projectId, parentId: candidate.chapterId, updatedAt: candidate.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO ai_text_candidates (id, project_id, chapter_id, mode, title, text, status, anchor_from, anchor_to, source_text, task_json, validation_json, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, text = excluded.text, status = excluded.status,
       task_json = excluded.task_json, validation_json = excluded.validation_json, updated_at = excluded.updated_at`,
    [candidate.id, candidate.projectId, candidate.chapterId, candidate.mode, candidate.title, candidate.text, candidate.status, candidate.anchorFrom, candidate.anchorTo, candidate.sourceText, candidate.taskJson, JSON.stringify(candidate.validation), candidate.createdAt, candidate.updatedAt],
  )
}
