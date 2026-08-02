import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const componentUrl = new URL('../src/professional/ProfessionalEdition.jsx', import.meta.url)
const styleUrl = new URL('../src/professional/professional-edition.css', import.meta.url)
const appUrl = new URL('../src/App.jsx', import.meta.url)

test('professional editions expose four independent persisted experiences', async () => {
  const source = await readFile(componentUrl, 'utf8')
  for (const edition of ['exam', 'teacher', 'hu', 'creator']) {
    assert.match(source, new RegExp(`${edition}:`))
  }
  assert.match(source, /onebench\.professional\.\$\{edition\}/)
  assert.match(source, /ExamEdition/)
  assert.match(source, /TeacherEdition/)
  assert.match(source, /HuEdition/)
  assert.match(source, /CreatorEdition/)
  assert.match(source, /SettingsPanel/)
  assert.match(source, /switchEdition/)
  assert.match(source, /practices/)
  assert.match(source, /students/)
  assert.match(source, /ideas/)
  assert.match(source, /pipeline/)
  assert.doesNotMatch(source, /edition-switcher/)
  assert.doesNotMatch(source, /返回基础版/)
})

test('professional modules support real add update delete and local backup flows', async () => {
  const source = await readFile(componentUrl, 'utf8')
  assert.match(source, /updateItem/)
  assert.match(source, /removeItem/)
  assert.match(source, /exportData/)
  assert.match(source, /importData/)
  assert.match(source, /恢复示例数据/)
  assert.match(source, /点击两名学生即可交换座位/)
  assert.match(source, /正确率自动计算/)
})

test('professional editions are reachable from the basic workbench', async () => {
  const source = await readFile(appUrl, 'utf8')
  assert.match(source, /选择专业版/)
  assert.match(source, /<ProfessionalEdition/)
  assert.match(source, /openEdition\(id\)/)
})

test('professional edition styling avoids copied raster assets and CSS illustrations', async () => {
  const source = await readFile(styleUrl, 'utf8')
  assert.doesNotMatch(source, /linear-gradient|radial-gradient|\.bunny\s+i/)
  assert.match(source, /\.professional--teacher/)
  assert.match(source, /\.professional--hu/)
  assert.match(source, /\.professional--creator/)
})
