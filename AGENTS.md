# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable OneBench product direction

- The actual daily workbench is the product. Studio, onboarding, module management, sync, and help belong in secondary panels instead of dominating the home screen.
- Default visual direction: warm paper texture, calm lifestyle feeling, strong role identity, mobile-first hierarchy, and a denser responsive desktop layout. Avoid generic dark admin dashboards.
- Every visible module must be usable. Never represent a promised feature only as an English module ID or an “installed” badge.
- The Demo, downloaded offline HTML, PWA, and browser new-tab extension must run the same app code and show the same workbench. Do not maintain a reduced export-only dashboard.
- First use should already contain realistic role-specific sample content so a beginner understands what to do without configuring anything.
- Keep technical concepts such as GitHub tokens, repository paths, registries, and update sources out of the default beginner flow.
