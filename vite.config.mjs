import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isBrowserExtension = process.env.ONEBENCH_TARGET === "extension";
const pagesBase = process.env.GITHUB_PAGES_BASE || "/onebench/";

export default defineConfig({
  base: isBrowserExtension ? "./" : isGitHubPages ? pagesBase : "/",
  define: {
    'import.meta.env.ONEBENCH_EXTENSION': JSON.stringify(isBrowserExtension),
  },
  build: {
    outDir: "dist/client",
    chunkSizeWarningLimit: 420,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client"],
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          icons: ["@phosphor-icons/react"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  plugins: [react()],
});
