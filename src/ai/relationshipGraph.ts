import type { MemoryCandidate } from '../data/storyMemoryStorage'
import type { ProjectState } from '../data/projectStorage'
import type { CharacterMemoryProfile } from './memoryWorkspace'

/**
 * 人物关系图与人物时间轴的纯派生层。
 * 数据全部来自已确认的故事记忆（CharacterMemoryProfile），不新增存储。
 */

export type RelationshipCategory = 'kin' | 'romance' | 'ally' | 'rival' | 'transaction' | 'other'

export const RELATIONSHIP_CATEGORY_LABELS: Record<RelationshipCategory, string> = {
  kin: '亲缘',
  romance: '情感',
  ally: '同盟',
  rival: '敌对',
  transaction: '利益',
  other: '其他',
}

const CATEGORY_RULES: Array<[RelationshipCategory, RegExp]> = [
  ['kin', /父|母|儿子|女儿|兄弟|姐妹|兄长|弟弟|姐姐|妹妹|夫妻|丈夫|妻子|婚约|未婚|血亲|家族|养父|养母|继父|继母|叔|伯|舅|姑|姨|祖|孙|亲子|胞/],
  ['romance', /恋人|情人|暗恋|爱慕|喜欢|相恋|旧情|初恋|心上人|倾心|情愫|爱意/],
  ['rival', /敌|仇|对立|追杀|背叛|宿敌|仇恨|反目|决裂|竞争|死对头|互斥|忌惮|威胁/],
  ['ally', /友|盟|同门|师徒|师父|徒弟|主仆|搭档|合作|同伴|战友|盟友|上下级|同僚|臣属|效忠|追随|麾下/],
  ['transaction', /雇佣|雇|债|契约|交易|买卖|欠|赊|包养|收买|贿赂|合作方|东家|掌柜|生意/],
]

export function categorizeRelationship(label: string, detail: string): RelationshipCategory {
  const source = `${label} ${detail}`
  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(source)) return category
  }
  return 'other'
}

export type RelationshipGraphScopeMode = 'book' | 'volume' | 'untilChapter'

export type RelationshipGraphScope = {
  mode: RelationshipGraphScopeMode
  volumeId?: string
  chapterId?: string
}

export type RelationshipGraphNode = {
  id: string
  name: string
  aliases: string[]
  evidenceCount: number
  degree: number
  firstSeenChapterIndex: number
}

export type RelationshipGraphEdge = {
  id: string
  sourceId: string
  targetId: string
  label: string
  detail: string
  category: RelationshipCategory
  chapterId: string
  chapterTitle: string
  chapterIndex: number
  candidateId: string
  evidenceQuote: string
  evidenceNodeId: string
  counterpartNames: string[]
}

export type RelationshipGraph = {
  nodes: RelationshipGraphNode[]
  edges: RelationshipGraphEdge[]
  unmatchedRelationships: number
  duplicatesCollapsed: number
}

