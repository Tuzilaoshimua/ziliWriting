import { defaultMemoryMetadata, type MemoryCandidateMetadata } from './storyMemoryStorage'
import type { ReviewEvidence } from './reviewStorage'

export type AiImportRelationMaps = {
  chapterIds: Record<string, string>
  sceneIds: Record<string, string>
}

export function remapMemoryMetadata(
  source: MemoryCandidateMetadata | undefined,
  originalChapterId: string,
  targetChapterId: string,
  maps: AiImportRelationMaps,
  candidateIds: Map<string, string>,
): MemoryCandidateMetadata {
  const metadata = { ...defaultMemoryMetadata(originalChapterId), ...(source ?? {}) }
  return {
    ...metadata,
    aliases: Array.isArray(metadata.aliases) ? metadata.aliases : [],
    validFromChapterId: maps.chapterIds[metadata.validFromChapterId] ?? targetChapterId,
    validToChapterId: metadata.validToChapterId ? maps.chapterIds[metadata.validToChapterId] ?? null : null,
    firstSeenChapterId: maps.chapterIds[metadata.firstSeenChapterId] ?? targetChapterId,
    sceneId: metadata.sceneId ? maps.sceneIds[metadata.sceneId] ?? '' : '',
    entityId: metadata.entityId ? candidateIds.get(metadata.entityId) ?? '' : '',
  }
}

export function remapReviewContentHash(contentHash: string, chapterId: string | null, maps: AiImportRelationMaps) {
  if (chapterId || !contentHash.trim().startsWith('{')) return contentHash
  try {
    const hashes = JSON.parse(contentHash) as Record<string, string>
    return JSON.stringify(Object.fromEntries(Object.entries(hashes).flatMap(([sourceChapterId, hash]) => {
      const mappedChapterId = maps.chapterIds[sourceChapterId]
      return mappedChapterId ? [[mappedChapterId, hash]] : []
    })))
  } catch {
    return contentHash
  }
}

export function remapReviewEvidence(evidence: ReviewEvidence, maps: AiImportRelationMaps): ReviewEvidence | null {
  const chapterId = maps.chapterIds[evidence.chapterId]
  if (!chapterId) return null
  return {
    ...evidence,
    chapterId,
    sceneId: evidence.sceneId ? maps.sceneIds[evidence.sceneId] : undefined,
  }
}
