export type AiDataPermissions = {
  currentChapter: boolean
  otherChapters: boolean
  confirmedMemory: boolean
  creativePlanning: boolean
  styleProfile: boolean
  deletedChapters: boolean
  referenceTexts: boolean
  webResearch: boolean
  /** 允许字里助手提出并执行作品修改（执行前会给出确认卡） */
  agentControl: boolean
  /** 生成候选正文后跳过确认，直接写入 */
  agentAutoApply: boolean
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
  agentControl: true,
  agentAutoApply: false,
}

const KEY_PREFIX = 'zili-writing-ai-data-permissions-v2:'
const LEGACY_KEY_PREFIX = 'zili-writing-ai-data-permissions-v1:'

export function loadAiDataPermissions(projectId: string): AiDataPermissions {
  try {
    const current = localStorage.getItem(`${KEY_PREFIX}${projectId}`)
    if (current) {
      return { ...DEFAULT_AI_DATA_PERMISSIONS, ...JSON.parse(current) as Partial<AiDataPermissions> }
    }
    const legacySource = localStorage.getItem(`${LEGACY_KEY_PREFIX}${projectId}`)
    if (legacySource) {
      // v1 允许“自动写入”，现在默认改成先确认；其余读取权限原样保留。
      const migrated = {
        ...DEFAULT_AI_DATA_PERMISSIONS,
        ...JSON.parse(legacySource) as Partial<AiDataPermissions>,
        agentControl: true,
        agentAutoApply: false,
      }
      localStorage.setItem(`${KEY_PREFIX}${projectId}`, JSON.stringify(migrated))
      return migrated
    }
    return DEFAULT_AI_DATA_PERMISSIONS
  } catch {
    return DEFAULT_AI_DATA_PERMISSIONS
  }
}

export function saveAiDataPermissions(projectId: string, permissions: AiDataPermissions) {
  localStorage.setItem(`${KEY_PREFIX}${projectId}`, JSON.stringify(permissions))
}
