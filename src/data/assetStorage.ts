import { convertFileSrc, invoke, isTauri } from '@tauri-apps/api/core'
import Database from '@tauri-apps/plugin-sql'
import { webDeleteWithBlob, webGetBlob, webList, webPutWithBlob } from './webDatabase'

export type ImageAsset = {
  id: string
  projectId: string
  fileName: string
  extension: string
  mediaType: string
  size: number
  localPath: string
  src: string
  createdAt: number
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null
const webAssetUrls = new Map<string, string>()

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

function fileExtension(file: File) {
  const nameExtension = file.name.split('.').pop()?.toLowerCase()
  if (nameExtension === 'jpeg') return 'jpg'
  if (nameExtension && ['png', 'jpg', 'webp', 'gif'].includes(nameExtension)) return nameExtension
  const mimeExtension = file.type.split('/')[1]?.toLowerCase()
  return mimeExtension === 'jpeg' ? 'jpg' : mimeExtension
}

async function hydrateWebAsset(asset: ImageAsset): Promise<ImageAsset> {
  const existing = webAssetUrls.get(asset.id)
  if (existing) return { ...asset, src: existing }
  const blob = await webGetBlob('assets', asset.id)
  if (!blob) return { ...asset, src: asset.src || asset.localPath }
  const src = URL.createObjectURL(blob)
  webAssetUrls.set(asset.id, src)
  return { ...asset, src }
}

export async function saveImageAsset(projectId: string, file: File): Promise<ImageAsset> {
  const extension = fileExtension(file)
  if (!extension || !['png', 'jpg', 'webp', 'gif'].includes(extension)) {
    throw new Error('仅支持 PNG、JPG、WebP 和 GIF 图片')
  }
  if (file.size > 20 * 1024 * 1024) throw new Error('图片不能超过 20 MB')

  const id = crypto.randomUUID()
  const createdAt = Date.now()
  if (!isTauri()) {
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    const storedAsset: ImageAsset = {
      id, projectId, fileName: file.name, extension, mediaType: file.type,
      size: file.size, localPath: `idb://assets/${id}`, src: '', createdAt,
    }
    await webPutWithBlob('assets', id, storedAsset, blob, { projectId, updatedAt: createdAt })
    const src = URL.createObjectURL(blob)
    webAssetUrls.set(id, src)
    return { ...storedAsset, src }
  }

  const localPath = await invoke<string>('save_image_asset', {
    projectId,
    assetId: id,
    extension,
    bytes: Array.from(new Uint8Array(await file.arrayBuffer())),
  })
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO assets (id, project_id, file_name, extension, media_type, size, local_path, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, projectId, file.name, extension, file.type, file.size, localPath, createdAt],
  )
  return {
    id, projectId, fileName: file.name, extension, mediaType: file.type,
    size: file.size, localPath, src: convertFileSrc(localPath), createdAt,
  }
}

export async function listImageAssets(projectId: string): Promise<ImageAsset[]> {
  if (!isTauri()) return Promise.all((await webList<ImageAsset>('assets', { projectId })).sort((left, right) => right.createdAt - left.createdAt).map(hydrateWebAsset))
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    project_id: string
    file_name: string
    extension: string
    media_type: string
    size: number
    local_path: string
    created_at: number
  }>>(
    `SELECT id, project_id, file_name, extension, media_type, size, local_path, created_at
     FROM assets WHERE project_id = $1 ORDER BY created_at DESC`,
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
    src: convertFileSrc(row.local_path),
    createdAt: row.created_at,
  }))
}

export async function deleteImageAsset(asset: ImageAsset): Promise<void> {
  if (!isTauri()) {
    await webDeleteWithBlob('assets', asset.id)
    const url = webAssetUrls.get(asset.id)
    if (url) URL.revokeObjectURL(url)
    webAssetUrls.delete(asset.id)
    return
  }
  await invoke('delete_image_asset', {
    projectId: asset.projectId,
    assetId: asset.id,
    extension: asset.extension,
  })
  const database = await getDatabase()
  await database.execute('DELETE FROM assets WHERE id = $1', [asset.id])
}

export async function readImageAsset(asset: ImageAsset): Promise<Uint8Array> {
  if (!isTauri()) {
    const blob = await webGetBlob('assets', asset.id)
    if (blob) return new Uint8Array(await blob.arrayBuffer())
    const legacySource = asset.src || asset.localPath
    if (legacySource) return new Uint8Array(await (await fetch(legacySource)).arrayBuffer())
    throw new Error('图片素材文件已丢失')
  }
  const bytes = await invoke<number[]>('read_image_asset', {
    projectId: asset.projectId,
    assetId: asset.id,
    extension: asset.extension,
  })
  return new Uint8Array(bytes)
}
