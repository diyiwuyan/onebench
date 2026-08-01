const decodeEntities = (value = '') => String(value)
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))

const cleanText = (value = '', limit = 220) => decodeEntities(value)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, limit)

const readTag = (block, names) => {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))
    if (match) return match[1]
  }
  return ''
}

const readLink = (block) => {
  const atom = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)
  if (atom) return decodeEntities(atom[1]).trim()
  return cleanText(readTag(block, ['link']), 2_000)
}

const isoDate = (value) => {
  const date = new Date(cleanText(value, 200))
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

export function parseFeedXml(xml, source = {}, limit = 30) {
  const raw = String(xml || '')
  const blocks = [...raw.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1])
  if (!blocks.length) blocks.push(...[...raw.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]))

  return blocks.slice(0, limit).map((block, index) => {
    const url = readLink(block)
    const title = cleanText(readTag(block, ['title']), 240) || '未命名资讯'
    const publishedAt = isoDate(readTag(block, ['pubDate', 'published', 'updated', 'dc:date']))
    const summary = cleanText(readTag(block, ['description', 'summary', 'content:encoded', 'content']), 180)
    const guid = cleanText(readTag(block, ['guid', 'id']), 500)
    return {
      id: `${source.id || 'feed'}-${guid || url || `${title}-${index}`}`,
      title,
      category: source.category || '资讯',
      summary,
      source: source.name || '',
      sourceId: source.id || '',
      url,
      publishedAt,
      tags: Array.isArray(source.tags) ? source.tags : [],
      hot: false,
    }
  }).filter((item) => item.url && /^https?:\/\//i.test(item.url))
}

export function normalizeSnapshotItems(items, limit = 120) {
  const seen = new Set()
  return items
    .filter((item) => {
      const key = `${item.url || ''}|${item.title || ''}`.toLowerCase()
      if (!item.title || !item.url || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, limit)
}

export function snapshotForSource(snapshot, source) {
  const items = (snapshot.items || []).filter((item) => item.sourceId === source.id)
  return {
    schemaVersion: 1,
    feedUrl: source.url,
    sourceId: source.id,
    title: source.name,
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      meta: [item.source, item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('zh-CN') : ''].filter(Boolean).join(' · '),
      url: item.url,
      publishedAt: item.publishedAt,
    })),
    updatedAt: snapshot.generatedAt,
    provider: 'OneBench 公共资讯快照',
  }
}
