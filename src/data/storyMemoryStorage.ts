import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import type { ProjectState } from './projectStorage'
import { webGet, webList, webPut } from './webDatabase'

export type MemoryCandidateKind = 'character' | 'character_state' | 'location' | 'organization' | 'item' | 'world' | 'event' | 'relationship' | 'dialogue' | 'commitment' | 'secret' | 'plot' | 'claim' | 'foreshadowing'
export type MemoryCandidateStatus = 'candidate' | 'archived' | 'confirmed' | 'stale' | 'rejected'
export type MemoryInformationNature = 'objective' | 'witnessed' | 'belief' | 'statement' | 'rumor' | 'dream' | 'inference'
export type MemoryLifecycle = 'active' | 'resolved' | 'superseded' | 'abandoned'

export type MemoryCandidateMetadata = {
  nature: MemoryInformationNature
  knower: string
  validFromChapterId: string
  validToChapterId: string | null
  lifecycle: MemoryLifecycle
  storyTime: string
  storyTimePrecision: 'exact' | 'approximate' | 'relative' | 'unknown'
  participants: string
  location: string
  affectedScope: string
  subject: string
  stateAspect: string
  stateValue: string
  previousStateValue: string
  responsibleParty: string
  target: string
  entityId: string
  aliases: string[]
  firstSeenChapterId: string
  sceneId: string
  sourceRevisionNumber: number
  evidenceStartOffset: number
  evidenceEndOffset: number
  evidenceRole: 'support' | 'contradict' | 'context'
  archivalSource: 'pending' | 'author' | 'automatic'
}

export type ChapterMemory = {
  id: string
  projectId: string
  chapterId: string
  summary: string
  revisionNumber: number
  contentHash: string
  analyzedAt: number
}

export type MemoryCandidate = {
  id: string
  projectId: string
  chapterId: string
  kind: MemoryCandidateKind
  title: string
  detail: string
  status: MemoryCandidateStatus
  confidence: number
  evidenceNodeId: string
  evidenceQuote: string
  metadata: MemoryCandidateMetadata
  createdAt: number
  updatedAt: number
}

export const MEMORY_NATURE_LABELS: Record<MemoryInformationNature, string> = {
  objective: '客观叙事',
  witnessed: '角色亲历',
  belief: '角色认知',
  statement: '角色陈述',
  rumor: '传闻或误会',
  dream: '梦境',
  inference: 'AI 推断',
}

export const MEMORY_LIFECYCLE_LABELS: Record<MemoryLifecycle, string> = {
  active: '进行中',
  resolved: '已回收',
  superseded: '已被后文替代',
  abandoned: '已废弃',
}

export function defaultMemoryMetadata(chapterId: string): MemoryCandidateMetadata {
  return {
    nature: 'objective',
    knower: '',
    validFromChapterId: chapterId,
    validToChapterId: null,
    lifecycle: 'active',
    storyTime: '',
    storyTimePrecision: 'unknown',
    participants: '',
    location: '',
    affectedScope: '',
    subject: '',
    stateAspect: '',
    stateValue: '',
    previousStateValue: '',
    responsibleParty: '',
    target: '',
    entityId: '',
    aliases: [],
    firstSeenChapterId: chapterId,
    sceneId: '',
    sourceRevisionNumber: 0,
    evidenceStartOffset: 0,
    evidenceEndOffset: 0,
    evidenceRole: 'support',
    archivalSource: 'pending',
  }
}

function parseMetadata(source: string | undefined, chapterId: string): MemoryCandidateMetadata {
  try {
    const stored = JSON.parse(source || '{}') as Partial<MemoryCandidateMetadata>
    return {
      ...defaultMemoryMetadata(chapterId),
      ...stored,
      aliases: Array.isArray(stored.aliases) ? stored.aliases.filter((alias): alias is string => typeof alias === 'string').slice(0, 20) : [],
      validFromChapterId: stored.validFromChapterId || chapterId,
      firstSeenChapterId: stored.firstSeenChapterId || chapterId,
    }
  } catch {
    return defaultMemoryMetadata(chapterId)
  }
}

export type ChapterMemoryBundle = {
  memory: ChapterMemory | null
  candidates: MemoryCandidate[]
}

