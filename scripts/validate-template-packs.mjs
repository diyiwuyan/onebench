import { readFile } from 'node:fs/promises'
import { packs as runtimePacks } from '../src/data/packs.js'
import { moduleCatalog } from '../src/data/modules.js'
import { themeCatalog } from '../src/data/themes.js'

const manifestPath = new URL('../packages/template-packs/first-party-packs.json', import.meta.url)
const moduleManifestPath = new URL('../packages/modules/core.manifest.json', import.meta.url)
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const moduleManifest = JSON.parse(await readFile(moduleManifestPath, 'utf8'))
const allowedModules = new Set((moduleManifest.modules ?? []).map((module) => module.id))
const allowedThemes = new Set(themeCatalog.map((theme) => theme.id))

const fail = (message) => {
  console.error(`Template pack validation failed: ${message}`)
  process.exitCode = 1
}

if (manifest.format !== 'onebench-template-pack/v1') fail('unsupported format')
if (!Array.isArray(manifest.sharedModules) || manifest.sharedModules.length === 0) fail('sharedModules is required')
for (const moduleId of manifest.sharedModules) if (!allowedModules.has(moduleId)) fail(`unknown shared module: ${moduleId}`)

const ids = new Set()
for (const pack of manifest.packs ?? []) {
  for (const field of ['id', 'name', 'theme', 'prompt', 'title', 'description']) if (!pack[field] || typeof pack[field] !== 'string') fail(`${pack.id || 'unknown'} is missing ${field}`)
  if (!/^[a-z0-9-]+$/.test(pack.id || '')) fail(`${pack.id} must use kebab-case`)
  if (ids.has(pack.id)) fail(`duplicate id: ${pack.id}`)
  ids.add(pack.id)
  if (!allowedThemes.has(pack.theme)) fail(`${pack.id} references unknown theme: ${pack.theme}`)
  if (!Array.isArray(pack.modules) || pack.modules.length === 0) fail(`${pack.id} has no modules`)
  for (const moduleId of pack.modules) if (!allowedModules.has(moduleId)) fail(`${pack.id} references unknown module: ${moduleId}`)
}

if (ids.size !== runtimePacks.length) fail(`runtime has ${runtimePacks.length} packs but manifest has ${ids.size}`)
for (const pack of runtimePacks) if (!ids.has(pack.id)) fail(`runtime pack missing from manifest: ${pack.id}`)
const runtimeModules = new Set(moduleCatalog.map((module) => module.id))
for (const pack of manifest.packs ?? []) for (const moduleId of pack.modules) if (!runtimeModules.has(moduleId)) fail(`${pack.id} references unknown runtime module: ${moduleId}`)
if (process.exitCode) process.exit(process.exitCode)
console.log(`Validated ${ids.size} template packs and ${manifest.sharedModules.length} shared modules.`)
