# OneBench operations

## Recovery choices

- Same browser/device: local storage restores the workbench and local daily data.
- Another computer or phone: import `workspace.json` to restore packs, modules, theme, layout, and the non-sensitive profile configuration.
- Sensitive portable copy: export an AES-GCM encrypted backup and keep the passphrase separately.
- Repeated configuration recovery: bind a personal GitHub repository and pull/push `workspace.json` only.

## Default local desktop handoff

For a beginner who only needs a computer version, generate a single local file plus its launcher:

```bash
node scripts/create-local-workbench.mjs --pack university --prompt '我是大学生，想管理课程和作业' --name '小鹿' --workspace-name '小鹿的学期节奏' --out "/Users/用户名/Desktop/我的工作台.html"
node scripts/create-desktop-launcher.mjs --html "/Users/用户名/Desktop/我的工作台.html" --out "/Users/用户名/Desktop/打开我的工作台.command"
```

On Windows, pass `--platform win32` and write a `.url` launcher instead. The generated HTML is the default product and must contain the same complete dashboard runtime as the Demo. GitHub is an optional later upgrade for phones and multiple computers.

## User-owned repository

Create the user's repository from `diyiwuyan/onebench`, not from a built `dist` folder. In the new clone:

```bash
npm ci
node scripts/create-owned-workspace.mjs --owner USER --repo onebench-mine --pack university --prompt '我是大学生，想管理课程、作业和考证' --name '小鹿' --workspace-name '小鹿的学期节奏'
git remote add upstream https://github.com/diyiwuyan/onebench.git
git add workspace.json .onebench/ownership.json
git commit -m 'chore: initialize my workbench'
git push origin main
```

Wait for the **Deploy user-owned workbench** workflow and verify `https://USER.github.io/onebench-mine/`. If GitHub authentication or Pages permission cannot be obtained, state that exact blocker instead of handing off a temporary platform URL.

## Community contribution

Add role defaults to `packages/template-packs/first-party-packs.json`, choose a theme from `src/data/themes.js`, use only module IDs from `src/data/modules.js`, then run `npm run validate:templates`. Include realistic starter data plus desktop and mobile screenshots in the PR. Add registry entries only with fixed repository/path/ref, `requires`, and a permissions declaration.

## Public catalog update

Run `npm run update:registry` to fetch metadata from the official public catalog into `.onebench/community-registry.json`. It does not install or execute code. For source updates, use `git fetch upstream`, review the diff, merge a pinned revision, run verification, and push.

## Background briefing

The browser version generates the briefing when the workbench is opened. For a computer that should also generate a file while the browser is closed, ask the agent to create a scheduled task that runs:

```bash
npm run briefing -- --workspace workspace.json --input workspace-data.json --output agent-briefing.json
```

The script only reads local JSON files and writes a local briefing. A macOS launchd task, Windows Task Scheduler task, or Linux cron entry may call it; no daily content is uploaded.

## Verification command

`npm run validate:templates && npm run validate:modules && npm run validate:registry && npm test && npm run build && npm run test:sites`

After the command succeeds, open the generated HTML and verify the selected role, side-rail application entrances, editable starter data, task persistence, widget order/size persistence after reload, cached weather fallback, and one role-specific interaction. For online delivery, repeat at desktop and phone widths.
