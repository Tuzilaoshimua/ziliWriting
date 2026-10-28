import { invoke, isTauri } from '@tauri-apps/api/core'

/**
 * 跨设备同步：借用用户已有的网盘同步目录（OneDrive / 坚果云 / Nextcloud 本地文件夹）。
 * 目录结构：<syncDirectory>/<projectId>/project.zili + manifest.json。
 * 不做端到端加密，安全依赖网盘本身；拉取一律生成新项目副本，不覆盖本地。
 */

export type SyncManifest = {
  version: 1
  projectId: string
  projectTitle: string
  revision: number
  updatedAt: number
  deviceId: string
  deviceLabel: string
  size: number
  hash: string
}

const DEVICE_KEY = 'zili-sync-device-id-v1'

export function getSyncDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY)
    if (existing) return existing
    const created = `dev-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(DEVICE_KEY, created)
    return created
  } catch {
    return 'dev-unknown'
  }
}

export function getSyncDeviceLabel(): string {
  const agent = typeof navigator === 'undefined' ? '' : navigator.userAgent
  if (/Windows/i.test(agent)) return 'Windows'
  if (/Macintosh|Mac OS/i.test(agent)) return 'macOS'
  if (/Linux/i.test(agent)) return 'Linux'
  return '未知设备'
}

export async function hashSyncBytes(bytes: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) return `len-${bytes.byteLength}`
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function parseManifest(raw: string | null): SyncManifest | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<SyncManifest> | null
    if (!parsed || typeof parsed !== 'object' || typeof parsed.hash !== 'string') return null
    return {
      version: 1,
      projectId: typeof parsed.projectId === 'string' ? parsed.projectId : '',
      projectTitle: typeof parsed.projectTitle === 'string' ? parsed.projectTitle : '',
      revision: Number(parsed.revision) || 0,
      updatedAt: Number(parsed.updatedAt) || 0,
      deviceId: typeof parsed.deviceId === 'string' ? parsed.deviceId : '',
      deviceLabel: typeof parsed.deviceLabel === 'string' ? parsed.deviceLabel : '',
      size: Number(parsed.size) || 0,
      hash: parsed.hash,
    }
  } catch {
    return null
  }
}

export function syncAvailable(): boolean {
  return isTauri()
}

export async function writeSyncPackage(directory: string, manifest: SyncManifest, bytes: ArrayBuffer): Promise<string> {
  if (!isTauri()) throw new Error('跨设备同步只在桌面版可用')
  return invoke<string>('write_sync_files', {
    directory,
    projectId: manifest.projectId,
    bytes: Array.from(new Uint8Array(bytes)),
    manifest: JSON.stringify(manifest, null, 2),
  })
}

export async function readSyncManifest(directory: string, projectId: string): Promise<SyncManifest | null> {
  if (!isTauri()) return null
  const raw = await invoke<string | null>('read_sync_manifest', { directory, projectId })
  return parseManifest(raw)
}

export async function readSyncPackage(directory: string, projectId: string): Promise<Uint8Array | null> {
  if (!isTauri()) return null
  const bytes = await invoke<number[] | null>('read_sync_package', { directory, projectId })
  return bytes ? new Uint8Array(bytes) : null
}

export async function writeSyncConflict(directory: string, projectId: string, bytes: ArrayBuffer): Promise<string> {
  if (!isTauri()) throw new Error('跨设备同步只在桌面版可用')
  return invoke<string>('write_sync_conflict', {
    directory,
    projectId,
    bytes: Array.from(new Uint8Array(bytes)),
  })
}

const LAST_SYNC_PREFIX = 'zili-sync-last-'

export function loadLastSync(projectId: string): { hash: string; at: number } | null {
  try {
    const raw = localStorage.getItem(`${LAST_SYNC_PREFIX}${projectId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { hash?: string; at?: number }
    if (typeof parsed.hash !== 'string') return null
    return { hash: parsed.hash, at: Number(parsed.at) || 0 }
  } catch {
    return null
  }
}

export function saveLastSync(projectId: string, value: { hash: string; at: number }): void {
  try {
    localStorage.setItem(`${LAST_SYNC_PREFIX}${projectId}`, JSON.stringify(value))
  } catch {
    // 记录失败不影响同步本身
  }
}