import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const source = resolve(root, '.onebench/standalone/standalone.html')
const output = resolve(root, 'public/standalone.html')
const html = await readFile(source, 'utf8')

if (!html.includes('__ONEBENCH_PAYLOAD__')) {
  throw new Error('Standalone build lost the OneBench payload token.')
}

await mkdir(resolve(root, 'public'), { recursive: true })
await copyFile(source, output)
console.log('Prepared shared standalone runtime: public/standalone.html')
