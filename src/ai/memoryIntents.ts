import type { ProjectState } from '../data/projectStorage'

const CHAPTER_RANGE_PATTERN = /(?:第\s*)?(\d{1,6})\s*章?\s*(?:至|到|[-—~～])\s*(?:第\s*)?(\d{1,6})\s*章/g

export type RequestedChapterRange = {
  startNumber: number
  endNumber: number
  chapterIds: string[]
}

export function requestedChapterRange(project: ProjectState, request: string): RequestedChapterRange | null {
  const normalized = request.normalize('NFKC')
  const match = [...normalized.matchAll(CHAPTER_RANGE_PATTERN)][0]
  if (!match) return null
  const first = Number(match[1])
  const second = Number(match[2])
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null
  const startNumber = Math.max(1, Math.min(first, second))
  const endNumber = Math.min(project.chapters.length, Math.max(first, second))
  if (startNumber > endNumber) return null
  return {
    startNumber,
    endNumber,
    chapterIds: project.chapters.slice(startNumber - 1, endNumber).map((chapter) => chapter.id),
  }
}

export function requestsChapterMemoryAnalysis(request: string) {
  const normalized = request.normalize('NFKC')
  return /(?:分析|整理|提取|建立|生成|更新|扫描|归纳)/.test(normalized)
    && /(?:章|故事记忆|人物|角色|设定|剧情资料|线索|伏笔)/.test(normalized)
    && !/(?:是否合理|合不合理|怎么修改|如何修改|讨论|推演|评价)/.test(normalized)
}

export function requestsStoryMemoryProposal(request: string) {
  const normalized = request.normalize('NFKC')
  return /(?:(?:加入|添加|写入|保存|记录|收录|放进).{0,16}(?:故事记忆|人物资料|设定资料|故事资料)|(?:故事记忆|人物资料|设定资料|故事资料).{0,16}(?:加入|添加|写入|保存|记录|收录))/.test(normalized)
}
