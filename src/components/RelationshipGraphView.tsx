import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import type { ProjectState } from '../data/projectStorage'
import type { CharacterMemoryProfile } from '../ai/memoryWorkspace'
import type { MemoryCandidate } from '../data/storyMemoryStorage'
import {
  buildRelationshipGraph,
  RELATIONSHIP_CATEGORY_LABELS,
  relationshipEdgeCandidate,
  type RelationshipCategory,
  type RelationshipGraphScope,
} from '../ai/relationshipGraph'
import { computeGraphLayout } from '../ai/graphLayout'

const WIDTH = 760
const HEIGHT = 500

const CATEGORY_COLORS: Record<RelationshipCategory, string> = {
  kin: '#c9863f',
  romance: '#c8557a',
  ally: '#3f7d6b',
  rival: '#b0453b',
  transaction: '#6b6a9c',
  other: '#8a8a8a',
}

type Props = {
  profiles: CharacterMemoryProfile[]
  project: ProjectState
  scope: RelationshipGraphScope
  onScopeChange: (scope: RelationshipGraphScope) => void
  search: string
  currentChapterId: string
  currentVolumeId: string
  onOpenEvidence: (candidate: MemoryCandidate) => void
}

function normalizeName(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

export function RelationshipGraphView({ profiles, project, scope, onScopeChange, search, currentChapterId, currentVolumeId, onOpenEvidence }: Props) {
  const graph = useMemo(() => buildRelationshipGraph(profiles, project, scope), [profiles, project, scope])
  const signature = useMemo(() => `${graph.nodes.map((node) => node.id).join(',')}::${graph.edges.map((edge) => edge.id).join(',')}`, [graph])

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [hoverEdgeId, setHoverEdgeId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    setPositions(computeGraphLayout(graph.nodes, graph.edges, { width: WIDTH, height: HEIGHT }))
    setSelectedEdgeId(null)
    setSelectedNodeId((current) => (current && graph.nodes.some((node) => node.id === current) ? current : null))
    setZoom(1)
    setPan({ x: 0, y: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  const selectedEdge = graph.edges.find((edge) => edge.id === selectedEdgeId) ?? null
  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? null

  const neighborIds = useMemo(() => {
    const set = new Set<string>()
    if (!selectedNodeId) return set
    for (const edge of graph.edges) {
      if (edge.sourceId === selectedNodeId) set.add(edge.targetId)
      if (edge.targetId === selectedNodeId) set.add(edge.sourceId)
    }
    return set
  }, [graph.edges, selectedNodeId])

  const matchedIds = useMemo(() => {
    const key = normalizeName(search)
    if (!key) return new Set<string>()
    return new Set(graph.nodes.filter((node) => normalizeName(node.name).includes(key) || node.aliases.some((alias) => normalizeName(alias).includes(key))).map((node) => node.id))
  }, [graph.nodes, search])

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / Math.max(1, rect.width)) * WIDTH,
      y: ((clientY - rect.top) / Math.max(1, rect.height)) * HEIGHT,
    }
  }
  const toGraphPoint = (svgPoint: { x: number; y: number }) => ({
    x: (svgPoint.x - pan.x) / zoom,
    y: (svgPoint.y - pan.y) / zoom,
  })

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault()
    const svgPoint = toSvgPoint(event.clientX, event.clientY)
    const graphPoint = toGraphPoint(svgPoint)
    const nextZoom = Math.max(0.4, Math.min(3, zoom * (event.deltaY < 0 ? 1.12 : 0.89)))
    setZoom(nextZoom)
    setPan({ x: svgPoint.x - graphPoint.x * nextZoom, y: svgPoint.y - graphPoint.y * nextZoom })
  }

  const handleNodePointerDown = (event: ReactPointerEvent<SVGGElement>, nodeId: string) => {
    event.stopPropagation()
    const point = toGraphPoint(toSvgPoint(event.clientX, event.clientY))
    const current = positions[nodeId]
    dragRef.current = { id: nodeId, offsetX: point.x - (current?.x ?? 0), offsetY: point.y - (current?.y ?? 0) }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (drag) {
      const point = toGraphPoint(toSvgPoint(event.clientX, event.clientY))
      setPositions((previous) => ({ ...previous, [drag.id]: { x: point.x - drag.offsetX, y: point.y - drag.offsetY } }))
      return
    }
    const panning = panRef.current
    if (panning) {
      setPan({
        x: panning.originX + (event.clientX - panning.startX),
        y: panning.originY + (event.clientY - panning.startY),
      })
    }
  }

  const handlePointerUp = () => {
    dragRef.current = null
    panRef.current = null
  }

  const isEdgeDimmed = (edgeId: string, edge: { sourceId: string; targetId: string }) => {
    if (selectedEdgeId) return edgeId !== selectedEdgeId
    if (!selectedNodeId) return false
    return edge.sourceId !== selectedNodeId && edge.targetId !== selectedNodeId
  }

  const isNodeDimmed = (nodeId: string) => {
    if (matchedIds.size > 0 && !matchedIds.has(nodeId)) return true
    if (!selectedNodeId) return false
    return nodeId !== selectedNodeId && !neighborIds.has(nodeId)
  }

  return (
    <div className="relationship-graph">
      <div className="relationship-graph-toolbar">
        <div className="relationship-scope-group" role="group" aria-label="关系范围">
          <button className={scope.mode === 'book' ? 'active' : ''} onClick={() => onScopeChange({ mode: 'book' })}>全书</button>
          <button
            className={scope.mode === 'volume' ? 'active' : ''}
            disabled={!currentVolumeId}
            onClick={() => onScopeChange({ mode: 'volume', volumeId: currentVolumeId })}
          >本卷</button>
          <button
            className={scope.mode === 'untilChapter' ? 'active' : ''}
            disabled={!currentChapterId}
            onClick={() => onScopeChange({ mode: 'untilChapter', chapterId: currentChapterId })}
          >截至本章</button>
        </div>
        <span className="relationship-graph-meta">
          {graph.nodes.length} 人 · {graph.edges.length} 条关系
          {graph.unmatchedRelationships > 0 ? ` · 未匹配 ${graph.unmatchedRelationships} 条` : ''}
        </span>
        <button className="relationship-reset" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setSelectedNodeId(null); setSelectedEdgeId(null) }}>重置视图</button>
      </div>

      {graph.nodes.length === 0 ? (
        <p className="memory-empty">还没有可用于作图的人物关系。先在「当前章」里分析并确认人物与关系资料，再回到这里。</p>
      ) : (
        <>
          <div className="relationship-graph-canvas">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label="人物关系图"
              onWheel={handleWheel}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerDown={(event) => {
                const target = event.target as SVGElement
                if (target.closest('.graph-node')) return
                panRef.current = { startX: event.clientX, startY: event.clientY, originX: pan.x, originY: pan.y }
                setSelectedEdgeId(null)
                setSelectedNodeId(null)
              }}
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {graph.edges.map((edge) => {
                  const source = positions[edge.sourceId]
                  const target = positions[edge.targetId]
                  if (!source || !target) return null
                  const dimmed = isEdgeDimmed(edge.id, edge)
                  const active = edge.id === selectedEdgeId || edge.id === hoverEdgeId
                  const showLabel = active || (graph.edges.length <= 18 && zoom > 0.65)
                  return (
                    <g key={edge.id} className={`graph-edge ${active ? 'is-active' : ''}`} opacity={dimmed ? 0.16 : 0.85}>
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={CATEGORY_COLORS[edge.category]}
                        strokeWidth={active ? 2.6 : 1.5}
                        strokeDasharray={edge.category === 'rival' ? '6 4' : undefined}
                      />
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="transparent"
                        strokeWidth={14}
                        className="graph-edge-hit"
                        onPointerEnter={() => setHoverEdgeId(edge.id)}
                        onPointerLeave={() => setHoverEdgeId(null)}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedEdgeId(edge.id)
                          setSelectedNodeId(null)
                        }}
                      />
                      {showLabel && (
                        <text
                          className="graph-edge-label"
                          x={(source.x + target.x) / 2}
                          y={(source.y + target.y) / 2 - 4}
                          fill={CATEGORY_COLORS[edge.category]}
                          pointerEvents="none"
                        >{edge.label.length > 12 ? `${edge.label.slice(0, 12)}…` : edge.label}</text>
                      )}
                    </g>
                  )
                })}

                {graph.nodes.map((node) => {
                  const point = positions[node.id]
                  if (!point) return null
                  const radius = Math.max(6, Math.min(17, 6 + Math.log2(node.evidenceCount + 1) * 2.4))
                  const dimmed = isNodeDimmed(node.id)
                  const selected = node.id === selectedNodeId
                  const matched = matchedIds.has(node.id)
                  return (
                    <g
                      key={node.id}
                      className={`graph-node ${selected ? 'is-selected' : ''} ${matched ? 'is-matched' : ''}`}
                      opacity={dimmed ? 0.22 : 1}
                      onPointerDown={(event) => handleNodePointerDown(event, node.id)}
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedNodeId(node.id)
                        setSelectedEdgeId(null)
                      }}
                    >
                      <circle cx={point.x} cy={point.y} r={radius} />
                      <text x={point.x} y={point.y + radius + 13} textAnchor="middle" pointerEvents="none">
                        {node.name.length > 8 ? `${node.name.slice(0, 8)}…` : node.name}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>

          <div className="relationship-graph-legend" aria-label="关系类型图例">
            {(Object.keys(CATEGORY_COLORS) as RelationshipCategory[]).map((category) => (
              <span key={category}><i style={{ background: CATEGORY_COLORS[category] }} />{RELATIONSHIP_CATEGORY_LABELS[category]}</span>
            ))}
            <span className="relationship-graph-hint">滚轮缩放 · 拖拽节点或空白处平移</span>
          </div>

          {selectedEdge && (
            <article className="relationship-detail">
              <header>
                <div>
                  <strong>{selectedEdge.label}</strong>
                  <small>{selectedEdge.chapterTitle} · {RELATIONSHIP_CATEGORY_LABELS[selectedEdge.category]}</small>
                </div>
                <button
                  onClick={() => {
                    const candidate = relationshipEdgeCandidate(profiles, selectedEdge)
                    if (candidate) onOpenEvidence(candidate)
                  }}
                >查看原文</button>
              </header>
              <p>{selectedEdge.detail}</p>
              {selectedEdge.evidenceQuote && <blockquote>{selectedEdge.evidenceQuote}</blockquote>}
            </article>
          )}

          {!selectedEdge && selectedNode && (
            <article className="relationship-detail">
              <header>
                <div>
                  <strong>{selectedNode.name}</strong>
                  <small>{selectedNode.aliases.length > 0 ? `别名：${selectedNode.aliases.join('、')} · ` : ''}{selectedNode.evidenceCount} 条证据 · {selectedNode.degree} 条关系</small>
                </div>
              </header>
              <ul className="relationship-node-edges">
                {graph.edges.filter((edge) => edge.sourceId === selectedNode.id || edge.targetId === selectedNode.id).slice(0, 6).map((edge) => {
                  const otherId = edge.sourceId === selectedNode.id ? edge.targetId : edge.sourceId
                  const other = graph.nodes.find((node) => node.id === otherId)
                  return (
                    <li key={edge.id}>
                      <button onClick={() => { setSelectedEdgeId(edge.id); setSelectedNodeId(null) }}>
                        <span style={{ color: CATEGORY_COLORS[edge.category] }}>{edge.label}</span>
                        <small>{other?.name ?? '未知'} · {edge.chapterTitle}</small>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </article>
          )}
        </>
      )}
    </div>
  )
}