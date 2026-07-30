import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { validateCommunityRegistry } from '../scripts/lib/community-registry.mjs'

test('community registry uses pinned source records and declared permissions', async () => {
  const registry = JSON.parse(await readFile(new URL('../packages/community-registry/registry.json', import.meta.url), 'utf8'))
  assert.equal(validateCommunityRegistry(registry), registry)
  assert.equal(registry.templates[0].source.repository, 'diyiwuyan/onebench')
  assert.deepEqual(registry.templates[0].permissions, [])
})

test('browser extension is an MV3 new-tab package without broad host access', async () => {
  const manifest = JSON.parse(await readFile(new URL('../extension/manifest.json', import.meta.url), 'utf8'))
  assert.equal(manifest.manifest_version, 3)
  assert.equal(manifest.chrome_url_overrides.newtab, 'index.html')
  assert.equal('host_permissions' in manifest, false)
})
