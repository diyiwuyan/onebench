# OneBench operations

## Recovery choices

- Same browser/device: local storage restores the workbench and local daily data.
- Another computer or phone: import `workspace.json` to restore packs, modules, theme, and layout.
- Sensitive portable copy: export an AES-GCM encrypted backup and keep the passphrase separately.
- Repeated configuration recovery: bind a personal GitHub repository and pull/push `workspace.json` only.

## User-owned repository

Create the user's repository from `diyiwuyan/onebench`, not from a built `dist` folder. In the new clone:

```bash
npm ci
node scripts/create-owned-workspace.mjs --owner USER --repo onebench-mine --pack university --prompt '我是大学生，想管理课程、作业和考证'
git remote add upstream https://github.com/diyiwuyan/onebench.git
git add workspace.json .onebench/ownership.json
git commit -m 'chore: initialize my workbench'
git push origin main
```

Wait for the **Deploy user-owned workbench** workflow and verify `https://USER.github.io/onebench-mine/`. If GitHub authentication or Pages permission cannot be obtained, state that exact blocker instead of handing off a temporary platform URL.

## Community contribution

Add role defaults to `packages/template-packs/first-party-packs.json`, use only module IDs from `src/data/modules.js`, then run `npm run validate:templates`. Include desktop and mobile screenshots in the PR. Add registry entries only with fixed repository/path/ref and a permissions declaration.

## Public catalog update

Run `npm run update:registry` to fetch metadata from the official public catalog into `.onebench/community-registry.json`. It does not install or execute code. For source updates, use `git fetch upstream`, review the diff, merge a pinned revision, run verification, and push.

## Verification command

`npm run validate:templates && npm run validate:modules && npm run validate:registry && npm test && npm run build && npm run test:sites`
