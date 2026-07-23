import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webGet, webPut } from './webDatabase'

export type StyleProfile = {
  projectId: string
  sourceReferenceIds: string[]
  sentenceRhythm: string
  paragraphRhythm: string
  compositionBalance: string
  pointOfView: string
  narrativeDistance: string
  lexicalDensity: string
  rhetoricIntensity: string
  emotionalTone: string
  revelationPattern: string
  chapterEndingPattern: string
  editableGuidance: string
  referenceFingerprints: string[]
  updatedAt: number
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

export function emptyStyleProfile(projectId: string): StyleProfile {
  return {
    projectId,
    sourceReferenceIds: [],
    sentenceRhythm: '',
    paragraphRhythm: '',
    compositionBalance: '',
    pointOfView: '',
    narrativeDistance: '',
    lexicalDensity: '',
    rhetoricIntensity: '',
    emotionalTone: '',
    revelationPattern: '',
    chapterEndingPattern: '',
    editableGuidance: '',
    referenceFingerprints: [],
    updatedAt: Date.now(),
  }
}

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function loadStyleProfile(projectId: string): Promise<StyleProfile> {
  if (!isTauri()) return await webGet<StyleProfile>('styleProfiles', projectId) ?? emptyStyleProfile(projectId)
  const database = await getDatabase()
  const rows = await database.select<Array<{ profile_json: string }>>('SELECT profile_json FROM style_profiles WHERE project_id = $1 LIMIT 1', [projectId])
  if (!rows[0]) return emptyStyleProfile(projectId)
  try { return { ...emptyStyleProfile(projectId), ...JSON.parse(rows[0].profile_json) as StyleProfile, projectId } } catch { return emptyStyleProfile(projectId) }
}

export async function saveStyleProfile(profile: StyleProfile): Promise<void> {
  if (!isTauri()) {
    await webPut('styleProfiles', profile.projectId, profile, { projectId: profile.projectId, updatedAt: profile.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO style_profiles (project_id, profile_json, updated_at) VALUES ($1, $2, $3)
     ON CONFLICT(project_id) DO UPDATE SET profile_json = excluded.profile_json, updated_at = excluded.updated_at`,
    [profile.projectId, JSON.stringify(profile), profile.updatedAt],
  )
}
