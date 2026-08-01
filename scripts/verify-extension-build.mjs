import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const output = resolve(process.cwd(), 'dist/extension')
const manifest = JSON.parse(await readFile(resolve(output, 'manifest.json'), 'utf8'))
const html = await readFile(resolve(output, 'index.html'), 'utf8')
if (manifest.manifest_version !== 3 || manifest.chrome_url_overrides?.newtab !== 'index.html') throw new Error('浏览器扩展 manifest 不完整。')
if (!/^\d{1,5}(?:\.\d{1,5}){0,3}$/.test(manifest.version)) throw new Error('浏览器扩展版本必须是 Chrome 支持的 1 至 4 段数字。')
if (manifest.version.split('.').some((part) => Number(part) > 65535)) throw new Error('浏览器扩展版本的每一段都不能大于 65535。')
if ('host_permissions' in manifest || 'content_scripts' in manifest || 'externally_connectable' in manifest) {
  throw new Error('新标签页扩展不能申请网站读取、内容脚本或外部连接权限。')
}
if (!html.includes('./assets/')) throw new Error('浏览器扩展必须使用相对资源路径。')
if (/(?:src|href)=["']\/(?!\/)/i.test(html)) throw new Error('浏览器扩展不能包含从网站根目录加载的资源。')

for (const iconPath of Object.values(manifest.icons ?? {})) await stat(resolve(output, iconPath))
await stat(resolve(output, 'INSTALL.txt'))

const referencedFiles = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]
  .map((match) => match[1])
  .filter((path) => !/^(?:data:|https?:|#)/i.test(path))
for (const path of referencedFiles) await stat(resolve(output, path.replace(/^\.\//, '')))

async function findForbiddenFiles(directory) {
  const forbidden = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) forbidden.push(...await findForbiddenFiles(path))
    if (entry.isFile() && (entry.name.endsWith('.map') || (await stat(path)).size > 10 * 1024 * 1024)) forbidden.push(path)
  }
  return forbidden
}

const forbiddenFiles = await findForbiddenFiles(output)
if (forbiddenFiles.length) throw new Error(`扩展包含源码映射或超过 10MB 的文件：${forbiddenFiles.join(', ')}`)
console.log(`Verified browser new-tab extension ${manifest.version} without broad website permissions.`)