function normalizeName(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

const PLACEHOLDER_NAMES = new Set(['王子', '公主', '骑士', '首席骑士', '大臣', '助理', '女巫', '男人', '女人', '少年', '少女', '老人', '孩子', '众人', '众人皆', '对方', '他们', '她们'])

function splitCounterparts(value: string) {
  return value.split(/[、,，/；;]/).map((item) => item.trim()).filter(Boolean)
}

/**
 * 构建人物关系图。
 * 只保留两端都能对上人物档案的关系；无法匹配的关系计入 unmatchedRelationships。
 */
export function buildRelationshipGraph(
  profiles: CharacterMemoryProfile[],
  project: ProjectState,
  scope: RelationshipGraphScope,
): RelationshipGraph {
  const chapterIndex = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  const chapterById = new Map(project.chapters.map((chapter) => [chapter.id, chapter]))
  const lastIndex = Math.max(0, project.chapters.length - 1)
  const targetIndex = scope.mode === 'untilChapter' && scope.chapterId ? chapterIndex.get(scope.chapterId) ?? lastIndex : lastIndex

  const nameToId = new Map<string, string>()
  for (const profile of profiles) {
    for (const name of [profile.name, ...profile.aliases]) {
      const key = normalizeName(name)
      if (key && !nameToId.has(key)) nameToId.set(key, profile.id)
    }
  }
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]))

  const resolveName = (name: string): string | undefined => {
    const key = normalizeName(name)
    if (!key) return undefined
    const exact = nameToId.get(key)
    if (exact) return exact
    if (PLACEHOLDER_NAMES.has(name)) return undefined
    for (const [known, id] of nameToId) {
      if (key.length >= 2 && known.length >= 2 && (known.includes(key) || key.includes(known))) return id
    }
    return undefined
  }

  const edges: RelationshipGraphEdge[] = []
  const seen = new Set<string>()
  const scopedProfileIds = new Set<string>()
  let unmatched = 0
  let duplicates = 0

  for (const profile of profiles) {
    for (const relationship of profile.relationships) {
      const candidate = relationship.candidate
      const chapterId = candidate.chapterId
      const index = chapterIndex.get(chapterId) ?? lastIndex

      // 时间范围过滤
      if (scope.mode === 'untilChapter') {
        const validToId = candidate.metadata.validToChapterId
        const validToIndex = validToId ? chapterIndex.get(validToId) ?? null : null
        if (index > targetIndex) continue
        if (validToIndex !== null && targetIndex >= validToIndex) continue
      }
      if (scope.mode === 'volume' && scope.volumeId) {
        const chapter = chapterById.get(chapterId)
        if (!chapter || chapter.volumeId !== scope.volumeId) continue
      }
      scopedProfileIds.add(profile.id)

      const counterpartNames = relationship.counterparts.filter(Boolean)
      const targetIds = new Set<string>()
      for (const name of counterpartNames) {
        const id = resolveName(name)
        if (id && id !== profile.id) targetIds.add(id)
      }
      // 兜底：从关系描述里找已知人名
      if (targetIds.size === 0) {
        const source = normalizeName(`${candidate.title} ${candidate.detail}`)
        for (const [known, id] of nameToId) {
          if (id === profile.id) continue
          if (known.length >= 2 && source.includes(known)) targetIds.add(id)
        }
      }
      if (targetIds.size === 0) {
        unmatched += 1
        continue
      }

      for (const targetId of targetIds) {
        const pairKey = [profile.id, targetId].sort().join('|')
        const edgeKey = `${candidate.id}|${pairKey}`
        if (seen.has(edgeKey)) {
          duplicates += 1
          continue
        }
        seen.add(edgeKey)
        const sourceProfile = profileById.get(profile.id)
        const targetProfile = profileById.get(targetId)
        if (!sourceProfile || !targetProfile) continue
        edges.push({
          id: edgeKey,
          sourceId: profile.id,
          targetId,
          label: candidate.title || relationship.title,
          detail: candidate.detail || relationship.value,
          category: categorizeRelationship(`${candidate.title} ${relationship.title}`, `${candidate.detail} ${relationship.value}`),
          chapterId,
          chapterTitle: chapterById.get(chapterId)?.title ?? '未知章节',
          chapterIndex: index,
          candidateId: candidate.id,
          evidenceQuote: candidate.evidenceQuote,
          evidenceNodeId: candidate.evidenceNodeId,
          counterpartNames,
        })
      }
    }
  }

  const degree = new Map<string, number>()
  for (const edge of edges) {
    degree.set(edge.sourceId, (degree.get(edge.sourceId) ?? 0) + 1)
    degree.set(edge.targetId, (degree.get(edge.targetId) ?? 0) + 1)
  }

  const nodes: RelationshipGraphNode[] = profiles
    .filter((profile) => (degree.get(profile.id) ?? 0) > 0 || scopedProfileIds.has(profile.id))
    .map((profile) => ({
      id: profile.id,
      name: profile.name,
      aliases: profile.aliases,
      evidenceCount: profile.evidenceCount,
      degree: degree.get(profile.id) ?? 0,
      firstSeenChapterIndex: chapterIndex.get(profile.firstSeenChapterId) ?? 0,
    }))
    .sort((left, right) => right.degree - left.degree || left.name.localeCompare(right.name, 'zh-CN'))

  return { nodes, edges, unmatchedRelationships: unmatched, duplicatesCollapsed: duplicates }
}

