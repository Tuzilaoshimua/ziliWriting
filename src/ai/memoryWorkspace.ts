import type { ProjectState } from '../data/projectStorage'
import { confirmedCurrentMemory, memoryBundleIsCurrent, type ChapterMemoryBundle, type MemoryCandidate, type MemoryLifecycle } from '../data/storyMemoryStorage'
import type { ReviewIssue, ReviewSeverity } from '../data/reviewStorage'
import { isUsableChapterSummary } from './storyMemory'

export type CharacterStateSnapshot = {
  aspect: string
  value: string
  previousValue: string
  chapterId: string
  candidate: MemoryCandidate
}

export type CharacterProfileFact = {
  category: string
  value: string
  chapterId: string
  candidate: MemoryCandidate
}

export type CharacterRelationshipMemory = {
  title: string
  counterparts: string[]
  value: string
  chapterId: string
  candidate: MemoryCandidate
}

export type CharacterMemoryProfile = {
  id: string
  name: string
  aliases: string[]
  firstSeenChapterId: string
  facts: CharacterProfileFact[]
  states: CharacterStateSnapshot[]
  relationships: CharacterRelationshipMemory[]
  timeline: CharacterStateSnapshot[]
  evidenceCount: number
}

export type StoryThread = {
  candidate: MemoryCandidate
  lifecycle: MemoryLifecycle
  owner: string
  target: string
}

export type ChapterDigestEntry = {
  chapterId: string
  chapterTitle: string
  summary: string
  current: boolean
}

export type VolumeMemoryDigest = {
  volumeId: string
  title: string
  chapterCount: number
  analyzedCount: number
  currentCount: number
  summary: string
  chapters: ChapterDigestEntry[]
}

export type ProjectMemoryDigest = {
  chapterCount: number
  analyzedCount: number
  currentCount: number
  summary: string
  volumes: VolumeMemoryDigest[]
}

