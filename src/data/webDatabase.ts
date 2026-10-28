const DATABASE_NAME = 'zili-writing-web'
const DATABASE_VERSION = 1
const RECORD_STORE = 'records'
const BLOB_STORE = 'blobs'
const META_STORE = 'meta'
const LEGACY_MIGRATION_KEY = 'legacy-local-storage-v1'

export type WebRecordMetadata = {
  projectId?: string | null
  parentId?: string | null
  updatedAt?: number
}

type StoredRecord<T = unknown> = WebRecordMetadata & {
  key: string
  collection: string
  id: string
  value: T
}

type StoredBlob = {
  key: string
  blob: Blob
}

export type WebStorageEstimate = {
  usage: number
  quota: number
  persisted: boolean
}

function recordKey(collection: string, id: string) {
  return `${collection}:${id}`
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 请求失败'))
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB 事务已中止'))
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB 事务失败'))
  })
}

function openRawDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) return Promise.reject(new Error('当前浏览器不支持 IndexedDB'))
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(RECORD_STORE)) {
        const records = database.createObjectStore(RECORD_STORE, { keyPath: 'key' })
        records.createIndex('collection', 'collection', { unique: false })
        records.createIndex('collectionProject', ['collection', 'projectId'], { unique: false })
        records.createIndex('collectionParent', ['collection', 'parentId'], { unique: false })
        records.createIndex('collectionUpdated', ['collection', 'updatedAt'], { unique: false })
      }
      if (!database.objectStoreNames.contains(BLOB_STORE)) database.createObjectStore(BLOB_STORE, { keyPath: 'key' })
      if (!database.objectStoreNames.contains(META_STORE)) database.createObjectStore(META_STORE, { keyPath: 'key' })
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }
    request.onerror = () => reject(request.error ?? new Error('无法打开浏览器本地数据库'))
    request.onblocked = () => reject(new Error('其他页面正在占用旧版数据库，请关闭其他字里写作页面后重试'))
  })
}

type LegacyRead<T> = {
  exists: boolean
  valid: boolean
  value: T
}

