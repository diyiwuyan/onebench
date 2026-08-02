import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createWorkspace } from '../src/lib/workspace.js'
import { exportDesktopHtml } from '../src/lib/local-export.js'

test('desktop export injects workspace data into the shared standalone app', async () => {
  const workspace = createWorkspace({ packId: 'university', prompt: '我是大学生，想管理课程和作业' })
  const template = await readFile(new URL('../public/standalone.html', import.meta.url), 'utf8')
  const professionalData = { profile: { name: '小陈' }, mockExams: [{ id: 'mock-1', title: '国考模拟卷', questions: 120, correct: 88 }] }
  const html = exportDesktopHtml(workspace, { tasks: [{ id: 'task-1', title: '完成作业', done: false }], quickNote: '记下重点' }, template, { edition: 'exam', professionalData })
  assert.match(html, /<!doctype html>/i)
  assert.match(html, /%E5%AE%8C%E6%88%90%E4%BD%9C%E4%B8%9A/)
  assert.match(html, /localStorage/)
  assert.match(html, /%22edition%22%3A%22exam%22/)
  assert.match(html, /%22professionalData%22/)
  assert.match(html, /%E5%9B%BD%E8%80%83%E6%A8%A1%E6%8B%9F%E5%8D%B7/)
  assert.doesNotMatch(html, /<script[^>]+src=/i)
  assert.doesNotMatch(html, /window\.__ONEBENCH_SEED__\s*=\s*['"]__ONEBENCH_PAYLOAD__['"]/)
})
