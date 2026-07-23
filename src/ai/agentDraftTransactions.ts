export type AgentDraftTransaction = {
  id: string
  action: 'insert' | 'create_chapter' | 'replace_chapter'
  status: 'applied' | 'undone'
  chapterId: string
  sourceChapterId?: string
  beforeRevisionId?: string
  afterContentHash: string
  afterTitle: string
  appliedAt: number
  undoneAt?: number
}

export type AgentDraftTransactionInput = Omit<AgentDraftTransaction, 'id' | 'status'> & { id?: string }

export function createAgentDraftTransaction(input: AgentDraftTransactionInput): AgentDraftTransaction {
  return { ...input, id: input.id ?? crypto.randomUUID(), status: 'applied' }
}

export function validateAgentDraftUndo(
  transaction: AgentDraftTransaction | undefined,
  chapter: { id: string; title: string; contentHash: string } | undefined,
): { allowed: true } | { allowed: false; reason: 'missing_transaction' | 'already_undone' | 'missing_chapter' | 'later_edit' } {
  if (!transaction) return { allowed: false, reason: 'missing_transaction' }
  if (transaction.status !== 'applied') return { allowed: false, reason: 'already_undone' }
  if (!chapter || chapter.id !== transaction.chapterId) return { allowed: false, reason: 'missing_chapter' }
  if (chapter.contentHash !== transaction.afterContentHash || chapter.title !== transaction.afterTitle) return { allowed: false, reason: 'later_edit' }
  return { allowed: true }
}

export function markAgentDraftTransactionUndone(transaction: AgentDraftTransaction, undoneAt = Date.now()): AgentDraftTransaction {
  if (transaction.status === 'undone') return transaction
  return { ...transaction, status: 'undone', undoneAt }
}
