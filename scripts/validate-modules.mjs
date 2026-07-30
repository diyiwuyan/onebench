import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile(new URL('../packages/modules/core.manifest.json', import.meta.url), 'utf8'))
const ids = new Set()
for (const module of manifest.modules ?? []) {
  if (!/^[a-z0-9-]+$/.test(module.id || '')) throw new Error(`Invalid module id: ${module.id}`)
  if (ids.has(module.id)) throw new Error(`Duplicate module id: ${module.id}`)
  if (!['local', 'configuration', 'network-cached'].includes(module.dataBoundary)) throw new Error(`Invalid data boundary: ${module.id}`)
  if (module.dataBoundary === 'network-cached' && !Array.isArray(module.permissions)) throw new Error(`Network module must declare permissions: ${module.id}`)
  ids.add(module.id)
}
if (manifest.format !== 'onebench-module-manifest/v1' || ids.size === 0) throw new Error('Invalid module manifest')
console.log(`Validated ${ids.size} module manifests.`)
