import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const source = resolve(root, 'dist/client')
const output = resolve(root, 'dist/extension')
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await cp(source, output, { recursive: true })
const manifest = JSON.parse(await readFile(resolve(root, 'extension/manifest.json'), 'utf8'))
const releaseVersion = process.env.ONEBENCH_EXTENSION_VERSION?.replace(/^v/, '')
if (releaseVersion) manifest.version = releaseVersion
await writeFile(resolve(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
await cp(resolve(root, 'extension/INSTALL.txt'), resolve(output, 'INSTALL.txt'))
console.log(`Prepared browser extension ${manifest.version}: dist/extension`)
