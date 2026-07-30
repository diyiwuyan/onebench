import { readFile } from 'node:fs/promises'

const index = await readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8')
const base = process.env.GITHUB_PAGES_BASE || '/onebench/'
if (!index.includes(`${base}assets/`) || !index.includes(`${base}manifest.webmanifest`)) {
  throw new Error(`GitHub Pages build must use the ${base} base path.`)
}
console.log(`Verified GitHub Pages base paths for ${base}.`)
