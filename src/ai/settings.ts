import { BUILTIN_SERVICE_MODEL, BUILTIN_SERVICES, type BuiltinServiceRegion } from './builtinService'

export type AiProviderId = 'openai-compatible' | 'builtin-agnes'

export type BuiltinAgnesRegion = BuiltinServiceRegion

export const BUILTIN_AGNES_MODEL = BUILTIN_SERVICE_MODEL
export const BUILTIN_AGNES_ENDPOINTS: Record<BuiltinAgnesRegion, string> = {
  international: BUILTIN_SERVICES.international.baseUrl,
  china: BUILTIN_SERVICES.china.baseUrl,
}

export const LEGACY_AGNES_PROVIDER_ID = 'agnes'

export type AiTaskRoute = {
  providerId: AiProviderId
  baseUrl: string
  model: string
}

export type AiSettings = {
  providerId: AiProviderId
  builtinRegion: BuiltinAgnesRegion
  baseUrl: string
  model: string
  /** 按任务路由：taskType → 走内置服务，或走某个用户 API 端点 + 模型 */
  taskRoutes: Record<string, AiTaskRoute>
  successfulBaseUrls: string[]
  successfulModels: Record<string, string>
  timeoutSeconds: number
  totalTimeoutSeconds: number
  dailyTokenLimit: number
  streamResponses: boolean
}

export type StoredAiSettings = Omit<Partial<AiSettings>, 'providerId'> & {
  providerId?: string
  /** 旧版只按模型覆盖的设置，读取时迁移成 taskRoutes */
  taskModels?: Record<string, string>
}

const SETTINGS_KEY = 'zili-writing-ai-settings-v1'

export const OPENAI_COMPATIBLE_DEFAULTS: AiSettings = {
  providerId: 'openai-compatible',
  builtinRegion: 'international',
  baseUrl: '',
  model: '',
  taskRoutes: {},
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
  const providerId = value.providerId === 'builtin-agnes' ? 'builtin-agnes' : 'openai-compatible'
  const builtinRegion: BuiltinAgnesRegion = value.builtinRegion === 'china' ? 'china' : 'international'
  const timeoutSeconds = Math.max(10, Math.min(300, Number(value.timeoutSeconds) || defaults.timeoutSeconds))
  const storedBaseUrl = typeof value.baseUrl === 'string' ? value.baseUrl : defaults.baseUrl
  const baseUrl = providerId === 'builtin-agnes' ? BUILTIN_AGNES_ENDPOINTS[builtinRegion] : storedBaseUrl
  const storedModel = typeof value.model === 'string' ? value.model : defaults.model
  const model = providerId === 'builtin-agnes' ? BUILTIN_AGNES_MODEL : deprecatedAgnesModelReplacement(baseUrl, storedModel)
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
  const builtinEndpoints = new Set(Object.values(BUILTIN_SERVICES).map((service) => service.baseUrl.trim().replace(/\/+$/, '').toLocaleLowerCase()))
  const fallbackCustomBaseUrl = successfulBaseUrls.find((endpoint) => !builtinEndpoints.has(endpoint.toLocaleLowerCase())) ?? ''
  const taskRoutes: Record<string, AiTaskRoute> = {}
  if (value.taskRoutes && typeof value.taskRoutes === 'object' && !Array.isArray(value.taskRoutes)) {
    for (const [taskType, rawRoute] of Object.entries(value.taskRoutes as Record<string, unknown>).slice(0, 40)) {
      if (!taskType.trim() || !rawRoute || typeof rawRoute !== 'object') continue
      const route = rawRoute as Partial<AiTaskRoute>
      const routeProvider: AiProviderId = route.providerId === 'builtin-agnes' ? 'builtin-agnes' : 'openai-compatible'
      const routeBaseUrl = typeof route.baseUrl === 'string' ? route.baseUrl.trim().replace(/\/+$/, '') : ''
      const routeModel = typeof route.model === 'string' ? route.model.trim() : ''
      if (routeProvider === 'builtin-agnes') {
        taskRoutes[taskType.trim()] = { providerId: 'builtin-agnes', baseUrl: '', model: '' }
        continue
      }
      if (!routeBaseUrl || !routeModel) continue
      taskRoutes[taskType.trim()] = { providerId: 'openai-compatible', baseUrl: routeBaseUrl, model: routeModel }
    }
  }
  // 旧版 taskModels 只有模型名：迁移成「用户 API + 最近保存过的自定义端点」。
  if (value.taskModels && typeof value.taskModels === 'object' && !Array.isArray(value.taskModels)) {
    for (const [taskType, rawModel] of Object.entries(value.taskModels as Record<string, unknown>).slice(0, 40)) {
      if (taskRoutes[taskType]) continue
      if (typeof rawModel !== 'string' || !rawModel.trim() || !fallbackCustomBaseUrl) continue
      taskRoutes[taskType] = { providerId: 'openai-compatible', baseUrl: fallbackCustomBaseUrl, model: rawModel.trim() }
    }
  }
  return {
    providerId,
    builtinRegion,
    baseUrl,
    model,
    taskRoutes,
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
  return _providerId === 'builtin-agnes' ? '内置服务' : 'OpenAI 兼容接口'
}

export function isBuiltinAgnesProvider(settings: Pick<AiSettings, 'providerId'> | AiProviderId) {
  return typeof settings === 'string' ? settings === 'builtin-agnes' : settings.providerId === 'builtin-agnes'
}
