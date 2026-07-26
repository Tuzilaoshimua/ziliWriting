import { lazy, Suspense, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import UniqueID from '@tiptap/extension-unique-id'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { invoke, isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { open as openDirectoryDialog } from '@tauri-apps/plugin-dialog'
import { readText as readClipboardText, writeText as writeClipboardText } from '@tauri-apps/plugin-clipboard-manager'
import type { ImportedSection } from './data/documentFormats'
import { deleteImageAsset, listImageAssets, readImageAsset, saveImageAsset, type ImageAsset } from './data/assetStorage'
import { clearAttachmentScope, deleteAttachment, listAttachments, readAttachment, saveAttachment, updateAttachmentScope, type Attachment, type AttachmentScope } from './data/attachmentStorage'
import { deleteReferenceText, listReferenceTexts, readReferenceText, saveReferenceText, type ReferenceText } from './data/referenceStorage'
import { analyzePlainTextImport, splitPlainTextSections } from './data/plainTextImport'
import { fetchAiModels, testAiConnection } from './ai/client'
import { loadAiDataPermissions, saveAiDataPermissions, type AiDataPermissions } from './ai/privacy'
import { applyAutomaticMemoryArchival } from './ai/memoryPolicy'
import { estimateAgentRequestScope, runWritingAgent, sanitizeAgentReplyForDisplay, type AgentExternalSource, type AgentImageInput, type AgentMemoryMutation, type AgentToolExecution, type AgentTurn } from './ai/agentAssistant'
import { sanitizeCitationsForDisplay, stripInlineEvidenceMarkers } from './ai/citations'
import { requestsWebResearch, researchWeb } from './ai/webResearch'
import {
  deleteApiKeyCredential,
  loadApiKeyCredential,
  loadAiSettingsCredential,
  migrateLegacyAgnesApiKeyCredential,
  saveApiKeyCredential,
  saveAiSettingsCredential,
  secureCredentialStorageAvailable,
} from './ai/credentials'
import { analyzeChapterMemory, askProjectQuestion, isUsableChapterSummary, MEMORY_KIND_LABELS, proposeAuthorMemoryCandidates, type ProjectAnswer, type ProjectAnswerCitation } from './ai/storyMemory'
import { requestedChapterRange, requestsChapterMemoryAnalysis, requestsStoryMemoryProposal } from './ai/memoryIntents'
import { buildAgentMemoryMutationPreviews } from './ai/memoryAgentTools'
import { createAgentDraftTransaction, markAgentDraftTransactionUndone, validateAgentDraftUndo, type AgentDraftTransaction } from './ai/agentDraftTransactions'
import { detectAdvancedAgentIntent, formatAdvancedAgentResult } from './ai/advancedAgentIntents'
import type { OfflineCulture, OfflineGender, OfflineLocationType, OfflineNameCandidate, OfflineNameKind } from './ai/offlineNaming'
import {
  buildStoryDebtLedger,
  createWritingPlan,
  createWritingSessionRecap,
  diagnoseScenePacing,
  recordTitle,
  simulatePlotDirections,
  simulateReaderResponse,
  simulateRelationship,
  synthesizeResearchSources,
  testCharacterVoice,
} from './ai/advancedAssistant'
import { buildCharacterMemoryProfiles, buildProjectMemoryDigest, buildStoryThreads, detectMemoryConsistencyIssues } from './ai/memoryWorkspace'
import { developCreativeBrief, diagnoseWritingSituation, generateOutlineLayer, OUTLINE_LEVEL_LABELS } from './ai/creativeAdvisor'
import { DRAFT_MODE_LABELS, generateDraftCandidates, type DraftTask } from './ai/writingAssistant'
import { REVIEW_CATEGORY_LABELS, reviewProjectContinuity, reviewScopedContinuity, runAutomaticChecks, type ReviewPassage, type ReviewTextScope } from './ai/reviewAssistant'
import {
  getChapterMemory,
  getProjectMemory,
  defaultMemoryMetadata,
  markStaleMemoryCandidates,
  reconcileMemoryEntities,
  MEMORY_LIFECYCLE_LABELS,
  MEMORY_NATURE_LABELS,
  saveChapterMemory,
  saveMemoryCandidates,
  updateMemoryCandidate,
  type ChapterMemoryBundle,
  type MemoryCandidate,
  type MemoryCandidateMetadata,
  type MemoryCandidateStatus,
} from './data/storyMemoryStorage'
import {
  deleteOutlineNode,
  emptyCreativeBrief,
  loadCreativeWorkspace,
  saveAdvisorSession,
  saveCreativeBrief,
  saveOutlineNode,
  type AdvisorDirection,
  type AdvisorSession,
  type CreativeWorkspace,
  type OutlineLevel,
  type OutlineNode,
} from './data/creativeStorage'
import { listDraftCandidates, saveDraftCandidate, type DraftCandidate, type DraftMode } from './data/draftStorage'
import { listReviewIssues, replaceReviewIssues, saveReviewIssue, type ReviewIssue, type ReviewStatus } from './data/reviewStorage'
import { emptyStyleProfile, loadStyleProfile, saveStyleProfile, type StyleProfile } from './data/styleStorage'
import { analyzeStyleProfile } from './ai/styleAssistant'
import { clearAiUsageLogs, getAiUsageSummary, type AiUsageSummary } from './data/aiUsageStorage'
import { WheelSelect } from './components/WheelSelect'
import { loadAdvancedAiWorkspace, saveAdvancedAiRecord, saveResearchSourceCard, type AdvancedAiToolKind } from './data/advancedAiStorage'
import { loadAiBackgroundTasks, saveAiBackgroundTasks, type AiBackgroundTask, type AiTaskKind, type AiTaskStatus } from './data/aiTaskStorage'
import { deleteAiProjectData, exportAiProjectData, importAiProjectData, type AiProjectData } from './data/aiProjectStorage'
import { getWebStorageEstimate, webDeleteWhere, webList, webPut, type WebStorageEstimate } from './data/webDatabase'
import {
  clearAiConversationMessages,
  createAiConversation,
  deleteAiConversation,
  getAiConversationBundle,
  getOrCreateAiConversation,
  listAiConversations,
  saveAiConversation,
  saveAiConversationMessage,
  type AiConversation,
  type AiConversationMessage,
} from './data/aiConversationStorage'
import {
  LEGACY_AGNES_PROVIDER_ID,
  clearLegacyAiSettings,
  hasLegacyAgnesAiSettings,
  loadAiSettings,
  normalizeAiSettings,
  providerLabel,
  saveAiSettings,
  setRuntimeApiKey,
  type StoredAiSettings,
} from './ai/settings'
import {
  createRevision,
  createChapterDocument,
  exportProjectBackup,
  createInitialProject,
  loadProject,
  listRevisions,
  listProjects,
  listTrashedProjects,
  listTrashedChapters,
  moveChapterToTrash,
  parseProjectBackupWithIdMap,
  moveProjectToTrash,
  restoreProject as restoreStoredProject,
  removeTrashedChapter,
  saveProject,
  deleteProject as removeStoredProject,
  hashDocument,
  type Chapter,
  type DocumentNode,
  type ProjectSummary,
  type ProjectState,
  type Revision,
  type Scene,
  type TrashedChapter,
  type TrashedProjectSummary,
} from './data/projectStorage'
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  ArchiveRestore,
  AlertTriangle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  CircleStop,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Dices,
  ClipboardPaste,
  Copy,
  FileArchive,
  FileText,
  FolderOpen,
  FolderPlus,
  Focus,
  Eye,
  Globe2,
  History,
  ImagePlus,
  Images,
  Import,
  KeyRound,
  Lock,
  ListTree,
  ListTodo,
  LocateFixed,
  Menu,
  MessageSquareText,
  Minus,
  MoreHorizontal,
  PanelLeftClose,
  Paperclip,
  Pencil,
  Plus,
  PlugZap,
  Search,
  Save,
  Send,
  Sparkles,
  Square,
  RotateCcw,
  RefreshCw,
  Redo2,
  Scissors,
  Settings2,
  Trash2,
  Unlock,
  Undo2,
  X,
} from 'lucide-react'

type ContextMenuState = {
  kind: 'chapter' | 'scene' | 'volume' | 'project' | 'asset' | 'attachment' | 'reference' | 'editor' | 'input'
  id?: string
  x: number
  y: number
} | null

type AppDialogState = {
  mode: 'confirm' | 'alert'
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  danger: boolean
} | null

type CursorPosition = {
  paragraph: number
  character: number
  selected: number
}

function conversationPayload<T>(message: AiConversationMessage): T | null {
  if (!message.payloadJson) return null
  try {
    return JSON.parse(message.payloadJson) as T
  } catch {
    return null
  }
}

type AgentDraftTaskMetadata = {
  source?: string
  request?: string
  targetAction?: 'insert' | 'new_chapter'
  targetChapterTitle?: string
  acceptedTargetChapterId?: string
  transaction?: AgentDraftTransaction
}

function agentDraftTask(candidate: DraftCandidate): AgentDraftTaskMetadata {
  try {
    const task = JSON.parse(candidate.taskJson || '{}') as AgentDraftTaskMetadata
    if (task.targetAction || !task.request || !/(?:新建|新增|创建|另起|单独形成).{0,12}(?:章节|一章|尾声)|(?:第\s*)?\d{1,6}\s*章\s*尾声/.test(task.request)) return task
    const explicit = task.request.match(/(?:第\s*)?(\d{1,6})\s*章(?:\s*[：:·\-]?\s*([^\n，。；]{1,30}))?/)
    const subtitle = (explicit?.[2] ?? '')
      .replace(/[》】)]/g, '')
      .replace(/(?:并|然后|接着|用来|作为)?(?:续写|扩写|补写|重写|改写|润色|生成|写出|写入|创建候选|作为候选).*$/, '')
      .trim()
    return {
      ...task,
      targetAction: 'new_chapter',
      targetChapterTitle: explicit ? `第${explicit[1]}章${subtitle ? ` ${subtitle}` : ''}` : undefined,
    }
  } catch {
    return {}
  }
}

function draftModeLabel(candidate: DraftCandidate) {
  return agentDraftTask(candidate).targetAction === 'new_chapter' ? '新建章节' : DRAFT_MODE_LABELS[candidate.mode]
}

function agentConversationTitle(message: string) {
  const source = message
    .replace(/\[[A-Z][A-Z0-9_]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:我想|我希望|请你?|麻烦你?|能不能|可不可以|可以请你|帮我|请帮我)\s*/, '')
  if (!source) return '新对话'
  const scope = source.match(/最后一章|最终章|本章|当前章|第\s*\d{1,6}\s*章|结局|大纲|人物|世界观|故事记忆|回收站|参考文本/)?.[0]?.replace(/\s+/g, '') ?? ''
  const action = source.match(/扩写|续写|改写|重写|润色|分析|讨论|推演|梳理|检查|总结|查找|寻找|描写|新建/)?.[0] ?? ''
  const length = source.match(/(?:大概|大约|约)?\s*(\d{2,6})\s*字/)?.[1]
  const structured = [...new Set([scope, action, length ? `${length}字` : ''].filter(Boolean))].join('')
  const fallback = source
    .replace(/^(?:在|从|关于)\s*/, '')
    .split(/[，。！？；：]/)[0]
    .replace(/(?:的内容|这件事|这个问题)$/, '')
    .trim()
  return Array.from(structured.length >= 4 ? structured : fallback).slice(0, 16).join('') || '新对话'
}

function normalizeAiEndpoint(value: string) {
  return value.trim().replace(/\/+$/, '')
}

function aiEndpointKey(value: string) {
  return normalizeAiEndpoint(value).toLocaleLowerCase()
}

function rememberAiEndpoint(endpoints: string[], endpoint: string) {
  const normalized = normalizeAiEndpoint(endpoint)
  if (!/^https?:\/\//i.test(normalized)) return endpoints
  return [normalized, ...endpoints.filter((item) => normalizeAiEndpoint(item).toLocaleLowerCase() !== normalized.toLocaleLowerCase())].slice(0, 12)
}

function rememberAiEndpointModel(models: Record<string, string>, endpoint: string, model: string) {
  const key = aiEndpointKey(endpoint)
  const normalizedModel = model.trim()
  return key && normalizedModel ? { ...models, [key]: normalizedModel } : models
}

const MEMORY_DIGEST_PAGE_SIZE = 40

type ImageSettings = {
  width: '40' | '60' | '80' | '100'
  align: 'left' | 'center' | 'right'
  caption: string
}

type ChapterNavigationItem = Pick<Chapter, 'id' | 'volumeId' | 'title'> & {
  wordCount: number
}

const StoryImage = Image.extend({
  addAttributes() {
    const imageElement = (element: HTMLElement) => element.tagName === 'FIGURE'
      ? element.querySelector('img')
      : element
    return {
      src: { default: null, parseHTML: (element) => imageElement(element)?.getAttribute('src') },
      alt: { default: null, parseHTML: (element) => imageElement(element)?.getAttribute('alt') },
      title: { default: null, parseHTML: (element) => imageElement(element)?.getAttribute('title') },
      width: {
        default: '100',
        parseHTML: (element) => element.getAttribute('data-width')
          ?? imageElement(element)?.getAttribute('data-width')
          ?? '100',
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align')
          ?? imageElement(element)?.getAttribute('data-align')
          ?? 'center',
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption')
          ?? imageElement(element)?.getAttribute('data-caption')
          ?? element.querySelector('figcaption')?.textContent
          ?? '',
      },
    }
  },
  parseHTML() {
    return [{ tag: 'figure[data-story-image]' }, { tag: 'img[src]' }]
  },
  renderHTML({ node }) {
    const width = ['40', '60', '80', '100'].includes(String(node.attrs.width)) ? String(node.attrs.width) : '100'
    const align = ['left', 'center', 'right'].includes(String(node.attrs.align)) ? String(node.attrs.align) : 'center'
    const caption = String(node.attrs.caption ?? '').trim()
    const children: unknown[] = [
      'figure',
      {
        class: 'story-figure',
        'data-story-image': '',
        'data-width': width,
        'data-align': align,
        'data-caption': caption,
        'data-node-id': node.attrs.nodeId ?? '',
        style: `width:${width}%`,
      },
      ['img', { src: node.attrs.src, alt: node.attrs.alt ?? '', title: node.attrs.title ?? '' }],
    ]
    if (caption) children.push(['figcaption', {}, caption])
    return children as never
  },
})

const ActiveWritingNode = Extension.create({
  name: 'activeWritingNode',
  addProseMirrorPlugins() {
    return [new Plugin({
      key: new PluginKey('activeWritingNode'),
      props: {
        decorations(state) {
          const { $from } = state.selection
          if (state.doc.childCount === 0) return null
          const node = $from.depth < 1 ? state.doc.child(0) : $from.node(1)
          const from = $from.depth < 1 ? 0 : $from.before(1)
          return DecorationSet.create(state.doc, [
            Decoration.node(from, from + node.nodeSize, { class: 'is-active-writing-node' }),
          ])
        },
      },
    })]
  },
})

type ReviewIssueMarker = { issueId: string; nodeId: string; severity: ReviewIssue['severity'] }
const reviewIssueMarkerKey = new PluginKey<ReviewIssueMarker[]>('reviewIssueMarkers')

const ReviewIssueMarkers = Extension.create({
  name: 'reviewIssueMarkers',
  addProseMirrorPlugins() {
    return [new Plugin<ReviewIssueMarker[]>({
      key: reviewIssueMarkerKey,
      state: {
        init: () => [],
        apply: (transaction, current) => transaction.getMeta(reviewIssueMarkerKey) ?? current,
      },
      props: {
        decorations(state) {
          const markers = reviewIssueMarkerKey.getState(state) ?? []
          if (markers.length === 0) return null
          const severityRank = { info: 0, warning: 1, error: 2 }
          const markerByNode = new Map<string, ReviewIssueMarker>()
          for (const marker of markers) {
            const current = markerByNode.get(marker.nodeId)
            if (!current || severityRank[marker.severity] > severityRank[current.severity]) markerByNode.set(marker.nodeId, marker)
          }
          const decorations: Decoration[] = []
          state.doc.descendants((node, position) => {
            const nodeId = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
            const marker = markerByNode.get(nodeId)
            if (marker && node.isBlock) {
              decorations.push(Decoration.node(position, position + node.nodeSize, {
                class: `has-review-issue review-severity-${marker.severity}`,
                'data-review-issue-id': marker.issueId,
              }))
            }
          })
          return DecorationSet.create(state.doc, decorations)
        },
        handleClickOn(_view, _position, node, _nodePosition, event) {
          const nodeId = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
          const marker = (reviewIssueMarkerKey.getState(_view.state) ?? []).find((item) => item.nodeId === nodeId)
          if (!marker) return false
          const markerElement = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-review-issue-id]')
          if (!markerElement || event.clientX - markerElement.getBoundingClientRect().left > 9) return false
          window.dispatchEvent(new CustomEvent('zili-review-marker-open', { detail: { issueId: marker.issueId } }))
          return true
        },
      },
    })]
  },
})

type DraftPreviewMarker = {
  id: string
  from: number
  to: number
  text: string
  mode: DraftMode
}

const draftPreviewMarkerKey = new PluginKey<DraftPreviewMarker | null>('draftPreviewMarker')

const DraftPreviewMarkers = Extension.create({
  name: 'draftPreviewMarkers',
  addProseMirrorPlugins() {
    return [new Plugin<DraftPreviewMarker | null>({
      key: draftPreviewMarkerKey,
      state: {
        init: () => null,
        apply: (transaction, current) => {
          const next = transaction.getMeta(draftPreviewMarkerKey) as DraftPreviewMarker | null | undefined
          if (next !== undefined) return next
          return transaction.docChanged ? null : current
        },
      },
      props: {
        decorations(state) {
          const marker = draftPreviewMarkerKey.getState(state)
          if (!marker) return null
          const maximum = state.doc.content.size
          const from = Math.max(0, Math.min(marker.from, maximum))
          const to = Math.max(from, Math.min(marker.to, maximum))
          const decorations: Decoration[] = []
          if (to > from) decorations.push(Decoration.inline(from, to, { class: 'agent-draft-deletion', 'data-draft-preview-id': marker.id }))
          decorations.push(Decoration.widget(to > from ? to : from, () => {
            const proposed = document.createElement('span')
            proposed.className = 'agent-draft-insertion'
            proposed.dataset.draftPreviewId = marker.id
            proposed.contentEditable = 'false'
            proposed.textContent = marker.text
            return proposed
          }, { side: 1, key: `${marker.id}:${marker.text.length}` }))
          return DecorationSet.create(state.doc, decorations)
        },
      },
    })]
  },
})

function getImageSettings(editor: Editor): ImageSettings | null {
  if (!editor.isActive('image')) return null
  const attributes = editor.getAttributes('image')
  const width = ['40', '60', '80', '100'].includes(String(attributes.width)) ? String(attributes.width) as ImageSettings['width'] : '100'
  const align = ['left', 'center', 'right'].includes(String(attributes.align)) ? String(attributes.align) as ImageSettings['align'] : 'center'
  return { width, align, caption: String(attributes.caption ?? '') }
}

function getCursorPosition(editor: Editor): CursorPosition {
  const { from, to, $from } = editor.state.selection
  const textBeforeCursor = $from.parent.textBetween(0, $from.parentOffset, '', '')
  const selectedText = from === to ? '' : editor.state.doc.textBetween(from, to, '\n', '')
  return {
    paragraph: $from.index(0) + 1,
    character: Array.from(textBeforeCursor).length + 1,
    selected: Array.from(selectedText).length,
  }
}

function editorPassagesInRange(editor: Editor, from: number, to: number): ReviewPassage[] {
  const passages: ReviewPassage[] = []
  editor.state.doc.descendants((node, position) => {
    const nodeId = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
    if (!nodeId || !node.isBlock || !['paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem'].includes(node.type.name)) return true
    const contentFrom = position + 1
    const start = Math.max(0, from - contentFrom)
    const end = Math.min(node.content.size, to - contentFrom)
    if (end > start) {
      const text = node.textBetween(start, end, '\n', '\n').trim()
      if (text) passages.push({ nodeId, text, startOffsetInNode: start, endOffsetInNode: end })
    }
    return false
  })
  return passages
}

function editorNodeRange(editor: Editor, startNodeId: string, endNodeId: string) {
  let start = -1
  let end = -1
  editor.state.doc.descendants((node, position) => {
    const nodeId = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
    if (nodeId === startNodeId) start = position + 1
    if (nodeId === endNodeId) end = position + node.nodeSize - 1
  })
  return start >= 0 && end >= start ? { from: start, to: end } : null
}

function sceneIdForEvidence(project: ProjectState, chapter: Chapter, nodeId: string) {
  const scenes = project.scenes.filter((scene) => scene.chapterId === chapter.id)
  if (scenes.length === 1 && !scenes[0].startNodeId) return scenes[0].id
  const nodeOrder: string[] = []
  const visit = (node: DocumentNode) => {
    const id = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
    if (id && ['paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem'].includes(node.type)) {
      nodeOrder.push(id)
      return
    }
    for (const child of node.content ?? []) visit(child)
  }
  visit(chapter.contentJson)
  const evidenceIndex = nodeOrder.indexOf(nodeId)
  if (evidenceIndex < 0) return ''
  return scenes.find((scene) => {
    const start = nodeOrder.indexOf(scene.startNodeId)
    const end = nodeOrder.indexOf(scene.endNodeId)
    return start >= 0 && end >= start && evidenceIndex >= start && evidenceIndex <= end
  })?.id ?? ''
}

function documentNodeText(node: DocumentNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  return (node.content ?? []).map(documentNodeText).join('')
}

function chapterContainsCitation(chapter: Chapter, citation: ProjectAnswerCitation) {
  let exactNodeMatch = false
  let quoteMatch = false
  const visit = (node: DocumentNode) => {
    if (exactNodeMatch) return
    const nodeId = typeof node.attrs?.nodeId === 'string' ? node.attrs.nodeId : ''
    if (nodeId && ['paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem'].includes(node.type)) {
      const text = documentNodeText(node)
      if (text.includes(citation.quote)) {
        quoteMatch = true
        if (nodeId === citation.nodeId) exactNodeMatch = true
      }
      return
    }
    for (const child of node.content ?? []) visit(child)
  }
  visit(chapter.contentJson)
  return exactNodeMatch || quoteMatch
}

type UtilityPanelKind = 'assistant' | 'history' | 'trash' | 'assets' | 'attachments' | 'references' | 'naming'
type ClosingModalKind = 'library' | 'settings' | 'newProject'
type SettingsCategory = 'appearance' | 'focus' | 'ai' | 'application'

function plainText(html: string) {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent ?? ''
}

const chapterWordCountCache = new WeakMap<Chapter, number>()

function chapterWordCount(chapter: Chapter) {
  const cached = chapterWordCountCache.get(chapter)
  if (cached !== undefined) return cached
  const count = chapter.plainText.replace(/\s/g, '').length
  chapterWordCountCache.set(chapter, count)
  return count
}

function escapeHtml(text: string) {
  const element = document.createElement('div')
  element.textContent = text
  return element.innerHTML
}

function escapeMarkdown(text: string) {
  return text.replace(/([\\`*_[\]{}<>#+.!|~-])/g, '\\$1')
}

function htmlToMarkdown(html: string, imageSources: Map<string, string>) {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const blocks: string[] = []
  for (const element of document.body.children) {
    const image = element instanceof HTMLImageElement ? element : element.querySelector('img')
    if (image && (element instanceof HTMLImageElement || element.matches('figure') || !element.textContent?.trim())) {
      const figure = image.closest('figure')
      const caption = figure?.getAttribute('data-caption') ?? figure?.querySelector('figcaption')?.textContent ?? image.alt
      blocks.push(`![${escapeMarkdown(caption)}](${imageSources.get(image.src) ?? image.src})`)
      continue
    }
    const text = element.textContent?.trim()
    if (!text) continue
    if (element.tagName === 'BLOCKQUOTE') blocks.push(text.split('\n').map((line) => `> ${escapeMarkdown(line)}`).join('\n'))
    else blocks.push(escapeMarkdown(text))
  }
  return blocks.join('\n\n')
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function toChineseNumber(value: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (value < 10) return digits[value]
  if (value < 20) return `十${value % 10 === 0 ? '' : digits[value % 10]}`
  if (value < 100) return `${digits[Math.floor(value / 10)]}十${value % 10 === 0 ? '' : digits[value % 10]}`
  if (value < 1000) {
    const remainder = value % 100
    return `${digits[Math.floor(value / 100)]}百${remainder === 0 ? '' : remainder < 10 ? `零${digits[remainder]}` : toChineseNumber(remainder)}`
  }
  const remainder = value % 1000
  return `${digits[Math.floor(value / 1000)]}千${remainder === 0 ? '' : remainder < 100 ? `零${toChineseNumber(remainder)}` : toChineseNumber(remainder)}`
}

function nextDefaultName(existingTitles: string[], unit: '卷' | '章'): string {
  let sequence = existingTitles.length + 1
  let candidate = `第${toChineseNumber(sequence)}${unit}`
  while (existingTitles.includes(candidate)) {
    sequence += 1
    candidate = `第${toChineseNumber(sequence)}${unit}`
  }
  return candidate
}

function createScene(chapterId: string, existingTitles: string[] = []): Scene {
  let sequence = existingTitles.length + 1
  let title = `场景 ${sequence}`
  while (existingTitles.includes(title)) {
    sequence += 1
    title = `场景 ${sequence}`
  }
  return {
    id: crypto.randomUUID(),
    chapterId,
    title,
    goal: '',
    notes: '',
    summary: '',
    startNodeId: '',
    endNodeId: '',
    updatedAt: Date.now(),
  }
}

function createScenesForChapters(chapters: Chapter[]) {
  return chapters.map((chapter) => createScene(chapter.id))
}

function splitImportedText(text: string, fallbackTitle: string, volumeId: string, headingMode: 'explicit' | 'title-only' | 'single'): Chapter[] {
  return splitPlainTextSections(text, fallbackTitle, headingMode).map((section) => {
    const content = section.lines
      .map((line) => line.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join('')
    return {
      id: crypto.randomUUID(),
      volumeId,
      title: section.title,
      ...createChapterDocument(content),
      updatedAt: Date.now(),
    }
  })
}

async function materializeImportedHtml(
  projectId: string,
  html: string,
  createdAssets: ImageAsset[],
): Promise<string> {
  const document = new DOMParser().parseFromString(html, 'text/html')
  let imageIndex = 0
  for (const image of document.body.querySelectorAll('img')) {
    if (!image.src.startsWith('data:')) continue
    const response = await fetch(image.src)
    const blob = await response.blob()
    const extension = blob.type.includes('jpeg') ? 'jpg'
      : blob.type.includes('webp') ? 'webp'
        : blob.type.includes('gif') ? 'gif' : 'png'
    imageIndex += 1
    const sourceName = image.alt.trim()
    const fileName = sourceName && /\.[a-z0-9]+$/i.test(sourceName)
      ? sourceName
      : `${sourceName || '导入图片'}-${imageIndex}.${extension}`
    const asset = await saveImageAsset(projectId, new File([blob], fileName, { type: blob.type }))
    createdAssets.push(asset)
    image.src = asset.src
  }
  return document.body.innerHTML
}

type WritingPreferences = {
  fontSize: number
  uiFontSize: number
  uiTextColor: string
  lineHeight: number
  pageWidth: number
  fontFamily: 'serif' | 'system'
  theme: 'light' | 'paper' | 'dark'
  motionEnabled: boolean
  typewriterScroll: boolean
  wordGoalEnabled: boolean
  wordGoal: number
  timerEnabled: boolean
  fullscreen: boolean
  paragraphFocus: boolean
  automaticChecksEnabled: boolean
  automaticMemoryEnabled: boolean
  projectSavePath: string
}

type ExportReport = {
  emptyChapters: number
  duplicateVolumeNames: number
  duplicateChapterNames: number
  missingResources: number
}

type ImportProgress = {
  phase: 'running' | 'complete' | 'error'
  current: number
  total: number
  message: string
}

type AiCredentialStatus = 'loading' | 'empty' | 'restored' | 'dirty' | 'saving' | 'saved' | 'memory' | 'error'

const DEFAULT_PREFERENCES: WritingPreferences = {
  fontSize: 17,
  uiFontSize: 13,
  uiTextColor: '',
  lineHeight: 2,
  pageWidth: 720,
  fontFamily: 'serif',
  theme: 'paper',
  motionEnabled: true,
  typewriterScroll: false,
  wordGoalEnabled: false,
  wordGoal: 2000,
  timerEnabled: false,
  fullscreen: false,
  paragraphFocus: false,
  automaticChecksEnabled: true,
  automaticMemoryEnabled: false,
  projectSavePath: '',
}

const EDITOR_VIEW_KEY = 'zili-writing-editor-view-v1'
const PROJECT_TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

const loadDocumentFormats = (() => {
  let promise: Promise<typeof import('./data/documentFormats')> | null = null
  return () => {
    promise ??= import('./data/documentFormats')
    return promise
  }
})()

const loadOfflineNaming = (() => {
  let promise: Promise<typeof import('./ai/offlineNaming')> | null = null
  return () => {
    promise ??= import('./ai/offlineNaming')
    return promise
  }
})()

const AdvancedAiToolsPanel = lazy(() => import('./components/AdvancedAiToolsPanel').then((module) => ({ default: module.AdvancedAiToolsPanel })))

type OfflineCultureOption = {
  id: OfflineCulture
  label: string
  region: string
  periods: Array<{ id: string; label: string; personData?: 'archaeological' }>
}

type StoredEditorView = { from: number; to: number; scrollTop: number }

function loadEditorViews(): Record<string, StoredEditorView> {
  try {
    return JSON.parse(localStorage.getItem(EDITOR_VIEW_KEY) || '{}') as Record<string, StoredEditorView>
  } catch {
    return {}
  }
}

function saveEditorView(chapterId: string, update: Partial<StoredEditorView>) {
  const views = loadEditorViews()
  const previous = views[chapterId]
  views[chapterId] = {
    from: update.from ?? previous?.from ?? 1,
    to: update.to ?? previous?.to ?? 1,
    scrollTop: update.scrollTop ?? previous?.scrollTop ?? 0,
  }
  const entries = Object.entries(views)
  if (entries.length > 500) delete views[entries[0][0]]
  localStorage.setItem(EDITOR_VIEW_KEY, JSON.stringify(views))
}

function scheduleIdleTask(task: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 1500 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(task, 80)
  return () => window.clearTimeout(id)
}

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function formatStorageBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function aiProgressLabel(taskType: string) {
  if (taskType === 'chapter_memory') return '故事资料提取'
  if (taskType === 'chapter_memory_summary') return '章节摘要'
  if (taskType.startsWith('chapter_memory')) return '故事记忆'
  if (taskType.startsWith('writing_agent')) return '字里助手'
  if (taskType === 'project_qa') return '作品问答'
  return 'AI 任务'
}

function loadPreferences(): WritingPreferences {
  try {
    const stored = JSON.parse(localStorage.getItem('zili-writing-preferences-v1') || '{}') as Partial<WritingPreferences>
    const uiFontSize = Math.max(10, Math.min(16, Math.round(Number(stored.uiFontSize) || DEFAULT_PREFERENCES.uiFontSize)))
    const uiTextColor = typeof stored.uiTextColor === 'string' && /^#[0-9a-f]{6}$/i.test(stored.uiTextColor)
      ? stored.uiTextColor.toUpperCase()
      : ''
    return { ...DEFAULT_PREFERENCES, ...stored, uiFontSize, uiTextColor }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function createUiTypographyVariables(uiFontSize: number) {
  const scale = Math.max(10, Math.min(16, uiFontSize)) / 12
  const variables: Record<string, string> = {}
  for (let size = 7; size <= 16; size += 1) {
    variables[`--ui-font-${size}`] = `${(size * scale).toFixed(2)}px`
    variables[`--assistant-font-${size}`] = `${(size * scale * 1.12).toFixed(2)}px`
  }
  return variables
}

function App() {
  const [project, setProject] = useState<ProjectState>(createInitialProject)
  const [hydrated, setHydrated] = useState(false)
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem('zili-writing-focus-mode-v1') === 'true')
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 760)
  const [sidebarClosing, setSidebarClosing] = useState(false)
  const [sidebarToolsOpen, setSidebarToolsOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [namingOpen, setNamingOpen] = useState(false)
  const [assistantView, setAssistantView] = useState<'assistant' | 'memory' | 'qa' | 'advisor' | 'draft' | 'review' | 'tools' | 'naming'>('assistant')
  const [memoryBundle, setMemoryBundle] = useState<ChapterMemoryBundle>({ memory: null, candidates: [] })
  const [projectMemoryBundles, setProjectMemoryBundles] = useState<ChapterMemoryBundle[]>([])
  const [memoryScope, setMemoryScope] = useState<'chapter' | 'project' | 'timeline' | 'characters' | 'threads' | 'digests' | 'consistency'>('chapter')
  const [memorySearch, setMemorySearch] = useState('')
  const [selectedCharacterProfileId, setSelectedCharacterProfileId] = useState<string | null>(null)
  const [characterDetailSection, setCharacterDetailSection] = useState<'profile' | 'state' | 'relationships' | 'timeline'>('profile')
  const [projectMemoryLoading, setProjectMemoryLoading] = useState(false)
  const [memoryFilter, setMemoryFilter] = useState<MemoryCandidateStatus>('candidate')
  const [memorySummaryExpanded, setMemorySummaryExpanded] = useState(false)
  const [expandedMemoryCandidateId, setExpandedMemoryCandidateId] = useState<string | null>(null)
  const [memoryRangeStartId, setMemoryRangeStartId] = useState(project.activeChapterId)
  const [memoryRangeEndId, setMemoryRangeEndId] = useState(project.activeChapterId)
  const [memoryBatchRangeOpen, setMemoryBatchRangeOpen] = useState(false)
  const [memoryBatchProgress, setMemoryBatchProgress] = useState('')
  const [manualMemoryDraft, setManualMemoryDraft] = useState<{ kind: MemoryCandidate['kind']; title: string; detail: string } | null>(null)
  const [memoryThreadLifecycle, setMemoryThreadLifecycle] = useState<'all' | MemoryCandidateMetadata['lifecycle']>('all')
  const [memoryDigestPages, setMemoryDigestPages] = useState<Record<string, number>>({})
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [memoryAnalyzing, setMemoryAnalyzing] = useState(false)
  const [memoryMessage, setMemoryMessage] = useState('')
  const [memoryMergeTargets, setMemoryMergeTargets] = useState<Record<string, string>>({})
  const [projectQuestion, setProjectQuestion] = useState('')
  const [projectAnswer, setProjectAnswer] = useState<ProjectAnswer | null>(null)
  const [projectQuestionBusy, setProjectQuestionBusy] = useState(false)
  const [projectQuestionMessage, setProjectQuestionMessage] = useState('')
  const [qaConversation, setQaConversation] = useState<AiConversation | null>(null)
  const [qaMessages, setQaMessages] = useState<AiConversationMessage[]>([])
  const [agentConversation, setAgentConversation] = useState<AiConversation | null>(null)
  const [agentConversations, setAgentConversations] = useState<AiConversation[]>([])
  const [agentMessages, setAgentMessages] = useState<AiConversationMessage[]>([])
  const [agentInput, setAgentInput] = useState('')
  const [agentBusy, setAgentBusy] = useState(false)
  const [agentTaskPhase, setAgentTaskPhase] = useState<'idle' | 'retrieval' | 'external' | 'generation' | 'validation' | 'complete' | 'failed'>('idle')
  const [agentMessage, setAgentMessage] = useState('')
  const [agentSelection, setAgentSelection] = useState({ from: 1, to: 1, text: '' })
  const [agentImages, setAgentImages] = useState<ImageAsset[]>([])
  const [agentImagePickerOpen, setAgentImagePickerOpen] = useState(false)
  const [offlineNameKind, setOfflineNameKind] = useState<OfflineNameKind>('character')
  const [offlineNameRegion, setOfflineNameRegion] = useState('东亚')
  const [offlineNameCulture, setOfflineNameCulture] = useState<OfflineCulture>('chinese')
  const [offlineNamePeriod, setOfflineNamePeriod] = useState('modern')
  const [offlineCatalogMode, setOfflineCatalogMode] = useState<'mixed' | 'reference' | 'fictional'>('mixed')
  const [offlineNameGender, setOfflineNameGender] = useState<OfflineGender>('any')
  const [offlineLocationType, setOfflineLocationType] = useState<OfflineLocationType>('settlement')
  const [offlineNameSurname, setOfflineNameSurname] = useState('')
  const [offlineNameCount, setOfflineNameCount] = useState(10)
  const [offlineCultures, setOfflineCultures] = useState<OfflineCultureOption[]>([])
  const [offlineNamingLoading, setOfflineNamingLoading] = useState(false)
  const [offlineNameCandidates, setOfflineNameCandidates] = useState<OfflineNameCandidate[]>([])
  const [citationTarget, setCitationTarget] = useState<ProjectAnswerCitation | null>(null)
  const [creativeWorkspace, setCreativeWorkspace] = useState<CreativeWorkspace>(() => ({ brief: emptyCreativeBrief(project.id), outline: [], sessions: [] }))
  const [advisorTab, setAdvisorTab] = useState<'brief' | 'outline' | 'diagnose'>('diagnose')
  const [creativeInput, setCreativeInput] = useState('')
  const [creativeQuestions, setCreativeQuestions] = useState<string[]>([])
  const [outlineLevel, setOutlineLevel] = useState<OutlineLevel>('stage')
  const [outlineInstruction, setOutlineInstruction] = useState('')
  const [advisorNote, setAdvisorNote] = useState('')
  const [advisorResult, setAdvisorResult] = useState<AdvisorSession | null>(null)
  const [advisorConversation, setAdvisorConversation] = useState<AiConversation | null>(null)
  const [advisorMessages, setAdvisorMessages] = useState<AiConversationMessage[]>([])
  const [advisorBusy, setAdvisorBusy] = useState<'loading' | 'brief' | 'outline' | 'diagnose' | null>(null)
  const [advisorMessage, setAdvisorMessage] = useState('')
  const [draftMode, setDraftMode] = useState<DraftMode>('continue')
  const [draftTarget, setDraftTarget] = useState({ from: 1, to: 1, text: '' })
  const [draftTargetLength, setDraftTargetLength] = useState(400)
  const [draftMustInclude, setDraftMustInclude] = useState('')
  const [draftMustAvoid, setDraftMustAvoid] = useState('')
  const [draftNoNewFacts, setDraftNoNewFacts] = useState(true)
  const [draftStyleInstruction, setDraftStyleInstruction] = useState('')
  const [draftCandidates, setDraftCandidates] = useState<DraftCandidate[]>([])
  const [previewDraftId, setPreviewDraftId] = useState<string | null>(null)
  const [draftCompareIds, setDraftCompareIds] = useState<string[]>([])
  const [draftComparisonOpen, setDraftComparisonOpen] = useState(false)
  const [draftBusy, setDraftBusy] = useState(false)
  const [draftMessage, setDraftMessage] = useState('')
  const [acceptingDraftId, setAcceptingDraftId] = useState<string | null>(null)
  const [reviewIssues, setReviewIssues] = useState<ReviewIssue[]>([])
  const [reviewStatusFilter, setReviewStatusFilter] = useState<ReviewStatus>('open')
  const [reviewScope, setReviewScope] = useState<ReviewTextScope | 'project'>('chapter')
  const [reviewRangeStartId, setReviewRangeStartId] = useState(project.activeChapterId)
  const [reviewRangeEndId, setReviewRangeEndId] = useState(project.activeChapterId)
  const [selectedReviewIssueId, setSelectedReviewIssueId] = useState<string | null>(null)
  const [reviewBusy, setReviewBusy] = useState<'loading' | ReviewTextScope | 'project' | null>(null)
  const [reviewMessage, setReviewMessage] = useState('')
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [imageAssets, setImageAssets] = useState<ImageAsset[]>([])
  const [assetBusy, setAssetBusy] = useState(false)
  const [attachmentsOpen, setAttachmentsOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [attachmentBusy, setAttachmentBusy] = useState(false)
  const [referencesOpen, setReferencesOpen] = useState(false)
  const [referenceTexts, setReferenceTexts] = useState<ReferenceText[]>([])
  const [referenceBusy, setReferenceBusy] = useState(false)
  const [referenceView, setReferenceView] = useState<'files' | 'style'>('files')
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(() => emptyStyleProfile(project.id))
  const [styleBusy, setStyleBusy] = useState(false)
  const [styleMessage, setStyleMessage] = useState('')
  const [attachmentFilter, setAttachmentFilter] = useState<'all' | 'project' | 'volume' | 'chapter'>('all')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [trashOpen, setTrashOpen] = useState(false)
  const [trashedChapters, setTrashedChapters] = useState<TrashedChapter[]>([])
  const [selectedTrashIds, setSelectedTrashIds] = useState<Set<string>>(new Set())
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [revisionMessage, setRevisionMessage] = useState('')
  const [recoveryNotice, setRecoveryNotice] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [projectNameDialogMode, setProjectNameDialogMode] = useState<'create' | 'rename'>('create')
  const [projectNameTargetId, setProjectNameTargetId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>('appearance')
  const [closingModal, setClosingModal] = useState<ClosingModalKind | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportBusy, setExportBusy] = useState<'md' | 'docx' | 'epub' | null>(null)
  const [exportReport, setExportReport] = useState<ExportReport | null>(null)
  const [pendingVolumeDeleteId, setPendingVolumeDeleteId] = useState<string | null>(null)
  const [collapsedVolumes, setCollapsedVolumes] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('zili-writing-collapsed-volumes-v1') || '[]') as string[])
    } catch {
      return new Set()
    }
  })
  const [unmountedCollapsedVolumes, setUnmountedCollapsedVolumes] = useState<Set<string>>(() => new Set(collapsedVolumes))
  const [expandedSceneChapters, setExpandedSceneChapters] = useState<Set<string>>(() => new Set())
  const [preferences, setPreferences] = useState<WritingPreferences>(loadPreferences)
  const [aiSettings, setAiSettings] = useState(loadAiSettings)
  const [aiApiKey, setAiApiKey] = useState('')
  const [aiCredentialStatus, setAiCredentialStatus] = useState<AiCredentialStatus>(() => secureCredentialStorageAvailable() ? 'loading' : 'memory')
  const [aiCredentialMessage, setAiCredentialMessage] = useState(() => secureCredentialStorageAvailable() ? '正在读取系统凭据库' : '浏览器模式仅保留当前会话')
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [aiConnectionMessage, setAiConnectionMessage] = useState('尚未测试连接')
  const [aiModels, setAiModels] = useState<string[]>([])
  const [aiModelStatus, setAiModelStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [aiModelMessage, setAiModelMessage] = useState('填写 API Key 后获取服务支持的模型')
  const [aiEndpointMenuOpen, setAiEndpointMenuOpen] = useState(false)
  const [aiUsageSummary, setAiUsageSummary] = useState<AiUsageSummary>({ requests: 0, successful: 0, promptTokens: 0, completionTokens: 0 })
  const [aiDailyUsage, setAiDailyUsage] = useState<AiUsageSummary>({ requests: 0, successful: 0, promptTokens: 0, completionTokens: 0 })
  const [aiStreamProgressByTask, setAiStreamProgressByTask] = useState<Record<string, number>>({})
  const [aiTasks, setAiTasks] = useState<AiBackgroundTask[]>([])
  const [aiTaskCenterOpen, setAiTaskCenterOpen] = useState(false)
  const [aiPermissionState, setAiPermissionState] = useState(() => ({ projectId: project.id, value: loadAiDataPermissions(project.id) }))
  const [pendingMotionEnabled, setPendingMotionEnabled] = useState(() => loadPreferences().motionEnabled)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [projectSwitchingId, setProjectSwitchingId] = useState<string | null>(null)
  const [trashedProjects, setTrashedProjects] = useState<TrashedProjectSummary[]>([])
  const [projectTrashView, setProjectTrashView] = useState(false)
  const [pendingDocumentImport, setPendingDocumentImport] = useState<File | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [findOpen, setFindOpen] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [findCount, setFindCount] = useState(0)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [closingUtilityPanel, setClosingUtilityPanel] = useState<UtilityPanelKind | null>(null)
  const [suppressPanelEntry, setSuppressPanelEntry] = useState<UtilityPanelKind | null>(null)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [appDialog, setAppDialog] = useState<AppDialogState>(null)
  const [appDialogClosing, setAppDialogClosing] = useState(false)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [backupState, setBackupState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [backupMessage, setBackupMessage] = useState('')
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ paragraph: 1, character: 1, selected: 0 })
  const [selectedImage, setSelectedImage] = useState<ImageSettings | null>(null)
  const [scenePanelOpen, setScenePanelOpen] = useState(false)
  const [scenePanelClosing, setScenePanelClosing] = useState(false)
  const [paperScrollState, setPaperScrollState] = useState({ scrollable: false, atTop: true, atBottom: true })
  const [windowMaximized, setWindowMaximized] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'current' | 'downloading' | 'ready' | 'error'>('idle')
  const [updateVersion, setUpdateVersion] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  const [webStorageEstimate, setWebStorageEstimate] = useState<WebStorageEstimate | null>(null)
  const saveTimer = useRef<number | null>(null)
  const projectBackupTimer = useRef<number | null>(null)
  const projectBackupBusy = useRef(false)
  const importProgressTimer = useRef<number | null>(null)
  const importInput = useRef<HTMLInputElement | null>(null)
  const imageInput = useRef<HTMLInputElement | null>(null)
  const agentImageInput = useRef<HTMLInputElement | null>(null)
  const attachmentInput = useRef<HTMLInputElement | null>(null)
  const referenceInput = useRef<HTMLInputElement | null>(null)
  const insertUploadedImage = useRef(false)
  const findInput = useRef<HTMLInputElement | null>(null)
  const paperRef = useRef<HTMLDivElement | null>(null)
  const scenePanelCloseSequence = useRef(0)
  const volumeCollapseTimers = useRef<Map<string, number>>(new Map())
  const activeChapterIdRef = useRef(project.activeChapterId)
  const restoredChapterId = useRef<string | null>(null)
  const editorViewTimer = useRef<number | null>(null)
  const pendingEditorView = useRef<{ chapterId: string; update: Partial<StoredEditorView> } | null>(null)
  const preferencesRef = useRef(preferences)
  const timerStartedAt = useRef(Date.now())
  const aiTestController = useRef<AbortController | null>(null)
  const aiModelController = useRef<AbortController | null>(null)
  const aiCredentialLoadSequence = useRef(0)
  const aiSecureSettingsReady = useRef(!secureCredentialStorageAvailable())
  const aiSettingsSaveTimer = useRef<number | null>(null)
  const aiEndpointComboboxRef = useRef<HTMLDivElement | null>(null)
  const memoryChapterScrollRef = useRef<HTMLDivElement | null>(null)
  const memoryCandidateListRef = useRef<HTMLDivElement | null>(null)
  const memoryFilterLockRef = useRef<{ top: number } | null>(null)
  const memoryFilterRestoringRef = useRef(false)
  const memoryAnalysisController = useRef<AbortController | null>(null)
  const automaticMemoryController = useRef<AbortController | null>(null)
  const projectQuestionController = useRef<AbortController | null>(null)
  const agentController = useRef<AbortController | null>(null)
  const advisorController = useRef<AbortController | null>(null)
  const draftController = useRef<AbortController | null>(null)
  const reviewController = useRef<AbortController | null>(null)
  const styleController = useRef<AbortController | null>(null)
  const aiTasksRef = useRef(aiTasks)
  preferencesRef.current = preferences
  aiTasksRef.current = aiTasks

  useEffect(() => {
    if (isTauri()) return
    void getWebStorageEstimate().then(setWebStorageEstimate).catch(() => setWebStorageEstimate(null))
  }, [])

  const requestWebStoragePersistence = async () => {
    if (isTauri()) return
    try {
      const estimate = await getWebStorageEstimate(true)
      setWebStorageEstimate(estimate)
    } catch {
      setWebStorageEstimate(null)
    }
  }

  const replaceAiTasks = (updater: (tasks: AiBackgroundTask[]) => AiBackgroundTask[]) => {
    setAiTasks((current) => {
      const next = updater(current).sort((left, right) => right.updatedAt - left.updatedAt).slice(0, 40)
      aiTasksRef.current = next
      void saveAiBackgroundTasks(project.id, next)
      return next
    })
  }

  const beginAiTask = (kind: AiTaskKind, label: string, detail: string, retryInput?: string) => {
    const now = Date.now()
    const task: AiBackgroundTask = {
      id: crypto.randomUUID(), projectId: project.id, kind, label, detail, retryInput,
      status: 'running', progress: null, startedAt: now, updatedAt: now,
    }
    replaceAiTasks((current) => [task, ...current])
    return task.id
  }

  const updateAiTask = (id: string, update: Partial<Pick<AiBackgroundTask, 'detail' | 'progress' | 'retryInput' | 'status'>>) => {
    replaceAiTasks((current) => current.map((task) => task.id === id ? { ...task, ...update, updatedAt: Date.now() } : task))
  }

  const finishAiTask = (id: string, status: Exclude<AiTaskStatus, 'running'>, detail: string) => {
    updateAiTask(id, { status, detail, progress: status === 'completed' ? 1 : null })
  }

  const stopAiTask = (task: AiBackgroundTask) => {
    if (task.status !== 'running') return
    if (task.kind === 'agent' || task.kind === 'research') agentController.current?.abort()
    else if (task.kind === 'memory') memoryAnalysisController.current?.abort()
    else if (task.kind === 'review') reviewController.current?.abort()
    else if (task.kind === 'draft') draftController.current?.abort()
    finishAiTask(task.id, 'cancelled', '已由作者停止')
  }

  const retryAiTask = (task: AiBackgroundTask) => {
    if (!task.retryInput || !['agent', 'research'].includes(task.kind) || agentBusy) return
    setAssistantView('assistant')
    if (!assistantOpen) openAgentAssistant()
    void runAgentConversation(task.retryInput)
  }

  useEffect(() => {
    let active = true
    void loadAiBackgroundTasks(project.id).then((tasks) => {
      if (active) setAiTasks(tasks)
    })
    return () => { active = false }
  }, [project.id])

  useEffect(() => {
    if (!namingOpen) return
    let active = true
    setOfflineNamingLoading(true)
    void loadOfflineNaming().then(async (module) => {
      if (!active) return
      setOfflineCultures(module.getOfflineCultures() as OfflineCultureOption[])
      setOfflineNameCandidates(await module.loadOfflineNameCandidates(project.id))
    }).finally(() => {
      if (active) setOfflineNamingLoading(false)
    })
    return () => { active = false }
  }, [namingOpen, project.id])

  useEffect(() => {
    if (assistantOpen && assistantView === 'naming' && !namingOpen) {
      setAssistantOpen(false)
      setNamingOpen(true)
    }
  }, [assistantOpen, assistantView, namingOpen])

  const queueEditorViewSave = (chapterId: string, update: Partial<StoredEditorView>) => {
    if (pendingEditorView.current && pendingEditorView.current.chapterId !== chapterId) {
      saveEditorView(pendingEditorView.current.chapterId, pendingEditorView.current.update)
      pendingEditorView.current = null
    }
    pendingEditorView.current = {
      chapterId,
      update: { ...pendingEditorView.current?.update, ...update },
    }
    if (editorViewTimer.current) window.clearTimeout(editorViewTimer.current)
    editorViewTimer.current = window.setTimeout(() => {
      const pending = pendingEditorView.current
      if (pending) saveEditorView(pending.chapterId, pending.update)
      pendingEditorView.current = null
      editorViewTimer.current = null
    }, 120)
  }
  const dialogResolver = useRef<((value: boolean) => void) | null>(null)
  const contextInput = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const motionDuration = (duration: number) => preferences.motionEnabled
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? duration : 0
  const waitForMotion = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, motionDuration(duration)))

  const openScenePanel = () => {
    scenePanelCloseSequence.current += 1
    setScenePanelClosing(false)
    setScenePanelOpen(true)
  }

  const closeScenePanel = async () => {
    if (!scenePanelOpen || scenePanelClosing) return
    const sequence = ++scenePanelCloseSequence.current
    setScenePanelClosing(true)
    await waitForMotion(180)
    if (sequence !== scenePanelCloseSequence.current) return
    setScenePanelOpen(false)
    setScenePanelClosing(false)
  }

  const toggleScenePanel = () => {
    if (scenePanelOpen) void closeScenePanel()
    else openScenePanel()
  }

  const updatePaperScrollState = (paper: HTMLDivElement | null) => {
    if (!paper) return
    const maximum = Math.max(0, paper.scrollHeight - paper.clientHeight)
    const next = { scrollable: maximum > 200, atTop: paper.scrollTop <= 4, atBottom: maximum - paper.scrollTop <= 4 }
    setPaperScrollState((current) => current.scrollable === next.scrollable && current.atTop === next.atTop && current.atBottom === next.atBottom
      ? current
      : next)
  }

  const jumpToDocumentEdge = (edge: 'top' | 'bottom') => {
    const paper = paperRef.current
    if (!paper) return
    paper.scrollTo({
      top: edge === 'top' ? 0 : paper.scrollHeight,
      behavior: motionDuration(1) > 0 ? 'smooth' : 'auto',
    })
  }

  const updateAiApiKey = (value: string) => {
    aiModelController.current?.abort()
    aiModelController.current = null
    aiCredentialLoadSequence.current += 1
    setAiApiKey(value)
    setRuntimeApiKey(value)
    setAiCredentialStatus(secureCredentialStorageAvailable() ? 'dirty' : 'memory')
    setAiCredentialMessage(secureCredentialStorageAvailable() ? '当前输入尚未保存到系统凭据库' : '浏览器模式仅保留当前会话')
    setAiConnectionStatus('idle')
    setAiConnectionMessage('配置已更改，请重新测试')
    setAiModels([])
    setAiModelStatus('idle')
    setAiModelMessage('API Key 已更改，请重新获取模型')
  }

  const updateAiEndpoint = (baseUrl: string) => {
    aiModelController.current?.abort()
    aiModelController.current = null
    setAiSettings((current) => ({
      ...current,
      baseUrl,
      model: aiEndpointKey(current.baseUrl) === aiEndpointKey(baseUrl) ? current.model : '',
    }))
    setAiConnectionStatus('idle')
    setAiConnectionMessage('配置已更改，请重新测试')
    setAiModels([])
    setAiModelStatus('idle')
    setAiModelMessage('API 地址已更改，请重新获取模型')
  }

  const selectAiEndpoint = (baseUrl: string) => {
    const key = aiEndpointKey(baseUrl)
    const rememberedModel = aiSettings.successfulModels[key]
      ?? (key === aiEndpointKey(aiSettings.baseUrl) ? aiSettings.model : '')
    const nextSettings = { ...aiSettings, baseUrl, model: rememberedModel }
    aiModelController.current?.abort()
    aiModelController.current = null
    setAiSettings(nextSettings)
    setAiConnectionStatus('idle')
    setAiConnectionMessage('已切换 API 地址，请重新测试连接')
    setAiModels([])
    setAiModelStatus('idle')
    setAiModelMessage(rememberedModel ? `已恢复此地址使用的模型 ${rememberedModel}` : '请获取此地址支持的模型')
    setAiEndpointMenuOpen(false)
    void restoreAiCredential(nextSettings)
  }

  const forgetAiEndpoint = (baseUrl: string) => {
    setAiSettings((current) => ({
      ...current,
      successfulBaseUrls: current.successfulBaseUrls.filter((item) => normalizeAiEndpoint(item).toLocaleLowerCase() !== normalizeAiEndpoint(baseUrl).toLocaleLowerCase()),
    }))
  }

  const restoreAiCredential = async (settings: typeof aiSettings, migrateLegacyAgnes = false) => {
    const sequence = ++aiCredentialLoadSequence.current
    if (!secureCredentialStorageAvailable()) {
      setAiApiKey('')
      setRuntimeApiKey('')
      setAiCredentialStatus('memory')
      setAiCredentialMessage('浏览器模式仅保留当前会话')
      setAiConnectionStatus('idle')
      setAiConnectionMessage('端点已更改，请重新填写 API Key 并测试连接')
      setAiModels([])
      return
    }
    if (!settings.baseUrl.trim()) {
      setAiApiKey('')
      setRuntimeApiKey('')
      setAiCredentialStatus('empty')
      setAiCredentialMessage('填写 API 地址后可恢复对应密钥')
      return
    }
    setAiCredentialStatus('loading')
    setAiCredentialMessage('正在读取系统凭据库')
    try {
      let secret = await loadApiKeyCredential(settings)
      if (!secret && migrateLegacyAgnes) {
        secret = await migrateLegacyAgnesApiKeyCredential(settings)
      }
      if (aiCredentialLoadSequence.current !== sequence) return
      const value = secret ?? ''
      setAiApiKey(value)
      setRuntimeApiKey(value)
      setAiCredentialStatus(secret ? 'restored' : 'empty')
      setAiCredentialMessage(secret ? '已从系统凭据库安全恢复' : '此供应商和地址还没有已保存密钥')
      setAiConnectionStatus('idle')
      setAiConnectionMessage(secret ? '已恢复 API Key，请测试连接' : '尚未测试连接')
      setAiModels([])
      setAiModelStatus('idle')
      setAiModelMessage(secret ? '已恢复 API Key，可获取模型' : '填写 API Key 后获取服务支持的模型')
    } catch (error) {
      if (aiCredentialLoadSequence.current !== sequence) return
      setAiApiKey('')
      setRuntimeApiKey('')
      setAiCredentialStatus('error')
      setAiCredentialMessage(error instanceof Error ? `无法读取系统凭据库：${error.message}` : '无法读取系统凭据库')
    }
  }

  const persistAiCredential = async (settings = aiSettings, apiKey = aiApiKey) => {
    if (!secureCredentialStorageAvailable()) {
      setAiCredentialStatus('memory')
      setAiCredentialMessage('浏览器模式仅保留当前会话')
      return false
    }
    if (!settings.baseUrl.trim() || !apiKey.trim()) {
      setAiCredentialStatus('error')
      setAiCredentialMessage('请先填写 API 地址和 API Key')
      return false
    }
    setAiCredentialStatus('saving')
    setAiCredentialMessage('正在写入系统凭据库')
    const sequence = ++aiCredentialLoadSequence.current
    try {
      await saveAiSettingsCredential(settings)
      await saveApiKeyCredential(settings, apiKey)
      if (aiCredentialLoadSequence.current !== sequence) return false
      clearLegacyAiSettings()
      setAiCredentialStatus('saved')
      setAiCredentialMessage('AI 配置和 API Key 已加密保存')
      return true
    } catch (error) {
      if (aiCredentialLoadSequence.current !== sequence) return false
      setAiCredentialStatus('error')
      setAiCredentialMessage(error instanceof Error ? `安全保存失败：${error.message}` : '安全保存失败')
      return false
    }
  }

  const forgetAiCredential = async () => {
    if (!secureCredentialStorageAvailable()) return
    const confirmed = await showConfirm('删除当前供应商和 API 地址对应的已保存 API Key？', { title: '删除已保存密钥', confirmLabel: '删除', danger: true })
    if (!confirmed) return
    setAiCredentialStatus('saving')
    setAiCredentialMessage('正在删除系统凭据')
    try {
      await deleteApiKeyCredential(aiSettings)
      aiCredentialLoadSequence.current += 1
      setAiApiKey('')
      setRuntimeApiKey('')
      setAiCredentialStatus('empty')
      setAiCredentialMessage('已删除系统凭据库中的 API Key')
      setAiConnectionStatus('idle')
      setAiConnectionMessage('尚未测试连接')
      setAiModels([])
      setAiModelStatus('idle')
      setAiModelMessage('填写 API Key 后获取服务支持的模型')
    } catch (error) {
      setAiCredentialStatus('error')
      setAiCredentialMessage(error instanceof Error ? `删除已保存密钥失败：${error.message}` : '删除已保存密钥失败')
    }
  }

  const runAiModelFetch = async () => {
    if (aiModelStatus === 'loading') {
      aiModelController.current?.abort()
      return
    }
    const controller = new AbortController()
    aiModelController.current = controller
    setAiModelStatus('loading')
    setAiModelMessage('正在获取模型列表')
    try {
      const models = await fetchAiModels(aiSettings, aiApiKey, controller.signal)
      if (aiModelController.current !== controller) return
      setAiModels(models)
      if (models.length === 0) {
        setAiModelStatus('error')
        setAiModelMessage('服务未返回可用模型，请手动填写')
        return
      }
      const selectedModel = models.includes(aiSettings.model.trim()) ? aiSettings.model.trim() : models[0]
      const nextSettings = {
        ...aiSettings,
        model: selectedModel,
        successfulBaseUrls: rememberAiEndpoint(aiSettings.successfulBaseUrls, aiSettings.baseUrl),
        successfulModels: rememberAiEndpointModel(aiSettings.successfulModels, aiSettings.baseUrl, selectedModel),
      }
      setAiSettings((current) => aiEndpointKey(current.baseUrl) === aiEndpointKey(aiSettings.baseUrl)
        ? {
          ...current,
          model: selectedModel,
          successfulBaseUrls: rememberAiEndpoint(current.successfulBaseUrls, aiSettings.baseUrl),
          successfulModels: rememberAiEndpointModel(current.successfulModels, aiSettings.baseUrl, selectedModel),
        }
        : current)
      setAiModelStatus('success')
      setAiModelMessage(selectedModel === aiSettings.model.trim()
        ? `已获取 ${models.length} 个模型`
        : `原模型不可用，已切换为 ${selectedModel}`)
      setAiConnectionStatus('idle')
      setAiConnectionMessage('模型已更新，请测试连接')
      void persistAiCredential(nextSettings, aiApiKey)
    } catch (error) {
      if (aiModelController.current !== controller) return
      setAiModels([])
      setAiModelStatus('error')
      setAiModelMessage(error instanceof Error ? error.message : '获取模型失败')
    } finally {
      if (aiModelController.current === controller) aiModelController.current = null
    }
  }

  const runAiConnectionTest = async () => {
    if (aiConnectionStatus === 'testing') {
      aiTestController.current?.abort()
      return
    }
    const controller = new AbortController()
    aiTestController.current = controller
    setAiConnectionStatus('testing')
    setAiConnectionMessage(`正在连接 ${providerLabel(aiSettings.providerId)}`)
    try {
      const result = await testAiConnection(aiSettings, aiApiKey, controller.signal)
      setAiModels(result.models)
      const selectedModel = result.workingModel ?? aiSettings.model.trim()
      if (result.models.length > 0) {
        setAiModelStatus('success')
        setAiModelMessage(selectedModel === aiSettings.model.trim()
          ? `已获取 ${result.models.length} 个模型`
          : `原模型不可用，已切换为 ${selectedModel}`)
      }
      const modelMessage = result.configuredModelAvailable === false
        ? `连接成功，已自动切换为 ${selectedModel}`
        : result.models.length > 0
          ? `连接成功，可用模型 ${result.models.length} 个`
          : '连接成功，服务未返回模型列表'
      setAiConnectionStatus('success')
      setAiConnectionMessage(modelMessage)
      const connectedSettings = {
        ...aiSettings,
        model: selectedModel,
        successfulBaseUrls: rememberAiEndpoint(aiSettings.successfulBaseUrls, aiSettings.baseUrl),
        successfulModels: rememberAiEndpointModel(aiSettings.successfulModels, aiSettings.baseUrl, selectedModel),
      }
      setAiSettings((current) => ({
        ...current,
        model: aiEndpointKey(current.baseUrl) === aiEndpointKey(aiSettings.baseUrl) ? selectedModel : current.model,
        successfulBaseUrls: rememberAiEndpoint(current.successfulBaseUrls, aiSettings.baseUrl),
        successfulModels: rememberAiEndpointModel(current.successfulModels, aiSettings.baseUrl, selectedModel),
      }))
      void persistAiCredential(connectedSettings, aiApiKey)
    } catch (error) {
      setAiConnectionStatus('error')
      setAiConnectionMessage(error instanceof Error ? error.message : '连接测试失败')
    } finally {
      if (aiTestController.current === controller) aiTestController.current = null
    }
  }

  const analyzeMemoryChapterSet = async (
    chapters: Chapter[],
    signal: AbortSignal,
    reportProgress: (message: string) => void,
  ) => {
    const analyzed = new Map<string, Awaited<ReturnType<typeof analyzeChapterMemory>>>()
    const failures: Array<{ chapter: Chapter; message: string }> = []
    let cursor = 0
    let finished = 0
    const worker = async () => {
      while (!signal.aborted) {
        const index = cursor
        cursor += 1
        const chapter = chapters[index]
        if (!chapter) return
        reportProgress(`正在分析 ${chapter.title}（${finished + 1}/${chapters.length}）`)
        try {
          analyzed.set(chapter.id, await analyzeChapterMemory(aiSettings, aiApiKey, project.id, project.title, chapter, signal))
        } catch (error) {
          if (signal.aborted) return
          failures.push({ chapter, message: error instanceof Error ? error.message : '分析失败' })
        } finally {
          finished += 1
          if (!signal.aborted) reportProgress(`已完成 ${finished}/${chapters.length} 章分析`)
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(2, chapters.length) }, () => worker()))
    if (signal.aborted) throw new Error('批量分析已停止')

    let knownBundles = await getProjectMemory(project.id)
    let candidateCount = 0
    for (const chapter of chapters) {
      const result = analyzed.get(chapter.id)
      if (!result) continue
      const existing = await getChapterMemory(project.id, chapter.id)
      const reconciledCandidates = (await reconcileMemoryEntities(project, result.candidates.map((candidate) => ({
        ...candidate,
        projectId: project.id,
        metadata: {
          ...candidate.metadata,
          sceneId: sceneIdForEvidence(project, chapter, candidate.evidenceNodeId),
          sourceRevisionNumber: chapter.revisionNumber,
        },
      })), knownBundles)).map(applyAutomaticMemoryArchival)
      const preserved = existing.candidates.filter((candidate) => candidate.metadata.archivalSource === 'author'
        || (existing.memory?.contentHash === chapter.contentHash && candidate.status === 'confirmed'))
      const nextBundle: ChapterMemoryBundle = {
        memory: {
          id: existing.memory?.id ?? crypto.randomUUID(),
          projectId: project.id,
          chapterId: chapter.id,
          summary: result.summary,
          revisionNumber: chapter.revisionNumber,
          contentHash: chapter.contentHash,
          analyzedAt: Date.now(),
        },
        candidates: [...preserved, ...reconciledCandidates],
      }
      await saveChapterMemory(nextBundle)
      candidateCount += reconciledCandidates.length
      knownBundles = [...knownBundles.filter((bundle) => bundle.memory?.chapterId !== chapter.id
        && !bundle.candidates.some((candidate) => candidate.chapterId === chapter.id)), nextBundle]
    }
    const refreshed = await getProjectMemory(project.id)
    setProjectMemoryBundles(refreshed)
    if (chapters.some((chapter) => chapter.id === activeChapter.id)) setMemoryBundle(await getChapterMemory(project.id, activeChapter.id))
    const emptyChapters = chapters.filter((chapter) => analyzed.get(chapter.id)?.candidates.length === 0).map((chapter) => chapter.title)
    return { analyzedCount: analyzed.size, candidateCount, failures, emptyChapters }
  }

  const runChapterMemoryBatchAnalysis = async () => {
    if (memoryAnalyzing) {
      memoryAnalysisController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setMemoryMessage('请先完成 AI 服务配置')
      return
    }
    if (!aiDataPermissions.currentChapter || !aiDataPermissions.otherChapters) {
      setMemoryMessage('批量分析需要允许 AI 读取当前章节和其他章节')
      return
    }
    const startIndex = project.chapters.findIndex((chapter) => chapter.id === memoryRangeStartId)
    const endIndex = project.chapters.findIndex((chapter) => chapter.id === memoryRangeEndId)
    if (startIndex < 0 || endIndex < 0) {
      setMemoryMessage('请选择有效的章节范围')
      return
    }
    const from = Math.min(startIndex, endIndex)
    const to = Math.max(startIndex, endIndex)
    const chapters = project.chapters.slice(from, to + 1).filter((chapter) => chapter.plainText.trim())
    if (chapters.length === 0) {
      setMemoryMessage('所选范围没有可分析的正文')
      return
    }
    const controller = new AbortController()
    memoryAnalysisController.current = controller
    const taskId = beginAiTask('memory', '批量分析故事记忆', `${chapters[0].title} 至 ${chapters[chapters.length - 1].title}`)
    setMemoryAnalyzing(true)
    setMemoryFilter('candidate')
    setMemoryBatchProgress(`准备分析 ${chapters.length} 章`)
    setMemoryMessage('')
    try {
      const result = await analyzeMemoryChapterSet(chapters, controller.signal, (detail) => {
        setMemoryBatchProgress(detail)
        const matched = detail.match(/(\d+)\/(\d+)/)
        updateAiTask(taskId, { detail, progress: matched ? Number(matched[1]) / Math.max(1, Number(matched[2])) : null })
      })
      const failed = result.failures.length ? `；${result.failures.length} 章失败，可重新选择后重试` : ''
      const empty = result.emptyChapters.length ? `；${result.emptyChapters.length} 章经二次提取仍无可靠候选` : ''
      setMemoryMessage(`已分析 ${result.analyzedCount} 章，整理出 ${result.candidateCount} 条待确认或自动归档资料${empty}${failed}`)
      finishAiTask(taskId, result.failures.length === chapters.length ? 'failed' : 'completed', `完成 ${result.analyzedCount}/${chapters.length} 章，整理 ${result.candidateCount} 条资料`)
    } catch (error) {
      const detail = error instanceof Error ? error.message : '批量分析失败'
      setMemoryMessage(detail)
      finishAiTask(taskId, controller.signal.aborted ? 'cancelled' : 'failed', detail)
    } finally {
      if (memoryAnalysisController.current === controller) {
        memoryAnalysisController.current = null
        setMemoryAnalyzing(false)
        setMemoryBatchProgress('')
      }
    }
  }

  const runChapterMemoryAnalysis = async () => {
    if (memoryAnalyzing) {
      memoryAnalysisController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setMemoryMessage('请先完成 AI 服务配置')
      return
    }
    if (!aiDataPermissions.currentChapter) {
      setMemoryMessage('当前作品禁止向 AI 发送当前章节，请先在 AI 服务设置中调整数据权限')
      return
    }
    automaticMemoryController.current?.abort()
    automaticMemoryController.current = null
    if (memoryBundle.memory?.contentHash === activeChapter.contentHash) {
      const repeat = await showConfirm('本章正文自上次分析后没有变化，仍要重新分析吗？', { title: '重新分析本章', confirmLabel: '重新分析' })
      if (!repeat) return
    }
    const controller = new AbortController()
    memoryAnalysisController.current = controller
    const taskId = beginAiTask('memory', '分析章节故事记忆', activeChapter.title)
    setMemoryAnalyzing(true)
    setMemoryMessage('正在阅读本章并整理候选资料')
    try {
      const result = await analyzeChapterMemory(aiSettings, aiApiKey, project.id, project.title, activeChapter, controller.signal)
      if (memoryAnalysisController.current !== controller) return
      const now = Date.now()
      const reconciledCandidates = (await reconcileMemoryEntities(project, result.candidates.map((candidate) => ({
        ...candidate,
        projectId: project.id,
        metadata: {
          ...candidate.metadata,
          sceneId: sceneIdForEvidence(project, activeChapter, candidate.evidenceNodeId),
          sourceRevisionNumber: activeChapter.revisionNumber,
        },
      })), projectMemoryBundles)).map(applyAutomaticMemoryArchival)
      const confirmed = memoryBundle.candidates.filter((candidate) => candidate.metadata.archivalSource === 'author'
        || (memoryBundle.memory?.contentHash === activeChapter.contentHash && candidate.status === 'confirmed'))
      const nextBundle: ChapterMemoryBundle = {
        memory: {
          id: memoryBundle.memory?.id ?? crypto.randomUUID(),
          projectId: project.id,
          chapterId: activeChapter.id,
          summary: result.summary,
          revisionNumber: activeChapter.revisionNumber,
          contentHash: activeChapter.contentHash,
          analyzedAt: now,
        },
        candidates: [
          ...confirmed,
          ...reconciledCandidates,
        ],
      }
      await saveChapterMemory(nextBundle)
      setProjectMemoryBundles((current) => {
        const index = current.findIndex((bundle) => bundle.memory?.chapterId === activeChapter.id)
        if (index < 0) return [...current, nextBundle]
        const updated = [...current]
        updated[index] = nextBundle
        return updated
      })
      setProject((current) => ({
        ...current,
        scenes: current.scenes.map((scene) => {
          if (scene.chapterId !== activeChapter.id || scene.summary.trim()) return scene
          const details = reconciledCandidates.filter((candidate) => candidate.metadata.sceneId === scene.id).map((candidate) => candidate.detail)
          return details.length > 0 ? { ...scene, summary: [...new Set(details)].slice(0, 4).join('；').slice(0, 500), updatedAt: now } : scene
        }),
      }))
      setMemoryBundle(nextBundle)
      setMemoryFilter('candidate')
      const automaticallyArchived = reconciledCandidates.filter((candidate) => candidate.metadata.archivalSource === 'automatic').length
      const pending = reconciledCandidates.length - automaticallyArchived
      const rejectedByEvidence = result.diagnostics.initialCandidateCount + result.diagnostics.retryCandidateCount
      setMemoryMessage(reconciledCandidates.length > 0
        ? `已整理 ${reconciledCandidates.length} 条资料：${pending} 条待确认${automaticallyArchived ? `，${automaticallyArchived} 条低风险资料自动归档` : ''}`
        : rejectedByEvidence > 0
          ? `摘要已更新；AI 返回了 ${rejectedByEvidence} 条资料，但原文证据无法核对，已阻止写入。可手动添加或重试。`
          : '摘要已更新；AI 两次提取都没有返回人物或设定资料。可手动添加，避免重要信息遗漏。')
      finishAiTask(taskId, 'completed', `已更新摘要，整理 ${reconciledCandidates.length} 条资料`)
    } catch (error) {
      if (memoryAnalysisController.current !== controller) return
      const detail = error instanceof Error ? error.message : '分析本章失败'
      setMemoryMessage(detail)
      finishAiTask(taskId, controller.signal.aborted ? 'cancelled' : 'failed', detail)
    } finally {
      if (memoryAnalysisController.current === controller) {
        memoryAnalysisController.current = null
        setMemoryAnalyzing(false)
      }
    }
  }

  const editMemoryCandidate = (candidateId: string, update: Partial<Pick<MemoryCandidate, 'title' | 'detail'>>) => {
    setMemoryBundle((current) => ({
      ...current,
      candidates: current.candidates.map((candidate) => candidate.id === candidateId ? { ...candidate, ...update } : candidate),
    }))
  }

  const editMemoryCandidateMetadata = (candidateId: string, update: Partial<MemoryCandidateMetadata>) => {
    setMemoryBundle((current) => ({
      ...current,
      candidates: current.candidates.map((candidate) => candidate.id === candidateId
        ? { ...candidate, metadata: { ...(candidate.metadata ?? defaultMemoryMetadata(candidate.chapterId)), ...update } }
        : candidate),
    }))
  }

  const commitMemoryCandidateMetadata = async (candidate: MemoryCandidate, update: Partial<MemoryCandidateMetadata>) => {
    await commitMemoryCandidate({
      ...candidate,
      metadata: { ...(candidate.metadata ?? defaultMemoryMetadata(candidate.chapterId)), ...update },
    })
  }

  const commitMemoryCandidate = async (candidate: MemoryCandidate, status: MemoryCandidateStatus = candidate.status) => {
    if (status === 'confirmed' && candidate.metadata.archivalSource !== 'author' && memoryBundle.memory?.contentHash !== activeChapter.contentHash) {
      setMemoryFilter('stale')
      setMemoryMessage('正文已经变化，请先重新分析本章，再确认更新后的资料')
      return
    }
    const updated = {
      ...candidate,
      status,
      metadata: status === 'confirmed' ? { ...candidate.metadata, archivalSource: 'author' as const } : candidate.metadata,
      updatedAt: Date.now(),
    }
    setMemoryBundle((current) => ({
      ...current,
      candidates: current.candidates.map((item) => item.id === updated.id ? updated : item),
    }))
    try {
      await updateMemoryCandidate(updated)
      setMemoryMessage(status === 'confirmed' ? '资料已确认' : status === 'stale' ? '资料已标记为待复核' : status === 'rejected' ? '资料已否决' : '修改已保存')
    } catch (error) {
      setMemoryMessage(error instanceof Error ? error.message : '保存资料失败')
    }
  }

  const addManualMemoryCandidate = async () => {
    if (!manualMemoryDraft?.title.trim() || !manualMemoryDraft.detail.trim()) {
      setMemoryMessage('请填写资料标题和内容')
      return
    }
    const now = Date.now()
    const base: MemoryCandidate = {
      id: crypto.randomUUID(),
      projectId: project.id,
      chapterId: activeChapter.id,
      kind: manualMemoryDraft.kind,
      title: manualMemoryDraft.title.trim(),
      detail: manualMemoryDraft.detail.trim(),
      status: 'candidate',
      confidence: 1,
      evidenceNodeId: `author-manual:${crypto.randomUUID()}`,
      evidenceQuote: '作者手动添加',
      metadata: {
        ...defaultMemoryMetadata(activeChapter.id),
        archivalSource: 'author',
        sourceRevisionNumber: 0,
      },
      createdAt: now,
      updatedAt: now,
    }
    const [candidate] = await reconcileMemoryEntities(project, [base])
    await saveMemoryCandidates([candidate])
    const [currentBundle, projectBundles] = await Promise.all([
      getChapterMemory(project.id, activeChapter.id),
      getProjectMemory(project.id),
    ])
    setMemoryBundle(currentBundle)
    setProjectMemoryBundles(projectBundles)
    setMemoryFilter('candidate')
    setManualMemoryDraft(null)
    setMemoryMessage('已添加一条作者设定候选，请核对后确认')
  }

  const decideAgentMemoryCandidate = async (message: AiConversationMessage, candidate: MemoryCandidate, status: 'confirmed' | 'rejected') => {
    const updated = { ...candidate, status, updatedAt: Date.now() }
    await updateMemoryCandidate(updated)
    const turn = conversationPayload<AgentTurn>(message)
    const updatedMessage = turn ? {
      ...message,
      payloadJson: JSON.stringify({
        ...turn,
        memoryCandidates: (turn.memoryCandidates ?? []).map((item) => item.id === updated.id ? updated : item),
        tools: (turn.tools ?? []).map((tool) => tool.name === 'propose_story_memory'
          ? { ...tool, status: 'complete' as const, detail: status === 'confirmed' ? '作者已确认写入故事记忆' : '作者已否决候选' }
          : tool),
      }),
    } : message
    await saveAiConversationMessage(updatedMessage)
    setAgentMessages((current) => current.map((item) => item.id === updatedMessage.id ? updatedMessage : item))
    const [currentBundle, projectBundles] = await Promise.all([
      getChapterMemory(project.id, activeChapter.id),
      getProjectMemory(project.id),
    ])
    setMemoryBundle(currentBundle)
    setProjectMemoryBundles(projectBundles)
    setAgentMessage(status === 'confirmed' ? `已将“${candidate.title}”加入故事记忆` : `已否决“${candidate.title}”`)
  }

  const decideAgentMemoryMutation = async (message: AiConversationMessage, mutation: AgentMemoryMutation, status: 'confirmed' | 'rejected') => {
    const turn = conversationPayload<AgentTurn>(message)
    if (!turn) return
    try {
      if (status === 'confirmed') {
        const bundles = await getProjectMemory(project.id)
        const candidates = bundles.flatMap((bundle) => bundle.candidates)
        const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]))
        const targetCandidates = mutation.targetCandidateIds.map((id) => byId.get(id)).filter((item): item is MemoryCandidate => Boolean(item))
        if (targetCandidates.length === 0) throw new Error('目标故事资料已经不存在，请重新让 Agent 查询后再操作')
        const updatedAt = Date.now()
        const updates: MemoryCandidate[] = []
        if (mutation.kind === 'add_alias') {
          for (const candidate of targetCandidates) updates.push({
            ...candidate,
            metadata: { ...candidate.metadata, aliases: [...new Set([...(candidate.metadata.aliases ?? []), mutation.value])].slice(0, 20) },
            updatedAt,
          })
        } else if (mutation.kind === 'merge_entities') {
          const primary = targetCandidates.find((candidate) => candidate.kind === 'character') ?? targetCandidates[0]
          const entityId = primary.metadata.entityId || primary.id
          for (const candidate of [...targetCandidates, ...(mutation.secondaryCandidateIds ?? []).map((id) => byId.get(id)).filter((item): item is MemoryCandidate => Boolean(item))]) {
            updates.push({
              ...candidate,
              metadata: {
                ...candidate.metadata,
                entityId,
                aliases: [...new Set([...(candidate.metadata.aliases ?? []), ...(mutation.secondaryName ? [mutation.secondaryName] : [])])].slice(0, 20),
              },
              updatedAt,
            })
          }
        } else {
          for (const candidate of targetCandidates) updates.push({
            ...candidate,
            metadata: { ...candidate.metadata, lifecycle: mutation.value as MemoryCandidateMetadata['lifecycle'] },
            updatedAt,
          })
        }
        for (const candidate of updates) await updateMemoryCandidate(candidate)
        const [currentBundle, refreshed] = await Promise.all([getChapterMemory(project.id, activeChapter.id), getProjectMemory(project.id)])
        setMemoryBundle(currentBundle)
        setProjectMemoryBundles(refreshed)
      }
      const updatedMutation = { ...mutation, status }
      const updatedTurn: AgentTurn = {
        ...turn,
        memoryMutations: (turn.memoryMutations ?? []).map((item) => item.id === mutation.id ? updatedMutation : item),
        tools: turn.tools.map((tool) => tool.name === 'mutate_story_memory'
          ? { ...tool, status: status === 'confirmed' ? 'complete' : 'rejected', detail: status === 'confirmed' ? '作者已确认，程序写入并重新读取校验' : '作者已拒绝，未修改故事记忆' }
          : tool),
      }
      const updatedMessage = { ...message, content: updatedTurn.reply, payloadJson: JSON.stringify(updatedTurn) }
      await saveAiConversationMessage(updatedMessage)
      setAgentMessages((current) => current.map((item) => item.id === updatedMessage.id ? updatedMessage : item))
      setAgentMessage(status === 'confirmed' ? '故事记忆变更已写入并校验' : '已取消本次故事记忆变更')
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : '故事记忆变更失败')
    }
  }

  const mergeMemoryCandidateEntity = async (candidate: MemoryCandidate) => {
    const targetId = memoryMergeTargets[candidate.id]
    if (!targetId) {
      setMemoryMessage('请先选择要合并到的已有实体')
      return
    }
    const bundles = await getProjectMemory(project.id)
    const all = bundles.flatMap((bundle) => bundle.candidates)
    const target = all.find((item) => item.id === targetId)
    if (!target || target.kind !== candidate.kind) {
      setMemoryMessage('目标实体已经变化，请重新选择')
      return
    }
    if (!await showConfirm(`确认“${candidate.title}”与“${target.title}”指向同一实体？两者的原文证据都会保留。`, { title: '合并故事实体', confirmLabel: '确认合并' })) return
    const sourceEntityId = candidate.metadata.entityId || candidate.id
    const targetEntityId = target.metadata.entityId || target.id
    const affected = all.filter((item) => {
      const entityId = item.metadata.entityId || item.id
      return entityId === sourceEntityId || entityId === targetEntityId
    })
    const chapterOrder = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
    const firstSeenChapterId = affected.map((item) => item.metadata.firstSeenChapterId || item.chapterId)
      .sort((left, right) => (chapterOrder.get(left) ?? Number.MAX_SAFE_INTEGER) - (chapterOrder.get(right) ?? Number.MAX_SAFE_INTEGER))[0] ?? target.chapterId
    const aliases = [...new Set(affected.flatMap((item) => [item.title, ...(item.metadata.aliases ?? [])]))]
      .filter((name) => name && name !== target.title).slice(0, 20)
    const now = Date.now()
    for (const item of affected) {
      await updateMemoryCandidate({ ...item, metadata: { ...item.metadata, entityId: targetEntityId, aliases, firstSeenChapterId }, updatedAt: now })
    }
    const [currentBundle, projectBundles] = await Promise.all([getChapterMemory(project.id, activeChapter.id), getProjectMemory(project.id)])
    setMemoryBundle(currentBundle)
    setProjectMemoryBundles(projectBundles)
    setMemoryMergeTargets((current) => ({ ...current, [candidate.id]: '' }))
    setMemoryMessage(`已合并为“${target.title}”，共保留 ${affected.length} 条资料证据`)
  }

  const loadProjectMemoryIndex = async (scope: 'project' | 'timeline' | 'characters' | 'threads' | 'digests' | 'consistency' = 'project') => {
    setMemoryScope(scope)
    setProjectMemoryLoading(true)
    setMemoryMessage('')
    try {
      setProjectMemoryBundles(await getProjectMemory(project.id))
    } catch (error) {
      setMemoryMessage(error instanceof Error ? error.message : '无法读取全书资料')
    } finally {
      setProjectMemoryLoading(false)
    }
  }

  const updateProjectMemoryLifecycle = async (candidate: MemoryCandidate, lifecycle: MemoryCandidateMetadata['lifecycle']) => {
    const updated = { ...candidate, metadata: { ...candidate.metadata, lifecycle }, updatedAt: Date.now() }
    await updateMemoryCandidate(updated)
    setProjectMemoryBundles((current) => current.map((bundle) => ({
      ...bundle,
      candidates: bundle.candidates.map((item) => item.id === updated.id ? updated : item),
    })))
    setMemoryMessage(`已将“${candidate.title}”标记为${MEMORY_LIFECYCLE_LABELS[lifecycle]}`)
  }

  const runMemoryConsistencyCheck = async () => {
    setProjectMemoryLoading(true)
    setMemoryMessage('正在核对已确认资料的状态、规则和时间范围')
    try {
      const bundles = await getProjectMemory(project.id)
      const issues = detectMemoryConsistencyIssues(project, bundles)
      await replaceReviewIssues(project.id, null, 'memory_consistency', issues)
      setProjectMemoryBundles(bundles)
      setReviewIssues(await listReviewIssues(project.id))
      setMemoryMessage(issues.length > 0 ? `发现 ${issues.length} 处需要作者判断的一致性问题` : '没有发现明确的故事记忆冲突')
    } catch (error) {
      setMemoryMessage(error instanceof Error ? error.message : '一致性检查失败')
    } finally {
      setProjectMemoryLoading(false)
    }
  }

  const runProjectQuestion = async (questionOverride?: string) => {
    if (projectQuestionBusy) {
      projectQuestionController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setProjectQuestionMessage('请先完成 AI 服务配置')
      return
    }
    const question = questionOverride?.trim() || projectQuestion.trim()
    if (!question) {
      setProjectQuestionMessage('请输入要询问的问题')
      return
    }
    if (!aiDataPermissions.currentChapter && !aiDataPermissions.otherChapters) {
      setProjectQuestionMessage('当前作品禁止发送任何章节正文，无法询问作品')
      return
    }
    const controller = new AbortController()
    projectQuestionController.current = controller
    setProjectQuestionBusy(true)
    setProjectQuestionMessage('正在检索作品并核对原文')
    setProjectAnswer(null)
    let pendingMessage: AiConversationMessage | null = null
    try {
      const bundle = await getOrCreateAiConversation(project.id, 'project_qa', '作品问答')
      const requestId = crypto.randomUUID()
      const now = Date.now()
      const userMessage: AiConversationMessage = {
        id: crypto.randomUUID(), conversationId: bundle.conversation.id, requestId, role: 'user', content: question,
        payloadJson: '', status: 'complete', error: '', createdAt: now,
      }
      pendingMessage = {
        id: crypto.randomUUID(), conversationId: bundle.conversation.id, requestId, role: 'assistant', content: '',
        payloadJson: '', status: 'pending', error: '', createdAt: now + 1,
      }
      await saveAiConversationMessage(userMessage)
      await saveAiConversationMessage(pendingMessage)
      setQaConversation(bundle.conversation)
      setQaMessages((current) => [...current.filter((message) => message.requestId !== requestId), userMessage, pendingMessage!])
      const memories = await getProjectMemory(project.id)
      const allowedChapterIds = new Set(project.chapters
        .filter((chapter) => chapter.id === activeChapter.id ? aiDataPermissions.currentChapter : aiDataPermissions.otherChapters)
        .map((chapter) => chapter.id))
      const answer = await askProjectQuestion(aiSettings, aiApiKey, project, memories, question, controller.signal, {
        allowedChapterIds,
        includeConfirmedMemory: aiDataPermissions.confirmedMemory,
      })
      if (projectQuestionController.current !== controller) return
      const completed: AiConversationMessage = {
        ...pendingMessage,
        content: answer.answer,
        payloadJson: JSON.stringify(answer),
        status: 'complete',
      }
      await saveAiConversationMessage(completed)
      setQaMessages((current) => current.map((message) => message.id === completed.id ? completed : message))
      setProjectAnswer(answer)
      setProjectQuestionMessage(`回答引用了 ${answer.citations.length} 处原文`)
    } catch (error) {
      if (projectQuestionController.current !== controller) return
      const errorMessage = error instanceof Error ? error.message : '询问作品失败'
      if (pendingMessage) {
        const failed: AiConversationMessage = {
          ...pendingMessage,
          status: controller.signal.aborted ? 'cancelled' : 'failed',
          error: controller.signal.aborted ? '请求已由用户停止' : errorMessage,
        }
        await saveAiConversationMessage(failed).catch(() => undefined)
        setQaMessages((current) => current.map((message) => message.id === failed.id ? failed : message))
      }
      setProjectQuestionMessage(errorMessage)
    } finally {
      if (projectQuestionController.current === controller) {
        projectQuestionController.current = null
        setProjectQuestionBusy(false)
      }
    }
  }

  const captureAgentSelection = () => {
    const selection = editor?.state.selection
    const selectedText = editor && selection ? editor.state.doc.textBetween(selection.from, selection.to, '\n', '\n') : ''
    const next = { from: selection?.from ?? 1, to: selection?.to ?? selection?.from ?? 1, text: selectedText }
    setAgentSelection(next)
    return next
  }

  const openAgentAssistant = () => {
    captureAgentSelection()
    closeUtilityPanels()
    setAssistantView('assistant')
    setAgentMessage('')
    setAssistantOpen(true)
  }

  const offlineNameUsed = useMemo(() => {
    const names = new Set<string>()
    project.chapters.forEach((chapter) => names.add(chapter.title))
    projectMemoryBundles.flatMap((bundle) => bundle.candidates).forEach((candidate) => {
      names.add(candidate.title)
      candidate.metadata.aliases.forEach((alias) => names.add(alias))
    })
    return [...names]
  }, [project.chapters, projectMemoryBundles])

  const generateOfflineNameCandidates = async () => {
    setOfflineNamingLoading(true)
    try {
      const module = await loadOfflineNaming()
      const generated = module.generateOfflineNames({
        kind: offlineNameKind,
        culture: offlineNameCulture,
        period: offlineNamePeriod,
        catalogMode: offlineCatalogMode,
        gender: offlineNameGender,
        locationType: offlineLocationType,
        surname: offlineNameKind === 'character' ? offlineNameSurname : '',
        count: offlineNameCount,
        exclude: offlineNameUsed,
      })
      await module.saveOfflineNameCandidates(project.id, generated)
      setOfflineNameCandidates(generated)
    } finally {
      setOfflineNamingLoading(false)
    }
  }

  const toggleOfflineNameFavorite = (candidate: OfflineNameCandidate) => {
    setOfflineNameCandidates((current) => {
      const next = current.map((item) => item.id === candidate.id ? { ...item, favorite: !item.favorite } : item)
      void loadOfflineNaming().then((module) => module.saveOfflineNameCandidates(project.id, next))
      return next
    })
  }

  const useOfflineNameInAgent = (candidate: OfflineNameCandidate) => {
    setAssistantView('assistant')
    setAgentInput(`我准备使用“${candidate.name}”作为${offlineNameKind === 'character' ? '人物' : offlineNameKind === 'location' ? '地点' : offlineNameKind === 'organization' ? '组织' : '物品'}名称。它来自${candidate.cultureLabel}·${candidate.periodLabel}，姓名结构是“${candidate.components}”。请结合当前故事记忆检查它是否合适。`)
    setAgentMessage('已把本地名称带入 Agent，可继续讨论；不会自动写入故事记忆')
  }

  const prepareSelectionAgentAction = (action: 'discuss' | 'polish' | 'compress' | 'expand' | 'dialogue' | 'consistency') => {
    if (!editor || editor.state.selection.empty) return
    const selection = editor.state.selection
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, '\n', '\n')
    if (!selectedText.trim()) return
    const instructions = {
      discuss: '请和我讨论这段文字目前的问题、有效之处和可行修改方向，先不要直接改写。',
      polish: '请润色当前选区，保留原意和事实，不新增剧情，生成可在编辑器中预览的改写候选。',
      compress: '请精简当前选区，删除重复和拖沓表达，保留关键动作、信息与语气，生成改写候选。',
      expand: '请扩写当前选区，增强具体感和场景推进，但不要擅自新增未经确认的设定，生成改写候选。',
      dialogue: '请检查并调整当前选区中的对白，让人物口吻更稳定、潜台词更自然，生成改写候选。',
      consistency: '请检查当前选区与全书已确认故事记忆、前后剧情和人物状态是否一致，引用原文依据，先不要改写。',
    }
    setAgentSelection({ from: selection.from, to: selection.to, text: selectedText })
    setAgentInput(instructions[action])
    closeUtilityPanels()
    setAssistantView('assistant')
    setAgentMessage('已带入正文选区，可补充要求后发送')
    setContextMenu(null)
    setAssistantOpen(true)
  }

  const activateAgentConversation = (bundle: { conversation: AiConversation; messages: AiConversationMessage[] }) => {
    setAgentConversation(bundle.conversation)
    setAgentMessages(bundle.messages)
    setAgentMessage('')
    localStorage.setItem(`zili-writing-agent-conversation-v1:${project.id}`, bundle.conversation.id)
  }

  const createNewAgentConversation = async () => {
    if (agentBusy) {
      setAgentMessage('请先停止当前请求，再新建对话')
      return
    }
    try {
      const bundle = await createAiConversation(project.id, 'agent', '新对话', activeChapter.id, activeScene?.id ?? null)
      setAgentConversations((current) => [bundle.conversation, ...current])
      activateAgentConversation(bundle)
      setAgentInput('')
      setAgentImages([])
      captureAgentSelection()
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : '无法新建 Agent 对话')
    }
  }

  const switchAgentConversation = async (conversationId: string) => {
    if (agentBusy || conversationId === agentConversation?.id) return
    try {
      const bundle = await getAiConversationBundle(conversationId)
      if (!bundle || bundle.conversation.projectId !== project.id || bundle.conversation.kind !== 'agent') throw new Error('对话已经不存在')
      activateAgentConversation(bundle)
      setAgentInput('')
      setAgentImages([])
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : '无法切换 Agent 对话')
    }
  }

  const removeAgentConversation = async () => {
    if (!agentConversation || agentBusy) return
    if (!await showConfirm(`删除对话“${agentConversation.title}”？候选稿和正文不会被删除。`, { title: '删除 Agent 对话', confirmLabel: '删除' })) return
    try {
      await deleteAiConversation(agentConversation.id)
      const remaining = agentConversations.filter((conversation) => conversation.id !== agentConversation.id)
      if (remaining.length > 0) {
        const bundle = await getAiConversationBundle(remaining[0].id)
        setAgentConversations(remaining)
        if (bundle) activateAgentConversation(bundle)
      } else {
        const bundle = await createAiConversation(project.id, 'agent', '新对话', activeChapter.id, activeScene?.id ?? null)
        setAgentConversations([bundle.conversation])
        activateAgentConversation(bundle)
      }
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : '无法删除 Agent 对话')
    }
  }

  const attachAgentImage = (asset: ImageAsset) => {
    if (asset.size > 10 * 1024 * 1024) {
      void showAlert('用于 AI 分析的单张图片不能超过 10 MB。', '图片过大')
      return
    }
    setAgentImages((current) => current.some((item) => item.id === asset.id) ? current : [...current, asset].slice(0, 3))
    setAgentImagePickerOpen(false)
  }

  const uploadAgentImage = async (file: File) => {
    try {
      const asset = await saveImageAsset(project.id, file)
      setImageAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)])
      attachAgentImage(asset)
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '图片保存失败', '图片保存失败')
    }
  }

  const openAgentImagePicker = async () => {
    try {
      setImageAssets(await listImageAssets(project.id))
      setAgentImagePickerOpen((current) => !current)
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : '无法读取图片素材')
    }
  }

  const executeAgentNavigationTools = async (request: string): Promise<AgentToolExecution[]> => {
    const tools: AgentToolExecution[] = []
    const openedChapter = /(?:打开|跳转到|定位到)\s*(?:第\s*)?(\d{1,6})\s*章/.exec(request)
    if (openedChapter) {
      const number = Number(openedChapter[1])
      const target = project.chapters.find((chapter) => Number(chapter.title.match(/第\s*0*(\d{1,6})\s*章/)?.[1] ?? 0) === number)
      if (target) {
        await openChapter(target.id)
        tools.push({ id: crypto.randomUUID(), name: 'open_chapter', label: '打开章节', access: 'navigate', status: 'complete', detail: target.title })
      } else {
        tools.push({ id: crypto.randomUUID(), name: 'open_chapter', label: '打开章节', access: 'navigate', status: 'failed', detail: `没有找到第${number}章` })
      }
    }
    const panelActions: Array<{ pattern: RegExp; label: string; run: () => void | Promise<void> }> = [
      { pattern: /(?:打开|显示|切换到)回收站/, label: '回收站', run: openTrash },
      { pattern: /(?:打开|显示|切换到)参考文本/, label: '参考文本', run: openReferences },
      { pattern: /(?:打开|显示|切换到)图片素材/, label: '图片素材', run: openAssets },
      { pattern: /(?:打开|显示|切换到)附件资料/, label: '附件资料', run: openAttachments },
      { pattern: /(?:打开|显示|切换到)故事记忆/, label: '故事记忆', run: () => { setAssistantView('memory'); setMemoryScope('chapter'); setMemoryFilter('candidate') } },
      { pattern: /(?:查看|打开|显示|查找).{0,12}(?:人物资料|角色档案|人物页|角色页)/, label: '人物资料', run: () => { setAssistantView('memory'); setMemoryScope('characters'); setMemorySearch('') } },
      { pattern: /(?:定位|查找|显示).{0,12}(?:原文证据|证据位置|首次出现)/, label: '证据定位', run: () => { setAssistantView('memory'); setMemoryScope('timeline'); setMemorySearch('') } },
    ]
    for (const action of panelActions) {
      if (!action.pattern.test(request)) continue
      await action.run()
      tools.push({ id: crypto.randomUUID(), name: 'open_panel', label: '打开程序面板', access: 'navigate', status: 'complete', detail: action.label })
      break
    }
    return tools
  }

  const executeAdvancedAgentTool = async (intent: NonNullable<ReturnType<typeof detectAdvancedAgentIntent>>, signal: AbortSignal) => {
    const [memoryBundles, creative, advancedWorkspace] = await Promise.all([
      getProjectMemory(project.id),
      loadCreativeWorkspace(project.id),
      loadAdvancedAiWorkspace(project.id),
    ])
    const memories = permittedMemories(memoryBundles)
    const workspace = aiDataPermissions.creativePlanning ? creative : { brief: emptyCreativeBrief(project.id), outline: [], sessions: [] }
    if (['voice', 'relationship', 'plot', 'debts'].includes(intent.kind) && !aiDataPermissions.confirmedMemory) throw new Error('这个工具需要读取已确认故事记忆，请先在 AI 服务设置中授权')
    if (['reader', 'pacing', 'recap'].includes(intent.kind) && !aiDataPermissions.currentChapter) throw new Error('这个工具需要读取当前章节，请先在 AI 服务设置中授权')
    let result: unknown
    let titleInput = activeChapter.title
    if (intent.kind === 'voice') {
      titleInput = intent.character
      result = await testCharacterVoice(aiSettings, aiApiKey, project, memories, intent.character, intent.situation, signal)
    } else if (intent.kind === 'relationship') {
      titleInput = `${intent.first} / ${intent.second}`
      result = await simulateRelationship(aiSettings, aiApiKey, project, memories, intent.first, intent.second, intent.scenario, signal)
    } else if (intent.kind === 'reader') {
      result = await simulateReaderResponse(aiSettings, aiApiKey, project, activeChapter, intent.audience, intent.focus, signal)
    } else if (intent.kind === 'research') {
      titleInput = intent.question
      result = await synthesizeResearchSources(aiSettings, aiApiKey, project.id, intent.question, advancedWorkspace.sources, signal)
    } else if (intent.kind === 'plan') {
      titleInput = project.title
      const words = project.chapters.reduce((total, chapter) => total + chapter.plainText.replace(/\s/g, '').length, 0)
      result = await createWritingPlan(aiSettings, aiApiKey, project, workspace, memories, Math.max(words + 50000, Math.ceil(words * 1.25)), 1500, '', intent.note, signal)
    } else if (intent.kind === 'plot') {
      titleInput = intent.question
      result = await simulatePlotDirections(aiSettings, aiApiKey, project, activeChapter, workspace, memories, intent.question, signal)
    } else if (intent.kind === 'pacing') {
      result = await diagnoseScenePacing(aiSettings, aiApiKey, project, activeChapter, activeScene, intent.focus, signal)
    } else if (intent.kind === 'debts') {
      titleInput = project.title
      result = buildStoryDebtLedger(project, memories)
    } else {
      const revisions = await listRevisions(activeChapter.id)
      const previous = revisions.find((revision) => revision.contentHash !== activeChapter.contentHash)
      result = await createWritingSessionRecap(aiSettings, aiApiKey, project, activeChapter, previous?.plainText ?? '', memories, intent.note, signal)
    }
    const kind = intent.kind as AdvancedAiToolKind
    const now = Date.now()
    await saveAdvancedAiRecord({
      id: crypto.randomUUID(), projectId: project.id, kind,
      chapterId: ['reader', 'voice', 'relationship', 'plot', 'pacing', 'recap'].includes(kind) ? activeChapter.id : null,
      sceneId: ['voice', 'relationship', 'plot', 'pacing'].includes(kind) ? activeScene?.id ?? null : null,
      title: recordTitle(kind, titleInput, activeScene), inputJson: JSON.stringify(intent), outputJson: JSON.stringify(result), createdAt: now, updatedAt: now,
    })
    return { kind, result, reply: formatAdvancedAgentResult(intent, result) }
  }

  const runAgentConversation = async (requestOverride?: string) => {
    if (agentBusy) {
      agentController.current?.abort()
      return
    }
    const request = requestOverride?.trim() || agentInput.trim()
    const clearsComposer = requestOverride === undefined || requestOverride.trim() === agentInput.trim()
    if (!request) {
      setAgentMessage('请输入想讨论或处理的内容')
      return
    }
    const advancedIntent = detectAdvancedAgentIntent(request)
    if ((!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) && advancedIntent?.kind !== 'debts') {
      setAgentMessage('请先完成 AI 服务配置')
      return
    }
    const wantsWebResearch = requestsWebResearch(request)
    if (!aiDataPermissions.currentChapter && !aiDataPermissions.otherChapters) {
      const mayUseExternalSources = (aiDataPermissions.deletedChapters && /回收站|已删除|删掉的|删除的.{0,8}(?:章节|内容|正文)|之前删/.test(request))
        || (aiDataPermissions.referenceTexts && /参考文本|参考资料|参考小说|导入的(?:小说|文本|资料)|素材库/.test(request))
        || (aiDataPermissions.webResearch && wantsWebResearch)
      if (!mayUseExternalSources) {
        setAgentMessage('当前作品没有授权 Agent 读取可用资料')
        return
      }
    }
    const wantsDeletedChapters = /回收站|已删除|删掉的|删除的.{0,8}(?:章节|内容|正文)|之前删/.test(request)
    const wantsReferenceTexts = /参考文本|参考资料|参考小说|导入的(?:小说|文本|资料)|素材库/.test(request)
    if (wantsDeletedChapters && !aiDataPermissions.deletedChapters) {
      setAgentMessage('当前作品未授权 Agent 读取回收站章节，请先在 AI 服务设置中开启')
      return
    }
    if (wantsReferenceTexts && !aiDataPermissions.referenceTexts) {
      setAgentMessage('当前作品未授权 Agent 读取参考文本，请先在 AI 服务设置中开启')
      return
    }
    if (wantsWebResearch && !aiDataPermissions.webResearch) {
      setAgentMessage('当前作品未授权 Agent 联网检索，请先在 AI 服务设置中开启')
      return
    }
    const controller = new AbortController()
    agentController.current = controller
    const taskId = beginAiTask(wantsWebResearch ? 'research' : 'agent', wantsWebResearch ? 'Agent 联网研究' : 'Agent 对话', request.slice(0, 120), request)
    setAgentBusy(true)
    setAgentTaskPhase('retrieval')
    setAgentMessage('正在检索作品上下文')
    setAgentImagePickerOpen(false)
    let pendingMessage: AiConversationMessage | null = null
    try {
      const bundle = agentConversation?.projectId === project.id
        ? { conversation: agentConversation, messages: agentMessages }
        : await createAiConversation(project.id, 'agent', '新对话', activeChapter.id, activeScene?.id ?? null)
      const firstUserMessage = !bundle.messages.some((message) => message.role === 'user')
      const conversation = firstUserMessage ? {
        ...bundle.conversation,
        title: agentConversationTitle(request),
        chapterId: activeChapter.id,
        sceneId: activeScene?.id ?? null,
        updatedAt: Date.now(),
      } : bundle.conversation
      if (firstUserMessage) await saveAiConversation(conversation)
      const requestId = crypto.randomUUID()
      const now = Date.now()
      const userMessage: AiConversationMessage = {
        id: crypto.randomUUID(), conversationId: conversation.id, requestId, role: 'user', content: request,
        payloadJson: JSON.stringify({ imageNames: agentImages.map((image) => image.fileName), selectionText: agentSelection.text }), status: 'complete', error: '', createdAt: now,
      }
      pendingMessage = {
        id: crypto.randomUUID(), conversationId: conversation.id, requestId, role: 'assistant', content: '', payloadJson: '', status: 'pending', error: '', createdAt: now + 1,
      }
      const pendingMessageId = pendingMessage.id
      await saveAiConversationMessage(userMessage)
      await saveAiConversationMessage(pendingMessage)
      setAgentConversation(conversation)
      setAgentConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)].sort((left, right) => right.updatedAt - left.updatedAt))
      localStorage.setItem(`zili-writing-agent-conversation-v1:${project.id}`, conversation.id)
      const conversationMessages = [...bundle.messages.filter((message) => message.requestId !== requestId), userMessage, pendingMessage]
      const historyMessages = conversationMessages.filter((message) => message.requestId !== requestId)
      setAgentMessages(conversationMessages)
      if (clearsComposer) {
        setAgentInput('')
        setAgentImages([])
      }
      const existingMemoryForMutation = await getProjectMemory(project.id)
      const memoryMutationPreview = buildAgentMemoryMutationPreviews(project, existingMemoryForMutation, request)
      if (memoryMutationPreview.error) throw new Error(memoryMutationPreview.error)
      if (memoryMutationPreview.mutations.length > 0) {
        const mutations = memoryMutationPreview.mutations
        const completedTurn: AgentTurn = {
          reply: `已准备 ${mutations.length} 项故事记忆变更预览。正式资料尚未修改，请核对目标和影响后确认。`,
          reasoning: '', citations: [], drafts: [], memoryMutations: mutations,
          usedContext: ['已确认故事记忆'], imageNames: [],
          retrieval: {
            scope: 'project', scopeLabel: '故事记忆实体索引', totalChapters: project.chapters.length,
            searchedChapters: 0, selectedChapters: [], memoryItems: existingMemoryForMutation.flatMap((item) => item.candidates).filter((item) => item.status === 'confirmed').length,
            evidenceCount: mutations.reduce((total, mutation) => total + mutation.targetCandidateIds.length + (mutation.secondaryCandidateIds?.length ?? 0), 0),
            summaryLevels: ['人物资料', '实体别名', '线索生命周期'],
          },
          tools: [{ id: crypto.randomUUID(), name: 'mutate_story_memory', label: '准备故事记忆变更', access: 'write-preview', status: 'awaiting-confirmation', detail: `${mutations.length} 项变更，等待作者确认` }],
        }
        const completed: AiConversationMessage = { ...pendingMessage, content: completedTurn.reply, payloadJson: JSON.stringify(completedTurn), status: 'complete' }
        await saveAiConversationMessage(completed)
        const updatedConversation = { ...conversation, updatedAt: Date.now() }
        setAgentConversation(updatedConversation)
        setAgentConversations((current) => [updatedConversation, ...current.filter((item) => item.id !== updatedConversation.id)].sort((left, right) => right.updatedAt - left.updatedAt))
        setAgentMessages((current) => current.map((message) => message.id === completed.id ? completed : message))
        setAgentInput('')
        setAgentImages([])
        setAgentMessage(`${mutations.length} 项故事记忆变更等待确认`)
        setAgentTaskPhase('complete')
        finishAiTask(taskId, 'completed', `已生成 ${mutations.length} 项待确认故事记忆变更`)
        return
      }
      if (advancedIntent) {
        setAgentTaskPhase(advancedIntent.kind === 'debts' ? 'validation' : 'generation')
        setAgentMessage(advancedIntent.kind === 'debts' ? '正在核对未回收情节线' : '正在运行创作工具并整理结果')
        const advanced = await executeAdvancedAgentTool(advancedIntent, controller.signal)
        if (agentController.current !== controller) return
        const completedTurn: AgentTurn = {
          reply: advanced.reply, reasoning: '', citations: [], drafts: [], usedContext: ['创作工具记录'], imageNames: [],
          retrieval: {
            scope: ['plot', 'relationship', 'voice', 'debts', 'plan'].includes(advanced.kind) ? 'project' : 'current',
            scopeLabel: `${recordTitle(advanced.kind, '', activeScene)}工具`, totalChapters: project.chapters.length,
            searchedChapters: advanced.kind === 'debts' ? 0 : 1, selectedChapters: ['reader', 'pacing', 'recap'].includes(advanced.kind) ? [activeChapter.title] : [],
            memoryItems: existingMemoryForMutation.flatMap((bundle) => bundle.candidates).filter((candidate) => candidate.status === 'confirmed').length,
            evidenceCount: 0, summaryLevels: ['已确认故事记忆', '创作规划', '当前正文'],
          },
          tools: [{ id: crypto.randomUUID(), name: 'run_advanced_tool', label: '运行创作工具', access: 'read', status: 'complete', detail: '结果已保存为可回看的工具记录，未修改正文或故事记忆' }],
        }
        const completed: AiConversationMessage = { ...pendingMessage, content: completedTurn.reply, payloadJson: JSON.stringify(completedTurn), status: 'complete' }
        await saveAiConversationMessage(completed)
        const updatedConversation = { ...conversation, updatedAt: Date.now() }
        setAgentConversation(updatedConversation)
        setAgentConversations((current) => [updatedConversation, ...current.filter((item) => item.id !== updatedConversation.id)].sort((left, right) => right.updatedAt - left.updatedAt))
        setAgentMessages((current) => current.map((message) => message.id === completed.id ? completed : message))
        setAgentInput('')
        setAgentImages([])
        setAgentTaskPhase('complete')
        setAgentMessage('工具分析已完成并保存')
        finishAiTask(taskId, 'completed', '工具分析已完成并保存，未修改正文')
        return
      }
      if (requestsStoryMemoryProposal(request)) {
        setAgentMessage('正在把作者确认的设定整理为故事记忆候选')
        const proposed = await proposeAuthorMemoryCandidates(
          aiSettings,
          aiApiKey,
          project.id,
          activeChapter,
          request,
          userMessage.id,
          [...historyMessages, userMessage],
          controller.signal,
        )
        if (agentController.current !== controller) return
        if (proposed.length === 0) throw new Error('没有从对话中识别出作者明确确认的设定，请补充角色名称和具体设定后重试')
        const candidates = await reconcileMemoryEntities(project, proposed, await getProjectMemory(project.id))
        await saveMemoryCandidates(candidates)
        const [currentMemory, projectMemories] = await Promise.all([
          getChapterMemory(project.id, activeChapter.id),
          getProjectMemory(project.id),
        ])
        setMemoryBundle(currentMemory)
        setProjectMemoryBundles(projectMemories)
        const completedTurn: AgentTurn = {
          reply: `已整理出 ${candidates.length} 条作者设定候选。它们尚未进入正式故事记忆，请核对后确认加入。`,
          reasoning: '',
          citations: [],
          drafts: [],
          memoryCandidates: candidates,
          usedContext: ['最近对话', activeChapter.title],
          imageNames: [],
          retrieval: {
            scope: 'current',
            scopeLabel: '作者确认的对话设定',
            totalChapters: project.chapters.length,
            searchedChapters: 0,
            selectedChapters: [activeChapter.title],
            memoryItems: candidates.length,
            evidenceCount: 0,
            summaryLevels: ['作者口述设定'],
          },
          tools: [{ id: crypto.randomUUID(), name: 'propose_story_memory', label: '准备故事记忆候选', access: 'write-preview', status: 'awaiting-confirmation', detail: `${candidates.length} 条候选，等待作者确认` }],
        }
        const completed: AiConversationMessage = { ...pendingMessage, content: completedTurn.reply, payloadJson: JSON.stringify(completedTurn), status: 'complete' }
        await saveAiConversationMessage(completed)
        const updatedConversation = { ...conversation, updatedAt: Date.now() }
        setAgentConversation(updatedConversation)
        setAgentConversations((current) => [updatedConversation, ...current.filter((item) => item.id !== updatedConversation.id)].sort((left, right) => right.updatedAt - left.updatedAt))
        setAgentMessages((current) => current.map((message) => message.id === completed.id ? completed : message))
        setAgentInput('')
        setAgentImages([])
        setAgentMessage(`已生成 ${candidates.length} 条待确认故事资料`)
        setAgentTaskPhase('complete')
        finishAiTask(taskId, 'completed', `已生成 ${candidates.length} 条待确认故事资料`)
        return
      }

      const programTools: AgentToolExecution[] = []
      let batchResult: Awaited<ReturnType<typeof analyzeMemoryChapterSet>> | null = null
      const range = requestedChapterRange(project, request)
      if (range && requestsChapterMemoryAnalysis(request)) {
        const chapters = range.chapterIds.map((chapterId) => project.chapters.find((chapter) => chapter.id === chapterId)).filter((chapter): chapter is Chapter => Boolean(chapter?.plainText.trim()))
        const readsOtherChapters = chapters.some((chapter) => chapter.id !== activeChapter.id)
        if (!aiDataPermissions.currentChapter || (readsOtherChapters && !aiDataPermissions.otherChapters)) {
          throw new Error('批量故事记忆分析需要允许 AI 读取所选章节，请先在 AI 服务设置中调整数据权限')
        }
        setAgentMessage(`准备分析第 ${range.startNumber} 至 ${range.endNumber} 章`)
        batchResult = await analyzeMemoryChapterSet(chapters, controller.signal, setAgentMessage)
        programTools.push({
          id: crypto.randomUUID(),
          name: 'analyze_chapter_range',
          label: '批量分析故事记忆',
          access: 'write-preview',
          status: batchResult.failures.length === chapters.length ? 'failed' : 'complete',
          detail: `完成 ${batchResult.analyzedCount}/${chapters.length} 章，整理 ${batchResult.candidateCount} 条资料${batchResult.emptyChapters.length ? `，${batchResult.emptyChapters.length} 章无候选` : ''}${batchResult.failures.length ? `，${batchResult.failures.length} 章失败` : ''}`,
        })
      }
      const [workspace, memories, styleProfile] = await Promise.all([
        loadCreativeWorkspace(project.id),
        getProjectMemory(project.id),
        loadStyleProfile(project.id),
      ])
      const externalSources: AgentExternalSource[] = []
      if (wantsDeletedChapters || wantsReferenceTexts || wantsWebResearch || agentImages.length > 0) setAgentTaskPhase('external')
      if (wantsDeletedChapters) {
        setAgentMessage('正在检索回收站章节')
        const deletedChapters = await listTrashedChapters(project.id)
        externalSources.push(...deletedChapters.map((item) => ({
          kind: 'trash' as const,
          id: item.id,
          title: item.title,
          text: item.plainText,
        })))
      }
      if (wantsReferenceTexts) {
        setAgentMessage('正在读取参考文本')
        const references = await listReferenceTexts(project.id)
        const namedReferences = references.filter((item) => request.includes(item.fileName) || request.includes(item.fileName.replace(/\.[^.]+$/, '')))
        const selectedReferences = (namedReferences.length ? namedReferences : references).slice(0, 8)
        for (const reference of selectedReferences) {
          externalSources.push({
            kind: 'reference',
            id: reference.id,
            title: reference.fileName,
            text: await referencePlainText(reference),
          })
        }
      }
      if (wantsWebResearch) {
        setAgentMessage('正在联网搜索并读取来源')
        const web = await researchWeb(request, controller.signal)
        externalSources.push(...web.sources.map((source, index) => ({
          kind: 'web' as const,
          id: `web:${index}:${source.url}`,
          title: source.title,
          text: `${source.snippet}\n${source.text}`,
          url: source.url,
        })))
        const existingResearch = await loadAdvancedAiWorkspace(project.id)
        const knownUrls = new Set(existingResearch.sources.map((source) => source.url).filter(Boolean))
        const savedSources = web.sources.filter((source) => source.url && !knownUrls.has(source.url)).slice(0, 12)
        for (const source of savedSources) {
          const now = Date.now()
          await saveResearchSourceCard({
            id: crypto.randomUUID(), projectId: project.id, title: source.title, url: source.url,
            excerpt: `${source.snippet}\n${source.text}`.trim().slice(0, 20000), notes: `由 Agent 联网检索保存；检索问题：${request.slice(0, 300)}`,
            verified: false, createdAt: now, updatedAt: now,
          })
        }
        programTools.push({
          id: crypto.randomUUID(), name: 'save_research_cards', label: '保存研究来源卡', access: 'write', status: 'complete',
          detail: savedSources.length > 0 ? `保存 ${savedSources.length} 张未核验来源卡，可在创作工具的“研究”中复核` : '来源网址已存在，没有重复保存',
        })
      }
      const images: AgentImageInput[] = []
      for (const asset of agentImages) {
        const bytes = await readImageAsset(asset)
        images.push({ id: asset.id, name: asset.fileName, mediaType: asset.mediaType || `image/${asset.extension}`, dataUrl: await blobToDataUrl(new Blob([bytes], { type: asset.mediaType || `image/${asset.extension}` })) })
      }
      const allowedChapterIds = new Set(project.chapters
        .filter((item) => item.id === activeChapter.id ? aiDataPermissions.currentChapter : aiDataPermissions.otherChapters)
        .map((item) => item.id))
      setAgentMessage(images.length ? '正在阅读作品与图片' : '正在阅读相关章节并思考')
      setAgentTaskPhase('generation')
      const turn = await runWritingAgent(
        aiSettings,
        aiApiKey,
        project,
        activeChapter,
        activeScene,
        workspace,
        memories,
        styleProfile,
        request,
        agentSelection,
        allowedChapterIds,
        aiDataPermissions.confirmedMemory,
        aiDataPermissions.creativePlanning,
        aiDataPermissions.styleProfile,
        images,
        historyMessages,
        controller.signal,
        (partialReply) => {
          if (agentController.current !== controller) return
          if (pendingMessage) pendingMessage = { ...pendingMessage, content: partialReply }
          setAgentMessage('正在生成回复')
          setAgentMessages((current) => current.map((message) => message.id === pendingMessageId ? { ...message, content: partialReply } : message))
        },
        externalSources,
      )
      if (agentController.current !== controller) return
      setAgentTaskPhase('validation')
      for (const candidate of turn.drafts) await saveDraftCandidate(candidate)
      if (turn.drafts.length) {
        setDraftCandidates((current) => [...turn.drafts, ...current.filter((item) => !turn.drafts.some((draft) => draft.id === item.id))])
        setPreviewDraftId(turn.drafts[0].id)
      }
      const navigationTools = await executeAgentNavigationTools(request)
      const batchNotice = batchResult
        ? `批量故事记忆分析已完成 ${batchResult.analyzedCount} 章，整理出 ${batchResult.candidateCount} 条资料${batchResult.emptyChapters.length ? `；其中 ${batchResult.emptyChapters.length} 章经二次提取仍无可靠候选` : ''}${batchResult.failures.length ? `；${batchResult.failures.length} 章失败` : ''}。\n\n`
        : ''
      const completedTurn: AgentTurn = { ...turn, reply: `${batchNotice}${turn.reply}`, tools: [...(turn.tools ?? []), ...programTools, ...navigationTools] }
      const completed: AiConversationMessage = { ...pendingMessage, content: completedTurn.reply, payloadJson: JSON.stringify(completedTurn), status: 'complete' }
      await saveAiConversationMessage(completed)
      const updatedConversation = { ...conversation, updatedAt: Date.now() }
      setAgentConversation(updatedConversation)
      setAgentConversations((current) => [updatedConversation, ...current.filter((item) => item.id !== updatedConversation.id)].sort((left, right) => right.updatedAt - left.updatedAt))
      setAgentMessages((current) => current.map((message) => message.id === completed.id ? completed : message))
      setAgentInput('')
      setAgentImages([])
      setAgentMessage(turn.drafts.length ? `已生成 ${turn.drafts.length} 个待确认候选` : turn.citations.length ? `引用了 ${turn.citations.length} 处原文` : '')
      setAgentTaskPhase('complete')
      finishAiTask(taskId, 'completed', turn.drafts.length ? `生成 ${turn.drafts.length} 个待确认候选` : turn.citations.length ? `完成回复并引用 ${turn.citations.length} 处原文` : '回复已完成')
    } catch (error) {
      if (agentController.current !== controller) return
      const errorMessage = error instanceof Error ? error.message : 'Agent 请求失败'
      if (pendingMessage) {
        const failed: AiConversationMessage = { ...pendingMessage, status: controller.signal.aborted ? 'cancelled' : 'failed', error: controller.signal.aborted ? '请求已由用户停止' : errorMessage }
        await saveAiConversationMessage(failed).catch(() => undefined)
        setAgentMessages((current) => current.map((message) => message.id === failed.id ? failed : message))
      }
      setAgentMessage(errorMessage)
      setAgentTaskPhase('failed')
      finishAiTask(taskId, controller.signal.aborted ? 'cancelled' : 'failed', controller.signal.aborted ? '已由作者停止' : errorMessage)
    } finally {
      if (agentController.current === controller) {
        agentController.current = null
        setAgentBusy(false)
      }
    }
  }

  const clearAgentConversation = async () => {
    if (!agentConversation) return
    if (!await showConfirm('清空这组 Agent 对话？正文、故事记忆和候选稿不会被删除。', { title: '清空 Agent 对话', confirmLabel: '清空' })) return
    await clearAiConversationMessages(agentConversation.id)
    setAgentMessages([])
    setAgentMessage('对话已清空')
  }

  const clearConversationHistory = async (kind: 'qa' | 'advisor') => {
    const conversation = kind === 'qa' ? qaConversation : advisorConversation
    if (!conversation) return
    const confirmed = await showConfirm('清空这组 AI 讨论记录？此操作不会修改正文、故事资料或大纲。', { title: '清空讨论记录', confirmLabel: '清空' })
    if (!confirmed) return
    await clearAiConversationMessages(conversation.id)
    if (kind === 'qa') {
      setQaMessages([])
      setProjectAnswer(null)
      setProjectQuestionMessage('问答记录已清空')
    } else {
      setAdvisorMessages([])
      setAdvisorMessage('讨论记录已清空')
    }
  }

  const clearCurrentProjectAiUsage = async () => {
    const confirmed = await showConfirm('清除当前作品的本机 AI 调用统计？这不会删除正文、会话、候选文本或工具记录。', { title: '清除调用记录', confirmLabel: '清除' })
    if (!confirmed) return
    await clearAiUsageLogs(project.id)
    setAiUsageSummary({ requests: 0, successful: 0, promptTokens: 0, completionTokens: 0 })
  }

  const updateCreativeBriefField = (field: keyof Omit<typeof creativeWorkspace.brief, 'projectId' | 'updatedAt'>, value: string) => {
    setCreativeWorkspace((current) => ({
      ...current,
      brief: { ...current.brief, [field]: value, updatedAt: Date.now() },
    }))
  }

  const commitCreativeBrief = async () => {
    try {
      await saveCreativeBrief(creativeWorkspace.brief)
      setAdvisorMessage('创作简报已保存')
    } catch (error) {
      setAdvisorMessage(error instanceof Error ? error.message : '保存创作简报失败')
    }
  }

  const runCreativeBriefDevelopment = async () => {
    if (advisorBusy === 'brief') {
      advisorController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setAdvisorMessage('请先完成 AI 服务配置')
      return
    }
    const controller = new AbortController()
    advisorController.current = controller
    setAdvisorBusy('brief')
    setAdvisorMessage('正在整理创作简报')
    try {
      const currentBrief = aiDataPermissions.creativePlanning ? creativeWorkspace.brief : emptyCreativeBrief(project.id)
      const result = await developCreativeBrief(aiSettings, aiApiKey, project.title, currentBrief, creativeInput, controller.signal)
      if (advisorController.current !== controller) return
      await saveCreativeBrief(result.brief)
      setCreativeWorkspace((current) => ({ ...current, brief: result.brief }))
      setCreativeQuestions(result.questions)
      setCreativeInput('')
      setAdvisorMessage(result.questions.length > 0 ? '简报已更新，请补充关键问题' : '创作简报已更新')
    } catch (error) {
      if (advisorController.current !== controller) return
      setAdvisorMessage(error instanceof Error ? error.message : '整理创作简报失败')
    } finally {
      if (advisorController.current === controller) {
        advisorController.current = null
        setAdvisorBusy(null)
      }
    }
  }

  const runOutlineGeneration = async () => {
    if (advisorBusy === 'outline') {
      advisorController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setAdvisorMessage('请先完成 AI 服务配置')
      return
    }
    if (!aiDataPermissions.creativePlanning) {
      setAdvisorMessage('当前作品禁止发送创作规划，无法基于现有简报和大纲推演')
      return
    }
    const controller = new AbortController()
    advisorController.current = controller
    setAdvisorBusy('outline')
    setAdvisorMessage(`正在推演${OUTLINE_LEVEL_LABELS[outlineLevel]}层`)
    try {
      const nodes = await generateOutlineLayer(aiSettings, aiApiKey, project.title, creativeWorkspace.brief, creativeWorkspace.outline, outlineLevel, outlineInstruction, controller.signal)
      if (advisorController.current !== controller) return
      for (const node of nodes) await saveOutlineNode(node)
      setCreativeWorkspace((current) => ({ ...current, outline: [...current.outline, ...nodes] }))
      setAdvisorMessage(nodes.length > 0 ? `已生成 ${nodes.length} 个可编辑大纲节点` : '没有生成有效的大纲节点')
    } catch (error) {
      if (advisorController.current !== controller) return
      setAdvisorMessage(error instanceof Error ? error.message : '生成分层大纲失败')
    } finally {
      if (advisorController.current === controller) {
        advisorController.current = null
        setAdvisorBusy(null)
      }
    }
  }

  const editOutlineNode = (nodeId: string, update: Partial<Pick<OutlineNode, 'title' | 'summary'>>) => {
    setCreativeWorkspace((current) => ({
      ...current,
      outline: current.outline.map((node) => node.id === nodeId ? { ...node, ...update, updatedAt: Date.now() } : node),
    }))
  }

  const commitOutlineNode = async (node: OutlineNode, update: Partial<OutlineNode> = {}) => {
    const updated = { ...node, ...update, updatedAt: Date.now() }
    setCreativeWorkspace((current) => ({
      ...current,
      outline: current.outline.map((item) => item.id === updated.id ? updated : item),
    }))
    try {
      await saveOutlineNode(updated)
      setAdvisorMessage(updated.locked ? '大纲节点已锁定' : '大纲节点已保存')
    } catch (error) {
      setAdvisorMessage(error instanceof Error ? error.message : '保存大纲节点失败')
    }
  }

  const removeOutlineNode = async (node: OutlineNode) => {
    if (node.locked) {
      setAdvisorMessage('请先解锁再删除大纲节点')
      return
    }
    const confirmed = await showConfirm(`删除大纲节点“${node.title}”？`, { title: '删除大纲节点', confirmLabel: '删除' })
    if (!confirmed) return
    await deleteOutlineNode(project.id, node.id)
    setCreativeWorkspace((current) => ({ ...current, outline: current.outline.filter((item) => item.id !== node.id && item.parentId !== node.id) }))
    setAdvisorMessage('大纲节点已删除')
  }

  const runWritingDiagnosis = async (noteOverride?: string) => {
    if (advisorBusy === 'diagnose') {
      advisorController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setAdvisorMessage('请先完成 AI 服务配置')
      return
    }
    if (!aiDataPermissions.currentChapter) {
      setAdvisorMessage('当前作品禁止向 AI 发送当前章节，无法分析写作局面')
      return
    }
    const controller = new AbortController()
    const note = noteOverride?.trim() || advisorNote.trim()
    advisorController.current = controller
    setAdvisorBusy('diagnose')
    setAdvisorMessage('正在分析当前局面与创作障碍')
    let pendingMessage: AiConversationMessage | null = null
    try {
      const bundle = await getOrCreateAiConversation(project.id, 'creative_advisor', '创作顾问', activeChapter.id, activeScene?.id ?? null)
      const requestId = crypto.randomUUID()
      const now = Date.now()
      const userMessage: AiConversationMessage = {
        id: crypto.randomUUID(), conversationId: bundle.conversation.id, requestId, role: 'user',
        content: note || '分析当前最可能的创作障碍', payloadJson: '', status: 'complete', error: '', createdAt: now,
      }
      pendingMessage = {
        id: crypto.randomUUID(), conversationId: bundle.conversation.id, requestId, role: 'assistant', content: '',
        payloadJson: '', status: 'pending', error: '', createdAt: now + 1,
      }
      await saveAiConversationMessage(userMessage)
      await saveAiConversationMessage(pendingMessage)
      setAdvisorConversation(bundle.conversation)
      setAdvisorMessages((current) => [...current.filter((message) => message.requestId !== requestId), userMessage, pendingMessage!])
      const memories = permittedMemories(await getProjectMemory(project.id))
      const session = await diagnoseWritingSituation(
        aiSettings,
        aiApiKey,
        project,
        activeChapter,
        activeScene,
        aiDataPermissions.creativePlanning ? creativeWorkspace.brief : emptyCreativeBrief(project.id),
        aiDataPermissions.creativePlanning ? creativeWorkspace.outline : [],
        memories,
        note,
        aiDataPermissions.creativePlanning ? creativeWorkspace.sessions : [],
        controller.signal,
      )
      if (advisorController.current !== controller) return
      await saveAdvisorSession(session)
      const completed: AiConversationMessage = {
        ...pendingMessage,
        content: `已分析当前局面，并给出 ${session.directions.length} 个推进方向`,
        payloadJson: JSON.stringify(session),
        status: 'complete',
      }
      await saveAiConversationMessage(completed)
      setAdvisorMessages((current) => current.map((message) => message.id === completed.id ? completed : message))
      setAdvisorResult(session)
      setCreativeWorkspace((current) => ({ ...current, sessions: [session, ...current.sessions.filter((item) => item.id !== session.id)].slice(0, 20) }))
      setAdvisorMessage(`已给出 ${session.directions.length} 个推进方向`)
    } catch (error) {
      if (advisorController.current !== controller) return
      const errorMessage = error instanceof Error ? error.message : '梳理思路失败'
      if (pendingMessage) {
        const failed: AiConversationMessage = {
          ...pendingMessage,
          status: controller.signal.aborted ? 'cancelled' : 'failed',
          error: controller.signal.aborted ? '请求已由用户停止' : errorMessage,
        }
        await saveAiConversationMessage(failed).catch(() => undefined)
        setAdvisorMessages((current) => current.map((message) => message.id === failed.id ? failed : message))
      }
      setAdvisorMessage(errorMessage)
    } finally {
      if (advisorController.current === controller) {
        advisorController.current = null
        setAdvisorBusy(null)
      }
    }
  }

  const writeDirectionToOutline = async (direction: AdvisorDirection) => {
    const node: OutlineNode = {
      id: crypto.randomUUID(),
      projectId: project.id,
      parentId: null,
      level: 'scene',
      title: direction.title,
      summary: `${direction.approach}${direction.nextBeat ? `\n下一拍：${direction.nextBeat}` : ''}`,
      locked: false,
      sortOrder: creativeWorkspace.outline.reduce((maximum, item) => Math.max(maximum, item.sortOrder), -1) + 1,
      source: 'ai',
      updatedAt: Date.now(),
    }
    await saveOutlineNode(node)
    setCreativeWorkspace((current) => ({ ...current, outline: [...current.outline, node] }))
    setAdvisorMessage('方向已作为可编辑场景节点写入大纲')
  }

  const openDraftAssistant = async () => {
    const selection = editor?.state.selection
    const selectedText = editor && selection ? editor.state.doc.textBetween(selection.from, selection.to, '\n', '\n') : ''
    setDraftTarget({ from: selection?.from ?? 1, to: selection?.to ?? 1, text: selectedText })
    setDraftMode(selectedText.trim() ? 'rewrite' : 'continue')
    setDraftMessage('')
    setAssistantView('draft')
    try {
      setDraftCandidates(await listDraftCandidates(project.id, activeChapter.id))
    } catch (error) {
      setDraftMessage(error instanceof Error ? error.message : '无法读取候选文本')
    }
  }

  const runDraftGeneration = async () => {
    if (draftBusy) {
      draftController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setDraftMessage('请先完成 AI 服务配置')
      return
    }
    if (draftMode === 'rewrite' && !draftTarget.text.trim()) {
      setDraftMessage('请先在正文中选择要改写的文字，再重新打开候选文本')
      return
    }
    if (!aiDataPermissions.currentChapter) {
      setDraftMessage('当前作品禁止向 AI 发送当前章节，无法生成候选文本')
      return
    }
    const controller = new AbortController()
    draftController.current = controller
    const taskId = beginAiTask('draft', '生成正文候选', `${activeChapter.title} · ${DRAFT_MODE_LABELS[draftMode]}`)
    setDraftBusy(true)
    setDraftMessage('正在组装约束并生成候选方案')
    try {
      const [workspace, memories, styleProfile] = await Promise.all([loadCreativeWorkspace(project.id), getProjectMemory(project.id), loadStyleProfile(project.id)])
      const task: DraftTask = {
        mode: draftMode,
        targetLength: draftTargetLength,
        mustInclude: draftMustInclude,
        mustAvoid: draftMustAvoid,
        noNewFacts: draftNoNewFacts,
        styleInstruction: draftStyleInstruction,
        selectedText: draftTarget.text,
      }
      const candidates = await generateDraftCandidates(
        aiSettings,
        aiApiKey,
        project,
        activeChapter,
        activeScene,
        aiDataPermissions.creativePlanning ? workspace.brief : emptyCreativeBrief(project.id),
        aiDataPermissions.creativePlanning ? workspace.outline : [],
        permittedMemories(memories),
        aiDataPermissions.styleProfile ? styleProfile : emptyStyleProfile(project.id),
        task,
        draftTarget.from,
        draftTarget.to,
        controller.signal,
      )
      if (draftController.current !== controller) return
      for (const candidate of candidates) await saveDraftCandidate(candidate)
      setDraftCandidates((current) => [...candidates, ...current])
      setPreviewDraftId(candidates[0]?.id ?? null)
      setDraftMessage(candidates.length > 0 ? `已生成 ${candidates.length} 个候选方案，请先查看校验` : 'AI 没有返回有效候选文本')
      finishAiTask(taskId, candidates.length > 0 ? 'completed' : 'failed', candidates.length > 0 ? `已生成 ${candidates.length} 个待确认候选` : 'AI 没有返回有效候选文本')
    } catch (error) {
      if (draftController.current !== controller) return
      const detail = error instanceof Error ? error.message : '生成候选文本失败'
      setDraftMessage(detail)
      finishAiTask(taskId, controller.signal.aborted ? 'cancelled' : 'failed', detail)
    } finally {
      if (draftController.current === controller) {
        draftController.current = null
        setDraftBusy(false)
      }
    }
  }

  const showDraftPreview = async (candidate: DraftCandidate) => {
    if (candidate.status !== 'candidate') return
    if (candidate.chapterId !== activeChapter.id) await openChapter(candidate.chapterId)
    setDraftCandidates((current) => current.some((item) => item.id === candidate.id) ? current : [candidate, ...current])
    setPreviewDraftId(candidate.id)
    setAgentMessage(agentDraftTask(candidate).targetAction === 'new_chapter' ? '正在编辑器中预览新章节内容' : '绿色为新增内容，红色为确认后删除的原文')
  }

  const syncAgentDraftTurn = async (
    updates: DraftCandidate[],
    toolStatus: AgentToolExecution['status'],
    detail: string,
  ) => {
    if (updates.length === 0) return
    const updateById = new Map(updates.map((candidate) => [candidate.id, candidate]))
    const changed = agentMessages.flatMap((message): AiConversationMessage[] => {
      if (message.role !== 'assistant' || message.status !== 'complete') return []
      const turn = conversationPayload<AgentTurn>(message)
      if (!turn?.drafts?.some((candidate) => updateById.has(candidate.id))) return []
      const nextTurn: AgentTurn = {
        ...turn,
        drafts: turn.drafts.map((candidate) => updateById.get(candidate.id) ?? candidate),
        tools: turn.tools.map((tool) => tool.name === 'preview_editor_change' ? { ...tool, status: toolStatus, detail } : tool),
      }
      return [{ ...message, payloadJson: JSON.stringify(nextTurn) }]
    })
    if (changed.length === 0) return
    const changedById = new Map(changed.map((message) => [message.id, message]))
    setAgentMessages((current) => current.map((message) => changedById.get(message.id) ?? message))
    await Promise.all(changed.map(saveAiConversationMessage))
  }

  const rejectDraftCandidate = async (candidate: DraftCandidate) => {
    const updated = { ...candidate, status: 'rejected' as const, updatedAt: Date.now() }
    await saveDraftCandidate(updated)
    await syncAgentDraftTurn([updated], 'rejected', '作者已放弃候选，正文未修改')
    setDraftCandidates((current) => current.map((item) => item.id === updated.id ? updated : item))
    setPreviewDraftId((current) => current === candidate.id ? null : current)
    setDraftMessage('候选方案已拒绝，正文没有变化')
    setAgentMessage('候选稿已放弃，正文没有变化')
  }

  const acceptDraftCandidate = async (candidate: DraftCandidate, reapply = false) => {
    const reportDraftAction = (message: string) => {
      setDraftMessage(message)
      setAgentMessage(message)
    }
    const task = agentDraftTask(candidate)
    if (task.targetAction === 'new_chapter') {
      const existingTarget = task.acceptedTargetChapterId ? project.chapters.find((chapter) => chapter.id === task.acceptedTargetChapterId) : undefined
      const sourceChapter = project.chapters.find((chapter) => chapter.id === candidate.chapterId) ?? activeChapter
      const baseTitle = task.targetChapterTitle?.trim() || nextDefaultName(project.chapters.map((chapter) => chapter.title), '章')
      const occupiedTitles = new Set(project.chapters.filter((chapter) => chapter.id !== existingTarget?.id).map((chapter) => chapter.title))
      let targetTitle = baseTitle
      for (let suffix = 2; occupiedTitles.has(targetTitle); suffix += 1) targetTitle = `${baseTitle}（${suffix}）`
      const confirmed = await showConfirm(
        existingTarget
          ? `将使用“${candidate.title}”完整恢复章节“${existingTarget.title}”？恢复前会自动保存版本。`
          : `将在“${sourceChapter.title}”之后新建章节“${targetTitle}”，并写入“${candidate.title}”？`,
        { title: existingTarget ? '重新写入候选文本' : '新建章节并写入', confirmLabel: existingTarget ? '恢复章节内容' : '新建并写入' },
      )
      if (!confirmed) return
      setAcceptingDraftId(candidate.id)
      reportDraftAction(existingTarget ? '正在保存版本并恢复章节内容…' : '正在新建章节并写入候选稿…')
      try {
        const html = candidate.text.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('')
        const document = createChapterDocument(html)
        const updatedAt = Date.now()
        const targetId = existingTarget?.id ?? crypto.randomUUID()
        let checkpoint: Revision | null = null
        if (existingTarget) {
          checkpoint = await createRevision(existingTarget, '重新写入 AI 候选前自动保存') ?? (await listRevisions(existingTarget.id))[0] ?? null
          setProject((current) => {
            const scene = current.scenes.find((item) => item.chapterId === targetId) ?? createScene(targetId)
            return {
              ...current,
              chapters: current.chapters.map((chapter) => chapter.id === targetId ? { ...chapter, ...document, updatedAt } : chapter),
              scenes: current.scenes.some((item) => item.chapterId === targetId) ? current.scenes : [...current.scenes, scene],
              activeChapterId: targetId,
              activeSceneId: scene.id,
            }
          })
        } else {
          const scene = createScene(targetId)
          const chapter: Chapter = { id: targetId, volumeId: sourceChapter.volumeId, title: targetTitle, ...document, updatedAt }
          setProject((current) => {
            const sourceIndex = current.chapters.findIndex((item) => item.id === sourceChapter.id)
            const chapters = [...current.chapters]
            chapters.splice(sourceIndex >= 0 ? sourceIndex + 1 : chapters.length, 0, chapter)
            return { ...current, chapters, scenes: [...current.scenes, scene], activeChapterId: targetId, activeSceneId: scene.id }
          })
        }
        const transaction = createAgentDraftTransaction({
          action: existingTarget ? 'replace_chapter' : 'create_chapter',
          chapterId: targetId,
          sourceChapterId: sourceChapter.id,
          beforeRevisionId: checkpoint?.id,
          afterContentHash: document.contentHash,
          afterTitle: existingTarget?.title ?? targetTitle,
          appliedAt: updatedAt,
        })
        const updatedTask = { ...task, targetChapterTitle: existingTarget?.title ?? targetTitle, acceptedTargetChapterId: targetId, transaction }
        const updated = { ...candidate, status: 'accepted' as const, taskJson: JSON.stringify(updatedTask), updatedAt }
        const siblings = draftCandidates.filter((item) => item.id !== candidate.id && item.createdAt === candidate.createdAt && item.status === 'candidate')
        const rejectedSiblings = siblings.map((item) => ({ ...item, status: 'rejected' as const, updatedAt }))
        setDraftCandidates((current) => current.map((item) => item.id === candidate.id ? updated : rejectedSiblings.find((sibling) => sibling.id === item.id) ?? item))
        await saveDraftCandidate(updated)
        for (const sibling of rejectedSiblings) await saveDraftCandidate(sibling)
        await syncAgentDraftTurn([updated, ...rejectedSiblings], 'complete', existingTarget ? `已验证写入章节“${existingTarget.title}”，可撤销` : `已验证创建章节“${targetTitle}”，可撤销`)
        reportDraftAction(existingTarget ? `已恢复章节“${existingTarget.title}”的完整候选内容` : `已新建章节“${targetTitle}”并写入候选稿`)
      } catch (error) {
        const message = error instanceof Error ? error.message : '新章节写入失败'
        reportDraftAction(message)
        await showAlert(message, '候选稿写入失败')
      } finally {
        setPreviewDraftId((current) => current === candidate.id ? null : current)
        setAcceptingDraftId(null)
      }
      return
    }
    if (!editor) {
      const message = '正文编辑器尚未准备好，请稍后再试'
      reportDraftAction(message)
      await showAlert(message, '无法写入候选稿')
      return
    }
    if (candidate.chapterId !== activeChapter.id) {
      const sourceChapter = project.chapters.find((chapter) => chapter.id === candidate.chapterId)
      const message = `这份候选稿属于“${sourceChapter?.title ?? '其他章节'}”，请先切换回该章节再写入。`
      reportDraftAction(message)
      await showAlert(message, '候选稿章节不一致')
      return
    }
    const maximum = editor.state.doc.content.size
    if (candidate.anchorFrom < 0 || candidate.anchorTo > maximum) {
      const message = '候选稿对应的正文位置已经变化，请在当前光标或选区重新生成。'
      reportDraftAction(message)
      await showAlert(message, '候选稿位置已失效')
      return
    }
    if (!reapply && candidate.mode === 'rewrite') {
      const currentSource = editor.state.doc.textBetween(candidate.anchorFrom, candidate.anchorTo, '\n', '\n')
      if (currentSource !== candidate.sourceText) {
        const message = '原选区已经变化。为避免覆盖新内容，请重新选择正文并生成改写候选。'
        reportDraftAction(message)
        await showAlert(message, '原选区已变化')
        return
      }
    }
    const confirmed = await showConfirm(
      reapply ? `将在当前光标或选区重新写入“${candidate.title}”的完整内容。已有残留内容不会自动识别，请确认写入位置。` : `将“${candidate.title}”写入当前正文？接受前会自动保存版本。`,
      { title: reapply ? '重新写入候选文本' : '接受候选文本', confirmLabel: reapply ? '重新写入' : '写入正文' },
    )
    if (!confirmed) return
    setAcceptingDraftId(candidate.id)
    reportDraftAction('正在保存版本并写入正文…')
    let inserted = false
    try {
      const checkpoint = await createRevision(activeChapter, reapply ? '重新写入 AI 候选前自动保存' : '接受 AI 候选前自动保存') ?? (await listRevisions(activeChapter.id))[0] ?? null
      const html = candidate.text.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('')
      const writeRange = reapply ? { from: editor.state.selection.from, to: editor.state.selection.to } : { from: candidate.anchorFrom, to: candidate.anchorTo }
      inserted = editor.chain().focus().insertContentAt(writeRange, html).run()
      if (!inserted) throw new Error('编辑器拒绝了本次插入，请重新生成候选稿后再试')
      const updatedAt = Date.now()
      const transaction = createAgentDraftTransaction({
        action: 'insert',
        chapterId: activeChapter.id,
        beforeRevisionId: checkpoint?.id,
        afterContentHash: hashDocument(editor.getJSON() as DocumentNode),
        afterTitle: activeChapter.title,
        appliedAt: updatedAt,
      })
      const updated = { ...candidate, status: 'accepted' as const, taskJson: JSON.stringify({ ...task, transaction }), updatedAt }
      const siblings = reapply ? [] : draftCandidates.filter((item) => item.id !== candidate.id && item.createdAt === candidate.createdAt && item.status === 'candidate')
      const rejectedSiblings = siblings.map((item) => ({ ...item, status: 'rejected' as const, updatedAt }))
      setDraftCandidates((current) => current.map((item) => item.id === candidate.id ? updated : rejectedSiblings.find((sibling) => sibling.id === item.id) ?? item))
      await saveDraftCandidate(updated)
      for (const sibling of rejectedSiblings) await saveDraftCandidate(sibling)
      await syncAgentDraftTurn([updated, ...rejectedSiblings], 'complete', `已验证写入“${activeChapter.title}”，可撤销`)
      reportDraftAction(reapply ? '候选稿已重新写入当前光标或选区' : '候选稿已写入正文；可通过撤销、版本历史或“重新写入”恢复')
    } catch (error) {
      const detail = error instanceof Error ? error.message : '未知错误'
      const message = inserted
        ? `正文已经写入，但候选状态保存失败。请勿重复写入；可稍后重新打开作品确认。${detail ? `（${detail}）` : ''}`
        : detail || '候选稿写入失败，请稍后再试'
      reportDraftAction(message)
      await showAlert(message, inserted ? '候选状态保存失败' : '候选稿写入失败')
    } finally {
      setPreviewDraftId((current) => current === candidate.id ? null : current)
      setAcceptingDraftId(null)
    }
  }

  const undoAgentDraftAction = async (candidate: DraftCandidate) => {
    const task = agentDraftTask(candidate)
    const transaction = task.transaction
    const target = transaction ? project.chapters.find((chapter) => chapter.id === transaction.chapterId) : undefined
    const undoValidation = validateAgentDraftUndo(transaction, target)
    if (!undoValidation.allowed && ['missing_transaction', 'already_undone'].includes(undoValidation.reason)) {
      setAgentMessage('这份候选没有可撤销的 Agent 写入记录')
      return
    }
    if (!undoValidation.allowed && undoValidation.reason === 'missing_chapter') {
      setAgentMessage('写入目标已经不存在，无法自动撤销')
      return
    }
    if (!undoValidation.allowed && undoValidation.reason === 'later_edit') {
      await showAlert('Agent 写入后正文或章节标题又发生了变化。为避免覆盖作者的新修改，请使用版本历史手动恢复。', '无法安全撤销')
      return
    }
    if (!transaction || !target) return
    const actionLabel = transaction.action === 'create_chapter' ? `删除 Agent 创建的章节“${target.title}”` : `恢复“${target.title}”写入前的版本`
    if (!await showConfirm(`${actionLabel}？撤销只会执行一次。`, { title: '撤销 Agent 操作', confirmLabel: '撤销' })) return
    let checkpoint: Revision | null = null
    if (transaction.action !== 'create_chapter') {
      checkpoint = (await listRevisions(target.id)).find((revision) => revision.id === transaction.beforeRevisionId) ?? null
      if (!checkpoint) {
        await showAlert('写入前检查点已经不存在，请改用版本历史恢复。', '无法撤销')
        return
      }
      await createRevision(target, '撤销 Agent 操作前自动保存')
    }
    const undoneAt = Date.now()
    setProject((current) => {
      if (transaction.action === 'create_chapter') {
        const fallback = current.chapters.find((chapter) => chapter.id === transaction.sourceChapterId)
          ?? current.chapters.find((chapter) => chapter.id !== transaction.chapterId)
        const fallbackScene = fallback ? current.scenes.find((scene) => scene.chapterId === fallback.id) ?? createScene(fallback.id) : undefined
        const remainingScenes = current.scenes.filter((scene) => scene.chapterId !== transaction.chapterId)
        return {
          ...current,
          chapters: current.chapters.filter((chapter) => chapter.id !== transaction.chapterId),
          scenes: fallbackScene && !remainingScenes.some((scene) => scene.id === fallbackScene.id) ? [...remainingScenes, fallbackScene] : remainingScenes,
          activeChapterId: current.activeChapterId === transaction.chapterId && fallback ? fallback.id : current.activeChapterId,
          activeSceneId: current.activeChapterId === transaction.chapterId ? fallbackScene?.id ?? current.activeSceneId : current.activeSceneId,
        }
      }
      return {
        ...current,
        chapters: current.chapters.map((chapter) => chapter.id === transaction.chapterId && checkpoint ? {
          ...chapter,
          title: checkpoint.title,
          content: checkpoint.content,
          contentJson: checkpoint.contentJson,
          plainText: checkpoint.plainText,
          contentHash: checkpoint.contentHash,
          revisionNumber: chapter.revisionNumber + 1,
          updatedAt: undoneAt,
        } : chapter),
        activeChapterId: transaction.chapterId,
      }
    })
    const updated: DraftCandidate = {
      ...candidate,
      status: 'candidate',
      taskJson: JSON.stringify({ ...task, transaction: markAgentDraftTransactionUndone(transaction, undoneAt) }),
      updatedAt: undoneAt,
    }
    await saveDraftCandidate(updated)
    setDraftCandidates((current) => current.map((item) => item.id === updated.id ? updated : item))
    setPreviewDraftId(null)
    await syncAgentDraftTurn([updated], 'undone', `${actionLabel}已完成并核验`)
    setAgentMessage('已撤销本次 Agent 写入；候选稿仍保留，可重新预览')
  }

  const openReviewAssistant = async () => {
    setAssistantView('review')
    setReviewScope('chapter')
    setReviewStatusFilter('open')
    setReviewBusy('loading')
    setReviewMessage('')
    try {
      setReviewIssues(await listReviewIssues(project.id))
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : '无法读取审稿问题')
    } finally {
      setReviewBusy(null)
    }
  }

  const runScopedReview = async (scope: ReviewTextScope) => {
    if (reviewBusy === scope) {
      reviewController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setReviewMessage('请先完成 AI 服务配置')
      return
    }
    if (!aiDataPermissions.currentChapter && scope !== 'range') {
      setReviewMessage('当前作品禁止向 AI 发送当前章节，无法检查这个范围')
      return
    }
    let targetChapters: Array<{ chapter: Chapter; passages?: ReviewPassage[]; sceneId?: string; sceneTitle?: string; sceneGoal?: string; sceneNotes?: string }> = []
    let targetLabel = activeChapter.title
    if (scope === 'selection') {
      if (!editor || editor.state.selection.empty) {
        setReviewMessage('请先在正文中选择需要检查的文字')
        return
      }
      const passages = editorPassagesInRange(editor, editor.state.selection.from, editor.state.selection.to)
      if (passages.length === 0) {
        setReviewMessage('当前选区没有可检查的正文')
        return
      }
      targetLabel = `${activeChapter.title} · 当前选区`
      targetChapters = [{ chapter: activeChapter, passages }]
    } else if (scope === 'scene') {
      if (!editor || !activeScene?.startNodeId || !activeScene.endNodeId) {
        setReviewMessage('当前场景还没有正文范围，请在场景规划中用选区设定')
        return
      }
      const range = editorNodeRange(editor, activeScene.startNodeId, activeScene.endNodeId)
      if (!range) {
        setReviewMessage('场景锚点已随正文变化失效，请重新选择场景正文范围')
        return
      }
      const passages = editorPassagesInRange(editor, range.from, range.to)
      targetLabel = `${activeChapter.title} · ${activeScene.title}`
      targetChapters = [{ chapter: activeChapter, passages, sceneId: activeScene.id, sceneTitle: activeScene.title, sceneGoal: activeScene.goal, sceneNotes: activeScene.notes }]
    } else if (scope === 'range') {
      const startIndex = project.chapters.findIndex((chapter) => chapter.id === reviewRangeStartId)
      const endIndex = project.chapters.findIndex((chapter) => chapter.id === reviewRangeEndId)
      if (startIndex < 0 || endIndex < 0) {
        setReviewMessage('请选择有效的起止章节')
        return
      }
      const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex]
      const chapters = project.chapters.slice(from, to + 1)
      if (chapters.some((chapter) => chapter.id !== activeChapter.id) && !aiDataPermissions.otherChapters) {
        setReviewMessage('章节范围检查需要允许发送其他章节')
        return
      }
      targetLabel = `${chapters[0].title} 至 ${chapters[chapters.length - 1].title}`
      targetChapters = chapters.map((chapter) => ({ chapter }))
    } else {
      targetChapters = [{ chapter: activeChapter }]
    }
    const controller = new AbortController()
    reviewController.current = controller
    const taskId = beginAiTask('review', '检查正文', targetLabel)
    setReviewBusy(scope)
    setReviewMessage(`正在检查${targetLabel}`)
    try {
      const [workspace, memories] = await Promise.all([loadCreativeWorkspace(project.id), getProjectMemory(project.id)])
      const issues = await reviewScopedContinuity(
        aiSettings,
        aiApiKey,
        project,
        { scope, label: targetLabel, chapters: targetChapters },
        permittedMemories(memories),
        aiDataPermissions.creativePlanning ? workspace.brief : emptyCreativeBrief(project.id),
        aiDataPermissions.creativePlanning ? workspace.outline : [],
        controller.signal,
      )
      if (reviewController.current !== controller) return
      const source = `${scope}_review` as const
      await replaceReviewIssues(project.id, targetChapters.length === 1 ? targetChapters[0].chapter.id : null, source, issues)
      setReviewIssues(await listReviewIssues(project.id))
      setReviewScope(scope)
      setReviewStatusFilter('open')
      setReviewMessage(issues.length > 0 ? `${targetLabel}发现 ${issues.length} 个待判断问题` : `${targetLabel}没有发现具有明确证据的问题`)
      finishAiTask(taskId, 'completed', issues.length > 0 ? `发现 ${issues.length} 个待判断问题` : '未发现有明确证据的问题')
    } catch (error) {
      if (reviewController.current !== controller) return
      const detail = error instanceof Error ? error.message : '检查失败'
      setReviewMessage(detail)
      finishAiTask(taskId, controller.signal.aborted ? 'cancelled' : 'failed', detail)
    } finally {
      if (reviewController.current === controller) {
        reviewController.current = null
        setReviewBusy(null)
      }
    }
  }

  const runFullProjectReview = async () => {
    if (reviewBusy === 'project') {
      reviewController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setReviewMessage('请先完成 AI 服务配置')
      return
    }
    if (!aiDataPermissions.otherChapters || !aiDataPermissions.confirmedMemory) {
      setReviewMessage('全书审稿需要允许发送其他章节和已确认故事资料')
      return
    }
    const controller = new AbortController()
    reviewController.current = controller
    const taskId = beginAiTask('review', '检查全书连续性', `${project.chapters.length} 章`)
    setReviewBusy('project')
    setReviewMessage('正在比较全书已确认资料')
    try {
      const memories = await getProjectMemory(project.id)
      const issues = await reviewProjectContinuity(aiSettings, aiApiKey, project, permittedMemories(memories), controller.signal)
      if (reviewController.current !== controller) return
      await replaceReviewIssues(project.id, null, 'project_review', issues)
      setReviewIssues(await listReviewIssues(project.id))
      setReviewScope('project')
      setReviewStatusFilter('open')
      setReviewMessage(issues.length > 0 ? `全书检查发现 ${issues.length} 个待判断问题` : '没有发现具有足够证据的跨章节问题')
      finishAiTask(taskId, 'completed', issues.length > 0 ? `发现 ${issues.length} 个待判断问题` : '未发现有足够证据的跨章节问题')
    } catch (error) {
      if (reviewController.current !== controller) return
      const detail = error instanceof Error ? error.message : '全书检查失败'
      setReviewMessage(detail)
      finishAiTask(taskId, controller.signal.aborted ? 'cancelled' : 'failed', detail)
    } finally {
      if (reviewController.current === controller) {
        reviewController.current = null
        setReviewBusy(null)
      }
    }
  }

  const updateReviewIssueStatus = async (issue: ReviewIssue, status: ReviewStatus) => {
    const updated = { ...issue, status, updatedAt: Date.now() }
    await saveReviewIssue(updated)
    setReviewIssues((current) => current.map((item) => item.id === issue.id ? updated : item))
    setReviewMessage(status === 'confirmed' ? '问题已确认' : status === 'resolved' ? '问题已标记为已处理' : status === 'dismissed' ? '问题已忽略' : '问题已重新打开')
  }

  const reviewIssueIsStale = (issue: ReviewIssue) => {
    if (!issue.contentHash) return false
    if (issue.chapterId) return project.chapters.find((chapter) => chapter.id === issue.chapterId)?.contentHash !== issue.contentHash
    try {
      const hashes = JSON.parse(issue.contentHash) as Record<string, string>
      return Object.entries(hashes).some(([chapterId, contentHash]) => project.chapters.find((chapter) => chapter.id === chapterId)?.contentHash !== contentHash)
    } catch {
      return false
    }
  }

  const scrollCaretToWritingLine = (currentEditor: Editor) => {
    if (!preferencesRef.current.typewriterScroll || !currentEditor.isFocused) return
    window.requestAnimationFrame(() => {
      const paper = paperRef.current
      if (!paper || !currentEditor.isFocused) return
      try {
        const coordinates = currentEditor.view.coordsAtPos(currentEditor.state.selection.from)
        const paperBounds = paper.getBoundingClientRect()
        paper.scrollTop += coordinates.top - (paperBounds.top + paperBounds.height / 2)
      } catch {
        // The selection may disappear while switching chapters.
      }
    })
  }

  const applyFullscreen = async (nextFullscreen: boolean) => {
    try {
      if (isTauri()) {
        await getCurrentWindow().setFullscreen(nextFullscreen)
      } else if (nextFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else if (!nextFullscreen && document.fullscreenElement) {
        await document.exitFullscreen()
      }
      setFullscreen(nextFullscreen)
      setPreferences((current) => ({ ...current, fullscreen: nextFullscreen }))
    } catch {
      setFullscreen(isTauri() ? await getCurrentWindow().isFullscreen().catch(() => false) : Boolean(document.fullscreenElement))
    }
  }

  const setUtilityPanelOpen = (kind: UtilityPanelKind, open: boolean) => {
    if (kind === 'assistant') setAssistantOpen(open)
    if (kind === 'history') setHistoryOpen(open)
    if (kind === 'trash') setTrashOpen(open)
    if (kind === 'assets') setAssetsOpen(open)
    if (kind === 'attachments') setAttachmentsOpen(open)
    if (kind === 'references') setReferencesOpen(open)
    if (kind === 'naming') setNamingOpen(open)
  }

  const closeUtilityPanel = async (kind: UtilityPanelKind) => {
    if (kind === 'assistant' && namingOpen) kind = 'naming'
    setClosingUtilityPanel(kind)
    await waitForMotion(180)
    setUtilityPanelOpen(kind, false)
    setSuppressPanelEntry((current) => current === kind ? null : current)
    setClosingUtilityPanel((current) => current === kind ? null : current)
  }

  const toggleSidebar = async () => {
    if (!sidebarOpen) {
      setSidebarClosing(false)
      setSidebarOpen(true)
      return
    }
    setSidebarClosing(true)
    await waitForMotion(170)
    setSidebarOpen(false)
    setSidebarClosing(false)
  }

  const closeModal = async (kind: ClosingModalKind) => {
    setClosingModal(kind)
    await waitForMotion(170)
    if (kind === 'library') setLibraryOpen(false)
    if (kind === 'settings') {
      setSettingsOpen(false)
      setPreferences((current) => ({ ...current, motionEnabled: pendingMotionEnabled }))
    }
    if (kind === 'newProject') setNewProjectDialogOpen(false)
    setClosingModal((current) => current === kind ? null : current)
  }

  const animateRemoval = async (ids: string[]) => {
    setRemovingIds((current) => new Set([...current, ...ids]))
    if (motionDuration(170) === 0) return
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
    await waitForMotion(170)
  }

  const animateChapterRemoval = async (ids: string[]) => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('.chapter-block[data-chapter-id]'))
      .filter((element) => ids.includes(element.dataset.chapterId ?? ''))
    blocks.forEach((block) => {
      block.style.height = `${block.getBoundingClientRect().height}px`
      block.style.overflow = 'hidden'
    })
    setRemovingIds((current) => new Set([...current, ...ids]))
    if (motionDuration(170) === 0) return
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
    blocks.forEach((block) => { block.style.height = '0px' })
    await waitForMotion(170)
  }

  const finishRemoval = (ids: string[]) => {
    setRemovingIds((current) => {
      const next = new Set(current)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const showConfirm = (message: string, options?: { title?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean }) => new Promise<boolean>((resolve) => {
    dialogResolver.current?.(false)
    dialogResolver.current = resolve
    setAppDialogClosing(false)
    setAppDialog({
      mode: 'confirm',
      title: options?.title ?? '确认操作',
      message,
      confirmLabel: options?.confirmLabel ?? '确认',
      cancelLabel: options?.cancelLabel,
      danger: options?.danger ?? false,
    })
  })

  const showAlert = (message: string, title = '操作提示') => new Promise<void>((resolve) => {
    dialogResolver.current?.(false)
    dialogResolver.current = () => resolve()
    setAppDialogClosing(false)
    setAppDialog({ mode: 'alert', title, message, confirmLabel: '知道了', danger: false })
  })

  const resolveAppDialog = async (value: boolean) => {
    setAppDialogClosing(true)
    await waitForMotion(140)
    const resolver = dialogResolver.current
    dialogResolver.current = null
    setAppDialog(null)
    setAppDialogClosing(false)
    resolver?.(value)
  }

  const openInputContextMenu = (event: ReactMouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.preventDefault()
    event.stopPropagation()
    contextInput.current = event.currentTarget
    setContextMenu({ kind: 'input', x: event.clientX, y: event.clientY })
  }

  const lockMemoryFilterPosition = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const scroll = memoryChapterScrollRef.current
    const filters = event.currentTarget.closest<HTMLElement>('.memory-filters')
    if (!scroll || !filters) return
    memoryFilterLockRef.current = { top: filters.getBoundingClientRect().top }
  }

  const activeChapter =
    project.chapters.find((chapter) => chapter.id === project.activeChapterId) ??
    project.chapters[0] ??
    { id: '', volumeId: '', title: '', updatedAt: Date.now(), contentJson: { type: 'doc', content: [{ type: 'paragraph' }] }, content: '<p></p>', plainText: '', nodeIds: {}, wordCount: 0 }
  const activeScene = project.scenes.find((scene) => scene.id === project.activeSceneId && scene.chapterId === activeChapter.id)
    ?? project.scenes.find((scene) => scene.chapterId === activeChapter.id)
    ?? { id: '', chapterId: '', title: '', goal: '', notes: '', summary: '', startNodeId: '', endNodeId: '', updatedAt: Date.now() }
  const activeDraftPreview = previewDraftId ? draftCandidates.find((candidate) => candidate.id === previewDraftId) : undefined
  const activeDraftPreviewTask = activeDraftPreview ? agentDraftTask(activeDraftPreview) : {}
  const draftComparisonCandidates = draftCompareIds.map((id) => draftCandidates.find((candidate) => candidate.id === id)).filter((candidate): candidate is DraftCandidate => Boolean(candidate))
  const agentRequestEstimate = estimateAgentRequestScope(agentInput, Boolean(agentSelection.text))
  const agentTaskPhaseIndex = ({ retrieval: 0, external: 1, generation: 2, validation: 3, complete: 4, failed: 2, idle: -1 } as const)[agentTaskPhase]
  const activeDraftPreviewSourceChapter = activeDraftPreview ? project.chapters.find((chapter) => chapter.id === activeDraftPreview.chapterId) : undefined
  const activeDraftPreviewVolume = activeDraftPreviewSourceChapter ? project.volumes.find((volume) => volume.id === activeDraftPreviewSourceChapter.volumeId) : undefined
  const aiDataPermissions = aiPermissionState.projectId === project.id ? aiPermissionState.value : loadAiDataPermissions(project.id)
  const updateAiDataPermission = (field: keyof AiDataPermissions, value: boolean) => {
    setAiPermissionState((current) => ({
      projectId: project.id,
      value: { ...(current.projectId === project.id ? current.value : loadAiDataPermissions(project.id)), [field]: value },
    }))
  }
  const permittedMemories = (bundles: ChapterMemoryBundle[]) => aiDataPermissions.confirmedMemory
    ? bundles.filter((bundle) => bundle.memory?.chapterId === activeChapter.id ? aiDataPermissions.currentChapter : aiDataPermissions.otherChapters)
    : []
  activeChapterIdRef.current = activeChapter.id
  const pendingVolumeDelete = project.volumes.find((volume) => volume.id === pendingVolumeDeleteId)
  const filteredAttachments = useMemo(() => attachments.filter((attachment) => {
    if (attachmentFilter === 'all') return true
    if (attachmentFilter === 'project') return attachment.scopeType === 'project'
    if (attachmentFilter === 'volume') return attachment.scopeType === 'volume' && attachment.scopeId === activeChapter.volumeId
    return attachment.scopeType === 'chapter' && attachment.scopeId === activeChapter.id
  }), [activeChapter.id, activeChapter.volumeId, attachmentFilter, attachments])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UniqueID.configure({
        attributeName: 'nodeId',
        types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'bulletList', 'orderedList', 'listItem', 'horizontalRule', 'image'],
        generateID: () => crypto.randomUUID(),
      }),
      ActiveWritingNode,
      ReviewIssueMarkers,
      DraftPreviewMarkers,
      Placeholder.configure({ placeholder: '从这里开始写……' }),
      StoryImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'story-image' },
      }),
    ],
    content: activeChapter.contentJson,
    autofocus: 'end',
    onCreate: ({ editor: currentEditor }) => {
      setCursorPosition(getCursorPosition(currentEditor))
      setSelectedImage(getImageSettings(currentEditor))
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      setCursorPosition(getCursorPosition(currentEditor))
      setSelectedImage(getImageSettings(currentEditor))
      const { from, to } = currentEditor.state.selection
      queueEditorViewSave(activeChapterIdRef.current, { from, to })
      scrollCaretToWritingLine(currentEditor)
    },
    onUpdate: ({ editor: currentEditor }) => {
      setPreviewDraftId(null)
      setCursorPosition(getCursorPosition(currentEditor))
      setSelectedImage(getImageSettings(currentEditor))
      scrollCaretToWritingLine(currentEditor)
      const content = currentEditor.getHTML()
      const contentJson = currentEditor.getJSON() as DocumentNode
      const plainContent = currentEditor.getText({ blockSeparator: '\n' })
      const contentHash = hashDocument(contentJson)
      setSaveState('saving')
      setProject((current) => {
        const updatedAt = Date.now()
        const active = current.chapters.find((chapter) => chapter.id === current.activeChapterId)
        if (active) {
          const emergencyDraft = {
            projectId: current.id,
            chapterId: active.id,
            title: active.title,
            content,
            contentJson,
            plainText: plainContent,
            revisionNumber: active.contentHash === contentHash ? active.revisionNumber : active.revisionNumber + 1,
            contentHash,
            updatedAt,
          }
          void webPut('emergencyDrafts', `${current.id}:${active.id}`, emergencyDraft, { projectId: current.id, parentId: active.id, updatedAt })
            .catch(() => setSaveState('error'))
        }
        return {
          ...current,
          chapters: current.chapters.map((chapter) =>
            chapter.id === current.activeChapterId
              ? {
                  ...chapter,
                  content,
                  contentJson,
                  plainText: plainContent,
                  revisionNumber: chapter.contentHash === contentHash ? chapter.revisionNumber : chapter.revisionNumber + 1,
                  contentHash,
                  updatedAt,
                }
              : chapter,
          ),
        }
      })
    },
  })

  useEffect(() => {
    let active = true
    void loadProject()
      .then(async (storedProject) => {
        if (!active) return
        try {
          const emergencyDrafts = await webList<{
            projectId: string
            chapterId: string
            title: string
            content: string
            contentJson?: DocumentNode
            plainText?: string
            revisionNumber?: number
            contentHash?: string
            updatedAt: number
          }>('emergencyDrafts', { projectId: storedProject.id })
          const emergency = emergencyDrafts.sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null
          const chapter = storedProject.chapters.find((item) => item.id === emergency?.chapterId)
          if (emergency && emergency.projectId === storedProject.id && chapter && emergency.updatedAt > chapter.updatedAt) {
            storedProject.chapters = storedProject.chapters.map((item) => {
              if (item.id !== emergency.chapterId) return item
              const migrated = emergency.contentJson?.type === 'doc'
                ? {
                    contentJson: emergency.contentJson,
                    plainText: emergency.plainText ?? item.plainText,
                    revisionNumber: emergency.revisionNumber ?? item.revisionNumber,
                    contentHash: emergency.contentHash || hashDocument(emergency.contentJson),
                  }
                : createChapterDocument(emergency.content)
              return { ...item, ...migrated, title: emergency.title, content: emergency.content, updatedAt: emergency.updatedAt }
            })
            storedProject.activeChapterId = emergency.chapterId
            setRecoveryNotice(true)
          }
        } catch {
          // IndexedDB 恢复失败不阻止加载已经保存的正文。
        }
        setProject(storedProject)
      })
      .finally(() => {
        if (active) setHydrated(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    let active = true
    const cancel = scheduleIdleTask(() => {
      void listProjects().then((items) => {
        if (active) setProjects(items)
      })
      void listTrashedProjects().then(async (items) => {
        const expired = items.filter((item) => Date.now() - item.deletedAt >= PROJECT_TRASH_RETENTION_MS)
        const failed = new Set<string>()
        for (const item of expired) {
          try {
            for (const asset of await listImageAssets(item.id)) await deleteImageAsset(asset)
            for (const attachment of await listAttachments(item.id)) await deleteAttachment(attachment)
            for (const reference of await listReferenceTexts(item.id)) await deleteReferenceText(reference)
            await removeStoredProject(item.id)
          } catch {
            failed.add(item.id)
          }
        }
        if (active) setTrashedProjects(items.filter((item) => failed.has(item.id) || !expired.some((expiredItem) => expiredItem.id === item.id)))
      }).catch(() => undefined)
    })
    return () => {
      active = false
      cancel()
    }
  }, [hydrated])

  useEffect(() => {
    if (!editor) return
    if (hashDocument(editor.getJSON() as DocumentNode) !== activeChapter.contentHash) {
      editor.commands.setContent(activeChapter.contentJson, { emitUpdate: false })
    }
    if (restoredChapterId.current !== activeChapter.id) {
      restoredChapterId.current = activeChapter.id
      const stored = loadEditorViews()[activeChapter.id]
      const maximum = Math.max(1, editor.state.doc.content.size)
      const from = Math.max(1, Math.min(stored?.from ?? maximum, maximum))
      const to = Math.max(from, Math.min(stored?.to ?? from, maximum))
      editor.chain().setTextSelection({ from, to }).focus().run()
      window.requestAnimationFrame(() => {
        if (paperRef.current) paperRef.current.scrollTop = Math.max(0, stored?.scrollTop ?? 0)
      })
    }

    const canPreview = activeDraftPreview
      && activeDraftPreview.status === 'candidate'
      && activeDraftPreview.chapterId === activeChapter.id
      && activeDraftPreviewTask.targetAction !== 'new_chapter'
    const marker: DraftPreviewMarker | null = canPreview ? {
      id: activeDraftPreview.id,
      from: activeDraftPreview.anchorFrom,
      to: activeDraftPreview.mode === 'rewrite' ? activeDraftPreview.anchorTo : activeDraftPreview.anchorFrom,
      text: activeDraftPreview.text,
      mode: activeDraftPreview.mode,
    } : null
    editor.view.dispatch(editor.state.tr.setMeta(draftPreviewMarkerKey, marker))
  }, [activeChapter.id, activeChapter.content, activeChapter.contentHash, activeDraftPreview, activeDraftPreviewTask.targetAction, editor])

  useEffect(() => {
    if (!activeDraftPreview || activeDraftPreview.status !== 'candidate') return
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-draft-preview-id="${activeDraftPreview.id}"]`)?.scrollIntoView({
        block: 'center',
        behavior: preferences.motionEnabled ? 'smooth' : 'auto',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeChapter.id, activeDraftPreview, preferences.motionEnabled])

  useEffect(() => {
    const paper = paperRef.current
    if (!paper) return
    const refresh = () => updatePaperScrollState(paper)
    const frame = window.requestAnimationFrame(refresh)
    const observer = new ResizeObserver(refresh)
    observer.observe(paper)
    const editorElement = paper.querySelector('.tiptap')
    if (editorElement) observer.observe(editorElement)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [activeChapter.id, scenePanelOpen, focusMode])

  useEffect(() => {
    if (!hydrated) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void saveProject(project)
        .then(async () => {
          await webDeleteWhere<{ projectId: string }>('emergencyDrafts', (draft) => draft.projectId === project.id)
          setSaveState('saved')
          setLastSavedAt(Date.now())
          try {
            const staleChapterIds = await markStaleMemoryCandidates(project)
            if (staleChapterIds.includes(activeChapter.id) && assistantOpen && assistantView === 'memory' && memoryScope === 'chapter') {
              setMemoryBundle(await getChapterMemory(project.id, activeChapter.id))
              setMemoryFilter('stale')
              setMemoryMessage('正文已修改，旧资料已转入待复核，不会继续提供给 AI')
            } else if (staleChapterIds.length > 0 && assistantOpen && assistantView === 'memory' && memoryScope !== 'chapter') {
              setProjectMemoryBundles(await getProjectMemory(project.id))
            }
          } catch {
            // 正文已经保存；派生资料状态会在下一次保存时继续尝试更新。
          }
        })
        .catch(() => setSaveState('error'))
    }, 450)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [hydrated, project])

  useEffect(() => {
    localStorage.setItem('zili-writing-preferences-v1', JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    if (projectBackupTimer.current) window.clearTimeout(projectBackupTimer.current)
    if (!hydrated || !isTauri() || !preferences.projectSavePath.trim()) return
    projectBackupTimer.current = window.setTimeout(() => {
      if (projectBackupBusy.current) return
      projectBackupBusy.current = true
      void exportBackup(true).finally(() => {
        projectBackupBusy.current = false
      })
    }, 3000)
    return () => {
      if (projectBackupTimer.current) window.clearTimeout(projectBackupTimer.current)
      projectBackupTimer.current = null
    }
  }, [hydrated, preferences.projectSavePath, project])

  useEffect(() => {
    if (aiPermissionState.projectId !== project.id) {
      setAiPermissionState({ projectId: project.id, value: loadAiDataPermissions(project.id) })
    }
  }, [aiPermissionState.projectId, project.id])

  useEffect(() => {
    if (hydrated && aiPermissionState.projectId === project.id) {
      saveAiDataPermissions(project.id, aiPermissionState.value)
    }
  }, [aiPermissionState, hydrated, project.id])

  useEffect(() => {
    if (!secureCredentialStorageAvailable()) {
      saveAiSettings(aiSettings)
      return
    }
    if (!aiSecureSettingsReady.current) return
    if (aiSettingsSaveTimer.current) window.clearTimeout(aiSettingsSaveTimer.current)
    aiSettingsSaveTimer.current = window.setTimeout(() => {
      void saveAiSettingsCredential(aiSettings)
        .then(() => clearLegacyAiSettings())
        .catch((error) => {
          setAiCredentialStatus('error')
          setAiCredentialMessage(error instanceof Error ? `AI 配置自动保存失败：${error.message}` : 'AI 配置自动保存失败')
        })
      aiSettingsSaveTimer.current = null
    }, 300)
    return () => {
      if (aiSettingsSaveTimer.current) window.clearTimeout(aiSettingsSaveTimer.current)
      aiSettingsSaveTimer.current = null
    }
  }, [aiSettings])

  useEffect(() => {
    let cancelled = false
    const restoreSecureAiProfile = async () => {
      if (!secureCredentialStorageAvailable()) {
        await restoreAiCredential(aiSettings)
        return
      }
      let restoredSettings = aiSettings
      let migrateLegacyAgnes = hasLegacyAgnesAiSettings()
      try {
        const stored = await loadAiSettingsCredential()
        if (cancelled) return
        if (stored) {
          const rawSettings = JSON.parse(stored) as StoredAiSettings
          migrateLegacyAgnes = rawSettings.providerId === LEGACY_AGNES_PROVIDER_ID
          restoredSettings = normalizeAiSettings(rawSettings)
          setAiSettings(restoredSettings)
          if (migrateLegacyAgnes) await saveAiSettingsCredential(restoredSettings)
        } else {
          await saveAiSettingsCredential(restoredSettings)
        }
        clearLegacyAiSettings()
        aiSecureSettingsReady.current = true
      } catch (error) {
        if (cancelled) return
        setAiCredentialStatus('error')
        setAiCredentialMessage(error instanceof Error ? `无法读取加密 AI 配置：${error.message}` : '无法读取加密 AI 配置')
        return
      }
      await restoreAiCredential(restoredSettings, migrateLegacyAgnes)
    }
    void restoreSecureAiProfile()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const onModelFallback = (event: Event) => {
      const detail = (event as CustomEvent<{ baseUrl?: string; previousModel?: string; model?: string }>).detail
      if (!detail?.baseUrl || !detail.model || aiEndpointKey(detail.baseUrl) !== aiEndpointKey(aiSettings.baseUrl)) return
      const baseUrl = detail.baseUrl
      const model = detail.model
      setAiSettings((current) => {
        if (aiEndpointKey(current.baseUrl) !== aiEndpointKey(baseUrl)) return current
        return {
          ...current,
          model,
          successfulBaseUrls: rememberAiEndpoint(current.successfulBaseUrls, baseUrl),
          successfulModels: rememberAiEndpointModel(current.successfulModels, baseUrl, model),
        }
      })
      setAiModels((current) => current.includes(model) ? current : [...current, model])
      setAiModelStatus('success')
      setAiModelMessage(`模型 ${detail.previousModel || '原模型'} 无可用通道，已切换为 ${detail.model}`)
      setAiConnectionStatus('success')
      setAiConnectionMessage(`已自动切换到可用模型 ${detail.model}`)
    }
    window.addEventListener('zili-ai-model-fallback', onModelFallback)
    return () => window.removeEventListener('zili-ai-model-fallback', onModelFallback)
  }, [aiSettings.baseUrl])

  useEffect(() => {
    setAiStreamProgressByTask({})
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ taskType: string; projectId: string | null; receivedCharacters: number; active: boolean }>).detail
      if (!detail || (detail.projectId && detail.projectId !== project.id)) return
      setAiStreamProgressByTask((current) => {
        if (detail.active) return { ...current, [detail.taskType]: detail.receivedCharacters }
        if (!(detail.taskType in current)) return current
        const next = { ...current }
        delete next[detail.taskType]
        return next
      })
    }
    window.addEventListener('zili-ai-stream-progress', onProgress)
    return () => window.removeEventListener('zili-ai-stream-progress', onProgress)
  }, [project.id])

  useEffect(() => {
    if (!settingsOpen || settingsCategory !== 'ai') return
    const day = new Date()
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
    void Promise.all([getAiUsageSummary(project.id), getAiUsageSummary(undefined, dayStart)])
      .then(([projectUsage, dailyUsage]) => {
        setAiUsageSummary(projectUsage)
        setAiDailyUsage(dailyUsage)
      }).catch(() => undefined)
  }, [project.id, settingsCategory, settingsOpen])

  useEffect(() => () => {
    aiTestController.current?.abort()
    aiModelController.current?.abort()
    memoryAnalysisController.current?.abort()
    automaticMemoryController.current?.abort()
    projectQuestionController.current?.abort()
    agentController.current?.abort()
    advisorController.current?.abort()
    draftController.current?.abort()
    reviewController.current?.abort()
    styleController.current?.abort()
  }, [])

  useEffect(() => {
    if (!hydrated || !assistantOpen || assistantView !== 'memory') return
    let cancelled = false
    setMemoryLoading(true)
    setMemoryMessage('')
    void Promise.all([getChapterMemory(project.id, activeChapter.id), getProjectMemory(project.id)])
      .then(([bundle, projectBundles]) => {
        if (!cancelled) {
          setMemoryBundle(bundle)
          setProjectMemoryBundles(projectBundles)
        }
      })
      .catch((error) => {
        if (!cancelled) setMemoryMessage(error instanceof Error ? error.message : '无法读取故事记忆')
      })
      .finally(() => {
        if (!cancelled) setMemoryLoading(false)
      })
    return () => { cancelled = true }
  }, [activeChapter.id, assistantOpen, assistantView, hydrated, project.id])

  useEffect(() => {
    setMemorySummaryExpanded(false)
  }, [activeChapter.id])

  useEffect(() => {
    setExpandedMemoryCandidateId(null)
  }, [activeChapter.id, memoryFilter, memoryScope])

  useEffect(() => {
    if (!assistantOpen || assistantView !== 'memory' || memoryScope !== 'chapter' || memoryLoading) return
    if (!memoryBundle.candidates.some((candidate) => candidate.status === memoryFilter)) return
    const frame = window.requestAnimationFrame(() => {
      const scroll = memoryChapterScrollRef.current
      const list = memoryCandidateListRef.current
      if (!scroll || !list) return
      const filters = scroll.querySelector<HTMLElement>('.memory-filters')
      const targetTop = list.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop
        - (filters?.getBoundingClientRect().height ?? 0) - 6
      scroll.scrollTo({ top: Math.max(0, targetTop), behavior: preferencesRef.current.motionEnabled ? 'smooth' : 'auto' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [assistantOpen, assistantView, memoryBundle.candidates.length, memoryBundle.memory?.id, memoryLoading, memoryScope])

  useLayoutEffect(() => {
    const lock = memoryFilterLockRef.current
    if (!lock || !assistantOpen || assistantView !== 'memory' || memoryScope !== 'chapter') return
    const scroll = memoryChapterScrollRef.current
    const filters = scroll?.querySelector<HTMLElement>('.memory-filters')
    if (!scroll || !filters) {
      memoryFilterLockRef.current = null
      return
    }
    const delta = filters.getBoundingClientRect().top - lock.top
    if (Math.abs(delta) < 0.5) return
    memoryFilterRestoringRef.current = true
    scroll.scrollTop += delta
    window.requestAnimationFrame(() => {
      memoryFilterRestoringRef.current = false
    })
  }, [assistantOpen, assistantView, expandedMemoryCandidateId, memoryBundle.candidates.length, memoryFilter, memoryLoading, memoryScope])

  useEffect(() => {
    if (!assistantOpen || assistantView !== 'memory' || memoryScope !== 'chapter') return
    const scroll = memoryChapterScrollRef.current
    if (!scroll) return
    const releaseLock = () => {
      memoryFilterLockRef.current = null
    }
    const restoreLockedPosition = () => {
      const lock = memoryFilterLockRef.current
      if (!lock || memoryFilterRestoringRef.current) return
      const filters = scroll.querySelector<HTMLElement>('.memory-filters')
      if (!filters) return
      const delta = filters.getBoundingClientRect().top - lock.top
      if (Math.abs(delta) < 0.5) return
      memoryFilterRestoringRef.current = true
      scroll.scrollTop += delta
      window.requestAnimationFrame(() => {
        memoryFilterRestoringRef.current = false
      })
    }
    const releaseOnScrollbarPointer = (event: PointerEvent) => {
      const bounds = scroll.getBoundingClientRect()
      if (event.clientX >= bounds.right - 18) releaseLock()
    }
    const releaseOnKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) releaseLock()
    }
    scroll.addEventListener('scroll', restoreLockedPosition, { passive: true })
    scroll.addEventListener('wheel', releaseLock, { passive: true })
    scroll.addEventListener('touchmove', releaseLock, { passive: true })
    scroll.addEventListener('pointerdown', releaseOnScrollbarPointer)
    scroll.addEventListener('keydown', releaseOnKey)
    return () => {
      scroll.removeEventListener('scroll', restoreLockedPosition)
      scroll.removeEventListener('wheel', releaseLock)
      scroll.removeEventListener('touchmove', releaseLock)
      scroll.removeEventListener('pointerdown', releaseOnScrollbarPointer)
      scroll.removeEventListener('keydown', releaseOnKey)
      memoryFilterLockRef.current = null
    }
  }, [assistantOpen, assistantView, memoryScope])

  useEffect(() => {
    if (!hydrated || !assistantOpen || assistantView !== 'qa') return
    let cancelled = false
    void getOrCreateAiConversation(project.id, 'project_qa', '作品问答')
      .then((bundle) => {
        if (cancelled) return
        setQaConversation(bundle.conversation)
        setQaMessages(bundle.messages)
      })
      .catch((error) => {
        if (!cancelled) setProjectQuestionMessage(error instanceof Error ? error.message : '无法读取问答记录')
      })
    return () => { cancelled = true }
  }, [assistantOpen, assistantView, hydrated, project.id])

  useEffect(() => {
    if (!hydrated || !assistantOpen || assistantView !== 'assistant') return
    let cancelled = false
    void (async () => {
      const loadedBundles = await listAiConversations(project.id, 'agent')
      const bundles = await Promise.all(loadedBundles.map(async (item) => {
        const firstUser = item.messages.find((message) => message.role === 'user')
        if (!firstUser) return item
        const conciseTitle = agentConversationTitle(firstUser.content)
        if (item.conversation.title === conciseTitle || (!['字里助手', '新对话'].includes(item.conversation.title) && Array.from(item.conversation.title).length <= 16)) return item
        const conversation = { ...item.conversation, title: conciseTitle }
        await saveAiConversation(conversation)
        return { ...item, conversation }
      }))
      const selectedId = localStorage.getItem(`zili-writing-agent-conversation-v1:${project.id}`)
      let bundle = bundles.find((item) => item.conversation.id === selectedId) ?? bundles[0]
      if (!bundle) bundle = await createAiConversation(project.id, 'agent', '新对话', activeChapter.id, activeScene?.id ?? null)
      if (['字里助手', '新对话'].includes(bundle.conversation.title)) {
        const firstUser = bundle.messages.find((message) => message.role === 'user')
        if (firstUser) {
          bundle = { ...bundle, conversation: { ...bundle.conversation, title: agentConversationTitle(firstUser.content) } }
          await saveAiConversation(bundle.conversation)
        }
      }
      return { bundle, conversations: [bundle.conversation, ...bundles.map((item) => item.conversation).filter((item) => item.id !== bundle.conversation.id)].sort((left, right) => right.updatedAt - left.updatedAt) }
    })()
      .then(({ bundle, conversations }) => {
        if (cancelled) return
        setAgentConversations(conversations)
        setAgentConversation(bundle.conversation)
        setAgentMessages(bundle.messages)
        localStorage.setItem(`zili-writing-agent-conversation-v1:${project.id}`, bundle.conversation.id)
      })
      .catch((error) => {
        if (!cancelled) setAgentMessage(error instanceof Error ? error.message : '无法读取 Agent 对话')
      })
    return () => { cancelled = true }
  }, [assistantOpen, assistantView, hydrated, project.id])

  useEffect(() => {
    if (!hydrated || !assistantOpen || assistantView !== 'advisor') return
    let cancelled = false
    setAdvisorBusy('loading')
    setAdvisorMessage('')
    void Promise.all([
      loadCreativeWorkspace(project.id),
      getOrCreateAiConversation(project.id, 'creative_advisor', '创作顾问', activeChapter.id, activeScene?.id ?? null),
    ])
      .then(([workspace, conversationBundle]) => {
        if (cancelled) return
        setCreativeWorkspace(workspace)
        setAdvisorResult(workspace.sessions[0] ?? null)
        setAdvisorConversation(conversationBundle.conversation)
        setAdvisorMessages(conversationBundle.messages)
      })
      .catch((error) => {
        if (!cancelled) setAdvisorMessage(error instanceof Error ? error.message : '无法读取创作规划')
      })
      .finally(() => {
        if (!cancelled) setAdvisorBusy(null)
      })
    return () => { cancelled = true }
  }, [activeChapter.id, activeScene?.id, assistantOpen, assistantView, hydrated, project.id])

  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    void listReviewIssues(project.id).then((issues) => {
      if (!cancelled) setReviewIssues(issues)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [hydrated, project.id])

  useEffect(() => {
    if (!editor) return
    const markers = reviewIssues
      .filter((issue) => issue.severity !== 'info' && ['open', 'confirmed'].includes(issue.status) && !reviewIssueIsStale(issue) && issue.evidence.some((evidence) => evidence.chapterId === activeChapter.id))
      .flatMap((issue) => issue.evidence.filter((evidence) => evidence.chapterId === activeChapter.id).map((evidence) => ({ issueId: issue.id, nodeId: evidence.nodeId, severity: issue.severity })))
    editor.view.dispatch(editor.state.tr.setMeta(reviewIssueMarkerKey, markers))
  }, [activeChapter.id, activeChapter.contentHash, editor, reviewIssues])

  useEffect(() => {
    const openIssueFromMarker = (event: Event) => {
      const issueId = (event as CustomEvent<{ issueId?: string }>).detail?.issueId
      const issue = reviewIssues.find((item) => item.id === issueId)
      if (!issue) return
      const scope = issue.source === 'project_review' ? 'project'
        : issue.source === 'range_review' ? 'range'
          : issue.source === 'scene_review' ? 'scene'
            : issue.source === 'selection_review' ? 'selection'
              : 'chapter'
      setReviewScope(scope)
      setReviewStatusFilter(issue.status)
      setSelectedReviewIssueId(issue.id)
      setAssistantView('review')
      setSuppressPanelEntry(assistantOpen ? 'assistant' : null)
      setHistoryOpen(false)
      setTrashOpen(false)
      setAssetsOpen(false)
      setAttachmentsOpen(false)
      setReferencesOpen(false)
      setNamingOpen(false)
      setAssistantOpen(true)
      window.setTimeout(() => {
        const card = Array.from(document.querySelectorAll<HTMLElement>('[data-review-issue-card]'))
          .find((element) => element.dataset.reviewIssueCard === issue.id)
        card?.scrollIntoView({ block: 'nearest', behavior: motionDuration(1) > 0 ? 'smooth' : 'auto' })
      }, motionDuration(180) + 20)
    }
    window.addEventListener('zili-review-marker-open', openIssueFromMarker)
    return () => window.removeEventListener('zili-review-marker-open', openIssueFromMarker)
  }, [assistantOpen, reviewIssues])

  useEffect(() => {
    if (!hydrated || !preferences.automaticChecksEnabled) return
    const timer = window.setTimeout(() => {
      const issues = runAutomaticChecks(project.id, activeChapter)
      void replaceReviewIssues(project.id, activeChapter.id, 'automatic', issues).then(async () => {
        setReviewIssues(await listReviewIssues(project.id))
      }).catch(() => undefined)
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [activeChapter.contentHash, activeChapter.id, hydrated, preferences.automaticChecksEnabled, project.id])

  useEffect(() => {
    if (!hydrated || !preferences.automaticMemoryEnabled || !aiDataPermissions.currentChapter || !aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) return
    if (!activeChapter.plainText.trim()) return
    const chapter = activeChapter
    let controller: AbortController | null = null
    const timer = window.setTimeout(() => {
      void (async () => {
        if (memoryAnalysisController.current || automaticMemoryController.current) return
        const existing = await getChapterMemory(project.id, chapter.id)
        if (existing.memory?.contentHash === chapter.contentHash) return
        controller = new AbortController()
        automaticMemoryController.current = controller
        try {
          const result = await analyzeChapterMemory(aiSettings, aiApiKey, project.id, project.title, chapter, controller.signal)
          if (automaticMemoryController.current !== controller) return
          const now = Date.now()
          const reconciledCandidates = (await reconcileMemoryEntities(project, result.candidates.map((candidate) => ({
            ...candidate,
            projectId: project.id,
            metadata: {
              ...candidate.metadata,
              sceneId: sceneIdForEvidence(project, chapter, candidate.evidenceNodeId),
              sourceRevisionNumber: chapter.revisionNumber,
            },
          })))).map(applyAutomaticMemoryArchival)
          const nextBundle: ChapterMemoryBundle = {
            memory: {
              id: existing.memory?.id ?? crypto.randomUUID(),
              projectId: project.id,
              chapterId: chapter.id,
              summary: result.summary,
              revisionNumber: chapter.revisionNumber,
              contentHash: chapter.contentHash,
              analyzedAt: now,
            },
            candidates: [
              ...existing.candidates.filter((candidate) => candidate.metadata.archivalSource === 'author'),
              ...reconciledCandidates,
            ],
          }
          await saveChapterMemory(nextBundle)
          if (assistantOpen && assistantView === 'memory') setProjectMemoryBundles(await getProjectMemory(project.id))
          setProject((current) => ({
            ...current,
            scenes: current.scenes.map((scene) => {
              if (scene.chapterId !== chapter.id || scene.summary.trim()) return scene
              const details = reconciledCandidates.filter((candidate) => candidate.metadata.sceneId === scene.id).map((candidate) => candidate.detail)
              return details.length > 0 ? { ...scene, summary: [...new Set(details)].slice(0, 4).join('；').slice(0, 500), updatedAt: now } : scene
            }),
          }))
          if (assistantOpen && assistantView === 'memory' && memoryScope === 'chapter' && activeChapter.id === chapter.id) {
            setMemoryBundle(nextBundle)
            setMemoryFilter('candidate')
            const automaticallyArchived = reconciledCandidates.filter((candidate) => candidate.metadata.archivalSource === 'automatic').length
            const rejectedByEvidence = result.diagnostics.initialCandidateCount + result.diagnostics.retryCandidateCount
            setMemoryMessage(reconciledCandidates.length > 0
              ? `后台整理出 ${reconciledCandidates.length - automaticallyArchived} 条待确认资料${automaticallyArchived ? `，自动归档 ${automaticallyArchived} 条低风险资料` : ''}`
              : rejectedByEvidence > 0 ? '本章摘要已更新，但候选资料的原文证据无法核对，已阻止写入' : '本章摘要已更新，AI 二次提取仍未返回可靠资料')
          }
        } catch (error) {
          if (!controller?.signal.aborted && assistantOpen && assistantView === 'memory' && activeChapter.id === chapter.id) {
            setMemoryMessage(error instanceof Error ? `自动整理未完成：${error.message}` : '自动整理未完成')
          }
        } finally {
          if (automaticMemoryController.current === controller) automaticMemoryController.current = null
        }
      })()
    }, 30000)
    return () => {
      window.clearTimeout(timer)
      controller?.abort()
      if (automaticMemoryController.current === controller) automaticMemoryController.current = null
    }
  }, [activeChapter, aiApiKey, aiDataPermissions.currentChapter, aiSettings, hydrated, preferences.automaticMemoryEnabled, project.id, project.title])

  useEffect(() => {
    if (!citationTarget || citationTarget.chapterId !== activeChapter.id) return
    const timer = window.setTimeout(() => {
      const escapedNodeId = CSS.escape(citationTarget.nodeId)
      const editorRoot = editor?.view.dom as HTMLElement | undefined
      const nodeById = editorRoot?.querySelector<HTMLElement>(`[data-nodeid="${escapedNodeId}"], [data-node-id="${escapedNodeId}"]`)
      const element = nodeById?.textContent?.includes(citationTarget.quote) ? nodeById
        : Array.from(editorRoot?.querySelectorAll<HTMLElement>('[data-nodeid], [data-node-id]') ?? []).find((node) => node.textContent?.includes(citationTarget.quote))
      if (!element) {
        setProjectQuestionMessage('原文已修改，暂时无法定位这条引用')
        setCitationTarget(null)
        return
      }
      element.scrollIntoView({ block: 'center', behavior: motionDuration(1) > 0 ? 'smooth' : 'auto' })
      if (editor && !editor.isDestroyed) {
        const findSelectionStart = (requireNodeId: boolean) => {
          let found: number | null = null
          editor.state.doc.descendants((node, position) => {
            if (found !== null || !node.isBlock) return false
            if (requireNodeId && node.attrs.nodeId !== citationTarget.nodeId) return true
            const quoteOffset = node.textContent.indexOf(citationTarget.quote)
            if (quoteOffset < 0) return true
            found = position + 1 + quoteOffset
            return false
          })
          return found
        }
        const selectionStart = findSelectionStart(true) ?? findSelectionStart(false)
        if (selectionStart !== null) {
          const selectionEnd = Math.min(editor.state.doc.content.size, selectionStart + citationTarget.quote.length)
          editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, selectionStart, selectionEnd)).scrollIntoView())
          editor.view.focus()
        }
      }
      setProjectQuestionMessage('已定位到引用原文')
      setCitationTarget(null)
    }, 100)
    return () => window.clearTimeout(timer)
  }, [activeChapter.id, citationTarget, editor])

  useEffect(() => {
    localStorage.setItem('zili-writing-focus-mode-v1', String(focusMode))
  }, [focusMode])

  useEffect(() => {
    setMemoryDigestPages({})
  }, [project.id])

  useEffect(() => {
    setElapsedSeconds(0)
    if (!preferences.timerEnabled) return
    timerStartedAt.current = Date.now()
    const updateElapsedTime = () => setElapsedSeconds(Math.floor((Date.now() - timerStartedAt.current) / 1000))
    const timer = window.setInterval(updateElapsedTime, 1000)
    return () => window.clearInterval(timer)
  }, [preferences.timerEnabled])

  useEffect(() => {
    localStorage.setItem('zili-writing-collapsed-volumes-v1', JSON.stringify([...collapsedVolumes]))
  }, [collapsedVolumes])

  useEffect(() => () => {
    for (const timer of volumeCollapseTimers.current.values()) window.clearTimeout(timer)
    volumeCollapseTimers.current.clear()
  }, [])

  useEffect(() => () => {
    if (editorViewTimer.current) window.clearTimeout(editorViewTimer.current)
    const pending = pendingEditorView.current
    if (pending) saveEditorView(pending.chapterId, pending.update)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (appDialog) void resolveAppDialog(false)
        else if (newProjectDialogOpen) void closeModal('newProject')
        else if (settingsOpen) void closeModal('settings')
        else if (libraryOpen) void closeModal('library')
        else if (contextMenu) setContextMenu(null)
        else if (sidebarToolsOpen) setSidebarToolsOpen(false)
        else if (findOpen) setFindOpen(false)
        else if (assistantOpen) void closeUtilityPanel('assistant')
        else if (historyOpen) void closeUtilityPanel('history')
        else if (trashOpen) void closeUtilityPanel('trash')
        else if (assetsOpen) void closeUtilityPanel('assets')
        else if (attachmentsOpen) void closeUtilityPanel('attachments')
        else if (referencesOpen) void closeUtilityPanel('references')
        else if (namingOpen) void closeUtilityPanel('naming')
        else if (focusMode) setFocusMode(false)
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setFocusMode((value) => !value)
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        captureAgentSelection()
        closeUtilityPanels()
        setAssistantView('assistant')
        setAgentMessage('')
        setAssistantOpen(true)
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') {
        event.preventDefault()
        captureAgentSelection()
        closeUtilityPanels()
        setAssistantView('assistant')
        setAgentMessage('')
        setAssistantOpen(true)
      }
      if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setFindOpen(true)
        window.setTimeout(() => findInput.current?.focus(), 0)
      }
      if (event.key === 'F11') {
        event.preventDefault()
        void applyFullscreen(!fullscreen)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [appDialog, assetsOpen, assistantOpen, attachmentsOpen, contextMenu, findOpen, focusMode, fullscreen, historyOpen, libraryOpen, newProjectDialogOpen, referencesOpen, settingsOpen, sidebarToolsOpen, trashOpen])

  useEffect(() => {
    if (!contextMenu) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Element && (target.closest('.context-menu') || target.closest('.chapter-menu-trigger'))) return
      setContextMenu(null)
    }
    const closeOnWindowBlur = () => setContextMenu(null)
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    window.addEventListener('blur', closeOnWindowBlur)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      window.removeEventListener('blur', closeOnWindowBlur)
    }
  }, [contextMenu])

  useEffect(() => {
    if (!aiEndpointMenuOpen) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && aiEndpointComboboxRef.current?.contains(event.target)) return
      setAiEndpointMenuOpen(false)
    }
    const closeOnWindowBlur = () => setAiEndpointMenuOpen(false)
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    window.addEventListener('blur', closeOnWindowBlur)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      window.removeEventListener('blur', closeOnWindowBlur)
    }
  }, [aiEndpointMenuOpen])

  useEffect(() => {
    if (!settingsOpen || settingsCategory !== 'ai') setAiEndpointMenuOpen(false)
  }, [settingsCategory, settingsOpen])

  useEffect(() => {
    if (!isTauri()) {
      const updateBrowserFullscreen = () => {
        const nextFullscreen = Boolean(document.fullscreenElement)
        setFullscreen(nextFullscreen)
        setPreferences((current) => current.fullscreen === nextFullscreen ? current : { ...current, fullscreen: nextFullscreen })
      }
      document.addEventListener('fullscreenchange', updateBrowserFullscreen)
      return () => document.removeEventListener('fullscreenchange', updateBrowserFullscreen)
    }
    const appWindow = getCurrentWindow()
    void appWindow.setFullscreen(preferencesRef.current.fullscreen).then(() => appWindow.isFullscreen()).then(setFullscreen)
    void appWindow.isMaximized().then(setWindowMaximized)
    const unlisten = appWindow.onResized(() => {
      void appWindow.isMaximized().then(setWindowMaximized)
      void appWindow.isFullscreen().then((nextFullscreen) => {
        setFullscreen(nextFullscreen)
        setPreferences((current) => current.fullscreen === nextFullscreen ? current : { ...current, fullscreen: nextFullscreen })
      })
    })
    return () => { void unlisten.then((dispose) => dispose()) }
  }, [])

  const runWindowCommand = async (command: 'minimize' | 'maximize' | 'close') => {
    if (!('__TAURI_INTERNALS__' in window)) return
    const appWindow = getCurrentWindow()
    if (command === 'minimize') await appWindow.minimize()
    if (command === 'maximize') {
      await appWindow.toggleMaximize()
      setWindowMaximized(await appWindow.isMaximized())
    }
    if (command === 'close') await appWindow.close()
  }

  const updaterConfigured = isTauri() && import.meta.env.VITE_DESKTOP_UPDATES === 'true'
  const checkDesktopUpdate = async () => {
    if (!updaterConfigured || updateStatus === 'checking' || updateStatus === 'downloading') return
    try {
      setUpdateStatus('checking')
      setUpdateMessage('')
      const { check } = await import('@tauri-apps/plugin-updater')
      const update = await check({ timeout: 15000 })
      if (!update) {
        setUpdateStatus('current')
        setUpdateVersion('')
        setUpdateMessage('已完成检查，当前已是最新版本')
        return
      }
      setUpdateStatus('available')
      setUpdateVersion(update.version)
      setUpdateMessage(`发现新版本 ${update.version}`)
      const install = await showConfirm(`发现新版本 ${update.version}，现在下载并安装？`, { title: '发现新版本', confirmLabel: '下载并安装' })
      if (!install) {
        setUpdateStatus('idle')
        setUpdateMessage(`已发现新版本 ${update.version}，可稍后重试安装`)
        return
      }
      setUpdateStatus('downloading')
      setUpdateMessage(`正在下载并安装 ${update.version}`)
      await update.downloadAndInstall()
      setUpdateStatus('ready')
      setUpdateMessage('更新已安装，重启后生效')
      const restart = await showConfirm('更新已经安装，需要重启字里写作以完成更新。', { title: '更新已安装', confirmLabel: '立即重启' })
      if (restart) {
        const { relaunch } = await import('@tauri-apps/plugin-process')
        await relaunch()
      }
    } catch (error) {
      setUpdateStatus('error')
      const detail = error instanceof Error ? error.message : String(error)
      setUpdateMessage(detail)
      console.error('[Updater] 检查更新失败:', error)
      await showAlert(`检查更新失败：${detail}`, '检查更新失败')
    }
  }

  const wordCount = useMemo(
    () => chapterWordCount(activeChapter),
    [activeChapter],
  )

  const liveProjectMemoryBundles = useMemo(() => {
    const chapterIds = new Set(project.chapters.map((chapter) => chapter.id))
    return projectMemoryBundles.filter((bundle) => bundle.memory && chapterIds.has(bundle.memory.chapterId))
  }, [project.chapters, projectMemoryBundles])

  const visibleProjectMemoryCandidates = useMemo(() => {
    const chapterIndex = new Map(project.chapters.map((chapter, index) => [chapter.id, index]))
    return liveProjectMemoryBundles.flatMap((bundle) => bundle.candidates)
      .filter((candidate) => candidate.status === 'confirmed' || candidate.status === 'archived' || candidate.status === 'stale')
      .filter((candidate) => memoryScope !== 'timeline' || ['event', 'relationship', 'dialogue', 'commitment', 'secret', 'plot', 'claim', 'foreshadowing'].includes(candidate.kind))
      .filter((candidate) => `${candidate.title} ${candidate.detail} ${MEMORY_KIND_LABELS[candidate.kind]} ${candidate.metadata.knower} ${candidate.metadata.participants} ${candidate.metadata.location} ${candidate.metadata.storyTime} ${candidate.metadata.affectedScope}`.toLowerCase().includes(memorySearch.trim().toLowerCase()))
      .sort((left, right) => memoryScope === 'timeline'
        ? (chapterIndex.get(left.metadata.validFromChapterId) ?? chapterIndex.get(left.chapterId) ?? 0)
          - (chapterIndex.get(right.metadata.validFromChapterId) ?? chapterIndex.get(right.chapterId) ?? 0)
        : right.updatedAt - left.updatedAt)
  }, [liveProjectMemoryBundles, memoryScope, memorySearch, project.chapters])

  const characterMemoryProfiles = useMemo(() => buildCharacterMemoryProfiles(project, liveProjectMemoryBundles)
    .filter((profile) => `${profile.name} ${profile.aliases.join(' ')} ${profile.facts.map((fact) => `${fact.category} ${fact.value}`).join(' ')} ${profile.states.map((state) => `${state.aspect} ${state.value}`).join(' ')} ${profile.relationships.map((relationship) => `${relationship.title} ${relationship.counterparts.join(' ')} ${relationship.value}`).join(' ')} ${profile.timeline.map((state) => `${state.aspect} ${state.previousValue} ${state.value}`).join(' ')}`.toLowerCase().includes(memorySearch.trim().toLowerCase())), [liveProjectMemoryBundles, memorySearch, project])
  const selectedCharacterProfile = characterMemoryProfiles.find((profile) => profile.id === selectedCharacterProfileId) ?? characterMemoryProfiles[0] ?? null

  const storyMemoryThreads = useMemo(() => buildStoryThreads(project, liveProjectMemoryBundles)
    .filter((thread) => memoryThreadLifecycle === 'all' || thread.lifecycle === memoryThreadLifecycle)
    .filter((thread) => `${thread.candidate.title} ${thread.candidate.detail} ${thread.owner} ${thread.target}`.toLowerCase().includes(memorySearch.trim().toLowerCase())), [liveProjectMemoryBundles, memorySearch, memoryThreadLifecycle, project])

  const projectMemoryDigest = useMemo(() => buildProjectMemoryDigest(project, liveProjectMemoryBundles), [liveProjectMemoryBundles, project])

  const memoryConsistencyIssues = useMemo(() => reviewIssues.filter((issue) => issue.source === 'memory_consistency'), [reviewIssues])

  const mergeableEntityCandidates = useMemo(() => liveProjectMemoryBundles.flatMap((bundle) => bundle.candidates)
    .filter((candidate) => candidate.status === 'confirmed' && ['character', 'location', 'organization', 'item', 'world'].includes(candidate.kind)), [liveProjectMemoryBundles])

  const displayedMemorySummary = memoryBundle.memory
    ? isUsableChapterSummary(memoryBundle.memory.summary)
      ? memoryBundle.memory.summary
      : '上次分析返回了模型内部思考，没有作为故事摘要使用，请重新分析本章。'
    : ''
  const memorySummaryCollapsible = displayedMemorySummary.length > 120

  const visibleReviewIssues = useMemo(() => reviewIssues.filter((issue) => {
    if (reviewScope === 'project') return true
    if (reviewScope === 'range') return issue.source === 'range_review'
    if (reviewScope === 'scene') return issue.source === 'scene_review' && issue.evidence.some((evidence) => evidence.sceneId === activeScene?.id)
    if (reviewScope === 'selection') return issue.source === 'selection_review' && issue.evidence.some((evidence) => evidence.chapterId === activeChapter.id)
    return issue.evidence.some((evidence) => evidence.chapterId === activeChapter.id)
  }), [activeChapter.id, activeScene?.id, reviewIssues, reviewScope])

  const chapterNavigationSignature = useMemo(() => project.chapters
    .map((chapter) => `${chapter.id}\u0000${chapter.volumeId}\u0000${chapter.title}`)
    .join('\u0001'), [project.chapters])
  const navigationChapterItems = useMemo<ChapterNavigationItem[]>(() => project.chapters.map((chapter) => ({
    id: chapter.id,
    volumeId: chapter.volumeId,
    title: chapter.title,
    wordCount: chapterWordCount(chapter),
  })), [chapterNavigationSignature])
  const deferredNavigationChapters = useDeferredValue(navigationChapterItems)
  const filteredChapters = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return deferredNavigationChapters
    const matchingIds = new Set(project.chapters
      .filter((chapter) => `${chapter.title} ${chapter.plainText}`.toLowerCase().includes(keyword))
      .map((chapter) => chapter.id))
    return deferredNavigationChapters.filter((chapter) => matchingIds.has(chapter.id))
  }, [deferredNavigationChapters, project.chapters, search])
  const chapterIndexById = useMemo(() => new Map(deferredNavigationChapters.map((chapter, index) => [chapter.id, index])), [deferredNavigationChapters])
  const filteredChaptersByVolume = useMemo(() => {
    const grouped = new Map<string, ChapterNavigationItem[]>()
    for (const chapter of filteredChapters) {
      const chapters = grouped.get(chapter.volumeId) ?? []
      chapters.push(chapter)
      grouped.set(chapter.volumeId, chapters)
    }
    return grouped
  }, [filteredChapters])
  const chapterCountByVolume = useMemo(() => {
    const counts = new Map<string, number>()
    for (const chapter of deferredNavigationChapters) counts.set(chapter.volumeId, (counts.get(chapter.volumeId) ?? 0) + 1)
    return counts
  }, [deferredNavigationChapters])
  const hasProject = Boolean(project.id)

  const addChapter = (volumeId = activeChapter.volumeId) => {
    if (!hasProject || !project.volumes.some((volume) => volume.id === volumeId)) return
    setProject((current) => {
      if (!current.id || !current.volumes.some((volume) => volume.id === volumeId)) return current
      const id = crypto.randomUUID()
      const scene = createScene(id)
      const titles = current.chapters
        .filter((chapter) => chapter.volumeId === volumeId)
        .map((chapter) => chapter.title)
      const chapter: Chapter = {
        id,
        volumeId,
        title: nextDefaultName(titles, '章'),
        ...createChapterDocument(''),
        updatedAt: Date.now(),
      }
      return {
        ...current,
        chapters: [...current.chapters, chapter],
        scenes: [...current.scenes, scene],
        activeChapterId: id,
        activeSceneId: scene.id,
      }
    })
  }

  const addVolume = () => {
    if (!hasProject) return
    const volumeId = crypto.randomUUID()
    const chapterId = crypto.randomUUID()
    setProject((current) => {
      if (!current.id) return current
      const scene = createScene(chapterId)
      return {
        ...current,
        volumes: [...current.volumes, {
          id: volumeId,
          title: nextDefaultName(current.volumes.map((volume) => volume.title), '卷'),
        }],
        chapters: [...current.chapters, {
          id: chapterId,
          volumeId,
          title: '第一章',
          ...createChapterDocument(''),
          updatedAt: Date.now(),
        }],
        scenes: [...current.scenes, scene],
        activeChapterId: chapterId,
        activeSceneId: scene.id,
      }
    })
  }

  const addScene = (chapterId = activeChapter.id) => {
    setProject((current) => {
      const scene = createScene(chapterId, current.scenes.filter((item) => item.chapterId === chapterId).map((item) => item.title))
      return { ...current, scenes: [...current.scenes, scene], activeSceneId: scene.id }
    })
    setExpandedSceneChapters((current) => new Set(current).add(chapterId))
    openScenePanel()
    setContextMenu(null)
  }

  const openScene = (sceneId: string) => {
    const scene = project.scenes.find((item) => item.id === sceneId)
    if (!scene) return
    if (scene.id === project.activeSceneId && scenePanelOpen) {
      void closeScenePanel()
      setContextMenu(null)
      return
    }
    setProject((current) => ({ ...current, activeChapterId: scene.chapterId, activeSceneId: scene.id }))
    openScenePanel()
    setContextMenu(null)
  }

  const setActiveSceneRangeFromSelection = async () => {
    if (!editor || !activeScene || editor.state.selection.empty) {
      await showAlert('请先在正文中选择属于当前场景的完整范围。', '设定场景范围')
      return
    }
    const passages = editorPassagesInRange(editor, editor.state.selection.from, editor.state.selection.to)
    if (passages.length === 0) {
      await showAlert('当前选区没有可定位的正文段落。', '设定场景范围')
      return
    }
    const startNodeId = passages[0].nodeId
    const endNodeId = passages[passages.length - 1].nodeId
    setProject((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => scene.id === current.activeSceneId
        ? { ...scene, startNodeId, endNodeId, updatedAt: Date.now() }
        : scene),
    }))
  }

  const moveScene = (sceneId: string, direction: -1 | 1) => {
    setProject((current) => {
      const scene = current.scenes.find((item) => item.id === sceneId)
      if (!scene) return current
      const chapterScenes = current.scenes.filter((item) => item.chapterId === scene.chapterId)
      const localIndex = chapterScenes.findIndex((item) => item.id === sceneId)
      const target = chapterScenes[localIndex + direction]
      if (!target) return current
      const scenes = [...current.scenes]
      const sourceIndex = scenes.findIndex((item) => item.id === sceneId)
      const targetIndex = scenes.findIndex((item) => item.id === target.id)
      ;[scenes[sourceIndex], scenes[targetIndex]] = [scenes[targetIndex], scenes[sourceIndex]]
      return { ...current, scenes }
    })
    setContextMenu(null)
  }

  const deleteScene = async (sceneId: string) => {
    const scene = project.scenes.find((item) => item.id === sceneId)
    if (!scene || project.scenes.filter((item) => item.chapterId === scene.chapterId).length <= 1) return
    if (!await showConfirm(`删除场景“${scene.title}”？正文不会被删除。`, { title: '删除场景', confirmLabel: '删除', danger: true })) return
    await animateRemoval([sceneId])
    setProject((current) => {
      const remaining = current.scenes.filter((item) => item.id !== sceneId)
      const fallback = remaining.find((item) => item.chapterId === scene.chapterId)!
      return {
        ...current,
        scenes: remaining,
        activeSceneId: current.activeSceneId === sceneId ? fallback.id : current.activeSceneId,
      }
    })
    setContextMenu(null)
    finishRemoval([sceneId])
  }

  const moveChapterToVolume = (chapterId: string, volumeId: string) => {
    setProject((current) => ({
      ...current,
      chapters: current.chapters.map((chapter) => chapter.id === chapterId
        ? { ...chapter, volumeId, updatedAt: Date.now() }
        : chapter),
    }))
    setContextMenu(null)
  }

  const toggleVolume = (volumeId: string) => {
    const pendingTimer = volumeCollapseTimers.current.get(volumeId)
    if (pendingTimer) window.clearTimeout(pendingTimer)
    volumeCollapseTimers.current.delete(volumeId)
    const isCollapsed = collapsedVolumes.has(volumeId)
    if (isCollapsed) {
      setUnmountedCollapsedVolumes((current) => {
        const next = new Set(current)
        next.delete(volumeId)
        return next
      })
      if (motionDuration(1) === 0) {
        setCollapsedVolumes((current) => {
          const next = new Set(current)
          next.delete(volumeId)
          return next
        })
      } else {
        window.requestAnimationFrame(() => setCollapsedVolumes((current) => {
          const next = new Set(current)
          next.delete(volumeId)
          return next
        }))
      }
      return
    }
    setCollapsedVolumes((current) => new Set(current).add(volumeId))
    const finishCollapse = () => {
      setUnmountedCollapsedVolumes((current) => new Set(current).add(volumeId))
      volumeCollapseTimers.current.delete(volumeId)
    }
    const duration = motionDuration(210)
    if (duration === 0) finishCollapse()
    else volumeCollapseTimers.current.set(volumeId, window.setTimeout(finishCollapse, duration))
  }

  const toggleSceneList = (chapterId: string) => {
    setExpandedSceneChapters((current) => {
      const next = new Set(current)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  const resolveVolumeDelete = async (deleteChapters: boolean) => {
    const volumeId = pendingVolumeDeleteId
    if (!volumeId) return
    const volume = project.volumes.find((item) => item.id === volumeId)
    const targetVolume = project.volumes.find((item) => item.id !== volumeId)
    if (!volume || (!deleteChapters && !targetVolume)) return
    const affected = project.chapters.filter((chapter) => chapter.volumeId === volumeId)

    if (deleteChapters) {
      for (const chapter of affected) {
        await moveChapterToTrash(project.id, chapter, volume.title, project.scenes.filter((scene) => scene.chapterId === chapter.id))
        await clearAttachmentScope('chapter', chapter.id)
      }
    }
    await clearAttachmentScope('volume', volumeId)
    setAttachments((current) => current.map((attachment) =>
      (attachment.scopeType === 'volume' && attachment.scopeId === volumeId)
        || (deleteChapters && attachment.scopeType === 'chapter' && affected.some((chapter) => chapter.id === attachment.scopeId))
        ? { ...attachment, scopeType: 'project', scopeId: null }
        : attachment))

    setProject((current) => {
      let chapters = deleteChapters
        ? current.chapters.filter((chapter) => chapter.volumeId !== volumeId)
        : current.chapters.map((chapter) => chapter.volumeId === volumeId
          ? { ...chapter, volumeId: targetVolume!.id, updatedAt: Date.now() }
          : chapter)
      let scenes = deleteChapters
        ? current.scenes.filter((scene) => !affected.some((chapter) => chapter.id === scene.chapterId))
        : current.scenes
      if (chapters.length === 0 && targetVolume) {
        const chapterId = crypto.randomUUID()
        chapters = [{
          id: chapterId,
          volumeId: targetVolume.id,
          title: '第一章',
          ...createChapterDocument(''),
          updatedAt: Date.now(),
        }]
        scenes = [...scenes, createScene(chapterId)]
      }
      const activeChapterId = chapters.some((chapter) => chapter.id === current.activeChapterId)
        ? current.activeChapterId
        : chapters[0]?.id ?? ''
      const activeSceneId = scenes.some((scene) => scene.id === current.activeSceneId && scene.chapterId === activeChapterId)
        ? current.activeSceneId
        : scenes.find((scene) => scene.chapterId === activeChapterId)?.id ?? ''
      return {
        ...current,
        volumes: current.volumes.filter((item) => item.id !== volumeId),
        chapters,
        scenes,
        activeChapterId,
        activeSceneId,
      }
    })
    if (deleteChapters) {
      const deletedChapterIds = new Set(affected.map((chapter) => chapter.id))
      setProjectMemoryBundles((current) => current.filter((bundle) => !bundle.memory || !deletedChapterIds.has(bundle.memory.chapterId)))
      if (memoryBundle.memory && deletedChapterIds.has(memoryBundle.memory.chapterId)) setMemoryBundle({ memory: null, candidates: [] })
    }
    setCollapsedVolumes((current) => {
      const next = new Set(current)
      next.delete(volumeId)
      return next
    })
    setExpandedSceneChapters((current) => {
      const next = new Set(current)
      affected.forEach((chapter) => next.delete(chapter.id))
      return next
    })
    setPendingVolumeDeleteId(null)
  }

  const openChapter = async (chapterId: string) => {
    if (chapterId === activeChapter.id) return
    await createRevision(activeChapter, '切换章节时自动保存')
    setProject((current) => ({
      ...current,
      activeChapterId: chapterId,
      activeSceneId: current.scenes.find((scene) => scene.chapterId === chapterId)?.id ?? current.activeSceneId,
    }))
    if (historyOpen) void closeUtilityPanel('history')
    setContextMenu(null)
    if (window.innerWidth <= 760) void toggleSidebar()
  }

  const openAnswerCitation = async (citation: ProjectAnswerCitation) => {
    const chapter = project.chapters.find((item) => item.id === citation.chapterId)
    if (!chapter) {
      setProjectQuestionMessage('引用对应的章节已经不存在')
      setAgentMessage('引用对应的章节已经不存在')
      return
    }
    if (!citation.quote.trim() || !chapterContainsCitation(chapter, citation)) {
      setProjectQuestionMessage('原文已修改，暂时无法定位这条引用')
      setAgentMessage('原文已修改，暂时无法定位这条引用')
      return
    }
    setAgentMessage('正在定位引用原文')
    setCitationTarget(citation)
    if (citation.chapterId !== activeChapter.id) await openChapter(citation.chapterId)
    if (window.innerWidth <= 760 && assistantOpen) void closeUtilityPanel('assistant')
  }

  const openHistory = async () => {
    setClosingUtilityPanel(null)
    setTrashOpen(false)
    setAssetsOpen(false)
    setAttachmentsOpen(false)
    setReferencesOpen(false)
    setNamingOpen(false)
    setAssistantOpen(false)
    setHistoryOpen(true)
    setRevisions(await listRevisions(activeChapter.id))
  }

  const saveRevision = async () => {
    const created = await createRevision(activeChapter, '手动保存')
    setRevisionMessage(created ? '版本已保存' : '内容没有变化')
    setRevisions(await listRevisions(activeChapter.id))
    window.setTimeout(() => setRevisionMessage(''), 1800)
  }

  const restoreRevision = async (revision: Revision) => {
    if (!await showConfirm(`恢复到 ${new Date(revision.createdAt).toLocaleString('zh-CN')} 的版本？`, { title: '恢复历史版本', confirmLabel: '恢复' })) return
    await createRevision(activeChapter, '恢复前自动保存')
    setProject((current) => ({
      ...current,
      chapters: current.chapters.map((chapter) => chapter.id === current.activeChapterId
        ? {
            ...chapter,
            title: revision.title,
            content: revision.content,
            contentJson: revision.contentJson,
            plainText: revision.plainText,
            contentHash: revision.contentHash,
            revisionNumber: chapter.revisionNumber + 1,
            updatedAt: Date.now(),
          }
        : chapter),
    }))
    setRevisions(await listRevisions(activeChapter.id))
    setRevisionMessage('版本已恢复')
  }

  const collectMatches = () => {
    if (!editor || !findQuery) return []
    const matches: Array<{ from: number; to: number }> = []
    const needle = findQuery.toLocaleLowerCase()
    editor.state.doc.descendants((node, position) => {
      if (!node.isText || !node.text) return
      const text = node.text.toLocaleLowerCase()
      let offset = text.indexOf(needle)
      while (offset >= 0) {
        matches.push({ from: position + offset, to: position + offset + findQuery.length })
        offset = text.indexOf(needle, offset + Math.max(1, needle.length))
      }
    })
    return matches
  }

  useEffect(() => {
    setFindCount(collectMatches().length)
  }, [activeChapter.content, findQuery])

  const findNext = () => {
    if (!editor) return
    const matches = collectMatches()
    setFindCount(matches.length)
    if (matches.length === 0) return
    const current = editor.state.selection.from
    const match = matches.find((item) => item.from > current) ?? matches[0]
    editor.chain().focus().setTextSelection(match).scrollIntoView().run()
  }

  const replaceCurrent = () => {
    if (!editor || !findQuery) return
    const { from, to } = editor.state.selection
    const selected = editor.state.doc.textBetween(from, to)
    if (selected.toLocaleLowerCase() !== findQuery.toLocaleLowerCase()) {
      findNext()
      return
    }
    editor.chain().focus().insertContent(replaceText).run()
    findNext()
  }

  const replaceAll = () => {
    if (!editor || !findQuery) return
    const matches = collectMatches()
    if (matches.length === 0) return
    const transaction = editor.state.tr
    for (const match of [...matches].reverse()) {
      transaction.insertText(replaceText, match.from, match.to)
    }
    editor.view.dispatch(transaction)
    editor.commands.focus()
  }

  const writeClipboard = (text: string) => isTauri() ? writeClipboardText(text) : navigator.clipboard.writeText(text)
  const readClipboard = () => isTauri() ? readClipboardText() : navigator.clipboard.readText()

  const runEditorMenuAction = async (action: 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'selectAll') => {
    if (!editor) return
    setContextMenu(null)
    if (action === 'undo') editor.chain().focus().undo().run()
    if (action === 'redo') editor.chain().focus().redo().run()
    if (action === 'selectAll') editor.chain().focus().selectAll().run()
    if (action === 'copy' || action === 'cut') {
      const { from, to } = editor.state.selection
      if (from === to) return
      try {
        const text = editor.state.doc.textBetween(from, to, '\n')
        await writeClipboard(text)
        if (action === 'cut') editor.chain().focus().deleteSelection().run()
      } catch {
        await showAlert('无法访问系统剪贴板，请检查应用权限。', '剪贴板不可用')
      }
    }
    if (action === 'paste') {
      try {
        const text = await readClipboard()
        if (text) editor.chain().focus().insertContent(escapeHtml(text).replace(/\r?\n/g, '<br>')).run()
      } catch {
        await showAlert('无法读取系统剪贴板，请检查应用权限。', '剪贴板不可用')
      }
    }
  }

  const runInputMenuAction = async (action: 'cut' | 'copy' | 'paste' | 'selectAll') => {
    const input = contextInput.current
    if (!input) return
    setContextMenu(null)
    input.focus()
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? start
    try {
      if (action === 'selectAll') {
        input.select()
        return
      }
      if (action === 'copy' || action === 'cut') {
        if (start === end) return
        await writeClipboard(input.value.slice(start, end))
        if (action === 'cut') {
          input.setRangeText('', start, end, 'end')
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
        return
      }
      const text = await readClipboard()
      input.setRangeText(text, start, end, 'end')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    } catch {
      await showAlert('无法访问系统剪贴板，请检查应用权限。', '剪贴板不可用')
    }
  }

  const refreshProjects = async () => setProjects(await listProjects())
  const refreshTrashedProjects = async () => setTrashedProjects(await listTrashedProjects())

  const switchProject = async (projectId: string) => {
    if (projectSwitchingId) return
    if (projectId === project.id) {
      void closeModal('library')
      return
    }
    setProjectSwitchingId(projectId)
    setHydrated(false)
    setSaveState('saving')
    try {
      await createRevision(activeChapter, '切换作品时自动保存')
      await saveProject(project)
      const nextProject = await loadProject(projectId)
      setProject(nextProject)
      closeUtilityPanels()
      setSaveState('saved')
      setHydrated(true)
      void closeModal('library')
    } catch (error) {
      setHydrated(true)
      setSaveState('error')
      await showAlert(error instanceof Error ? error.message : '无法打开作品', '切换作品失败')
    } finally {
      setProjectSwitchingId(null)
    }
  }

  const createProject = async (title: string) => {
    await saveProject(project)
    const nextProject = createInitialProject(title.trim())
    await saveProject(nextProject)
    setProject(nextProject)
    closeUtilityPanels()
    setHydrated(true)
    await refreshProjects()
    void closeModal('newProject')
  }

  const openNewProjectDialog = () => {
    setProjectNameDialogMode('create')
    setProjectNameTargetId(null)
    setNewProjectTitle(`未命名作品 ${projects.length + 1}`)
    setClosingModal(null)
    setNewProjectDialogOpen(true)
  }

  const openRenameProjectDialog = (projectId: string) => {
    const target = projects.find((item) => item.id === projectId)
    if (!target) return
    setProjectNameDialogMode('rename')
    setProjectNameTargetId(projectId)
    setNewProjectTitle(target.title)
    setClosingModal(null)
    setContextMenu(null)
    setNewProjectDialogOpen(true)
  }

  const renameStoredProject = async () => {
    const title = newProjectTitle.trim()
    const projectId = projectNameTargetId
    if (!title || !projectId) return
    if (projectId === project.id) {
      const updated = { ...project, title }
      setProject(updated)
      await saveProject(updated)
    } else {
      const stored = await loadProject(projectId)
      await saveProject({ ...stored, title })
    }
    await refreshProjects()
    void closeModal('newProject')
  }

  const deleteStoredProject = async (projectId: string) => {
    const target = projects.find((item) => item.id === projectId)
    if (!target || !await showConfirm(`将作品“${target.title}”移到作品回收站？`, { title: '删除作品', confirmLabel: '移到回收站', danger: true })) return
    await animateRemoval([projectId])
    await moveProjectToTrash(projectId)
    if (projectId === project.id) {
      const next = projects.find((item) => item.id !== projectId)
      if (next) {
        setProject(await loadProject(next.id))
      } else {
        setProject({ id: '', title: '', volumes: [], chapters: [], scenes: [], activeChapterId: '', activeSceneId: '', deletedAt: null })
      }
    }
    await refreshProjects()
    await refreshTrashedProjects()
    finishRemoval([projectId])
  }

  const restoreDeletedProject = async (projectId: string) => {
    await restoreStoredProject(projectId)
    await Promise.all([refreshProjects(), refreshTrashedProjects()])
  }

  const permanentlyDeleteProject = async (projectId: string) => {
    const target = trashedProjects.find((item) => item.id === projectId)
    if (!target || !await showConfirm(`永久删除作品“${target.title}”及其全部文件？此操作无法撤销。`, { title: '永久删除作品', confirmLabel: '永久删除', danger: true })) return
    await animateRemoval([projectId])
    for (const asset of await listImageAssets(projectId)) await deleteImageAsset(asset)
    for (const attachment of await listAttachments(projectId)) await deleteAttachment(attachment)
    for (const reference of await listReferenceTexts(projectId)) await deleteReferenceText(reference)
    await deleteAiProjectData(projectId)
    await removeStoredProject(projectId)
    await refreshTrashedProjects()
    finishRemoval([projectId])
  }

  const moveChapter = (chapterId: string, direction: -1 | 1) => {
    setProject((current) => {
      const index = current.chapters.findIndex((chapter) => chapter.id === chapterId)
      const targetIndex = index + direction
      if (index < 0 || targetIndex < 0 || targetIndex >= current.chapters.length) return current
      const chapters = [...current.chapters]
      const [chapter] = chapters.splice(index, 1)
      chapters.splice(targetIndex, 0, chapter)
      return { ...current, chapters }
    })
    setContextMenu(null)
  }

  const deleteChapter = async (chapterId: string) => {
    const chapter = project.chapters.find((item) => item.id === chapterId)
    if (!chapter || !await showConfirm(`将“${chapter.title}”移到回收站？`, { title: '删除章节', confirmLabel: '移到回收站', danger: true })) return
    await animateChapterRemoval([chapterId])
    const volume = project.volumes.find((item) => item.id === chapter.volumeId)
    await moveChapterToTrash(project.id, chapter, volume?.title ?? '未命名卷', project.scenes.filter((scene) => scene.chapterId === chapter.id))
    await clearAttachmentScope('chapter', chapter.id)
    setAttachments((current) => current.map((attachment) =>
      attachment.scopeType === 'chapter' && attachment.scopeId === chapter.id
        ? { ...attachment, scopeType: 'project', scopeId: null }
        : attachment))
    setProject((current) => {
      const index = current.chapters.findIndex((item) => item.id === chapterId)
      const chapters = current.chapters.filter((item) => item.id !== chapterId)
      const scenes = current.scenes.filter((scene) => scene.chapterId !== chapterId)
      const activeChapterId = current.activeChapterId === chapterId
        ? (chapters.length > 0 ? chapters[Math.min(index, chapters.length - 1)].id : '')
        : current.activeChapterId
      const activeSceneId = scenes.length > 0 && scenes.some((scene) => scene.id === current.activeSceneId && scene.chapterId === activeChapterId)
        ? current.activeSceneId
        : (scenes.find((scene) => scene.chapterId === activeChapterId)?.id ?? '')
      return { ...current, chapters, scenes, activeChapterId, activeSceneId }
    })
    setProjectMemoryBundles((current) => current.filter((bundle) => bundle.memory?.chapterId !== chapterId))
    if (memoryBundle.memory?.chapterId === chapterId) setMemoryBundle({ memory: null, candidates: [] })
    setContextMenu(null)
  }

  const closeUtilityPanels = () => {
    setClosingUtilityPanel(null)
    setAssistantOpen(false)
    setHistoryOpen(false)
    setTrashOpen(false)
    setAssetsOpen(false)
    setAttachmentsOpen(false)
    setReferencesOpen(false)
    setNamingOpen(false)
  }

  const prepareUtilityPanelOpen = (kind: UtilityPanelKind) => {
    const switching = assistantOpen || historyOpen || trashOpen || assetsOpen || attachmentsOpen || referencesOpen || namingOpen
    if (switching) {
      setSuppressPanelEntry(kind)
    } else {
      setSuppressPanelEntry(null)
    }
    closeUtilityPanels()
    setUtilityPanelOpen(kind, true)
  }

  const openTrash = async () => {
    if (trashOpen) {
      if (closingUtilityPanel !== 'trash') void closeUtilityPanel('trash')
      return
    }
    prepareUtilityPanelOpen('trash')
    setSelectedTrashIds(new Set())
    setTrashedChapters(await listTrashedChapters(project.id))
  }

  const openAssets = async () => {
    if (assetsOpen) {
      if (closingUtilityPanel !== 'assets') void closeUtilityPanel('assets')
      return
    }
    prepareUtilityPanelOpen('assets')
    setImageAssets(await listImageAssets(project.id))
  }

  const openAttachments = async () => {
    if (attachmentsOpen) {
      if (closingUtilityPanel !== 'attachments') void closeUtilityPanel('attachments')
      return
    }
    prepareUtilityPanelOpen('attachments')
    setAttachments(await listAttachments(project.id))
  }

  const openReferences = async () => {
    if (referencesOpen) {
      if (closingUtilityPanel !== 'references') void closeUtilityPanel('references')
      return
    }
    prepareUtilityPanelOpen('references')
    setReferenceView('files')
    const [references, profile] = await Promise.all([listReferenceTexts(project.id), loadStyleProfile(project.id)])
    setReferenceTexts(references)
    setStyleProfile(profile)
    setStyleMessage('')
  }

  const openNaming = () => {
    if (namingOpen) {
      if (closingUtilityPanel !== 'naming') void closeUtilityPanel('naming')
      return
    }
    setAssistantView('naming')
    prepareUtilityPanelOpen('naming')
  }

  const requestImageUpload = (insertAfterUpload: boolean) => {
    insertUploadedImage.current = insertAfterUpload
    imageInput.current?.click()
  }

  const insertImage = (asset: ImageAsset) => {
    editor?.chain().focus().setImage({
      src: asset.src,
      alt: asset.fileName,
      title: asset.fileName,
    }).run()
  }

  const updateSelectedImage = (attributes: Partial<ImageSettings>, focusEditor = true) => {
    if (!editor) return
    if (focusEditor) {
      editor.chain().focus().updateAttributes('image', attributes).run()
    } else {
      editor.commands.updateAttributes('image', attributes)
    }
  }

  const uploadImage = async (file: File) => {
    try {
      setAssetBusy(true)
      const asset = await saveImageAsset(project.id, file)
      setImageAssets((current) => [asset, ...current])
      if (insertUploadedImage.current) insertImage(asset)
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '图片保存失败', '图片保存失败')
    } finally {
      insertUploadedImage.current = false
      setAssetBusy(false)
    }
  }

  const removeImage = async (asset: ImageAsset) => {
    const referenced = project.chapters.some((chapter) => chapter.content.includes(asset.src))
    if (referenced) {
      await showAlert('这张图片仍在正文中使用，请先从正文中删除图片。', '无法删除图片')
      return
    }
    if (!await showConfirm(`删除图片“${asset.fileName}”？`, { title: '删除图片', confirmLabel: '删除', danger: true })) return
    await animateRemoval([asset.id])
    await deleteImageAsset(asset)
    setImageAssets((current) => current.filter((item) => item.id !== asset.id))
    finishRemoval([asset.id])
  }

  const uploadAttachment = async (file: File) => {
    try {
      setAttachmentBusy(true)
      const attachment = await saveAttachment(project.id, file)
      setAttachments((current) => [attachment, ...current])
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '附件保存失败', '附件保存失败')
    } finally {
      setAttachmentBusy(false)
    }
  }

  const downloadAttachment = async (attachment: Attachment) => {
    try {
      downloadBlob(new Blob([await readAttachment(attachment)], { type: attachment.mediaType }), attachment.fileName)
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '附件读取失败', '附件读取失败')
    }
  }

  const removeAttachment = async (attachment: Attachment) => {
    if (!await showConfirm(`删除附件“${attachment.fileName}”？`, { title: '删除附件', confirmLabel: '删除', danger: true })) return
    await animateRemoval([attachment.id])
    await deleteAttachment(attachment)
    setAttachments((current) => current.filter((item) => item.id !== attachment.id))
    finishRemoval([attachment.id])
  }

  const uploadReference = async (file: File) => {
    const confirmed = await showConfirm(
      `导入“${file.name}”前，请确认你拥有存储和处理该文本的权利。参考文本将与作品正文分开保存。`,
      { title: '确认文本使用权', confirmLabel: '我确认并导入' },
    )
    if (!confirmed) return
    try {
      setReferenceBusy(true)
      const reference = await saveReferenceText(project.id, file, Date.now())
      setReferenceTexts((current) => [reference, ...current])
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '参考文本保存失败', '参考文本保存失败')
    } finally {
      setReferenceBusy(false)
    }
  }

  const downloadReference = async (reference: ReferenceText) => {
    try {
      downloadBlob(new Blob([await readReferenceText(reference)], { type: reference.mediaType }), reference.fileName)
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '参考文本读取失败', '参考文本读取失败')
    }
  }

  const removeReference = async (reference: ReferenceText) => {
    if (!await showConfirm(`删除参考文本“${reference.fileName}”？`, { title: '删除参考文本', confirmLabel: '删除', danger: true })) return
    await animateRemoval([reference.id])
    await deleteReferenceText(reference)
    setReferenceTexts((current) => current.filter((item) => item.id !== reference.id))
    if (styleProfile.sourceReferenceIds.includes(reference.id)) {
      const clearedProfile = emptyStyleProfile(project.id)
      await saveStyleProfile(clearedProfile)
      setStyleProfile(clearedProfile)
      setReferenceView('files')
      setStyleMessage('已删除风格来源，对应风格档案和重合指纹已清空')
    }
    finishRemoval([reference.id])
  }

  const referencePlainText = async (reference: ReferenceText) => {
    const bytes = await readReferenceText(reference)
    if (reference.extension === 'txt' || reference.extension === 'md') return new TextDecoder().decode(bytes)
    const buffer = bytes.slice().buffer as ArrayBuffer
    const formats = await loadDocumentFormats()
    const sections = reference.extension === 'docx' ? await formats.importDocx(buffer) : await formats.importEpub(buffer)
    return sections.map((section) => `${section.title}\n${plainText(section.html)}`).join('\n\n')
  }

  const runStyleAnalysis = async () => {
    if (styleBusy) {
      styleController.current?.abort()
      return
    }
    if (!aiApiKey.trim() || !aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      setStyleMessage('请先完成 AI 服务配置')
      return
    }
    if (referenceTexts.length === 0) {
      setStyleMessage('请先导入至少一份参考文本')
      return
    }
    const controller = new AbortController()
    styleController.current = controller
    setStyleBusy(true)
    setStyleMessage('正在读取参考文本并提取抽象风格')
    try {
      const sources = [] as Array<{ id: string; fileName: string; text: string }>
      for (const reference of referenceTexts) {
        sources.push({ id: reference.id, fileName: reference.fileName, text: (await referencePlainText(reference)).slice(0, 250000) })
      }
      const profile = await analyzeStyleProfile(aiSettings, aiApiKey, project.id, sources, controller.signal)
      if (styleController.current !== controller) return
      await saveStyleProfile(profile)
      setStyleProfile(profile)
      setReferenceView('style')
      setStyleMessage(`已从 ${sources.length} 份参考文本提取抽象风格档案`)
    } catch (error) {
      if (styleController.current !== controller) return
      setStyleMessage(error instanceof Error ? error.message : '分析参考文本风格失败')
    } finally {
      if (styleController.current === controller) {
        styleController.current = null
        setStyleBusy(false)
      }
    }
  }

  const updateStyleProfileField = (field: keyof Pick<StyleProfile, 'sentenceRhythm' | 'paragraphRhythm' | 'compositionBalance' | 'pointOfView' | 'narrativeDistance' | 'lexicalDensity' | 'rhetoricIntensity' | 'emotionalTone' | 'revelationPattern' | 'chapterEndingPattern' | 'editableGuidance'>, value: string) => {
    setStyleProfile((current) => ({ ...current, [field]: value, updatedAt: Date.now() }))
  }

  const commitStyleProfile = async () => {
    await saveStyleProfile(styleProfile)
    setStyleMessage('风格档案已保存')
  }

  const changeAttachmentScope = async (attachment: Attachment, value: string) => {
    const [scopeType, scopeId = ''] = value.split(':', 2) as [AttachmentScope['scopeType'], string?]
    const scope: AttachmentScope = {
      scopeType,
      scopeId: scopeType === 'project' ? null : scopeId || null,
    }
    try {
      await updateAttachmentScope(attachment.id, scope)
      setAttachments((current) => current.map((item) => item.id === attachment.id ? { ...item, ...scope } : item))
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '资料关联保存失败', '保存失败')
    }
  }

  const restoreTrashedChapter = async (trashed: TrashedChapter) => {
    const volumeId = project.volumes.some((volume) => volume.id === trashed.originalVolumeId)
      ? trashed.originalVolumeId
      : project.volumes[0].id
    const chapter: Chapter = {
      id: trashed.id,
      volumeId,
      title: trashed.title,
      content: trashed.content,
      contentJson: trashed.contentJson,
      plainText: trashed.plainText,
      revisionNumber: trashed.revisionNumber,
      contentHash: trashed.contentHash,
      updatedAt: Date.now(),
    }
    await removeTrashedChapter(trashed.id)
    setProject((current) => ({
      ...current,
      chapters: [...current.chapters, chapter],
      scenes: [...current.scenes, ...trashed.scenes.map((scene) => ({ ...scene, chapterId: chapter.id, updatedAt: Date.now() }))],
      activeChapterId: chapter.id,
      activeSceneId: trashed.scenes[0].id,
    }))
    setTrashedChapters(await listTrashedChapters(project.id))
    setSelectedTrashIds((current) => {
      const next = new Set(current)
      next.delete(trashed.id)
      return next
    })
  }

  const permanentlyDeleteChapter = async (chapterId: string) => {
    if (!await showConfirm('永久删除这个章节？此操作无法撤销。', { title: '永久删除章节', confirmLabel: '永久删除', danger: true })) return
    await animateRemoval([chapterId])
    await removeTrashedChapter(chapterId)
    setTrashedChapters(await listTrashedChapters(project.id))
    setSelectedTrashIds((current) => {
      const next = new Set(current)
      next.delete(chapterId)
      return next
    })
    finishRemoval([chapterId])
  }

  const toggleTrashSelection = (chapterId: string) => {
    setSelectedTrashIds((current) => {
      const next = new Set(current)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  const toggleAllTrash = () => {
    setSelectedTrashIds((current) => current.size === trashedChapters.length
      ? new Set()
      : new Set(trashedChapters.map((chapter) => chapter.id)))
  }

  const permanentlyDeleteSelected = async () => {
    if (selectedTrashIds.size === 0) return
    if (!await showConfirm(`永久删除选中的 ${selectedTrashIds.size} 个章节？此操作无法撤销。`, { title: '批量永久删除', confirmLabel: '永久删除', danger: true })) return
    const ids = [...selectedTrashIds]
    await animateRemoval(ids)
    for (const chapterId of ids) await removeTrashedChapter(chapterId)
    setSelectedTrashIds(new Set())
    setTrashedChapters(await listTrashedChapters(project.id))
    finishRemoval(ids)
  }

  const exportText = () => {
    const content = project.chapters
      .map((chapter) => `${chapter.title}\n\n${plainText(chapter.content)}`)
      .join('\n\n\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.title}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportMarkdown = async () => {
    const sources = new Map<string, string>()
    for (const asset of await listImageAssets(project.id)) {
      const bytes = await readImageAsset(asset)
      sources.set(asset.src, await blobToDataUrl(new Blob([bytes], { type: asset.mediaType })))
    }
    const sections: string[] = [`# ${escapeMarkdown(project.title)}`]
    for (const volume of project.volumes) {
      sections.push(`## ${escapeMarkdown(volume.title)}`)
      for (const chapter of project.chapters.filter((item) => item.volumeId === volume.id)) {
        sections.push(`### ${escapeMarkdown(chapter.title)}`)
        const content = htmlToMarkdown(chapter.content, sources)
        if (content) sections.push(content)
      }
    }
    downloadFile(`${sections.join('\n\n')}\n`, `${project.title}.md`, 'text/markdown;charset=utf-8')
  }

  const exportDocument = async (format: 'txt' | 'md' | 'docx' | 'epub') => {
    if (format === 'txt') {
      exportText()
      setExportOpen(false)
      return
    }
    try {
      setExportBusy(format)
      const formats = await loadDocumentFormats()
      const resourceIssues = await formats.validateProjectResources(project)
      if (resourceIssues.length > 0) {
        const chapters = [...new Set(resourceIssues.map((issue) => issue.chapterTitle))]
        throw new Error(`以下章节存在无法读取的图片：\n${chapters.slice(0, 8).join('\n')}${chapters.length > 8 ? '\n…' : ''}`)
      }
      if (format === 'md') await exportMarkdown()
      else {
        const blob = format === 'docx' ? await formats.exportDocx(project) : await formats.exportEpub(project)
        downloadBlob(blob, `${project.title}.${format}`)
      }
      setExportOpen(false)
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : `${format.toUpperCase()} 导出失败`, '导出失败')
    } finally {
      setExportBusy(null)
    }
  }

  const openExportDialog = async () => {
    setExportOpen(true)
    setExportReport(null)
    const duplicateVolumeNames = project.volumes.length
      - new Set(project.volumes.map((volume) => volume.title.trim().toLocaleLowerCase())).size
    let duplicateChapterNames = 0
    for (const volume of project.volumes) {
      const names = project.chapters.filter((chapter) => chapter.volumeId === volume.id)
        .map((chapter) => chapter.title.trim().toLocaleLowerCase())
      duplicateChapterNames += names.length - new Set(names).size
    }
    const emptyChapters = project.chapters.filter((chapter) =>
      !plainText(chapter.content).trim() && !/<img\b/i.test(chapter.content)).length
    const formats = await loadDocumentFormats()
    const missingResources = (await formats.validateProjectResources(project)).length
    setExportReport({ emptyChapters, duplicateVolumeNames, duplicateChapterNames, missingResources })
  }

  const chooseProjectSavePath = async () => {
    if (!isTauri()) {
      await showAlert('浏览器模式无法访问本机文件夹，请使用导出功能选择保存位置。', '选择保存路径')
      return
    }
    try {
      const selected = await openDirectoryDialog({ directory: true, multiple: false, title: '选择作品保存文件夹' })
      if (typeof selected === 'string' && selected.trim()) {
        setPreferences((current) => ({ ...current, projectSavePath: selected }))
      }
    } catch (error) {
      await showAlert(error instanceof Error ? error.message : '无法选择保存文件夹', '选择保存路径失败')
    }
  }

  const exportBackup = async (silent = false) => {
    setBackupState('saving')
    setBackupMessage('正在生成备份')
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const assets = await listImageAssets(project.id)
      const projectAttachments = await listAttachments(project.id)
      const projectReferences = await listReferenceTexts(project.id)
      const projectData = JSON.parse(exportProjectBackup(project)) as Record<string, unknown>
      projectData.ai = await exportAiProjectData(project)
      projectData.assets = assets.map((asset) => ({
        id: asset.id,
        fileName: asset.fileName,
        extension: asset.extension,
        mediaType: asset.mediaType,
        size: asset.size,
        source: asset.src,
        path: `assets/${asset.id}.${asset.extension}`,
      }))
      projectData.attachments = projectAttachments.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        extension: attachment.extension,
        mediaType: attachment.mediaType,
        size: attachment.size,
        scopeType: attachment.scopeType,
        scopeId: attachment.scopeId,
        path: `attachments/${attachment.id}.${attachment.extension}`,
      }))
      projectData.references = projectReferences.map((reference) => ({
        id: reference.id,
        fileName: reference.fileName,
        mediaType: reference.mediaType,
        rightsConfirmedAt: reference.rightsConfirmedAt,
        path: `references/${reference.id}.${reference.extension}`,
      }))
      zip.file('project.json', JSON.stringify(projectData, null, 2))
      for (const asset of assets) {
        zip.file(`assets/${asset.id}.${asset.extension}`, await readImageAsset(asset))
      }
      for (const attachment of projectAttachments) {
        zip.file(`attachments/${attachment.id}.${attachment.extension}`, await readAttachment(attachment))
      }
      for (const reference of projectReferences) {
        zip.file(`references/${reference.id}.${reference.extension}`, await readReferenceText(reference))
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      if (isTauri() && preferences.projectSavePath.trim()) {
        const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()))
        const savedPath = await invoke<string>('save_project_backup', {
          directory: preferences.projectSavePath.trim(),
          fileName: `${project.title}.zili`,
          bytes,
        })
        if (!silent) await showAlert(`完整作品备份已保存到：\n${savedPath}`, '备份完成')
      } else {
        downloadBlob(blob, `${project.title}.zili`)
      }
      setBackupState('saved')
      setBackupMessage(isTauri() && preferences.projectSavePath.trim() ? '备份已保存到作品路径' : '备份文件已下载')
    } catch (error) {
      setBackupState('error')
      setBackupMessage(error instanceof Error ? error.message : '项目备份失败')
      if (!silent) await showAlert(error instanceof Error ? error.message : '项目备份失败', '备份失败')
    }
  }

  const beginImportProgress = () => {
    if (importProgressTimer.current) window.clearTimeout(importProgressTimer.current)
    importProgressTimer.current = null
    setSaveState('saving')
    setImportProgress({ phase: 'running', current: 0, total: 0, message: '正在读取导入文件…' })
  }

  const reportImportProgress = (current: number, total: number, message: string) => {
    setImportProgress({ phase: 'running', current, total, message })
  }

  const finishImportProgress = (current: number, total: number, message = '导入完成') => {
    setSaveState('saved')
    setImportProgress({ phase: 'complete', current, total, message })
    if (importProgressTimer.current) window.clearTimeout(importProgressTimer.current)
    importProgressTimer.current = window.setTimeout(() => {
      importProgressTimer.current = null
      setImportProgress(null)
    }, 2400)
  }

  const failImportProgress = (message: string) => {
    setSaveState('error')
    setImportProgress((current) => ({
      phase: 'error',
      current: current?.current ?? 0,
      total: current?.total ?? 0,
      message,
    }))
  }

  const yieldImportStep = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0))

  const createRichImportedChapters = async (
    sections: ImportedSection[],
    fallbackTitle: string,
    targetProjectId = project.id,
    targetVolumeId = activeChapter.volumeId,
    onProgress?: (current: number, total: number) => void,
  ) => {
    const createdAssets: ImageAsset[] = []
    try {
      const chapters: Chapter[] = []
      for (const [index, section] of sections.entries()) {
        const content = await materializeImportedHtml(targetProjectId, section.html, createdAssets)
        chapters.push({
          id: crypto.randomUUID(),
          volumeId: targetVolumeId,
          title: section.title === '导入文档' ? fallbackTitle : section.title,
          ...createChapterDocument(content),
          updatedAt: Date.now(),
        })
        onProgress?.(index + 1, sections.length)
        await yieldImportStep()
      }
      return chapters
    } catch (error) {
      for (const asset of createdAssets) await deleteImageAsset(asset).catch(() => undefined)
      throw error
    }
  }

  const applyImportedChapters = async (importedChapters: Chapter[], importedProject: ProjectState | null) => {
    if (importedChapters.length === 0) throw new Error('没有可导入的章节')
    const importedScenes = createScenesForChapters(importedChapters)
    if (importedProject) {
      let nextProject: ProjectState = {
        ...importedProject,
        chapters: [importedChapters[0]],
        scenes: [importedScenes[0]],
        activeChapterId: importedChapters[0].id,
        activeSceneId: importedScenes[0].id,
      }
      if (project.id) await saveProject(project)
      setProject(nextProject)
      reportImportProgress(1, importedChapters.length, `正在导入第 1/${importedChapters.length} 章：${importedChapters[0].title}`)
      await yieldImportStep()
      for (let index = 1; index < importedChapters.length; index += 1) {
        nextProject = {
          ...nextProject,
          chapters: [...nextProject.chapters, importedChapters[index]],
          scenes: [...nextProject.scenes, importedScenes[index]],
          activeChapterId: importedChapters[index].id,
          activeSceneId: importedScenes[index].id,
        }
        setProject(nextProject)
        reportImportProgress(index + 1, importedChapters.length, `正在导入第 ${index + 1}/${importedChapters.length} 章：${importedChapters[index].title}`)
        await yieldImportStep()
      }
      await saveProject(nextProject)
      setSidebarOpen(window.innerWidth > 760)
      await refreshProjects()
      finishImportProgress(importedChapters.length, importedChapters.length, `已导入 ${importedChapters.length} 章`)
      return
    }
    let nextProject = project
    for (let index = 0; index < importedChapters.length; index += 1) {
      const chapter = importedChapters[index]
      const scene = importedScenes[index]
      nextProject = {
        ...nextProject,
        chapters: [...nextProject.chapters, chapter],
        scenes: [...nextProject.scenes, scene],
        activeChapterId: chapter.id,
        activeSceneId: scene.id,
      }
      setProject(nextProject)
      reportImportProgress(index + 1, importedChapters.length, `正在追加第 ${index + 1}/${importedChapters.length} 章：${chapter.title}`)
      await yieldImportStep()
    }
    await saveProject(nextProject)
    finishImportProgress(importedChapters.length, importedChapters.length, `已导入 ${importedChapters.length} 章`)
  }

  const importDocument = async (file: File, destination: 'append' | 'new' = 'append') => {
    if (importProgress?.phase === 'running') return
    beginImportProgress()
    const importDestination = project.id ? destination : 'new'
    if (/\.zili$/i.test(file.name)) {
      try {
        const { default: JSZip } = await import('jszip')
        const zip = await JSZip.loadAsync(await file.arrayBuffer())
        const projectSource = await zip.file('project.json')?.async('text')
        if (!projectSource) throw new Error('备份中缺少 project.json')
        const packageData = JSON.parse(projectSource) as {
          assets?: Array<{ fileName: string; mediaType: string; source: string; path: string }>
          attachments?: Array<{ fileName: string; mediaType: string; path: string; scopeType?: Attachment['scopeType']; scopeId?: string | null }>
          references?: Array<{ id?: string; fileName: string; mediaType: string; path: string; rightsConfirmedAt?: number }>
          ai?: AiProjectData
        }
        if (project.id) await saveProject(project)
        const { project: imported, idMap } = parseProjectBackupWithIdMap(projectSource)
        reportImportProgress(0, imported.chapters.length, `正在读取 ${imported.chapters.length} 个章节`)
        await saveProject(imported)
        for (const assetInfo of packageData.assets ?? []) {
          const bytes = await zip.file(assetInfo.path)?.async('uint8array')
          if (!bytes) continue
          const file = new File([bytes], assetInfo.fileName, { type: assetInfo.mediaType })
          const importedAsset = await saveImageAsset(imported.id, file)
          imported.chapters = imported.chapters.map((chapter) => {
            const content = chapter.content.split(assetInfo.source).join(importedAsset.src)
            return content === chapter.content ? chapter : { ...chapter, ...createChapterDocument(content) }
          })
        }
        for (const attachmentInfo of packageData.attachments ?? []) {
          const bytes = await zip.file(attachmentInfo.path)?.async('uint8array')
          if (!bytes) continue
          const requestedScope = attachmentInfo.scopeType ?? 'project'
          const mappedScopeId = requestedScope === 'volume'
            ? (attachmentInfo.scopeId ? idMap.volumeIds[attachmentInfo.scopeId] : null)
            : requestedScope === 'chapter'
              ? (attachmentInfo.scopeId ? idMap.chapterIds[attachmentInfo.scopeId] : null)
              : null
          const attachmentScope: AttachmentScope = requestedScope !== 'project' && mappedScopeId
            ? { scopeType: requestedScope, scopeId: mappedScopeId }
            : { scopeType: 'project', scopeId: null }
          await saveAttachment(
            imported.id,
            new File([bytes], attachmentInfo.fileName, { type: attachmentInfo.mediaType }),
            attachmentScope,
          )
        }
        const referenceIds: Record<string, string> = {}
        for (const referenceInfo of packageData.references ?? []) {
          const bytes = await zip.file(referenceInfo.path)?.async('uint8array')
          if (!bytes) continue
          const importedReference = await saveReferenceText(
            imported.id,
            new File([bytes], referenceInfo.fileName, { type: referenceInfo.mediaType }),
            referenceInfo.rightsConfirmedAt ?? Date.now(),
          )
          if (referenceInfo.id) referenceIds[referenceInfo.id] = importedReference.id
        }
        await saveProject(imported)
        await importAiProjectData(packageData.ai, { ...idMap, referenceIds })
        setProject(imported)
        await refreshProjects()
        finishImportProgress(imported.chapters.length, imported.chapters.length, `已导入 ${imported.chapters.length} 章`)
      } catch (error) {
        failImportProgress(error instanceof Error ? error.message : '工程包导入失败')
        await showAlert(error instanceof Error ? error.message : String(error || '项目备份导入失败'), '工程包导入失败')
      }
      return
    }
    if (/\.zili\.json$/i.test(file.name)) {
      try {
        const text = await file.text()
        const packageData = JSON.parse(text) as { ai?: AiProjectData }
        if (project.id) await saveProject(project)
        const { project: imported, idMap } = parseProjectBackupWithIdMap(text)
        reportImportProgress(0, imported.chapters.length, `正在读取 ${imported.chapters.length} 个章节`)
        await saveProject(imported)
        await importAiProjectData(packageData.ai, idMap)
        setProject(imported)
        await refreshProjects()
        finishImportProgress(imported.chapters.length, imported.chapters.length, `已导入 ${imported.chapters.length} 章`)
      } catch (error) {
        failImportProgress(error instanceof Error ? error.message : '备份导入失败')
        await showAlert(error instanceof Error ? error.message : '备份导入失败', '备份导入失败')
      }
      return
    }
    if (/\.docx$/i.test(file.name)) {
      try {
        const formats = await loadDocumentFormats()
        const sections = await formats.importDocx(await file.arrayBuffer())
        if (sections.length === 0) throw new Error('DOCX 中没有可导入的正文')
        reportImportProgress(0, sections.length, `正在解析 ${sections.length} 个章节`)
        const importedProject = importDestination === 'new' ? createInitialProject(file.name.replace(/\.docx$/i, '') || '未命名作品') : null
        const importedChapters = await createRichImportedChapters(sections, file.name.replace(/\.docx$/i, ''), importedProject?.id, importedProject?.volumes[0].id, (current, total) => reportImportProgress(current, total, `正在准备第 ${current}/${total} 章`))
        await applyImportedChapters(importedChapters, importedProject)
      } catch (error) {
        failImportProgress(error instanceof Error ? error.message : 'DOCX 导入失败')
        await showAlert(error instanceof Error ? error.message : 'DOCX 导入失败', 'DOCX 导入失败')
      }
      return
    }
    if (/\.epub$/i.test(file.name)) {
      try {
        const formats = await loadDocumentFormats()
        const sections = await formats.importEpub(await file.arrayBuffer())
        reportImportProgress(0, sections.length, `正在解析 ${sections.length} 个章节`)
        const importedProject = importDestination === 'new' ? createInitialProject(file.name.replace(/\.epub$/i, '') || '未命名作品') : null
        const importedChapters = await createRichImportedChapters(sections, file.name.replace(/\.epub$/i, ''), importedProject?.id, importedProject?.volumes[0].id, (current, total) => reportImportProgress(current, total, `正在准备第 ${current}/${total} 章`))
        await applyImportedChapters(importedChapters, importedProject)
      } catch (error) {
        failImportProgress(error instanceof Error ? error.message : 'EPUB 导入失败')
        await showAlert(error instanceof Error ? error.message : 'EPUB 导入失败', 'EPUB 导入失败')
      }
      return
    }
    try {
      const text = await file.text()
    const currentVolumeTitles = project.chapters
      .filter((chapter) => chapter.volumeId === activeChapter.volumeId)
      .map((chapter) => chapter.title)
    const title = file.name.replace(/\.(txt|md)$/i, '') || nextDefaultName(currentVolumeTitles, '章')
    const textAnalysis = analyzePlainTextImport(text)
    let headingMode: 'explicit' | 'title-only' | 'single' = textAnalysis.explicitHeadings.length > 0 ? 'explicit' : 'single'
    if (textAnalysis.explicitHeadings.length === 0 && textAnalysis.titleOnlyHeadings.length > 0) {
      const examples = textAnalysis.titleOnlyHeadings.slice(0, 6).map((item) => `“${item.title}”`).join('、')
      const splitByTitle = await showConfirm(
        `检测到 ${textAnalysis.titleOnlyHeadings.length} 个可能的无编号章节名，例如 ${examples}${textAnalysis.titleOnlyHeadings.length > 6 ? '等' : ''}。请确认这些确实是章节名；选择“整篇导入”则不会自动拆章。`,
        { title: '确认 TXT 章节结构', confirmLabel: '按标题拆分', cancelLabel: '整篇导入' },
      )
      headingMode = splitByTitle ? 'title-only' : 'single'
    }
    const importedProject = importDestination === 'new' ? createInitialProject(file.name.replace(/\.(txt|md)$/i, '') || '未命名作品') : null
    const importedChapters = splitImportedText(text, title, importedProject?.volumes[0].id ?? activeChapter.volumeId, headingMode)
    reportImportProgress(0, importedChapters.length, `已识别 ${importedChapters.length} 个章节，准备导入`)
    await applyImportedChapters(importedChapters, importedProject)
      setSidebarOpen(window.innerWidth > 760)
    } catch (error) {
      failImportProgress(error instanceof Error ? error.message : '文本导入失败')
      await showAlert(error instanceof Error ? error.message : '文本导入失败', '文本导入失败')
    }
  }

  const chapterNavigation = useMemo(() => {
    return project.volumes.map((volume) => (
      <section className="volume-group" key={volume.id}>
        <div className="volume-heading" onContextMenu={(event) => {
          if ((event.target as Element).closest('input')) return
          event.preventDefault(); event.stopPropagation()
          setContextMenu({ kind: 'volume', id: volume.id, x: event.clientX, y: event.clientY })
        }}>
          <button className="volume-toggle" onClick={() => toggleVolume(volume.id)} title={collapsedVolumes.has(volume.id) ? '展开卷' : '折叠卷'}>
            <ChevronRight className={collapsedVolumes.has(volume.id) ? '' : 'is-expanded'} size={14} />
          </button>
          <input aria-label="卷名" value={volume.title} onContextMenu={openInputContextMenu} onChange={(event) => setProject((current) => ({
            ...current,
            volumes: current.volumes.map((item) => item.id === volume.id ? { ...item, title: event.target.value } : item),
          }))} />
          <span className="volume-count">{chapterCountByVolume.get(volume.id) ?? 0}</span>
          <button className="icon-button small" disabled={!hasProject} onClick={() => addChapter(volume.id)} title={`在${volume.title}中新建章节`}><Plus size={15} /></button>
          <button className="icon-button small danger-icon" onClick={() => setPendingVolumeDeleteId(volume.id)} title="删除卷"><Trash2 size={14} /></button>
        </div>
        <div className={`volume-chapters ${collapsedVolumes.has(volume.id) ? 'is-collapsed' : ''}`}>
          <div>
            {!unmountedCollapsedVolumes.has(volume.id) && (filteredChaptersByVolume.get(volume.id) ?? []).map((chapter) => {
              const projectIndex = chapterIndexById.get(chapter.id) ?? 0
              return <div className={`chapter-block ${chapter.id === project.activeChapterId ? 'is-active' : ''} ${removingIds.has(chapter.id) ? 'is-removing' : ''}`} data-chapter-id={chapter.id} key={chapter.id}>
                <div className="chapter-row" onContextMenu={(event) => {
                  event.preventDefault(); event.stopPropagation()
                  setContextMenu({ kind: 'chapter', id: chapter.id, x: event.clientX, y: event.clientY })
                }}>
                  <button className={`chapter-item ${chapter.id === project.activeChapterId ? 'active' : ''}`} onClick={() => void openChapter(chapter.id)} onDoubleClick={() => toggleSceneList(chapter.id)}>
                    <span className="chapter-index">{String(projectIndex + 1).padStart(2, '0')}</span>
                    <span className="chapter-copy"><strong>{chapter.title}</strong><small>{chapter.wordCount} 字</small></span>
                  </button>
                  <button className="chapter-menu-trigger" aria-label={`${chapter.title}操作`} title="章节操作" onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect()
                    setContextMenu((current) => current?.kind === 'chapter' && current.id === chapter.id ? null : { kind: 'chapter', id: chapter.id, x: rect.right, y: rect.bottom + 4 })
                  }}><MoreHorizontal size={16} /></button>
                </div>
                {chapter.id === project.activeChapterId && <div className={`scene-list ${expandedSceneChapters.has(chapter.id) ? '' : 'is-collapsed'}`}>
                  <div className="scene-list-heading"><span>场景</span><button className="icon-button small" onClick={() => addScene(chapter.id)} title="新建场景"><Plus size={14} /></button></div>
                  {project.scenes.filter((scene) => scene.chapterId === chapter.id).map((scene, sceneIndex) => <div className={`scene-row ${removingIds.has(scene.id) ? 'is-removing' : ''}`} key={scene.id} onContextMenu={(event) => {
                    event.preventDefault(); event.stopPropagation()
                    setContextMenu({ kind: 'scene', id: scene.id, x: event.clientX, y: event.clientY })
                  }}>
                    <button className={scene.id === project.activeSceneId ? 'scene-item active' : 'scene-item'} onClick={() => openScene(scene.id)}><span>{sceneIndex + 1}</span><strong>{scene.title}</strong></button>
                    <button className="scene-menu-trigger" aria-label={`${scene.title}操作`} title="场景操作" onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect()
                      setContextMenu({ kind: 'scene', id: scene.id, x: rect.right, y: rect.bottom + 4 })
                    }}><MoreHorizontal size={14} /></button>
                  </div>)}
                </div>}
              </div>
            })}
          </div>
        </div>
      </section>
    ))
  }, [chapterCountByVolume, chapterIndexById, collapsedVolumes, deferredNavigationChapters, expandedSceneChapters, filteredChaptersByVolume, hasProject, historyOpen, preferences.motionEnabled, project.activeChapterId, project.activeSceneId, project.scenes, project.volumes, removingIds, scenePanelOpen, sidebarOpen, unmountedCollapsedVolumes])

  return (
      <main
      className={`app-shell theme-${preferences.theme} ${preferences.uiTextColor ? 'has-custom-ui-text' : ''} ${focusMode ? 'is-focus' : ''} ${focusMode && preferences.paragraphFocus ? 'is-paragraph-focus' : ''} font-${preferences.fontFamily} ${preferences.motionEnabled ? 'motion-enabled' : 'motion-disabled'} ${!sidebarOpen && !assistantOpen && !namingOpen && !historyOpen && !trashOpen && !assetsOpen && !attachmentsOpen && !referencesOpen ? 'is-wide-editor' : ''}`}
      style={{
        ...createUiTypographyVariables(preferences.uiFontSize),
        ...(preferences.uiTextColor ? { '--ui-text-color': preferences.uiTextColor } : {}),
        '--editor-font-size': `${preferences.fontSize}px`,
        '--editor-line-height': preferences.lineHeight,
        '--editor-width': `${preferences.pageWidth}px`,
        '--content-center-offset': `${(sidebarOpen ? 121 : 0) - (assistantOpen || namingOpen || historyOpen || trashOpen || assetsOpen || attachmentsOpen || referencesOpen ? 165 : 0)}px`,
      } as CSSProperties}
      onContextMenu={(event) => {
        const target = event.target
        if (target instanceof Element && target.closest('.tiptap')) {
          event.preventDefault()
          setContextMenu({ kind: 'editor', x: event.clientX, y: event.clientY })
          return
        }
        if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return
        event.preventDefault()
      }}
    >
      {!hydrated && <div className="startup-screen" role="status" aria-live="polite"><div><img className="startup-mark" src="/pwa-128.png" alt="" /><strong>字里写作</strong><span>正在恢复上次打开的作品…</span></div></div>}
      {!focusMode && (
        <header className="topbar">
          <div className="titlebar-drag-region" data-tauri-drag-region onDoubleClick={() => void runWindowCommand('maximize')} />
          <div className="brand-actions">
            <div className="brand" aria-label="字里写作">
              <img className="brand-mark" src="/pwa-128.png" alt="" />
              <span>字里写作</span>
            </div>
            <span className="brand-divider" aria-hidden="true" />
            <button className="top-project-button" onClick={() => { setProjectTrashView(false); setClosingModal(null); setLibraryOpen(true); void refreshProjects() }} title="作品管理">
              <FolderOpen size={15} /><span>作品</span>
            </button>
          </div>
          <div className="document-name">
            <input
              aria-label="作品名称"
              value={project.title}
              onContextMenu={openInputContextMenu}
              onChange={(event) =>
                setProject((current) => ({ ...current, title: event.target.value }))
              }
            />
          </div>
          <div className="top-actions">
            <input
              ref={importInput}
              className="visually-hidden"
              type="file"
              accept=".txt,.md,.docx,.epub,.zili,.zili.json,text/plain,text/markdown,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/epub+zip,application/zip"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  if (/\.zili(?:\.json)?$/i.test(file.name)) void importDocument(file)
                  else if (!hasProject) void importDocument(file, 'new')
                  else setPendingDocumentImport(file)
                }
                event.target.value = ''
              }}
            />
            <button className="icon-button" disabled={importProgress?.phase === 'running'} title="导入 TXT 或 Markdown" aria-label="导入" onClick={() => importInput.current?.click()}>
              <Import size={18} />
            </button>
            <button className="icon-button" title="导出文档" aria-label="导出" onClick={() => void openExportDialog()}>
              <Download size={18} />
            </button>
            <button className="icon-button" title="备份完整项目" aria-label="备份项目" onClick={() => void exportBackup()}>
              <FileArchive size={18} />
            </button>
            <button className="icon-button" title="写作设置" aria-label="写作设置" onClick={() => { setPendingMotionEnabled(preferences.motionEnabled); setClosingModal(null); setSettingsOpen(true) }}>
              <Settings2 size={18} />
            </button>
            <span className="window-controls-divider" />
            <button className="window-control" title="最小化" aria-label="最小化" onClick={() => void runWindowCommand('minimize')}>
              <Minus size={16} strokeWidth={1.7} />
            </button>
            <button className="window-control" title={windowMaximized ? '还原' : '最大化'} aria-label={windowMaximized ? '还原' : '最大化'} onClick={() => void runWindowCommand('maximize')}>
              {windowMaximized ? <span className="restore-icon" /> : <Square size={13} strokeWidth={1.7} />}
            </button>
            <button className="window-control close" title="关闭" aria-label="关闭" onClick={() => void runWindowCommand('close')}>
              <X size={17} strokeWidth={1.7} />
            </button>
          </div>
        </header>
      )}

      <section className="workspace">
        {!focusMode && sidebarOpen && (
          <aside className={`sidebar ${sidebarClosing ? 'is-closing' : ''}`}>
            <div className="sidebar-heading">
              <span>章节</span>
              <div>
                <button className="icon-button small" onClick={() => setSearchOpen((value) => !value)} title="搜索章节">
                  <Search size={16} />
                </button>
                <button className="icon-button small" disabled={!hasProject} onClick={addVolume} title="新建卷">
                  <FolderPlus size={16} />
                </button>
              </div>
            </div>
            {searchOpen && (
              <label className="search-box">
                <Search size={15} />
                <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索章节" />
              </label>
            )}
            <div className="chapter-list">
              {chapterNavigation}
            </div>
            <button className={`story-memory ${assistantOpen && assistantView === 'memory' ? 'active' : ''}`} onClick={() => {
              if (assistantOpen && assistantView === 'memory') {
                if (closingUtilityPanel !== 'assistant') void closeUtilityPanel('assistant')
                return
              }
              setAssistantView('memory')
              setMemoryScope('chapter')
              setMemoryFilter('candidate')
              prepareUtilityPanelOpen('assistant')
            }}>
              <BookOpenText size={17} />
              <span><strong>故事记忆</strong><small>整理人物、设定和剧情</small></span>
            </button>
            <div className="sidebar-tools">
              <button
                className={`sidebar-tools-trigger ${sidebarToolsOpen ? 'active' : ''}`}
                aria-expanded={sidebarToolsOpen}
                aria-haspopup="menu"
                onClick={() => setSidebarToolsOpen((value) => !value)}
              >
                <MoreHorizontal size={17} />
                <span>更多工具</span>
              </button>
              {sidebarToolsOpen && <div className="sidebar-tools-menu" role="menu">
            <button className={`trash-entry ${namingOpen ? 'active' : ''}`} aria-pressed={namingOpen} onClick={() => { setSidebarToolsOpen(false); openNaming() }}>
              <Dices size={16} />
              <span>文化取名</span>
            </button>
            <button className={`trash-entry ${referencesOpen ? 'active' : ''}`} aria-pressed={referencesOpen} onClick={() => { setSidebarToolsOpen(false); void openReferences() }}>
              <BookOpenText size={16} />
              <span>参考文本</span>
            </button>
            <button className={`trash-entry ${assetsOpen ? 'active' : ''}`} aria-pressed={assetsOpen} onClick={() => { setSidebarToolsOpen(false); void openAssets() }}>
              <Images size={16} />
              <span>图片素材</span>
            </button>
            <button className={`trash-entry ${attachmentsOpen ? 'active' : ''}`} aria-pressed={attachmentsOpen} onClick={() => { setSidebarToolsOpen(false); void openAttachments() }}>
              <Paperclip size={16} />
              <span>附件资料</span>
            </button>
            <button className={`trash-entry ${trashOpen ? 'active' : ''}`} aria-pressed={trashOpen} onClick={() => { setSidebarToolsOpen(false); void openTrash() }}>
              <Trash2 size={16} />
              <span>回收站</span>
            </button>
              </div>}
            </div>
          </aside>
        )}

        <section className="writing-area">
          {project.id === '' && (
            <div className="empty-project-overlay">
              <div>
                <img src="/pwa-128.png" alt="" />
                <strong>还没有作品</strong>
                <span>点击左上角「作品」按钮创建或打开一个作品</span>
              </div>
            </div>
          )}
          {!focusMode && (
            <div className="editor-toolbar">
              <button className="icon-button" onClick={() => void toggleSidebar()} title={sidebarOpen ? '收起章节' : '展开章节'}>
                {sidebarOpen ? <PanelLeftClose size={18} /> : <Menu size={18} />}
              </button>
              <div className="chapter-title-wrap">
                <input
                  className="chapter-title"
                  aria-label="章节标题"
                  value={activeChapter.title}
                  onContextMenu={openInputContextMenu}
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      chapters: current.chapters.map((chapter) =>
                        chapter.id === current.activeChapterId
                          ? { ...chapter, title: event.target.value, updatedAt: Date.now() }
                          : chapter,
                      ),
                    }))
                  }
                />
              </div>
              <div className="editor-actions">
                <button className={`icon-button scene-planning-trigger ${scenePanelOpen ? 'active' : ''}`} aria-pressed={scenePanelOpen} onClick={toggleScenePanel} title="场景规划">
                  <ListTree size={17} />
                </button>
                <button className="icon-button" onClick={() => requestImageUpload(true)} title="插入图片">
                  <ImagePlus size={17} />
                </button>
                <button className="icon-button" onClick={() => { setFindOpen(true); window.setTimeout(() => findInput.current?.focus(), 0) }} title="查找替换 (Ctrl+F)">
                  <Search size={17} />
                </button>
                <button className="icon-button" onClick={() => void openHistory()} title="版本历史">
                  <History size={17} />
                </button>
                <button className="focus-button" onClick={() => setFocusMode(true)} title="进入专注模式 (Ctrl+Shift+F)">
                  <Focus size={17} />
                  <span>专注</span>
                </button>
              </div>
            </div>
          )}

          {scenePanelOpen && !focusMode && activeScene && (
            <section className={`scene-planning-panel ${scenePanelClosing ? 'is-closing' : ''}`} aria-label="场景规划">
              <div className="scene-planning-title">
                <ListTree size={16} />
                <input
                  aria-label="场景名称"
                  value={activeScene.title}
                  onContextMenu={openInputContextMenu}
                  onChange={(event) => setProject((current) => ({
                    ...current,
                    scenes: current.scenes.map((scene) => scene.id === current.activeSceneId
                      ? { ...scene, title: event.target.value, updatedAt: Date.now() }
                      : scene),
                  }))}
                />
              </div>
              <label><span>目标</span><input value={activeScene.goal} placeholder="这一场要推进什么" onChange={(event) => setProject((current) => ({
                ...current,
                scenes: current.scenes.map((scene) => scene.id === current.activeSceneId
                  ? { ...scene, goal: event.target.value, updatedAt: Date.now() }
                  : scene),
              }))} /></label>
              <label className="scene-notes"><span>备注</span><textarea value={activeScene.notes} placeholder="人物状态、线索或待处理事项" onChange={(event) => setProject((current) => ({
                ...current,
                scenes: current.scenes.map((scene) => scene.id === current.activeSceneId
                  ? { ...scene, notes: event.target.value, updatedAt: Date.now() }
                  : scene),
              }))} /></label>
              <div className="scene-range-control">
                <span>正文范围</span>
                <button onClick={() => void setActiveSceneRangeFromSelection()} title="使用正文当前选区设定场景范围"><LocateFixed size={14} />使用当前选区</button>
                <small>{activeScene.startNodeId && activeScene.endNodeId ? '已定位到稳定段落' : '尚未定位'}</small>
              </div>
              <label className="scene-summary"><span>摘要</span><textarea value={activeScene.summary} placeholder="本场发生了什么，可由作者修改" onChange={(event) => setProject((current) => ({
                ...current,
                scenes: current.scenes.map((scene) => scene.id === current.activeSceneId
                  ? { ...scene, summary: event.target.value, updatedAt: Date.now() }
                  : scene),
              }))} /></label>
              <button className="icon-button small" onClick={() => void closeScenePanel()} title="收起场景规划"><X size={16} /></button>
            </section>
          )}

          {selectedImage && !focusMode && !findOpen && !scenePanelOpen && (
            <div className="image-format-toolbar" role="toolbar" aria-label="图片格式">
              <span>图片</span>
              <div className="image-align-control" aria-label="图片对齐">
                <button className={selectedImage.align === 'left' ? 'active' : ''} onClick={() => updateSelectedImage({ align: 'left' })} title="左对齐"><AlignLeft size={15} /></button>
                <button className={selectedImage.align === 'center' ? 'active' : ''} onClick={() => updateSelectedImage({ align: 'center' })} title="居中"><AlignCenter size={15} /></button>
                <button className={selectedImage.align === 'right' ? 'active' : ''} onClick={() => updateSelectedImage({ align: 'right' })} title="右对齐"><AlignRight size={15} /></button>
              </div>
              <WheelSelect ariaLabel="图片尺寸" value={selectedImage.width} options={[{ value: '40', label: '40%' }, { value: '60', label: '60%' }, { value: '80', label: '80%' }, { value: '100', label: '100%' }]} onChange={(value) => updateSelectedImage({ width: value as ImageSettings['width'] })} />
              <input aria-label="图片说明" value={selectedImage.caption} onChange={(event) => updateSelectedImage({ caption: event.target.value }, false)} placeholder="添加图片说明" />
            </div>
          )}

          {findOpen && !focusMode && (
            <div className="find-panel">
              <div className="find-line">
                <input ref={findInput} value={findQuery} onChange={(event) => setFindQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') findNext() }} placeholder="查找" />
                <span>{findCount} 处</span>
                <button onClick={findNext}>下一个</button>
                <button className="icon-button small" onClick={() => setFindOpen(false)} title="关闭查找"><X size={16} /></button>
              </div>
              <div className="find-line">
                <input value={replaceText} onChange={(event) => setReplaceText(event.target.value)} placeholder="替换为" />
                <button onClick={replaceCurrent}>替换</button>
                <button onClick={replaceAll}>全部替换</button>
              </div>
            </div>
          )}

          {recoveryNotice && !focusMode && (
            <div className="recovery-banner">
              <CheckCircle2 size={16} />
              <span>已恢复上次未及时保存的内容</span>
              <button className="icon-button small" onClick={() => setRecoveryNotice(false)} title="关闭提示"><X size={15} /></button>
            </div>
          )}

          {focusMode && (
            <button className="exit-focus" onClick={() => setFocusMode(false)} title="退出专注模式 (Esc)">
              <ChevronLeft size={18} />
              <span>退出专注</span>
            </button>
          )}

          <div
            className="paper"
            ref={paperRef}
            onScroll={(event) => {
              queueEditorViewSave(activeChapterIdRef.current, { scrollTop: event.currentTarget.scrollTop })
              updatePaperScrollState(event.currentTarget)
            }}
          >
            <EditorContent editor={editor} />
            {activeDraftPreview?.status === 'candidate' && activeDraftPreviewTask.targetAction === 'new_chapter' && (
              <section className="agent-new-chapter-preview" data-draft-preview-id={activeDraftPreview.id}>
                <header>
                  <strong>{activeDraftPreviewTask.targetChapterTitle || '新章节'}</strong>
                  <span>{activeDraftPreviewVolume?.title ?? '当前卷'} · 插入在{activeDraftPreviewSourceChapter?.title ?? '当前章节'}之后</span>
                  <small>写作目标：{activeDraftPreview.validation.goalCoverage || activeDraftPreviewTask.request || '按本次对话要求续写'}</small>
                </header>
                <div>{activeDraftPreview.text}</div>
              </section>
            )}
          </div>

          {activeDraftPreview?.status === 'candidate' && (
            <div className="agent-inline-review" role="region" aria-label="AI 正文差异确认">
              <div>
                <strong>{activeDraftPreview.title}</strong>
                <span><i className="addition" />新增</span>
                {activeDraftPreview.mode === 'rewrite' && <span><i className="deletion" />删除</span>}
              </div>
              <div>
                <button disabled={acceptingDraftId === activeDraftPreview.id} onClick={() => void rejectDraftCandidate(activeDraftPreview)}>放弃</button>
                <button className="accept" disabled={acceptingDraftId === activeDraftPreview.id} onClick={() => void acceptDraftCandidate(activeDraftPreview)}>{acceptingDraftId === activeDraftPreview.id ? '写入中…' : '确认写入'}</button>
                <button className="icon-button small" onClick={() => setPreviewDraftId(null)} title="关闭差异预览"><X size={15} /></button>
              </div>
            </div>
          )}

          {paperScrollState.scrollable && (
            <div className={`document-jump-buttons ${activeDraftPreview ? 'with-draft-preview' : ''}`} aria-label="正文快速跳转">
              <button disabled={paperScrollState.atTop} onClick={() => jumpToDocumentEdge('top')} title="跳到文首" aria-label="跳到文首">
                <ArrowUpToLine size={17} />
              </button>
              <button disabled={paperScrollState.atBottom} onClick={() => jumpToDocumentEdge('bottom')} title="跳到文尾" aria-label="跳到文尾">
                <ArrowDownToLine size={17} />
              </button>
            </div>
          )}

          {!focusMode && (
            <nav className="mobile-tool-dock" aria-label="写作工具">
              <button className={namingOpen ? 'active' : ''} aria-pressed={namingOpen} onClick={openNaming} title="文化取名"><Dices size={17} /><span>取名</span></button>
              <button aria-pressed={sidebarOpen} onClick={() => void toggleSidebar()} title="章节"><Menu size={17} /><span>章节</span></button>
              <button className={assetsOpen ? 'active' : ''} aria-pressed={assetsOpen} onClick={() => void openAssets()} title="图片"><Images size={17} /><span>图片</span></button>
              <button className={attachmentsOpen ? 'active' : ''} aria-pressed={attachmentsOpen} onClick={() => void openAttachments()} title="资料"><Paperclip size={17} /><span>资料</span></button>
              <button className={referencesOpen ? 'active' : ''} aria-pressed={referencesOpen} onClick={() => void openReferences()} title="参考"><BookOpenText size={17} /><span>参考</span></button>
            </nav>
          )}

          {importProgress && (
            <div className={`import-progress ${importProgress.phase}`} role="status" aria-live="polite">
              {importProgress.phase === 'running' ? <RefreshCw size={13} /> : importProgress.phase === 'complete' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span>{importProgress.message}</span>
              {importProgress.total > 0 && <strong>{Math.min(importProgress.current, importProgress.total)}/{importProgress.total}</strong>}
              {importProgress.phase === 'running' && importProgress.total > 0 && <i><b style={{ width: `${Math.max(0, Math.min(1, importProgress.current / importProgress.total)) * 100}%` }} /></i>}
            </div>
          )}

          <footer className={`statusbar ${focusMode ? 'focus-statusbar' : ''}`}>
            {!focusMode && (
              <span className="cursor-position">
                第 {cursorPosition.paragraph} 段 · 第 {cursorPosition.character} 字
                {cursorPosition.selected > 0 ? ` · 已选 ${cursorPosition.selected} 字` : ''}
              </span>
            )}
            <span className="status-summary">
              <button
                className={`ai-task-center-trigger ${aiTasks.some((task) => task.status === 'running') ? 'is-running' : ''}`}
                title="AI 任务中心"
                aria-label="AI 任务中心"
                aria-expanded={aiTaskCenterOpen}
                onClick={() => setAiTaskCenterOpen((current) => !current)}
              >
                <ListTodo size={13} />
                {aiTasks.some((task) => task.status === 'running') && <span>{aiTasks.filter((task) => task.status === 'running').length}</span>}
              </button>
              {preferences.timerEnabled && <span className="writing-timer">本次 {formatElapsedTime(elapsedSeconds)}</span>}
              {preferences.wordGoalEnabled && (
                <span className={wordCount >= preferences.wordGoal ? 'word-goal is-complete' : 'word-goal'}>
                  目标 {wordCount} / {preferences.wordGoal}
                </span>
              )}
              {!focusMode && (
                <span className={`save-state ${saveState}`} title={lastSavedAt ? `最近保存：${new Date(lastSavedAt).toLocaleTimeString()}` : undefined}>
                  {saveState === 'saved' ? '已保存' : saveState === 'saving' ? '保存中' : '保存失败'}
                </span>
              )}
              {!focusMode && backupState !== 'idle' && (
                <span className={`backup-state ${backupState}`} title={backupMessage}>
                  {backupState === 'saving' ? '备份中' : backupState === 'saved' ? '备份完成' : '备份失败'}
                </span>
              )}
              {!preferences.wordGoalEnabled && <span>{wordCount} 字</span>}
            </span>
          </footer>

          <input
            ref={imageInput}
            className="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void uploadImage(file)
              event.target.value = ''
            }}
          />
          <input
            ref={agentImageInput}
            className="visually-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void uploadAgentImage(file)
              event.target.value = ''
            }}
          />
          <input
            ref={attachmentInput}
            className="visually-hidden"
            type="file"
            accept=".pdf,.docx,.txt,.md,.json,.epub,.csv,.rtf"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void uploadAttachment(file)
              event.target.value = ''
            }}
          />
          <input
            ref={referenceInput}
            className="visually-hidden"
            type="file"
            accept=".txt,.md,.docx,.epub,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/epub+zip"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void uploadReference(file)
              event.target.value = ''
            }}
          />

          {!focusMode && !assistantOpen && !namingOpen && !historyOpen && !trashOpen && !assetsOpen && !attachmentsOpen && !referencesOpen && (
            <button className="assistant-trigger" aria-label="字里助手" onClick={openAgentAssistant}>
              <Sparkles size={17} />
              <span>字里助手</span>
            </button>
          )}
          {aiTaskCenterOpen && (
            <section className="ai-task-center" aria-label="AI 任务中心">
              <header>
                <div><ListTodo size={15} /><strong>AI 任务</strong></div>
                <button className="icon-button small" title="关闭任务中心" onClick={() => setAiTaskCenterOpen(false)}><X size={15} /></button>
              </header>
              <div className="ai-task-list">
                {aiTasks.length === 0 && <p>还没有 AI 任务</p>}
                {aiTasks.slice(0, 12).map((task) => <article className={task.status} key={task.id}>
                  <div className="ai-task-icon">{task.status === 'running' ? <RefreshCw size={14} /> : task.status === 'completed' ? <CheckCircle2 size={14} /> : task.status === 'cancelled' ? <CircleStop size={14} /> : <AlertTriangle size={14} />}</div>
                  <div>
                    <strong>{task.label}</strong>
                    <span>{task.detail}</span>
                    <small>{task.status === 'running' ? '进行中' : task.status === 'completed' ? '已完成' : task.status === 'cancelled' ? '已停止' : task.status === 'interrupted' ? '上次运行已中断' : '失败'} · {new Date(task.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</small>
                    {task.progress !== null && <i><b style={{ width: `${Math.max(0, Math.min(1, task.progress)) * 100}%` }} /></i>}
                  </div>
                  <footer>
                    {task.status === 'running' && <button title="停止任务" onClick={() => stopAiTask(task)}><Square size={12} /></button>}
                    {['failed', 'cancelled', 'interrupted'].includes(task.status) && task.retryInput && <button title="重试任务" disabled={agentBusy} onClick={() => retryAiTask(task)}><RefreshCw size={12} /></button>}
                  </footer>
                </article>)}
              </div>
              {aiTasks.some((task) => task.status !== 'running') && <footer><button onClick={() => replaceAiTasks((current) => current.filter((task) => task.status === 'running'))}>清除已结束任务</button></footer>}
            </section>
          )}
        </section>

        {(assistantOpen || namingOpen) && (
          <aside className={`assistant-panel ${namingOpen ? 'naming-panel' : ''} ${focusMode ? 'focus-overlay' : ''} ${closingUtilityPanel === 'assistant' || closingUtilityPanel === 'naming' ? 'is-closing' : ''}`}>
            <div className="assistant-header">
              <div>{assistantView === 'memory' ? <BookOpenText size={17} /> : assistantView === 'qa' ? <MessageSquareText size={17} /> : assistantView === 'draft' ? <Pencil size={17} /> : assistantView === 'review' ? <CheckCircle2 size={17} /> : assistantView === 'tools' ? <ListTree size={17} /> : assistantView === 'naming' ? <Dices size={17} /> : <Sparkles size={17} />}<strong>{assistantView === 'memory' ? '故事记忆' : assistantView === 'qa' ? '询问作品' : assistantView === 'advisor' ? '创作顾问' : assistantView === 'draft' ? '候选文本' : assistantView === 'review' ? '审稿中心' : assistantView === 'tools' ? '创作工具' : assistantView === 'naming' ? '文化取名' : '字里助手'}</strong></div>
              <div className="assistant-header-actions">
                {assistantView === 'memory' && <button className="icon-button small" onClick={() => { captureAgentSelection(); setAssistantView('assistant') }} title="转到字里助手，后台分析会继续"><Sparkles size={16} /></button>}
                {assistantView === 'assistant' && <button className="icon-button small" onClick={() => { setAssistantView('memory'); setMemoryScope('chapter'); setMemoryFilter('candidate') }} title="查看故事记忆，Agent 对话会继续"><BookOpenText size={16} /></button>}
                <button className="icon-button small" onClick={() => void closeUtilityPanel('assistant')} title={namingOpen ? '关闭文化取名' : '关闭面板，后台 AI 任务会继续'}><X size={17} /></button>
              </div>
            </div>
            {assistantView !== 'naming' && <div className="assistant-context">
              <small>当前上下文</small>
              <strong>{assistantView === 'qa' || assistantView === 'tools' || (assistantView === 'review' && ['range', 'project'].includes(reviewScope)) ? project.title : activeChapter.title}</strong>
              <span>{assistantView === 'qa' || assistantView === 'tools' || (assistantView === 'review' && ['range', 'project'].includes(reviewScope)) ? `${project.chapters.length} 章 · 当前 ${activeChapter.title}` : `${wordCount} 字 · ${activeScene?.title ?? '本章正文'}`}</span>
            </div>}
            {assistantView !== 'naming' && <div className="ai-data-scope">
              <div><span>当前模型</span><small title={aiSettings.model || '尚未配置模型'}>{aiSettings.model || '尚未配置'}</small></div>
            </div>}
            {Object.entries(aiStreamProgressByTask).map(([taskType, receivedCharacters]) => <div className="ai-stream-progress" key={taskType}><RefreshCw size={12} />{aiProgressLabel(taskType)} · {receivedCharacters > 0 ? `正在接收并校验 · ${receivedCharacters.toLocaleString('zh-CN')} 字符` : '正在等待模型开始返回'}</div>)}
            {assistantView === 'memory' ? (
              <div className="memory-panel-content">
                <div className="memory-scope-tabs">
                  <button className={memoryScope === 'chapter' ? 'active' : ''} onClick={() => setMemoryScope('chapter')}>当前章</button>
                  <button className={memoryScope === 'project' ? 'active' : ''} onClick={() => void loadProjectMemoryIndex()}>全书资料</button>
                  <button className={memoryScope === 'timeline' ? 'active' : ''} onClick={() => void loadProjectMemoryIndex('timeline')}>时间线</button>
                  <button className={memoryScope === 'characters' ? 'active' : ''} onClick={() => void loadProjectMemoryIndex('characters')}>人物</button>
                  <button className={memoryScope === 'threads' ? 'active' : ''} onClick={() => void loadProjectMemoryIndex('threads')}>线索任务</button>
                  <button className={memoryScope === 'digests' ? 'active' : ''} onClick={() => void loadProjectMemoryIndex('digests')}>分层摘要</button>
                  <button className={memoryScope === 'consistency' ? 'active' : ''} onClick={() => void loadProjectMemoryIndex('consistency')}>一致性</button>
                </div>
                {memoryMessage && <p className="memory-message">{memoryMessage}</p>}
                {memoryScope === 'chapter' ? (<div className="memory-chapter-scroll" ref={memoryChapterScrollRef}>
                  <div className="memory-toolbar">
                    <button disabled={memoryLoading || (!memoryAnalyzing && !activeChapter.plainText.trim())} onClick={() => void runChapterMemoryAnalysis()}>
                      <Sparkles size={15} />{memoryAnalyzing ? '停止分析' : memoryBundle.memory ? '重新分析本章' : '分析本章'}
                    </button>
                    <button className="secondary" disabled={memoryAnalyzing} onClick={() => setManualMemoryDraft((current) => current ?? { kind: 'character', title: '', detail: '' })}><Plus size={14} />手动添加</button>
                    <button className={`secondary compact ${memoryBatchRangeOpen ? 'active' : ''}`} disabled={memoryAnalyzing} aria-label={memoryBatchRangeOpen ? '收起批量分析范围' : '展开批量分析范围'} title={memoryBatchRangeOpen ? '收起批量分析范围' : '批量分析章节'} onClick={() => setMemoryBatchRangeOpen((current) => !current)}><ListTree size={14} /></button>
                    {memoryBundle.memory && <span>{memoryBundle.memory.contentHash === activeChapter.contentHash ? '与正文同步' : '正文已修改，建议更新'}</span>}
                  </div>
                  {memoryBatchRangeOpen && <div className="memory-range-toolbar">
                    <WheelSelect ariaLabel="批量分析起始章节" value={memoryRangeStartId} options={project.chapters.map((chapter) => ({ value: chapter.id, label: chapter.title }))} onChange={setMemoryRangeStartId} />
                    <span>至</span>
                    <WheelSelect ariaLabel="批量分析结束章节" value={memoryRangeEndId} options={project.chapters.map((chapter) => ({ value: chapter.id, label: chapter.title }))} onChange={setMemoryRangeEndId} />
                    <button disabled={memoryLoading} onClick={() => void runChapterMemoryBatchAnalysis()}>{memoryAnalyzing ? '停止' : '批量分析'}</button>
                  </div>}
                  {memoryBatchProgress && <p className="memory-batch-progress">{memoryBatchProgress}</p>}
                  {manualMemoryDraft && <div className="memory-manual-form">
                    <WheelSelect ariaLabel="手动资料类型" value={manualMemoryDraft.kind} options={Object.entries(MEMORY_KIND_LABELS).map(([value, label]) => ({ value, label }))} onChange={(value) => setManualMemoryDraft((current) => current ? { ...current, kind: value as MemoryCandidate['kind'] } : current)} />
                    <input aria-label="手动资料标题" value={manualMemoryDraft.title} placeholder="例如：卡特·兰尼斯" onChange={(event) => setManualMemoryDraft((current) => current ? { ...current, title: event.target.value } : current)} />
                    <textarea aria-label="手动资料内容" value={manualMemoryDraft.detail} placeholder="记录身份、性格、能力、关系或其他持续有效的设定" onChange={(event) => setManualMemoryDraft((current) => current ? { ...current, detail: event.target.value } : current)} />
                    <footer><button onClick={() => setManualMemoryDraft(null)}>取消</button><button className="confirm" onClick={() => void addManualMemoryCandidate()}>加入待确认</button></footer>
                  </div>}
                  {!aiApiKey.trim() && (
                    <div className="memory-config-notice">
                      <span>配置 AI 服务后才能分析正文，已有资料仍可离线查看。</span>
                      <button onClick={() => {
                        setPendingMotionEnabled(preferences.motionEnabled)
                        setSettingsCategory('ai')
                        setClosingModal(null)
                        setSettingsOpen(true)
                      }}>AI 服务设置</button>
                    </div>
                  )}
                  {memoryLoading ? <p className="memory-empty">正在读取故事记忆…</p> : memoryBundle.memory || memoryBundle.candidates.length > 0 ? (<>
                    {memoryBundle.memory ? <section className={`chapter-memory-summary ${memorySummaryCollapsible ? 'is-collapsible' : ''} ${memorySummaryExpanded ? 'is-expanded' : ''}`}>
                      <div><strong>本章摘要</strong><span>{new Date(memoryBundle.memory.analyzedAt).toLocaleString('zh-CN')}</span>{memorySummaryCollapsible && <button className="memory-summary-toggle" aria-label={memorySummaryExpanded ? '收起本章摘要' : '展开本章摘要'} title={memorySummaryExpanded ? '收起本章摘要' : '展开本章摘要'} onClick={() => setMemorySummaryExpanded((current) => !current)}><ChevronDown size={14} /></button>}</div>
                      <p>{displayedMemorySummary}</p>
                    </section> : <section className="chapter-memory-summary author-memory-summary"><div><strong>作者补充设定</strong><span>尚未分析本章正文</span></div><p>这里的资料来自作者手动添加或在助手对话中明确确认，不伪装成正文证据。</p></section>}
                    <div className="memory-filters">
                      {([['candidate', '待确认'], ['archived', '自动归档'], ['confirmed', '已确认'], ['stale', '待复核'], ['rejected', '已否决']] as const).map(([status, label]) => (
                        <button key={status} className={memoryFilter === status ? 'active' : ''} onMouseDown={lockMemoryFilterPosition} onClick={(event) => { lockMemoryFilterPosition(event); setMemoryFilter(status) }}>
                          {label}<span>{memoryBundle.candidates.filter((candidate) => candidate.status === status).length}</span>
                        </button>
                      ))}
                    </div>
                    <div className="memory-candidate-list" ref={memoryCandidateListRef}>
                      {memoryBundle.candidates.filter((candidate) => candidate.status === memoryFilter).length === 0 && <p className="memory-empty">这一分类还没有资料</p>}
                      {memoryBundle.candidates.filter((candidate) => candidate.status === memoryFilter).map((candidate) => (
                        <article className={`memory-candidate ${candidate.status === 'stale' ? 'is-stale' : ''}`} key={candidate.id}>
                          <div className="memory-candidate-meta"><span>{MEMORY_KIND_LABELS[candidate.kind]}{candidate.metadata.archivalSource === 'author' ? ' · 作者设定' : candidate.status === 'stale' ? ' · 正文已变更' : candidate.metadata.archivalSource === 'automatic' ? ' · 自动归档' : ''}</span><small>{candidate.status === 'stale' ? '重新分析后复核' : `可信度 ${Math.round(candidate.confidence * 100)}%`}</small></div>
                          <input aria-label="资料标题" value={candidate.title} onChange={(event) => editMemoryCandidate(candidate.id, { title: event.target.value })} onBlur={() => void commitMemoryCandidate(candidate)} onContextMenu={openInputContextMenu} />
                          <textarea aria-label="资料内容" value={candidate.detail} onChange={(event) => editMemoryCandidate(candidate.id, { detail: event.target.value })} onBlur={() => void commitMemoryCandidate(candidate)} />
                          <button className={`memory-candidate-details-toggle ${expandedMemoryCandidateId === candidate.id ? 'active' : ''}`} aria-expanded={expandedMemoryCandidateId === candidate.id} onClick={() => setExpandedMemoryCandidateId((current) => current === candidate.id ? null : candidate.id)}><Settings2 size={13} /><span>资料属性</span><ChevronDown size={13} /></button>
                          {expandedMemoryCandidateId === candidate.id && <>
                            <div className="memory-candidate-metadata">
                            <label><span>信息性质</span><WheelSelect ariaLabel="信息性质" value={candidate.metadata.nature} options={Object.entries(MEMORY_NATURE_LABELS).map(([value, label]) => ({ value, label }))} onChange={(value) => void commitMemoryCandidateMetadata(candidate, { nature: value as MemoryCandidateMetadata['nature'] })} /></label>
                            {candidate.kind === 'character_state' && <>
                              <label><span>状态人物</span><input value={candidate.metadata.subject} placeholder="人物名称" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { subject: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { subject: event.target.value })} /></label>
                              <label><span>状态维度</span><input value={candidate.metadata.stateAspect} placeholder="位置、伤势、能力等" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { stateAspect: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { stateAspect: event.target.value })} /></label>
                              <label><span>当前状态</span><input value={candidate.metadata.stateValue} placeholder="本章结束时的状态" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { stateValue: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { stateValue: event.target.value })} /></label>
                              <label><span>此前状态</span><input value={candidate.metadata.previousStateValue} placeholder="正文明确说明时填写" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { previousStateValue: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { previousStateValue: event.target.value })} /></label>
                            </>}
                            <label><span>生效章节</span><WheelSelect ariaLabel="生效章节" value={candidate.metadata.validFromChapterId} options={project.chapters.map((chapter) => ({ value: chapter.id, label: chapter.title }))} onChange={(value) => void commitMemoryCandidateMetadata(candidate, { validFromChapterId: value })} /></label>
                            <label><span>失效章节</span><WheelSelect ariaLabel="失效章节" value={candidate.metadata.validToChapterId ?? ''} options={[{ value: '', label: '仍然有效' }, ...project.chapters.map((chapter) => ({ value: chapter.id, label: chapter.title }))]} onChange={(value) => void commitMemoryCandidateMetadata(candidate, { validToChapterId: value || null })} /></label>
                            {candidate.metadata.nature !== 'objective' && <label><span>知情角色</span><input value={candidate.metadata.knower} placeholder="可留空" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { knower: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { knower: event.target.value })} /></label>}
                            {['foreshadowing', 'commitment', 'secret', 'plot'].includes(candidate.kind) && <label><span>生命周期</span><WheelSelect ariaLabel="生命周期" value={candidate.metadata.lifecycle} options={Object.entries(MEMORY_LIFECYCLE_LABELS).map(([value, label]) => ({ value, label }))} onChange={(value) => void commitMemoryCandidateMetadata(candidate, { lifecycle: value as MemoryCandidateMetadata['lifecycle'] })} /></label>}
                            {['foreshadowing', 'commitment', 'secret', 'plot'].includes(candidate.kind) && <>
                              <label><span>负责人/知情者</span><input value={candidate.metadata.responsibleParty} placeholder="可留空" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { responsibleParty: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { responsibleParty: event.target.value })} /></label>
                              <label><span>目标或指向</span><input value={candidate.metadata.target} placeholder="任务、威胁或伏笔目标" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { target: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { target: event.target.value })} /></label>
                            </>}
                            <label><span>故事内时间</span><input value={candidate.metadata.storyTime} placeholder="如：三天后、冬至清晨" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { storyTime: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { storyTime: event.target.value })} /></label>
                            <label><span>时间精度</span><WheelSelect ariaLabel="时间精度" value={candidate.metadata.storyTimePrecision} options={[{ value: 'unknown', label: '未说明' }, { value: 'relative', label: '相对时间' }, { value: 'approximate', label: '大致时间' }, { value: 'exact', label: '明确时间' }]} onChange={(value) => void commitMemoryCandidateMetadata(candidate, { storyTimePrecision: value as MemoryCandidateMetadata['storyTimePrecision'] })} /></label>
                            <label><span>参与人物</span><input value={candidate.metadata.participants} placeholder="顿号分隔" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { participants: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { participants: event.target.value })} /></label>
                            <label><span>发生地点</span><input value={candidate.metadata.location} placeholder="可留空" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { location: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { location: event.target.value })} /></label>
                            <label><span>影响范围</span><input value={candidate.metadata.affectedScope} placeholder="人物、关系、剧情线或规则" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { affectedScope: event.target.value })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { affectedScope: event.target.value })} /></label>
                            {['character', 'location', 'organization', 'item', 'world'].includes(candidate.kind) && <label><span>实体别名</span><input value={candidate.metadata.aliases.join('、')} placeholder="顿号分隔" onChange={(event) => editMemoryCandidateMetadata(candidate.id, { aliases: event.target.value.split(/[、,，]/).map((value) => value.trim()).filter(Boolean).slice(0, 20) })} onBlur={(event) => void commitMemoryCandidateMetadata(candidate, { aliases: event.target.value.split(/[、,，]/).map((value) => value.trim()).filter(Boolean).slice(0, 20) })} /></label>}
                              <div className="memory-candidate-static-field"><span>首次出现</span><strong>{project.chapters.find((chapter) => chapter.id === (candidate.metadata.firstSeenChapterId || candidate.chapterId))?.title ?? '未知章节'}</strong></div>
                            </div>
                            {['character', 'location', 'organization', 'item', 'world'].includes(candidate.kind) && <div className="memory-entity-merge">
                              <span>{candidate.metadata.entityId ? `实体 ${candidate.metadata.entityId.slice(0, 8)}` : '尚未归入实体'}</span>
                              <WheelSelect ariaLabel="合并目标实体" value={memoryMergeTargets[candidate.id] ?? ''} options={[{ value: '', label: '选择已有实体' }, ...mergeableEntityCandidates.filter((target) => target.kind === candidate.kind && target.id !== candidate.id && (target.metadata.entityId || target.id) !== (candidate.metadata.entityId || candidate.id)).map((target) => ({ value: target.id, label: `${target.title} · ${project.chapters.find((chapter) => chapter.id === target.chapterId)?.title ?? '未知章节'}` }))]} onChange={(value) => setMemoryMergeTargets((current) => ({ ...current, [candidate.id]: value }))} />
                              <button disabled={!memoryMergeTargets[candidate.id]} onClick={() => void mergeMemoryCandidateEntity(candidate)}>合并</button>
                            </div>}
                          </>}
                          <blockquote><span>{candidate.metadata.archivalSource === 'author' ? '设定来源' : '原文证据'}</span>{candidate.evidenceQuote}</blockquote>
                          <small className="memory-evidence-meta">{candidate.metadata.archivalSource === 'author' ? '作者手动添加或在助手对话中明确确认' : <>{candidate.metadata.sceneId ? `${project.scenes.find((scene) => scene.id === candidate.metadata.sceneId)?.title ?? '场景'} · ` : ''}正文版本 {candidate.metadata.sourceRevisionNumber || activeChapter.revisionNumber}</>}</small>
                          <div className="memory-candidate-actions">
                            {candidate.status === 'stale'
                              ? <button onClick={() => void runChapterMemoryAnalysis()}><Sparkles size={14} />重新分析</button>
                              : candidate.status !== 'confirmed' && <button onClick={() => void commitMemoryCandidate(candidate, 'confirmed')}><CheckCircle2 size={14} />确认</button>}
                            {candidate.status !== 'rejected' && <button className="reject" onClick={() => void commitMemoryCandidate(candidate, 'rejected')}><X size={14} />否决</button>}
                          </div>
                        </article>
                      ))}
                    </div>
                  </>) : <p className="memory-empty">本章还没有故事记忆，分析后会先生成可检查的候选资料。</p>}
                </div>) : memoryScope === 'characters' ? (<>
                  <div className="project-memory-toolbar">
                    <input value={memorySearch} onChange={(event) => setMemorySearch(event.target.value)} placeholder="搜索人物、档案、关系或轨迹" onContextMenu={openInputContextMenu} />
                    <span>{characterMemoryProfiles.length} 人</span>
                  </div>
                  {projectMemoryLoading ? <p className="memory-empty">正在汇总人物资料…</p> : characterMemoryProfiles.length === 0 ? <p className="memory-empty">还没有已确认的人物资料。分析并确认人物、人物状态或关系后，这里会形成可追溯的人物档案。</p> : selectedCharacterProfile && (
                    <div className="character-memory-workspace">
                      <aside className="character-directory" aria-label="人物列表">
                        {characterMemoryProfiles.map((profile) => <button className={selectedCharacterProfile.id === profile.id ? 'active' : ''} key={profile.id} onClick={() => setSelectedCharacterProfileId(profile.id)}>
                          <strong>{profile.name}</strong>
                          <small>{profile.aliases.length > 0 ? profile.aliases.slice(0, 2).join('、') : `${profile.evidenceCount} 条证据`}</small>
                        </button>)}
                      </aside>
                      <section className="character-memory-detail">
                        <header>
                          <div><strong>{selectedCharacterProfile.name}</strong><small>首次见于 {project.chapters.find((chapter) => chapter.id === selectedCharacterProfile.firstSeenChapterId)?.title ?? '未知章节'}</small></div>
                          <span>{selectedCharacterProfile.evidenceCount} 条证据</span>
                        </header>
                        {selectedCharacterProfile.aliases.length > 0 && <p className="character-memory-aliases">别名：{selectedCharacterProfile.aliases.join('、')}</p>}
                        <nav className="character-detail-tabs" role="tablist" aria-label="人物资料分类">
                          {([['profile', '档案'], ['state', '状态'], ['relationships', '关系'], ['timeline', '轨迹']] as const).map(([section, label]) => <button role="tab" aria-selected={characterDetailSection === section} className={characterDetailSection === section ? 'active' : ''} key={section} onClick={() => setCharacterDetailSection(section)}>{label}</button>)}
                        </nav>
                        <div className="character-detail-content">
                          {characterDetailSection === 'profile' && (selectedCharacterProfile.facts.length > 0 ? selectedCharacterProfile.facts.map((fact) => {
                            const chapter = project.chapters.find((item) => item.id === fact.chapterId)
                            return <article className="character-memory-entry" key={fact.candidate.id}>
                              <div><span>{fact.category}</span><small>{chapter?.title ?? '未知章节'}</small></div>
                              <p>{fact.value}</p>
                              <button onClick={() => void openAnswerCitation({ evidenceId: fact.candidate.id, chapterId: fact.candidate.chapterId, chapterTitle: chapter?.title ?? '未知章节', nodeId: fact.candidate.evidenceNodeId, quote: fact.candidate.evidenceQuote, claim: fact.candidate.detail })}>查看原文</button>
                            </article>
                          }) : <p className="memory-inline-empty">还没有已确认的身份、外貌、背景、性格、能力或长期动机资料。</p>)}
                          {characterDetailSection === 'state' && (selectedCharacterProfile.states.length > 0 ? selectedCharacterProfile.states.map((state) => {
                            const chapter = project.chapters.find((item) => item.id === state.chapterId)
                            return <article className="character-memory-entry" key={`${selectedCharacterProfile.id}-${state.aspect}`}>
                              <div><span>{state.aspect}</span><small>{chapter?.title ?? '未知章节'}</small></div>
                              <p>{state.value}</p>
                              {state.previousValue && <small className="character-previous-value">此前：{state.previousValue}</small>}
                              <button onClick={() => void openAnswerCitation({ evidenceId: state.candidate.id, chapterId: state.candidate.chapterId, chapterTitle: chapter?.title ?? '未知章节', nodeId: state.candidate.evidenceNodeId, quote: state.candidate.evidenceQuote, claim: state.candidate.detail })}>查看原文</button>
                            </article>
                          }) : <p className="memory-inline-empty">尚未确认位置、伤势、持有物、阵营、情绪或当前目标等动态状态。</p>)}
                          {characterDetailSection === 'relationships' && (selectedCharacterProfile.relationships.length > 0 ? selectedCharacterProfile.relationships.map((relationship) => {
                            const chapter = project.chapters.find((item) => item.id === relationship.chapterId)
                            return <article className="character-memory-entry" key={`${selectedCharacterProfile.id}-${relationship.candidate.id}`}>
                              <div><span>{relationship.counterparts.length > 0 ? relationship.counterparts.join('、') : relationship.title}</span><small>{chapter?.title ?? '未知章节'}</small></div>
                              <strong>{relationship.title}</strong>
                              <p>{relationship.value}</p>
                              <button onClick={() => void openAnswerCitation({ evidenceId: relationship.candidate.id, chapterId: relationship.candidate.chapterId, chapterTitle: chapter?.title ?? '未知章节', nodeId: relationship.candidate.evidenceNodeId, quote: relationship.candidate.evidenceQuote, claim: relationship.candidate.detail })}>查看原文</button>
                            </article>
                          }) : <p className="memory-inline-empty">还没有与其他人物关联的已确认关系资料。</p>)}
                          {characterDetailSection === 'timeline' && (selectedCharacterProfile.timeline.length > 0 ? selectedCharacterProfile.timeline.map((state) => {
                            const chapter = project.chapters.find((item) => item.id === state.chapterId)
                            return <article className="character-memory-entry character-timeline-entry" key={`${selectedCharacterProfile.id}-timeline-${state.candidate.id}`}>
                              <div><span>{state.aspect}</span><small>{chapter?.title ?? '未知章节'}</small></div>
                              <p>{state.previousValue ? `${state.previousValue} → ${state.value}` : state.value}</p>
                              <button onClick={() => void openAnswerCitation({ evidenceId: state.candidate.id, chapterId: state.candidate.chapterId, chapterTitle: chapter?.title ?? '未知章节', nodeId: state.candidate.evidenceNodeId, quote: state.candidate.evidenceQuote, claim: state.candidate.detail })}>查看原文</button>
                            </article>
                          }) : <p className="memory-inline-empty">还没有可排列为人物轨迹的状态变化。</p>)}
                        </div>
                      </section>
                    </div>
                  )}
                </>) : memoryScope === 'threads' ? (<>
                  <div className="project-memory-toolbar">
                    <input value={memorySearch} onChange={(event) => setMemorySearch(event.target.value)} placeholder="搜索伏笔、任务、秘密或剧情线" onContextMenu={openInputContextMenu} />
                    <span>{storyMemoryThreads.length} 条</span>
                  </div>
                  <div className="memory-lifecycle-filters">
                    {([['all', '全部'], ['active', '进行中'], ['resolved', '已回收'], ['superseded', '已替代'], ['abandoned', '已放弃']] as const).map(([value, label]) => <button className={memoryThreadLifecycle === value ? 'active' : ''} key={value} onClick={() => setMemoryThreadLifecycle(value)}>{label}</button>)}
                  </div>
                  <div className="project-memory-list story-thread-list">
                    {projectMemoryLoading && <p className="memory-empty">正在整理线索和任务…</p>}
                    {!projectMemoryLoading && storyMemoryThreads.length === 0 && <p className="memory-empty">这一状态下还没有已确认的伏笔、任务、秘密或剧情线。</p>}
                    {!projectMemoryLoading && storyMemoryThreads.map((thread) => {
                      const candidate = thread.candidate
                      const chapter = project.chapters.find((item) => item.id === candidate.chapterId)
                      return <article className={`story-thread-item lifecycle-${thread.lifecycle}`} key={candidate.id}>
                        <div><span>{MEMORY_KIND_LABELS[candidate.kind]}</span><small>{chapter?.title ?? '未知章节'}</small></div>
                        <strong>{candidate.title}</strong>
                        <p>{candidate.detail}</p>
                        {(thread.owner || thread.target) && <small className="story-thread-meta">{thread.owner ? `负责人/知情者：${thread.owner}` : ''}{thread.owner && thread.target ? ' · ' : ''}{thread.target ? `目标：${thread.target}` : ''}</small>}
                        <div className="story-thread-actions">
                          <WheelSelect ariaLabel="生命周期" value={thread.lifecycle} options={Object.entries(MEMORY_LIFECYCLE_LABELS).map(([value, label]) => ({ value, label }))} onChange={(value) => void updateProjectMemoryLifecycle(candidate, value as MemoryCandidateMetadata['lifecycle'])} />
                          <button onClick={() => void openAnswerCitation({ evidenceId: candidate.id, chapterId: candidate.chapterId, chapterTitle: chapter?.title ?? '未知章节', nodeId: candidate.evidenceNodeId, quote: candidate.evidenceQuote, claim: candidate.detail })}>查看原文</button>
                        </div>
                      </article>
                    })}
                  </div>
                </>) : memoryScope === 'digests' ? (<>
                  <div className="memory-digest-overview">
                    <div><strong>全书摘要索引</strong><span>{projectMemoryDigest.currentCount}/{projectMemoryDigest.chapterCount} 章与正文同步</span></div>
                    <p>{projectMemoryDigest.analyzedCount === 0 ? '还没有章节摘要。分析章节后会自动组成卷级和全书级索引。' : `已分析 ${projectMemoryDigest.analyzedCount} 章，其中 ${projectMemoryDigest.analyzedCount - projectMemoryDigest.currentCount} 章摘要需要随正文更新。`}</p>
                  </div>
                  <div className="project-memory-list memory-digest-list">
                    {projectMemoryDigest.volumes.map((volume) => {
                      const pageCount = Math.max(1, Math.ceil(volume.chapters.length / MEMORY_DIGEST_PAGE_SIZE))
                      const page = Math.min(pageCount - 1, Math.max(0, memoryDigestPages[volume.volumeId] ?? 0))
                      const start = page * MEMORY_DIGEST_PAGE_SIZE
                      const visibleChapters = volume.chapters.slice(start, start + MEMORY_DIGEST_PAGE_SIZE)
                      return <details key={volume.volumeId} open={projectMemoryDigest.volumes.length === 1}>
                        <summary><span>{volume.title}</span><small>{volume.currentCount}/{volume.chapterCount} 章同步</small></summary>
                        {volume.analyzedCount > 0 ? <div className="volume-digest-content">
                          <p>{volume.summary.split('\n').map((line, index) => {
                            const separator = line.indexOf('：')
                            return <span key={`${volume.volumeId}-summary-${index}`}>
                              {separator > 0 ? <><strong>{line.slice(0, separator)}</strong>{line.slice(separator)}</> : line}
                            </span>
                          })}</p>
                          <div className="chapter-digest-index">{visibleChapters.map((chapter) => <button className={chapter.current ? '' : 'is-stale'} key={chapter.chapterId} onClick={() => void openChapter(chapter.chapterId)}><span>{chapter.chapterTitle}</span><small>{chapter.current ? '已同步' : '待更新'}</small></button>)}</div>
                          {pageCount > 1 && <div className="chapter-digest-pagination">
                            <button disabled={page === 0} title="上一页" aria-label="上一页" onClick={() => setMemoryDigestPages((current) => ({ ...current, [volume.volumeId]: page - 1 }))}><ChevronLeft size={14} /></button>
                            <span>{start + 1}-{Math.min(start + MEMORY_DIGEST_PAGE_SIZE, volume.chapters.length)} / {volume.chapters.length}</span>
                            <button disabled={page >= pageCount - 1} title="下一页" aria-label="下一页" onClick={() => setMemoryDigestPages((current) => ({ ...current, [volume.volumeId]: page + 1 }))}><ChevronRight size={14} /></button>
                          </div>}
                        </div> : <p className="memory-inline-empty">本卷还没有章节摘要。</p>}
                      </details>
                    })}
                  </div>
                </>) : memoryScope === 'consistency' ? (<>
                  <div className="memory-toolbar">
                    <button disabled={projectMemoryLoading} onClick={() => void runMemoryConsistencyCheck()}><Sparkles size={15} />{projectMemoryLoading ? '正在检查' : '检查一致性'}</button>
                    <span>{memoryConsistencyIssues.filter((issue) => issue.status === 'open').length} 项待判断</span>
                  </div>
                  <div className="project-memory-list memory-consistency-list">
                    {!projectMemoryLoading && memoryConsistencyIssues.length === 0 && <p className="memory-empty">点击“检查一致性”，核对已确认的人物状态、世界规则和有效时间范围。</p>}
                    {memoryConsistencyIssues.map((issue) => <article className={`memory-consistency-item severity-${issue.severity}`} key={issue.id}>
                      <div><span>{issue.severity === 'error' ? '明确冲突' : issue.severity === 'warning' ? '需要判断' : '提示'}</span><small>{issue.status === 'open' ? '待判断' : issue.status === 'confirmed' ? '已确认' : issue.status === 'resolved' ? '已处理' : '已忽略'}</small></div>
                      <strong>{issue.title}</strong>
                      <p>{issue.detail}</p>
                      <small>{issue.suggestion}</small>
                      <div className="memory-consistency-actions">
                        {issue.evidence[0] && <button onClick={() => void openAnswerCitation({ evidenceId: issue.id, chapterId: issue.evidence[0].chapterId, chapterTitle: issue.evidence[0].chapterTitle, nodeId: issue.evidence[0].nodeId, quote: issue.evidence[0].quote, claim: issue.detail })}>查看证据</button>}
                        {issue.status === 'open' ? <><button onClick={() => void updateReviewIssueStatus(issue, 'dismissed')}>忽略</button><button onClick={() => void updateReviewIssueStatus(issue, 'confirmed')}>确认问题</button><button onClick={() => void updateReviewIssueStatus(issue, 'resolved')}>已处理</button></> : <button onClick={() => void updateReviewIssueStatus(issue, 'open')}>重新打开</button>}
                      </div>
                    </article>)}
                  </div>
                </>) : (<>
                  <div className="project-memory-toolbar">
                    <input value={memorySearch} onChange={(event) => setMemorySearch(event.target.value)} placeholder={memoryScope === 'timeline' ? '筛选事件、认知或伏笔' : '搜索已确认或待复核资料'} onContextMenu={openInputContextMenu} />
                    <span>{visibleProjectMemoryCandidates.length} 条</span>
                  </div>
                  <div className={`project-memory-list ${memoryScope === 'timeline' ? 'memory-timeline-list' : ''}`}>
                    {projectMemoryLoading && <p className="memory-empty">正在整理全书资料…</p>}
                    {!projectMemoryLoading && visibleProjectMemoryCandidates.length === 0 && <p className="memory-empty">{memoryScope === 'timeline' ? '还没有已确认的事件、关系、对白、任务或伏笔' : '还没有匹配的已确认资料'}</p>}
                    {!projectMemoryLoading && visibleProjectMemoryCandidates.map((candidate) => {
                      const chapter = project.chapters.find((item) => item.id === candidate.chapterId)
                      const validFrom = project.chapters.find((item) => item.id === candidate.metadata.validFromChapterId)
                      const validTo = project.chapters.find((item) => item.id === candidate.metadata.validToChapterId)
                      return <article className={`project-memory-item ${candidate.status === 'stale' ? 'is-stale' : ''}`} key={candidate.id}>
                        <div><span>{MEMORY_KIND_LABELS[candidate.kind]} · {MEMORY_NATURE_LABELS[candidate.metadata.nature]}{candidate.status === 'archived' ? ' · 自动归档（非正典）' : ''}{['foreshadowing', 'commitment', 'secret', 'plot'].includes(candidate.kind) ? ` · ${MEMORY_LIFECYCLE_LABELS[candidate.metadata.lifecycle]}` : ''}</span><small>{candidate.status === 'stale' ? '正文已变更 · 待复核' : chapter?.title ?? '未知章节'}</small></div>
                        <strong>{candidate.title}</strong>
                        <p>{candidate.detail}</p>
                        {candidate.metadata.entityId && <small className="memory-entity-summary">同一实体共 {projectMemoryBundles.flatMap((bundle) => bundle.candidates).filter((item) => (item.metadata.entityId || item.id) === candidate.metadata.entityId).length} 条资料{candidate.metadata.aliases.length ? ` · 别名：${candidate.metadata.aliases.join('、')}` : ''} · 首次见于 {project.chapters.find((item) => item.id === candidate.metadata.firstSeenChapterId)?.title ?? chapter?.title ?? '未知章节'}</small>}
                        {memoryScope === 'timeline' && <small className="timeline-validity">{candidate.metadata.storyTime ? `故事时间：${candidate.metadata.storyTime} · ` : ''}{validFrom?.title ?? chapter?.title ?? '未知章节'} 起{validTo ? `，至 ${validTo.title} 前` : '，持续有效'}{candidate.metadata.participants ? ` · 参与：${candidate.metadata.participants}` : ''}{candidate.metadata.location ? ` · 地点：${candidate.metadata.location}` : ''}{candidate.metadata.knower ? ` · 知情：${candidate.metadata.knower}` : ''}</small>}
                        <button onClick={() => void openAnswerCitation({ evidenceId: candidate.id, chapterId: candidate.chapterId, chapterTitle: chapter?.title ?? '未知章节', nodeId: candidate.evidenceNodeId, quote: candidate.evidenceQuote, claim: candidate.detail })}>查看原文</button>
                      </article>
                    })}
                  </div>
                </>)}
              </div>
            ) : assistantView === 'naming' ? (
              <div className="offline-naming-panel">
                <div className="offline-naming-form">
                  <div className="offline-naming-segment">
                    {([['character', '人物'], ['location', '地点'], ['organization', '组织'], ['item', '物品']] as Array<[OfflineNameKind, string]>).map(([kind, label]) => <button key={kind} className={offlineNameKind === kind ? 'active' : ''} onClick={() => setOfflineNameKind(kind)}>{label}</button>)}
                  </div>
                  <label><span>地区</span><WheelSelect ariaLabel="地区" value={offlineNameRegion} options={[...new Set(offlineCultures.map((culture) => culture.region))].map((region) => ({ value: region, label: region }))} onChange={(region) => { const next = offlineCultures.find((culture) => culture.region === region); setOfflineNameRegion(region); if (next) { setOfflineNameCulture(next.id); setOfflineNamePeriod(next.periods.at(-1)?.id ?? '') } }} /></label>
                  <label><span>文化区</span><WheelSelect ariaLabel="文化区" value={offlineNameCulture} options={offlineCultures.filter((culture) => culture.region === offlineNameRegion).map((culture) => ({ value: culture.id, label: culture.label }))} onChange={(value) => { const next = value as OfflineCulture; setOfflineNameCulture(next); setOfflineNamePeriod(offlineCultures.find((culture) => culture.id === next)?.periods.at(-1)?.id ?? '') }} /></label>
                  <label><span>历史时期</span><WheelSelect ariaLabel="历史时期" value={offlineNamePeriod} options={(offlineCultures.find((culture) => culture.id === offlineNameCulture)?.periods ?? []).map((period) => ({ value: period.id, label: period.label }))} onChange={setOfflineNamePeriod} /></label>
                  <label><span>资料范围</span><WheelSelect ariaLabel="资料范围" value={offlineCatalogMode} options={[{ value: 'mixed', label: '混合参考与架空' }, { value: 'reference', label: '真实参考资料' }, { value: 'fictional', label: '架空风格资料' }]} onChange={(value) => setOfflineCatalogMode(value as 'mixed' | 'reference' | 'fictional')} /></label>
                  {offlineNameKind === 'character' && <label><span>性别倾向</span><WheelSelect ariaLabel="性别倾向" value={offlineNameGender} options={[{ value: 'any', label: '不限' }, { value: 'female', label: '女性' }, { value: 'male', label: '男性' }]} onChange={(value) => setOfflineNameGender(value as OfflineGender)} /></label>}
                  {offlineNameKind === 'character' && <label><span>{offlineNameCulture === 'icelandic' || (offlineNameCulture === 'norse' && offlineNamePeriod !== 'modern') ? '父/母名（可选）' : offlineNameCulture === 'balkan' && offlineNamePeriod !== 'modern' ? '父名式称谓/历史别称（可选）' : offlineNameCulture === 'caucasus' && offlineNamePeriod === 'alanian' ? '氏族/历史称号（可选）' : offlineNameCulture === 'ancient-rome' ? '氏族名（可选）' : '姓氏（可选）'}</span><input aria-label={offlineNameCulture === 'icelandic' || (offlineNameCulture === 'norse' && offlineNamePeriod !== 'modern') ? '父名或母名（可选）' : offlineNameCulture === 'balkan' && offlineNamePeriod !== 'modern' ? '父名式称谓或历史别称（可选）' : offlineNameCulture === 'caucasus' && offlineNamePeriod === 'alanian' ? '氏族或历史称号（可选）' : offlineNameCulture === 'ancient-rome' ? '氏族名（可选）' : '姓氏（可选）'} value={offlineNameSurname} maxLength={24} placeholder="留空自动选择" onChange={(event) => setOfflineNameSurname(event.target.value)} onContextMenu={openInputContextMenu} /></label>}
                  {offlineNameKind === 'location' && <label><span>地点类型</span><WheelSelect ariaLabel="地点类型" value={offlineLocationType} options={[{ value: 'settlement', label: '城镇村落' }, { value: 'region', label: '地区领地' }, { value: 'fortress', label: '关隘城堡' }, { value: 'natural', label: '自然地貌' }]} onChange={(value) => setOfflineLocationType(value as OfflineLocationType)} /></label>}
                  <label><span>数量</span><input type="number" min={1} max={100} value={offlineNameCount} onChange={(event) => setOfflineNameCount(Math.max(1, Math.min(100, Number(event.target.value) || 1)))} /></label>
                  <button className="offline-naming-generate" disabled={offlineNamingLoading || offlineCultures.length === 0} onClick={() => void generateOfflineNameCandidates()}><Dices size={15} />{offlineNamingLoading ? '正在准备资料…' : '生成本地名称'}</button>
                </div>
                <div className="offline-naming-list">
                  {offlineNameCandidates.filter((candidate) => candidate.kind === offlineNameKind).length === 0 && <p className="memory-empty">{offlineNameKind === 'character' && offlineCultures.find((culture) => culture.id === offlineNameCulture)?.periods.find((period) => period.id === offlineNamePeriod)?.personData === 'archaeological' ? '该层只提供可考的考古地点、社会结构和器物；可靠个人名材料不足，因此不生成人物姓名。' : '填写条件后生成名称，已收藏的候选会保留在本机。'}</p>}
                  {offlineNameCandidates.filter((candidate) => candidate.kind === offlineNameKind).slice(0, 100).map((candidate) => <article key={candidate.id}>
                    <div><strong>{candidate.name}</strong><span>{candidate.cultureLabel} · {candidate.periodLabel} · {candidate.components}</span>{candidate.nativeName !== candidate.name && <span>原文：{candidate.nativeName}</span>}{candidate.reading && <span>读音：{candidate.reading}</span>}<small>{candidate.sourceClass === 'historical' ? '历史受控资料' : candidate.sourceClass === 'modern' ? '现代资料' : candidate.sourceClass === 'regional' ? '文化区参考资料' : '架空风格资料'}</small></div>
                    <footer><button title="复制名称" onClick={() => void writeClipboardText(candidate.name)}><Copy size={13} /></button><button className={candidate.favorite ? 'active' : ''} title={candidate.favorite ? '取消收藏' : '收藏名称'} onClick={() => toggleOfflineNameFavorite(candidate)}>★</button><button title="带入 Agent 讨论" onClick={() => useOfflineNameInAgent(candidate)}><MessageSquareText size={13} /></button></footer>
                  </article>)}
                </div>
              </div>
            ) : assistantView === 'qa' ? (
              <div className="project-qa-content">
                <div className="project-question-box">
                  <textarea value={projectQuestion} placeholder="询问人物、剧情、伏笔或设定" onChange={(event) => setProjectQuestion(event.target.value)} onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                      event.preventDefault()
                      void runProjectQuestion()
                    }
                  }} />
                  <button disabled={!projectQuestionBusy && !projectQuestion.trim()} onClick={() => void runProjectQuestion()}>{projectQuestionBusy ? '停止' : '询问'}</button>
                </div>
                {projectQuestionMessage && <p className="project-question-message">{projectQuestionMessage}</p>}
                {!aiApiKey.trim() && <div className="memory-config-notice"><span>配置 AI 服务后才能询问作品。</span><button onClick={() => { setPendingMotionEnabled(preferences.motionEnabled); setSettingsCategory('ai'); setClosingModal(null); setSettingsOpen(true) }}>AI 服务设置</button></div>}
                {qaMessages.length > 0 && <div className="conversation-history-toolbar"><span>{Math.ceil(qaMessages.length / 2)} 轮问答</span><button onClick={() => void clearConversationHistory('qa')}>清空记录</button></div>}
                {qaMessages.length > 0 ? <div className="ai-conversation-history" aria-label={qaConversation?.title ?? '作品问答记录'}>
                  {qaMessages.map((message) => {
                    if (message.role === 'user') return <article className="ai-conversation-user" key={message.id}><span>你</span><p>{message.content}</p></article>
                    const answer = conversationPayload<ProjectAnswer>(message)
                    const displayCitations = sanitizeCitationsForDisplay(answer?.citations ?? [], answer?.answer ?? message.content)
                    const retryInput = qaMessages.find((item) => item.requestId === message.requestId && item.role === 'user')?.content ?? ''
                    return <article className={`ai-conversation-assistant ${message.status}`} key={message.id}>
                      <span>字里助手</span>
                      {message.status === 'pending' ? <p>正在检索并核对原文...</p> : message.status === 'failed' || message.status === 'cancelled' ? <div className="ai-conversation-error"><p>{message.error || '本次请求未完成'}</p><button onClick={() => void runProjectQuestion(retryInput)}>重试</button></div> : <>
                        <p>{stripInlineEvidenceMarkers(answer?.answer ?? message.content)}</p>
                        {answer && displayCitations.length > 0 && <div className="answer-citations">
                          <strong>原文引用</strong>
                          {displayCitations.map((citation, index) => <button key={citation.evidenceId} onClick={() => void openAnswerCitation(citation)}>
                            <span>{index + 1} · {citation.chapterTitle}</span><q>{citation.quote}</q><small>{citation.claim}</small>
                          </button>)}
                        </div>}
                      </>}
                    </article>
                  })}
                </div> : projectAnswer ? <div className="project-answer">
                  <p>{stripInlineEvidenceMarkers(projectAnswer.answer)}</p>
                  <div className="answer-citations">
                    <strong>原文引用</strong>
                    {sanitizeCitationsForDisplay(projectAnswer.citations, projectAnswer.answer).map((citation, index) => <button key={citation.evidenceId} onClick={() => void openAnswerCitation(citation)}>
                      <span>{index + 1} · {citation.chapterTitle}</span>
                      <q>{citation.quote}</q>
                      <small>{citation.claim}</small>
                    </button>)}
                  </div>
                </div> : <p className="qa-empty">回答只会依据检索到的作品正文，并附上可以返回原文的引用。</p>}
              </div>
            ) : assistantView === 'advisor' ? (
              <div className="advisor-panel-content">
                <div className="advisor-tabs">
                  <button className={advisorTab === 'brief' ? 'active' : ''} onClick={() => setAdvisorTab('brief')}>创作简报</button>
                  <button className={advisorTab === 'outline' ? 'active' : ''} onClick={() => setAdvisorTab('outline')}>分层大纲</button>
                  <button className={advisorTab === 'diagnose' ? 'active' : ''} onClick={() => setAdvisorTab('diagnose')}>梳理思路</button>
                </div>
                {advisorMessage && <p className="advisor-message">{advisorMessage}</p>}
                {!aiApiKey.trim() && <div className="memory-config-notice"><span>已有规划可以离线编辑；使用 AI 推演前需要配置服务。</span><button onClick={() => { setPendingMotionEnabled(preferences.motionEnabled); setSettingsCategory('ai'); setClosingModal(null); setSettingsOpen(true) }}>AI 服务设置</button></div>}
                {advisorBusy === 'loading' ? <p className="memory-empty">正在读取创作规划…</p> : advisorTab === 'brief' ? (
                  <div className="creative-brief-pane">
                    <div className="creative-dialogue-box">
                      <textarea value={creativeInput} placeholder="谈谈你想写什么，或回答下面的问题" onChange={(event) => setCreativeInput(event.target.value)} />
                      <button onClick={() => void runCreativeBriefDevelopment()}>{advisorBusy === 'brief' ? '停止' : creativeWorkspace.brief.premise ? '完善简报' : '生成简报'}</button>
                    </div>
                    {creativeQuestions.length > 0 && <div className="creative-questions"><strong>需要作者决定</strong>{creativeQuestions.map((question) => <button key={question} onClick={() => setCreativeInput((current) => `${current}${current ? '\n' : ''}${question}\n`)}>{question}</button>)}</div>}
                    <div className="creative-brief-fields">
                      {([
                        ['premise', '故事前提', '一句话说明故事发生什么'],
                        ['genre', '类型', '例如悬疑、奇幻、现实题材'],
                        ['coreExperience', '核心体验', '希望读者持续获得什么感受'],
                        ['theme', '主题', '作品反复追问的问题'],
                        ['protagonistDesire', '主角欲望', '主角最想得到什么'],
                        ['stakes', '失败代价', '失败会失去什么'],
                        ['centralConflict', '主要矛盾', '谁或什么阻止主角'],
                        ['lengthTarget', '篇幅倾向', '短篇、中篇、长篇或目标字数'],
                        ['endingTendency', '结局倾向', '开放、圆满、悲剧或尚未决定'],
                      ] as const).map(([field, label, placeholder]) => <label key={field}>
                        <span>{label}</span>
                        <textarea value={creativeWorkspace.brief[field]} placeholder={placeholder} onChange={(event) => updateCreativeBriefField(field, event.target.value)} onBlur={() => void commitCreativeBrief()} />
                      </label>)}
                    </div>
                  </div>
                ) : advisorTab === 'outline' ? (
                  <div className="outline-pane">
                    <div className="outline-levels">
                      {(Object.entries(OUTLINE_LEVEL_LABELS) as Array<[OutlineLevel, string]>).map(([level, label]) => <button key={level} className={outlineLevel === level ? 'active' : ''} onClick={() => setOutlineLevel(level)}>{label}</button>)}
                    </div>
                    <div className="outline-generate-box">
                      <textarea value={outlineInstruction} placeholder={`说明这一层需要怎样安排`} onChange={(event) => setOutlineInstruction(event.target.value)} />
                      <button onClick={() => void runOutlineGeneration()}>{advisorBusy === 'outline' ? '停止' : `推演${OUTLINE_LEVEL_LABELS[outlineLevel]}`}</button>
                    </div>
                    <div className="outline-node-list">
                      {creativeWorkspace.outline.filter((node) => node.level === outlineLevel).length === 0 && <p className="memory-empty">这一层还没有大纲节点</p>}
                      {creativeWorkspace.outline.filter((node) => node.level === outlineLevel).map((node) => <article className={`outline-node ${node.locked ? 'locked' : ''}`} key={node.id}>
                        <div><span>{node.source === 'ai' ? 'AI 草案' : '作者添加'}</span><div>
                          <button title={node.locked ? '解锁节点' : '锁定节点'} onClick={() => void commitOutlineNode(node, { locked: !node.locked })}>{node.locked ? <Lock size={13} /> : <Unlock size={13} />}</button>
                          <button title="删除节点" disabled={node.locked} onClick={() => void removeOutlineNode(node)}><Trash2 size={13} /></button>
                        </div></div>
                        <input aria-label="大纲标题" value={node.title} disabled={node.locked} onChange={(event) => editOutlineNode(node.id, { title: event.target.value })} onBlur={() => void commitOutlineNode(node)} onContextMenu={openInputContextMenu} />
                        <textarea aria-label="大纲内容" value={node.summary} disabled={node.locked} onChange={(event) => editOutlineNode(node.id, { summary: event.target.value })} onBlur={() => void commitOutlineNode(node)} />
                      </article>)}
                    </div>
                  </div>
                ) : (
                  <div className="diagnose-pane">
                    <div className="diagnose-input">
                      <textarea value={advisorNote} placeholder="哪里不顺、卡在哪，或者希望比较哪些方向" onChange={(event) => setAdvisorNote(event.target.value)} />
                      <button onClick={() => void runWritingDiagnosis()}><Sparkles size={14} />{advisorBusy === 'diagnose' ? '停止分析' : '分析当前局面'}</button>
                    </div>
                    {advisorMessages.length > 0 && <div className="advisor-conversation-history" aria-label={advisorConversation?.title ?? '创作顾问记录'}>
                      <div><strong>讨论记录</strong><button onClick={() => void clearConversationHistory('advisor')}>清空</button></div>
                      {advisorMessages.slice(-10).map((message) => {
                        const session = message.role === 'assistant' ? conversationPayload<AdvisorSession>(message) : null
                        const retryInput = advisorMessages.find((item) => item.requestId === message.requestId && item.role === 'user')?.content ?? ''
                        return message.role === 'user'
                          ? <article className="advisor-history-user" key={message.id}><span>你</span><p>{message.content}</p></article>
                          : <article className={`advisor-history-assistant ${message.status}`} key={message.id}><span>助手</span>{message.status === 'pending' ? <p>正在分析...</p> : message.status === 'failed' || message.status === 'cancelled' ? <div><p>{message.error || '本次请求未完成'}</p><button onClick={() => void runWritingDiagnosis(retryInput)}>重试</button></div> : <button onClick={() => session && setAdvisorResult(session)}>{message.content || '查看本次分析'}</button>}</article>
                      })}
                    </div>}
                    {advisorResult ? <div className="advisor-result">
                      <section><strong>当前局面</strong><p>{advisorResult.situation}</p></section>
                      <section><strong>可能的障碍</strong><p>{advisorResult.obstacle}</p></section>
                      <div className="advisor-directions">
                        {advisorResult.directions.map((direction, index) => <article key={direction.id}>
                          <div><span>{index + 1}</span><strong>{direction.title}</strong></div>
                          <p>{direction.approach}</p>
                          <dl><dt>收益</dt><dd>{direction.benefits || '未说明'}</dd><dt>代价</dt><dd>{direction.costs || '未说明'}</dd><dt>风险</dt><dd>{direction.risks || '未说明'}</dd><dt>下一拍</dt><dd>{direction.nextBeat || '未说明'}</dd></dl>
                          <footer><button onClick={() => setAdvisorNote(`围绕“${direction.title}”继续推演：${direction.approach}`)}>继续讨论</button><button onClick={() => void writeDirectionToOutline(direction)}>写入大纲</button></footer>
                        </article>)}
                      </div>
                    </div> : <p className="qa-empty">先说明当前困惑。助手会分析局面，再提供多个方向以及各自的收益和代价。</p>}
                  </div>
                )}
              </div>
            ) : assistantView === 'draft' ? (
              <div className="draft-panel-content">
                <div className="draft-mode-tabs">
                  {(Object.entries(DRAFT_MODE_LABELS) as Array<[DraftMode, string]>).map(([mode, label]) => <button key={mode} className={draftMode === mode ? 'active' : ''} onClick={() => setDraftMode(mode)}>{label}</button>)}
                </div>
                {draftMessage && <p className="draft-message">{draftMessage}</p>}
                {!aiApiKey.trim() && <div className="memory-config-notice"><span>配置 AI 服务后才能生成候选文本。</span><button onClick={() => { setPendingMotionEnabled(preferences.motionEnabled); setSettingsCategory('ai'); setClosingModal(null); setSettingsOpen(true) }}>AI 服务设置</button></div>}
                <div className="draft-scroll-content">
                  <section className="draft-task-form">
                    <div className="draft-anchor-preview"><span>{draftTarget.text ? '当前选区' : '当前光标'}</span><p>{draftTarget.text || `将在第 ${cursorPosition.paragraph} 段附近插入候选文本`}</p></div>
                    <label><span>目标长度</span><input type="number" min="50" max="3000" step="50" value={draftTargetLength} onChange={(event) => setDraftTargetLength(Math.max(50, Math.min(3000, Number(event.target.value) || 50)))} /></label>
                    <label><span>必须发生</span><textarea value={draftMustInclude} placeholder="必须出现的行动、信息或结果" onChange={(event) => setDraftMustInclude(event.target.value)} /></label>
                    <label><span>禁止发生</span><textarea value={draftMustAvoid} placeholder="不能出现的情节、信息或表达" onChange={(event) => setDraftMustAvoid(event.target.value)} /></label>
                    <label><span>表达要求</span><textarea value={draftStyleInstruction} placeholder="例如减少解释，多用动作推进" onChange={(event) => setDraftStyleInstruction(event.target.value)} /></label>
                    <label className="draft-fact-toggle"><span><strong>不可新增正典事实</strong><small>新增内容仍会列入校验</small></span><span className="switch-control"><input type="checkbox" checked={draftNoNewFacts} onChange={(event) => setDraftNoNewFacts(event.target.checked)} /><span className="switch-track" aria-hidden="true"><span /></span></span></label>
                    <button className="draft-generate" onClick={() => void runDraftGeneration()}><Sparkles size={14} />{draftBusy ? '停止生成' : '生成候选方案'}</button>
                  </section>
                  <div className="draft-candidate-list">
                    {draftCompareIds.length > 0 && <div className="draft-compare-toolbar"><span>已选 {draftCompareIds.length}/2 个方案</span><button onClick={() => setDraftCompareIds([])}>清除</button>{draftCompareIds.length === 2 && <button className="compare" onClick={() => setDraftComparisonOpen(true)}><Eye size={13} />对比方案</button>}</div>}
                    {draftCandidates.length === 0 && <p className="memory-empty">候选文本不会自动进入正文。生成后先比较方案和校验结果。</p>}
                    {draftCandidates.slice(0, 12).map((candidate) => <article className={`draft-candidate ${candidate.status}`} key={candidate.id}>
                      <header><div><span>{draftModeLabel(candidate)}</span><strong>{candidate.title}</strong></div><small>{candidate.status === 'accepted' ? '已接受' : candidate.status === 'rejected' ? '已拒绝' : '待决定'}</small></header>
                      {candidate.mode === 'rewrite' && candidate.sourceText ? <div className="draft-version-comparison">
                        <section><span>原选区</span><p>{candidate.sourceText}</p></section>
                        <section><span>候选改写</span><p>{candidate.text}</p></section>
                      </div> : <p className="draft-candidate-text">{candidate.text}</p>}
                      <div className="draft-validation">
                        <div><strong>目标</strong><p>{candidate.validation.goalCoverage || '模型未说明'}</p></div>
                        <div><strong>使用资料</strong><p>{candidate.validation.usedContext.join('；') || '未声明'}</p></div>
                        <div className={candidate.validation.newFacts.length ? 'warning' : ''}><strong>新增事实</strong><p>{candidate.validation.newFacts.join('；') || '未发现'}</p></div>
                        <div className={candidate.validation.conflicts.length || candidate.validation.overlapWarnings.length ? 'danger' : ''}><strong>风险与冲突</strong><p>{[...candidate.validation.conflicts, ...candidate.validation.overlapWarnings].join('；') || '未发现'}</p></div>
                        <div><strong>表达检查</strong><p>{candidate.validation.styleNotes.join('；') || '未说明'}</p></div>
                      </div>
                      {candidate.status === 'candidate' && <footer><button className="preview" disabled={acceptingDraftId === candidate.id} onClick={() => void showDraftPreview(candidate)}><Eye size={13} />正文预览</button><button className={draftCompareIds.includes(candidate.id) ? 'compare active' : 'compare'} disabled={!draftCompareIds.includes(candidate.id) && draftCompareIds.length >= 2} onClick={() => setDraftCompareIds((current) => current.includes(candidate.id) ? current.filter((id) => id !== candidate.id) : [...current, candidate.id].slice(-2))}>对比</button><button disabled={acceptingDraftId === candidate.id} onClick={() => void rejectDraftCandidate(candidate)}>拒绝</button><button disabled={acceptingDraftId === candidate.id} className="accept" onClick={() => void acceptDraftCandidate(candidate)}>{acceptingDraftId === candidate.id ? '写入中…' : '接受并写入'}</button></footer>}
                      {candidate.status === 'accepted' && <footer><span>已写入正文</span><button disabled={acceptingDraftId === candidate.id} onClick={() => void acceptDraftCandidate(candidate, true)}>{acceptingDraftId === candidate.id ? '写入中…' : '重新写入'}</button></footer>}
                    </article>)}
                  </div>
                </div>
              </div>
            ) : assistantView === 'review' ? (
              <div className="review-panel-content">
                <div className="review-scope-tabs">
                  <button className={reviewScope === 'selection' ? 'active' : ''} onClick={() => setReviewScope('selection')}>选区</button>
                  <button className={reviewScope === 'scene' ? 'active' : ''} onClick={() => setReviewScope('scene')}>场景</button>
                  <button className={reviewScope === 'chapter' ? 'active' : ''} onClick={() => setReviewScope('chapter')}>当前章</button>
                  <button className={reviewScope === 'range' ? 'active' : ''} onClick={() => setReviewScope('range')}>章节范围</button>
                  <button className={reviewScope === 'project' ? 'active' : ''} onClick={() => setReviewScope('project')}>全书</button>
                </div>
                {reviewScope === 'range' && <div className="review-range-controls">
                  <WheelSelect ariaLabel="检查起始章节" value={reviewRangeStartId} options={project.chapters.map((chapter) => ({ value: chapter.id, label: chapter.title }))} onChange={setReviewRangeStartId} />
                  <span>至</span>
                  <WheelSelect ariaLabel="检查结束章节" value={reviewRangeEndId} options={project.chapters.map((chapter) => ({ value: chapter.id, label: chapter.title }))} onChange={setReviewRangeEndId} />
                </div>}
                <div className="review-toolbar">
                  <button onClick={() => reviewScope === 'project' ? void runFullProjectReview() : void runScopedReview(reviewScope)}>{reviewBusy === reviewScope ? '停止检查' : reviewScope === 'selection' ? '检查当前选区' : reviewScope === 'scene' ? '检查当前场景' : reviewScope === 'range' ? '检查章节范围' : reviewScope === 'project' ? '检查全书' : '检查本章'}</button>
                </div>
                {reviewMessage && <p className="review-message">{reviewMessage}</p>}
                {!aiApiKey.trim() && <div className="memory-config-notice"><span>自动轻量检查不使用 AI；主动检查需要配置服务。</span><button onClick={() => { setPendingMotionEnabled(preferences.motionEnabled); setSettingsCategory('ai'); setClosingModal(null); setSettingsOpen(true) }}>AI 服务设置</button></div>}
                <div className="review-status-tabs">
                  {([['open', '待判断'], ['confirmed', '已确认'], ['resolved', '已处理'], ['dismissed', '已忽略']] as const).map(([status, label]) => <button key={status} className={reviewStatusFilter === status ? 'active' : ''} onClick={() => setReviewStatusFilter(status)}>{label}<span>{visibleReviewIssues.filter((issue) => issue.status === status).length}</span></button>)}
                </div>
                <div className="review-issue-list">
                  {reviewBusy === 'loading' && <p className="memory-empty">正在读取审稿问题…</p>}
                  {reviewBusy !== 'loading' && visibleReviewIssues.filter((issue) => issue.status === reviewStatusFilter).length === 0 && <p className="memory-empty">这一分类还没有问题</p>}
                  {visibleReviewIssues.filter((issue) => issue.status === reviewStatusFilter).map((issue) => <article data-review-issue-card={issue.id} className={`review-issue severity-${issue.severity} ${reviewIssueIsStale(issue) ? 'is-stale' : ''} ${selectedReviewIssueId === issue.id ? 'is-selected' : ''}`} key={issue.id} onClick={() => setSelectedReviewIssueId(issue.id)}>
                    <header><div><span>{REVIEW_CATEGORY_LABELS[issue.category]}</span><small>{reviewIssueIsStale(issue) ? '正文已变更 · 待复核' : issue.source === 'automatic' ? '自动检查' : issue.source === 'selection_review' ? '选区检查' : issue.source === 'scene_review' ? '场景检查' : issue.source === 'chapter_review' ? '章节检查' : issue.source === 'range_review' ? '章节范围检查' : '全书检查'}</small></div><strong>{issue.severity === 'error' ? '严重' : issue.severity === 'warning' ? '注意' : '提示'}</strong></header>
                    <h4>{issue.title}</h4>
                    <p>{issue.detail}</p>
                    {issue.suggestion && <div className="review-suggestion"><strong>建议</strong>{issue.suggestion}</div>}
                    {issue.evidence.length > 0 && <div className="review-evidence"><strong>原文证据</strong>{issue.evidence.map((evidence, index) => <button key={`${evidence.chapterId}-${evidence.nodeId}-${index}`} onClick={() => void openAnswerCitation({ evidenceId: `${issue.id}-${index}`, chapterId: evidence.chapterId, chapterTitle: evidence.chapterTitle, nodeId: evidence.nodeId, quote: evidence.quote, claim: issue.detail })}><span>{evidence.chapterTitle}</span><q>{evidence.quote}</q></button>)}</div>}
                    <footer>
                      {issue.status === 'open' ? <><button onClick={() => void updateReviewIssueStatus(issue, 'dismissed')}>忽略</button><button onClick={() => void updateReviewIssueStatus(issue, 'confirmed')}>确认问题</button><button className="resolve" onClick={() => void updateReviewIssueStatus(issue, 'resolved')}>已处理</button></> : <button onClick={() => void updateReviewIssueStatus(issue, 'open')}>重新打开</button>}
                    </footer>
                  </article>)}
                </div>
              </div>
            ) : assistantView === 'tools' ? (
              <Suspense fallback={<p className="memory-empty">正在载入创作工具…</p>}>
                <AdvancedAiToolsPanel
                  project={project}
                  chapter={activeChapter}
                  scene={activeScene}
                  aiSettings={aiSettings}
                  apiKey={aiApiKey}
                  dataPermissions={aiDataPermissions}
                  openAiSettings={() => {
                    setPendingMotionEnabled(preferences.motionEnabled)
                    setSettingsCategory('ai')
                    setClosingModal(null)
                    setSettingsOpen(true)
                  }}
                  confirmDelete={(message, title) => showConfirm(message, { title, confirmLabel: '删除' })}
                />
              </Suspense>
            ) : (
              <div className="agent-panel-content">
                <div className="agent-conversation-toolbar">
                  <label title="切换 Agent 对话">
                    <MessageSquareText size={14} />
                    <WheelSelect
                      ariaLabel="选择 Agent 对话"
                      value={agentConversation?.id ?? ''}
                      disabled={agentBusy}
                      options={agentConversations.map((conversation) => ({ value: conversation.id, label: conversation.title }))}
                      onChange={(value) => void switchAgentConversation(value)}
                    />
                  </label>
                  <button disabled={agentBusy} title="新建对话" onClick={() => void createNewAgentConversation()}><Plus size={15} /></button>
                  <button disabled={agentBusy || !agentConversation} title="删除当前对话" onClick={() => void removeAgentConversation()}><Trash2 size={14} /></button>
                </div>
                {agentMessage && <p className="agent-status">{agentMessage}</p>}
                {!aiApiKey.trim() && <div className="memory-config-notice"><span>需要先配置 AI 服务。</span><button onClick={() => {
                  setPendingMotionEnabled(preferences.motionEnabled)
                  setSettingsCategory('ai')
                  setClosingModal(null)
                  setSettingsOpen(true)
                }}>AI 服务设置</button></div>}
                <div className="agent-thread" aria-label={agentConversation?.title ?? '字里助手对话'}>
                  {agentMessages.map((message) => {
                    const requestMessage = agentMessages.find((item) => item.requestId === message.requestId && item.role === 'user')
                    if (message.role === 'user') {
                      const context = conversationPayload<{ imageNames?: string[]; selectionText?: string }>(message)
                      return <article className="agent-message user" key={message.id}>
                        <span>你</span>
                        <p>{message.content}</p>
                        {context && (context.selectionText || (context.imageNames?.length ?? 0) > 0) && <small>{context.selectionText ? `选区 ${context.selectionText.length} 字` : ''}{context.selectionText && context.imageNames?.length ? ' · ' : ''}{context.imageNames?.join('、')}</small>}
                      </article>
                    }
                    const turn = conversationPayload<AgentTurn>(message)
                    const displayCitations = sanitizeCitationsForDisplay(turn?.citations ?? [], turn?.reply ?? message.content)
                    return <article className={`agent-message assistant ${message.status}`} key={message.id}>
                      <span>字里助手</span>
                      {message.status === 'pending' ? <p>{message.content || '正在处理...'}</p> : message.status === 'failed' || message.status === 'cancelled' ? <>{message.content && <p>{message.content}</p>}<div className="agent-error"><p>{message.error || '本次请求未完成'}</p><button onClick={() => void runAgentConversation(requestMessage?.content ?? '')}>重试</button></div></> : <>
                        <p>{sanitizeAgentReplyForDisplay(turn?.reply ?? message.content)}</p>
                        {turn?.reasoning && <details className="agent-reasoning">
                          <summary><BrainCircuit size={14} /><span>推理过程</span><small>展开</small></summary>
                          <pre>{turn.reasoning}</pre>
                        </details>}
                        {turn?.tools?.length ? <div className="agent-tools" aria-label="Agent 工具执行记录">
                          {turn.tools.map((tool) => <div className={`${tool.access} ${tool.status}`} key={tool.id} title={tool.detail}>
                            {tool.name === 'web_search' ? <Globe2 size={13} /> : tool.access === 'write' ? <Save size={13} /> : tool.access === 'write-preview' ? <Pencil size={13} /> : <Search size={13} />}
                            <span>{tool.label}</span>
                            <small>{tool.status === 'awaiting-confirmation' ? '待确认' : tool.status === 'failed' ? '失败' : tool.status === 'rejected' ? '已否决' : tool.status === 'undone' ? '已撤销' : '完成'}</small>
                          </div>)}
                        </div> : null}
                        {turn?.retrieval && <details className="agent-context-inspector">
                          <summary>
                            <Search size={13} />
                            <span>{turn.retrieval.scopeLabel}检索</span>
                            <small>扫描 {turn.retrieval.searchedChapters}/{turn.retrieval.totalChapters} 章 · 重点 {turn.retrieval.selectedChapters.length} 章 · 原文 {turn.retrieval.evidenceCount} 处</small>
                            <ChevronDown size={13} />
                          </summary>
                          <div>
                            <dl>
                              <div><dt>重点章节</dt><dd>{turn.retrieval.selectedChapters.join('、') || '没有读取章节原文'}</dd></div>
                              <div><dt>记忆资料</dt><dd>{turn.retrieval.memoryItems} 条已确认资料</dd></div>
                              <div><dt>索引层级</dt><dd>{turn.retrieval.summaryLevels.join('、') || '仅使用原文'}</dd></div>
                              {turn.retrieval.indexedChapters !== undefined && <div><dt>增量索引</dt><dd>{turn.retrieval.indexedChapters} 章可检索，本轮更新 {turn.retrieval.refreshedIndexChapters ?? 0} 章</dd></div>}
                              {(turn.retrieval.externalSources?.length ?? 0) > 0 && <div><dt>外部资料</dt><dd>{turn.retrieval.externalSources!.join('、')}</dd></div>}
                              {turn.metrics && <div><dt>本轮消耗</dt><dd>{(turn.metrics.durationMs / 1000).toFixed(1)} 秒 · 上下文 {turn.metrics.contextCharacters.toLocaleString('zh-CN')} 字符{turn.metrics.promptTokens !== null ? ` · 输入 ${turn.metrics.promptTokens.toLocaleString('zh-CN')} Token` : ''}{turn.metrics.completionTokens !== null ? ` · 输出 ${turn.metrics.completionTokens.toLocaleString('zh-CN')} Token` : ''}</dd></div>}
                            </dl>
                            {turn.retrieval.selectedChapters.length < turn.retrieval.totalChapters && turn.retrieval.scope !== 'current' && <p>本轮没有逐字读取全书，只扫描索引并重点读取相关章节；重要结论仍应查看下方原文依据。</p>}
                          </div>
                        </details>}
                        {displayCitations.length ? <div className="agent-citations">
                          {displayCitations.map((citation) => <button key={citation.evidenceId} onClick={() => void openAnswerCitation(citation)}>
                            <span>{citation.chapterTitle}</span><q>{citation.quote}</q><small>{citation.claim}</small>
                          </button>)}
                        </div> : null}
                        {turn?.retrieval?.webSources?.length ? <div className="agent-web-sources">
                          <strong>联网来源</strong>
                          {turn.retrieval.webSources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><Globe2 size={12} /><span>{source.title}</span></a>)}
                        </div> : null}
                        {turn?.memoryCandidates?.map((storedCandidate) => {
                          const candidate = projectMemoryBundles.flatMap((bundle) => bundle.candidates).find((item) => item.id === storedCandidate.id)
                            ?? memoryBundle.candidates.find((item) => item.id === storedCandidate.id)
                            ?? storedCandidate
                          return <section className={`agent-memory-candidate ${candidate.status}`} key={candidate.id}>
                            <header><div><BookOpenText size={14} /><strong>{candidate.title}</strong></div><span>{MEMORY_KIND_LABELS[candidate.kind]}</span></header>
                            <p>{candidate.detail}</p>
                            <small>来源：作者在本次对话中明确确认 · 生效于 {project.chapters.find((chapter) => chapter.id === candidate.metadata.validFromChapterId)?.title ?? activeChapter.title}</small>
                            <footer>{candidate.status === 'candidate' ? <><button onClick={() => void decideAgentMemoryCandidate(message, candidate, 'rejected')}>不加入</button><button className="confirm" onClick={() => void decideAgentMemoryCandidate(message, candidate, 'confirmed')}>确认加入</button></> : <span>{candidate.status === 'confirmed' ? '已加入故事记忆' : '已否决'}</span>}</footer>
                          </section>
                        })}
                        {turn?.memoryMutations?.map((mutation) => <section className={`agent-memory-mutation ${mutation.status}`} key={mutation.id}>
                          <header>
                            <div><Pencil size={14} /><strong>{mutation.title}</strong></div>
                            <span>{mutation.kind === 'add_alias' ? '添加别名' : mutation.kind === 'merge_entities' ? '合并人物' : '更新生命周期'}</span>
                          </header>
                          <p>{mutation.detail}</p>
                          <small>影响 {mutation.targetCandidateIds.length + (mutation.secondaryCandidateIds?.length ?? 0)} 条资料 · 原文证据不会删除</small>
                          <footer>{mutation.status === 'candidate' ? <><button onClick={() => void decideAgentMemoryMutation(message, mutation, 'rejected')}>取消</button><button className="confirm" onClick={() => void decideAgentMemoryMutation(message, mutation, 'confirmed')}>确认变更</button></> : <span>{mutation.status === 'confirmed' ? '已写入并校验' : '已取消，未修改'}</span>}</footer>
                        </section>)}
                        {turn?.drafts?.map((storedDraft) => {
                          const candidate = draftCandidates.find((item) => item.id === storedDraft.id) ?? storedDraft
                          const transaction = agentDraftTask(candidate).transaction
                          return <section className={`agent-draft ${candidate.status}`} key={candidate.id}>
                            <header><div><strong>{candidate.title}</strong><span>{draftModeLabel(candidate)}</span></div><small>{candidate.text.length} 字</small></header>
                            <p>{candidate.text}</p>
                            {(candidate.validation.newFacts.length > 0 || candidate.validation.conflicts.length > 0 || candidate.validation.overlapWarnings.length > 0) && <div className="agent-draft-warnings">
                              {[...candidate.validation.newFacts.map((item) => `新增事实：${item}`), ...candidate.validation.conflicts, ...candidate.validation.overlapWarnings].map((item) => <span key={item}>{item}</span>)}
                            </div>}
                            {candidate.status === 'candidate' ? <footer><button className="preview" disabled={acceptingDraftId === candidate.id} onClick={() => void showDraftPreview(candidate)}><Eye size={13} />正文预览</button><button disabled={acceptingDraftId === candidate.id} onClick={() => void rejectDraftCandidate(candidate)}>放弃</button><button disabled={acceptingDraftId === candidate.id} className="accept" onClick={() => void acceptDraftCandidate(candidate)}>{acceptingDraftId === candidate.id ? '写入中…' : '确认写入'}</button></footer> : candidate.status === 'accepted' ? <footer><span>已写入正文</span>{transaction?.status === 'applied' && <button className="undo" disabled={acceptingDraftId === candidate.id} onClick={() => void undoAgentDraftAction(candidate)}><RotateCcw size={12} />撤销写入</button>}<button disabled={acceptingDraftId === candidate.id} onClick={() => void acceptDraftCandidate(candidate, true)}>{acceptingDraftId === candidate.id ? '写入中…' : '重新写入'}</button></footer> : <footer><span>已放弃</span></footer>}
                          </section>
                        })}
                      </>}
                    </article>
                  })}
                  {agentMessages.length === 0 && <div className="agent-empty-mark"><Sparkles size={22} /></div>}
                </div>
                <div className="agent-composer">
                  {agentTaskPhase !== 'idle' && <div className={`agent-task-checklist ${agentTaskPhase}`}>
                    <header><span>本次任务</span>{agentBusy ? <button onClick={() => agentController.current?.abort()}><Square size={11} />停止</button> : <button title="收起任务状态" onClick={() => setAgentTaskPhase('idle')}><X size={12} /></button>}</header>
                    <ol>
                      {['检索作品上下文', '读取补充资料', '生成回复或候选', '校验引用与写入预览'].map((label, index) => {
                        const status = agentTaskPhase === 'failed' && index === agentTaskPhaseIndex ? 'failed' : agentTaskPhase === 'complete' || index < agentTaskPhaseIndex ? 'complete' : index === agentTaskPhaseIndex ? 'running' : 'pending'
                        return <li className={status} key={label}>{status === 'complete' ? <CheckCircle2 size={12} /> : status === 'failed' ? <AlertTriangle size={12} /> : status === 'running' ? <RefreshCw size={12} /> : <span />}{label}</li>
                      })}
                    </ol>
                  </div>}
                  {(agentSelection.text || agentImages.length > 0) && <div className="agent-context-chips">
                    {agentSelection.text && <button title="移除选区" onClick={() => setAgentSelection((current) => ({ from: current.from, to: current.from, text: '' }))}><LocateFixed size={12} />选区 {agentSelection.text.length} 字<X size={12} /></button>}
                    {agentImages.map((image) => <button key={image.id} title={`移除 ${image.fileName}`} onClick={() => setAgentImages((current) => current.filter((item) => item.id !== image.id))}><Images size={12} />{image.fileName}<X size={12} /></button>)}
                  </div>}
                  {agentImagePickerOpen && <div className="agent-image-picker">
                    {imageAssets.length ? imageAssets.slice(0, 20).map((image) => <button key={image.id} onClick={() => attachAgentImage(image)} aria-label={`选择图片 ${image.fileName}`}><img src={image.src} alt="" /><span>{image.fileName}</span></button>) : <span>图片素材为空</span>}
                  </div>}
                  <textarea
                    value={agentInput}
                    placeholder="和字里助手讨论作品…"
                    onContextMenu={openInputContextMenu}
                    onChange={(event) => setAgentInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault()
                        const request = event.currentTarget.value.trim()
                        if (request) void runAgentConversation(request)
                      }
                    }}
                  />
                  {!agentBusy && agentInput.trim() && <p className="agent-request-estimate">预计读取：{agentRequestEstimate.scopeLabel} · 上下文预算上限约 {Math.round(agentRequestEstimate.estimatedContextCharacters / 1000)}k 字符 / {Math.round(agentRequestEstimate.estimatedPromptTokens / 1000)}k Token，实际按相关性裁剪</p>}
                  <div className="agent-composer-actions">
                    <div>
                      <button className={agentSelection.text ? 'active' : ''} title="使用当前正文选区" onClick={captureAgentSelection}><LocateFixed size={15} /></button>
                      <button title="上传图片" onClick={() => agentImageInput.current?.click()}><ImagePlus size={15} /></button>
                      <button className={agentImagePickerOpen ? 'active' : ''} title="从图片素材选择" onClick={() => void openAgentImagePicker()}><Images size={15} /></button>
                      {agentMessages.length > 0 && <button title="清空当前对话内容" onClick={() => void clearAgentConversation()}><Trash2 size={15} /></button>}
                    </div>
                    <button className="agent-send" disabled={!agentBusy && !agentInput.trim()} title={agentBusy ? '停止' : '发送'} onClick={() => void runAgentConversation()}>{agentBusy ? <Square size={14} /> : <Send size={15} />}</button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {historyOpen && !focusMode && (
          <aside className={`history-panel ${closingUtilityPanel === 'history' ? 'is-closing' : ''}`}>
            <div className="assistant-header">
              <div><History size={17} /><strong>版本历史</strong></div>
              <button className="icon-button small" onClick={() => void closeUtilityPanel('history')} title="关闭版本历史"><X size={17} /></button>
            </div>
            <div className="history-actions">
              <button onClick={() => void saveRevision()}><Save size={16} />保存当前版本</button>
              {revisionMessage && <span>{revisionMessage}</span>}
            </div>
            <div className="revision-list">
              {revisions.length === 0 && <p className="empty-revisions">还没有历史版本</p>}
              {revisions.map((revision) => (
                <article className="revision-item" key={revision.id}>
                  <div>
                    <strong>{new Date(revision.createdAt).toLocaleString('zh-CN')}</strong>
                    <span>{revision.reason} · {plainText(revision.content).replace(/\s/g, '').length} 字</span>
                  </div>
                  <p>{plainText(revision.content).slice(0, 72) || '空白章节'}</p>
                  <button onClick={() => void restoreRevision(revision)}><RotateCcw size={14} />恢复</button>
                </article>
              ))}
            </div>
          </aside>
        )}

        {trashOpen && !focusMode && (
          <aside className={`history-panel ${closingUtilityPanel === 'trash' ? 'is-closing' : ''} ${suppressPanelEntry === 'trash' ? 'suppress-entry' : ''}`}>
            <div className="assistant-header">
              <div><Trash2 size={17} /><strong>回收站</strong></div>
              <button className="icon-button small" onClick={() => void closeUtilityPanel('trash')} title="关闭回收站"><X size={17} /></button>
            </div>
            {trashedChapters.length > 0 && (
              <div className="trash-batch-bar">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTrashIds.size === trashedChapters.length}
                    onChange={toggleAllTrash}
                  />
                  <span>{selectedTrashIds.size === trashedChapters.length ? '取消全选' : '全选'}</span>
                </label>
                <button disabled={selectedTrashIds.size === 0} onClick={() => void permanentlyDeleteSelected()}>
                  <Trash2 size={14} />删除所选{selectedTrashIds.size > 0 ? ` (${selectedTrashIds.size})` : ''}
                </button>
              </div>
            )}
            <div className="revision-list">
              {trashedChapters.length === 0 && <p className="empty-revisions">回收站是空的</p>}
              {trashedChapters.map((chapter) => (
                <article className={`trash-item ${removingIds.has(chapter.id) ? 'is-removing' : ''}`} key={chapter.id}>
                  <div className="trash-item-heading">
                    <input type="checkbox" checked={selectedTrashIds.has(chapter.id)} onChange={() => toggleTrashSelection(chapter.id)} aria-label={`选择${chapter.title}`} />
                    <div><strong>{chapter.title}</strong><span>{chapter.volumeTitle} · {new Date(chapter.deletedAt).toLocaleString('zh-CN')}</span></div>
                  </div>
                  <p>{plainText(chapter.content).slice(0, 72) || '空白章节'}</p>
                  <div className="trash-actions">
                    <button onClick={() => void restoreTrashedChapter(chapter)}><ArchiveRestore size={14} />恢复</button>
                    <button className="danger" onClick={() => void permanentlyDeleteChapter(chapter.id)}><Trash2 size={14} />永久删除</button>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        )}

        {assetsOpen && !focusMode && (
          <aside className={`asset-panel ${closingUtilityPanel === 'assets' ? 'is-closing' : ''} ${suppressPanelEntry === 'assets' ? 'suppress-entry' : ''}`}>
            <div className="assistant-header">
              <div><Images size={17} /><strong>图片素材</strong></div>
              <button className="icon-button small" onClick={() => void closeUtilityPanel('assets')} title="关闭图片素材"><X size={17} /></button>
            </div>
            <div className="asset-toolbar">
              <button disabled={assetBusy} onClick={() => requestImageUpload(false)}><ImagePlus size={15} />{assetBusy ? '正在保存…' : '添加图片'}</button>
            </div>
            <div className="asset-list">
              {imageAssets.length === 0 && <p className="empty-revisions">还没有图片素材</p>}
              {imageAssets.map((asset) => (
                <article className={`asset-item ${removingIds.has(asset.id) ? 'is-removing' : ''}`} key={asset.id} onContextMenu={(event) => {
                  event.preventDefault(); event.stopPropagation()
                  setContextMenu({ kind: 'asset', id: asset.id, x: event.clientX, y: event.clientY })
                }}>
                  <button className="asset-preview" onClick={() => insertImage(asset)} title="插入正文">
                    <img src={asset.src} alt={asset.fileName} />
                  </button>
                  <div className="asset-meta"><strong>{asset.fileName}</strong><span>{Math.max(1, Math.round(asset.size / 1024))} KB</span></div>
                  <button className="asset-delete" onClick={() => void removeImage(asset)} title="删除图片"><Trash2 size={14} /></button>
                </article>
              ))}
            </div>
          </aside>
        )}

        {attachmentsOpen && !focusMode && (
          <aside className={`asset-panel ${closingUtilityPanel === 'attachments' ? 'is-closing' : ''} ${suppressPanelEntry === 'attachments' ? 'suppress-entry' : ''}`}>
            <div className="assistant-header">
              <div><Paperclip size={17} /><strong>附件资料</strong></div>
              <button className="icon-button small" onClick={() => void closeUtilityPanel('attachments')} title="关闭附件资料"><X size={17} /></button>
            </div>
            <div className="asset-toolbar attachment-toolbar">
              <button disabled={attachmentBusy} onClick={() => attachmentInput.current?.click()}><Paperclip size={15} />{attachmentBusy ? '正在保存…' : '添加附件'}</button>
              <WheelSelect ariaLabel="筛选附件资料" value={attachmentFilter} options={[{ value: 'all', label: '全部资料' }, { value: 'project', label: '全书资料' }, { value: 'volume', label: '当前卷' }, { value: 'chapter', label: '当前章节' }]} onChange={(value) => setAttachmentFilter(value as typeof attachmentFilter)} />
            </div>
            <div className="asset-list">
              {attachments.length === 0 && <p className="empty-revisions">还没有附件资料</p>}
              {attachments.length > 0 && filteredAttachments.length === 0 && <p className="empty-revisions">这个范围内没有资料</p>}
              {filteredAttachments.map((attachment) => (
                <article className={`attachment-item ${removingIds.has(attachment.id) ? 'is-removing' : ''}`} key={attachment.id} onContextMenu={(event) => {
                  event.preventDefault(); event.stopPropagation()
                  setContextMenu({ kind: 'attachment', id: attachment.id, x: event.clientX, y: event.clientY })
                }}>
                  <span className="attachment-icon"><FileText size={22} /></span>
                  <div className="asset-meta">
                    <strong>{attachment.fileName}</strong>
                    <span>{attachment.extension.toUpperCase()} · {Math.max(1, Math.round(attachment.size / 1024))} KB</span>
                    <WheelSelect
                      className="attachment-scope"
                      ariaLabel={`${attachment.fileName}的资料归属`}
                      value={attachment.scopeType === 'project' ? 'project:' : `${attachment.scopeType}:${attachment.scopeId ?? ''}`}
                      options={[{ value: 'project:', label: '全书资料' }, ...project.volumes.map((volume) => ({ value: `volume:${volume.id}`, label: `卷：${volume.title}` })), ...project.chapters.map((chapter) => ({ value: `chapter:${chapter.id}`, label: `章：${chapter.title}` }))]}
                      onChange={(value) => void changeAttachmentScope(attachment, value)}
                    />
                  </div>
                  <div className="attachment-actions">
                    <button onClick={() => void downloadAttachment(attachment)} title="下载附件"><Download size={14} /></button>
                    <button className="danger" onClick={() => void removeAttachment(attachment)} title="删除附件"><Trash2 size={14} /></button>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        )}

        {referencesOpen && !focusMode && (
          <aside className={`asset-panel ${closingUtilityPanel === 'references' ? 'is-closing' : ''} ${suppressPanelEntry === 'references' ? 'suppress-entry' : ''}`}>
            <div className="assistant-header">
              <div><BookOpenText size={17} /><strong>参考文本</strong></div>
              <button className="icon-button small" onClick={() => void closeUtilityPanel('references')} title="关闭参考文本"><X size={17} /></button>
            </div>
            <div className="asset-toolbar reference-toolbar">
              <button disabled={referenceBusy} onClick={() => referenceInput.current?.click()}><Plus size={15} />{referenceBusy ? '正在保存…' : '导入参考文本'}</button>
              <button disabled={styleBusy || referenceTexts.length === 0} onClick={() => void runStyleAnalysis()}><Sparkles size={14} />{styleBusy ? '停止分析' : '分析风格'}</button>
            </div>
            <div className="reference-view-tabs">
              <button className={referenceView === 'files' ? 'active' : ''} onClick={() => setReferenceView('files')}>参考文件</button>
              <button className={referenceView === 'style' ? 'active' : ''} onClick={() => setReferenceView('style')}>风格档案</button>
            </div>
            {styleMessage && <p className="style-message">{styleMessage}</p>}
            {referenceView === 'files' ? <div className="asset-list">
              {referenceTexts.length === 0 && <p className="empty-revisions">还没有参考文本</p>}
              {referenceTexts.map((reference) => (
                <article className={`attachment-item reference-item ${removingIds.has(reference.id) ? 'is-removing' : ''}`} key={reference.id} onContextMenu={(event) => {
                  event.preventDefault(); event.stopPropagation()
                  setContextMenu({ kind: 'reference', id: reference.id, x: event.clientX, y: event.clientY })
                }}>
                  <span className="attachment-icon"><BookOpenText size={21} /></span>
                  <div className="asset-meta">
                    <strong>{reference.fileName}</strong>
                    <span>{reference.extension.toUpperCase()} · {Math.max(1, Math.round(reference.size / 1024))} KB</span>
                    <span>已确认文本使用权</span>
                  </div>
                  <div className="attachment-actions">
                    <button onClick={() => void downloadReference(reference)} title="导出参考文本"><Download size={14} /></button>
                    <button className="danger" onClick={() => void removeReference(reference)} title="删除参考文本"><Trash2 size={14} /></button>
                  </div>
                </article>
              ))}
            </div> : <div className="style-profile-pane">
              {styleProfile.sourceReferenceIds.length === 0 && <p className="memory-empty">分析参考文本后会生成可编辑的抽象风格档案。</p>}
              {styleProfile.sourceReferenceIds.length > 0 && <>
                <p className="style-profile-notice">仅描述抽象特征，不复制特定作者表达。候选文本会执行长连续重合检查。</p>
                {([
                  ['sentenceRhythm', '句长与节奏'],
                  ['paragraphRhythm', '段落节奏'],
                  ['compositionBalance', '描写构成'],
                  ['pointOfView', '叙事视角'],
                  ['narrativeDistance', '视角距离'],
                  ['lexicalDensity', '词汇密度'],
                  ['rhetoricIntensity', '修辞强度'],
                  ['emotionalTone', '情绪基调'],
                  ['revelationPattern', '信息揭示'],
                  ['chapterEndingPattern', '章节结尾'],
                  ['editableGuidance', '写作指导'],
                ] as const).map(([field, label]) => <label key={field}><span>{label}</span><textarea value={styleProfile[field]} onChange={(event) => updateStyleProfileField(field, event.target.value)} onBlur={() => void commitStyleProfile()} /></label>)}
              </>}
            </div>}
          </aside>
        )}
      </section>

      {libraryOpen && (
        <div className={`modal-backdrop ${closingModal === 'library' ? 'is-closing' : ''}`} onMouseDown={(event) => {
          if (event.target === event.currentTarget) void closeModal('library')
        }}>
          <section className="library-modal" role="dialog" aria-modal="true" aria-label={projectTrashView ? '作品回收站' : '作品列表'}>
            <header>
              <div>{projectTrashView ? <Trash2 size={19} /> : <FolderOpen size={19} />}<strong>{projectTrashView ? '作品回收站' : '作品'}</strong></div>
              <div className="library-header-actions">
                <button className={`icon-button ${projectTrashView ? 'active' : ''}`} disabled={projectSwitchingId !== null} onClick={() => {
                  const next = !projectTrashView
                  setProjectTrashView(next)
                  if (next) void refreshTrashedProjects()
                }} title={projectTrashView ? '返回作品列表' : '作品回收站'}>{projectTrashView ? <ChevronLeft size={18} /> : <Trash2 size={17} />}</button>
                <button className="icon-button" disabled={projectSwitchingId !== null} onClick={() => void closeModal('library')} title="关闭作品列表"><X size={18} /></button>
              </div>
            </header>
            <div className="project-list">
              {!projectTrashView && projects.map((item) => (
                <div className={`project-row ${item.id === project.id ? 'active' : ''} ${removingIds.has(item.id) ? 'is-removing' : ''}`} key={item.id} onContextMenu={(event) => {
                  event.preventDefault(); event.stopPropagation()
                  setContextMenu({ kind: 'project', id: item.id, x: event.clientX, y: event.clientY })
                }}>
                  <button className="project-open" disabled={projectSwitchingId !== null} onClick={() => void switchProject(item.id)}>
                    <strong>{item.title}</strong>
                    <span>{projectSwitchingId === item.id ? '正在打开…' : `${item.chapterCount} 章 · ${new Date(item.updatedAt).toLocaleDateString('zh-CN')}`}</span>
                  </button>
                  <button className="icon-button" disabled={projectSwitchingId !== null} onClick={() => void deleteStoredProject(item.id)} title="删除作品">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {projectTrashView && trashedProjects.length === 0 && <p className="empty-project-trash">作品回收站是空的</p>}
              {projectTrashView && trashedProjects.map((item) => (
                <div className={`project-row trashed-project-row ${removingIds.has(item.id) ? 'is-removing' : ''}`} key={item.id}>
                  <div className="project-open">
                    <strong>{item.title}</strong>
                    <span>{item.chapterCount} 章 · 保留至 {new Date(item.deletedAt + PROJECT_TRASH_RETENTION_MS).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="project-trash-actions">
                    <button onClick={() => void restoreDeletedProject(item.id)} title="恢复作品"><ArchiveRestore size={16} /></button>
                    <button className="danger" onClick={() => void permanentlyDeleteProject(item.id)} title="永久删除作品"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
            {!projectTrashView && <footer>
              <button className="new-project" onClick={openNewProjectDialog}><Plus size={17} />新建作品</button>
            </footer>}
          </section>
        </div>
      )}

      {newProjectDialogOpen && (
        <div className={`modal-backdrop app-dialog-backdrop ${closingModal === 'newProject' ? 'is-closing' : ''}`} onMouseDown={(event) => {
          if (event.target === event.currentTarget) void closeModal('newProject')
        }}>
          <section className="app-dialog new-project-dialog" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
            <div className="app-dialog-icon">{projectNameDialogMode === 'create' ? <Plus size={20} /> : <Pencil size={18} />}</div>
            <div className="app-dialog-copy">
              <strong id="new-project-title">{projectNameDialogMode === 'create' ? '新建作品' : '重命名作品'}</strong>
              <label className="new-project-field">
                <span>作品名称</span>
                <input
                  autoFocus
                  value={newProjectTitle}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(event) => setNewProjectTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && newProjectTitle.trim()) {
                      if (projectNameDialogMode === 'create') void createProject(newProjectTitle)
                      else void renameStoredProject()
                    }
                  }}
                />
              </label>
            </div>
            <footer>
              <button onClick={() => void closeModal('newProject')}>取消</button>
              <button
                className="primary-action"
                disabled={!newProjectTitle.trim()}
                onClick={() => projectNameDialogMode === 'create' ? void createProject(newProjectTitle) : void renameStoredProject()}
              >{projectNameDialogMode === 'create' ? '创建作品' : '保存名称'}</button>
            </footer>
          </section>
        </div>
      )}

      {pendingDocumentImport && (
        <div className="modal-backdrop">
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-label="选择导入方式">
            <header><strong>导入“{pendingDocumentImport.name}”</strong></header>
            <div className="confirm-copy">
              <p>请选择导入到当前作品，还是创建独立作品。</p>
              <span>追加章节会放入当前卷；新建作品会使用文件名作为作品名称。</span>
            </div>
            <footer>
              <button onClick={() => setPendingDocumentImport(null)}>取消</button>
              <button onClick={() => {
                const file = pendingDocumentImport
                setPendingDocumentImport(null)
                void importDocument(file, 'append')
              }}>追加章节</button>
              <button className="primary-action" onClick={() => {
                const file = pendingDocumentImport
                setPendingDocumentImport(null)
                void importDocument(file, 'new')
              }}>新建作品</button>
            </footer>
          </section>
        </div>
      )}

      {pendingVolumeDelete && (
        <div className="modal-backdrop">
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-label="删除卷">
            <header><strong>删除“{pendingVolumeDelete.title}”</strong></header>
            <div className="confirm-copy">
              <p>这个卷中有 {project.chapters.filter((chapter) => chapter.volumeId === pendingVolumeDelete.id).length} 个章节。</p>
              <span>{project.volumes.length === 1
                ? '这是最后一个卷。删除后，卷及其中章节都会移入回收站。'
                : '你可以将章节一起移到回收站，或者仅删除卷并把章节自动移动到其他卷。'}</span>
            </div>
            <footer>
              <button className="danger-action" onClick={() => void resolveVolumeDelete(true)}>删除卷和章节</button>
              {project.volumes.length > 1 && (
                <button className="primary-action" onClick={() => void resolveVolumeDelete(false)}>仅删除卷，移动章节</button>
              )}
              <button onClick={() => setPendingVolumeDeleteId(null)}>取消</button>
            </footer>
          </section>
        </div>
      )}

      {draftComparisonOpen && draftComparisonCandidates.length === 2 && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraftComparisonOpen(false) }}>
          <section className="draft-comparison-modal" role="dialog" aria-modal="true" aria-label="候选方案对比">
            <header><div><Eye size={18} /><strong>候选方案对比</strong></div><button className="icon-button" title="关闭对比" onClick={() => setDraftComparisonOpen(false)}><X size={17} /></button></header>
            <div className="draft-comparison-grid">
              {draftComparisonCandidates.map((candidate) => <article key={candidate.id}>
                <header><strong>{candidate.title}</strong><span>{candidate.text.length} 字</span></header>
                <p>{candidate.text}</p>
                <dl>
                  <dt>目标</dt><dd>{candidate.validation.goalCoverage || '未说明'}</dd>
                  <dt>新增事实</dt><dd>{candidate.validation.newFacts.join('；') || '未发现'}</dd>
                  <dt>风险</dt><dd>{[...candidate.validation.conflicts, ...candidate.validation.overlapWarnings].join('；') || '未发现'}</dd>
                </dl>
                <footer><button onClick={() => { setDraftComparisonOpen(false); void showDraftPreview(candidate) }}><Eye size={13} />正文预览</button><button className="accept" onClick={() => { setDraftComparisonOpen(false); void acceptDraftCandidate(candidate) }}>选择并写入</button></footer>
              </article>)}
            </div>
          </section>
        </div>
      )}

      {contextMenu && (() => {
        const chapter = contextMenu.kind === 'chapter' ? project.chapters.find((item) => item.id === contextMenu.id) : undefined
        const scene = contextMenu.kind === 'scene' ? project.scenes.find((item) => item.id === contextMenu.id) : undefined
        const volume = contextMenu.kind === 'volume' ? project.volumes.find((item) => item.id === contextMenu.id) : undefined
        const asset = contextMenu.kind === 'asset' ? imageAssets.find((item) => item.id === contextMenu.id) : undefined
        const attachment = contextMenu.kind === 'attachment' ? attachments.find((item) => item.id === contextMenu.id) : undefined
        const reference = contextMenu.kind === 'reference' ? referenceTexts.find((item) => item.id === contextMenu.id) : undefined
        const storedProject = contextMenu.kind === 'project' ? projects.find((item) => item.id === contextMenu.id) : undefined
        const editorMenu = contextMenu.kind === 'editor'
        const inputMenu = contextMenu.kind === 'input'
        const chapterIndex = chapter ? project.chapters.findIndex((item) => item.id === chapter.id) : -1
        const sceneSiblings = scene ? project.scenes.filter((item) => item.chapterId === scene.chapterId) : []
        const sceneIndex = scene ? sceneSiblings.findIndex((item) => item.id === scene.id) : -1
        const hasEditorSelection = editor ? !editor.state.selection.empty : false
        const hasInputSelection = inputMenu && contextInput.current
          ? (contextInput.current.selectionStart ?? 0) !== (contextInput.current.selectionEnd ?? 0)
          : false
        const estimatedMenuHeight = editorMenu && hasEditorSelection ? 390 : contextMenu.kind === 'chapter' ? 340 : 270
        return (
          <div className="context-menu" role="menu" style={{ left: Math.max(6, Math.min(contextMenu.x, window.innerWidth - 190)), top: Math.max(6, Math.min(contextMenu.y, window.innerHeight - estimatedMenuHeight)) }}>
            {editorMenu && <>
              <button disabled={!editor?.can().undo()} onClick={() => void runEditorMenuAction('undo')}><Undo2 size={15} />撤销</button>
              <button disabled={!editor?.can().redo()} onClick={() => void runEditorMenuAction('redo')}><Redo2 size={15} />重做</button>
              <div className="context-menu-separator" />
              <button disabled={!hasEditorSelection} onClick={() => void runEditorMenuAction('cut')}><Scissors size={15} />剪切</button>
              <button disabled={!hasEditorSelection} onClick={() => void runEditorMenuAction('copy')}><Copy size={15} />复制</button>
              <button onClick={() => void runEditorMenuAction('paste')}><ClipboardPaste size={15} />粘贴</button>
              {hasEditorSelection && <>
                <div className="context-menu-separator" />
                <div className="selection-agent-actions" aria-label="选区 Agent 操作">
                  <button onClick={() => prepareSelectionAgentAction('discuss')}><MessageSquareText size={14} />讨论</button>
                  <button onClick={() => prepareSelectionAgentAction('polish')}><Sparkles size={14} />润色</button>
                  <button onClick={() => prepareSelectionAgentAction('compress')}><Scissors size={14} />精简</button>
                  <button onClick={() => prepareSelectionAgentAction('expand')}><Plus size={14} />扩写</button>
                  <button onClick={() => prepareSelectionAgentAction('dialogue')}><MessageSquareText size={14} />对白</button>
                  <button onClick={() => prepareSelectionAgentAction('consistency')}><CheckCircle2 size={14} />一致性</button>
                </div>
              </>}
              <div className="context-menu-separator" />
              <button onClick={() => void runEditorMenuAction('selectAll')}><CheckCircle2 size={15} />全选</button>
            </>}
            {inputMenu && <>
              <button disabled={!hasInputSelection} onClick={() => void runInputMenuAction('cut')}><Scissors size={15} />剪切</button>
              <button disabled={!hasInputSelection} onClick={() => void runInputMenuAction('copy')}><Copy size={15} />复制</button>
              <button onClick={() => void runInputMenuAction('paste')}><ClipboardPaste size={15} />粘贴</button>
              <div className="context-menu-separator" />
              <button onClick={() => void runInputMenuAction('selectAll')}><CheckCircle2 size={15} />全选</button>
            </>}
            {chapter && <>
              <button onClick={() => void openChapter(chapter.id)}><FileText size={15} />打开章节</button>
              <button disabled={chapter.id !== project.activeChapterId} onClick={() => { toggleSceneList(chapter.id); setContextMenu(null) }}><ListTree size={15} />{expandedSceneChapters.has(chapter.id) ? '收起场景' : '显示场景'}</button>
              <button disabled={chapter.id !== project.activeChapterId} onClick={() => { addScene(chapter.id); setContextMenu(null) }}><Plus size={15} />新建场景</button>
              <button disabled={chapterIndex === 0} onClick={() => moveChapter(chapter.id, -1)}><ArrowUp size={15} />上移</button>
              <button disabled={chapterIndex === project.chapters.length - 1} onClick={() => moveChapter(chapter.id, 1)}><ArrowDown size={15} />下移</button>
              {project.volumes.length > 1 && <label className="move-volume"><span>移动到卷</span><WheelSelect ariaLabel="移动到卷" value={chapter.volumeId} options={project.volumes.map((item) => ({ value: item.id, label: item.title }))} onChange={(value) => moveChapterToVolume(chapter.id, value)} /></label>}
              <button className="danger" onClick={() => void deleteChapter(chapter.id)}><Trash2 size={15} />删除章节</button>
            </>}
            {scene && <>
              <button onClick={() => openScene(scene.id)}><ListTree size={15} />编辑场景</button>
              <button disabled={sceneIndex <= 0} onClick={() => moveScene(scene.id, -1)}><ArrowUp size={15} />上移</button>
              <button disabled={sceneIndex >= sceneSiblings.length - 1} onClick={() => moveScene(scene.id, 1)}><ArrowDown size={15} />下移</button>
              <button className="danger" disabled={sceneSiblings.length <= 1} onClick={() => void deleteScene(scene.id)}><Trash2 size={15} />删除场景</button>
            </>}
            {volume && <>
              <button onClick={() => { toggleVolume(volume.id); setContextMenu(null) }}>{collapsedVolumes.has(volume.id) ? <ChevronRight size={15} /> : <ChevronDown size={15} />}{collapsedVolumes.has(volume.id) ? '展开卷' : '折叠卷'}</button>
              <button disabled={!hasProject} onClick={() => { addChapter(volume.id); setContextMenu(null) }}><Plus size={15} />新建章节</button>
              <button className="danger" onClick={() => { setPendingVolumeDeleteId(volume.id); setContextMenu(null) }}><Trash2 size={15} />删除卷</button>
            </>}
            {storedProject && <>
              <button onClick={() => { void switchProject(storedProject.id); setContextMenu(null) }}><FolderOpen size={15} />打开作品</button>
              <button onClick={() => openRenameProjectDialog(storedProject.id)}><Pencil size={15} />重命名作品</button>
              <button className="danger" disabled={projects.length <= 1} onClick={() => { void deleteStoredProject(storedProject.id); setContextMenu(null) }}><Trash2 size={15} />删除作品</button>
            </>}
            {asset && <>
              <button onClick={() => { insertImage(asset); setContextMenu(null) }}><ImagePlus size={15} />插入正文</button>
              <button className="danger" onClick={() => { void removeImage(asset); setContextMenu(null) }}><Trash2 size={15} />删除图片</button>
            </>}
            {attachment && <>
              <button onClick={() => { void downloadAttachment(attachment); setContextMenu(null) }}><Download size={15} />下载附件</button>
              <button className="danger" onClick={() => { void removeAttachment(attachment); setContextMenu(null) }}><Trash2 size={15} />删除附件</button>
            </>}
            {reference && <>
              <button onClick={() => { void downloadReference(reference); setContextMenu(null) }}><Download size={15} />导出参考文本</button>
              <button className="danger" onClick={() => { void removeReference(reference); setContextMenu(null) }}><Trash2 size={15} />删除参考文本</button>
            </>}
          </div>
        )
      })()}

      {exportOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !exportBusy) setExportOpen(false)
        }}>
          <section className="export-modal" role="dialog" aria-modal="true" aria-label="导出文档">
            <header>
              <div><Download size={19} /><strong>导出文档</strong></div>
              <button className="icon-button" disabled={Boolean(exportBusy)} onClick={() => setExportOpen(false)} title="关闭导出"><X size={18} /></button>
            </header>
            <div className="export-options">
              <div className={`export-report ${exportReport?.missingResources ? 'has-error' : ''}`}>
                {!exportReport ? <span>正在检查…</span> : (
                  <>
                    <span>{project.chapters.length} 章</span>
                    <span>{exportReport.emptyChapters} 空章</span>
                    <span>{exportReport.duplicateVolumeNames + exportReport.duplicateChapterNames} 重名</span>
                    <span>{exportReport.missingResources} 缺失资源</span>
                  </>
                )}
              </div>
              <button onClick={() => void exportDocument('txt')} disabled={Boolean(exportBusy)}><strong>TXT</strong><span>纯文本</span></button>
              <button onClick={() => void exportDocument('md')} disabled={Boolean(exportBusy) || !exportReport || exportReport.missingResources > 0}><strong>Markdown</strong><span>{exportBusy === 'md' ? '正在生成…' : '自包含图片'}</span></button>
              <button onClick={() => void exportDocument('docx')} disabled={Boolean(exportBusy) || !exportReport || exportReport.missingResources > 0}><strong>DOCX</strong><span>{exportBusy === 'docx' ? '正在生成…' : 'Word 文档'}</span></button>
              <button onClick={() => void exportDocument('epub')} disabled={Boolean(exportBusy) || !exportReport || exportReport.missingResources > 0}><strong>EPUB</strong><span>{exportBusy === 'epub' ? '正在生成…' : '电子书'}</span></button>
            </div>
          </section>
        </div>
      )}

      {settingsOpen && (
        <div className={`modal-backdrop ${closingModal === 'settings' ? 'is-closing' : ''}`} onMouseDown={(event) => {
          if (event.target === event.currentTarget) void closeModal('settings')
        }}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-label="写作设置">
            <header>
              <div><Settings2 size={19} /><strong>写作设置</strong></div>
              <button className="icon-button" onClick={() => void closeModal('settings')} title="关闭设置"><X size={18} /></button>
            </header>
            <nav className="settings-categories" role="tablist" aria-label="设置分类">
              {([['appearance', '排版外观'], ['focus', '专注写作'], ['ai', 'AI 服务'], ['application', '应用']] as const).map(([category, label]) => (
                <button
                  key={category}
                  className={settingsCategory === category ? 'active' : ''}
                  role="tab"
                  aria-selected={settingsCategory === category}
                  onClick={() => setSettingsCategory(category)}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="settings-content">
              <div className="settings-pane" key={settingsCategory} role="tabpanel">
              {settingsCategory === 'appearance' && (<>
              <label className="setting-row">
                <span><strong>正文字号</strong><small>{preferences.fontSize} px</small></span>
                <input type="range" min="14" max="24" step="1" value={preferences.fontSize} onChange={(event) => setPreferences((current) => ({ ...current, fontSize: Number(event.target.value) }))} />
              </label>
              <label className="setting-row">
                <span><strong>界面字号</strong><small>{preferences.uiFontSize} px · AI 助手会额外放大</small></span>
                <input
                  type="range"
                  min="10"
                  max="16"
                  step="1"
                  value={preferences.uiFontSize}
                  onChange={(event) => setPreferences((current) => ({ ...current, uiFontSize: Number(event.target.value) }))}
                />
              </label>
              <div className="setting-row">
                <span><strong>界面文字颜色</strong><small>调整主要文字，提示和状态颜色仍跟随主题</small></span>
                <div className="ui-text-color-control">
                  <input
                    type="color"
                    aria-label="选择界面文字颜色"
                    value={preferences.uiTextColor || (preferences.theme === 'dark' ? '#D9DCD9' : '#292A28')}
                    onChange={(event) => setPreferences((current) => ({ ...current, uiTextColor: event.target.value.toUpperCase() }))}
                  />
                  <span>{preferences.uiTextColor || '跟随主题'}</span>
                  <button disabled={!preferences.uiTextColor} onClick={() => setPreferences((current) => ({ ...current, uiTextColor: '' }))}>重置</button>
                </div>
              </div>
              <label className="setting-row">
                <span><strong>行距</strong><small>{preferences.lineHeight.toFixed(1)}</small></span>
                <input type="range" min="1.5" max="2.5" step="0.1" value={preferences.lineHeight} onChange={(event) => setPreferences((current) => ({ ...current, lineHeight: Number(event.target.value) }))} />
              </label>
              <div className="setting-row">
                <span><strong>版心宽度</strong><small>控制每行文字长度</small></span>
                <div className="segmented-control">
                  {[620, 720, 840].map((width) => (
                    <button key={width} className={preferences.pageWidth === width ? 'active' : ''} onClick={() => setPreferences((current) => ({ ...current, pageWidth: width }))}>
                      {width === 620 ? '窄' : width === 720 ? '适中' : '宽'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setting-row">
                <span><strong>正文字体</strong><small>仅影响编辑显示</small></span>
                <div className="segmented-control">
                  <button className={preferences.fontFamily === 'serif' ? 'active' : ''} onClick={() => setPreferences((current) => ({ ...current, fontFamily: 'serif' }))}>宋体</button>
                  <button className={preferences.fontFamily === 'system' ? 'active' : ''} onClick={() => setPreferences((current) => ({ ...current, fontFamily: 'system' }))}>系统字体</button>
                </div>
              </div>
              <div className="setting-row">
                <span><strong>主题风格</strong><small>应用于整个写作界面</small></span>
                <div className="segmented-control">
                  {([
                    ['light', '明亮'],
                    ['paper', '纸张'],
                    ['dark', '深色'],
                  ] as const).map(([theme, label]) => (
                    <button key={theme} className={preferences.theme === theme ? 'active' : ''} onClick={() => setPreferences((current) => ({ ...current, theme }))}>{label}</button>
                  ))}
                </div>
              </div>
              </>)}
              {settingsCategory === 'focus' && (<>
              <label className="setting-row motion-setting">
                <span><strong>界面动效</strong><small>面板、菜单和操作反馈</small></span>
                <span className="switch-control">
                  <input
                    type="checkbox"
                    checked={pendingMotionEnabled}
                    onChange={(event) => setPendingMotionEnabled(event.target.checked)}
                  />
                  <span className="switch-track" aria-hidden="true"><span /></span>
                </span>
              </label>
              <label className="setting-row motion-setting">
                <span><strong>全屏写作</strong><small>也可按 F11 切换</small></span>
                <span className="switch-control">
                  <input type="checkbox" checked={fullscreen} onChange={(event) => void applyFullscreen(event.target.checked)} />
                  <span className="switch-track" aria-hidden="true"><span /></span>
                </span>
              </label>
              <label className="setting-row motion-setting">
                <span><strong>打字机滚动</strong><small>让当前输入行保持在视野中央</small></span>
                <span className="switch-control">
                  <input type="checkbox" checked={preferences.typewriterScroll} onChange={(event) => setPreferences((current) => ({ ...current, typewriterScroll: event.target.checked }))} />
                  <span className="switch-track" aria-hidden="true"><span /></span>
                </span>
              </label>
              <label className="setting-row motion-setting">
                <span><strong>专注当前段落</strong><small>专注模式中弱化其他段落</small></span>
                <span className="switch-control">
                  <input type="checkbox" checked={preferences.paragraphFocus} onChange={(event) => setPreferences((current) => ({ ...current, paragraphFocus: event.target.checked }))} />
                  <span className="switch-track" aria-hidden="true"><span /></span>
                </span>
              </label>
              <div className="setting-row">
                <span><strong>本章字数目标</strong><small>仅提示进度，不打断写作</small></span>
                <div className="goal-setting-control">
                  <input
                    className="goal-number-input"
                    type="number"
                    min="100"
                    max="100000"
                    step="100"
                    value={preferences.wordGoal}
                    disabled={!preferences.wordGoalEnabled}
                    onChange={(event) => setPreferences((current) => ({ ...current, wordGoal: Math.max(100, Math.min(100000, Number(event.target.value) || 100)) }))}
                    aria-label="本章目标字数"
                  />
                  <label className="switch-control">
                    <input aria-label="启用本章字数目标" type="checkbox" checked={preferences.wordGoalEnabled} onChange={(event) => setPreferences((current) => ({ ...current, wordGoalEnabled: event.target.checked }))} />
                    <span className="switch-track" aria-hidden="true"><span /></span>
                  </label>
                </div>
              </div>
              <label className="setting-row motion-setting">
                <span><strong>本次写作计时</strong><small>开启后从零记录本次时长</small></span>
                <span className="switch-control">
                  <input type="checkbox" checked={preferences.timerEnabled} onChange={(event) => setPreferences((current) => ({ ...current, timerEnabled: event.target.checked }))} />
                  <span className="switch-track" aria-hidden="true"><span /></span>
                </span>
              </label>
              </>)}
              {settingsCategory === 'ai' && (
                <div className="ai-settings-form">
                  <div className="ai-setting-field">
                    <span><strong>接口格式</strong><small>支持 Agnes 及其他 OpenAI 兼容服务</small></span>
                    <span className="ai-provider-format">OpenAI 兼容接口</span>
                  </div>
                  <div className="ai-setting-field">
                    <span><strong>API 地址</strong><small>连接成功后自动加入备选</small></span>
                    <div className="ai-endpoint-combobox" ref={aiEndpointComboboxRef}>
                      <input
                        role="combobox"
                        aria-label="API 地址"
                        aria-expanded={aiEndpointMenuOpen}
                        aria-controls="ai-endpoint-options"
                        value={aiSettings.baseUrl}
                        placeholder="https://example.com/v1"
                        onContextMenu={openInputContextMenu}
                        onBlur={() => void restoreAiCredential(aiSettings)}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowDown') {
                            event.preventDefault()
                            setAiEndpointMenuOpen(true)
                          } else if (event.key === 'Escape') {
                            setAiEndpointMenuOpen(false)
                          }
                        }}
                        onChange={(event) => updateAiEndpoint(event.target.value)}
                      />
                      <button
                        className={aiEndpointMenuOpen ? 'is-open' : ''}
                        aria-label="显示已连接的 API 地址"
                        aria-expanded={aiEndpointMenuOpen}
                        onClick={() => setAiEndpointMenuOpen((current) => !current)}
                      >
                        <ChevronDown size={15} />
                      </button>
                      {aiEndpointMenuOpen && (
                        <div className="ai-endpoint-options" id="ai-endpoint-options" role="listbox">
                          {aiSettings.successfulBaseUrls.length === 0 ? (
                            <p>连接测试成功后，地址会保存在这里</p>
                          ) : aiSettings.successfulBaseUrls.map((baseUrl) => {
                            const selected = normalizeAiEndpoint(baseUrl).toLocaleLowerCase() === normalizeAiEndpoint(aiSettings.baseUrl).toLocaleLowerCase()
                            return (
                              <div className={selected ? 'is-selected' : ''} role="option" aria-selected={selected} key={baseUrl}>
                                <button className="ai-endpoint-option" title={baseUrl} onClick={() => selectAiEndpoint(baseUrl)}>
                                  <CheckCircle2 size={14} />
                                  <span>
                                    <strong>{baseUrl}</strong>
                                    <small>{aiSettings.successfulModels[aiEndpointKey(baseUrl)] || '尚未记录模型'}</small>
                                  </span>
                                </button>
                                <button className="ai-endpoint-remove" title="从备选中移除" aria-label={`从备选中移除 ${baseUrl}`} onClick={() => forgetAiEndpoint(baseUrl)}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ai-setting-field">
                    <span><strong>模型</strong><small>用于摘要、问答和创作分析</small></span>
                    <div className="ai-model-field">
                      {aiModels.length > 0 ? (
                        <WheelSelect
                          ariaLabel="选择模型"
                          value={aiSettings.model}
                          options={aiModels.map((model) => ({ value: model, label: model }))}
                          onChange={(model) => {
                            setAiSettings((current) => ({ ...current, model }))
                            setAiConnectionStatus('idle')
                            setAiConnectionMessage('模型已更改，请重新测试')
                          }}
                        />
                      ) : (
                        <input
                          value={aiSettings.model}
                          placeholder="模型名称"
                          onContextMenu={openInputContextMenu}
                          onChange={(event) => {
                            setAiSettings((current) => ({ ...current, model: event.target.value }))
                            setAiConnectionStatus('idle')
                            setAiConnectionMessage('配置已更改，请重新测试')
                          }}
                        />
                      )}
                      <button
                        className="ai-fetch-models"
                        disabled={aiModelStatus !== 'loading' && (!aiSettings.baseUrl.trim() || !aiApiKey.trim())}
                        onClick={() => void runAiModelFetch()}
                        title={aiModelStatus === 'loading' ? '停止获取模型' : '获取模型'}
                      >
                        <RefreshCw size={14} />
                        {aiModelStatus === 'loading' ? '停止' : '获取模型'}
                      </button>
                      <small className={`ai-model-status ${aiModelStatus}`}>{aiModelMessage}</small>
                    </div>
                  </div>
                  <label className="ai-setting-field">
                    <span><strong>API Key</strong><small>{secureCredentialStorageAvailable() ? 'AI 配置与密钥均由 Windows 凭据管理器加密保存' : '浏览器模式仅保留当前会话'}</small></span>
                    <span className="ai-key-input">
                      <KeyRound size={15} />
                      <input
                        type="password"
                        value={aiApiKey}
                        placeholder="输入 API Key"
                        autoComplete="off"
                        onContextMenu={openInputContextMenu}
                        onChange={(event) => updateAiApiKey(event.target.value)}
                      />
                    </span>
                  </label>
                  <div className="ai-credential-row">
                    <span className={`ai-credential-status ${aiCredentialStatus}`}><KeyRound size={13} />{aiCredentialMessage}</span>
                    {secureCredentialStorageAvailable() && <div>
                      <button disabled={aiCredentialStatus === 'loading' || aiCredentialStatus === 'saving' || !aiApiKey.trim()} onClick={() => void persistAiCredential()}>
                        {aiCredentialStatus === 'saving' ? '处理中' : '安全保存配置'}
                      </button>
                      <button className="danger" disabled={aiCredentialStatus === 'loading' || aiCredentialStatus === 'saving'} onClick={() => void forgetAiCredential()}>删除密钥</button>
                    </div>}
                  </div>
                  <div className="ai-connection-row">
                    <span className={`ai-connection-status ${aiConnectionStatus}`}><PlugZap size={14} />{aiConnectionMessage}</span>
                    <button
                      disabled={aiConnectionStatus !== 'testing' && (!aiSettings.baseUrl.trim() || !aiApiKey.trim())}
                      onClick={() => void runAiConnectionTest()}
                    >
                      {aiConnectionStatus === 'testing' ? '停止测试' : '测试连接'}
                    </button>
                  </div>
                  <label className="ai-setting-field motion-setting">
                    <span><strong>流式接收</strong><small>边接收边显示进度，完整校验后再保存结果</small></span>
                    <span className="switch-control">
                      <input type="checkbox" checked={aiSettings.streamResponses} onChange={(event) => setAiSettings((current) => ({ ...current, streamResponses: event.target.checked }))} />
                      <span className="switch-track" aria-hidden="true"><span /></span>
                    </span>
                  </label>
                  <label className="ai-setting-field">
                    <span><strong>响应空闲超时</strong><small>连续多久没有收到数据才停止</small></span>
                    <span className="ai-budget-control">
                      <input
                        type="number"
                        min="10"
                        max="300"
                        step="10"
                        value={aiSettings.timeoutSeconds}
                        onChange={(event) => setAiSettings((current) => {
                          const timeoutSeconds = Math.max(10, Math.min(300, Math.round(Number(event.target.value) || 60)))
                          return { ...current, timeoutSeconds, totalTimeoutSeconds: Math.max(timeoutSeconds, current.totalTimeoutSeconds) }
                        })}
                      />
                      <small>秒；流式返回时每次收到数据都会重新计时</small>
                    </span>
                  </label>
                  <label className="ai-setting-field">
                    <span><strong>任务总时限</strong><small>防止复杂 Agent 任务无限运行</small></span>
                    <span className="ai-budget-control">
                      <input
                        type="number"
                        min="60"
                        max="900"
                        step="30"
                        value={aiSettings.totalTimeoutSeconds}
                        onChange={(event) => setAiSettings((current) => ({
                          ...current,
                          totalTimeoutSeconds: Math.max(current.timeoutSeconds, Math.min(900, Math.round(Number(event.target.value) || 300))),
                        }))}
                      />
                      <small>秒；分析本章和 Agent 默认最多运行 300 秒</small>
                    </span>
                  </label>
                  <div className="ai-setting-field ai-permission-setting">
                    <span><strong>作品数据权限</strong><small>只影响当前作品；关闭后对应资料不会发送</small></span>
                    <div className="ai-permission-options">
                      {([
                        ['currentChapter', '当前章节'],
                        ['otherChapters', '其他章节'],
                        ['confirmedMemory', '已确认故事资料'],
                        ['creativePlanning', '创作简报与大纲'],
                        ['styleProfile', '抽象风格档案'],
                        ['deletedChapters', '回收站章节（仅明确请求时）'],
                        ['referenceTexts', '参考文本（仅明确请求时）'],
                        ['webResearch', '联网检索（仅明确请求时）'],
                      ] as Array<[keyof AiDataPermissions, string]>).map(([field, label]) => <label key={field}>
                        <input type="checkbox" checked={aiDataPermissions[field]} onChange={(event) => updateAiDataPermission(field, event.target.checked)} />
                        <span>{label}</span>
                      </label>)}
                    </div>
                  </div>
                  <label className="ai-setting-field motion-setting">
                    <span><strong>自动轻量检查</strong><small>仅运行本地规则，不调用 AI</small></span>
                    <span className="switch-control">
                      <input type="checkbox" checked={preferences.automaticChecksEnabled} onChange={(event) => setPreferences((current) => ({ ...current, automaticChecksEnabled: event.target.checked }))} />
                      <span className="switch-track" aria-hidden="true"><span /></span>
                    </span>
                  </label>
                  <label className="ai-setting-field motion-setting">
                    <span><strong>自动整理故事记忆</strong><small>停笔 30 秒后调用 AI，只生成待确认资料</small></span>
                    <span className="switch-control">
                      <input type="checkbox" checked={preferences.automaticMemoryEnabled} onChange={(event) => setPreferences((current) => ({ ...current, automaticMemoryEnabled: event.target.checked }))} />
                      <span className="switch-track" aria-hidden="true"><span /></span>
                    </span>
                  </label>
                  <label className="ai-setting-field">
                    <span><strong>每日 Token 上限</strong><small>0 表示不限额；请求前会预留最大输出额度</small></span>
                    <span className="ai-budget-control">
                      <input
                        type="number"
                        min="0"
                        max="10000000"
                        step="1000"
                        value={aiSettings.dailyTokenLimit}
                        onChange={(event) => setAiSettings((current) => ({ ...current, dailyTokenLimit: Math.max(0, Math.min(10_000_000, Math.round(Number(event.target.value) || 0))) }))}
                      />
                      <small>今日已用 {(aiDailyUsage.promptTokens + aiDailyUsage.completionTokens).toLocaleString('zh-CN')} Token</small>
                    </span>
                  </label>
                  <div className="ai-usage-summary">
                    <span><strong>本机调用记录</strong><small>不记录正文、提示词或 API Key</small></span>
                    <div><strong>{aiUsageSummary.requests}</strong><small>请求</small><strong>{aiUsageSummary.successful}</strong><small>成功</small><strong>{aiUsageSummary.promptTokens + aiUsageSummary.completionTokens}</strong><small>Token</small></div>
                    {aiUsageSummary.requests > 0 && <button onClick={() => void clearCurrentProjectAiUsage()}>清除记录</button>}
                  </div>
                  <p className="ai-data-notice">启用 AI 功能后，只有执行具体任务所需的作品片段才会发送到 {providerLabel(aiSettings.providerId)}。</p>
                </div>
              )}
              {settingsCategory === 'application' && (
              <>
                <div className="setting-row">
                  <span><strong>当前版本</strong><small>v{import.meta.env.VITE_APP_VERSION || __APP_VERSION__}</small></span>
                </div>
                <div className="setting-row">
                  <span><strong>作品保存路径</strong><small className="project-path-value" title={preferences.projectSavePath || '未设置'}>{preferences.projectSavePath || '未设置，备份文件会下载到系统默认位置'}</small></span>
                  <div className="update-setting-control project-path-control">
                    <button onClick={() => void chooseProjectSavePath()}>
                      <FolderOpen size={14} />
                      {preferences.projectSavePath ? '更改文件夹' : '选择文件夹'}
                    </button>
                    {preferences.projectSavePath && <button className="clear-path" onClick={() => setPreferences((current) => ({ ...current, projectSavePath: '' }))}>清除</button>}
                  </div>
                </div>
                {!isTauri() && <div className="setting-row">
                  <span><strong>浏览器本地存储</strong><small>{webStorageEstimate ? `已使用 ${formatStorageBytes(webStorageEstimate.usage)} / ${formatStorageBytes(webStorageEstimate.quota)}` : '正在读取存储状态'}</small></span>
                  <div className="update-setting-control">
                    <button disabled={Boolean(webStorageEstimate?.persisted)} onClick={() => void requestWebStoragePersistence()}>
                      {webStorageEstimate?.persisted ? '已请求保留' : '请求保留数据'}
                    </button>
                  </div>
                </div>}
                <div className="setting-row">
                  <span><strong>桌面更新</strong><small title={updateMessage || undefined}>{!updaterConfigured ? '正式发布配置后启用' : updateStatus === 'checking' ? '正在检查新版本' : updateStatus === 'available' ? `发现新版本 ${updateVersion}` : updateStatus === 'current' ? '当前已是最新版本' : updateStatus === 'downloading' ? '正在下载并安装' : updateStatus === 'ready' ? '更新已安装' : updateStatus === 'error' ? `检查失败：${updateMessage || '可重试'}` : '检查并安装正式版本更新'}</small></span>
                  <div className="update-setting-control">
                    <button title={updateMessage || undefined} disabled={!updaterConfigured || updateStatus === 'checking' || updateStatus === 'downloading'} onClick={() => void checkDesktopUpdate()}>
                      {updateStatus === 'checking' ? '检查中…' : updateStatus === 'downloading' ? '安装中…' : updateStatus === 'error' ? '重试检查' : updateStatus === 'available' ? '重新检查' : '检查更新'}
                    </button>
                  </div>
                </div>
              </>
              )}
              </div>
            </div>
          </section>
        </div>
      )}

      {appDialog && (
        <div className={`modal-backdrop app-dialog-backdrop ${appDialogClosing ? 'is-closing' : ''}`}>
          <section className="app-dialog" role={appDialog.mode === 'alert' ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message">
            <div className={`app-dialog-icon ${appDialog.danger ? 'danger' : ''}`}>
              {appDialog.danger ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div className="app-dialog-copy">
              <strong id="app-dialog-title">{appDialog.title}</strong>
              <p id="app-dialog-message">{appDialog.message}</p>
            </div>
            <footer>
              {appDialog.mode === 'confirm' && <button onClick={() => void resolveAppDialog(false)}>{appDialog.cancelLabel ?? '取消'}</button>}
              <button autoFocus className={appDialog.danger ? 'danger-action' : 'primary-action'} onClick={() => void resolveAppDialog(true)}>{appDialog.confirmLabel}</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
