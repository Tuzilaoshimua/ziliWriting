export type BuiltinServiceRegion = 'china' | 'international'

export type BuiltinServiceDefinition = {
  region: BuiltinServiceRegion
  label: string
  baseUrl: string
  model: string
}

export type BuiltinCredentialLease = {
  apiKey: string
  index: number
  release: (status?: number | null) => void
}

export const BUILTIN_API_KEY_SENTINEL = '__zili_builtin_service__'
export const BUILTIN_SERVICE_MODEL = 'agnes-3.0-flash'

export const BUILTIN_SERVICES: Record<BuiltinServiceRegion, BuiltinServiceDefinition> = {
  china: {
    region: 'china',
    label: '国内服务',
    baseUrl: 'https://api.agnes-ai.cn/v1',
    model: BUILTIN_SERVICE_MODEL,
  },
  international: {
    region: 'international',
    label: '国际服务',
    baseUrl: 'https://apihub.agnes-ai.com/v1',
    model: BUILTIN_SERVICE_MODEL,
  },
}

// 密钥仅以密文形式随客户端发布。客户端内置密钥无法做到真正保密，密文主要避免
// 在源码、安装包字符串表和普通日志中直接暴露；生产安全仍依赖服务方轮换和限额。
const BUILTIN_KEY_MASK = 'zili-writing-built-in-service-v1'
const ENCRYPTED_KEYS: Record<BuiltinServiceRegion, string> = {
  china: 'CQJBUHsPNRMSOiApVFIMLiQBdC0CShgsODQMMVQbG0YdPVUZFBwqGiMaKiJ/MTJeWBBeYx1GXi8ZLx4tExgiRRleNlhKJCUDOyALCl4HJSwKHWElIFQyHBpGLyo8dxt7Kz5eDU4/BGMHAkMJWAgtLD4RWQULQzg/QBQeIipuIEdLHlwzGUMaAUYeBRdaNzgcNDlvJldOAh0+BDlpFkZbBjc4AD5iBjwgRVsaU0saAz4ePUMrFHkSMwoiGCEoWjpVHT5fDWguGARFJAAvXjAcYx8fAAA0YkUAAT0dWy1VQ34KPxstZyQeOk0oCChnITsQKz5uLSJAJgYGNy8pAhpDVwgNFmNeHF8zJAQ7PVgsIgE2BmwQH24qJj0nLBAjeht9HgdaOUZDMy04BFgyXwNBB1sgRRFeRCRvAR1EOgtBAn0LMANbSRw3BA4RIB1BMDovCCZLH1ZnEFwqQRsMLUUyUx5cPy1CIz0gFVo/bV4JWBsJDV8qOm48CRcwITIUeD5AQiAnHhlHNhwRLiwLXjs9LQE1Wy0tSRoAOEMFAgkcIzsJAkE6GSc/BiIaHyVgVz4MVB5lKyobSysQIxkQD0EeCE8GOitMDh9fOA0WCRlTJV4CJGxjHUZeAz4aETQySSBXQyIoW149Ag0uWQtWHlM/Cj5DZAAmXDxWPzg/DFFpR10/XQssTg5EYwcCQz50NhQqLQxMGwJkPCQhIQMZHWtAVg46HBxGMkMbIhFeIxsERgZdDWQHKEMSA0EPBWkWRlteFigCKkAjPFxHOloMYRcMIgQGZlEBdDwXQyArUV1aHgU2KxwTdU8mETYkIC5cBwJjHx8AXzxEKV0EOAMEXVgVZhcoKxMVQgReEBsAPR1XMSA/NUtRPF8hFhoXMRYffwJ+KgYdY14cXwBFBi0eeloSC1ghQj0idwlRAjszGVZBO0MJLV1QfhwHID4GWy1fVEMiOzVmIBpDQm8BHURUUk4HBDVcNT5AQgIgQis6DRlWQA8LGmkaBWkxIQZODBoVZSBjSD4PXEQNFg05HyJtXglYBh4AfgIDaUIfCyQlBSdhE3keBRUEfj5LUSYAPDEUFBlYBSJJHypdShcENSJVIn0TOwkCQRlKJ0sdBigpD0YXBCY4BWYRKWggIDBFAAosXCxfHQcCCGQ2OwdHGjgpHw8sLARDTA==',
  international: 'CQJBWE5EFzkHMDYTZVQBOhkVRg8YZRZRQwIvBgRKG14KDFoIVzw2OjM/CSB0EEQ9IBd9Yx1GXgA6JCs5UmASeTUtByNhEBwfGjoEIFshMTkvP3wZDxUyEjNOGycSVTxWGy0uW1RHQGMHAkMCdCRGGT4AZBFaSR5UAEUeFhwaOgMZOy0sGQZGOgAHJipBGCUYWgBIHTlBFQ5DE1BpFkZbY0sAXFsaIz0oAlgLCk4yNywBHkYCOEo5Ego4IRkESDteFSQGW1pOQ1lDBhlTVSUwYx8fAAIvRwMDFzgFLlBpHGBCWFg4VQ9KMD4NLQBdAA9dWDhBPS8aCjAoOj8SFXsCRTIbG2NeHF9cHgsBUH8uPCQZGB4fFkkAK0MRMAAMFBpIND0FGHVCJR0WMQszGxYSJy4tGxkAa0VvAR1EV10dAUs4XB0+HDgGAS4bOw0UJjkGHj5/IB5pOx0UJyhaN1ouegIjKV5JBEReTQsBbV4JWAUUPmwxN0E8LD8vXgk0QwMEKD0LOl87HVgjHxg/eBgyBgg9GBgjbCAoFwJYDT1cLzsJAkFeZBhFIBwhAgQeFCIuKTpeBQN0JDIQEDopCGAleDYFFD5eGicTOB5bIWQ4RwcnMlpjHUZeJB8gLQcEHBcBKQo4JR9FQSgwJCohXgk/MFkCRxgAdykmAhlbKT8VHGU9LBsCVTY/YwcCQyl0KRwZNEJFOBQbAVcHRgI2I0EHRkwrAl4aQws5AxgBIGNbAC0aGhhbL0ApMzwCHw=='
}

