import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webDelete, webDeleteWhere, webGet, webList, webPut, webReplaceProjectData } from './webDatabase'

export type Volume = {
  id: string
  title: string
}

export type DocumentNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: DocumentNode[]
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  text?: string
}

export type Chapter = {
  id: string
  volumeId: string
  title: string
  content: string
  contentJson: DocumentNode
  plainText: string
  revisionNumber: number
  contentHash: string
  updatedAt: number
}

export type Scene = {
  id: string
  chapterId: string
  title: string
  goal: string
  notes: string
  summary: string
  startNodeId: string
  endNodeId: string
  updatedAt: number
}

export type ProjectState = {
  id: string
  title: string
  volumes: Volume[]
  chapters: Chapter[]
  scenes: Scene[]
  activeChapterId: string
  activeSceneId: string
  deletedAt: number | null
}

export type ProjectSummary = {
  id: string
  title: string
  updatedAt: number
  chapterCount: number
}

export type TrashedProjectSummary = ProjectSummary & {
  deletedAt: number
}

export type Revision = {
  id: string
  chapterId: string
  title: string
  content: string
  contentJson: DocumentNode
  plainText: string
  revisionNumber: number
  contentHash: string
  reason: string
  createdAt: number
}

export type TrashedChapter = Chapter & {
  projectId: string
  originalVolumeId: string
  volumeTitle: string
  deletedAt: number
  scenes: Scene[]
}

export type ProjectImportIdMap = {
  projectId: Record<string, string>
  volumeIds: Record<string, string>
  chapterIds: Record<string, string>
  sceneIds: Record<string, string>
}

export type ParsedProjectBackup = {
  project: ProjectState
  idMap: ProjectImportIdMap
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

export function hashDocument(document: DocumentNode): string {
  const source = JSON.stringify(document)
  let hash = 0x811c9dc5
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function parseInlineChildren(element: Element, marks: DocumentNode['marks'] = []): DocumentNode[] {
  const content: DocumentNode[] = []
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) content.push({ type: 'text', text: child.textContent, ...(marks.length ? { marks } : {}) })
      continue
    }
    if (!(child instanceof Element)) continue
    const tag = child.tagName.toLowerCase()
    if (tag === 'br') {
      content.push({ type: 'hardBreak' })
      continue
    }
    const markType = tag === 'strong' || tag === 'b' ? 'bold'
      : tag === 'em' || tag === 'i' ? 'italic'
        : tag === 's' || tag === 'del' ? 'strike'
          : tag === 'code' ? 'code' : null
    content.push(...parseInlineChildren(child, markType ? [...marks, { type: markType }] : marks))
  }
  return content
}

function imageNode(element: Element): DocumentNode {
  const image = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img')
  return {
    type: 'image',
    attrs: {
      nodeId: element.getAttribute('data-node-id') || crypto.randomUUID(),
      src: image?.getAttribute('src') ?? '',
      alt: image?.getAttribute('alt') ?? '',
      title: image?.getAttribute('title') ?? '',
      width: element.getAttribute('data-width') ?? image?.getAttribute('data-width') ?? '100',
      align: element.getAttribute('data-align') ?? image?.getAttribute('data-align') ?? 'center',
      caption: element.getAttribute('data-caption') ?? element.querySelector('figcaption')?.textContent ?? '',
    },
  }
}

function parseBlock(element: Element): DocumentNode[] {
  const tag = element.tagName.toLowerCase()
  const nodeId = element.getAttribute('data-node-id') || crypto.randomUUID()
  if (tag === 'figure' || tag === 'img') return [imageNode(element)]
  if (tag === 'p') return [{ type: 'paragraph', attrs: { nodeId }, content: parseInlineChildren(element) }]
  if (/^h[1-3]$/.test(tag)) return [{ type: 'heading', attrs: { nodeId, level: Number(tag[1]) }, content: parseInlineChildren(element) }]
  if (tag === 'pre') return [{ type: 'codeBlock', attrs: { nodeId, language: null }, content: element.textContent ? [{ type: 'text', text: element.textContent }] : [] }]
  if (tag === 'hr') return [{ type: 'horizontalRule', attrs: { nodeId } }]
  if (tag === 'blockquote') return [{ type: 'blockquote', attrs: { nodeId }, content: Array.from(element.children).flatMap(parseBlock) }]
  if (tag === 'ul' || tag === 'ol') {
    return [{
      type: tag === 'ul' ? 'bulletList' : 'orderedList',
      attrs: tag === 'ol' ? { nodeId, start: Number(element.getAttribute('start') || 1) } : { nodeId },
      content: Array.from(element.children).filter((child) => child.tagName.toLowerCase() === 'li').map((child) => {
        const blocks = Array.from(child.children).flatMap(parseBlock)
        return {
          type: 'listItem',
          attrs: { nodeId: child.getAttribute('data-node-id') || crypto.randomUUID() },
          content: blocks.length > 0 ? blocks : [{ type: 'paragraph', attrs: { nodeId: crypto.randomUUID() }, content: parseInlineChildren(child) }],
        }
      }),
    }]
  }
  const nested = Array.from(element.children).flatMap(parseBlock)
  return nested.length > 0 ? nested : [{ type: 'paragraph', attrs: { nodeId }, content: parseInlineChildren(element) }]
}

