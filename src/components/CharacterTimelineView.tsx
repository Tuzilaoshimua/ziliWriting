import { useMemo, useState } from 'react'
import type { ProjectState } from '../data/projectStorage'
import type { CharacterMemoryProfile } from '../ai/memoryWorkspace'
import type { MemoryCandidate } from '../data/storyMemoryStorage'
import { buildCharacterTimeline, timelineEntryCandidate, type CharacterTimelineEntry } from '../ai/relationshipGraph'

const WIDTH = 760
const LEFT = 96
const RIGHT = 26
const TOP = 34
const LANE_HEIGHT = 58

type Props = {
  profiles: CharacterMemoryProfile[]
  project: ProjectState
  onOpenEvidence: (candidate: MemoryCandidate) => void
}

function aspectColor(aspect: string) {
  let hash = 0
  for (let index = 0; index < aspect.length; index += 1) hash = (hash * 31 + aspect.charCodeAt(index)) % 360
  return `hsl(${hash}, 46%, 44%)`
}

export function CharacterTimelineView({ profiles, project, onOpenEvidence }: Props) {
  const timeline = useMemo(() => buildCharacterTimeline(profiles, project, { maxLanes: 6 }), [profiles, project])
  const [selected, setSelected] = useState<CharacterTimelineEntry | null>(null)

  const maxIndex = Math.max(1, timeline.chapters.length - 1)
  const plotWidth = WIDTH - LEFT - RIGHT
  const height = TOP + timeline.lanes.length * LANE_HEIGHT + 18
  const xFor = (chapterIndex: number) => LEFT + (chapterIndex / maxIndex) * plotWidth

  const ticks = useMemo(() => {
    const total = timeline.chapters.length
    if (total <= 1) return timeline.chapters
    const step = Math.max(1, Math.ceil(total / 8))
    const result: typeof timeline.chapters = []
    for (let index = 0; index < total; index += step) result.push(timeline.chapters[index])
    if (result[result.length - 1]?.index !== total - 1) result.push(timeline.chapters[total - 1])
    return result
  }, [timeline.chapters])

  if (timeline.lanes.length === 0) {
    return <p className="memory-empty">还没有人物状态变化。在「当前章」里分析并确认「人物状态」后，这里会按章节画出变化轨迹。</p>
  }

  return (
    <div className="character-timeline">
      <div className="character-timeline-toolbar">
        <span>{timeline.lanes.length} 条泳道 · {timeline.chapters.length} 章</span>
        <span className="character-timeline-aspects">
          {timeline.aspects.map((aspect) => <i key={aspect} style={{ background: aspectColor(aspect) }} title={aspect}>{aspect}</i>)}
        </span>
      </div>

      <div className="character-timeline-canvas">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="人物状态时间轴">
          {ticks.map((chapter) => (
            <g key={chapter.id}>
              <line x1={xFor(chapter.index)} y1={TOP - 12} x2={xFor(chapter.index)} y2={height - 12} stroke="#e2ded4" strokeWidth={1} />
              <text className="timeline-tick" x={xFor(chapter.index)} y={TOP - 18} textAnchor="middle">
                {chapter.title.length > 6 ? `${chapter.title.slice(0, 6)}…` : chapter.title}
              </text>
            </g>
          ))}

          {timeline.lanes.map((lane, laneIndex) => {
            const y = TOP + laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2
            return (
              <g key={lane.id}>
                <line x1={LEFT} y1={y} x2={WIDTH - RIGHT} y2={y} stroke="#eeeae1" strokeWidth={1} />
                <text className="timeline-lane-name" x={LEFT - 12} y={y + 4} textAnchor="end">
                  {lane.name.length > 6 ? `${lane.name.slice(0, 6)}…` : lane.name}
                </text>
                {lane.entries.map((entry) => {
                  const active = selected?.id === entry.id
                  const color = aspectColor(entry.aspect)
                  const cx = xFor(entry.chapterIndex)
                  return (
                    <g key={entry.id} className={`timeline-point ${active ? 'is-active' : ''}`} onClick={() => setSelected(active ? null : entry)}>
                      <circle cx={cx} cy={y} r={active ? 7 : 5} fill={color} stroke="#fff" strokeWidth={1.5} />
                      <title>{`${entry.chapterTitle} · ${entry.aspect}：${entry.value}`}</title>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {selected && (
        <article className="relationship-detail">
          <header>
            <div>
              <strong>{selected.profileName} · {selected.aspect}</strong>
              <small>{selected.chapterTitle}{selected.storyTime ? ` · 故事时间：${selected.storyTime}` : ''}</small>
            </div>
            <button
              onClick={() => {
                const candidate = timelineEntryCandidate(profiles, selected)
                if (candidate) onOpenEvidence(candidate)
              }}
            >查看原文</button>
          </header>
          <p>
            {selected.previousValue ? <><s>{selected.previousValue}</s> → </> : null}
            <strong>{selected.value}</strong>
          </p>
          {selected.evidenceQuote && <blockquote>{selected.evidenceQuote}</blockquote>}
        </article>
      )}
    </div>
  )
}