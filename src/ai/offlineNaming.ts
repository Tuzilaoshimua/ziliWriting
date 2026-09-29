import { offlineCultureMetadata } from './offlineNamingMetadata'

import type {
  OfflineCulture,
  OfflineNameCandidate,
  OfflineNameOptions,
} from './offlineNamingData'

export type {
  OfflineNameKind,
  OfflineCulture,
  OfflineGender,
  OfflineLocationType,
  OfflineCatalogMode,
  OfflinePeriod,
  OfflineNameCandidate,
  OfflineNameOptions,
} from './offlineNamingData'

type OfflineNamingData = typeof import('./offlineNamingData')

// 入口模块保持轻量。资料模块只在命名功能被打开后加载，调用方通过
// `offlineNamingReady` 等待资料就绪，从而保留原有同步生成 API。
let offlineNamingData: OfflineNamingData | null = null
const offlineNamingDataPromise = import('./offlineNamingData').then((module) => {
  offlineNamingData = module
  return module
})
export const offlineNamingReady = offlineNamingDataPromise

function requireOfflineNamingData(): OfflineNamingData {
  if (!offlineNamingData) throw new Error('离线命名资料尚未加载完成')
  return offlineNamingData
}

export function getOfflineCultures() {
  return offlineCultureMetadata.map((culture) => ({
    ...culture,
    periods: culture.periods.map((period) => ({ ...period })),
  }))
}

export function localizeOfflineName(nativeName: string, culture?: OfflineCulture) {
  return requireOfflineNamingData().localizeOfflineName(nativeName, culture)
}

export function localizeOfflineCatalogName(nativeName: string, culture?: OfflineCulture) {
  return requireOfflineNamingData().localizeOfflineCatalogName(nativeName, culture)
}

export function getOfflineNameFallbackTokens(nativeName: string) {
  return requireOfflineNamingData().getOfflineNameFallbackTokens(nativeName)
}

export function getOfflineNameTranslationSources(nativeName: string) {
  return requireOfflineNamingData().getOfflineNameTranslationSources(nativeName)
}

export function getOfflineCatalogVariety(culture: OfflineCulture) {
  return requireOfflineNamingData().getOfflineCatalogVariety(culture)
}

export function getOfflineCatalogSignature(culture: OfflineCulture) {
  return requireOfflineNamingData().getOfflineCatalogSignature(culture)
}

export function getOfflineCatalogExpansionCounts(culture: OfflineCulture) {
  return requireOfflineNamingData().getOfflineCatalogExpansionCounts(culture)
}

export function getOfflineCompleteFictionalCounts(culture: OfflineCulture) {
  return requireOfflineNamingData().getOfflineCompleteFictionalCounts(culture)
}

export function generateOfflineNames(options: OfflineNameOptions): OfflineNameCandidate[] {
  return requireOfflineNamingData().generateOfflineNames(options)
}

export async function loadOfflineNameCandidates(projectId: string) {
  const data = await offlineNamingDataPromise
  return data.loadOfflineNameCandidates(projectId)
}

export function saveOfflineNameCandidates(projectId: string, candidates: OfflineNameCandidate[]) {
  return offlineNamingDataPromise.then((data) => data.saveOfflineNameCandidates(projectId, candidates))
}
