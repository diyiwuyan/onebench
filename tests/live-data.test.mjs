import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parseFeedXml } from '../scripts/lib/feed-parser.mjs'
import { fetchRoleNews, fetchRssFeed } from '../src/lib/connectors.js'

const rss = `<?xml version="1.0"?><rss><channel><title>测试中文源</title><item><title><![CDATA[AI 教育新进展]]></title><link>https://example.com/a</link><description><![CDATA[<p>这是摘要</p>]]></description><pubDate>Fri, 01 Aug 2025 08:00:00 GMT</pubDate><guid>a-1</guid></item></channel></rss>`

test('parses RSS metadata without copying article bodies', () => {
  const items = parseFeedXml(rss, { id: 'test', name: '测试源', category: '科技', tags: ['教育'] })
  assert.equal(items.length, 1)
  assert.equal(items[0].title, 'AI 教育新进展')
  assert.equal(items[0].summary, '这是摘要')
  assert.equal(items[0].url, 'https://example.com/a')
})

test('generated public snapshot has traceable sources and original links', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../public/data/news.json', import.meta.url), 'utf8'))
  assert.equal(snapshot.schemaVersion, 1)
  assert.ok(snapshot.items.length >= 20)
  assert.ok(snapshot.items.every((item) => item.source && item.sourceId && /^https?:\/\//.test(item.url)))
})

test('news reads the same-origin snapshot and filters Chinese topics', async () => {
  const previousFetch = globalThis.fetch
  globalThis.document = { baseURI: 'https://onebench.test/' }
  globalThis.fetch = async (url) => new Response(JSON.stringify({
    generatedAt: '2025-08-01T00:00:00.000Z',
    provider: 'OneBench 公共资讯快照',
    items: [
      { id: '1', title: '教育数字化新进展', summary: '', tags: ['教育'], url: 'https://example.com/edu' },
      { id: '2', title: '商业动态', summary: '', tags: ['商业'], url: 'https://example.com/biz' },
    ],
  }), { headers: { 'content-type': 'application/json' } })
  try {
    const result = await fetchRoleNews({ roleId: 'teacher', topics: '教育' })
    assert.equal(result.items[0].id, '1')
    assert.equal(result.provider, 'OneBench 公共资讯快照')
  } finally {
    globalThis.fetch = previousFetch
    delete globalThis.document
  }
})

test('known RSS sources use their same-origin generated snapshot', async () => {
  const previousFetch = globalThis.fetch
  globalThis.document = { baseURI: 'https://onebench.test/' }
  const calls = []
  globalThis.fetch = async (url) => {
    calls.push(String(url))
    if (String(url).endsWith('feed-catalog.json')) return new Response(JSON.stringify({ sources: [{ url: 'https://example.com/feed.xml', snapshot: 'data/feeds/example.json' }] }), { headers: { 'content-type': 'application/json' } })
    return new Response(JSON.stringify({ title: '示例源', items: [{ id: '1', title: '文章', url: 'https://example.com/a' }], provider: 'OneBench 公共资讯快照' }), { headers: { 'content-type': 'application/json' } })
  }
  try {
    const result = await fetchRssFeed('https://example.com/feed.xml')
    assert.equal(result.items.length, 1)
    assert.deepEqual(calls, ['https://onebench.test/data/feed-catalog.json', 'https://onebench.test/data/feeds/example.json'])
  } finally {
    globalThis.fetch = previousFetch
    delete globalThis.document
  }
})
