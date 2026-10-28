const EVIDENCE_MARKER = /\s*\[依据[：:]\s*[^\]\r\n]+\]/g
const DANGLING_EVIDENCE_MARKER = /\s*\[依据[：:]\s*[^\]\r\n]*$/g
const ORPHAN_EVIDENCE_ID = /\s*\[?\s*(?:依据[：:]\s*)?[0-9a-f]{8}-[0-9a-f-]{27,}\|[0-9a-f]{8}-[0-9a-f-]{27,}\s*\]?/gi
// Some models expose a shortened internal ID as “（证据id: 5259ca53…）” instead of the requested citation marker.
const SHORT_INTERNAL_EVIDENCE_MARKER = /\s*[\[(\uFF08]\s*(?:\u4f9d\u636e|\u8bc1\u636e\s*(?:id)?)\s*[:\uFF1A]\s*[0-9a-f]{8}(?:[0-9a-f-]|\||\u2026|\.{3})*\s*[\])\uFF09]/gi

export function stripInlineEvidenceMarkers(value: string) {
  return value
    .replace(EVIDENCE_MARKER, '')
    .replace(DANGLING_EVIDENCE_MARKER, '')
    .replace(ORPHAN_EVIDENCE_ID, '')
    .replace(SHORT_INTERNAL_EVIDENCE_MARKER, '')
    .trim()
}

function statements(value: string) {
  return value
    .split(/\r?\n+/)
    .flatMap((line) => line.split(/(?<=[。！？!?；;])/))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function comparable(value: string) {
  return value.replace(/^[，。、；：,;:\s]+|[，。、；：,;:\s]+$/g, '').replace(/\s+/g, '')
}

export function sanitizeCitationClaim(value: unknown, reply = '') {
  if (typeof value !== 'string') return '支持回复中的相关判断'
  const cleaned = stripInlineEvidenceMarkers(value)
    .replace(/^[，。、；：,;:\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return '支持回复中的相关判断'

  const target = comparable(cleaned)
  if (target.length >= 6 && reply) {
    const matches = statements(stripInlineEvidenceMarkers(reply)).filter((statement) => {
      const source = comparable(statement)
      return source === target || source.endsWith(target)
    })
    const recovered = matches.sort((left, right) => left.length - right.length)[0]
    if (recovered) return recovered.slice(0, 600)
  }
  return cleaned.slice(0, 600)
}

export function citationClaimBeforeMarker(reply: string, markerIndex: number) {
  const prefix = stripInlineEvidenceMarkers(reply.slice(0, markerIndex))
  const claim = statements(prefix).at(-1) ?? ''
  return sanitizeCitationClaim(claim, prefix)
}

export function sanitizeCitationsForDisplay<T extends { claim: string }>(citations: T[], reply = ''): T[] {
  return citations.map((citation) => ({ ...citation, claim: sanitizeCitationClaim(citation.claim, reply) }))
}
