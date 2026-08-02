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
const prompt = valueOf('--prompt')
const displayName = valueOf('--name')
const workspaceName = valueOf('--workspace-name')
const requestedEdition = valueOf('--edition', 'basic')
const supportedEditions = new Set(['basic', 'exam', 'teacher', 'hu', 'creator'])
if (!supportedEditions.has(requestedEdition)) throw new Error(`不支持的专业版：${requestedEdition}`)
const editionPack = { basic: 'university', exam: 'civil-service-exam', teacher: 'teacher', hu: 'creator', creator: 'creator' }
const packId = valueOf('--pack', editionPack[requestedEdition])
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
await writeFile(output, exportDesktopHtml(workspace, defaultWorkspaceData(workspace), template, { edition: requestedEdition }), 'utf8')
console.log(`已生成本地工作台：${output}`)