export function htmlToDocument(html: string): DocumentNode {
  const parsed = new DOMParser().parseFromString(html || '<p></p>', 'text/html')
  const content = Array.from(parsed.body.children).flatMap(parseBlock)
  return { type: 'doc', content: content.length > 0 ? content : [{ type: 'paragraph', attrs: { nodeId: crypto.randomUUID() } }] }
}

function plainTextFromHtml(html: string) {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
}

export function createChapterDocument(content: string) {
  const contentJson = htmlToDocument(content)
  return {
    content,
    contentJson,
    plainText: plainTextFromHtml(content),
    revisionNumber: 1,
    contentHash: hashDocument(contentJson),
  }
}

export function createInitialProject(title = '未命名作品'): ProjectState {
  const projectId = crypto.randomUUID()
  const volumeId = crypto.randomUUID()
  const chapterId = crypto.randomUUID()
  return {
    id: projectId,
    title,
    volumes: [{ id: volumeId, title: '第一卷' }],
    activeChapterId: chapterId,
    activeSceneId: `${chapterId}-default-scene`,
    deletedAt: null,
    chapters: [{
      id: chapterId,
      volumeId,
      title: '第一章',
      updatedAt: Date.now(),
      ...createChapterDocument('<p>清晨的光越过窗沿，落在摊开的稿纸上。</p><p>从这里开始，写下你的故事。</p>'),
    }],
    scenes: [{
      id: `${chapterId}-default-scene`,
      chapterId,
      title: '场景 1',
      goal: '',
      notes: '',
      summary: '',
      startNodeId: '',
      endNodeId: '',
      updatedAt: Date.now(),
    }],
  }
}

function normalizeProject(value: Partial<ProjectState>): ProjectState {
  const fallback = createInitialProject()
  const sourceChapters = Array.isArray(value.chapters) && value.chapters.length > 0
    ? value.chapters
    : fallback.chapters
  const sourceVolumes = Array.isArray(value.volumes) && value.volumes.length > 0
    ? value.volumes
    : [{ id: `${value.id || fallback.id}-default-volume`, title: '第一卷' }]
  const volumeIds = new Set(sourceVolumes.map((volume) => volume.id))
  const defaultVolumeId = sourceVolumes[0].id
  const chapters = sourceChapters.map((chapter) => {
    const migrated = chapter.contentJson?.type === 'doc'
      ? {
          contentJson: chapter.contentJson,
          plainText: chapter.plainText ?? plainTextFromHtml(chapter.content || ''),
          revisionNumber: chapter.revisionNumber ?? 1,
          contentHash: chapter.contentHash || hashDocument(chapter.contentJson),
        }
      : createChapterDocument(chapter.content || '')
    return {
      ...chapter,
      ...migrated,
      content: chapter.content || '',
      volumeId: volumeIds.has(chapter.volumeId) ? chapter.volumeId : defaultVolumeId,
    }
  })
  const chapterIds = new Set(chapters.map((chapter) => chapter.id))
  const sourceScenes = Array.isArray(value.scenes)
    ? value.scenes.filter((scene) => scene && chapterIds.has(scene.chapterId))
    : []
  const sourceScenesByChapter = new Map<string, typeof sourceScenes>()
  for (const scene of sourceScenes) {
    const grouped = sourceScenesByChapter.get(scene.chapterId) ?? []
    grouped.push(scene)
    sourceScenesByChapter.set(scene.chapterId, grouped)
  }
  const scenes = chapters.flatMap((chapter) => {
    const chapterScenes = (sourceScenesByChapter.get(chapter.id) ?? []).map((scene) => ({
      id: scene.id || crypto.randomUUID(),
      chapterId: chapter.id,
      title: scene.title || '场景 1',
      goal: scene.goal || '',
      notes: scene.notes || '',
      summary: scene.summary || '',
      startNodeId: scene.startNodeId || '',
      endNodeId: scene.endNodeId || '',
      updatedAt: scene.updatedAt || chapter.updatedAt || Date.now(),
    }))
    return chapterScenes.length > 0 ? chapterScenes : [{
      id: `${chapter.id}-default-scene`,
      chapterId: chapter.id,
      title: '场景 1',
      goal: '',
      notes: '',
      summary: '',
      startNodeId: '',
      endNodeId: '',
      updatedAt: chapter.updatedAt || Date.now(),
    }]
  })
  const activeChapterId = chapters.some((chapter) => chapter.id === value.activeChapterId)
    ? value.activeChapterId!
    : chapters[0].id
  const activeChapterScenes = scenes.filter((scene) => scene.chapterId === activeChapterId)
  return {
    id: value.id || fallback.id,
    title: value.title || fallback.title,
    volumes: sourceVolumes,
    chapters,
    scenes,
    activeChapterId,
    activeSceneId: activeChapterScenes.some((scene) => scene.id === value.activeSceneId)
      ? value.activeSceneId!
      : activeChapterScenes[0].id,
    deletedAt: value.deletedAt ?? null,
  }
}

