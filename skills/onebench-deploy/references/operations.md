# OneBench operations

## Recovery choices

- Same browser/device: local storage restores the workbench and local daily data.
- Another computer or phone: import `workspace.json` to restore packs, modules, theme, and layout.
- Sensitive portable copy: export an AES-GCM encrypted backup and keep the passphrase separately.
- Repeated configuration recovery: bind a personal GitHub repository and pull/push `workspace.json` only.

## Community contribution

Add role defaults to `packages/template-packs/first-party-packs.json`, use only module IDs from `src/data/modules.js`, then run `npm run validate:templates`. Include desktop and mobile screenshots in the PR.

## Verification command

`npm run validate:templates && npm test && npm run build && npm run test:sites`
