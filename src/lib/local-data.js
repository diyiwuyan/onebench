const dataKey = (workspaceId) => `onebench.data.${workspaceId}.v1`

export function defaultWorkspaceData(workspace) {
  return {
    tasks: [
      { id: crypto.randomUUID(), title: '打开并整理今天的工作台', done: false },
      { id: crypto.randomUUID(), title: `${workspace.name}：完成第一个重点事项`, done: false },
    ],
    quickNote: '',
    updatedAt: new Date().toISOString(),
  }
}

export function loadWorkspaceData(workspace) {
  try {
    const raw = localStorage.getItem(dataKey(workspace.id))
    return raw ? JSON.parse(raw) : defaultWorkspaceData(workspace)
  } catch {
    return defaultWorkspaceData(workspace)
  }
}

export function saveWorkspaceData(workspace, data) {
  const next = { ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(dataKey(workspace.id), JSON.stringify(next))
  return next
}
