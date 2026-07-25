import { isTauri } from '@tauri-apps/api/core'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import type { AiSettings } from './settings'
import { getAiUsageSummary, recordAiUsage } from '../data/aiUsageStorage'

export type AiChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }

export type AiChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string | AiChatContentPart[]
}

export type AiChatRequest = {
  messages: AiChatMessage[]
  temperature?: number
  maxTokens?: number
  responseFormat?: 'json_object'
  signal?: AbortSignal
  allowReasoningFallback?: boolean
  repairStructuredOutput?: boolean
  metadata?: {
    projectId?: string
    taskType: string
    promptVersion?: string
  }
}

export type AiChatResult = {
  content: string
  reasoningContent: string
  model: string
  promptTokens: number | null
  completionTokens: number | null
}

export type AiConnectionResult = {
  models: string[]
  configuredModelAvailable: boolean | null
  workingModel: string | null
}

type ErrorPayload = {
  error?: { message?: string }
  message?: string
}

export class AiRequestError extends Error {
  constructor(message: string, readonly status: number | null = null) {
    super(message)
    this.name = 'AiRequestError'
  }
}

class AiEmptyResponseError extends AiRequestError {
  constructor() {
    super('AI 服务没有返回文本内容')
    this.name = 'AiEmptyResponseError'
  }
}

type CompatibleContentPart = {
  type?: string
  text?: string | { value?: string }
  content?: string
}

type CompatibleChoice = {
  text?: unknown
  finish_reason?: unknown
  message?: {
    content?: unknown
    reasoning_content?: unknown
    reasoning?: unknown
  }
  delta?: {
    content?: unknown
    reasoning_content?: unknown
    reasoning?: unknown
    text?: unknown
  }
  reasoning_content?: unknown
  reasoning?: unknown
}

type CompatibleResponse = {
  choices?: CompatibleChoice[]
  output_text?: unknown
  delta?: unknown
  text?: unknown
  content?: unknown
  reasoning_content?: unknown
  reasoning?: unknown
}

function compatibleContentText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map((part) => {
    if (!part || typeof part !== 'object') return ''
    const item = part as CompatibleContentPart
    if (typeof item.text === 'string') return item.text
    if (item.text && typeof item.text === 'object' && typeof item.text.value === 'string') return item.text.value
    return typeof item.content === 'string' ? item.content : ''
  }).join('')
  if (value && typeof value === 'object') {
    const item = value as CompatibleContentPart
    if (typeof item.text === 'string') return item.text
    if (item.text && typeof item.text === 'object' && typeof item.text.value === 'string') return item.text.value
    if (typeof item.content === 'string') return item.content
  }
  return ''
}

function compatibleChoiceText(choice: CompatibleChoice | undefined, preferDelta = false) {
  if (!choice) return ''
  const primary = preferDelta ? choice.delta?.content : choice.message?.content
  const secondary = preferDelta ? choice.message?.content : choice.delta?.content
  const deltaText = preferDelta ? choice.delta?.text : undefined
  return compatibleContentText(primary) || compatibleContentText(deltaText) || compatibleContentText(secondary) || compatibleContentText(choice.text)
}

function compatibleResponseText(payload: CompatibleResponse, preferDelta = false) {
  return compatibleChoiceText(payload.choices?.[0], preferDelta)
    || compatibleContentText(payload.output_text)
    || compatibleContentText(payload.delta)
    || compatibleContentText(payload.text)
    || compatibleContentText(payload.content)
}

function compatibleReasoningText(payload: CompatibleResponse, preferDelta = false) {
  const choice = payload.choices?.[0]
  const primary = preferDelta
    ? choice?.delta?.reasoning_content ?? choice?.delta?.reasoning
    : choice?.message?.reasoning_content ?? choice?.message?.reasoning
  const secondary = preferDelta
    ? choice?.message?.reasoning_content ?? choice?.message?.reasoning
    : choice?.delta?.reasoning_content ?? choice?.delta?.reasoning
  return compatibleContentText(primary)
    || compatibleContentText(secondary)
    || compatibleContentText(choice?.reasoning_content)
    || compatibleContentText(choice?.reasoning)
    || compatibleContentText(payload.reasoning_content)
    || compatibleContentText(payload.reasoning)
}

