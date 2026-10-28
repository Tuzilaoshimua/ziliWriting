import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webGet, webPut } from './webDatabase'

export type OutlineLevel = 'world' | 'character' | 'stage' | 'volume' | 'chapter' | 'scene'

export type CreativeBrief = {
  projectId: string
  premise: string
  genre: string
  coreExperience: string
  theme: string
  protagonistDesire: string
  stakes: string
  centralConflict: string
  lengthTarget: string
  endingTendency: string
  updatedAt: number
}

export type OutlineNode = {
  id: string
  projectId: string
  parentId: string | null
  level: OutlineLevel
  title: string
  summary: string
  locked: boolean
  sortOrder: number
  source: 'author' | 'ai'
  updatedAt: number
}

export type AdvisorDirection = {
  id: string
  title: string
  approach: string
  benefits: string
  costs: string
  risks: string
  nextBeat: string
}

export type AdvisorSession = {
  id: string
  projectId: string
  chapterId: string
  sceneId: string | null
  situation: string
  obstacle: string
  directions: AdvisorDirection[]
  userNote: string
  createdAt: number
}

export type CreativeWorkspace = {
  brief: CreativeBrief
  outline: OutlineNode[]
  sessions: AdvisorSession[]
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

export function emptyCreativeBrief(projectId: string): CreativeBrief {
  return {
    projectId,
    premise: '',
    genre: '',
    coreExperience: '',
    theme: '',
    protagonistDesire: '',
    stakes: '',
    centralConflict: '',
    lengthTarget: '',
    endingTendency: '',
    updatedAt: Date.now(),
  }
}

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function loadCreativeWorkspace(projectId: string): Promise<CreativeWorkspace> {
  if (!isTauri()) {
    return await webGet<CreativeWorkspace>('creativeWorkspaces', projectId)
      ?? { brief: emptyCreativeBrief(projectId), outline: [], sessions: [] }
  }
  const database = await getDatabase()
  const briefs = await database.select<Array<{
    project_id: string
    premise: string
    genre: string
    core_experience: string
    theme: string
    protagonist_desire: string
    stakes: string
    central_conflict: string
    length_target: string
    ending_tendency: string
    updated_at: number
  }>>('SELECT project_id, premise, genre, core_experience, theme, protagonist_desire, stakes, central_conflict, length_target, ending_tendency, updated_at FROM creative_briefs WHERE project_id = $1 LIMIT 1', [projectId])
  const outline = await database.select<Array<{
    id: string
    project_id: string
    parent_id: string | null
    level: OutlineLevel
    title: string
    summary: string
    locked: number
    sort_order: number
    source: 'author' | 'ai'
    updated_at: number
  }>>('SELECT id, project_id, parent_id, level, title, summary, locked, sort_order, source, updated_at FROM outline_nodes WHERE project_id = $1 ORDER BY sort_order ASC, updated_at ASC', [projectId])
  const sessions = await database.select<Array<{
    id: string
    project_id: string
    chapter_id: string
    scene_id: string | null
    situation: string
    obstacle: string
    directions_json: string
    user_note: string
    created_at: number
  }>>('SELECT id, project_id, chapter_id, scene_id, situation, obstacle, directions_json, user_note, created_at FROM advisor_sessions WHERE project_id = $1 ORDER BY created_at DESC LIMIT 20', [projectId])
  const stored = briefs[0]
  return {
    brief: stored ? {
      projectId: stored.project_id,
      premise: stored.premise,
      genre: stored.genre,
      coreExperience: stored.core_experience,
      theme: stored.theme,
      protagonistDesire: stored.protagonist_desire,
      stakes: stored.stakes,
      centralConflict: stored.central_conflict,
      lengthTarget: stored.length_target,
      endingTendency: stored.ending_tendency,
      updatedAt: stored.updated_at,
    } : emptyCreativeBrief(projectId),
    outline: outline.map((node) => ({
      id: node.id,
      projectId: node.project_id,
      parentId: node.parent_id,
      level: node.level,
      title: node.title,
      summary: node.summary,
      locked: Boolean(node.locked),
      sortOrder: node.sort_order,
      source: node.source,
      updatedAt: node.updated_at,
    })),
    sessions: sessions.map((session) => {
      let directions: AdvisorDirection[] = []
      try { directions = JSON.parse(session.directions_json) as AdvisorDirection[] } catch { directions = [] }
      return {
        id: session.id,
        projectId: session.project_id,
        chapterId: session.chapter_id,
        sceneId: session.scene_id,
        situation: session.situation,
        obstacle: session.obstacle,
        directions,
        userNote: session.user_note,
        createdAt: session.created_at,
      }
    }),
  }
}

export async function saveCreativeBrief(brief: CreativeBrief): Promise<void> {
  if (!isTauri()) {
    const workspace = await loadCreativeWorkspace(brief.projectId)
    await webPut('creativeWorkspaces', brief.projectId, { ...workspace, brief }, { projectId: brief.projectId, updatedAt: brief.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO creative_briefs (project_id, premise, genre, core_experience, theme, protagonist_desire, stakes, central_conflict, length_target, ending_tendency, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT(project_id) DO UPDATE SET premise = excluded.premise, genre = excluded.genre,
       core_experience = excluded.core_experience, theme = excluded.theme, protagonist_desire = excluded.protagonist_desire,
       stakes = excluded.stakes, central_conflict = excluded.central_conflict, length_target = excluded.length_target,
       ending_tendency = excluded.ending_tendency, updated_at = excluded.updated_at`,
    [brief.projectId, brief.premise, brief.genre, brief.coreExperience, brief.theme, brief.protagonistDesire, brief.stakes, brief.centralConflict, brief.lengthTarget, brief.endingTendency, brief.updatedAt],
  )
}

export async function saveOutlineNode(node: OutlineNode): Promise<void> {
  if (!isTauri()) {
    const workspace = await loadCreativeWorkspace(node.projectId)
    const index = workspace.outline.findIndex((item) => item.id === node.id)
    if (index >= 0) workspace.outline[index] = node
    else workspace.outline.push(node)
    await webPut('creativeWorkspaces', node.projectId, workspace, { projectId: node.projectId, updatedAt: node.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO outline_nodes (id, project_id, parent_id, level, title, summary, locked, sort_order, source, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT(id) DO UPDATE SET parent_id = excluded.parent_id, level = excluded.level, title = excluded.title,
       summary = excluded.summary, locked = excluded.locked, sort_order = excluded.sort_order,
       source = excluded.source, updated_at = excluded.updated_at`,
    [node.id, node.projectId, node.parentId, node.level, node.title, node.summary, node.locked ? 1 : 0, node.sortOrder, node.source, node.updatedAt],
  )
}

export async function deleteOutlineNode(projectId: string, nodeId: string): Promise<void> {
  if (!isTauri()) {
    const workspace = await loadCreativeWorkspace(projectId)
    workspace.outline = workspace.outline.filter((node) => node.id !== nodeId && node.parentId !== nodeId)
    await webPut('creativeWorkspaces', projectId, workspace, { projectId })
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM outline_nodes WHERE project_id = $1 AND (id = $2 OR parent_id = $2)', [projectId, nodeId])
}

export async function saveAdvisorSession(session: AdvisorSession): Promise<void> {
  if (!isTauri()) {
    const workspace = await loadCreativeWorkspace(session.projectId)
    workspace.sessions = [session, ...workspace.sessions.filter((item) => item.id !== session.id)].slice(0, 20)
    await webPut('creativeWorkspaces', session.projectId, workspace, { projectId: session.projectId, updatedAt: session.createdAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO advisor_sessions (id, project_id, chapter_id, scene_id, situation, obstacle, directions_json, user_note, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT(id) DO UPDATE SET situation = excluded.situation, obstacle = excluded.obstacle,
       directions_json = excluded.directions_json, user_note = excluded.user_note`,
    [session.id, session.projectId, session.chapterId, session.sceneId, session.situation, session.obstacle, JSON.stringify(session.directions), session.userNote, session.createdAt],
  )
}