type PoolState = {
  keys: string[]
  cursor: number
  active: Set<number>
  cooldownUntil: Map<number, number>
}

const pools: Record<BuiltinServiceRegion, PoolState | null> = {
  china: null,
  international: null,
}

function decodeBase64(value: string) {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function decryptKeys(value: string) {
  const encrypted = decodeBase64(value)
  const mask = new TextEncoder().encode(BUILTIN_KEY_MASK)
  const decoded = new TextDecoder().decode(encrypted.map((byte, index) => byte ^ mask[index % mask.length]))
  const keys = decoded.split('\n').map((key) => key.trim()).filter((key) => /^sk-[A-Za-z0-9_-]{20,}$/.test(key))
  if (keys.length === 0) throw new Error('内置服务密钥池不可用')
  return keys
}

function getPool(region: BuiltinServiceRegion) {
  const existing = pools[region]
  if (existing) return existing
  const pool: PoolState = {
    keys: decryptKeys(ENCRYPTED_KEYS[region]),
    cursor: 0,
    active: new Set(),
    cooldownUntil: new Map(),
  }
  pools[region] = pool
  return pool
}

function waitForRetry(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('请求已取消', 'AbortError'))
      return
    }
    const timer = window.setTimeout(resolve, milliseconds)
    const abort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('请求已取消', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
    window.setTimeout(() => signal?.removeEventListener('abort', abort), milliseconds)
  })
}

function cooldownForStatus(status: number | null | undefined) {
  if (status === 401 || status === 403) return 5 * 60 * 1000
  if (status === 429) return 45 * 1000
  if (status !== null && status !== undefined && status >= 500) return 10 * 1000
  return 0
}

export function builtinServiceSettings(region: BuiltinServiceRegion) {
  return BUILTIN_SERVICES[region]
}

export function builtinServiceKeyCount(region: BuiltinServiceRegion) {
  return getPool(region).keys.length
}

export async function acquireBuiltinCredential(region: BuiltinServiceRegion, signal?: AbortSignal): Promise<BuiltinCredentialLease> {
  const pool = getPool(region)
  while (true) {
    if (signal?.aborted) throw new DOMException('请求已取消', 'AbortError')
    const now = Date.now()
    let nextCooldown = Number.POSITIVE_INFINITY
    for (let offset = 0; offset < pool.keys.length; offset += 1) {
      const index = (pool.cursor + offset) % pool.keys.length
      if (pool.active.has(index)) continue
      const cooldownUntil = pool.cooldownUntil.get(index) ?? 0
      if (cooldownUntil > now) {
        nextCooldown = Math.min(nextCooldown, cooldownUntil)
        continue
      }
      pool.cooldownUntil.delete(index)
      pool.active.add(index)
      pool.cursor = (index + 1) % pool.keys.length
      let released = false
      return {
        apiKey: pool.keys[index],
        index,
        release: (status) => {
          if (released) return
          released = true
          pool.active.delete(index)
          const cooldown = cooldownForStatus(status)
          if (cooldown > 0) pool.cooldownUntil.set(index, Date.now() + cooldown)
        },
      }
    }
    const delay = Number.isFinite(nextCooldown) ? Math.max(50, Math.min(500, nextCooldown - now)) : 150
    await waitForRetry(delay, signal)
  }
}
