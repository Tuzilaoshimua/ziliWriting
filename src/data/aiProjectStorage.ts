import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import type { ProjectState, ProjectImportIdMap } from './projectStorage'
import { getProjectMemory, saveChapterMemory, type ChapterMemoryBundle } from './storyMemoryStorage'
import {
  loadCreativeWorkspace,
  saveAdvisorSession,
  saveCreativeBrief,
  saveOutlineNode,
  type CreativeWorkspace,
} from './creativeStorage'
import { listDraftCandidates, saveDraftCandidate, type DraftCandidate } from './draftStorage'
import { listReviewIssues, saveReviewIssue, type ReviewIssue } from './reviewStorage'
import { loadStyleProfile, saveStyleProfile, type StyleProfile } from './styleStorage'
import {
  listProjectAiConversations,
  saveAiConversation,
  saveAiConversationMessage,
  type AiConversationBundle,
} from './aiConversationStorage'
import {
  loadAdvancedAiWorkspace,
  saveAdvancedAiRecord,
  saveResearchSourceCard,
  type AdvancedAiWorkspace,
} from './advancedAiStorage'
import { remapMemoryMetadata, remapReviewContentHash, remapReviewEvidence } from './aiProjectRemap'
import { webDeleteWhere, webList } from './webDatabase'

export type AiProjectData = {
  version: 1
  storyMemory: ChapterMemoryBundle[]
  creative: CreativeWorkspace
  drafts: DraftCandidate[]
  reviewIssues: ReviewIssue[]
  styleProfile: StyleProfile
  conversations: AiConversationBundle[]
  advanced: AdvancedAiWorkspace
}

export type AiProjectImportMaps = ProjectImportIdMap & {
  referenceIds?: Record<string, string>
}

const DATABASE_URL = 'sqlite:zili.db'

export async function deleteAiProjectData(projectId: string): Promise<void> {
  if (!isTauri()) {
    const conversations = await webList<{ id: string }>('aiConversations', { projectId })
    const conversationIds = new Set(conversations.map((conversation) => conversation.id))
    await webDeleteWhere<{ conversationId: string }>('aiMessages', (message) => conversationIds.has(message.conversationId))
    for (const collection of ['storyMemory', 'creativeWorkspaces', 'draftCandidates', 'reviewIssues', 'styleProfiles', 'advancedAiRecords', 'researchSources', 'aiUsage', 'aiTasks', 'aiConversations']) {
      await webDeleteWhere<Record<string, unknown>>(collection, (item) => item.projectId === projectId
        || (item.brief as Record<string, unknown> | undefined)?.projectId === projectId
        || (item.memory as Record<string, unknown> | undefined)?.projectId === projectId
        || (Array.isArray(item.candidates) && item.candidates.some((candidate) => (candidate as Record<string, unknown>).projectId === projectId)))
    }
    localStorage.removeItem(`zili-writing-ai-data-permissions-v1:${projectId}`)
    return
  }
  const database = await Database.load(DATABASE_URL)
  await database.execute('DELETE FROM ai_conversation_messages WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE project_id = $1)', [projectId])
  for (const table of [
    'story_memory_candidates',
    'chapter_memories',
    'advisor_sessions',
    'outline_nodes',
    'creative_briefs',
    'ai_text_candidates',
    'review_issues',
    'style_profiles',
    'ai_usage_logs',
    'ai_conversations',
    'advanced_ai_records',
    'research_source_cards',
  ]) await database.execute(`DELETE FROM ${table} WHERE project_id = $1`, [projectId])
  localStorage.removeItem(`zili-writing-ai-data-permissions-v1:${projectId}`)
}

export async function exportAiProjectData(project: ProjectState): Promise<AiProjectData> {
  const [storyMemory, creative, draftsByChapter, reviewIssues, styleProfile, conversations, advanced] = await Promise.all([
    getProjectMemory(project.id),
    loadCreativeWorkspace(project.id),
    Promise.all(project.chapters.map((chapter) => listDraftCandidates(project.id, chapter.id))),
    listReviewIssues(project.id),
    loadStyleProfile(project.id),
    listProjectAiConversations(project.id),
    loadAdvancedAiWorkspace(project.id),
  ])
  return {
    version: 1,
    storyMemory,
    creative,
    drafts: draftsByChapter.flat(),
    reviewIssues,
    styleProfile,
    conversations,
    advanced,
  }
}