function endpoint(baseUrl: string, path: string) {
  const normalized = baseUrl.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(normalized)) throw new AiRequestError('API 地址必须以 http:// 或 https:// 开头')
  return `${normalized}/${path.replace(/^\/+/, '')}`
}

type RequestTimeouts = {
  controller: AbortController
  clearConnectionTimeout: () => void
  resetIdleTimeout: () => void
  reason: () => 'external' | 'idle' | 'total' | null
  cleanup: () => void
}

function createRequestTimeouts(settings: AiSettings, externalSignal?: AbortSignal, totalDeadline = Date.now() + settings.totalTimeoutSeconds * 1000): RequestTimeouts {
  const controller = new AbortController()
  let timeoutReason: 'external' | 'idle' | 'total' | null = null
  let idleTimer: number | null = null
  const abort = (reason: 'external' | 'idle' | 'total') => {
    if (controller.signal.aborted) return
    timeoutReason = reason
    controller.abort()
  }
  const resetIdleTimeout = () => {
    if (idleTimer !== null) window.clearTimeout(idleTimer)
    idleTimer = window.setTimeout(() => abort('idle'), settings.timeoutSeconds * 1000)
  }
  const clearConnectionTimeout = () => {
    if (idleTimer !== null) window.clearTimeout(idleTimer)
    idleTimer = null
  }
  const totalTimer = window.setTimeout(() => abort('total'), Math.max(0, totalDeadline - Date.now()))
  const abortFromOutside = () => abort('external')
  externalSignal?.addEventListener('abort', abortFromOutside, { once: true })
  resetIdleTimeout()
  return {
    controller,
    clearConnectionTimeout,
    resetIdleTimeout,
    reason: () => timeoutReason,
    cleanup: () => {
      clearConnectionTimeout()
      window.clearTimeout(totalTimer)
      externalSignal?.removeEventListener('abort', abortFromOutside)
    },
  }
}

function timeoutError(settings: AiSettings, reason: ReturnType<RequestTimeouts['reason']>) {
  if (reason === 'external') return new AiRequestError('AI 请求已停止')
  if (reason === 'idle') return new AiRequestError(`AI 服务连续 ${settings.timeoutSeconds} 秒没有返回数据`)
  return new AiRequestError(`AI 任务超过 ${settings.totalTimeoutSeconds} 秒`)
}

async function requestJsonOnce<T>(settings: AiSettings, apiKey: string, path: string, init: RequestInit = {}, externalSignal?: AbortSignal, totalDeadline?: number): Promise<T> {
  if (!apiKey.trim()) throw new AiRequestError('请先填写 API Key')
  const timeouts = createRequestTimeouts(settings, externalSignal, totalDeadline)
  try {
    const transport = isTauri() ? tauriFetch : globalThis.fetch
    const response = await transport(endpoint(settings.baseUrl, path), {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: timeouts.controller.signal,
    })
    timeouts.clearConnectionTimeout()
    const text = await response.text()
    let payload: unknown = null
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        if (!response.ok) throw new AiRequestError(`AI 服务返回了无法识别的错误（HTTP ${response.status}）`, response.status)
      }
    }
    if (!response.ok) {
      const error = payload as ErrorPayload | null
      throw new AiRequestError(error?.error?.message || error?.message || `AI 请求失败（HTTP ${response.status}）`, response.status)
    }
    return payload as T
  } catch (error) {
    if (error instanceof AiRequestError) throw error
    if (timeouts.controller.signal.aborted) throw timeoutError(settings, timeouts.reason())
    throw new AiRequestError(error instanceof Error ? error.message : '无法连接 AI 服务')
  } finally {
    timeouts.cleanup()
  }
}

function retryable(error: unknown) {
  return error instanceof AiRequestError
    && !isModelUnavailableError(error)
    && (error.status === 429 || (error.status !== null && error.status >= 500))
}

function isModelUnavailableError(error: unknown) {
  return error instanceof AiRequestError && /no available channel for model|supported api model names|unsupported model|invalid model|model[^\n]{0,80}(?:not found|does not exist|unavailable|not available)|模型[^\n]{0,80}(?:不可用|不存在|未找到|不支持)/i.test(error.message)
}

