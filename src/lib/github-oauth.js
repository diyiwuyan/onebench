const githubApi = 'https://api.github.com'

export const GITHUB_OAUTH_CLIENT_ID = import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID || ''

export function oauthReady() {
  return Boolean(GITHUB_OAUTH_CLIENT_ID)
}

export async function startGitHubDeviceFlow() {
  if (!oauthReady()) throw new Error('OneBench 尚未配置 GitHub OAuth 客户端 ID，请继续使用私有仓库令牌同步。')
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: GITHUB_OAUTH_CLIENT_ID, scope: 'repo' }),
  })
  if (!response.ok) throw new Error(`GitHub 授权初始化失败（${response.status}）`)
  return response.json()
}

export async function pollGitHubDeviceFlow(deviceCode, interval = 5, attempts = 24) {
  if (!oauthReady()) throw new Error('OneBench 尚未配置 GitHub OAuth 客户端 ID。')
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(5, interval) * 1000))
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: GITHUB_OAUTH_CLIENT_ID, device_code: deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' }),
    })
    const payload = await response.json()
    if (payload.access_token) return payload.access_token
    if (!['authorization_pending', 'slow_down'].includes(payload.error)) throw new Error(payload.error_description || 'GitHub 授权失败')
  }
  throw new Error('授权等待超时，请重新开始。')
}

export async function githubUser(token) {
  const response = await fetch(`${githubApi}/user`, { headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error('GitHub 授权无效或已过期。')
  return response.json()
}
