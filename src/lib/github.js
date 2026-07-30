const apiBase = 'https://api.github.com'

function encodeBase64(value) {
  return btoa(unescape(encodeURIComponent(value)))
}

function decodeBase64(value) {
  return decodeURIComponent(escape(atob(value.replace(/\n/g, ''))))
}

function headers(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function contentsUrl({ owner, repo, branch, path }) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const ref = branch ? `?ref=${encodeURIComponent(branch)}` : ''
  return `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}${ref}`
}

async function responseJson(response) {
  if (response.ok) return response.json()
  const body = await response.json().catch(() => ({}))
  throw new Error(body.message || `GitHub 请求失败（${response.status}）`)
}

async function getContent(connection) {
  const response = await fetch(contentsUrl(connection), { headers: headers(connection.token) })
  if (response.status === 404) return null
  return responseJson(response)
}

export async function getRemoteWorkspaceMetadata(connection) {
  const file = await getContent(connection)
  return file ? { sha: file.sha, path: file.path } : null
}

export async function pullWorkspaceFromGitHub(connection) {
  const file = await getContent(connection)
  if (!file) throw new Error('远端仓库中未找到该配置文件。')
  return { workspace: JSON.parse(decodeBase64(file.content)), sha: file.sha }
}

export async function pushWorkspaceToGitHub(connection, workspace, { lastSha, force = false } = {}) {
  const remote = await getRemoteWorkspaceMetadata(connection)
  if (!force && lastSha && remote?.sha !== lastSha) {
    const error = new Error('远端配置已被其他设备更新，请先拉取或确认覆盖。')
    error.code = 'SYNC_CONFLICT'
    error.remoteSha = remote?.sha || null
    throw error
  }
  const response = await fetch(contentsUrl(connection), {
    method: 'PUT',
    headers: { ...headers(connection.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `chore: sync ${workspace.name}`,
      content: encodeBase64(JSON.stringify(workspace, null, 2)),
      branch: connection.branch,
      ...(remote?.sha ? { sha: remote.sha } : {}),
    }),
  })
  const result = await responseJson(response)
  return result.content?.sha
}