function waitForRetry(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AiRequestError('AI 请求已停止'))
      return
    }
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new AiRequestError('AI 请求已停止'))
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, milliseconds)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function requestJson<T>(settings: AiSettings, apiKey: string, path: string, init: RequestInit = {}, externalSignal?: AbortSignal): Promise<T> {
  let lastError: unknown
  const totalDeadline = Date.now() + settings.totalTimeoutSeconds * 1000
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await requestJsonOnce<T>(settings, apiKey, path, init, externalSignal, totalDeadline)
    } catch (error) {
      lastError = error
      if (!retryable(error) || attempt === 2 || externalSignal?.aborted) throw error
      await waitForRetry(450 * (2 ** attempt), externalSignal)
    }
  }
  throw lastError
}

function saveUsage(settings: AiSettings, request: AiChatRequest, startedAt: number, success: boolean, model: string, promptTokens: number | null, completionTokens: number | null, errorCode: number | null) {
  void recordAiUsage({
    id: crypto.randomUUID(),
    projectId: request.metadata?.projectId ?? null,
    taskType: request.metadata?.taskType ?? 'chat',
    promptVersion: request.metadata?.promptVersion ?? '',
    providerId: settings.providerId,
    model,
    promptTokens,
    completionTokens,
    latencyMs: Date.now() - startedAt,
    success,
    errorCode,
    createdAt: Date.now(),
  }).catch(() => undefined)
}

function localDayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

function estimatedReservedTokens(request: AiChatRequest) {
  const inputCharacters = request.messages.reduce((total, message) => total + (typeof message.content === 'string'
    ? message.content.length
    : message.content.reduce((sum, part) => sum + (part.type === 'text' ? part.text.length : 2400), 0)), 0)
  return Math.ceil(inputCharacters / 2) + (request.maxTokens ?? 2048)
}

async function enforceDailyTokenBudget(settings: AiSettings, request: AiChatRequest) {
  if (settings.dailyTokenLimit <= 0) return
  const usage = await getAiUsageSummary(undefined, localDayStart())
  const used = usage.promptTokens + usage.completionTokens
  const reserved = estimatedReservedTokens(request)
  if (used + reserved > settings.dailyTokenLimit) {
    throw new AiRequestError(`今日 AI Token 预算不足：已使用 ${used.toLocaleString('zh-CN')}，本次最多需要约 ${reserved.toLocaleString('zh-CN')}，上限 ${settings.dailyTokenLimit.toLocaleString('zh-CN')}`)
  }
}

export async function fetchAiModels(settings: AiSettings, apiKey: string, signal?: AbortSignal): Promise<string[]> {
  const payload = await requestJson<{ data?: Array<{ id?: string }> }>(settings, apiKey, 'models', { method: 'GET' }, signal)
  return [...new Set((payload.data ?? []).map((model) => model.id?.trim()).filter((model): model is string => Boolean(model)))].sort((a, b) => a.localeCompare(b))
}

async function probeAiModel(settings: AiSettings, apiKey: string, model: string, signal?: AbortSignal) {
  await requestJson<CompatibleResponse>({ ...settings, model }, apiKey, 'chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply OK.' }],
      temperature: 0,
      max_tokens: 8,
      stream: false,
    }),
  }, signal)
}

async function findWorkingModel(settings: AiSettings, apiKey: string, models: string[], signal?: AbortSignal, failedModel = '') {
  const configured = settings.model.trim()
  const candidates = [...new Set([
    ...(configured && configured !== failedModel && (models.length === 0 || models.includes(configured)) ? [configured] : []),
    ...models.filter((model) => model !== failedModel),
  ])]
  let lastError: unknown = new AiRequestError('服务没有返回可验证的模型')
  for (const model of candidates) {
    try {
      await probeAiModel(settings, apiKey, model, signal)
      return model
    } catch (error) {
      if (signal?.aborted) throw error
      lastError = error
      if (!isModelUnavailableError(error)) throw error
    }
  }
  throw lastError
}

async function fallbackSettingsForUnavailableModel(settings: AiSettings, apiKey: string, signal?: AbortSignal) {
  const models = await fetchAiModels(settings, apiKey, signal)
  const model = await findWorkingModel(settings, apiKey, models, signal, settings.model.trim())
  const next = { ...settings, model }
  window.dispatchEvent(new CustomEvent('zili-ai-model-fallback', {
    detail: { baseUrl: settings.baseUrl, previousModel: settings.model.trim(), model },
  }))
  return next
}