function readLegacy<T>(key: string, fallback: T): LegacyRead<T> {
  const source = localStorage.getItem(key)
  if (source === null) return { exists: false, valid: true, value: fallback }
  try {
    return { exists: true, valid: true, value: JSON.parse(source) as T }
  } catch {
    // Keep malformed legacy data in localStorage so a future recovery can still inspect it.
    return { exists: true, valid: false, value: fallback }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function dataUrlToBlob(source: string): Blob | null {
  const match = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(source)
  if (!match) return null
  try {
    const mimeType = match[1] || 'application/octet-stream'
    if (!match[2]) return new Blob([decodeURIComponent(match[3])], { type: mimeType })
    const binary = atob(match[3])
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    return new Blob([bytes], { type: mimeType })
  } catch {
    return null
  }
}

function legacyRecord<T>(collection: string, id: string, value: T, metadata: WebRecordMetadata = {}): StoredRecord<T> {
  return { key: recordKey(collection, id), collection, id, value, ...metadata }
}

async function migrateLegacyLocalStorage(database: IDBDatabase): Promise<void> {
  if (typeof localStorage === 'undefined') return
  const existing = await requestResult(database.transaction(META_STORE).objectStore(META_STORE).get(LEGACY_MIGRATION_KEY))
  if (existing) return

  const records: StoredRecord[] = []
  const blobs: StoredBlob[] = []
  const migratedKeys = new Set<string>()
  let hasUnmigratedLegacyData = false
  const addArray = <T extends Record<string, unknown>>(
    key: string,
    collection: string,
    idOf: (item: T, index: number) => string,
    metadataOf: (item: T) => WebRecordMetadata = () => ({}),
  ) => {
    const source = readLegacy<unknown>(key, [])
    if (!source.exists) return
    if (!source.valid || !Array.isArray(source.value) || !source.value.every(isRecord)) {
      hasUnmigratedLegacyData = true
      return
    }
    const items = source.value as T[]
    items.forEach((item, index) => records.push(legacyRecord(collection, idOf(item, index), item, metadataOf(item))))
    migratedKeys.add(key)
  }

  const workspaceKey = localStorage.getItem('zili-writing-workspace-v2') ? 'zili-writing-workspace-v2' : 'zili-writing-project-v1'
  const workspace = readLegacy<unknown>(workspaceKey, [])
  const workspaceSource = workspace.value
  const workspaceProjects = Array.isArray(workspaceSource) ? workspaceSource : [workspaceSource]
  const workspaceShapeValid = workspaceProjects.every((project) => isRecord(project)
    && (project.volumes === undefined || (Array.isArray(project.volumes) && project.volumes.every(isRecord)))
    && (project.chapters === undefined || (Array.isArray(project.chapters) && project.chapters.every(isRecord)))
    && (project.scenes === undefined || (Array.isArray(project.scenes) && project.scenes.every(isRecord))))
  const projects = workspace.valid && Array.isArray(workspaceSource) ? workspaceSource : workspace.valid && workspaceShapeValid ? [workspaceSource] : []
  for (const source of projects) {
    const project = source as Record<string, unknown>
    const projectId = String(project.id ?? crypto.randomUUID())
    const chapters = Array.isArray(project.chapters) ? project.chapters as Array<Record<string, unknown>> : []
    const updatedAt = chapters.reduce((latest, chapter) => Math.max(latest, Number(chapter.updatedAt ?? 0)), Date.now())
    records.push(legacyRecord('projects', projectId, {
      id: projectId,
      title: project.title,
      activeChapterId: project.activeChapterId,
      activeSceneId: project.activeSceneId,
      deletedAt: project.deletedAt ?? null,
      updatedAt,
    }, { projectId, updatedAt }))
    for (const volume of Array.isArray(project.volumes) ? project.volumes as Array<Record<string, unknown>> : []) {
      const id = String(volume.id ?? crypto.randomUUID())
      records.push(legacyRecord('volumes', id, { ...volume, projectId }, { projectId }))
    }
    for (const chapter of chapters) {
      const id = String(chapter.id ?? crypto.randomUUID())
      records.push(legacyRecord('chapters', id, { ...chapter, projectId }, { projectId, updatedAt: Number(chapter.updatedAt ?? 0) }))
    }
    for (const scene of Array.isArray(project.scenes) ? project.scenes as Array<Record<string, unknown>> : []) {
      const id = String(scene.id ?? crypto.randomUUID())
      records.push(legacyRecord('scenes', id, { ...scene, projectId }, { projectId, parentId: String(scene.chapterId ?? ''), updatedAt: Number(scene.updatedAt ?? 0) }))
    }
  }
  if (workspace.exists && workspace.valid && workspaceShapeValid) migratedKeys.add(workspaceKey)
  else if (workspace.exists) hasUnmigratedLegacyData = true

  addArray<Record<string, unknown>>('zili-writing-revisions-v1', 'revisions', (item, index) => String(item.id ?? index), (item) => ({ parentId: String(item.chapterId ?? ''), updatedAt: Number(item.createdAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-trash-v1', 'trashedChapters', (item, index) => String(item.id ?? index), (item) => ({ projectId: String(item.projectId ?? ''), parentId: String(item.originalVolumeId ?? ''), updatedAt: Number(item.deletedAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-story-memory-v1', 'storyMemory', (item, index) => {
    const memory = item.memory as Record<string, unknown> | null
    const candidates = Array.isArray(item.candidates) ? item.candidates as Array<Record<string, unknown>> : []
    return `${memory?.projectId ?? candidates[0]?.projectId ?? 'unknown'}:${memory?.chapterId ?? candidates[0]?.chapterId ?? index}`
  }, (item) => {
    const memory = item.memory as Record<string, unknown> | null
    const candidates = Array.isArray(item.candidates) ? item.candidates as Array<Record<string, unknown>> : []
    return { projectId: String(memory?.projectId ?? candidates[0]?.projectId ?? ''), parentId: String(memory?.chapterId ?? candidates[0]?.chapterId ?? '') }
  })
  addArray<Record<string, unknown>>('zili-writing-review-issues-v1', 'reviewIssues', (item, index) => String(item.id ?? index), (item) => ({ projectId: String(item.projectId ?? ''), parentId: String(item.chapterId ?? ''), updatedAt: Number(item.updatedAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-draft-candidates-v1', 'draftCandidates', (item, index) => String(item.id ?? index), (item) => ({ projectId: String(item.projectId ?? ''), parentId: String(item.chapterId ?? ''), updatedAt: Number(item.updatedAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-ai-usage-v1', 'aiUsage', (item, index) => String(item.id ?? index), (item) => ({ projectId: typeof item.projectId === 'string' ? item.projectId : null, updatedAt: Number(item.createdAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-advanced-ai-records-v1', 'advancedAiRecords', (item, index) => String(item.id ?? index), (item) => ({ projectId: String(item.projectId ?? ''), updatedAt: Number(item.updatedAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-research-sources-v1', 'researchSources', (item, index) => String(item.id ?? index), (item) => ({ projectId: String(item.projectId ?? ''), updatedAt: Number(item.updatedAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-style-profiles-v1', 'styleProfiles', (item, index) => String(item.projectId ?? index), (item) => ({ projectId: String(item.projectId ?? ''), updatedAt: Number(item.updatedAt ?? 0) }))
  addArray<Record<string, unknown>>('zili-writing-creative-workspaces-v1', 'creativeWorkspaces', (item, index) => String((item.brief as Record<string, unknown> | undefined)?.projectId ?? index), (item) => ({ projectId: String((item.brief as Record<string, unknown> | undefined)?.projectId ?? '') }))
  addArray<Record<string, unknown>>('zili-writing-ai-background-tasks-v1', 'aiTasks', (item, index) => String(item.id ?? index), (item) => ({ projectId: String(item.projectId ?? ''), updatedAt: Number(item.updatedAt ?? 0) }))

  for (const [legacyKey, collection] of [
    ['zili-writing-assets-v1', 'assets'],
    ['zili-writing-attachments-v1', 'attachments'],
    ['zili-writing-reference-texts-v1', 'references'],
  ] as const) {
    const sourceItems = readLegacy<unknown>(legacyKey, [])
    if (!sourceItems.exists) continue
    if (!sourceItems.valid || !Array.isArray(sourceItems.value) || !sourceItems.value.every(isRecord)) {
      hasUnmigratedLegacyData = true
      continue
    }
    const items = sourceItems.value as Array<Record<string, unknown>>
    for (const item of items) {
      const id = String(item.id ?? crypto.randomUUID())
      const source = String(item.src ?? item.localPath ?? '')
      const blob = dataUrlToBlob(source)
      if (blob) blobs.push({ key: recordKey(collection, id), blob })
      const value = {
        ...item,
        localPath: blob ? `idb://${collection}/${id}` : source,
        ...(collection === 'assets' ? { src: blob ? '' : source } : {}),
      }
      records.push(legacyRecord(collection, id, value, { projectId: String(item.projectId ?? ''), updatedAt: Number(item.createdAt ?? 0) }))
    }
    migratedKeys.add(legacyKey)
  }

  const conversationKey = 'zili-writing-ai-conversations-v1'
  const conversationSource = readLegacy<unknown>(conversationKey, {})
  const conversationShapeValid = isRecord(conversationSource.value)
    && (conversationSource.value.conversations === undefined || (Array.isArray(conversationSource.value.conversations) && conversationSource.value.conversations.every(isRecord)))
    && (conversationSource.value.messages === undefined || (Array.isArray(conversationSource.value.messages) && conversationSource.value.messages.every(isRecord)))
  const conversationStore = conversationSource.valid && conversationShapeValid
    ? conversationSource.value as { conversations?: Array<Record<string, unknown>>; messages?: Array<Record<string, unknown>> }
    : {}
  for (const conversation of conversationStore.conversations ?? []) {
    const id = String(conversation.id ?? crypto.randomUUID())
    records.push(legacyRecord('aiConversations', id, conversation, { projectId: String(conversation.projectId ?? ''), updatedAt: Number(conversation.updatedAt ?? 0) }))
  }
  for (const message of conversationStore.messages ?? []) {
    const id = String(message.id ?? crypto.randomUUID())
    records.push(legacyRecord('aiMessages', id, message, { parentId: String(message.conversationId ?? ''), updatedAt: Number(message.createdAt ?? 0) }))
  }
  if (conversationSource.exists && conversationSource.valid && conversationShapeValid) migratedKeys.add(conversationKey)
  else if (conversationSource.exists) hasUnmigratedLegacyData = true

  const emergencyKey = 'zili-writing-emergency-draft-v1'
  const emergencySource = readLegacy<unknown>(emergencyKey, null)
  const emergency = emergencySource.valid && isRecord(emergencySource.value) ? emergencySource.value : null
  if (emergency?.projectId && emergency.chapterId) {
    records.push(legacyRecord('emergencyDrafts', `${emergency.projectId}:${emergency.chapterId}`, emergency, {
      projectId: String(emergency.projectId), parentId: String(emergency.chapterId), updatedAt: Number(emergency.updatedAt ?? 0),
    }))
    migratedKeys.add(emergencyKey)
  } else if (emergencySource.exists && emergencySource.valid && emergencySource.value === null) migratedKeys.add(emergencyKey)
  else if (emergencySource.exists) hasUnmigratedLegacyData = true

  const offlinePrefix = 'zili-writing-offline-name-candidates-v5:'
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(offlinePrefix)) continue
    const projectId = key.slice(offlinePrefix.length)
    const candidateSource = readLegacy<unknown>(key, [])
    if (!candidateSource.valid || !Array.isArray(candidateSource.value) || !candidateSource.value.every(isRecord)) {
      hasUnmigratedLegacyData = true
      continue
    }
    const candidates = candidateSource.value
    records.push(legacyRecord('offlineNames', projectId, candidates, { projectId, updatedAt: Date.now() }))
    migratedKeys.add(key)
  }

  const transaction = database.transaction([RECORD_STORE, BLOB_STORE, META_STORE], 'readwrite')
  const recordStore = transaction.objectStore(RECORD_STORE)
  const blobStore = transaction.objectStore(BLOB_STORE)
  records.forEach((record) => recordStore.put(record))
  blobs.forEach((blob) => blobStore.put(blob))
  if (!hasUnmigratedLegacyData) {
    transaction.objectStore(META_STORE).put({ key: LEGACY_MIGRATION_KEY, completedAt: Date.now(), recordCount: records.length, blobCount: blobs.length })
  }
  await transactionDone(transaction)

  for (const key of migratedKeys) localStorage.removeItem(key)
}

let databasePromise: Promise<IDBDatabase> | null = null

export function getWebDatabase(): Promise<IDBDatabase> {
  databasePromise ??= openRawDatabase()
    .then(async (database) => {
      await migrateLegacyLocalStorage(database)
      return database
    })
    .catch((error) => {
      databasePromise = null
      throw error
    })
  return databasePromise
}

export async function webGet<T>(collection: string, id: string): Promise<T | null> {
  const database = await getWebDatabase()
  const record = await requestResult<StoredRecord<T> | undefined>(database.transaction(RECORD_STORE).objectStore(RECORD_STORE).get(recordKey(collection, id)))
  return record?.value ?? null
}

export async function webList<T>(collection: string, metadata: { projectId?: string; parentId?: string } = {}): Promise<T[]> {
  const database = await getWebDatabase()
  const store = database.transaction(RECORD_STORE).objectStore(RECORD_STORE)
  let request: IDBRequest<StoredRecord<T>[]>
  if (metadata.projectId !== undefined) request = store.index('collectionProject').getAll([collection, metadata.projectId])
  else if (metadata.parentId !== undefined) request = store.index('collectionParent').getAll([collection, metadata.parentId])
  else request = store.index('collection').getAll(collection)
  return (await requestResult(request)).map((record) => record.value)
}

export async function webPut<T>(collection: string, id: string, value: T, metadata: WebRecordMetadata = {}): Promise<void> {
  const database = await getWebDatabase()
  const transaction = database.transaction(RECORD_STORE, 'readwrite')
  transaction.objectStore(RECORD_STORE).put(legacyRecord(collection, id, value, metadata))
  await transactionDone(transaction)
}

export async function webPutMany<T>(collection: string, items: Array<{ id: string; value: T; metadata?: WebRecordMetadata }>): Promise<void> {
  if (!items.length) return
  const database = await getWebDatabase()
  const transaction = database.transaction(RECORD_STORE, 'readwrite')
  const done = transactionDone(transaction)
  const store = transaction.objectStore(RECORD_STORE)
  items.forEach((item) => store.put(legacyRecord(collection, item.id, item.value, item.metadata)))
  await done
}

export async function webReplaceProjectData(
  projectId: string,
  groups: Array<{ collection: string; items: Array<{ id: string; value: unknown; metadata?: WebRecordMetadata }> }>,
): Promise<void> {
  const database = await getWebDatabase()
  const transaction = database.transaction(RECORD_STORE, 'readwrite')
  const done = transactionDone(transaction)
  const store = transaction.objectStore(RECORD_STORE)
  const collections = new Set(groups.map((group) => group.collection))
  await Promise.all([...collections].map((collection) => new Promise<void>((resolve, reject) => {
    const cursor = store.index('collectionProject').openCursor([collection, projectId])
    cursor.onerror = () => reject(cursor.error ?? new Error('无法清理浏览器项目记录'))
    cursor.onsuccess = () => {
      const current = cursor.result
      if (!current) return resolve()
      current.delete()
      current.continue()
    }
  })))
  for (const group of groups) {
    for (const item of group.items) store.put(legacyRecord(group.collection, item.id, item.value, { projectId, ...item.metadata }))
  }
  await done
}

export async function webDelete(collection: string, id: string): Promise<void> {
  const database = await getWebDatabase()
  const transaction = database.transaction(RECORD_STORE, 'readwrite')
  transaction.objectStore(RECORD_STORE).delete(recordKey(collection, id))
  await transactionDone(transaction)
}

export async function webDeleteWhere<T>(collection: string, predicate: (value: T) => boolean): Promise<void> {
  const database = await getWebDatabase()
  const transaction = database.transaction(RECORD_STORE, 'readwrite')
  const done = transactionDone(transaction)
  const index = transaction.objectStore(RECORD_STORE).index('collection')
  await new Promise<void>((resolve, reject) => {
    const cursor = index.openCursor(IDBKeyRange.only(collection))
    cursor.onerror = () => reject(cursor.error ?? new Error('无法遍历浏览器数据库'))
    cursor.onsuccess = () => {
      const current = cursor.result
      if (!current) return resolve()
      const record = current.value as StoredRecord<T>
      if (predicate(record.value)) current.delete()
      current.continue()
    }
  })
  await done
}

export async function webPutWithBlob<T>(collection: string, id: string, value: T, blob: Blob, metadata: WebRecordMetadata = {}): Promise<void> {
  const database = await getWebDatabase()
  const transaction = database.transaction([RECORD_STORE, BLOB_STORE], 'readwrite')
  transaction.objectStore(RECORD_STORE).put(legacyRecord(collection, id, value, metadata))
  transaction.objectStore(BLOB_STORE).put({ key: recordKey(collection, id), blob } satisfies StoredBlob)
  await transactionDone(transaction)
}

export async function webGetBlob(collection: string, id: string): Promise<Blob | null> {
  const database = await getWebDatabase()
  const stored = await requestResult<StoredBlob | undefined>(database.transaction(BLOB_STORE).objectStore(BLOB_STORE).get(recordKey(collection, id)))
  return stored?.blob ?? null
}

export async function webDeleteWithBlob(collection: string, id: string): Promise<void> {
  const database = await getWebDatabase()
  const transaction = database.transaction([RECORD_STORE, BLOB_STORE], 'readwrite')
  transaction.objectStore(RECORD_STORE).delete(recordKey(collection, id))
  transaction.objectStore(BLOB_STORE).delete(recordKey(collection, id))
  await transactionDone(transaction)
}

export async function getWebStorageEstimate(requestPersistence = false): Promise<WebStorageEstimate> {
  if (requestPersistence) await navigator.storage?.persist?.().catch(() => false)
  const estimate: StorageEstimate = await (navigator.storage?.estimate?.().catch(() => ({} as StorageEstimate)) ?? Promise.resolve({} as StorageEstimate))
  const persisted = await (navigator.storage?.persisted?.().catch(() => false) ?? Promise.resolve(false))
  return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0, persisted }
}
