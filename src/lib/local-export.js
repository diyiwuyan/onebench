export const STANDALONE_PAYLOAD_TOKEN = '__ONEBENCH_PAYLOAD__'

export function injectStandalonePayload(template, workspace, data) {
  if (typeof template !== 'string' || !template.includes(STANDALONE_PAYLOAD_TOKEN)) {
    throw new Error('本地工作台运行时缺失或版本不匹配。')
  }
  const payload = encodeURIComponent(JSON.stringify({ workspace, data }))
  return template.replace(STANDALONE_PAYLOAD_TOKEN, payload)
}

export function exportDesktopHtml(workspace, data, template) {
  return injectStandalonePayload(template, workspace, data)
}