export async function testAiConnection(settings: AiSettings, apiKey: string, signal?: AbortSignal): Promise<AiConnectionResult> {
  const models = await fetchAiModels(settings, apiKey, signal)
  const workingModel = await findWorkingModel(settings, apiKey, models, signal)
  return {
    models,
    configuredModelAvailable: settings.model.trim() ? workingModel === settings.model.trim() : null,
    workingModel,
  }
}

async function chatCompletionOnce(settings: AiSettings, apiKey: string, request: AiChatRequest): Promise<AiChatResult> {
  if (!settings.model.trim()) throw new AiRequestError('请先填写模型名称')
  await enforceDailyTokenBudget(settings, request)
  const startedAt = Date.now()
  try {
    type ChatPayload = CompatibleResponse & {
      model?: string
      usage?: { prompt_tokens?: number; completion_tokens?: number }
    }
    const send = (includeResponseFormat: boolean) => requestJson<ChatPayload>(settings, apiKey, 'chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: settings.model.trim(),
        messages: request.messages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 2048,
        stream: false,
        ...(includeResponseFormat && request.responseFormat ? { response_format: { type: request.responseFormat } } : {}),
      }),
    }, request.signal)
    let payload: ChatPayload
    try {
      payload = await send(true)
    } catch (error) {
      if (!(request.responseFormat && error instanceof AiRequestError && error.status === 400 && !isModelUnavailableError(error)) || request.signal?.aborted) throw error
      payload = await send(false)
    }
    const directContent = compatibleResponseText(payload).trim()
    const reasoningContent = compatibleReasoningText(payload).trim()
    const content = (directContent || (request.allowReasoningFallback === false ? '' : reasoningContent)).trim()
    if (!content && !reasoningContent) throw new AiEmptyResponseError()
    const result = {
      content,
      reasoningContent,
      model: payload.model || settings.model.trim(),
      promptTokens: payload.usage?.prompt_tokens ?? null,
      completionTokens: payload.usage?.completion_tokens ?? null,
    }
    saveUsage(settings, request, startedAt, true, result.model, result.promptTokens, result.completionTokens, null)
    return result
  } catch (error) {
    saveUsage(settings, request, startedAt, false, settings.model.trim(), null, null, error instanceof AiRequestError ? error.status : null)
    throw error
  }
}

export async function chatCompletion(settings: AiSettings, apiKey: string, request: AiChatRequest): Promise<AiChatResult> {
  try {
    return await chatCompletionOnce(settings, apiKey, request)
  } catch (error) {
    if (!isModelUnavailableError(error) || request.signal?.aborted) throw error
    const fallbackSettings = await fallbackSettingsForUnavailableModel(settings, apiKey, request.signal)
    return chatCompletionOnce(fallbackSettings, apiKey, request)
  }
}

