import { access, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const valueOf = (flag, fallback = '') => {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1] || fallback
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const packId = valueOf('--pack', 'university')
const prompt = valueOf('--prompt')
const displayName = valueOf('--name')
const workspaceName = valueOf('--workspace-name')
const output = resolve(process.cwd(), valueOf('--out', '我的一句工作台.html'))
const runtime = resolve(root, 'public/standalone.html')
const { createWorkspace } = await import(pathToFileURL(resolve(root, 'src/lib/workspace.js')).href)
const { defaultWorkspaceData } = await import(pathToFileURL(resolve(root, 'src/lib/local-data.js')).href)
const { exportDesktopHtml } = await import(pathToFileURL(resolve(root, 'src/lib/local-export.js')).href)

try {
  await access(runtime)
} catch {
  execFileSync('npm', ['run', 'build:standalone'], { cwd: root, stdio: 'inherit' })
}

const workspace = createWorkspace({ packId, prompt, displayName, workspaceName })
const template = await readFile(runtime, 'utf8')
await writeFile(output, exportDesktopHtml(workspace, defaultWorkspaceData(workspace), template), 'utf8')
console.log(`已生成本地工作台：${output}`)
