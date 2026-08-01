import assert from 'node:assert/strict'
import test from 'node:test'
import { parseIssueFormSections, validateSubmissionBody } from '../scripts/lib/community-submission.mjs'

const completeBody = `### 投稿类型

单模块（新增独立能力）

### 投稿名称

自动新闻卡片

### 适合谁

希望每天快速了解行业信息的小白用户

### 用户第一次打开能完成什么

不用手工录入，即可看到带来源和更新时间的新闻。

### 默认模块、布局或主题内容

首页包含三条新闻、刷新按钮、来源链接和离线缓存。

### 每个模块如何使用

用户选择主题，系统联网更新；失败时展示最近一次缓存。

### 桌面和手机截图

![桌面](https://github.com/user-attachments/assets/example)

### 源码或设计稿（可选）

_No response_

### 联网、权限与断网方案

只读取公开 RSS，不上传用户数据；断网展示本地缓存。

### 投稿确认

- [x] 所有示例条目都允许用户修改或删除
- [x] 自动内容会显示来源、更新时间和失败后的替代内容
- [x] 不包含口令、令牌、私人数据或无法授权的素材
- [x] 同意通过开源 PR 接受审阅与后续维护`

test('online community submission parses GitHub issue-form sections', () => {
  const sections = parseIssueFormSections(completeBody)
  assert.equal(sections.get('投稿名称'), '自动新闻卡片')
})

test('complete online community submission enters maintainer review', () => {
  const result = validateSubmissionBody(completeBody)
  assert.equal(result.valid, true, result.errors.join('\n'))
  assert.equal(result.kindLabel, 'kind:module')
})

test('submission missing screenshots and confirmations needs more information', () => {
  const result = validateSubmissionBody(completeBody
    .replace('![桌面](https://github.com/user-attachments/assets/example)', '稍后补充')
    .replace('- [x] 自动内容会显示来源、更新时间和失败后的替代内容', '- [ ] 自动内容会显示来源、更新时间和失败后的替代内容'))
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((error) => error.includes('截图')))
  assert.ok(result.errors.some((error) => error.includes('自动内容')))
})
