import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { validateCommunityRegistry } from './lib/community-registry.mjs'

const args = process.argv.slice(2)
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1] || fallback
}

const source = valueOf('--url', 'https://raw.githubusercontent.com/diyiwuyan/onebench/main/packages/community-registry/registry.json')
const output = resolve(process.cwd(), valueOf('--out', '.onebench/community-registry.json'))
const url = new URL(source)
if (url.protocol !== 'https:') throw new Error('公共目录只能通过 HTTPS 获取。')

const response = await fetch(url)
if (!response.ok) throw new Error(`无法获取公共目录：${response.status} ${response.statusText}`)
const registry = validateCommunityRegistry(await response.json())
await mkdir(dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
console.log(`已更新公共目录到 ${output}。目录只提供元数据；安装代码前仍需固定版本并审阅来源。`)
