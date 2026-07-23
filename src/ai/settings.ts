export type AiProviderId = 'openai-compatible'

export const LEGACY_AGNES_PROVIDER_ID = 'agnes'

export type AiSettings = {
  providerId: AiProviderId
  baseUrl: string
  model: string
  successfulBaseUrls: string[]
  successfulModels: Record<string, string>
  timeoutSeconds: number
  totalTimeoutSeconds: number
  dailyTokenLimit: number
  streamResponses: boolean
}

export type StoredAiSettings = Omit<Partial<AiSettings>, 'providerId'> & { providerId?: string }

const SETTINGS_KEY = 'zili-writing-ai-settings-v1'

export const OPENAI_COMPATIBLE_DEFAULTS: AiSettings = {
  providerId: 'openai-compatible',
  baseUrl: '',
  model: '',
  successfulBaseUrls: [],
  successfulModels: {},
  timeoutSeconds: 60,
  totalTimeoutSeconds: 300,
  dailyTokenLimit: 0,
  streamResponses: true,
}

let runtimeApiKey = ''

export function normalizeAiSettings(stored: StoredAiSettings): AiSettings {
  const value = stored && typeof stored === 'object' ? stored : {}
  const defaults = OPENAI_COMPATIBLE_DEFAULTS
  const timeoutSeconds = Math.max(10, Math.min(300, Number(value.timeoutSeconds) || defaults.timeoutSeconds))
  const baseUrl = typeof value.baseUrl === 'string' ? value.baseUrl : defaults.baseUrl
  const storedModel = typeof value.model === 'string' ? value.model : defaults.model
  const model = deprecatedAgnesModelReplacement(baseUrl, storedModel)
  const successfulBaseUrls = Array.isArray(value.successfulBaseUrls)
    ? [...new Map(value.successfulBaseUrls
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim().replace(/\/+$/, ''))
      .filter((item) => /^https?:\/\//i.test(item))
      .map((item) => [item.toLocaleLowerCase(), item])).values()].slice(0, 12)
    : defaults.successfulBaseUrls
  const successfulModels = value.successfulModels && typeof value.successfulModels === 'object' && !Array.isArray(value.successfulModels)
    ? Object.fromEntries(Object.entries(value.successfulModels)
      .filter((entry): entry is [string, string] => /^https?:\/\//i.test(entry[0]) && typeof entry[1] === 'string' && Boolean(entry[1].trim()))
      .map(([endpoint, endpointModel]) => [endpoint.trim().replace(/\/+$/, '').toLocaleLowerCase(), deprecatedAgnesModelReplacement(endpoint, endpointModel.trim())])
      .slice(0, 12))
    : {}
  const activeEndpointKey = baseUrl.trim().replace(/\/+$/, '').toLocaleLowerCase()
  if (activeEndpointKey && successfulBaseUrls.some((endpoint) => endpoint.toLocaleLowerCase() === activeEndpointKey) && model && !successfulModels[activeEndpointKey]) {
    successfulModels[activeEndpointKey] = model
  }
  return {
    providerId: 'openai-compatible',
    baseUrl,
    model,
    successfulBaseUrls,
    successfulModels,
    timeoutSeconds,
    totalTimeoutSeconds: Math.max(timeoutSeconds, Math.min(900, Number(value.totalTimeoutSeconds) || defaults.totalTimeoutSeconds)),
    dailyTokenLimit: Math.max(0, Math.min(10_000_000, Math.round(Number(value.dailyTokenLimit) || 0))),
    streamResponses: value.streamResponses !== false,
  }
}

function deprecatedAgnesModelReplacement(baseUrl: string, model: string) {
  if (model.trim().toLocaleLowerCase() !== 'agnes-2.0-flash') return model
  try {
    const hostname = new URL(baseUrl).hostname
    return /(^|\.)agnes-ai\.com$/i.test(hostname) ? 'deepseek-v4-flash' : model
  } catch {
    return model
  }
}

export function loadAiSettings(): AiSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as Partial<AiSettings>
    return normalizeAiSettings(stored)
  } catch {
    return OPENAI_COMPATIBLE_DEFAULTS
  }
}

export function hasLegacyAgnesAiSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as { providerId?: string }
    return stored.providerId === LEGACY_AGNES_PROVIDER_ID
  } catch {
    return false
  }
}

export function saveAiSettings(settings: AiSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function clearLegacyAiSettings() {
  localStorage.removeItem(SETTINGS_KEY)
}

export function setRuntimeApiKey(apiKey: string) {
  runtimeApiKey = apiKey.trim()
}

export function getRuntimeApiKey() {
  return runtimeApiKey
}

export function providerLabel(_providerId?: AiProviderId) {
  return 'OpenAI 兼容接口'
}
