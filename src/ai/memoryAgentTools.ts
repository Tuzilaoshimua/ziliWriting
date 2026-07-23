import type { ProjectState } from '../data/projectStorage'
import type { ChapterMemoryBundle, MemoryCandidate, MemoryLifecycle } from '../data/storyMemoryStorage'
import { confirmedCurrentMemory } from '../data/storyMemoryStorage'
import type { AgentMemoryMutation } from './agentAssistant'
import { buildCharacterMemoryProfiles } from './memoryWorkspace'

function normalized(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

function matchProfile(project: ProjectState, bundles: ChapterMemoryBundle[], rawName: string) {
  const name = normalized(rawName)
  if (!name) return null
  const profiles = buildCharacterMemoryProfiles(project, bundles)
  return profiles.find((profile) => [profile.name, ...profile.aliases].some((known) => normalized(known) === name))
    ?? profiles.find((profile) => [profile.name, ...profile.aliases].some((known) => {
      const candidate = normalized(known)
      const shorter = candidate.length <= name.length ? candidate : name
      const longer = candidate.length > name.length ? candidate : name
      return shorter.length >= 2 && longer.includes(shorter)
    }))
    ?? null
}

function profileCandidateIds(project: ProjectState, bundles: ChapterMemoryBundle[], profileId: string) {
  const profile = buildCharacterMemoryProfiles(project, bundles).find((item) => item.id === profileId)
  if (!profile) return []
  return [...new Set([
    ...profile.facts.map((item) => item.candidate.id),
    ...profile.timeline.map((item) => item.candidate.id),
    ...profile.relationships.map((item) => item.candidate.id),
  ])]
}

function lifecycleValue(request: string): MemoryLifecycle | null {
  if (/(?:已解决|已回收|已兑现|已揭晓|结束|完成)/.test(request)) return 'resolved'
  if (/(?:已废弃|放弃|不再使用)/.test(request)) return 'abandoned'
  if (/(?:已替代|被替代|已覆盖|失效)/.test(request)) return 'superseded'
  if (/(?:进行中|重新启用|激活|未解决)/.test(request)) return 'active'
  return null
}

function closestMemory(candidates: MemoryCandidate[], rawTitle: string) {
  const title = normalized(rawTitle)
  if (!title) return null
  return candidates.find((candidate) => normalized(candidate.title) === title)
    ?? candidates.find((candidate) => {
      const known = normalized(candidate.title)
      return known.length >= 2 && (known.includes(title) || title.includes(known))
    })
    ?? null
}

export function buildAgentMemoryMutationPreviews(
  project: ProjectState,
  bundles: ChapterMemoryBundle[],
  request: string,
): { mutations: AgentMemoryMutation[]; error?: string } {
  const now = Date.now()
  const mutations: AgentMemoryMutation[] = []
  const aliasMatch = request.match(/(?:把|将)?\s*([^，。、“”"'\n]{1,24}?)\s*(?:的)?(?:别名|昵称|化名|称呼)\s*(?:设为|改为|加为|添加为|记录为|是|叫)\s*[“"']?([^，””"'。\n]{1,24})/)
  if (aliasMatch) {
    const profile = matchProfile(project, bundles, aliasMatch[1].trim())
    if (!profile) return { mutations, error: `没有在已确认故事记忆中找到人物“${aliasMatch[1].trim()}”` }
    const alias = aliasMatch[2].trim()
    mutations.push({
      id: crypto.randomUUID(), kind: 'add_alias', status: 'candidate', title: `为${profile.name}添加别名`,
      detail: `把“${alias}”加入${profile.name}的别名；原有人物资料和证据保持不变。`, targetName: profile.name,
      targetCandidateIds: profileCandidateIds(project, bundles, profile.id), value: alias, createdAt: now,
    })
  }

  const mergeMatch = request.match(/(?:把|将|合并)?\s*([^，。、“”"'\n]{1,20}?)\s*(?:和|与)\s*([^，。、“”"'\n]{1,20}?)\s*(?:合并|视为同一(?:人|角色|人物)?|标记为同一(?:人|角色|人物)?)/)
  if (mergeMatch) {
    const target = matchProfile(project, bundles, mergeMatch[1].trim())
    const source = matchProfile(project, bundles, mergeMatch[2].trim())
    if (!target || !source) return { mutations, error: `无法同时找到“${mergeMatch[1].trim()}”和“${mergeMatch[2].trim()}”的人物资料` }
    if (target.id === source.id) return { mutations, error: `${target.name}和${source.name}已经指向同一人物` }
    mutations.push({
      id: crypto.randomUUID(), kind: 'merge_entities', status: 'candidate', title: `合并${target.name}与${source.name}`,
      detail: `以“${target.name}”为主名称，把“${source.name}”及其证据合并到同一人物；不会删除原文证据。`,
      targetName: target.name, targetCandidateIds: profileCandidateIds(project, bundles, target.id),
      secondaryName: source.name, secondaryCandidateIds: profileCandidateIds(project, bundles, source.id), value: target.id, createdAt: now,
    })
  }

  const lifecycle = lifecycleValue(request)
  const lifecycleMatch = lifecycle && request.match(/(?:把|将)\s*[“"']?([^，””"'。\n]{1,36})[”"']?\s*(?:标记|设为|改为)/)
  if (lifecycle && lifecycleMatch) {
    const candidates = confirmedCurrentMemory(bundles, project).filter((candidate) => ['foreshadowing', 'commitment', 'plot', 'secret'].includes(candidate.kind))
    const target = closestMemory(candidates, lifecycleMatch[1].trim())
    if (!target) return { mutations, error: `没有在已确认线索中找到“${lifecycleMatch[1].trim()}”` }
    mutations.push({
      id: crypto.randomUUID(), kind: 'set_lifecycle', status: 'candidate', title: `更新线索“${target.title}”`,
      detail: `把这条${target.kind === 'foreshadowing' ? '伏笔' : target.kind === 'commitment' ? '承诺' : target.kind === 'secret' ? '秘密' : '情节线'}的生命周期改为“${lifecycle}”。`,
      targetName: target.title, targetCandidateIds: [target.id], value: lifecycle, createdAt: now,
    })
  }
  return { mutations }
}
