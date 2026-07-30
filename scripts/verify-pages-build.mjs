import { readFile } from 'node:fs/promises'

const index = await readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8')
if (!index.includes('/onebench/assets/') || !index.includes('/onebench/manifest.webmanifest')) {
  throw new Error('GitHub Pages build must use the /onebench/ base path.')
}
console.log('Verified GitHub Pages base paths.')