async function loadWebWorkspace(): Promise<ProjectState[]> {
  const [projectRows, volumeRows, chapterRows, sceneRows] = await Promise.all([
    webList<Partial<ProjectState> & { updatedAt?: number }>('projects'),
    webList<Volume & { projectId: string }>('volumes'),
    webList<Chapter & { projectId: string }>('chapters'),
    webList<Scene & { projectId: string }>('scenes'),
  ])
  return projectRows.map((project) => normalizeProject({
    ...project,
    volumes: volumeRows.filter((volume) => volume.projectId === project.id),
    chapters: chapterRows.filter((chapter) => chapter.projectId === project.id),
    scenes: sceneRows.filter((scene) => scene.projectId === project.id),
  }))
}

async function saveWebProject(project: ProjectState): Promise<void> {
  await webReplaceProjectData(project.id, [
    { collection: 'projects', items: [{ id: project.id, value: { id: project.id, title: project.title, activeChapterId: project.activeChapterId, activeSceneId: project.activeSceneId, deletedAt: project.deletedAt, updatedAt: Date.now() } }] },
    { collection: 'volumes', items: project.volumes.map((volume) => ({ id: volume.id, value: { ...volume, projectId: project.id } })) },
    { collection: 'chapters', items: project.chapters.map((chapter) => ({ id: chapter.id, value: { ...chapter, projectId: project.id }, metadata: { updatedAt: chapter.updatedAt } })) },
    { collection: 'scenes', items: project.scenes.map((scene) => ({ id: scene.id, value: { ...scene, projectId: project.id }, metadata: { parentId: scene.chapterId, updatedAt: scene.updatedAt } })) },
  ])
}

async function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function listProjects(): Promise<ProjectSummary[]> {
  if (!isTauri()) {
    return (await loadWebWorkspace()).filter((project) => !project.deletedAt).map((project) => ({
      id: project.id,
      title: project.title,
      updatedAt: Math.max(...project.chapters.map((chapter) => chapter.updatedAt)),
      chapterCount: project.chapters.length,
    })).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    title: string
    updated_at: number
    chapter_count: number
  }>>(`
    SELECT p.id, p.title, p.updated_at, COUNT(c.id) AS chapter_count
    FROM projects p
    LEFT JOIN chapters c ON c.project_id = p.id
    WHERE p.deleted_at IS NULL
    GROUP BY p.id, p.title, p.updated_at
    ORDER BY p.updated_at DESC
  `)
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
    chapterCount: row.chapter_count,
  }))
}

