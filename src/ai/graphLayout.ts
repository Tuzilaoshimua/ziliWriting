/**
 * 纯前端的图布局：Fruchterman–Reingold 简化版（斥力 + 弹簧 + 向心力）。
 * 不引第三方图论/图表库；确定性初始化避免每次渲染抖动。
 */

export type GraphLayoutNode = { id: string }
export type GraphLayoutEdge = { sourceId: string; targetId: string }
export type GraphPoint = { x: number; y: number }

export type GraphLayoutOptions = {
  width: number
  height: number
  iterations?: number
  padding?: number
  ringThreshold?: number
}

function hashValue(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function computeGraphLayout(
  nodes: GraphLayoutNode[],
  edges: GraphLayoutEdge[],
  options: GraphLayoutOptions,
): Record<string, GraphPoint> {
  const width = Math.max(160, options.width)
  const height = Math.max(120, options.height)
  const padding = options.padding ?? 44
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2
  const centerX = width / 2
  const centerY = height / 2
  const count = nodes.length
  const result: Record<string, GraphPoint> = {}
  if (count === 0) return result

  const sorted = [...nodes].sort((left, right) => left.id.localeCompare(right.id))

  // 节点过多时退化为环形布局，避免 O(n^2) × iterations 卡顿。
  const ringLimit = options.ringThreshold ?? 80
  if (count > ringLimit) {
    const radius = Math.min(innerWidth, innerHeight) / 2
    sorted.forEach((node, index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2
      result[node.id] = { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }
    })
    return result
  }

  // 确定性初始化：按 id 排序后均匀撒在圆上，加一点哈希扰动避免完全对称。
  const initialRadius = Math.min(innerWidth, innerHeight) * 0.36
  const positions = sorted.map((node, index) => {
    const angle = (index / count) * Math.PI * 2
    const jitter = ((hashValue(node.id) % 1000) / 1000 - 0.5) * 0.18
    return {
      id: node.id,
      x: centerX + Math.cos(angle) * initialRadius * (1 + jitter),
      y: centerY + Math.sin(angle) * initialRadius * (1 + jitter),
    }
  })

  const indexById = new Map(positions.map((position, index) => [position.id, index]))
  const links = edges
    .map((edge) => [indexById.get(edge.sourceId), indexById.get(edge.targetId)] as const)
    .filter((pair): pair is readonly [number, number] => pair[0] !== undefined && pair[1] !== undefined && pair[0] !== pair[1])

  const area = innerWidth * innerHeight
  const k = Math.sqrt(area / Math.max(1, count))
  const iterations = options.iterations ?? (count <= 24 ? 320 : count <= 48 ? 220 : 140)
  let temperature = Math.min(innerWidth, innerHeight) / 6

  const displacement = positions.map(() => ({ x: 0, y: 0 }))

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let index = 0; index < positions.length; index += 1) {
      displacement[index].x = 0
      displacement[index].y = 0
    }

    // 斥力
    for (let left = 0; left < positions.length; left += 1) {
      for (let right = left + 1; right < positions.length; right += 1) {
        let dx = positions[left].x - positions[right].x
        let dy = positions[left].y - positions[right].y
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 0.01) {
          dx = 0.01
          dy = 0.01
          distance = 0.014
        }
        const force = (k * k) / distance
        const ux = dx / distance
        const uy = dy / distance
        displacement[left].x += ux * force
        displacement[left].y += uy * force
        displacement[right].x -= ux * force
        displacement[right].y -= uy * force
      }
    }

    // 弹簧
    for (const [left, right] of links) {
      const dx = positions[left].x - positions[right].x
      const dy = positions[left].y - positions[right].y
      const distance = Math.max(0.01, Math.sqrt(dx * dx + dy * dy))
      const force = (distance * distance) / k
      const ux = dx / distance
      const uy = dy / distance
      displacement[left].x -= ux * force
      displacement[left].y -= uy * force
      displacement[right].x += ux * force
      displacement[right].y += uy * force
    }

    // 向心力
    for (let index = 0; index < positions.length; index += 1) {
      displacement[index].x += (centerX - positions[index].x) * 0.06
      displacement[index].y += (centerY - positions[index].y) * 0.06
    }

    // 位移 + 降温 + 边界
    for (let index = 0; index < positions.length; index += 1) {
      const magnitude = Math.max(0.01, Math.sqrt(displacement[index].x ** 2 + displacement[index].y ** 2))
      const step = Math.min(magnitude, temperature) / magnitude
      positions[index].x += displacement[index].x * step
      positions[index].y += displacement[index].y * step
      positions[index].x = Math.max(padding, Math.min(width - padding, positions[index].x))
      positions[index].y = Math.max(padding, Math.min(height - padding, positions[index].y))
    }
    temperature = Math.max(0.8, temperature * 0.985)
  }

  for (const position of positions) {
    result[position.id] = { x: position.x, y: position.y }
  }
  return result
}