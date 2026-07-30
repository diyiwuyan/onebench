import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { validateCommunityRegistry } from './lib/community-registry.mjs'

const args = process.argv.slice(2)
const index = args.indexOf('--file')
const file = resolve(process.cwd(), index === -1 ? 'packages/community-registry/registry.json' : args[index + 1])
const registry = validateCommunityRegistry(JSON.parse(await readFile(file, 'utf8')))
console.log(`Validated ${registry.templates.length} community templates and ${registry.modules.length} community modules.`)
