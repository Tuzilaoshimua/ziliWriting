import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import type { AiProviderId } from '../ai/settings'
import { webDeleteWhere, webList, webPut } from './webDatabase'

export type AiUsageRecord = {
  id: string
  projectId: string | null
  taskType: string
  promptVersion: string
  providerId: AiProviderId
  model: string
  promptTokens: number | null
  completionTokens: number | null
  latencyMs: number
  success: boolean
  errorCode: number | null
  createdAt: number
}

export type AiUsageSummary = {
  requests: number
  successful: number
  promptTokens: number
  completionTokens: number
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function recordAiUsage(record: AiUsageRecord): Promise<void> {
  if (!isTauri()) {
    await webPut('aiUsage', record.id, record, { projectId: record.projectId, updatedAt: record.createdAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO ai_usage_logs (id, project_id, task_type, prompt_version, provider_id, model, prompt_tokens, completion_tokens, latency_ms, success, error_code, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [record.id, record.projectId, record.taskType, record.promptVersion, record.providerId, record.model, record.promptTokens, record.completionTokens, record.latencyMs, record.success ? 1 : 0, record.errorCode, record.createdAt],
  )
}

export async function getAiUsageSummary(projectId?: string, since?: number): Promise<AiUsageSummary> {
  if (!isTauri()) {
    const records = (await webList<AiUsageRecord>('aiUsage')).filter((record) => (!projectId || record.projectId === projectId) && (!since || record.createdAt >= since))
    return records.reduce((summary, record) => ({
      requests: summary.requests + 1,
      successful: summary.successful + (record.success ? 1 : 0),
      promptTokens: summary.promptTokens + (record.promptTokens ?? 0),
      completionTokens: summary.completionTokens + (record.completionTokens ?? 0),
    }), { requests: 0, successful: 0, promptTokens: 0, completionTokens: 0 })
  }
  const database = await getDatabase()
  const filters: string[] = []
  const parameters: Array<string | number> = []
  if (projectId) {
    parameters.push(projectId)
    filters.push(`project_id = $${parameters.length}`)
  }
  if (since) {
    parameters.push(since)
    filters.push(`created_at >= $${parameters.length}`)
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const rows = await database.select<Array<{ requests: number; successful: number; prompt_tokens: number; completion_tokens: number }>>(
    `SELECT COUNT(*) AS requests, COALESCE(SUM(success), 0) AS successful, COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens, COALESCE(SUM(completion_tokens), 0) AS completion_tokens FROM ai_usage_logs ${where}`,
    parameters,
  )
  const row = rows[0]
  return { requests: row?.requests ?? 0, successful: row?.successful ?? 0, promptTokens: row?.prompt_tokens ?? 0, completionTokens: row?.completion_tokens ?? 0 }
}

export async function clearAiUsageLogs(projectId?: string): Promise<void> {
  if (!isTauri()) {
    if (projectId) await webDeleteWhere<AiUsageRecord>('aiUsage', (record) => record.projectId === projectId)
    else await webDeleteWhere<AiUsageRecord>('aiUsage', () => true)
    return
  }
  const database = await getDatabase()
  if (projectId) await database.execute('DELETE FROM ai_usage_logs WHERE project_id = $1', [projectId])
  else await database.execute('DELETE FROM ai_usage_logs')
}
