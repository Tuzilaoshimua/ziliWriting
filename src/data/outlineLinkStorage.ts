import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webDeleteWhere, webList, webPut } from './webDatabase'

/**
 * 大纲节点 ↔ 正文章节的显式绑定。
 * 绑定存在时覆盖度检测直接判定为已覆盖，不再依赖关键词猜测。
 * 数据层支持一个节点绑定多章，UI 目前用单章选择器（选中即替换）。
 */

export type OutlineChapterLink = {
  projectId: string
  nodeId: string
  chapterId: string
  createdAt: number
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

export async function listOutlineLinks(projectId: string): Promise<OutlineChapterLink[]> {
  if (!isTauri()) {
    return (await webList<OutlineChapterLink>('outlineChapterLinks', { projectId })).sort((left, right) => left.createdAt - right.createdAt)
  }
  const database = await getDatabase()
  const rows = await database.select<Array<{
    project_id: string
    node_id: string
    chapter_id: string
    created_at: number
  }>>(
    'SELECT project_id, node_id, chapter_id, created_at FROM outline_chapter_links WHERE project_id = $1 ORDER BY created_at ASC',
    [projectId],
  )
  return rows.map((row) => ({
    projectId: row.project_id,
    nodeId: row.node_id,
    chapterId: row.chapter_id,
    createdAt: row.created_at,
  }))
}

/** 把某个大纲节点的绑定整体替换为给出的章节集合（空数组即解绑）。 */
export async function setOutlineNodeLinks(projectId: string, nodeId: string, chapterIds: string[]): Promise<void> {
  const unique = [...new Set(chapterIds.filter(Boolean))]
  if (!isTauri()) {
    const existing = await webList<OutlineChapterLink>('outlineChapterLinks', { projectId })
    const target = new Set(unique)
    for (const link of existing) {
      if (link.nodeId !== nodeId) continue
      if (!target.has(link.chapterId)) {
        await webDeleteWhere<OutlineChapterLink>('outlineChapterLinks', (item) => item.projectId === projectId && item.nodeId === nodeId && item.chapterId === link.chapterId)
      }
    }
    for (const chapterId of unique) {
      await webPut('outlineChapterLinks', `${projectId}:${nodeId}:${chapterId}`, { projectId, nodeId, chapterId, createdAt: Date.now() }, { projectId })
    }
    return
  }
  const database = await getDatabase()
  if (unique.length === 0) {
    await database.execute('DELETE FROM outline_chapter_links WHERE project_id = $1 AND node_id = $2', [projectId, nodeId])
    return
  }
  const placeholders = unique.map((_, index) => `$${index + 3}`).join(', ')
  await database.execute(
    `DELETE FROM outline_chapter_links WHERE project_id = $1 AND node_id = $2 AND chapter_id NOT IN (${placeholders})`,
    [projectId, nodeId, ...unique],
  )
  for (const chapterId of unique) {
    await database.execute(
      'INSERT OR IGNORE INTO outline_chapter_links (project_id, node_id, chapter_id, created_at) VALUES ($1, $2, $3, $4)',
      [projectId, nodeId, chapterId, Date.now()],
    )
  }
}

/** 章节被删除后清理失效绑定。 */
export async function pruneOutlineLinks(projectId: string, validChapterIds: string[]): Promise<number> {
  const valid = new Set(validChapterIds)
  const links = await listOutlineLinks(projectId)
  const stale = links.filter((link) => !valid.has(link.chapterId))
  for (const link of stale) {
    await setOutlineNodeLinks(projectId, link.nodeId, links.filter((item) => item.nodeId === link.nodeId && valid.has(item.chapterId)).map((item) => item.chapterId))
  }
  return stale.length
}