import { invoke, isTauri } from '@tauri-apps/api/core'
import Database from '@tauri-apps/plugin-sql'
import { webDeleteWithBlob, webGetBlob, webList, webPutWithBlob } from './webDatabase'

export type ReferenceText = {
  id: string
  projectId: string
  fileName: string
  extension: string
  mediaType: string
  size: number
  localPath: string
  rightsConfirmedAt: number
  createdAt: number
}

const DATABASE_URL = 'sqlite:zili.db'
const ALLOWED_EXTENSIONS = ['txt', 'md', 'docx', 'epub']
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function saveReferenceText(projectId: string, file: File, rightsConfirmedAt: number): Promise<ReferenceText> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.includes(extension)) throw new Error('参考文本仅支持 TXT、Markdown、DOCX 和 EPUB')
  if (file.size === 0) throw new Error('参考文本不能为空')
  if (file.size > 50 * 1024 * 1024) throw new Error('参考文本不能超过 50 MB')
  if (!rightsConfirmedAt) throw new Error('导入前需要确认文本处理权限')

  const reference: ReferenceText = {
    id: crypto.randomUUID(),
    projectId,
    fileName: file.name,
    extension,
    mediaType: file.type || 'application/octet-stream',
    size: file.size,
    localPath: '',
    rightsConfirmedAt,
    createdAt: Date.now(),
  }

  if (!isTauri()) {
    reference.localPath = `idb://references/${reference.id}`
    const blob = new Blob([await file.arrayBuffer()], { type: reference.mediaType })
    await webPutWithBlob('references', reference.id, reference, blob, { projectId, updatedAt: reference.createdAt })
    return reference
  }

  reference.localPath = await invoke<string>('save_reference_text', {
    projectId,
    referenceId: reference.id,
    extension,
    bytes: Array.from(new Uint8Array(await file.arrayBuffer())),
  })
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO reference_texts
      (id, project_id, file_name, extension, media_type, size, local_path, rights_confirmed_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [reference.id, projectId, reference.fileName, extension, reference.mediaType, reference.size, reference.localPath, rightsConfirmedAt, reference.createdAt],
  )
  return reference
}

export async function listReferenceTexts(projectId: string): Promise<ReferenceText[]> {
  if (!isTauri()) return (await webList<ReferenceText>('references', { projectId })).sort((left, right) => right.createdAt - left.createdAt)
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    project_id: string
    file_name: string
    extension: string
    media_type: string
    size: number
    local_path: string
    rights_confirmed_at: number
    created_at: number
  }>>(
    `SELECT id, project_id, file_name, extension, media_type, size, local_path, rights_confirmed_at, created_at
     FROM reference_texts WHERE project_id = $1 ORDER BY created_at DESC`,
    [projectId],
  )
  return rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    fileName: row.file_name,
    extension: row.extension,
    mediaType: row.media_type,
    size: row.size,
    localPath: row.local_path,
    rightsConfirmedAt: row.rights_confirmed_at,
    createdAt: row.created_at,
  }))
}

export async function readReferenceText(reference: ReferenceText): Promise<Uint8Array> {
  if (!isTauri()) {
    const blob = await webGetBlob('references', reference.id)
    if (blob) return new Uint8Array(await blob.arrayBuffer())
    if (reference.localPath && !reference.localPath.startsWith('idb://')) {
      return new Uint8Array(await (await fetch(reference.localPath)).arrayBuffer())
    }
    throw new Error('参考文本文件已丢失')
  }
  return new Uint8Array(await invoke<number[]>('read_reference_text', {
    projectId: reference.projectId,
    referenceId: reference.id,
    extension: reference.extension,
  }))
}

export async function deleteReferenceText(reference: ReferenceText): Promise<void> {
  if (!isTauri()) {
    await webDeleteWithBlob('references', reference.id)
    return
  }
  await invoke('delete_reference_text', {
    projectId: reference.projectId,
    referenceId: reference.id,
    extension: reference.extension,
  })
  const database = await getDatabase()
  await database.execute('DELETE FROM reference_texts WHERE id = $1', [reference.id])
}
