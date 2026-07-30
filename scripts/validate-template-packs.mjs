import { readFile } from 'node:fs/promises'

const allowedModules = new Set(['calendar', 'tasks', 'quick-note', 'focus', 'goals', 'files', 'review', 'learning', 'classroom', 'settings'])
const manifestPath = new URL('../packages/template-packs/first-party-packs.json', import.meta.url)
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

const fail = (message) => {
  console.error(`Template pack validation failed: ${message}`)
  process.exitCode = 1
}

if (manifest.format !== 'onebench-template-pack/v1') fail('unsupported format')
if (!Array.isArray(manifest.sharedModules) || manifest.sharedModules.length === 0) fail('sharedModules is required')
for (const moduleId of manifest.sharedModules) if (!allowedModules.has(moduleId)) fail(`unknown shared module: ${moduleId}`)

const ids = new Set()
for (const pack of manifest.packs ?? []) {
  for (const field of ['id', 'name', 'prompt', 'title', 'description']) if (!pack[field] || typeof pack[field] !== 'string') fail(`${pack.id || 'unknown'} is missing ${field}`)
  if (!/^[a-z0-9-]+$/.test(pack.id || '')) fail(`${pack.id} must use kebab-case`)
  if (ids.has(pack.id)) fail(`duplicate id: ${pack.id}`)
  ids.add(pack.id)
  if (!Array.isArray(pack.modules) || pack.modules.length === 0) fail(`${pack.id} has no modules`)
  for (const moduleId of pack.modules) if (!allowedModules.has(moduleId)) fail(`${pack.id} references unknown module: ${moduleId}`)
}

if (ids.size < 8) fail('first release must contain at least eight packs')
if (process.exitCode) process.exit(process.exitCode)
console.log(`Validated ${ids.size} template packs and ${manifest.sharedModules.length} shared modules.`)
