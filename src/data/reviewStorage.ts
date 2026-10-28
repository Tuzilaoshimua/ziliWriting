import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webDeleteWhere, webList, webPut } from './webDatabase'

export type ReviewCategory = 'character' | 'timeline' | 'knowledge' | 'world' | 'motivation' | 'repetition' | 'pacing' | 'foreshadowing' | 'ai_fact' | 'prose'
export type ReviewSeverity = 'info' | 'warning' | 'error'
export type ReviewStatus = 'open' | 'confirmed' | 'resolved' | 'dismissed'
export type ReviewSource = 'automatic' | 'selection_review' | 'scene_review' | 'chapter_review' | 'range_review' | 'project_review' | 'memory_consistency'

export type ReviewEvidence = {
  chapterId: string
  chapterTitle: string
  sceneId?: string
  nodeId: string
  quote: string
  revisionNumber?: number
  startOffsetInNode?: number
  endOffsetInNode?: number
  role?: 'support' | 'contradict' | 'context'
}

export type ReviewIssue = {
  id: string
  projectId: string
  chapterId: string | null
  category: ReviewCategory
  severity: ReviewSeverity
  status: ReviewStatus
  source: ReviewSource
  title: string
  detail: string
  suggestion: string
  evidence: ReviewEvidence[]
  contentHash: string
  createdAt: number
  updatedAt: number
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function listReviewIssues(projectId: string): Promise<ReviewIssue[]> {
  if (!isTauri()) return (await webList<ReviewIssue>('reviewIssues', { projectId })).sort((a, b) => b.updatedAt - a.updatedAt)
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string | null
    category: ReviewCategory
    severity: ReviewSeverity
    status: ReviewStatus
    source: ReviewSource
    title: string
    detail: string
    suggestion: string
    evidence_json: string
    content_hash: string
    created_at: number
    updated_at: number
  }>>('SELECT id, project_id, chapter_id, category, severity, status, source, title, detail, suggestion, evidence_json, content_hash, created_at, updated_at FROM review_issues WHERE project_id = $1 ORDER BY updated_at DESC', [projectId])
  return rows.map((row) => {
    let evidence: ReviewEvidence[] = []
    try { evidence = JSON.parse(row.evidence_json) as ReviewEvidence[] } catch { evidence = [] }
    return {
      id: row.id,
      projectId: row.project_id,
      chapterId: row.chapter_id,
      category: row.category,
      severity: row.severity,
      status: row.status,
      source: row.source,
      title: row.title,
      detail: row.detail,
      suggestion: row.suggestion,
      evidence,
      contentHash: row.content_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  })
}

export async function replaceReviewIssues(projectId: string, chapterId: string | null, source: ReviewSource, issues: ReviewIssue[]): Promise<void> {
  if (!isTauri()) {
    await webDeleteWhere<ReviewIssue>('reviewIssues', (issue) => issue.projectId === projectId && issue.chapterId === chapterId && issue.source === source && issue.status === 'open')
    await Promise.all(issues.map((issue) => webPut('reviewIssues', issue.id, issue, { projectId: issue.projectId, parentId: issue.chapterId, updatedAt: issue.updatedAt })))
    return
  }
  const database = await getDatabase()
  if (chapterId) await database.execute("DELETE FROM review_issues WHERE project_id = $1 AND chapter_id = $2 AND source = $3 AND status = 'open'", [projectId, chapterId, source])
  else await database.execute("DELETE FROM review_issues WHERE project_id = $1 AND chapter_id IS NULL AND source = $2 AND status = 'open'", [projectId, source])
  for (const issue of issues) await saveReviewIssue(issue)
}

export async function saveReviewIssue(issue: ReviewIssue): Promise<void> {
  if (!isTauri()) {
    await webPut('reviewIssues', issue.id, issue, { projectId: issue.projectId, parentId: issue.chapterId, updatedAt: issue.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO review_issues (id, project_id, chapter_id, category, severity, status, source, title, detail, suggestion, evidence_json, content_hash, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status, title = excluded.title, detail = excluded.detail,
       suggestion = excluded.suggestion, evidence_json = excluded.evidence_json, content_hash = excluded.content_hash,
       updated_at = excluded.updated_at`,
    [issue.id, issue.projectId, issue.chapterId, issue.category, issue.severity, issue.status, issue.source, issue.title, issue.detail, issue.suggestion, JSON.stringify(issue.evidence), issue.contentHash, issue.createdAt, issue.updatedAt],
  )
}
