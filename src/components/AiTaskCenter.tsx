import { AlertTriangle, CheckCircle2, CircleStop, ListTodo, RefreshCw, Square, X } from 'lucide-react'
import type { AiBackgroundTask } from '../data/aiTaskStorage'

type AiTaskCenterProps = {
  open: boolean
  tasks: AiBackgroundTask[]
  agentBusy: boolean
  onClose: () => void
  onStop: (task: AiBackgroundTask) => void
  onRetry: (task: AiBackgroundTask) => void
  onClearCompleted: () => void
}

function taskStatusLabel(status: AiBackgroundTask['status']) {
  if (status === 'running') return '进行中'
  if (status === 'completed') return '已完成'
  if (status === 'cancelled') return '已停止'
  if (status === 'interrupted') return '上次运行已中断'
  return '失败'
}

function taskStatusIcon(status: AiBackgroundTask['status']) {
  if (status === 'running') return <RefreshCw size={14} />
  if (status === 'completed') return <CheckCircle2 size={14} />
  if (status === 'cancelled') return <CircleStop size={14} />
  return <AlertTriangle size={14} />
}

export function AiTaskCenter({ open, tasks, agentBusy, onClose, onStop, onRetry, onClearCompleted }: AiTaskCenterProps) {
  if (!open) return null

  return (
    <section className="ai-task-center" aria-label="AI 任务中心">
      <header>
        <div><ListTodo size={15} /><strong>AI 任务</strong></div>
        <button className="icon-button small" title="关闭任务中心" onClick={onClose}><X size={15} /></button>
      </header>
      <div className="ai-task-list">
        {tasks.length === 0 && <p>还没有 AI 任务</p>}
        {tasks.slice(0, 12).map((task) => <article className={task.status} key={task.id}>
          <div className="ai-task-icon">{taskStatusIcon(task.status)}</div>
          <div>
            <strong>{task.label}</strong>
            <span>{task.detail}</span>
            <small>{taskStatusLabel(task.status)} · {new Date(task.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</small>
            {task.progress !== null && <i><b style={{ width: `${Math.max(0, Math.min(1, task.progress)) * 100}%` }} /></i>}
          </div>
          <footer>
            {task.status === 'running' && <button title="停止任务" onClick={() => onStop(task)}><Square size={12} /></button>}
            {['failed', 'cancelled', 'interrupted'].includes(task.status) && task.retryInput && <button title="重试任务" disabled={agentBusy} onClick={() => onRetry(task)}><RefreshCw size={12} /></button>}
          </footer>
        </article>)}
      </div>
      {tasks.some((task) => task.status !== 'running') && <footer><button onClick={onClearCompleted}>清除已结束任务</button></footer>}
    </section>
  )
}
