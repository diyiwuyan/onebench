const entryKinds = new Set(['template-pack', 'module'])

export function validateCommunityRegistry(registry) {
  if (!registry || typeof registry !== 'object') throw new Error('公共目录必须是 JSON 对象。')
  if (registry.format !== 'onebench-community-registry/v1') throw new Error('不支持的公共目录版本。')
  if (!Array.isArray(registry.templates) || !Array.isArray(registry.modules)) throw new Error('公共目录必须包含 templates 与 modules 数组。')

  const ids = new Set()
  for (const entry of [...registry.templates, ...registry.modules]) {
    if (!entry || typeof entry !== 'object' || !entry.id || !entry.name) throw new Error('公共目录条目缺少 id 或 name。')
    if (ids.has(entry.id)) throw new Error(`公共目录中存在重复 id：${entry.id}`)
    ids.add(entry.id)
    if (!entryKinds.has(entry.kind)) throw new Error(`条目 ${entry.id} 的 kind 不受支持。`)
    if (!entry.source?.repository || !entry.source?.path || !entry.source?.ref) throw new Error(`条目 ${entry.id} 必须固定 repository、path 与 ref。`)
    if (!Array.isArray(entry.permissions)) throw new Error(`条目 ${entry.id} 必须声明 permissions 数组。`)
    if (!Array.isArray(entry.requires) || entry.requires.length === 0) throw new Error(`条目 ${entry.id} 必须声明 requires 模块组合。`)
  }
  return registry
}
