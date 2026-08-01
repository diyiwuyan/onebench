export const SUBMISSION_KIND_LABELS = Object.freeze({
  '职业包（身份 + 主题 + 模块 + 首用示例）': 'kind:career-pack',
  '布局模板（组件顺序与尺寸）': 'kind:layout-template',
  '主题包（只改变外观）': 'kind:theme-pack',
  '模块组合（复用已有模块）': 'kind:module-bundle',
  '单模块（新增独立能力）': 'kind:module',
})

const requiredSections = [
  ['投稿类型', 2],
  ['投稿名称', 2],
  ['适合谁', 6],
  ['用户第一次打开能完成什么', 10],
  ['默认模块、布局或主题内容', 10],
  ['每个模块如何使用', 10],
  ['桌面和手机截图', 3],
  ['联网、权限与断网方案', 2],
]

const confirmationText = [
  '所有示例条目都允许用户修改或删除',
  '自动内容会显示来源、更新时间和失败后的替代内容',
  '不包含口令、令牌、私人数据或无法授权的素材',
  '同意通过开源 PR 接受审阅与后续维护',
]

export function parseIssueFormSections(body = '') {
  const sections = new Map()
  const matcher = /(?:^|\n)###\s+(.+?)\s*\n+([\s\S]*?)(?=\n###\s+|$)/g
  for (const match of body.matchAll(matcher)) {
    sections.set(match[1].trim(), match[2].trim())
  }
  return sections
}

function isEmptyAnswer(value = '') {
  const normalized = value.trim()
  return !normalized || normalized === '_No response_' || normalized === 'No response'
}

function containsScreenshot(value = '') {
  return /!\[[^\]]*\]\(https?:\/\//i.test(value)
    || /https?:\/\/(?:github\.com\/user-attachments|user-images\.githubusercontent\.com)\//i.test(value)
}

export function validateSubmissionBody(body = '') {
  const sections = parseIssueFormSections(body)
  const errors = []

  for (const [heading, minimumLength] of requiredSections) {
    const answer = sections.get(heading) ?? ''
    if (isEmptyAnswer(answer) || answer.length < minimumLength) errors.push(`请完整填写“${heading}”。`)
  }

  const kind = sections.get('投稿类型') ?? ''
  const kindLabel = SUBMISSION_KIND_LABELS[kind]
  if (kind && !kindLabel) errors.push('“投稿类型”不是 OneBench 支持的五类贡献之一。')

  const screenshots = sections.get('桌面和手机截图') ?? ''
  if (!isEmptyAnswer(screenshots) && !containsScreenshot(screenshots)) {
    errors.push('请在“桌面和手机截图”中拖入图片；只有文字说明不能完成视觉验收。')
  }

  const confirmations = sections.get('投稿确认') ?? ''
  for (const item of confirmationText) {
    const checkedItem = `- [x] ${item}`.toLocaleLowerCase('zh-CN')
    if (!confirmations.toLocaleLowerCase('zh-CN').includes(checkedItem)) errors.push(`请勾选“${item}”。`)
  }

  return {
    valid: errors.length === 0,
    errors,
    kind,
    kindLabel: kindLabel ?? null,
    name: sections.get('投稿名称') ?? '',
  }
}
