const ROLE_NEWS_QUERY = {
  university: 'education OR university OR career',
  teacher: 'education OR teaching OR classroom',
  'postgraduate-exam': 'education OR research OR AI',
  'civil-service-exam': 'government OR public policy OR economy',
  creator: 'creator economy OR social media OR content',
  operations: 'product management OR growth OR startup',
  freelancer: 'freelance OR small business OR creator economy',
  'team-lead': 'management OR leadership OR workplace',
  financial: 'finance OR accounting OR tax',
  'family-baby': 'parenting OR child health OR family',
  office: 'workplace OR productivity OR office',
  sales: 'sales OR ecommerce OR customer',
  'small-business': 'small business OR ecommerce OR finance',
  'job-search': 'career OR hiring OR interview',
  senior: 'health OR retirement OR family',
}

const safeHost = (value) => {
  try { return new URL(value).hostname.replace(/^www\./, '') } catch { return '' }
}

const normalizeTopics = (topics) => String(topics || '')
  .split(/[，,、\n]/)
  .map((item) => item.trim())
  .filter(Boolean)
  .slice(0, 5)

export async function fetchRoleNews({ roleId, topics, limit = 10 } = {}) {
  const customTopics = normalizeTopics(topics)
  const query = customTopics.length ? customTopics.join(' OR ') : (ROLE_NEWS_QUERY[roleId] || 'productivity OR technology')
  const response = await fetch(`https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=${limit}&query=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error(`资讯源暂时不可用（${response.status}）`)
  const payload = await response.json()
  const items = (payload.hits || [])
    .filter((item) => item.title && (item.url || item.story_url))
    .slice(0, limit)
    .map((item) => {
      const url = item.url || item.story_url
      return {
        id: `hn-${item.objectID}`,
        title: item.title,
        category: customTopics[0] || '互联网',
        summary: `${item.author || '公开来源'} · ${item.points || 0} 人关注`,
        source: safeHost(url) || 'Hacker News',
        url,
        publishedAt: item.created_at,
        hot: Number(item.points || 0) >= 50,
      }
    })
  if (!items.length) throw new Error('没有找到符合当前主题的资讯')
  return { items, updatedAt: new Date().toISOString(), provider: 'Hacker News / Algolia', query }
}

export async function fetchRssFeed(feedUrl, limit = 10) {
  const normalized = String(feedUrl || '').trim()
  if (!/^https?:\/\//i.test(normalized)) throw new Error('请输入完整的 RSS 地址')
  const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(normalized)}&count=${limit}`
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error(`RSS 服务暂时不可用（${response.status}）`)
  const payload = await response.json()
  if (payload.status !== 'ok') throw new Error(payload.message || '无法读取这个 RSS')
  const items = (payload.items || []).slice(0, limit).map((item, index) => ({
    id: item.guid || item.link || `rss-${index}`,
    title: item.title || '未命名文章',
    meta: `${payload.feed?.title || safeHost(normalized)} · ${item.pubDate ? new Date(item.pubDate).toLocaleDateString('zh-CN') : '刚刚更新'}`,
    url: item.link || normalized,
    publishedAt: item.pubDate || '',
  }))
  return { feedUrl: normalized, title: payload.feed?.title || safeHost(normalized), items, updatedAt: new Date().toISOString(), provider: 'RSS2JSON' }
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