function normalized(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

function currentConfirmedCandidates(project: ProjectState, bundles: ChapterMemoryBundle[]) {
  return confirmedCurrentMemory(bundles, project)
}

function matchingNameId(names: string[], nameToId: Map<string, string>) {
  const normalizedNames = names.map(normalized).filter(Boolean)
  for (const name of normalizedNames) {
    const exact = nameToId.get(name)
    if (exact) return exact
  }
  for (const name of normalizedNames) {
    for (const [known, id] of nameToId) {
      const shorter = name.length <= known.length ? name : known
      const longer = name.length > known.length ? name : known
      if (shorter.length >= 2 && longer.includes(shorter) && !/^(?:王子|公主|骑士|首席骑士|大臣|助理|女巫|男人|女人|少年|少女)$/.test(shorter)) return id
    }
  }
  return undefined
}

export function buildCharacterMemoryProfiles(project: ProjectState, bundles: ChapterMemoryBundle[]): CharacterMemoryProfile[] {
  const chapterOrder = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  const candidates = currentConfirmedCandidates(project, bundles)
  const characters = candidates.filter((candidate) => candidate.kind === 'character')
  const states = candidates.filter((candidate) => candidate.kind === 'character_state')
  const relationships = candidates.filter((candidate) => candidate.kind === 'relationship')
  const profiles = new Map<string, CharacterMemoryProfile>()
  const nameToId = new Map<string, string>()
  const evidenceByProfile = new Map<string, Set<string>>()

  const emptyProfile = (id: string, name: string, firstSeenChapterId: string): CharacterMemoryProfile => ({
    id,
    name,
    aliases: [],
    firstSeenChapterId,
    facts: [],
    states: [],
    relationships: [],
    timeline: [],
    evidenceCount: 0,
  })
  const earlierChapter = (current: string, candidate: string) => (chapterOrder.get(current) ?? Number.MAX_SAFE_INTEGER) <= (chapterOrder.get(candidate) ?? Number.MAX_SAFE_INTEGER)
    ? current
    : candidate
  const rememberEvidence = (profileId: string, candidateId: string) => {
    const evidence = evidenceByProfile.get(profileId) ?? new Set<string>()
    evidence.add(candidateId)
    evidenceByProfile.set(profileId, evidence)
  }
  const factCategory = (candidate: MemoryCandidate, profileName: string) => {
    const source = `${candidate.title} ${candidate.detail}`
    if (/身份|职业|职位|地位|角色|阵营/.test(source)) return '身份'
    if (/外貌|容貌|身高|体型|发色|眼睛|穿着|衣着/.test(source)) return '外貌'
    if (/背景|出身|过去|经历|家世|来历/.test(source)) return '背景'
    if (/性格|个性|习惯|偏好|厌恶/.test(source)) return '性格'
    if (/能力|技能|天赋|异能|修为|武器/.test(source)) return '能力'
    if (/目标|动机|愿望|执念|追求/.test(source)) return '长期动机'
    if (/说话|口吻|语气|措辞|口头禅/.test(source)) return '说话方式'
    return normalized(candidate.title) !== normalized(profileName) ? candidate.title : '人物资料'
  }

  for (const candidate of characters) {
    const id = matchingNameId([candidate.title, ...(candidate.metadata.aliases ?? [])], nameToId) || candidate.metadata.entityId || candidate.id
    const existing = profiles.get(id) ?? emptyProfile(id, candidate.title, candidate.metadata.firstSeenChapterId || candidate.chapterId)
    const aliases = [...new Set([...(existing?.aliases ?? []), ...(candidate.metadata.aliases ?? []), ...(existing.name !== candidate.title ? [candidate.title] : [])])].filter(Boolean)
    const firstSeenChapterId = earlierChapter(existing.firstSeenChapterId, candidate.metadata.firstSeenChapterId || candidate.chapterId)
    const fact: CharacterProfileFact = { category: factCategory(candidate, existing.name || candidate.title), value: candidate.detail, chapterId: candidate.chapterId, candidate }
    const facts = existing.facts.some((item) => normalized(item.value) === normalized(fact.value)) ? existing.facts : [...existing.facts, fact]
    profiles.set(id, {
      ...existing,
      id,
      name: existing?.name || candidate.title,
      aliases,
      firstSeenChapterId,
      facts,
    })
    rememberEvidence(id, candidate.id)
    for (const name of [candidate.title, ...aliases]) if (normalized(name)) nameToId.set(normalized(name), id)
  }

  for (const candidate of states) {
    const subject = candidate.metadata.subject || candidate.metadata.participants.split(/[、,，]/)[0]?.trim() || candidate.title
    const matchedId = matchingNameId([subject], nameToId) || candidate.metadata.entityId || `state:${normalized(subject) || candidate.id}`
    const profile = profiles.get(matchedId) ?? emptyProfile(matchedId, subject, candidate.metadata.firstSeenChapterId || candidate.chapterId)
    const aspect = candidate.metadata.stateAspect || '其他状态'
    const snapshot: CharacterStateSnapshot = {
      aspect,
      value: candidate.metadata.stateValue || candidate.detail,
      previousValue: candidate.metadata.previousStateValue,
      chapterId: candidate.chapterId,
      candidate,
    }
    profile.timeline.push(snapshot)
    profile.firstSeenChapterId = earlierChapter(profile.firstSeenChapterId, candidate.metadata.firstSeenChapterId || candidate.chapterId)
    profiles.set(matchedId, profile)
    rememberEvidence(matchedId, candidate.id)
    if (normalized(subject)) nameToId.set(normalized(subject), matchedId)
  }

  const splitParticipants = (value: string) => value.split(/[、,，/]/).map((item) => item.trim()).filter(Boolean)
  for (const candidate of relationships) {
    const participants = splitParticipants(candidate.metadata.participants)
    const matchedIds = new Set<string>()
    for (const participant of participants) {
      const id = nameToId.get(normalized(participant))
      if (id) matchedIds.add(id)
    }
    if (matchedIds.size === 0) {
      const source = normalized(`${candidate.title} ${candidate.detail}`)
      for (const [name, id] of nameToId) if (name.length >= 2 && source.includes(name)) matchedIds.add(id)
    }
    for (const id of matchedIds) {
      const profile = profiles.get(id)
      if (!profile) continue
      const counterparts = participants.filter((participant) => nameToId.get(normalized(participant)) !== id)
      profile.relationships.push({
        title: candidate.title,
        counterparts,
        value: candidate.detail,
        chapterId: candidate.chapterId,
        candidate,
      })
      profile.firstSeenChapterId = earlierChapter(profile.firstSeenChapterId, candidate.chapterId)
      rememberEvidence(id, candidate.id)
    }
  }

  const finalChapterIndex = Math.max(0, project.chapters.length - 1)
  const currentStates = (timeline: CharacterStateSnapshot[]) => {
    const latest = new Map<string, CharacterStateSnapshot>()
    const ordered = [...timeline].sort((left, right) => (chapterOrder.get(left.chapterId) ?? -1) - (chapterOrder.get(right.chapterId) ?? -1) || left.candidate.updatedAt - right.candidate.updatedAt)
    for (const state of ordered) {
      const validTo = state.candidate.metadata.validToChapterId
      if (validTo && finalChapterIndex >= (chapterOrder.get(validTo) ?? Number.MAX_SAFE_INTEGER)) continue
      latest.set(normalized(state.aspect), state)
    }
    return [...latest.values()].sort((left, right) => left.aspect.localeCompare(right.aspect, 'zh-CN'))
  }

  return [...profiles.values()]
    .map((profile) => ({
      ...profile,
      facts: profile.facts.sort((left, right) => (chapterOrder.get(left.chapterId) ?? 0) - (chapterOrder.get(right.chapterId) ?? 0)),
      states: currentStates(profile.timeline),
      relationships: profile.relationships.sort((left, right) => (chapterOrder.get(right.chapterId) ?? 0) - (chapterOrder.get(left.chapterId) ?? 0)),
      timeline: profile.timeline.sort((left, right) => (chapterOrder.get(left.chapterId) ?? 0) - (chapterOrder.get(right.chapterId) ?? 0) || left.candidate.updatedAt - right.candidate.updatedAt),
      evidenceCount: evidenceByProfile.get(profile.id)?.size ?? 0,
    }))
    .sort((left, right) => right.evidenceCount - left.evidenceCount || left.name.localeCompare(right.name, 'zh-CN'))
}

export function buildStoryThreads(project: ProjectState, bundles: ChapterMemoryBundle[]): StoryThread[] {
  const chapterOrder = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  return currentConfirmedCandidates(project, bundles)
    .filter((candidate) => ['foreshadowing', 'commitment', 'plot', 'secret'].includes(candidate.kind))
    .map((candidate) => ({
      candidate,
      lifecycle: candidate.metadata.lifecycle,
      owner: candidate.metadata.responsibleParty || candidate.metadata.participants || candidate.metadata.knower,
      target: candidate.metadata.target || candidate.metadata.affectedScope,
    }))
    .sort((left, right) => {
      const lifecycleOrder: Record<MemoryLifecycle, number> = { active: 0, resolved: 1, superseded: 2, abandoned: 3 }
      return lifecycleOrder[left.lifecycle] - lifecycleOrder[right.lifecycle]
        || (chapterOrder.get(right.candidate.chapterId) ?? 0) - (chapterOrder.get(left.candidate.chapterId) ?? 0)
    })
}

function compactChapterLines(entries: ChapterDigestEntry[], maximumEntries: number) {
  if (entries.length <= maximumEntries) return entries
  const headCount = Math.ceil(maximumEntries / 3)
  const tailCount = maximumEntries - headCount
  return [...entries.slice(0, headCount), ...entries.slice(-tailCount)]
}

export function buildProjectMemoryDigest(project: ProjectState, bundles: ChapterMemoryBundle[]): ProjectMemoryDigest {
  const bundleByChapter = new Map(bundles.filter((bundle) => bundle.memory).map((bundle) => [bundle.memory!.chapterId, bundle]))
  const volumes = project.volumes.map((volume): VolumeMemoryDigest => {
    const volumeChapters = project.chapters.filter((chapter) => chapter.volumeId === volume.id)
    const chapters = volumeChapters.flatMap((chapter): ChapterDigestEntry[] => {
      const bundle = bundleByChapter.get(chapter.id)
      const summary = bundle?.memory?.summary ?? ''
      if (!bundle || !isUsableChapterSummary(summary)) return []
      return [{
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        summary: summary.trim(),
        current: memoryBundleIsCurrent(bundle, project),
      }]
    })
    const selected = compactChapterLines(chapters, 18)
    const omitted = Math.max(0, chapters.length - selected.length)
    const summary = selected.map((entry) => `${entry.chapterTitle}：${entry.summary.slice(0, 180)}`).join('\n')
      + (omitted ? `\n……另有 ${omitted} 章摘要，可在章节列表中查看。` : '')
    return {
      volumeId: volume.id,
      title: volume.title,
      chapterCount: volumeChapters.length,
      analyzedCount: chapters.length,
      currentCount: chapters.filter((entry) => entry.current).length,
      summary,
      chapters,
    }
  })
  const analyzedCount = volumes.reduce((total, volume) => total + volume.analyzedCount, 0)
  const currentCount = volumes.reduce((total, volume) => total + volume.currentCount, 0)
  const summary = volumes.filter((volume) => volume.analyzedCount > 0)
    .map((volume) => `${volume.title}（${volume.currentCount}/${volume.chapterCount} 章同步）\n${volume.summary.slice(0, 900)}`)
    .join('\n\n')
  return { chapterCount: project.chapters.length, analyzedCount, currentCount, summary, volumes }
}

function stableIssueId(parts: string[]) {
  const source = parts.join('|')
  let hash = 0x811c9dc5
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `memory-consistency-${(hash >>> 0).toString(16)}`
}

function issueFromCandidates(project: ProjectState, candidates: MemoryCandidate[], severity: ReviewSeverity, title: string, detail: string, suggestion: string): ReviewIssue {
  const chapters = new Map(project.chapters.map((chapter) => [chapter.id, chapter]))
  const latest = candidates.reduce((selected, candidate) => {
    const selectedIndex = project.chapters.findIndex((chapter) => chapter.id === selected.chapterId)
    const candidateIndex = project.chapters.findIndex((chapter) => chapter.id === candidate.chapterId)
    return candidateIndex > selectedIndex ? candidate : selected
  })
  const now = Date.now()
  return {
    id: stableIssueId([title, ...candidates.map((candidate) => candidate.id).sort()]),
    projectId: project.id,
    chapterId: latest.chapterId,
    category: latest.kind === 'world' ? 'world' : latest.kind === 'character_state' ? 'character' : 'timeline',
    severity,
    status: 'open',
    source: 'memory_consistency',
    title,
    detail,
    suggestion,
    evidence: candidates.map((candidate) => ({
      chapterId: candidate.chapterId,
      chapterTitle: chapters.get(candidate.chapterId)?.title ?? '未知章节',
      nodeId: candidate.evidenceNodeId,
      quote: candidate.evidenceQuote,
      revisionNumber: candidate.metadata.sourceRevisionNumber,
      startOffsetInNode: candidate.metadata.evidenceStartOffset,
      endOffsetInNode: candidate.metadata.evidenceEndOffset,
      role: 'contradict',
    })),
    contentHash: chapters.get(latest.chapterId)?.contentHash ?? '',
    createdAt: now,
    updatedAt: now,
  }
}

export function detectMemoryConsistencyIssues(project: ProjectState, bundles: ChapterMemoryBundle[]): ReviewIssue[] {
  const candidates = currentConfirmedCandidates(project, bundles)
  const chapterOrder = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
  const issues: ReviewIssue[] = []
  const exactStateGroups = new Map<string, MemoryCandidate[]>()

  for (const candidate of candidates.filter((item) => item.kind === 'character_state')) {
    const subject = candidate.metadata.subject || candidate.metadata.participants || candidate.title
    const aspect = candidate.metadata.stateAspect || '其他状态'
    const key = `${normalized(subject)}|${normalized(aspect)}|${candidate.metadata.validFromChapterId || candidate.chapterId}`
    const group = exactStateGroups.get(key) ?? []
    group.push(candidate)
    exactStateGroups.set(key, group)
  }
  for (const group of exactStateGroups.values()) {
    const values = new Set(group.map((candidate) => normalized(candidate.metadata.stateValue || candidate.detail)))
    if (group.length > 1 && values.size > 1) {
      const subject = group[0].metadata.subject || group[0].metadata.participants || group[0].title
      const aspect = group[0].metadata.stateAspect || '状态'
      issues.push(issueFromCandidates(project, group, 'error', `${subject}的${aspect}存在冲突`, `同一生效章节记录了 ${[...new Set(group.map((candidate) => candidate.metadata.stateValue || candidate.detail))].join('、')} 等不同状态。`, '核对原文后保留正确资料，或调整其中一条资料的生效、失效章节。'))
    }
  }

  const worldGroups = new Map<string, MemoryCandidate[]>()
  for (const candidate of candidates.filter((item) => item.kind === 'world')) {
    const key = normalized(candidate.metadata.entityId || candidate.title)
    const group = worldGroups.get(key) ?? []
    group.push(candidate)
    worldGroups.set(key, group)
  }
  for (const group of worldGroups.values()) {
    const active = group.filter((candidate) => !candidate.metadata.validToChapterId && candidate.metadata.lifecycle === 'active')
    const details = new Set(active.map((candidate) => normalized(candidate.detail)))
    if (active.length > 1 && details.size > 1) {
      issues.push(issueFromCandidates(project, active.slice(0, 4), 'warning', `世界规则“${active[0].title}”存在多个有效版本`, '这些规则目前都没有失效章节，但内容并不一致。', '确认这是规则补充、例外还是冲突；若为替代关系，请关闭旧规则的有效期。'))
    }
  }

  const stateBySubject = new Map<string, MemoryCandidate[]>()
  for (const candidate of candidates.filter((item) => item.kind === 'character_state' && /生死|生命|存活/.test(item.metadata.stateAspect))) {
    const key = normalized(candidate.metadata.subject || candidate.metadata.participants || candidate.title)
    const group = stateBySubject.get(key) ?? []
    group.push(candidate)
    stateBySubject.set(key, group)
  }
  for (const group of stateBySubject.values()) {
    const sorted = [...group].sort((left, right) => (chapterOrder.get(left.chapterId) ?? 0) - (chapterOrder.get(right.chapterId) ?? 0))
    for (let index = 1; index < sorted.length; index += 1) {
      const before = sorted[index - 1]
      const after = sorted[index]
      const beforeValue = `${before.metadata.stateValue}${before.detail}`
      const afterValue = `${after.metadata.stateValue}${after.detail}`
      if (/死亡|已死|身亡|毙命/.test(beforeValue) && /存活|活着|生还|苏醒/.test(afterValue) && !/复活|起死回生|假死/.test(afterValue)) {
        const subject = after.metadata.subject || after.metadata.participants || after.title
        issues.push(issueFromCandidates(project, [before, after], 'error', `${subject}的生死状态可能断裂`, '较早资料记录角色死亡，后续资料又记录其存活，但没有发现复活或假死说明。', '检查中间章节是否缺少状态转折；若原文已有说明，请补充并确认对应故事记忆。'))
      }
    }
  }

  const severityOrder: Record<ReviewSeverity, number> = { error: 0, warning: 1, info: 2 }
  return issues.sort((left, right) => severityOrder[left.severity] - severityOrder[right.severity])
}
