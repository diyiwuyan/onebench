import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createWorkspace, normalizeWorkspace, toggleModule, WORKSPACE_VERSION } from '../src/lib/workspace.js'
import { packs, packModuleIds } from '../src/data/packs.js'
import { decryptWorkspaceBackup, encryptWorkspaceBackup } from '../src/lib/backup.js'

test('first-party catalog provides eight packs with shared modules', () => {
  assert.equal(packs.length, 8)
  for (const pack of packs) {
    const modules = packModuleIds(pack)
    assert.ok(modules.includes('calendar'))
    assert.ok(modules.includes('tasks'))
    assert.ok(modules.includes('settings'))
  }
})

test('workspace config is created from a pack and can toggle a module', () => {
  const workspace = createWorkspace({ packId: 'teacher', prompt: '我要管理备课' })
  assert.equal(workspace.version, WORKSPACE_VERSION)
  assert.equal(workspace.sourcePack, 'teacher')
  assert.equal(workspace.intent, '我要管理备课')
  const removed = toggleModule(workspace, 'calendar')
  assert.equal(removed.modules.some((module) => module.id === 'calendar'), false)
  const restored = toggleModule(removed, 'calendar')
  assert.equal(restored.modules.some((module) => module.id === 'calendar'), true)
})

test('workspace config rejects malformed or incompatible data', () => {
  assert.throws(() => normalizeWorkspace({ version: '0.9.0' }), /暂不支持/)
  assert.throws(() => normalizeWorkspace({ version: WORKSPACE_VERSION, id: 'x', name: 'x', modules: null }), /缺少/)
})

test('encrypted backup only opens with the original passphrase', async () => {
  const workspace = createWorkspace({ packId: 'university' })
  const backup = await encryptWorkspaceBackup(workspace, 'a-safe-passphrase')
  const restored = await decryptWorkspaceBackup(backup, 'a-safe-passphrase')
  assert.equal(restored.id, workspace.id)
  await assert.rejects(() => decryptWorkspaceBackup(backup, 'wrong-passphrase'), /无法解密/)
})

test('PWA manifest exposes installable icon sizes', async () => {
  const manifest = JSON.parse(await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'))
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes), ['192x192', '512x512'])
})
