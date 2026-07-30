import { findPack, packModuleIds } from '../data/packs.js'

export const WORKSPACE_VERSION = '1.0.0'
export const WORKSPACE_STORAGE_KEY = 'onebench.workspace.v1'
export const GITHUB_STORAGE_KEY = 'onebench.github.v1'

export function createWorkspace({ packId, prompt, moduleIds, themeId } = {}) {
  const pack = findPack(packId)
  return {
    version: WORKSPACE_VERSION,
    id: crypto.randomUUID(),
    name: pack.title,
    sourcePack: pack.id,
    intent: prompt?.trim() || pack.prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    theme: { ...pack.theme, id: themeId || pack.theme.id },
    layout: pack.layout,
    modules: (moduleIds || packModuleIds(pack)).map((id) => ({ id, enabled: true })),
  }
}

export function normalizeWorkspace(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new Error('工作台配置必须是一个 JSON 对象。')
  if (candidate.version !== WORKSPACE_VERSION) throw new Error(`暂不支持配置版本 ${candidate.version || '未知'}。`)
  if (!candidate.id || !candidate.name || !Array.isArray(candidate.modules)) throw new Error('配置缺少 id、name 或 modules。')
  return {
    ...candidate,
    modules: candidate.modules.filter((module) => module && typeof module.id === 'string'),
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
      : [...workspace.modules, { id: moduleId, enabled: true }],
  }
}
