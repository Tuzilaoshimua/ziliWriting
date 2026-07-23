import Database from '@tauri-apps/plugin-sql'
import { isTauri } from '@tauri-apps/api/core'
import { webDelete, webDeleteWhere, webGet, webList, webPut } from './webDatabase'

export type AiConversationKind = 'agent' | 'project_qa' | 'creative_advisor'
export type AiMessageRole = 'user' | 'assistant'
export type AiMessageStatus = 'pending' | 'complete' | 'failed' | 'cancelled'

export type AiConversation = {
  id: string
  projectId: string
  kind: AiConversationKind
  title: string
  chapterId: string | null
  sceneId: string | null
  createdAt: number
  updatedAt: number
}

export type AiConversationMessage = {
  id: string
  conversationId: string
  requestId: string
  role: AiMessageRole
  content: string
  payloadJson: string
  status: AiMessageStatus
  error: string
  createdAt: number
}

export type AiConversationBundle = {
  conversation: AiConversation
  messages: AiConversationMessage[]
}

const DATABASE_URL = 'sqlite:zili.db'
let databasePromise: Promise<Database> | null = null

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL)
  return databasePromise
}

type ConversationRow = {
  id: string
  project_id: string
  kind: AiConversationKind
  title: string
  chapter_id: string | null
  scene_id: string | null
  created_at: number
  updated_at: number
}

type MessageRow = {
  id: string
  conversation_id: string
  request_id: string
  role: AiMessageRole
  content: string
  payload_json: string
  status: AiMessageStatus
  error: string
  created_at: number
}

function conversationFromRow(row: ConversationRow): AiConversation {
  return { id: row.id, projectId: row.project_id, kind: row.kind, title: row.title, chapterId: row.chapter_id, sceneId: row.scene_id, createdAt: row.created_at, updatedAt: row.updated_at }
}

function messageFromRow(row: MessageRow): AiConversationMessage {
  return { id: row.id, conversationId: row.conversation_id, requestId: row.request_id, role: row.role, content: row.content, payloadJson: row.payload_json, status: row.status, error: row.error, createdAt: row.created_at }
}

export async function createAiConversation(projectId: string, kind: AiConversationKind, title: string, chapterId: string | null = null, sceneId: string | null = null): Promise<AiConversationBundle> {
  const now = Date.now()
  const conversation: AiConversation = { id: crypto.randomUUID(), projectId, kind, title, chapterId, sceneId, createdAt: now, updatedAt: now }
  await saveAiConversation(conversation)
  return { conversation, messages: [] }
}

export async function getAiConversationBundle(conversationId: string): Promise<AiConversationBundle | null> {
  if (!isTauri()) {
    const conversation = await webGet<AiConversation>('aiConversations', conversationId)
    const messages = await webList<AiConversationMessage>('aiMessages', { parentId: conversationId })
    return conversation ? { conversation, messages: messages.sort((left, right) => left.createdAt - right.createdAt) } : null
  }
  const database = await getDatabase()
  const rows = await database.select<ConversationRow[]>('SELECT id, project_id, kind, title, chapter_id, scene_id, created_at, updated_at FROM ai_conversations WHERE id = $1 LIMIT 1', [conversationId])
  if (!rows[0]) return null
  const messages = await database.select<MessageRow[]>('SELECT id, conversation_id, request_id, role, content, payload_json, status, error, created_at FROM ai_conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC', [conversationId])
  return { conversation: conversationFromRow(rows[0]), messages: messages.map(messageFromRow) }
}

