import type { StyleProfile } from '../data/styleStorage'
import type { AiSettings } from './settings'
import { AiRequestError, generateStructured } from './client'

export type StyleReferenceSource = { id: string; fileName: string; text: string }

function clean(value: unknown, maximum = 1200) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function hashFragment(fragment: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < fragment.length; index += 1) {
    hash ^= fragment.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function createReferenceFingerprints(sources: StyleReferenceSource[]) {
  const fingerprints = new Set<string>()
  const size = 36
  for (const source of sources) {
    const normalized = source.text.replace(/\s+/g, '')
    for (let index = 0; index <= normalized.length - size && fingerprints.size < 12000; index += 4) {
      fingerprints.add(hashFragment(normalized.slice(index, index + size)))
    }
  }
  return [...fingerprints]
}

export function findReferenceOverlap(candidate: string, fingerprints: string[]) {
  if (fingerprints.length === 0) return ''
  const known = new Set(fingerprints)
  const normalized = candidate.replace(/\s+/g, '')
  const size = 36
  for (let index = 0; index <= normalized.length - size; index += 1) {
    const fragment = normalized.slice(index, index + size)
    if (known.has(hashFragment(fragment))) return fragment
  }
  return ''
}

export async function analyzeStyleProfile(
  settings: AiSettings,
  apiKey: string,
  projectId: string,
  sources: StyleReferenceSource[],
  signal?: AbortSignal,
): Promise<StyleProfile> {
  if (sources.length === 0) throw new AiRequestError('请先导入至少一份参考文本')
  const excerpts = sources.map((source) => ({ id: source.id, fileName: source.fileName, excerpt: source.text.slice(0, 16000) }))
  const total = excerpts.reduce((sum, item) => sum + item.excerpt.length, 0)
  if (total > 60000) {
    let remaining = 56000
    for (const item of excerpts) {
      item.excerpt = item.excerpt.slice(0, Math.max(2000, Math.floor(remaining / Math.max(1, excerpts.length))))
      remaining -= item.excerpt.length
    }
  }
  const result = await generateStructured<Record<string, unknown>>(settings, apiKey, {
    temperature: 0.15,
    maxTokens: 3000,
    signal,
    metadata: { projectId, taskType: 'style_profile', promptVersion: '1' },
    messages: [
      {
        role: 'system',
        content: `你是小说文本风格分析助手。只提取可编辑的抽象特征，不评价优劣，不命名或模仿作者，不复述原文长句。
返回 JSON：{"sentenceRhythm":"句长与节奏","paragraphRhythm":"段落节奏","compositionBalance":"对白/动作/心理/环境比例","pointOfView":"叙事视角","narrativeDistance":"视角距离","lexicalDensity":"词汇密度","rhetoricIntensity":"修辞强度","emotionalTone":"情绪基调","revelationPattern":"信息揭示方式","chapterEndingPattern":"章节结尾模式","editableGuidance":"供作者编辑的抽象写作指导"}。`,
      },
      { role: 'user', content: `以下文本均已由用户确认具有处理权限。只分析抽象特征：\n${JSON.stringify(excerpts)}` },
    ],
  })
  return {
    projectId,
    sourceReferenceIds: sources.map((source) => source.id),
    sentenceRhythm: clean(result.sentenceRhythm),
    paragraphRhythm: clean(result.paragraphRhythm),
    compositionBalance: clean(result.compositionBalance),
    pointOfView: clean(result.pointOfView),
    narrativeDistance: clean(result.narrativeDistance),
    lexicalDensity: clean(result.lexicalDensity),
    rhetoricIntensity: clean(result.rhetoricIntensity),
    emotionalTone: clean(result.emotionalTone),
    revelationPattern: clean(result.revelationPattern),
    chapterEndingPattern: clean(result.chapterEndingPattern),
    editableGuidance: clean(result.editableGuidance, 2200),
    referenceFingerprints: createReferenceFingerprints(sources),
    updatedAt: Date.now(),
  }
}
