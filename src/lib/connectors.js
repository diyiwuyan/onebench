const ROLE_NEWS_TOPICS = {
  university: ['教育', '大学', '就业', '科技'],
  teacher: ['教育', '教学', '学校', '科技'],
  'postgraduate-exam': ['教育', '研究', '科技', '就业'],
  'civil-service-exam': ['公共政策', '国内', '财经', '社会'],
  creator: ['创作', '科技', '工具', '商业'],
  operations: ['职场', '科技', '商业', '财经'],
  freelancer: ['创作', '职场', '商业', '财经'],
  'team-lead': ['职场', '商业', '管理', '科技'],
  financial: ['财经', '商业', '国内', '国际'],
  'family-baby': ['育儿', '家庭', '健康', '教育'],
  office: ['职场', '效率', '科技', '财经'],
  sales: ['商业', '财经', '职场', '科技'],
  'small-business': ['商业', '财经', '科技', '国内'],
  'job-search': ['就业', '职场', '教育', '科技'],
  senior: ['健康', '家庭', '社会', '国内'],
}

const safeHost = (value) => {
  try { return new URL(value).hostname.replace(/^www\./, '') } catch { return '' }
}

const normalizeTopics = (topics) => String(topics || '')
  .split(/[，,、\n]/)
  .map((item) => item.trim())
  .filter(Boolean)
  .slice(0, 5)

const dataUrl = (relativePath) => {
  const base = typeof document !== 'undefined' ? document.baseURI : 'http://localhost/'
  return new URL(relativePath.replace(/^\//, ''), base).toString()
}

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = response.headers.get('content-type') || ''
  if (!type.includes('json')) throw new Error('返回内容不是 JSON')
  return response.json()
}

const decodeEntities = (value = '') => String(value)
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")

const cleanFeedText = (value = '', limit = 220) => decodeEntities(value)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit)

const parseFeedXml = (xml, feedUrl, limit) => {
  const raw = String(xml || '')
  const blocks = [...raw.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1])
  if (!blocks.length) blocks.push(...[...raw.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]))
  const readTag = (block, names) => {
    for (const name of names) {
      const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))
      if (match) return match[1]
    }
    return ''
  }
  const title = cleanFeedText(readTag(raw, ['title']), 160) || safeHost(feedUrl)
  const items = blocks.slice(0, limit).map((block, index) => {
    const atomLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
    const url = decodeEntities(atomLink || cleanFeedText(readTag(block, ['link']), 2_000)).trim()
    const rawDate = cleanFeedText(readTag(block, ['pubDate', 'published', 'updated', 'dc:date']), 200)
    const date = new Date(rawDate)
    return {
      id: cleanFeedText(readTag(block, ['guid', 'id']), 500) || url || `rss-${index}`,
      title: cleanFeedText(readTag(block, ['title']), 240) || '未命名文章',
      meta: `${title} · ${Number.isNaN(date.getTime()) ? '刚刚更新' : date.toLocaleDateString('zh-CN')}`,
      url,
      publishedAt: Number.isNaN(date.getTime()) ? '' : date.toISOString(),
    }
  }).filter((item) => /^https?:\/\//i.test(item.url))
  return { title, items }
}

export async function fetchRoleNews({ roleId, topics, limit = 10 } = {}) {
  const customTopics = normalizeTopics(topics)
  const defaultTopics = ROLE_NEWS_TOPICS[roleId] || ['科技', '效率', '社会']
  const selectedTopics = customTopics.length ? customTopics : defaultTopics
  let payload
  try {
    payload = await fetchJson(dataUrl('data/news.json'))
  } catch {
    throw new Error('公共资讯暂时不可用')
  }
  const scored = (payload.items || []).map((item) => {
    const haystack = `${item.title || ''} ${item.summary || ''} ${(item.tags || []).join(' ')} ${item.category || ''}`.toLowerCase()
    return { item, score: selectedTopics.reduce((score, topic) => score + (haystack.includes(topic.toLowerCase()) ? 1 : 0), 0) }
  })
  const matched = scored.filter(({ score }) => score > 0).sort((a, b) => b.score - a.score)
  const items = (matched.length ? matched : scored).slice(0, limit).map(({ item }) => item)
  if (!items.length) throw new Error('没有找到符合当前主题的资讯')
  return {
    items,
    updatedAt: payload.generatedAt || new Date().toISOString(),
    provider: payload.provider || 'OneBench 公共资讯快照',
    query: selectedTopics.join('、'),
  }
}

