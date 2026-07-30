import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const output = resolve(process.cwd(), 'dist/extension')
const manifest = JSON.parse(await readFile(resolve(output, 'manifest.json'), 'utf8'))
const html = await readFile(resolve(output, 'index.html'), 'utf8')
if (manifest.manifest_version !== 3 || manifest.chrome_url_overrides?.newtab !== 'index.html') throw new Error('浏览器扩展 manifest 不完整。')
if (!html.includes('./assets/')) throw new Error('浏览器扩展必须使用相对资源路径。')
await stat(resolve(output, 'icons/onebench-192.png'))
console.log('Verified browser new-tab extension build.')