export async function listAiConversations(projectId: string, kind?: AiConversationKind): Promise<AiConversationBundle[]> {
  if (!isTauri()) {
    const conversations = await webList<AiConversation>('aiConversations', { projectId })
    return conversations.filter((item) => !kind || item.kind === kind)
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .reduce<Promise<AiConversationBundle[]>>(async (pending, conversation) => {
        const bundles = await pending
        const messages = await webList<AiConversationMessage>('aiMessages', { parentId: conversation.id })
        bundles.push({ conversation, messages: messages.sort((left, right) => left.createdAt - right.createdAt) })
        return bundles
      }, Promise.resolve([]))
  }
  const database = await getDatabase()
  const rows = kind
    ? await database.select<Array<{ id: string }>>('SELECT id FROM ai_conversations WHERE project_id = $1 AND kind = $2 ORDER BY updated_at DESC', [projectId, kind])
    : await database.select<Array<{ id: string }>>('SELECT id FROM ai_conversations WHERE project_id = $1 ORDER BY updated_at DESC', [projectId])
  const bundles = await Promise.all(rows.map((row) => getAiConversationBundle(row.id)))
  return bundles.filter((bundle): bundle is AiConversationBundle => bundle !== null)
}

export async function getOrCreateAiConversation(
  projectId: string,
  kind: AiConversationKind,
  title: string,
  chapterId: string | null = null,
  sceneId: string | null = null,
): Promise<AiConversationBundle> {
  return (await listAiConversations(projectId, kind))[0] ?? createAiConversation(projectId, kind, title, chapterId, sceneId)
}

export async function saveAiConversation(conversation: AiConversation): Promise<void> {
  if (!isTauri()) {
    await webPut('aiConversations', conversation.id, conversation, { projectId: conversation.projectId, updatedAt: conversation.updatedAt })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO ai_conversations (id, project_id, kind, title, chapter_id, scene_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, chapter_id = excluded.chapter_id,
       scene_id = excluded.scene_id, updated_at = excluded.updated_at`,
    [conversation.id, conversation.projectId, conversation.kind, conversation.title, conversation.chapterId, conversation.sceneId, conversation.createdAt, conversation.updatedAt],
  )
}

export async function saveAiConversationMessage(message: AiConversationMessage): Promise<void> {
  if (!isTauri()) {
    await webPut('aiMessages', message.id, message, { parentId: message.conversationId, updatedAt: message.createdAt })
    const conversation = await webGet<AiConversation>('aiConversations', message.conversationId)
    if (conversation) await saveAiConversation({ ...conversation, updatedAt: Math.max(conversation.updatedAt, message.createdAt, Date.now()) })
    return
  }
  const database = await getDatabase()
  await database.execute(
    `INSERT INTO ai_conversation_messages (id, conversation_id, request_id, role, content, payload_json, status, error, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT(id) DO UPDATE SET content = excluded.content, payload_json = excluded.payload_json,
       status = excluded.status, error = excluded.error`,
    [message.id, message.conversationId, message.requestId, message.role, message.content, message.payloadJson, message.status, message.error, message.createdAt],
  )
  await database.execute('UPDATE ai_conversations SET updated_at = $1 WHERE id = $2', [Math.max(Date.now(), message.createdAt), message.conversationId])
}

export async function clearAiConversationMessages(conversationId: string): Promise<void> {
  if (!isTauri()) {
    await webDeleteWhere<AiConversationMessage>('aiMessages', (message) => message.conversationId === conversationId)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM ai_conversation_messages WHERE conversation_id = $1', [conversationId])
  await database.execute('UPDATE ai_conversations SET updated_at = $1 WHERE id = $2', [Date.now(), conversationId])
}

export async function deleteAiConversation(conversationId: string): Promise<void> {
  if (!isTauri()) {
    await webDeleteWhere<AiConversationMessage>('aiMessages', (message) => message.conversationId === conversationId)
    await webDelete('aiConversations', conversationId)
    return
  }
  const database = await getDatabase()
  await database.execute('DELETE FROM ai_conversation_messages WHERE conversation_id = $1', [conversationId])
  await database.execute('DELETE FROM ai_conversations WHERE id = $1', [conversationId])
}

export async function listProjectAiConversations(projectId: string): Promise<AiConversationBundle[]> {
  return listAiConversations(projectId)
}