export async function fetchRssFeed(feedUrl, limit = 10) {
  const normalized = String(feedUrl || '').trim()
  if (!/^https?:\/\//i.test(normalized)) throw new Error('请输入完整的 RSS 地址')
  try {
    const catalog = await fetchJson(dataUrl('data/feed-catalog.json'))
    const source = (catalog.sources || []).find((item) => item.url.replace(/\/$/, '') === normalized.replace(/\/$/, ''))
    if (source?.snapshot) {
      const cached = await fetchJson(dataUrl(source.snapshot))
      return { ...cached, feedUrl: normalized, items: (cached.items || []).slice(0, limit) }
    }
  } catch {}

  try {
    const payload = await fetchJson(`${dataUrl('api/rss')}?url=${encodeURIComponent(normalized)}&limit=${limit}`)
    return payload
  } catch {}

  try {
    const response = await fetch(normalized, { headers: { Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const parsed = parseFeedXml(await response.text(), normalized, limit)
    if (!parsed.items.length) throw new Error('订阅源里没有可读取的文章')
    return { feedUrl: normalized, ...parsed, updatedAt: new Date().toISOString(), provider: '订阅源直连' }
  } catch {
    throw new Error('这个订阅源无法直接读取；可改用模块内置的公共源，或部署带 RSS 服务的在线版')
  }
}

export async function fetchExchangeRates(base = 'CNY', symbols = ['USD', 'EUR', 'JPY', 'HKD']) {
  const normalizedBase = String(base || 'CNY').toUpperCase()
  const normalizedSymbols = symbols.map((item) => String(item).trim().toUpperCase()).filter(Boolean).filter((item) => item !== normalizedBase).slice(0, 6)
  const response = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(normalizedBase)}&to=${encodeURIComponent(normalizedSymbols.join(','))}`)
  if (!response.ok) throw new Error(`汇率服务暂时不可用（${response.status}）`)
  const payload = await response.json()
  return {
    base: payload.base || normalizedBase,
    rates: Object.entries(payload.rates || {}).map(([currency, value]) => ({ currency, value })),
    date: payload.date,
    updatedAt: new Date().toISOString(),
    provider: 'Frankfurter / ECB',
  }
}

export async function fetchGitHubActivity(username) {
  const normalized = String(username || '').trim().replace(/^@/, '')
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(normalized)) throw new Error('请输入正确的 GitHub 用户名')
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(normalized)}/events/public?per_page=12`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!response.ok) throw new Error(response.status === 404 ? '没有找到这个 GitHub 用户' : `GitHub 暂时不可用（${response.status}）`)
  const payload = await response.json()
  const labelByType = {
    PushEvent: '推送了代码',
    PullRequestEvent: '更新了合并请求',
    IssuesEvent: '处理了问题',
    WatchEvent: '收藏了项目',
    CreateEvent: '创建了内容',
    ForkEvent: '复刻了项目',
  }
  return {
    username: normalized,
    items: payload.slice(0, 8).map((item) => ({
      id: item.id,
      title: `${labelByType[item.type] || '更新了动态'} · ${item.repo?.name || ''}`,
      meta: new Date(item.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      url: item.repo?.name ? `https://github.com/${item.repo.name}` : `https://github.com/${normalized}`,
    })),
    updatedAt: new Date().toISOString(),
  }
}

export function parseBookmarkHtml(html) {
  const source = String(html || '')
  if (typeof DOMParser !== 'undefined') {
    const document = new DOMParser().parseFromString(source, 'text/html')
    return Array.from(document.querySelectorAll('a[href]')).slice(0, 100).map((anchor, index) => ({
      id: `bookmark-${index}-${anchor.href}`,
      title: anchor.textContent?.trim() || safeHost(anchor.href) || '未命名书签',
      meta: safeHost(anchor.href),
      url: anchor.href,
    }))
  }
  return [...source.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].slice(0, 100).map(([_, url, label], index) => {
    const rawUrl = url.startsWith('http') ? url : `https://${url}`
    const cleanUrl = (() => { try { return new URL(rawUrl).href } catch { return rawUrl } })()
    const title = label.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() || safeHost(cleanUrl) || '未命名书签'
    return { id: `bookmark-${index}-${cleanUrl}`, title, meta: safeHost(cleanUrl), url: cleanUrl }
  })
}

function unfoldIcs(text) {
  return String(text || '').replace(/\r?\n[ \t]/g, '')
}

export function parseIcsCalendar(text) {
  const events = unfoldIcs(text).split('BEGIN:VEVENT').slice(1).map((block, index) => {
    const value = (key) => block.match(new RegExp(`(?:^|\\n)${key}(?:;[^:]*)?:(.*)`, 'i'))?.[1]?.trim() || ''
    const rawStart = value('DTSTART')
    const date = rawStart.match(/^\d{8}/) ? `${rawStart.slice(0, 4)}-${rawStart.slice(4, 6)}-${rawStart.slice(6, 8)}` : rawStart
    return {
      id: `ics-${index}-${date}`,
      time: rawStart.includes('T') ? `${rawStart.slice(9, 11)}:${rawStart.slice(11, 13)}` : '',
      title: value('SUMMARY') || '未命名日程',
      meta: [date, value('LOCATION')].filter(Boolean).join(' · '),
      date,
    }
  })
  return events.filter((event) => event.title).slice(0, 100)
}

export function buildAgentBriefing(workspace, data) {
  const pendingTasks = (data.tasks || []).filter((item) => !item.done)
  const nextSchedule = (data.schedule || []).slice(0, 3)
  const urgentMilestones = (data.milestones || []).map((item) => ({ ...item, days: Math.max(0, Math.ceil((new Date(item.date).getTime() - Date.now()) / 86400000)) })).sort((a, b) => a.days - b.days).slice(0, 2)
  const completed = (data.tasks || []).filter((item) => item.done).length
  const actions = [
    pendingTasks[0]?.title ? `先完成「${pendingTasks[0].title}」` : '先写下今天最重要的一件事',
    urgentMilestones[0] ? `为「${urgentMilestones[0].label}」推进一个最小步骤` : null,
    nextSchedule[0] ? `${nextSchedule[0].time || '今天'} 准备「${nextSchedule[0].title}」` : null,
  ].filter(Boolean)
  return {
    title: `${workspace.profile?.displayName || '朋友'}的今日简报`,
    summary: `今天有 ${pendingTasks.length} 项待办，已完成 ${completed} 项。${urgentMilestones[0] ? `最近节点还有 ${urgentMilestones[0].days} 天。` : ''}`,
    actions,
    generatedAt: new Date().toISOString(),
    mode: 'local-rules',
  }
}

export function shouldRunBriefing(schedule, now = new Date()) {
  if (!schedule?.enabled) return false
  const today = now.toISOString().slice(0, 10)
  if (schedule.lastRunDate === today) return false
  const [hour = 8, minute = 0] = String(schedule.time || '08:00').split(':').map(Number)
  return now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute)
}
