import type { MemoryCandidate } from '../data/storyMemoryStorage'

export function applyAutomaticMemoryArchival(candidate: MemoryCandidate): MemoryCandidate {
  const highImpact = /身份|秘密|阵营|关系|规则|能力|死亡|生死|关键|唯一|必须|禁止|承诺|威胁|伏笔|主线/
  const lowRisk = ['location', 'item'].includes(candidate.kind)
    && candidate.metadata.nature === 'objective'
    && !candidate.metadata.knower.trim()
    && !candidate.metadata.affectedScope.trim()
    && candidate.confidence >= 0.995
    && candidate.evidenceQuote.trim().length >= 10
    && !highImpact.test(`${candidate.title}${candidate.detail}`)
  return lowRisk
    ? { ...candidate, status: 'archived', metadata: { ...candidate.metadata, archivalSource: 'automatic' } }
    : candidate
}