export async function loadProject(projectId?: string): Promise<ProjectState> {
  if (!isTauri()) {
    const projects = (await loadWebWorkspace()).filter((project) => !project.deletedAt)
    return projects.find((project) => project.id === projectId) ?? projects[0] ?? createInitialProject()
  }

  const database = await getDatabase()
  const parameters = projectId ? [projectId] : []
  const where = projectId ? 'WHERE id = $1' : ''
  const projects = await database.select<Array<{
    id: string
    title: string
    active_chapter_id: string
    active_scene_id: string | null
    deleted_at: number | null
  }>>(`SELECT id, title, active_chapter_id, active_scene_id, deleted_at FROM projects ${where}${where ? ' AND' : ' WHERE'} deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1`, parameters)

  if (projects.length === 0) {
    const initial = createInitialProject()
    await saveProject(initial)
    return initial
  }

  const stored = projects[0]
  const [volumes, chapters, scenes] = await Promise.all([
    database.select<Array<{ id: string; title: string }>>(
      'SELECT id, title FROM volumes WHERE project_id = $1 ORDER BY sort_order ASC',
      [stored.id],
    ),
    database.select<Array<{
      id: string
      volume_id: string
      title: string
      content: string
      content_json: string
      plain_text: string
      revision_number: number
      content_hash: string
      updated_at: number
    }>>(
      'SELECT id, volume_id, title, content, content_json, plain_text, revision_number, content_hash, updated_at FROM chapters WHERE project_id = $1 ORDER BY sort_order ASC',
      [stored.id],
    ),
    database.select<Array<{
      id: string
      chapter_id: string
      title: string
      goal: string
      notes: string
      summary: string
      start_node_id: string
      end_node_id: string
      updated_at: number
    }>>(
      'SELECT id, chapter_id, title, goal, notes, summary, start_node_id, end_node_id, updated_at FROM scenes WHERE project_id = $1 ORDER BY sort_order ASC',
      [stored.id],
    ),
  ])

  return normalizeProject({
    id: stored.id,
    title: stored.title,
    activeChapterId: stored.active_chapter_id,
    activeSceneId: stored.active_scene_id ?? undefined,
    deletedAt: stored.deleted_at,
    volumes,
    chapters: chapters.map((chapter) => {
      let contentJson: DocumentNode | undefined
      try {
        contentJson = chapter.content_json ? JSON.parse(chapter.content_json) as DocumentNode : undefined
      } catch {
        contentJson = undefined
      }
      return {
        id: chapter.id,
        volumeId: chapter.volume_id,
        title: chapter.title,
        content: chapter.content,
        contentJson: contentJson!,
        plainText: chapter.plain_text,
        revisionNumber: chapter.revision_number,
        contentHash: chapter.content_hash,
        updatedAt: chapter.updated_at,
      }
    }),
    scenes: scenes.map((scene) => ({
      id: scene.id,
      chapterId: scene.chapter_id,
      title: scene.title,
      goal: scene.goal,
      notes: scene.notes,
      summary: scene.summary,
      startNodeId: scene.start_node_id,
      endNodeId: scene.end_node_id,
      updatedAt: scene.updated_at,
    })),
  })
}