export async function importAiProjectData(data: AiProjectData | undefined, maps: AiProjectImportMaps): Promise<void> {
  if (!data || data.version !== 1) return
  const targetProjectId = Object.values(maps.projectId)[0]
  if (!targetProjectId) throw new Error('AI 数据导入缺少项目映射')

  const memoryCandidateIds = new Map((Array.isArray(data.storyMemory) ? data.storyMemory : [])
    .flatMap((bundle) => Array.isArray(bundle.candidates) ? bundle.candidates : [])
    .map((candidate) => [candidate.id, crypto.randomUUID()]))

  for (const bundle of Array.isArray(data.storyMemory) ? data.storyMemory : []) {
    if (!bundle.memory) continue
    const chapterId = maps.chapterIds[bundle.memory.chapterId]
    if (!chapterId) continue
    await saveChapterMemory({
      memory: {
        ...bundle.memory,
        id: crypto.randomUUID(),
        projectId: targetProjectId,
        chapterId,
      },
      candidates: (Array.isArray(bundle.candidates) ? bundle.candidates : []).map((candidate) => {
        return {
          ...candidate,
          id: memoryCandidateIds.get(candidate.id) ?? crypto.randomUUID(),
          projectId: targetProjectId,
          chapterId,
          metadata: remapMemoryMetadata(candidate.metadata, candidate.chapterId, chapterId, maps, memoryCandidateIds),
        }
      }),
    })
  }

  if (data.creative?.brief) {
    await saveCreativeBrief({ ...data.creative.brief, projectId: targetProjectId })
    const outlineIds = new Map((data.creative.outline ?? []).map((node) => [node.id, crypto.randomUUID()]))
    for (const node of data.creative.outline ?? []) {
      await saveOutlineNode({
        ...node,
        id: outlineIds.get(node.id)!,
        projectId: targetProjectId,
        parentId: node.parentId ? outlineIds.get(node.parentId) ?? null : null,
      })
    }
    for (const session of data.creative.sessions ?? []) {
      const chapterId = maps.chapterIds[session.chapterId]
      if (!chapterId) continue
      await saveAdvisorSession({
        ...session,
        id: crypto.randomUUID(),
        projectId: targetProjectId,
        chapterId,
        sceneId: session.sceneId ? maps.sceneIds[session.sceneId] ?? null : null,
        directions: session.directions.map((direction) => ({ ...direction, id: crypto.randomUUID() })),
      })
    }
  }

  for (const draft of Array.isArray(data.drafts) ? data.drafts : []) {
    const chapterId = maps.chapterIds[draft.chapterId]
    if (!chapterId) continue
    await saveDraftCandidate({
      ...draft,
      id: crypto.randomUUID(),
      projectId: targetProjectId,
      chapterId,
    })
  }

  for (const issue of Array.isArray(data.reviewIssues) ? data.reviewIssues : []) {
    const chapterId = issue.chapterId ? maps.chapterIds[issue.chapterId] : null
    if (issue.chapterId && !chapterId) continue
    await saveReviewIssue({
      ...issue,
      id: crypto.randomUUID(),
      projectId: targetProjectId,
      chapterId,
      contentHash: remapReviewContentHash(issue.contentHash, chapterId, maps),
      evidence: (issue.evidence ?? []).flatMap((evidence) => remapReviewEvidence(evidence, maps) ?? []),
    })
  }

  if (data.styleProfile) {
    await saveStyleProfile({
      ...data.styleProfile,
      projectId: targetProjectId,
      sourceReferenceIds: (data.styleProfile.sourceReferenceIds ?? []).flatMap((id) => {
        const mapped = maps.referenceIds?.[id]
        return mapped ? [mapped] : []
      }),
    })
  }

  for (const bundle of Array.isArray(data.conversations) ? data.conversations : []) {
    if (!bundle?.conversation) continue
    const conversationId = crypto.randomUUID()
    await saveAiConversation({
      ...bundle.conversation,
      id: conversationId,
      projectId: targetProjectId,
      chapterId: bundle.conversation.chapterId ? maps.chapterIds[bundle.conversation.chapterId] ?? null : null,
      sceneId: bundle.conversation.sceneId ? maps.sceneIds[bundle.conversation.sceneId] ?? null : null,
    })
    const requestIds = new Map<string, string>()
    for (const message of Array.isArray(bundle.messages) ? bundle.messages : []) {
      const requestId = requestIds.get(message.requestId) ?? crypto.randomUUID()
      requestIds.set(message.requestId, requestId)
      const interrupted = message.status === 'pending'
      await saveAiConversationMessage({
        ...message,
        id: crypto.randomUUID(),
        conversationId,
        requestId,
        status: interrupted ? 'failed' : message.status,
        error: interrupted ? '该任务在备份时尚未完成，请重新尝试' : message.error,
      })
    }
  }

  if (data.advanced) {
    const sourceIds = new Map((data.advanced.sources ?? []).map((source) => [source.id, crypto.randomUUID()]))
    for (const source of data.advanced.sources ?? []) {
      await saveResearchSourceCard({
        ...source,
        id: sourceIds.get(source.id)!,
        projectId: targetProjectId,
      })
    }
    const remapJson = (source: string) => {
      try {
        const remap = (value: unknown): unknown => {
          if (typeof value === 'string') return sourceIds.get(value) ?? value
          if (Array.isArray(value)) return value.map(remap)
          if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remap(item)]))
          return value
        }
        return JSON.stringify(remap(JSON.parse(source) as unknown))
      } catch {
        return source
      }
    }
    for (const record of data.advanced.records ?? []) {
      const chapterId = record.chapterId ? maps.chapterIds[record.chapterId] : null
      if (record.chapterId && !chapterId) continue
      await saveAdvancedAiRecord({
        ...record,
        id: crypto.randomUUID(),
        projectId: targetProjectId,
        chapterId,
        sceneId: record.sceneId ? maps.sceneIds[record.sceneId] ?? null : null,
        inputJson: remapJson(record.inputJson),
        outputJson: remapJson(record.outputJson),
      })
    }
  }
}
