import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { buildAgentBriefing } from '../src/lib/connectors.js'

const args = process.argv.slice(2)
const valueOf = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const input = resolve(valueOf('--input', 'workspace-data.json'))
const output = resolve(valueOf('--output', 'agent-briefing.json'))
const workspacePath = resolve(valueOf('--workspace', 'workspace.json'))
const workspace = JSON.parse(await readFile(workspacePath, 'utf8'))
const data = JSON.parse(await readFile(input, 'utf8'))
const briefing = buildAgentBriefing(workspace, data)
await writeFile(output, JSON.stringify(briefing, null, 2))
console.log(`Generated local briefing: ${output}`)