export async function saveProject(project: ProjectState): Promise<void> {
  if (!isTauri()) {
    await saveWebProject(project)
    return
  }

  const database = await getDatabase()
  const now = Date.now()
  await database.execute(
    `INSERT INTO projects (id, title, active_chapter_id, active_scene_id, updated_at, deleted_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title,
       active_chapter_id = excluded.active_chapter_id, active_scene_id = excluded.active_scene_id,
       updated_at = excluded.updated_at`,
    [project.id, project.title, project.activeChapterId, project.activeSceneId, now, project.deletedAt],
  )

  const [storedVolumes, storedChapters, storedScenes] = await Promise.all([
    database.select<Array<{ id: string; title: string; sort_order: number }>>(
      'SELECT id, title, sort_order FROM volumes WHERE project_id = $1',
      [project.id],
    ),
    database.select<Array<{ id: string; volume_id: string; title: string; content_hash: string; revision_number: number; sort_order: number; updated_at: number }>>(
      'SELECT id, volume_id, title, content_hash, revision_number, sort_order, updated_at FROM chapters WHERE project_id = $1',
      [project.id],
    ),
    database.select<Array<{ id: string; chapter_id: string; title: string; goal: string; notes: string; summary: string; start_node_id: string; end_node_id: string; sort_order: number; updated_at: number }>>(
      'SELECT id, chapter_id, title, goal, notes, summary, start_node_id, end_node_id, sort_order, updated_at FROM scenes WHERE project_id = $1',
      [project.id],
    ),
  ])
  const storedVolumeById = new Map(storedVolumes.map((row) => [row.id, row]))
  const storedChapterById = new Map(storedChapters.map((row) => [row.id, row]))
  const storedSceneById = new Map(storedScenes.map((row) => [row.id, row]))

  for (const [index, volume] of project.volumes.entries()) {
    const stored = storedVolumeById.get(volume.id)
    if (stored && stored.title === volume.title && stored.sort_order === index) continue
    await database.execute(
      `INSERT INTO volumes (id, project_id, title, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, sort_order = excluded.sort_order`,
      [volume.id, project.id, volume.title, index, now],
    )
  }

  for (const [index, chapter] of project.chapters.entries()) {
    const stored = storedChapterById.get(chapter.id)
    if (stored
      && stored.volume_id === chapter.volumeId
      && stored.title === chapter.title
      && stored.content_hash === chapter.contentHash
      && stored.revision_number === chapter.revisionNumber
      && stored.sort_order === index
      && stored.updated_at === chapter.updatedAt) continue
    await database.execute(
      `INSERT INTO chapters (id, project_id, volume_id, title, content, content_json, plain_text, revision_number, content_hash, sort_order, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT(id) DO UPDATE SET volume_id = excluded.volume_id, title = excluded.title,
         content = excluded.content, content_json = excluded.content_json, plain_text = excluded.plain_text,
         revision_number = excluded.revision_number, content_hash = excluded.content_hash,
         sort_order = excluded.sort_order, updated_at = excluded.updated_at`,
      [chapter.id, project.id, chapter.volumeId, chapter.title, chapter.content, JSON.stringify(chapter.contentJson), chapter.plainText, chapter.revisionNumber, chapter.contentHash, index, chapter.updatedAt],
    )
  }

  const scenesByChapter = new Map<string, Scene[]>()
  for (const scene of project.scenes) {
    const scenes = scenesByChapter.get(scene.chapterId) ?? []
    scenes.push(scene)
    scenesByChapter.set(scene.chapterId, scenes)
  }
  for (const chapter of project.chapters) {
    const chapterScenes = scenesByChapter.get(chapter.id) ?? []
    for (const [index, scene] of chapterScenes.entries()) {
      const stored = storedSceneById.get(scene.id)
      if (stored
        && stored.chapter_id === scene.chapterId
        && stored.title === scene.title
        && stored.goal === scene.goal
        && stored.notes === scene.notes
        && stored.summary === scene.summary
        && stored.start_node_id === scene.startNodeId
        && stored.end_node_id === scene.endNodeId
        && stored.sort_order === index
        && stored.updated_at === scene.updatedAt) continue
      await database.execute(
        `INSERT INTO scenes (id, project_id, chapter_id, title, goal, notes, summary, start_node_id, end_node_id, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT(id) DO UPDATE SET chapter_id = excluded.chapter_id, title = excluded.title,
           goal = excluded.goal, notes = excluded.notes, summary = excluded.summary,
           start_node_id = excluded.start_node_id, end_node_id = excluded.end_node_id, sort_order = excluded.sort_order,
           updated_at = excluded.updated_at`,
        [scene.id, project.id, scene.chapterId, scene.title, scene.goal, scene.notes, scene.summary, scene.startNodeId, scene.endNodeId, index, scene.updatedAt],
      )
    }
  }

  const volumeIds = project.volumes.map((item) => item.id)
  const sceneIds = project.scenes.map((item) => item.id)
  const chapterIds = project.chapters.map((item) => item.id)
  if (storedVolumes.length !== volumeIds.length || volumeIds.some((id) => !storedVolumeById.has(id))) {
    await deleteMissing(database, 'volumes', 'project_id', project.id, volumeIds)
  }
  if (storedScenes.length !== sceneIds.length || sceneIds.some((id) => !storedSceneById.has(id))) {
    await deleteMissing(database, 'scenes', 'project_id', project.id, sceneIds)
  }
  if (storedChapters.length !== chapterIds.length || chapterIds.some((id) => !storedChapterById.has(id))) {
    await deleteMissing(database, 'chapters', 'project_id', project.id, chapterIds)
  }
}

async function deleteMissing(database: Database, table: string, ownerColumn: string, ownerId: string, ids: string[]) {
  if (ids.length === 0) return
  const placeholders = ids.map((_, index) => `$${index + 2}`).join(', ')
  await database.execute(
    `DELETE FROM ${table} WHERE ${ownerColumn} = $1 AND id NOT IN (${placeholders})`,
    [ownerId, ...ids],
  )
}

