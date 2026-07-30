import { findModule } from '../data/modules.js'
import { findPack, packModuleIds } from '../data/packs.js'

export const WORKSPACE_VERSION = '1.0.0'
export const WORKSPACE_STORAGE_KEY = 'onebench.workspace.v1'
export const GITHUB_STORAGE_KEY = 'onebench.github.v1'

const HOME_PRIORITY = ['tasks', 'calendar', 'weather', 'focus', 'countdown', 'learning', 'schedule', 'assignments', 'content-pipeline', 'projects', 'clients', 'team', 'classroom']

function moduleSettings(id, index = 0) {
  const catalogItem = findModule(id)
  const homeIndex = HOME_PRIORITY.indexOf(id)
  return {
    id,
    enabled: true,
    placement: homeIndex >= 0 && homeIndex < 8 ? 'home' : 'sidebar',
    size: catalogItem?.defaultSize || (['files', 'content-pipeline'].includes(id) ? 'wide' : 'medium'),
    order: index,
  }
}

export function createWorkspace({ packId, prompt, moduleIds, themeId, displayName, workspaceName, avatarId } = {}) {
  const pack = findPack(packId)
  return {
    version: WORKSPACE_VERSION,
    id: crypto.randomUUID(),
    name: workspaceName?.trim() || pack.title,
    sourcePack: pack.id,
    intent: prompt?.trim() || pack.prompt,
    profile: {
      displayName: displayName?.trim() || '朋友',
      avatarId: avatarId?.trim() || 'role',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    theme: { ...pack.theme, id: themeId || pack.theme.id },
    layout: pack.layout,
    modules: (moduleIds || packModuleIds(pack)).map((id, index) => moduleSettings(id, index)),
  }
}

export function normalizeWorkspace(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new Error('工作台配置必须是一个 JSON 对象。')
  if (candidate.version !== WORKSPACE_VERSION) throw new Error(`暂不支持配置版本 ${candidate.version || '未知'}。`)
  if (!candidate.id || !candidate.name || !Array.isArray(candidate.modules)) throw new Error('配置缺少 id、name 或 modules。')
  const candidateModules = candidate.modules.filter((module) => module && typeof module.id === 'string')
  const isLegacyLayout = candidateModules.every((module) => !Object.hasOwn(module, 'placement'))
  if (isLegacyLayout && !candidateModules.some((module) => module.id === 'weather')) {
    candidateModules.splice(Math.min(2, candidateModules.length), 0, moduleSettings('weather', 2))
  }
  return {
    ...candidate,
    profile: {
      displayName: candidate.profile?.displayName || '朋友',
      avatarId: candidate.profile?.avatarId || 'role',
    },
    modules: candidateModules
      .map((module, index) => ({
        ...moduleSettings(module.id, index),
        ...module,
        placement: module.placement === 'sidebar' ? 'sidebar' : (module.placement === 'home' ? 'home' : moduleSettings(module.id, index).placement),
        size: ['small', 'medium', 'wide'].includes(module.size) ? module.size : moduleSettings(module.id, index).size,
        order: Number.isFinite(module.order) ? module.order : index,
      }))
      .sort((a, b) => a.order - b.order)
      .map((module, index) => ({ ...module, order: index })),
    updatedAt: new Date().toISOString(),
  }
}

export function loadWorkspace() {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY)
    return raw ? normalizeWorkspace(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveWorkspace(workspace) {
  const normalized = normalizeWorkspace(workspace)
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function exportWorkspace(workspace) {
  return JSON.stringify(normalizeWorkspace(workspace), null, 2)
}

export function toggleModule(workspace, moduleId) {
  const exists = workspace.modules.some((module) => module.id === moduleId)
  return {
    ...workspace,
    updatedAt: new Date().toISOString(),
    modules: exists
      ? workspace.modules.filter((module) => module.id !== moduleId)
      : [...workspace.modules, moduleSettings(moduleId, workspace.modules.length)],
  }
}

export function updateModuleLayout(workspace, moduleId, patch) {
  return {
    ...workspace,
    updatedAt: new Date().toISOString(),
    modules: workspace.modules.map((module) => module.id === moduleId ? { ...module, ...patch } : module),
  }
}

export function reorderHomeModules(workspace, activeId, overId) {
  const home = workspace.modules.filter((module) => module.placement === 'home')
  const rest = workspace.modules.filter((module) => module.placement !== 'home')
  const from = home.findIndex((module) => module.id === activeId)
  const to = home.findIndex((module) => module.id === overId)
  if (from < 0 || to < 0 || from === to) return workspace
  const next = [...home]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return {
    ...workspace,
    updatedAt: new Date().toISOString(),
    modules: [...next, ...rest].map((module, index) => ({ ...module, order: index })),
  }
}