/** 从关系边取回原始记忆候选，用于“查看原文”。 */
export function relationshipEdgeCandidate(profiles: CharacterMemoryProfile[], edge: RelationshipGraphEdge): MemoryCandidate | null {
  for (const profile of profiles) {
    for (const relationship of profile.relationships) {
      if (relationship.candidate.id === edge.candidateId) return relationship.candidate
    }
  }
  return null
}

export type CharacterTimelineEntry = {
  id: string
  profileId: string
  profileName: string
  aspect: string
  value: string
  previousValue: string
  chapterId: string
  chapterTitle: string
  chapterIndex: number
  storyTime: string
  candidateId: string
  evidenceQuote: string
  evidenceNodeId: string
}

export type CharacterTimelineLane = {
  id: string
  name: string
  entries: CharacterTimelineEntry[]
}

export type CharacterTimeline = {
  lanes: CharacterTimelineLane[]
  chapters: Array<{ id: string; title: string; index: number }>
  aspects: string[]
}

export type CharacterTimelineOptions = {
  maxLanes?: number
  profileIds?: string[]
}

export function buildCharacterTimeline(
  profiles: CharacterMemoryProfile[],
  project: ProjectState,
  options: CharacterTimelineOptions = {},
): CharacterTimeline {
  const chapterIndex = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  const chapterById = new Map(project.chapters.map((chapter) => [chapter.id, chapter]))
  const fallback = Math.max(0, project.chapters.length - 1)

  const eligible = options.profileIds && options.profileIds.length > 0
    ? profiles.filter((profile) => options.profileIds?.includes(profile.id))
    : [...profiles].sort((left, right) => right.evidenceCount - left.evidenceCount || left.name.localeCompare(right.name, 'zh-CN')).slice(0, options.maxLanes ?? 6)

  const lanes: CharacterTimelineLane[] = []
  const aspects = new Set<string>()
  for (const profile of eligible) {
    if (profile.timeline.length === 0) continue
    const entries: CharacterTimelineEntry[] = profile.timeline
      .map((snapshot, index) => ({
        id: `${profile.id}-${snapshot.candidate.id}-${index}`,
        profileId: profile.id,
        profileName: profile.name,
        aspect: snapshot.aspect,
        value: snapshot.value,
        previousValue: snapshot.previousValue,
        chapterId: snapshot.chapterId,
        chapterTitle: chapterById.get(snapshot.chapterId)?.title ?? '未知章节',
        chapterIndex: chapterIndex.get(snapshot.chapterId) ?? fallback,
        storyTime: snapshot.candidate.metadata.storyTime,
        candidateId: snapshot.candidate.id,
        evidenceQuote: snapshot.candidate.evidenceQuote,
        evidenceNodeId: snapshot.candidate.evidenceNodeId,
      }))
      .sort((left, right) => left.chapterIndex - right.chapterIndex)
    for (const entry of entries) aspects.add(entry.aspect)
    lanes.push({ id: profile.id, name: profile.name, entries })
  }

  return {
    lanes,
    chapters: project.chapters.map((chapter, index) => ({ id: chapter.id, title: chapter.title, index })),
    aspects: [...aspects].sort((left, right) => left.localeCompare(right, 'zh-CN')),
  }
}

export function timelineEntryCandidate(profiles: CharacterMemoryProfile[], entry: CharacterTimelineEntry): MemoryCandidate | null {
  for (const profile of profiles) {
    if (profile.id !== entry.profileId) continue
    for (const snapshot of profile.timeline) {
      if (snapshot.candidate.id === entry.candidateId) return snapshot.candidate
    }
  }
  return null
}