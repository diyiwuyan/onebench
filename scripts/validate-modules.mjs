import { readFile } from 'node:fs/promises'
import { moduleCatalog } from '../src/data/modules.js'

const manifest = JSON.parse(await readFile(new URL('../packages/modules/core.manifest.json', import.meta.url), 'utf8'))
const ids = new Set()
for (const module of manifest.modules ?? []) {
  if (!/^[a-z0-9-]+$/.test(module.id || '')) throw new Error(`Invalid module id: ${module.id}`)
  if (ids.has(module.id)) throw new Error(`Duplicate module id: ${module.id}`)
  if (!['local', 'local-sensitive', 'configuration', 'network-cached'].includes(module.dataBoundary)) throw new Error(`Invalid data boundary: ${module.id}`)
  if (!['manual', 'derived', 'live', 'connector', 'agent', 'system'].includes(module.kind)) throw new Error(`Invalid module kind: ${module.id}`)
  if (module.dataBoundary === 'network-cached' && !Array.isArray(module.permissions)) throw new Error(`Network module must declare permissions: ${module.id}`)
  ids.add(module.id)
}
if (manifest.format !== 'onebench-module-manifest/v1' || ids.size === 0) throw new Error('Invalid module manifest')
const runtimeIds = new Set(moduleCatalog.map((module) => module.id))
const missing = [...runtimeIds].filter((id) => !ids.has(id))
const stale = [...ids].filter((id) => !runtimeIds.has(id))
if (missing.length || stale.length) throw new Error(`Manifest/runtime mismatch. Missing: ${missing.join(', ') || 'none'}; stale: ${stale.join(', ') || 'none'}`)
console.log(`Validated ${ids.size} module manifests against runtime catalog.`)
