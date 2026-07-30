import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  publicDir: false,
  define: {
    'import.meta.env.ONEBENCH_STANDALONE': 'true',
    'import.meta.env.ONEBENCH_EXTENSION': 'false',
  },
  build: {
    outDir: '.onebench/standalone',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'standalone.html',
    },
  },
})
