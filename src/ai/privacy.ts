export type AiDataPermissions = {
  currentChapter: boolean
  otherChapters: boolean
  confirmedMemory: boolean
  creativePlanning: boolean
  styleProfile: boolean
  deletedChapters: boolean
  referenceTexts: boolean
  webResearch: boolean
}

export const DEFAULT_AI_DATA_PERMISSIONS: AiDataPermissions = {
  currentChapter: true,
  otherChapters: true,
  confirmedMemory: true,
  creativePlanning: true,
  styleProfile: true,
  deletedChapters: true,
  referenceTexts: true,
  webResearch: true,
}

const KEY_PREFIX = 'zili-writing-ai-data-permissions-v1:'

export function loadAiDataPermissions(projectId: string): AiDataPermissions {
  try {
    return {
      ...DEFAULT_AI_DATA_PERMISSIONS,
      ...JSON.parse(localStorage.getItem(`${KEY_PREFIX}${projectId}`) || '{}') as Partial<AiDataPermissions>,
    }
  } catch {
    return DEFAULT_AI_DATA_PERMISSIONS
  }
}

export function saveAiDataPermissions(projectId: string, permissions: AiDataPermissions) {
  localStorage.setItem(`${KEY_PREFIX}${projectId}`, JSON.stringify(permissions))
}
