import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webDelete, webList, webPut } from './webDatabase'

export type AdvancedAiToolKind = 'voice' | 'relationship' | 'reader' | 'research' | 'plan' | 'plot' | 'pacing' | 'debts' | 'recap'

export type AdvancedAiRecord = {
  id: string
  projectId: string
  kind: AdvancedAiToolKind
  chapterId: string | null
  sceneId: string | null
  title: string
  inputJson: string
  outputJson: string
  createdAt: number
  updatedAt: number
}

export type ResearchSourceCard = {
  id: string
  projectId: string
  title: string
  url: string
  excerpt: string
  notes: string
  verified: boolean
  createdAt: number
  updatedAt: number
}

export type AdvancedAiWorkspace = {
  records: AdvancedAiRecord[]
  sources: ResearchSourceCard[]
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function loadAdvancedAiWorkspace(projectId: string): Promise<AdvancedAiWorkspace> {
  if (!isTauri()) {
    const [records, sources] = await Promise.all([
      webList<AdvancedAiRecord>('advancedAiRecords', { projectId }),
      webList<ResearchSourceCard>('researchSources', { projectId }),
    ])
    return {
      records: records.sort((left, right) => right.updatedAt - left.updatedAt),
      sources: sources.sort((left, right) => right.updatedAt - left.updatedAt),
    }
  }
  const database = await getDatabase()
  const [records, sources] = await Promise.all([
    database.select<Array<{
      id: string; project_id: string; kind: AdvancedAiToolKind; chapter_id: string | null; scene_id: string | null
      title: string; input_json: string; output_json: string; created_at: number; updated_at: number
    }>>('SELECT id, project_id, kind, chapter_id, scene_id, title, input_json, output_json, created_at, updated_at FROM advanced_ai_records WHERE project_id = $1 ORDER BY updated_at DESC LIMIT 100', [projectId]),
    database.select<Array<{
      id: string; project_id: string; title: string; url: string; excerpt: string; notes: string; verified: number; created_at: number; updated_at: number
    }>>('SELECT id, project_id, title, url, excerpt, notes, verified, created_at, updated_at FROM research_source_cards WHERE project_id = $1 ORDER BY updated_at DESC', [projectId]),
  ])
  return {
    records: records.map((record) => ({
      id: record.id, projectId: record.project_id, kind: record.kind, chapterId: record.chapter_id, sceneId: record.scene_id,
      title: record.title, inputJson: record.input_json, outputJson: record.output_json, createdAt: record.created_at, updatedAt: record.updated_at,
    })),
    sources: sources.map((source) => ({
      id: source.id, projectId: source.project_id, title: source.title, url: source.url, excerpt: source.excerpt,
      notes: source.notes, verified: Boolean(source.verified), createdAt: source.created_at, updatedAt: source.updated_at,
    })),
  }
}

export async function saveAdvancedAiRecord(record: AdvancedAiRecord): Promise<void> {
  if (!isTauri()) {
    await webPut('advancedAiRecords', record.id, record, { projectId: record.projectId, updatedAt: record.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO advanced_ai_records (id, project_id, kind, chapter_id, scene_id, title, input_json, output_json, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, input_json = excluded.input_json,
       output_json = excluded.output_json, updated_at = excluded.updated_at`,
    [record.id, record.projectId, record.kind, record.chapterId, record.sceneId, record.title, record.inputJson, record.outputJson, record.createdAt, record.updatedAt],
  )
}

export async function deleteAdvancedAiRecord(recordId: string): Promise<void> {
  if (!isTauri()) {
    await webDelete('advancedAiRecords', recordId)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM advanced_ai_records WHERE id = $1', [recordId])
}

export async function saveResearchSourceCard(source: ResearchSourceCard): Promise<void> {
  if (!isTauri()) {
    await webPut('researchSources', source.id, source, { projectId: source.projectId, updatedAt: source.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO research_source_cards (id, project_id, title, url, excerpt, notes, verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, url = excluded.url, excerpt = excluded.excerpt,
       notes = excluded.notes, verified = excluded.verified, updated_at = excluded.updated_at`,
    [source.id, source.projectId, source.title, source.url, source.excerpt, source.notes, source.verified ? 1 : 0, source.createdAt, source.updatedAt],
  )
}

export async function deleteResearchSourceCard(sourceId: string): Promise<void> {
  if (!isTauri()) {
    await webDelete('researchSources', sourceId)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM research_source_cards WHERE id = $1', [sourceId])
}
