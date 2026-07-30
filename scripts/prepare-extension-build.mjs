import { cp, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const source = resolve(root, 'dist/client')
const output = resolve(root, 'dist/extension')
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await cp(source, output, { recursive: true })
await cp(resolve(root, 'extension/manifest.json'), resolve(output, 'manifest.json'))
console.log('Prepared browser extension: dist/extension')