export function memoryBundleIsCurrent(bundle: ChapterMemoryBundle, project: ProjectState) {
  const chapter = bundle.memory ? project.chapters.find((item) => item.id === bundle.memory!.chapterId) : null
  return Boolean(bundle.memory && chapter && bundle.memory.contentHash === chapter.contentHash)
}

export function confirmedCurrentMemory(memories: ChapterMemoryBundle[], project: ProjectState) {
  return memories.flatMap((bundle) => bundle.candidates.filter((candidate) => candidate.status === 'confirmed'
    && (candidate.metadata.archivalSource === 'author' || memoryBundleIsCurrent(bundle, project))))
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

function normalizeWebBundle(bundle: ChapterMemoryBundle): ChapterMemoryBundle {
  return {
    ...bundle,
    candidates: (bundle.candidates ?? []).map((candidate) => ({
      ...candidate,
      metadata: {
        ...defaultMemoryMetadata(candidate.chapterId),
        ...(candidate.metadata ?? {}),
        aliases: Array.isArray(candidate.metadata?.aliases) ? candidate.metadata.aliases : [],
        firstSeenChapterId: candidate.metadata?.firstSeenChapterId || candidate.chapterId,
      },
    })),
  }
}

async function saveWebBundle(bundle: ChapterMemoryBundle, projectId?: string, chapterId?: string) {
  const project = projectId ?? bundle.memory?.projectId ?? bundle.candidates[0]?.projectId
  const chapter = chapterId ?? bundle.memory?.chapterId ?? bundle.candidates[0]?.chapterId
  if (!project || !chapter) return
  const updatedAt = Math.max(bundle.memory?.analyzedAt ?? 0, ...bundle.candidates.map((candidate) => candidate.updatedAt), Date.now())
  await webPut('storyMemory', `${project}:${chapter}`, bundle, { projectId: project, parentId: chapter, updatedAt })
}

export async function getChapterMemory(projectId: string, chapterId: string): Promise<ChapterMemoryBundle> {
  if (!isTauri()) {
    const bundle = await webGet<ChapterMemoryBundle>('storyMemory', `${projectId}:${chapterId}`)
    return bundle ? normalizeWebBundle(bundle) : { memory: null, candidates: [] }
  }

  const database = await getDatabase()
  const memories = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string
    summary: string
    revision_number: number
    content_hash: string
    analyzed_at: number
  }>>('SELECT id, project_id, chapter_id, summary, revision_number, content_hash, analyzed_at FROM chapter_memories WHERE project_id = $1 AND chapter_id = $2 LIMIT 1', [projectId, chapterId])
  const rows = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string
    kind: MemoryCandidateKind
    title: string
    detail: string
    status: MemoryCandidateStatus
    confidence: number
    evidence_node_id: string
    evidence_quote: string
    metadata_json: string
    created_at: number
    updated_at: number
  }>>('SELECT id, project_id, chapter_id, kind, title, detail, status, confidence, evidence_node_id, evidence_quote, metadata_json, created_at, updated_at FROM story_memory_candidates WHERE project_id = $1 AND chapter_id = $2 ORDER BY created_at ASC', [projectId, chapterId])
  const memory = memories[0]
  return {
    memory: memory ? {
      id: memory.id,
      projectId: memory.project_id,
      chapterId: memory.chapter_id,
      summary: memory.summary,
      revisionNumber: memory.revision_number,
      contentHash: memory.content_hash,
      analyzedAt: memory.analyzed_at,
    } : null,
    candidates: rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      chapterId: row.chapter_id,
      kind: row.kind,
      title: row.title,
      detail: row.detail,
      status: row.status,
      confidence: row.confidence,
      evidenceNodeId: row.evidence_node_id,
      evidenceQuote: row.evidence_quote,
      metadata: parseMetadata(row.metadata_json, row.chapter_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  }
}

