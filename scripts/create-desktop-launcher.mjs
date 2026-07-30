import { access, chmod, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const valueOf = (flag, fallback = '') => {
  const index = args.indexOf(flag)
  return index === -1 ? fallback : args[index + 1] || fallback
}

const html = resolve(process.cwd(), valueOf('--html'))
if (!valueOf('--html')) throw new Error('请提供 --html 本地工作台文件路径。')
await access(html)
const platform = valueOf('--platform', process.platform)
const isWindows = platform === 'win32'
const output = resolve(process.cwd(), valueOf('--out', isWindows ? '打开我的工作台.url' : '打开我的工作台.command'))

if (isWindows) {
  const url = `file:///${html.replace(/\\/g, '/').replace(/^\//, '')}`
  await writeFile(output, `[InternetShortcut]\nURL=${url}\n`, 'utf8')
} else {
  const escaped = html.replace(/"/g, '\\"')
  await writeFile(output, `#!/bin/zsh\nopen "${escaped}"\n`, { encoding: 'utf8', mode: 0o755 })
  await chmod(output, 0o755)
}
console.log(`已生成桌面快捷方式：${output}`)
