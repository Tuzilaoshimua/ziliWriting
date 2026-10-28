import { invoke, isTauri } from '@tauri-apps/api/core'

export type WebResearchSource = {
  title: string
  url: string
  snippet: string
  text: string
}

export function requestsWebResearch(request: string) {
  return /(?:联网|上网|网页|互联网|网络搜索|在线搜索|搜索网络|查一下网上|网上查找|网上搜索|web\s*search)/i.test(request)
}

export function webResearchQuery(request: string) {
  return request
    .replace(/(?:请|帮我|麻烦你)?\s*(?:联网|上网|到网上|在网上|通过互联网|使用互联网|搜索网页|网络搜索|在线搜索|搜索网络|查一下网上|网上查找|网上搜索|web\s*search)\s*(?:查找|搜索|查询|了解|一下|资料|相关资料|信息)?/gi, ' ')
    .replace(/(?:并|然后)?\s*(?:结合|根据)(?:搜索|查找|查询)?(?:结果|资料|信息).*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

function parseHtml(source: string) {
  return new DOMParser().parseFromString(source, 'text/html')
}

function cleanText(value: string) {
  return value.replace(/[\t\r ]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

function parseIPv4(value: string) {
  const parts = value.split('.')
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return null
  const octets = parts.map(Number)
  return octets.every((octet) => octet <= 255) ? octets : null
}

function isBlockedIPv4(octets: number[]) {
  const [first, second, third] = octets
  return first === 0
    || first === 10
    || (first === 100 && second >= 64 && second <= 127)
    || first === 127
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 0 && third === 0)
    || (first === 192 && second === 0 && third === 2)
    || (first === 192 && second === 88 && third === 99)
    || (first === 192 && second === 168)
    || (first === 198 && (second === 18 || second === 19))
    || (first === 198 && second === 51 && third === 100)
    || (first === 203 && second === 0 && third === 113)
    || first >= 224
}

function parseIPv6(value: string) {
  const host = value.startsWith('[') && value.endsWith(']') ? value.slice(1, -1) : value
  if (!host.includes(':')) return null

  let normalized = host
  if (host.includes('.')) {
    const separator = host.lastIndexOf(':')
    const octets = parseIPv4(host.slice(separator + 1))
    if (!octets || separator < 0) return null
    const high = ((octets[0] << 8) | octets[1]).toString(16)
    const low = ((octets[2] << 8) | octets[3]).toString(16)
    normalized = `${host.slice(0, separator + 1)}${high}:${low}`
  }

  const halves = normalized.split('::')
  if (halves.length > 2) return null
  const left = halves[0] ? halves[0].split(':') : []
  const right = halves.length === 2 && halves[1] ? halves[1].split(':') : []
  if ([...left, ...right].some((part) => !/^[\da-f]{1,4}$/i.test(part))) return null
  if (halves.length === 1 && left.length !== 8) return null
  if (halves.length === 2 && left.length + right.length >= 8) return null

  const words = [...left.map((part) => parseInt(part, 16))]
  while (words.length < 8 - right.length) words.push(0)
  words.push(...right.map((part) => parseInt(part, 16)))
  return words.length === 8 ? words : null
}

function isBlockedIPv6(words: number[]) {
  const isAllZero = words.every((word) => word === 0)
  const isLoopback = isAllZero || (words.slice(0, 7).every((word) => word === 0) && words[7] === 1)
  const isMappedIPv4 = words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff
  const isCompatibleIPv4 = words.slice(0, 6).every((word) => word === 0)

  return isLoopback
    || isMappedIPv4
    || isCompatibleIPv4
    || (words[0] & 0xfe00) === 0xfc00 // 唯一本地地址（fc00::/7）
    || (words[0] & 0xffc0) === 0xfe80 // 链路本地地址（fe80::/10）
    || (words[0] & 0xffc0) === 0xfec0 // 已弃用的站点本地地址（fec0::/10）
    || (words[0] & 0xff00) === 0xff00 // 多播地址（ff00::/8）
    || (words[0] === 0x0100 && words[1] === 0 && words[2] === 0 && words[3] === 0) // 仅丢弃地址（100::/64）
    || (words[0] === 0x2001 && words[1] === 0x0000) // Teredo 地址（2001::/32）
    || (words[0] === 0x2001 && words[1] === 0x0001) // 协议分配地址（2001:1::/32）
    || (words[0] === 0x2001 && words[1] === 0x0002 && words[2] === 0) // IPv6 基准测试地址（2001:2::/48）
    || (words[0] === 0x2001 && words[1] === 0x0003) // AMT 地址（2001:3::/32）
    || (words[0] === 0x2001 && words[1] === 0x0004 && words[2] === 0x0112) // AS112 地址（2001:4:112::/48）
    || (words[0] === 0x2001 && words[1] === 0x0db8) // 文档示例地址（2001:db8::/32）
    || (words[0] === 0x2001 && (words[1] & 0xfff0) === 0x0010) // ORCHID 地址（2001:10::/28）
    || (words[0] === 0x2001 && words[1] >= 0x0020 && words[1] <= 0x003f) // 保留的协议分配地址（2001:20::/28 至 2001:3f::/28）
    || words[0] === 0x2002 // 已弃用的 6to4 地址（2002::/16）
    || (words[0] === 0x0064 && words[1] === 0xff9b && words[2] === 1) // NAT64 保留地址（64:ff9b:1::/48）
}

function safePublicUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    if (url.username || url.password) return ''
    if (url.port) return ''

    const rawHost = url.hostname.toLowerCase()
    if (rawHost.endsWith('..')) return ''
    const host = rawHost.replace(/\.$/, '')
    if (!host) return ''
    if (
      host === 'localhost'
      || host === 'local'
      || host === 'localdomain'
      || host.endsWith('.localhost')
      || host.endsWith('.local')
      || host.endsWith('.home.arpa')
    ) return ''

    const ipv4 = parseIPv4(host)
    const ipv6 = parseIPv6(host)
    if (ipv4 ? isBlockedIPv4(ipv4) : ipv6 ? isBlockedIPv6(ipv6) : false) return ''
    return url.toString()
  } catch {
    return ''
  }
}

function resultUrl(value: string) {
  try {
    const url = new URL(value)
    const encoded = url.hostname.endsWith('bing.com') ? url.searchParams.get('u') ?? '' : ''
    if (encoded.startsWith('a1')) {
      const payload = encoded.slice(2).replace(/-/g, '+').replace(/_/g, '/')
      const decoded = atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='))
      return safePublicUrl(decoded)
    }
  } catch {
    return ''
  }
  return safePublicUrl(value)
}

async function fetchText(url: string, signal?: AbortSignal) {
  const safeUrl = safePublicUrl(url)
  if (!safeUrl) throw new Error('网页地址不安全')
  if (!isTauri()) throw new Error('浏览器模式暂不支持联网检索，请使用桌面版')
  if (signal?.aborted) throw new DOMException('请求已取消', 'AbortError')

  const text = await invoke<string>('fetch_web_research_text', { url: safeUrl })
  if (signal?.aborted) throw new DOMException('请求已取消', 'AbortError')
  return text
}

function searchResults(html: string) {
  const document = parseHtml(html)
  return [...document.querySelectorAll('li.b_algo')].flatMap((item) => {
    const link = item.querySelector<HTMLAnchorElement>('h2 a')
    const url = resultUrl(link?.href ?? '')
    const title = cleanText(link?.textContent ?? '')
    const snippet = cleanText(item.querySelector('.b_caption p, p')?.textContent ?? '')
    return url && title ? [{ title, url, snippet }] : []
  }).slice(0, 6)
}

function readablePageText(html: string) {
  const document = parseHtml(html)
  document.querySelectorAll('script,style,noscript,svg,nav,header,footer,form,aside').forEach((element) => element.remove())
  const root = document.querySelector('article,main,[role="main"]') ?? document.body
  return cleanText(root?.textContent ?? '').slice(0, 7000)
}

export async function researchWeb(request: string, signal?: AbortSignal): Promise<{ query: string; sources: WebResearchSource[] }> {
  if (!isTauri()) throw new Error('浏览器模式暂不支持联网检索，请使用桌面版')
  const query = webResearchQuery(request) || request.trim().slice(0, 180)
  if (!query) throw new Error('没有找到可用于联网检索的关键词')
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=zh-hans`
  const results = searchResults(await fetchText(searchUrl, signal))
  if (results.length === 0) throw new Error('搜索服务没有返回可读取的结果')
  const sources = await Promise.all(results.slice(0, 4).map(async (result) => {
    try {
      const text = readablePageText(await fetchText(result.url, signal))
      return { ...result, text: text || result.snippet }
    } catch {
      return { ...result, text: result.snippet }
    }
  }))
  return { query, sources: sources.filter((source) => source.text.trim()) }
}
