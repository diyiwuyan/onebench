import assert from 'node:assert/strict'
import test from 'node:test'
import { createWorkspace } from '../src/lib/workspace.js'
import { exportDesktopHtml } from '../src/lib/local-export.js'

test('desktop export is a standalone HTML workbench with local task behavior', () => {
  const workspace = createWorkspace({ packId: 'university', prompt: '我是大学生，想管理课程和作业' })
  const html = exportDesktopHtml(workspace, { tasks: [{ id: 'task-1', title: '完成作业', done: false }], quickNote: '记下重点' })
  assert.match(html, /<!doctype html>/i)
  assert.match(html, /今天待办/)
  assert.match(html, /localStorage/)
  assert.doesNotMatch(html, /<script[^>]+src=/i)
})
