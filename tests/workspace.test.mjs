import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createWorkspace, normalizeWorkspace, reorderHomeModules, toggleModule, updateModuleLayout, WORKSPACE_VERSION } from '../src/lib/workspace.js'
import { packs, packModuleIds } from '../src/data/packs.js'
import { moduleCatalog } from '../src/data/modules.js'
import { themeCatalog } from '../src/data/themes.js'
import { decryptWorkspaceBackup, encryptWorkspaceBackup } from '../src/lib/backup.js'
import { birthdayView, bookkeepingSummary, calculatePeriod } from '../src/lib/local-data.js'
import { buildAgentBriefing, parseBookmarkHtml, parseIcsCalendar } from '../src/lib/connectors.js'

test('first-party catalog provides fifteen packs with shared modules', () => {
  assert.equal(packs.length, 15)
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
  assert.equal(new Set(packs.map((pack) => pack.theme.id)).size, 15)
})

test('runtime packs and modules stay aligned with open-source manifests', async () => {
  const moduleManifest = JSON.parse(await readFile(new URL('../packages/modules/core.manifest.json', import.meta.url), 'utf8'))
  const packManifest = JSON.parse(await readFile(new URL('../packages/template-packs/first-party-packs.json', import.meta.url), 'utf8'))
  assert.deepEqual(new Set(moduleManifest.modules.map((module) => module.id)), new Set(moduleCatalog.map((module) => module.id)))
  assert.deepEqual(new Set(packManifest.packs.map((pack) => pack.id)), new Set(packs.map((pack) => pack.id)))
  assert.ok(packManifest.sharedModules.includes('weather'))
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
  // Weather is a shared module; normalization restores it when an old or
  // imported workspace omits it, so every workspace keeps the common baseline.
  assert.equal(removedWeather.modules.some((module) => module.id === 'weather'), true)
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

test('derived modules recalculate from user data', () => {
  const period = calculatePeriod({ lastPeriod: '2026-07-01', cycleDays: 30 }, new Date('2026-07-10T12:00:00'))
  assert.equal(period.predictedNext, '2026-07-31')
  assert.match(period.status, /21 天/)
  const birthday = birthdayView({ title: '妈妈', date: '2026-08-15' }, new Date('2026-08-01T12:00:00'))
  assert.equal(birthday.days, 14)
  assert.deepEqual(bookkeepingSummary([{ value: '+100', category: 'income' }, { value: '-30', category: 'expense' }]), { income: 100, expense: 30, balance: 70 })
})

test('connector parsers stay local and produce usable records', () => {
  assert.equal(parseBookmarkHtml('<DL><a href="https://example.com">Example</a></DL>')[0].url, 'https://example.com/')
  assert.equal(parseIcsCalendar('BEGIN:VEVENT\nDTSTART:20260801\nSUMMARY:演示\nEND:VEVENT')[0].title, '演示')
  const briefing = buildAgentBriefing({ profile: { displayName: '小王' } }, { tasks: [{ title: '写计划', done: false }], schedule: [], milestones: [] })
  assert.match(briefing.summary, /1 项待办/)
})