export async function getProjectMemory(projectId: string): Promise<ChapterMemoryBundle[]> {
  if (!isTauri()) {
    return (await webList<ChapterMemoryBundle>('storyMemory', { projectId })).map(normalizeWebBundle)
  }

  const database = await getDatabase()
  const memories = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string
    summary: string
    revision_number: number
    content_hash: string
    analyzed_at: number
  }>>('SELECT id, project_id, chapter_id, summary, revision_number, content_hash, analyzed_at FROM chapter_memories WHERE project_id = $1 ORDER BY analyzed_at DESC', [projectId])
  const candidates = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string
    kind: MemoryCandidateKind
    title: string
    detail: string
    status: MemoryCandidateStatus
    confidence: number
    evidence_node_id: string
    evidence_quote: string
    metadata_json: string
    created_at: number
    updated_at: number
  }>>('SELECT id, project_id, chapter_id, kind, title, detail, status, confidence, evidence_node_id, evidence_quote, metadata_json, created_at, updated_at FROM story_memory_candidates WHERE project_id = $1 ORDER BY updated_at DESC', [projectId])

  const bundles = memories.map((memory) => ({
    memory: {
      id: memory.id,
      projectId: memory.project_id,
      chapterId: memory.chapter_id,
      summary: memory.summary,
      revisionNumber: memory.revision_number,
      contentHash: memory.content_hash,
      analyzedAt: memory.analyzed_at,
    },
    candidates: candidates.filter((candidate) => candidate.chapter_id === memory.chapter_id).map((candidate) => ({
      id: candidate.id,
      projectId: candidate.project_id,
      chapterId: candidate.chapter_id,
      kind: candidate.kind,
      title: candidate.title,
      detail: candidate.detail,
      status: candidate.status,
      confidence: candidate.confidence,
      evidenceNodeId: candidate.evidence_node_id,
      evidenceQuote: candidate.evidence_quote,
      metadata: parseMetadata(candidate.metadata_json, candidate.chapter_id),
      createdAt: candidate.created_at,
      updatedAt: candidate.updated_at,
    })),
  }))
  const memoryChapterIds = new Set(memories.map((memory) => memory.chapter_id))
  const orphanChapterIds = [...new Set(candidates.filter((candidate) => !memoryChapterIds.has(candidate.chapter_id)).map((candidate) => candidate.chapter_id))]
  return [...bundles, ...orphanChapterIds.map((chapterId) => ({
    memory: null,
    candidates: candidates.filter((candidate) => candidate.chapter_id === chapterId).map((candidate) => ({
      id: candidate.id,
      projectId: candidate.project_id,
      chapterId: candidate.chapter_id,
      kind: candidate.kind,
      title: candidate.title,
      detail: candidate.detail,
      status: candidate.status,
      confidence: candidate.confidence,
      evidenceNodeId: candidate.evidence_node_id,
      evidenceQuote: candidate.evidence_quote,
      metadata: parseMetadata(candidate.metadata_json, candidate.chapter_id),
      createdAt: candidate.created_at,
      updatedAt: candidate.updated_at,
    })),
  }))]
}

export async function saveMemoryCandidates(candidates: MemoryCandidate[]): Promise<void> {
  if (candidates.length === 0) return
  if (!isTauri()) {
    const groups = new Map<string, MemoryCandidate[]>()
    for (const candidate of candidates) {
      const key = `${candidate.projectId}:${candidate.chapterId}`
      groups.set(key, [...(groups.get(key) ?? []), candidate])
    }
    for (const grouped of groups.values()) {
      const first = grouped[0]
      const bundle = await getChapterMemory(first.projectId, first.chapterId)
      for (const candidate of grouped) {
        const index = bundle.candidates.findIndex((stored) => stored.id === candidate.id)
        if (index >= 0) bundle.candidates[index] = candidate
        else bundle.candidates.push(candidate)
      }
      await saveWebBundle(bundle, first.projectId, first.chapterId)
    }
    return
  }
  const database = await getDatabase()
  for (const candidate of candidates) {
    await database.execute(
      `INSERT INTO story_memory_candidates (id, project_id, chapter_id, kind, title, detail, status, confidence, evidence_node_id, evidence_quote, metadata_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, title = excluded.title, detail = excluded.detail,
         status = excluded.status, confidence = excluded.confidence, evidence_node_id = excluded.evidence_node_id,
         evidence_quote = excluded.evidence_quote, metadata_json = excluded.metadata_json, updated_at = excluded.updated_at`,
      [candidate.id, candidate.projectId, candidate.chapterId, candidate.kind, candidate.title, candidate.detail, candidate.status, candidate.confidence, candidate.evidenceNodeId, candidate.evidenceQuote, JSON.stringify(candidate.metadata ?? defaultMemoryMetadata(candidate.chapterId)), candidate.createdAt, candidate.updatedAt],
    )
  }
}