export async function listTrashedProjects(): Promise<TrashedProjectSummary[]> {
  if (!isTauri()) {
    return (await loadWebWorkspace()).filter((project) => Boolean(project.deletedAt)).map((project) => ({
      id: project.id,
      title: project.title,
      updatedAt: Math.max(...project.chapters.map((chapter) => chapter.updatedAt)),
      chapterCount: project.chapters.length,
      deletedAt: project.deletedAt!,
    })).sort((a, b) => b.deletedAt - a.deletedAt)
  }
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    title: string
    updated_at: number
    chapter_count: number
    deleted_at: number
  }>>(`
    SELECT p.id, p.title, p.updated_at, COUNT(c.id) AS chapter_count, p.deleted_at
    FROM projects p
    LEFT JOIN chapters c ON c.project_id = p.id
    WHERE p.deleted_at IS NOT NULL
    GROUP BY p.id, p.title, p.updated_at, p.deleted_at
    ORDER BY p.deleted_at DESC
  `)
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    updatedAt: row.updated_at,
    chapterCount: row.chapter_count,
    deletedAt: row.deleted_at,
  }))
}

export async function moveProjectToTrash(projectId: string): Promise<void> {
  const deletedAt = Date.now()
  if (!isTauri()) {
    const project = (await loadWebWorkspace()).find((item) => item.id === projectId)
    if (project) await saveWebProject({ ...project, deletedAt })
    return
  }
  const database = await getDatabase()
  await database.execute('UPDATE projects SET deleted_at = $1 WHERE id = $2', [deletedAt, projectId])
}

export async function restoreProject(projectId: string): Promise<void> {
  if (!isTauri()) {
    const project = (await loadWebWorkspace()).find((item) => item.id === projectId)
    if (project) await saveWebProject({ ...project, deletedAt: null })
    return
  }
  const database = await getDatabase()
  await database.execute('UPDATE projects SET deleted_at = NULL WHERE id = $1', [projectId])
}

