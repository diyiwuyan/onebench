import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createWorkspace } from '../src/lib/workspace.js'
import { exportDesktopHtml } from '../src/lib/local-export.js'

test('desktop export injects workspace data into the shared standalone app', async () => {
  const workspace = createWorkspace({ packId: 'university', prompt: '我是大学生，想管理课程和作业' })
  const template = await readFile(new URL('../public/standalone.html', import.meta.url), 'utf8')
  const html = exportDesktopHtml(workspace, { tasks: [{ id: 'task-1', title: '完成作业', done: false }], quickNote: '记下重点' }, template)
  assert.match(html, /<!doctype html>/i)
  assert.match(html, /%E5%AE%8C%E6%88%90%E4%BD%9C%E4%B8%9A/)
  assert.match(html, /localStorage/)
  assert.doesNotMatch(html, /<script[^>]+src=/i)
  assert.doesNotMatch(html, /window\.__ONEBENCH_SEED__\s*=\s*['"]__ONEBENCH_PAYLOAD__['"]/)
})
