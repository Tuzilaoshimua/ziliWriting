export type AiTaskKind = 'agent' | 'memory' | 'review' | 'draft' | 'research' | 'other'
export type AiTaskStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'interrupted'

export type AiBackgroundTask = {
  id: string
  projectId: string
  kind: AiTaskKind
  label: string
  detail: string
  status: AiTaskStatus
  progress: number | null
  retryInput?: string
  startedAt: number
  updatedAt: number
}

import { webDeleteWhere, webList, webPutMany } from './webDatabase'

const MAX_TASKS = 40

export async function loadAiBackgroundTasks(projectId: string): Promise<AiBackgroundTask[]> {
  try {
    const stored = await webList<AiBackgroundTask>('aiTasks', { projectId })
    let changed = false
    const tasks = stored.map((task) => {
      if (task.status !== 'running') return task
      changed = true
      return { ...task, status: 'interrupted' as const, detail: '程序上次关闭时任务仍在运行，可重新发起', updatedAt: Date.now() }
    })
    if (changed) await webPutMany('aiTasks', tasks.map((task) => ({ id: task.id, value: task, metadata: { projectId: task.projectId, updatedAt: task.updatedAt } })))
    return tasks.filter((task) => task.projectId === projectId).sort((left, right) => right.updatedAt - left.updatedAt)
  } catch {
    return []
  }
}

export async function saveAiBackgroundTasks(projectId: string, tasks: AiBackgroundTask[]) {
  try {
    await webDeleteWhere<AiBackgroundTask>('aiTasks', (task) => task.projectId === projectId)
    await webPutMany('aiTasks', tasks.slice(0, MAX_TASKS).map((task) => ({ id: task.id, value: task, metadata: { projectId: task.projectId, updatedAt: task.updatedAt } })))
  } catch {
    // Task history is auxiliary and must never interrupt writing or AI requests.
  }
}
