import { invoke, isTauri } from '@tauri-apps/api/core'
import Database from '@tauri-apps/plugin-sql'
import { webDeleteWithBlob, webGet, webGetBlob, webList, webPut, webPutWithBlob } from './webDatabase'

export type Attachment = {
  id: string
  projectId: string
  fileName: string
  extension: string
  mediaType: string
  size: number
  localPath: string
  scopeType: 'project' | 'volume' | 'chapter'
  scopeId: string | null
  createdAt: number
}

export type AttachmentScope = Pick<Attachment, 'scopeType' | 'scopeId'>

const DATABASE_URL = 'sqlite:zili.db'
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'json', 'epub', 'csv', 'rtf']
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function saveAttachment(projectId: string, file: File, scope: AttachmentScope = { scopeType: 'project', scopeId: null }): Promise<Attachment> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.includes(extension)) throw new Error('不支持这种附件格式')
  if (file.size > 50 * 1024 * 1024) throw new Error('附件不能超过 50 MB')
  const attachment: Attachment = {
    id: crypto.randomUUID(),
    projectId,
    fileName: file.name,
    extension,
    mediaType: file.type || 'application/octet-stream',
    size: file.size,
    localPath: '',
    scopeType: scope.scopeType,
    scopeId: scope.scopeType === 'project' ? null : scope.scopeId,
    createdAt: Date.now(),
  }
  if (!isTauri()) {
    attachment.localPath = `idb://attachments/${attachment.id}`
    const blob = new Blob([await file.arrayBuffer()], { type: attachment.mediaType })
    await webPutWithBlob('attachments', attachment.id, attachment, blob, { projectId, updatedAt: attachment.createdAt })
    return attachment
  }

  attachment.localPath = await invoke<string>('save_attachment', {
    projectId,
    attachmentId: attachment.id,
    extension,
    bytes: Array.from(new Uint8Array(await file.arrayBuffer())),
  })
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO attachments (id, project_id, file_name, extension, media_type, size, local_path, scope_type, scope_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [attachment.id, projectId, file.name, extension, attachment.mediaType, file.size, attachment.localPath, attachment.scopeType, attachment.scopeId, attachment.createdAt],
  )
  return attachment
}

export async function listAttachments(projectId: string): Promise<Attachment[]> {
  if (!isTauri()) return (await webList<Attachment>('attachments', { projectId }))
    .sort((left, right) => right.createdAt - left.createdAt)
    .map((item) => ({ ...item, scopeType: item.scopeType ?? 'project', scopeId: item.scopeId ?? null }))
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    project_id: string
    file_name: string
    extension: string
    media_type: string
    size: number
    local_path: string
    scope_type: Attachment['scopeType']
    scope_id: string | null
    created_at: number
  }>>(
    `SELECT id, project_id, file_name, extension, media_type, size, local_path, scope_type, scope_id, created_at
     FROM attachments WHERE project_id = $1 ORDER BY created_at DESC`,
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
    scopeType: row.scope_type,
    scopeId: row.scope_id,
    createdAt: row.created_at,
  }))
}

export async function updateAttachmentScope(attachmentId: string, scope: AttachmentScope): Promise<void> {
  const scopeId = scope.scopeType === 'project' ? null : scope.scopeId
  if (!isTauri()) {
    const attachment = await webGet<Attachment>('attachments', attachmentId)
    if (attachment) await webPut('attachments', attachmentId, { ...attachment, scopeType: scope.scopeType, scopeId }, { projectId: attachment.projectId, updatedAt: attachment.createdAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    'UPDATE attachments SET scope_type = $1, scope_id = $2 WHERE id = $3',
    [scope.scopeType, scopeId, attachmentId],
  )
}

export async function clearAttachmentScope(scopeType: 'volume' | 'chapter', scopeId: string): Promise<void> {
  if (!isTauri()) {
    const attachments = (await webList<Attachment>('attachments')).filter((item) => item.scopeType === scopeType && item.scopeId === scopeId)
    await Promise.all(attachments.map((item) => webPut('attachments', item.id, { ...item, scopeType: 'project' as const, scopeId: null }, { projectId: item.projectId, updatedAt: item.createdAt })))
    return
  }
  const database = await getDatabase()
  await database.execute(
    `UPDATE attachments SET scope_type = 'project', scope_id = NULL WHERE scope_type = $1 AND scope_id = $2`,
    [scopeType, scopeId],
  )
}

export async function readAttachment(attachment: Attachment): Promise<Uint8Array> {
  if (!isTauri()) {
    const blob = await webGetBlob('attachments', attachment.id)
    if (blob) return new Uint8Array(await blob.arrayBuffer())
    if (attachment.localPath && !attachment.localPath.startsWith('idb://')) {
      return new Uint8Array(await (await fetch(attachment.localPath)).arrayBuffer())
    }
    throw new Error('附件文件已丢失')
  }
  return new Uint8Array(await invoke<number[]>('read_attachment', {
    projectId: attachment.projectId,
    attachmentId: attachment.id,
    extension: attachment.extension,
  }))
}

export async function deleteAttachment(attachment: Attachment): Promise<void> {
  if (!isTauri()) {
    await webDeleteWithBlob('attachments', attachment.id)
    return
  }
  await invoke('delete_attachment', {
    projectId: attachment.projectId,
    attachmentId: attachment.id,
    extension: attachment.extension,
  })
  const database = await getDatabase()
  await database.execute('DELETE FROM attachments WHERE id = $1', [attachment.id])
}
