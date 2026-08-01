#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeSnapshotItems, parseFeedXml, snapshotForSource } from './lib/feed-parser.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceFile = path.join(root, 'packages', 'live-data', 'sources.json')
const outputDir = path.join(root, 'public', 'data')
const outputFile = path.join(outputDir, 'news.json')
const catalogFile = path.join(outputDir, 'feed-catalog.json')
const timeoutMs = Number(process.env.ONEBENCH_FEED_TIMEOUT_MS || 15_000)
const maxItems = Number(process.env.ONEBENCH_FEED_MAX_ITEMS || 120)

const config = JSON.parse(await readFile(sourceFile, 'utf8'))

const fetchSource = async (source) => {
  const response = await fetch(source.url, {
    headers: {
      Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9',
      'User-Agent': 'OneBenchFeedBot/1.0 (+https://github.com/diyiwuyan/onebench)',
    },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > 3_000_000) throw new Error('feed is larger than 3 MB')
  const xml = (await response.text()).slice(0, 3_000_000)
  const items = parseFeedXml(xml, source)
  if (!items.length) throw new Error('no readable entries')
  return items
}

const settled = await Promise.allSettled(config.sources.map(fetchSource))
const status = settled.map((result, index) => ({
  id: config.sources[index].id,
  ok: result.status === 'fulfilled',
  itemCount: result.status === 'fulfilled' ? result.value.length : 0,
  error: result.status === 'rejected' ? String(result.reason?.message || result.reason) : undefined,
}))
const freshItems = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])

let previous = null
try { previous = JSON.parse(await readFile(outputFile, 'utf8')) } catch {}

if (!freshItems.length && !previous?.items?.length) {
  throw new Error(`所有公共资讯源均不可用：${status.map((item) => `${item.id}: ${item.error}`).join('; ')}`)
}

const failedIds = new Set(status.filter((item) => !item.ok).map((item) => item.id))
const preservedItems = (previous?.items || []).filter((item) => failedIds.has(item.sourceId))
const generatedAt = new Date().toISOString()
const snapshot = {
  schemaVersion: 1,
  generatedAt,
  expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1_000).toISOString(),
  provider: 'OneBench 公共资讯快照',
  sources: status,
  items: normalizeSnapshotItems([...freshItems, ...preservedItems], maxItems),
}

await mkdir(path.join(outputDir, 'feeds'), { recursive: true })
const atomicWrite = async (target, value) => {
  const temp = `${target}.tmp`
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temp, target)
}

await atomicWrite(outputFile, snapshot)
const catalog = {
  schemaVersion: 1,
  generatedAt,
  sources: config.sources.map((source) => ({
    ...source,
    snapshot: `data/feeds/${source.id}.json`,
    available: status.find((item) => item.id === source.id)?.ok || Boolean(preservedItems.find((item) => item.sourceId === source.id)),
  })),
}
await atomicWrite(catalogFile, catalog)
await Promise.all(config.sources.map((source) => atomicWrite(
  path.join(outputDir, 'feeds', `${source.id}.json`),
  snapshotForSource(snapshot, source),
)))

console.log(`公共资讯快照已更新：${snapshot.items.length} 条，${status.filter((item) => item.ok).length}/${status.length} 个源可用。`)
for (const item of status.filter((entry) => !entry.ok)) console.warn(`- ${item.id}: ${item.error}`)
