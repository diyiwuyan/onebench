import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const valueOf = (flag, fallback = '') => {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1] || fallback
}

const here = resolve(fileURLToPath(new URL('.', import.meta.url)))
const root = resolve(here, '..')
const packId = valueOf('--pack', 'university')
const prompt = valueOf('--prompt')
const owner = valueOf('--owner')
const repo = valueOf('--repo')
if (!owner || !repo) throw new Error('请提供 --owner 和 --repo，确保工作台归用户自己的 GitHub 账号。')

const { createWorkspace, exportWorkspace } = await import(pathToFileURL(resolve(root, 'src/lib/workspace.js')).href)
const workspace = createWorkspace({ packId, prompt })
const ownership = {
  format: 'onebench-ownership/v1',
  repository: `${owner}/${repo}`,
  demoUrl: `https://${owner}.github.io/${repo}/`,
  upstream: 'diyiwuyan/onebench',
  deployment: 'github-pages-actions',
  registry: 'https://raw.githubusercontent.com/diyiwuyan/onebench/main/packages/community-registry/registry.json',
}

await writeFile(resolve(root, 'workspace.json'), `${exportWorkspace(workspace)}\n`, 'utf8')
await mkdir(resolve(root, '.onebench'), { recursive: true })
await writeFile(resolve(root, '.onebench/ownership.json'), `${JSON.stringify(ownership, null, 2)}\n`, 'utf8')
console.log(`已创建 ${ownership.repository} 的工作台配置：workspace.json 和 .onebench/ownership.json。`)