export async function deleteProject(projectId: string): Promise<void> {
  if (!isTauri()) {
    const chapterIds = new Set((await webList<Chapter & { projectId: string }>('chapters', { projectId })).map((chapter) => chapter.id))
    await webDeleteWhere<Revision>('revisions', (revision) => chapterIds.has(revision.chapterId))
    await webDeleteWhere<TrashedChapter>('trashedChapters', (chapter) => chapter.projectId === projectId)
    await webDeleteWhere<{ projectId: string }>('emergencyDrafts', (draft) => draft.projectId === projectId)
    for (const collection of ['projects', 'volumes', 'chapters', 'scenes']) {
      await webDeleteWhere<Record<string, unknown>>(collection, (item) => item.id === projectId || item.projectId === projectId)
    }
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM revisions WHERE chapter_id IN (SELECT id FROM chapters WHERE project_id = $1)', [projectId])
  await database.execute('DELETE FROM scenes WHERE project_id = $1', [projectId])
  await database.execute('DELETE FROM chapters WHERE project_id = $1', [projectId])
  await database.execute('DELETE FROM volumes WHERE project_id = $1', [projectId])
  await database.execute('DELETE FROM projects WHERE id = $1', [projectId])
}

export async function listRevisions(chapterId: string): Promise<Revision[]> {
  if (!isTauri()) {
    return (await webList<Revision>('revisions', { parentId: chapterId }))
      .filter((revision) => revision.chapterId === chapterId)
      .map((revision) => {
        const migrated = revision.contentJson?.type === 'doc'
          ? {
              contentJson: revision.contentJson,
              plainText: revision.plainText ?? plainTextFromHtml(revision.content),
              revisionNumber: revision.revisionNumber ?? 1,
              contentHash: revision.contentHash || hashDocument(revision.contentJson),
            }
          : createChapterDocument(revision.content)
        return { ...revision, ...migrated }
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  }
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    chapter_id: string
    title: string
    content: string
    content_json: string
    plain_text: string
    revision_number: number
    content_hash: string
    reason: string
    created_at: number
  }>>(
    `SELECT id, chapter_id, title, content, content_json, plain_text, revision_number, content_hash, reason, created_at
     FROM revisions WHERE chapter_id = $1 ORDER BY created_at DESC`,
    [chapterId],
  )
  return rows.map((row) => {
    let contentJson: DocumentNode | undefined
    try {
      contentJson = row.content_json ? JSON.parse(row.content_json) as DocumentNode : undefined
    } catch {
      contentJson = undefined
    }
    const migrated = contentJson?.type === 'doc'
      ? {
          contentJson,
          plainText: row.plain_text || plainTextFromHtml(row.content),
          revisionNumber: row.revision_number || 1,
          contentHash: row.content_hash || hashDocument(contentJson),
        }
      : createChapterDocument(row.content)
    return {
      id: row.id,
      chapterId: row.chapter_id,
      title: row.title,
      content: row.content,
      ...migrated,
      reason: row.reason,
      createdAt: row.created_at,
    }
  })
}

export async function createRevision(chapter: Chapter, reason: string): Promise<Revision | null> {
  const existing = await listRevisions(chapter.id)
  if (existing[0]?.content === chapter.content && existing[0]?.title === chapter.title) return null

  const revision: Revision = {
    id: crypto.randomUUID(),
    chapterId: chapter.id,
    title: chapter.title,
    content: chapter.content,
    contentJson: chapter.contentJson,
    plainText: chapter.plainText,
    revisionNumber: chapter.revisionNumber,
    contentHash: chapter.contentHash,
    reason,
    createdAt: Date.now(),
  }
  if (!isTauri()) {
    await webPut('revisions', revision.id, revision, { parentId: revision.chapterId, updatedAt: revision.createdAt })
    return revision
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO revisions (id, chapter_id, title, content, content_json, plain_text, revision_number, content_hash, reason, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [revision.id, revision.chapterId, revision.title, revision.content, JSON.stringify(revision.contentJson), revision.plainText, revision.revisionNumber, revision.contentHash, revision.reason, revision.createdAt],
  )
  return revision
}

export function exportProjectBackup(project: ProjectState): string {
  return JSON.stringify({
    format: 'zili-writing-project',
    version: 1,
    exportedAt: new Date().toISOString(),
    project,
  }, null, 2)
}

export function parseProjectBackupWithIdMap(source: string): ParsedProjectBackup {
  const data = JSON.parse(source) as {
    format?: string
    version?: number
    project?: Partial<ProjectState>
  }
  if (data.format !== 'zili-writing-project' || data.version !== 1 || !data.project) {
    throw new Error('无法识别的字里写作备份文件')
  }
  const imported = normalizeProject(data.project)
  const volumeIds = new Map(imported.volumes.map((volume) => [volume.id, crypto.randomUUID()]))
  const chapterIds = new Map(imported.chapters.map((chapter) => [chapter.id, crypto.randomUUID()]))
  const sceneIds = new Map(imported.scenes.map((scene) => [scene.id, crypto.randomUUID()]))
  const projectId = crypto.randomUUID()
  const chapters = imported.chapters.map((chapter) => ({
    ...chapter,
    id: chapterIds.get(chapter.id)!,
    volumeId: volumeIds.get(chapter.volumeId) ?? [...volumeIds.values()][0],
    updatedAt: Date.now(),
  }))
  const scenes = imported.scenes.map((scene) => ({
    ...scene,
    id: sceneIds.get(scene.id)!,
    chapterId: chapterIds.get(scene.chapterId)!,
    updatedAt: Date.now(),
  }))
  return {
    project: {
      id: projectId,
      title: `${imported.title}（导入）`,
      volumes: imported.volumes.map((volume) => ({
        id: volumeIds.get(volume.id)!,
        title: volume.title,
      })),
      chapters,
      scenes,
      activeChapterId: chapterIds.get(imported.activeChapterId) ?? chapters[0].id,
      activeSceneId: sceneIds.get(imported.activeSceneId)
        ?? scenes.find((scene) => scene.chapterId === chapters[0].id)!.id,
      deletedAt: null,
    },
    idMap: {
      projectId: { [imported.id]: projectId },
      volumeIds: Object.fromEntries(volumeIds),
      chapterIds: Object.fromEntries(chapterIds),
      sceneIds: Object.fromEntries(sceneIds),
    },
  }
}

export function parseProjectBackup(source: string): ProjectState {
  return parseProjectBackupWithIdMap(source).project
}

export async function listTrashedChapters(projectId: string): Promise<TrashedChapter[]> {
  if (!isTauri()) {
    return (await webList<TrashedChapter>('trashedChapters', { projectId }))
      .sort((left, right) => right.deletedAt - left.deletedAt)
      .map((chapter) => ({
        ...chapter,
        scenes: Array.isArray(chapter.scenes) && chapter.scenes.length > 0 ? chapter.scenes.map((scene) => ({
          ...scene,
          summary: scene.summary || '',
          startNodeId: scene.startNodeId || '',
          endNodeId: scene.endNodeId || '',
        })) : [{
          id: `${chapter.id}-default-scene`,
          chapterId: chapter.id,
          title: '场景 1',
          goal: '',
          notes: '',
          summary: '',
          startNodeId: '',
          endNodeId: '',
          updatedAt: chapter.updatedAt,
        }],
      }))
      .sort((a, b) => b.deletedAt - a.deletedAt)
  }
  const database = await getDatabase()
  const rows = await database.select<Array<{
    id: string
    project_id: string
    original_volume_id: string
    volume_title: string
    title: string
    content: string
    content_json: string
    plain_text: string
    revision_number: number
    content_hash: string
    updated_at: number
    deleted_at: number
    scenes_json: string
  }>>(
    `SELECT id, project_id, original_volume_id, volume_title, title, content, content_json, plain_text, revision_number, content_hash, updated_at, deleted_at, scenes_json
     FROM deleted_chapters WHERE project_id = $1 ORDER BY deleted_at DESC`,
    [projectId],
  )
  return rows.map((row) => {
    let scenes: Scene[] = []
    try {
      scenes = (JSON.parse(row.scenes_json || '[]') as Scene[]).map((scene) => ({
        ...scene,
        summary: scene.summary || '',
        startNodeId: scene.startNodeId || '',
        endNodeId: scene.endNodeId || '',
      }))
    } catch {
      scenes = []
    }
    let contentJson: DocumentNode | undefined
    try {
      contentJson = row.content_json ? JSON.parse(row.content_json) as DocumentNode : undefined
    } catch {
      contentJson = undefined
    }
    const migrated = contentJson?.type === 'doc'
      ? {
          contentJson,
          plainText: row.plain_text || plainTextFromHtml(row.content),
          revisionNumber: row.revision_number || 1,
          contentHash: row.content_hash || hashDocument(contentJson),
        }
      : createChapterDocument(row.content)
    return {
      id: row.id,
      projectId: row.project_id,
      originalVolumeId: row.original_volume_id,
      volumeId: row.original_volume_id,
      volumeTitle: row.volume_title,
      title: row.title,
      content: row.content,
      ...migrated,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      scenes: scenes.length > 0 ? scenes : [{
        id: `${row.id}-default-scene`,
        chapterId: row.id,
        title: '场景 1',
        goal: '',
        notes: '',
        summary: '',
        startNodeId: '',
        endNodeId: '',
        updatedAt: row.updated_at,
      }],
    }
  })
}

export async function moveChapterToTrash(projectId: string, chapter: Chapter, volumeTitle: string, scenes: Scene[] = []): Promise<void> {
  const trashed: TrashedChapter = {
    ...chapter,
    projectId,
    originalVolumeId: chapter.volumeId,
    volumeTitle,
    deletedAt: Date.now(),
    scenes: scenes.length > 0 ? scenes : [{
      id: `${chapter.id}-default-scene`,
      chapterId: chapter.id,
      title: '场景 1',
      goal: '',
      notes: '',
      summary: '',
      startNodeId: '',
      endNodeId: '',
      updatedAt: chapter.updatedAt,
    }],
  }
  if (!isTauri()) {
    await webPut('trashedChapters', trashed.id, trashed, { projectId, parentId: trashed.originalVolumeId, updatedAt: trashed.deletedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT OR REPLACE INTO deleted_chapters
      (id, project_id, original_volume_id, volume_title, title, content, content_json, plain_text, revision_number, content_hash, updated_at, deleted_at, scenes_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [chapter.id, projectId, chapter.volumeId, volumeTitle, chapter.title, chapter.content, JSON.stringify(chapter.contentJson), chapter.plainText, chapter.revisionNumber, chapter.contentHash, chapter.updatedAt, trashed.deletedAt, JSON.stringify(trashed.scenes)],
  )
}

export async function removeTrashedChapter(chapterId: string): Promise<void> {
  if (!isTauri()) {
    await webDelete('trashedChapters', chapterId)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM deleted_chapters WHERE id = $1', [chapterId])
}
