import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createWorkspace, normalizeWorkspace, reorderHomeModules, toggleModule, updateModuleLayout, WORKSPACE_VERSION } from '../src/lib/workspace.js'
import { packs, packModuleIds } from '../src/data/packs.js'
import { themeCatalog } from '../src/data/themes.js'
import { decryptWorkspaceBackup, encryptWorkspaceBackup } from '../src/lib/backup.js'

test('first-party catalog provides eight packs with shared modules', () => {
  assert.equal(packs.length, 8)
  for (const pack of packs) {
    const modules = packModuleIds(pack)
    assert.ok(modules.includes('calendar'))
    assert.ok(modules.includes('weather'))
    assert.ok(modules.includes('tasks'))
    assert.ok(modules.includes('profile'))
    assert.ok(modules.includes('appearance'))
    assert.ok(modules.includes('sync'))
    assert.ok(modules.includes('settings'))
    assert.ok(themeCatalog.some((theme) => theme.id === pack.theme.id))
  }
  assert.equal(new Set(packs.map((pack) => pack.theme.id)).size, 8)
})

test('workspace config is created from a pack and can toggle a module', () => {
  const workspace = createWorkspace({ packId: 'teacher', prompt: '我要管理备课', displayName: '王老师', workspaceName: '王老师的教学台' })
  assert.equal(workspace.version, WORKSPACE_VERSION)
  assert.equal(workspace.sourcePack, 'teacher')
  assert.equal(workspace.theme.id, 'chalk-sage')
  assert.equal(workspace.profile.displayName, '王老师')
  assert.equal(workspace.name, '王老师的教学台')
  assert.equal(workspace.intent, '我要管理备课')
  const removed = toggleModule(workspace, 'calendar')
  assert.equal(removed.modules.some((module) => module.id === 'calendar'), false)
  const restored = toggleModule(removed, 'calendar')
  assert.equal(restored.modules.some((module) => module.id === 'calendar'), true)
})

test('widget placement, sizing and order survive normalization', () => {
  const workspace = createWorkspace({ packId: 'postgraduate-exam' })
  assert.equal(workspace.modules.find((module) => module.id === 'weather').placement, 'home')
  const resized = updateModuleLayout(workspace, 'weather', { size: 'wide' })
  const homeIds = resized.modules.filter((module) => module.placement === 'home').map((module) => module.id)
  const reordered = reorderHomeModules(resized, homeIds[0], homeIds[1])
  const normalized = normalizeWorkspace(reordered)
  assert.equal(normalized.modules.find((module) => module.id === 'weather').size, 'wide')
  assert.equal(normalized.modules.filter((module) => module.placement === 'home')[1].id, homeIds[0])
  const removedWeather = normalizeWorkspace(toggleModule(normalized, 'weather'))
  assert.equal(removedWeather.modules.some((module) => module.id === 'weather'), false)
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