async function streamChatCompletionOnce(settings: AiSettings, apiKey: string, request: AiChatRequest, onDelta: (text: string) => void, totalDeadline?: number): Promise<AiChatResult> {
  if (!settings.model.trim()) throw new AiRequestError('请先填写模型名称')
  if (!apiKey.trim()) throw new AiRequestError('请先填写 API Key')
  await enforceDailyTokenBudget(settings, request)
  const startedAt = Date.now()
  const timeouts = createRequestTimeouts(settings, request.signal, totalDeadline)
  try {
    const transport = isTauri() ? tauriFetch : globalThis.fetch
    const response = await transport(endpoint(settings.baseUrl, 'chat/completions'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: settings.model.trim(), messages: request.messages, temperature: request.temperature ?? 0.3, max_tokens: request.maxTokens ?? 2048, stream: true, stream_options: { include_usage: true }, ...(request.responseFormat ? { response_format: { type: request.responseFormat } } : {}) }),
      signal: timeouts.controller.signal,
    })
    timeouts.resetIdleTimeout()
    if (!response.ok) {
      let message = `AI 请求失败（HTTP ${response.status}）`
      try { const payload = await response.json() as ErrorPayload; message = payload.error?.message || payload.message || message } catch { /* keep status message */ }
      throw new AiRequestError(message, response.status)
    }
    if (!response.body) throw new AiRequestError('当前服务没有提供流式响应体')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let rawResponse = ''
    let content = ''
    let reasoningContent = ''
    let promptTokens: number | null = null
    let completionTokens: number | null = null
    let streamFinished = false
    const consumeData = (data: string) => {
      if (!data) return
      if (data === '[DONE]') {
        streamFinished = true
        return
      }
      try {
        const chunk = JSON.parse(data) as CompatibleResponse & {
          usage?: { prompt_tokens?: number; completion_tokens?: number }
          model?: string
        }
        const delta = compatibleResponseText(chunk, true)
        if (delta) { content += delta; onDelta(delta) }
        else {
          const reasoningDelta = compatibleReasoningText(chunk, true)
          if (reasoningDelta) reasoningContent += reasoningDelta
        }
        promptTokens = chunk.usage?.prompt_tokens ?? promptTokens
        completionTokens = chunk.usage?.completion_tokens ?? completionTokens
        if (typeof chunk.choices?.[0]?.finish_reason === 'string' && chunk.choices[0].finish_reason) streamFinished = true
      } catch { /* ignore non-JSON keepalive lines */ }
    }
    const consumeLine = (line: string) => {
      const normalized = line.trimStart()
      if (!normalized.startsWith('data:')) return
      consumeData(normalized.slice(5).trim())
    }
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const decoded = decoder.decode(value, { stream: true })
      if (decoded.split(/\r?\n/).some((line) => line.trim() && !line.trimStart().startsWith(':'))) timeouts.resetIdleTimeout()
      rawResponse += decoded
      buffer += decoded
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) consumeLine(line)
      if (buffer.trim() === 'data: [DONE]') {
        consumeLine(buffer)
        buffer = ''
      }
      if (streamFinished) {
        try { await reader.cancel() } catch { /* the stream may already be closed */ }
        break
      }
    }
    if (!streamFinished) {
      buffer += decoder.decode()
      if (buffer.trim()) consumeLine(buffer)
    }
    if (!content.trim()) {
      try {
        const payload = JSON.parse(rawResponse.trim()) as CompatibleResponse & { usage?: { prompt_tokens?: number; completion_tokens?: number } }
        content = compatibleResponseText(payload)
        reasoningContent = compatibleReasoningText(payload)
        promptTokens = payload.usage?.prompt_tokens ?? promptTokens
        completionTokens = payload.usage?.completion_tokens ?? completionTokens
      } catch { /* a completed SSE response may not also be a JSON document */ }
    }
    if (!content.trim() && reasoningContent.trim() && request.allowReasoningFallback !== false) {
      content = reasoningContent
      onDelta(reasoningContent)
    }
    if (!content.trim() && !reasoningContent.trim()) throw new AiEmptyResponseError()
    const result = { content: content.trim(), reasoningContent: reasoningContent.trim(), model: settings.model.trim(), promptTokens, completionTokens }
    saveUsage(settings, request, startedAt, true, result.model, promptTokens, completionTokens, null)
    return result
  } catch (error) {
    if (timeouts.controller.signal.aborted) {
      const aborted = timeoutError(settings, timeouts.reason())
      saveUsage(settings, request, startedAt, false, settings.model.trim(), null, null, null)
      throw aborted
    }
    saveUsage(settings, request, startedAt, false, settings.model.trim(), null, null, error instanceof AiRequestError ? error.status : null)
    throw error
  } finally {
    timeouts.cleanup()
  }
}

function emitStreamProgress(request: AiChatRequest, receivedCharacters: number, active: boolean) {
  window.dispatchEvent(new CustomEvent('zili-ai-stream-progress', {
    detail: {
      taskType: request.metadata?.taskType ?? 'chat',
      projectId: request.metadata?.projectId ?? null,
      receivedCharacters,
      active,
    },
  }))
}

/** 主动清除指定任务类型的流式进度条（防止进度条残留） */
export function clearStreamProgress(taskType: string, projectId?: string | null) {
  window.dispatchEvent(new CustomEvent('zili-ai-stream-progress', {
    detail: { taskType, projectId: projectId ?? null, receivedCharacters: 0, active: false },
  }))
}

