import { findModule, sharedModuleIds } from '../data/modules.js'
import { findPack, packModuleIds } from '../data/packs.js'

export const WORKSPACE_VERSION = '1.0.0'
export const WORKSPACE_STORAGE_KEY = 'onebench.workspace.v1'
export const GITHUB_STORAGE_KEY = 'onebench.github.v1'

export const PACK_HOME_MODULES = {
  university: ['calendar', 'weather', 'tasks', 'schedule', 'focus', 'countdown', 'learning', 'assignments'],
  teacher: ['calendar', 'weather', 'tasks', 'schedule', 'lesson-plans', 'classroom', 'meetings'],
  'postgraduate-exam': ['countdown', 'tasks', 'focus', 'learning', 'exam-practice', 'calendar', 'weather', 'review'],
  'civil-service-exam': ['countdown', 'tasks', 'focus', 'learning', 'exam-practice', 'notices', 'weather', 'review'],
  creator: ['content-pipeline', 'content-calendar', 'inbox', 'tasks', 'analytics', 'news', 'calendar', 'review'],
  operations: ['projects', 'tasks', 'meetings', 'inbox', 'calendar', 'analytics', 'news', 'review'],
  freelancer: ['clients', 'client-followup', 'projects', 'tasks', 'finance', 'focus', 'calendar', 'review'],
  'team-lead': ['team', 'projects', 'meetings', 'tasks', 'decisions', 'calendar', 'analytics', 'review'],
  financial: ['bookkeeping', 'invoices', 'finance', 'client-followup', 'tasks', 'calendar', 'weather', 'analytics'],
  'family-baby': ['meals', 'health', 'tasks', 'calendar', 'birthdays', 'weather', 'habits', 'diary'],
  office: ['calendar', 'tasks', 'schedule', 'projects', 'meetings', 'agent-briefing', 'weather', 'review'],
  sales: ['clients', 'client-followup', 'projects', 'finance', 'invoices', 'tasks', 'calendar', 'agent-briefing'],
  'small-business': ['bookkeeping', 'finance', 'invoices', 'clients', 'tasks', 'exchange-rates', 'weather', 'agent-briefing'],
  'job-search': ['projects', 'schedule', 'learning', 'files', 'github-activity', 'tasks', 'calendar', 'agent-briefing'],
  senior: ['calendar', 'weather', 'tasks', 'health', 'medications', 'birthdays', 'agent-briefing', 'quotes'],
}

function moduleSettings(id, index = 0, packId = '') {
  const catalogItem = findModule(id)
  const homeIndex = (PACK_HOME_MODULES[packId] || []).indexOf(id)
  return {
    id,
    enabled: true,
    placement: homeIndex >= 0 ? 'home' : 'sidebar',
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
    modules: (moduleIds || packModuleIds(pack)).map((id, index) => moduleSettings(id, index, pack.id)),
  }
}

export function normalizeWorkspace(candidate) {
  if (!candidate || typeof candidate !== 'object') throw new Error('工作台配置必须是一个 JSON 对象。')
  if (candidate.version !== WORKSPACE_VERSION) throw new Error(`暂不支持配置版本 ${candidate.version || '未知'}。`)
  if (!candidate.id || !candidate.name || !Array.isArray(candidate.modules)) throw new Error('配置缺少 id、name 或 modules。')
  const candidateModules = candidate.modules.filter((module) => module && typeof module.id === 'string')
  for (const sharedId of sharedModuleIds) {
    if (!candidateModules.some((module) => module.id === sharedId)) candidateModules.push(moduleSettings(sharedId, candidateModules.length, candidate.sourcePack))
  }
  const isLegacyLayout = candidateModules.every((module) => !Object.hasOwn(module, 'placement'))
  if (isLegacyLayout && !candidateModules.some((module) => module.id === 'weather')) {
    candidateModules.splice(Math.min(2, candidateModules.length), 0, moduleSettings('weather', 2, candidate.sourcePack))
  }
  return {
    ...candidate,
    profile: {
      displayName: candidate.profile?.displayName || '朋友',
      avatarId: candidate.profile?.avatarId || 'role',
    },
    modules: candidateModules
      .map((module, index) => ({
        ...moduleSettings(module.id, index, candidate.sourcePack),
        ...module,
        placement: module.placement === 'sidebar' ? 'sidebar' : (module.placement === 'home' ? 'home' : moduleSettings(module.id, index, candidate.sourcePack).placement),
        size: ['small', 'medium', 'wide'].includes(module.size) ? module.size : moduleSettings(module.id, index, candidate.sourcePack).size,
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
      : [...workspace.modules, { ...moduleSettings(moduleId, workspace.modules.length, workspace.sourcePack), placement: 'home' }],
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
