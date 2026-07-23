import { invoke, isTauri } from '@tauri-apps/api/core'
import { LEGACY_AGNES_PROVIDER_ID, type AiSettings } from './settings'

export function secureCredentialStorageAvailable() {
  return isTauri()
}

export async function saveApiKeyCredential(settings: AiSettings, apiKey: string) {
  if (!isTauri()) throw new Error('浏览器模式不支持系统凭据库')
  await invoke('save_ai_api_key', {
    providerId: settings.providerId,
    baseUrl: settings.baseUrl,
    apiKey,
  })
}

export async function loadApiKeyCredential(settings: AiSettings) {
  if (!isTauri()) return null
  return invoke<string | null>('load_ai_api_key', {
    providerId: settings.providerId,
    baseUrl: settings.baseUrl,
  })
}

export async function migrateLegacyAgnesApiKeyCredential(settings: AiSettings) {
  if (!isTauri() || !settings.baseUrl.trim()) return null
  const apiKey = await invoke<string | null>('load_ai_api_key', {
    providerId: LEGACY_AGNES_PROVIDER_ID,
    baseUrl: settings.baseUrl,
  })
  if (!apiKey) return null

  await saveApiKeyCredential(settings, apiKey)
  try {
    await invoke('delete_ai_api_key', {
      providerId: LEGACY_AGNES_PROVIDER_ID,
      baseUrl: settings.baseUrl,
    })
  } catch {
    // The compatible credential is already saved; a stale legacy entry is harmless.
  }
  return apiKey
}

export async function deleteApiKeyCredential(settings: AiSettings) {
  if (!isTauri()) return
  await invoke('delete_ai_api_key', {
    providerId: settings.providerId,
    baseUrl: settings.baseUrl,
  })
}

export async function saveAiSettingsCredential(settings: AiSettings) {
  if (!isTauri()) throw new Error('浏览器模式不支持系统凭据库')
  await invoke('save_ai_settings', { settingsJson: JSON.stringify(settings) })
}

export async function loadAiSettingsCredential() {
  if (!isTauri()) return null
  return invoke<string | null>('load_ai_settings')
}