export async function saveChapterMemory(bundle: ChapterMemoryBundle): Promise<void> {
  if (!bundle.memory) return
  if (!isTauri()) {
    const stored = await getChapterMemory(bundle.memory.projectId, bundle.memory.chapterId)
    if (stored.memory || stored.candidates.length) {
      const authorCandidates = stored.candidates.filter((candidate) => candidate.metadata.archivalSource === 'author'
        && !bundle.candidates.some((incoming) => incoming.id === candidate.id))
      await saveWebBundle({ ...bundle, candidates: [...authorCandidates, ...bundle.candidates] })
    }
    else await saveWebBundle(bundle)
    return
  }

  const database = await getDatabase()
  const memory = bundle.memory
  await database.execute(
    `INSERT INTO chapter_memories (id, project_id, chapter_id, summary, revision_number, content_hash, analyzed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT(project_id, chapter_id) DO UPDATE SET summary = excluded.summary,
       revision_number = excluded.revision_number, content_hash = excluded.content_hash, analyzed_at = excluded.analyzed_at`,
    [memory.id, memory.projectId, memory.chapterId, memory.summary, memory.revisionNumber, memory.contentHash, memory.analyzedAt],
  )
  await database.execute("DELETE FROM story_memory_candidates WHERE project_id = $1 AND chapter_id = $2 AND status != 'confirmed' AND metadata_json NOT LIKE '%\"archivalSource\":\"author\"%'", [memory.projectId, memory.chapterId])
  for (const candidate of bundle.candidates) {
    await database.execute(
      `INSERT INTO story_memory_candidates (id, project_id, chapter_id, kind, title, detail, status, confidence, evidence_node_id, evidence_quote, metadata_json, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, title = excluded.title, detail = excluded.detail,
         status = excluded.status, confidence = excluded.confidence, evidence_node_id = excluded.evidence_node_id,
         evidence_quote = excluded.evidence_quote, metadata_json = excluded.metadata_json, updated_at = excluded.updated_at`,
      [candidate.id, candidate.projectId, candidate.chapterId, candidate.kind, candidate.title, candidate.detail, candidate.status, candidate.confidence, candidate.evidenceNodeId, candidate.evidenceQuote, JSON.stringify(candidate.metadata ?? defaultMemoryMetadata(candidate.chapterId)), candidate.createdAt, candidate.updatedAt],
    )
  }
}

export async function updateMemoryCandidate(candidate: MemoryCandidate): Promise<void> {
  if (!isTauri()) {
    const bundle = await getChapterMemory(candidate.projectId, candidate.chapterId)
    await saveWebBundle({ ...bundle, candidates: bundle.candidates.map((item) => item.id === candidate.id ? candidate : item) }, candidate.projectId, candidate.chapterId)
    return
  }
  const database = await getDatabase()
  await database.execute(
    'UPDATE story_memory_candidates SET title = $1, detail = $2, status = $3, metadata_json = $4, updated_at = $5 WHERE id = $6',
    [candidate.title, candidate.detail, candidate.status, JSON.stringify(candidate.metadata ?? defaultMemoryMetadata(candidate.chapterId)), candidate.updatedAt, candidate.id],
  )
}

const ENTITY_MEMORY_KINDS = new Set<MemoryCandidateKind>(['character', 'location', 'organization', 'item', 'world'])