export async function streamChatCompletion(settings: AiSettings, apiKey: string, request: AiChatRequest, onDelta: (text: string) => void): Promise<AiChatResult> {
  let receivedCharacters = 0
  const totalDeadline = Date.now() + settings.totalTimeoutSeconds * 1000
  emitStreamProgress(request, 0, true)
  const run = async (activeSettings: AiSettings) => {
    let lastError: unknown
    for (let attempt = 0; attempt < 3; attempt += 1) {
      let attemptReceived = 0
      try {
        return await streamChatCompletionOnce(activeSettings, apiKey, request, (delta) => {
          attemptReceived += delta.length
          receivedCharacters += delta.length
          emitStreamProgress(request, receivedCharacters, true)
          onDelta(delta)
        }, totalDeadline)
      } catch (error) {
        lastError = error
        if (!retryable(error) || attemptReceived > 0 || attempt === 2 || request.signal?.aborted) throw error
        await waitForRetry(450 * (2 ** attempt), request.signal)
      }
    }
    throw lastError
  }
  try {
    try {
      return await run(settings)
    } catch (error) {
      if (!isModelUnavailableError(error) || request.signal?.aborted || receivedCharacters > 0) throw error
      const fallbackSettings = await fallbackSettingsForUnavailableModel(settings, apiKey, request.signal)
      return run(fallbackSettings)
    }
  } finally {
    emitStreamProgress(request, receivedCharacters, false)
  }
}

function parseStructuredContent<T>(content: string): T | null {
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  const directCandidates = [
    cleaned,
    cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''),
    ...[...cleaned.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((match) => match[1]),
  ]
  for (const candidate of directCandidates) {
    try { return JSON.parse(candidate.trim()) as T } catch { /* try balanced JSON below */ }
  }
  const start = cleaned.search(/[\[{]/)
  if (start >= 0) {
    const stack: string[] = []
    let inString = false
    let escaped = false
    for (let index = start; index < cleaned.length; index += 1) {
      const character = cleaned[index]
      if (inString) {
        if (escaped) escaped = false
        else if (character === '\\') escaped = true
        else if (character === '"') inString = false
        continue
      }
      if (character === '"') { inString = true; continue }
      if (character === '{' || character === '[') stack.push(character)
      else if (character === '}' || character === ']') {
        const expected = character === '}' ? '{' : '['
        if (stack.pop() !== expected) break
        if (stack.length === 0) {
          try { return JSON.parse(cleaned.slice(start, index + 1)) as T } catch { return null }
        }
      }
    }
  }
  return null
}

export async function generateStructured<T>(
  settings: AiSettings,
  apiKey: string,
  request: AiChatRequest,
  onStreamContent?: (content: string) => void,
  onResponse?: (response: AiChatResult) => void,
): Promise<T> {
  const complete = async (activeRequest: AiChatRequest) => {
    if (!settings.streamResponses) return chatCompletion(settings, apiKey, activeRequest)
    let streamedContent = ''
    try {
      return await streamChatCompletion(settings, apiKey, activeRequest, (delta) => {
        streamedContent += delta
        onStreamContent?.(streamedContent)
      })
    } catch (error) {
      if (!(error instanceof AiEmptyResponseError) || activeRequest.signal?.aborted) throw error
      return chatCompletion(settings, apiKey, activeRequest)
    }
  }
  let result: AiChatResult
  try {
    result = await complete(request)
  } catch (error) {
    if (!(request.responseFormat && error instanceof AiRequestError && error.status === 400 && !isModelUnavailableError(error)) || request.signal?.aborted) throw error
    result = await complete({ ...request, responseFormat: undefined })
  }
  onResponse?.(result)
  const parsed = parseStructuredContent<T>(result.content)
  if (parsed !== null) return parsed
  if (request.repairStructuredOutput === false) throw new AiRequestError('AI 返回的结构不完整')
  const schema = request.messages.find((message) => message.role === 'system' && typeof message.content === 'string')?.content
  try {
    const repaired = await chatCompletion({ ...settings, streamResponses: false }, apiKey, {
      temperature: 0,
      maxTokens: request.maxTokens,
      signal: request.signal,
      metadata: { ...request.metadata, taskType: `${request.metadata?.taskType ?? 'structured'}_json_repair` },
      messages: [
        { role: 'system', content: '你只负责把已有内容整理成符合目标结构的严格 JSON。不得增加、推测或改写事实，不得输出说明、Markdown 或代码块。' },
        { role: 'user', content: `目标结构要求：\n${(typeof schema === 'string' ? schema : '返回严格 JSON').slice(0, 8000)}\n\n待修复输出：\n${result.content.slice(0, 20_000)}` },
      ],
    })
    const repairedParsed = parseStructuredContent<T>(repaired.content)
    if (repairedParsed !== null) return repairedParsed
  } catch (error) {
    if (request.signal?.aborted) throw error
  }
  throw new AiRequestError('AI 返回内容不符合要求的 JSON 结构，自动修复后仍无法读取')
}
