import { isTauri } from '@tauri-apps/api/core'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

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

function safePublicUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    const host = url.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) return ''
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
  const transport = isTauri() ? tauriFetch : globalThis.fetch
  const response = await transport(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.6',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
    },
    signal,
  })
  if (!response.ok) throw new Error(`网页请求失败（${response.status}）`)
  return response.text()
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
