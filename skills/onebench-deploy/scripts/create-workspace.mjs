import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const valueOf = (flag, fallback = '') => {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1] || fallback
}

const here = resolve(fileURLToPath(new URL('.', import.meta.url)))
const root = resolve(here, '../../..')
const packId = valueOf('--pack', 'university')
const prompt = valueOf('--prompt')
const output = resolve(root, valueOf('--out', 'workspace.json'))
const { createWorkspace, exportWorkspace } = await import(pathToFileURL(resolve(root, 'src/lib/workspace.js')).href)

const workspace = createWorkspace({ packId, prompt })
await writeFile(output, exportWorkspace(workspace), 'utf8')
console.log(`Created ${output} from ${workspace.sourcePack}.`)