function normalizedEntityName(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[\s·•・,，。.!！?？:：;；'"“”‘’（）()\[\]【】《》<>_-]/g, '')
}

function sameEntityName(left: string, right: string) {
  if (!left || !right) return false
  if (left === right) return true
  const shorter = left.length <= right.length ? left : right
  const longer = left.length > right.length ? left : right
  if (shorter.length < 2 || !longer.includes(shorter)) return false
  return !/^(?:王子|公主|骑士|首席骑士|大臣|助理|大臣助理|女巫|国王|王后|父亲|母亲|哥哥|姐姐|弟弟|妹妹|男人|女人|少年|少女)$/.test(shorter)
}

export async function reconcileMemoryEntities(project: ProjectState, candidates: MemoryCandidate[], knownBundles?: ChapterMemoryBundle[]): Promise<MemoryCandidate[]> {
  const bundles = knownBundles ?? await getProjectMemory(project.id)
  const existing = bundles.flatMap((bundle) => bundle.candidates)
    .filter((candidate) => candidate.status !== 'rejected' && ENTITY_MEMORY_KINDS.has(candidate.kind) && candidate.chapterId !== candidates[0]?.chapterId)
  const chapterOrder = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  const pool = [...existing]
  return candidates.map((candidate) => {
    const chapter = project.chapters.find((item) => item.id === candidate.chapterId)
    const metadata = { ...defaultMemoryMetadata(candidate.chapterId), ...candidate.metadata }
    metadata.aliases = Array.isArray(metadata.aliases) ? metadata.aliases : []
    metadata.sourceRevisionNumber = chapter?.revisionNumber ?? metadata.sourceRevisionNumber
    metadata.firstSeenChapterId ||= candidate.chapterId
    const entityKind = candidate.kind === 'character_state' ? 'character' : candidate.kind
    if (!ENTITY_MEMORY_KINDS.has(entityKind)) return { ...candidate, metadata }
    const candidateNames = [metadata.subject, candidate.title, ...metadata.aliases].map(normalizedEntityName).filter(Boolean)
    const matched = pool.find((item) => item.kind === entityKind && [item.metadata.subject, item.title, ...(item.metadata.aliases ?? [])]
      .map(normalizedEntityName).some((name) => candidateNames.some((candidateName) => sameEntityName(name, candidateName))))
    if (matched) {
      metadata.entityId = matched.metadata.entityId || matched.id
      metadata.aliases = [...new Set([
        ...(matched.metadata.aliases ?? []),
        ...metadata.aliases,
        ...(candidate.kind !== 'character_state' && normalizedEntityName(matched.title) !== normalizedEntityName(candidate.title) ? [candidate.title] : []),
      ])].filter(Boolean).slice(0, 20)
      const matchedFirst = matched.metadata.firstSeenChapterId || matched.chapterId
      metadata.firstSeenChapterId = (chapterOrder.get(matchedFirst) ?? Number.MAX_SAFE_INTEGER) <= (chapterOrder.get(metadata.firstSeenChapterId) ?? Number.MAX_SAFE_INTEGER)
        ? matchedFirst
        : metadata.firstSeenChapterId
    } else {
      metadata.entityId = candidate.id
    }
    const reconciled = { ...candidate, metadata }
    if (candidate.kind !== 'character_state') pool.push(reconciled)
    return reconciled
  })
}

export async function markStaleMemoryCandidates(project: ProjectState): Promise<string[]> {
  const chapterHash = new Map(project.chapters.map((chapter) => [chapter.id, chapter.contentHash]))
  const bundles = await getProjectMemory(project.id)
  const stale = bundles.flatMap((bundle) => {
    if (!bundle.memory || chapterHash.get(bundle.memory.chapterId) === bundle.memory.contentHash) return []
    return bundle.candidates.filter((candidate) => candidate.metadata.archivalSource !== 'author'
      && (candidate.status === 'confirmed' || candidate.status === 'archived'))
  })
  if (stale.length === 0) return []
  const now = Date.now()
  const chapterIds = [...new Set(stale.map((candidate) => candidate.chapterId))]
  if (!isTauri()) {
    const staleIds = new Set(stale.map((candidate) => candidate.id))
    for (const bundle of bundles) {
      const updated: ChapterMemoryBundle = {
        ...bundle,
        candidates: bundle.candidates.map((candidate) => staleIds.has(candidate.id)
          ? { ...candidate, status: 'stale' as const, updatedAt: now }
          : candidate),
      }
      if (updated.candidates.some((candidate, index) => candidate !== bundle.candidates[index])) await saveWebBundle(updated)
    }
    return chapterIds
  }
  const database = await getDatabase()
  for (const candidate of stale) {
    await database.execute(
      "UPDATE story_memory_candidates SET status = 'stale', updated_at = $1 WHERE id = $2 AND status IN ('confirmed', 'archived')",
      [now, candidate.id],
    )
  }
  return chapterIds
}
