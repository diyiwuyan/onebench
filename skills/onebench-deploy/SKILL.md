---
name: onebench-deploy
description: Create, customize, deploy, restore, or improve a user-owned OneBench personal workbench from a one-sentence need. Use when a user asks an agent to set up their personal dashboard, choose a OneBench role template, configure modules and themes, publish a computer/phone PWA, create a browser new-tab version, sync the reusable workspace configuration with GitHub, or update community templates and modules.
---

# OneBench Deploy

Turn one sentence into the actual OneBench product, not a generic dashboard. Deliver a self-contained HTML file and desktop shortcut first. When phone or multi-device use is requested, keep that local copy and add a user-owned online PWA. Demo, local HTML, PWA, and browser new-tab extension must come from the same OneBench runtime. Preserve the user's name, avatar choice, role theme, module choices, widget order, widget sizes, and data boundary across every output.

## Beginner mode

Treat every user as non-technical unless they explicitly request advanced control. Infer the closest pack from their words; do not ask them to learn the catalog. Ask “你希望先管好哪几件事？” only when the request contains no usable role or goal. Do not mention module IDs, GitHub, deployment, tokens, or configuration files before a working local version exists.

Read `references/beginner-mode.md` before handoff. Give only three plain-language actions: computer opening, phone home-screen installation when requested, and how to say “帮我改成……” next time.

### Filling the two blanks

The plain-language values in the starter prompt are valid inputs; do not make beginners learn the catalog first. Normalize them as follows:

- “学生” defaults to the `university` pack (OneBench's student pack means university student); “学习” keeps that pack's course, assignment and certification defaults and includes the learning module.
- “K12 教师／老师”、“考研”、“考公”、“内容创作者”、“产品／运营”、“自由职业者” and “团队负责人” map to their identically named first-party packs.
- Use the 1–3 things after “最想管理” to prioritize the default modules and title. A broad word such as “学习” is sufficient for a working first version; a more concrete list improves the result but is never required.
- Use the role pack's theme by default. If the user gives a preferred color or style, keep the role modules and change only the theme.
- If the user provides a name or preferred form of address, write it to `workspace.profile.displayName`; otherwise use a warm generic address and let them change it in “定制”.

## Delivery choice

Always complete and verify **local desktop delivery** first. Add **owned online delivery** when the user asks for phone use, multi-device synchronization, a public link, or ongoing source changes. Never substitute a temporary agent-platform URL for either delivery.

## Local desktop delivery (default)

1. Inspect `packages/template-packs/first-party-packs.json`, `src/data/modules.js`, `src/data/themes.js`, and `docs/BEGINNER.md`. Do not rebuild the UI outside this repository.
2. Infer the closest pack and retain all shared and role-default modules. Run `npm ci` when dependencies are absent, then use `scripts/create-local-workbench.mjs --pack 模板ID --prompt 用户需求 --name 用户称呼 --workspace-name 工作台名称 --out 用户桌面/我的工作台.html`. Omit the two name flags when the user did not provide them.
3. Run `scripts/create-desktop-launcher.mjs --html 用户桌面/我的工作台.html --out 用户桌面/打开我的工作台.command` on macOS, or use `--platform win32 --out 用户桌面/打开我的工作台.url` on Windows. Verify that the generated launcher points to the HTML file.
4. Open the generated HTML in a browser and verify:
   - the selected role title and realistic starter content are visible;
   - the role-linked theme is active and the user can change name and avatar;
   - the left rail contains app entrances while the homepage contains only the role's useful first-screen widgets;
   - shared calendar, cached weather, tasks and role-specific modules are present;
   - widget edit mode can reorder cards, change sizes, move a widget to the sidebar, and preserve the layout after reload;
   - adding and completing a task persists after reload;
   - starter data is identified as role-pack sample content, and every visible item can be edited or removed from its module editor;
   - a role control works, such as starting the focus timer, updating a study goal, editing a learning plan, or refreshing weather;
   - no required script, font, image, or stylesheet depends on the network.
5. Do not hand off an empty shell, English module IDs, placeholder cards, a landing page, or a second UI invented outside OneBench. Explain local data only if needed.

## Owned online delivery (optional upgrade)

1. Read `docs/OWNERSHIP.md`. Derive the closest pack, required modules, and concise prompt. Ask only when the target role, GitHub account, repository visibility, or data boundary materially changes the workspace.
2. If the user does not already have an owned repo, create `用户账号/onebench-名称` from the `diyiwuyan/onebench` template. If template creation is unavailable, clone the full source into a new user-owned repository. Never create a `gh-pages`-only repository as the user's project.
3. In that repository, run `node scripts/create-owned-workspace.mjs --owner 用户名 --repo 仓库名 --pack 模板ID --prompt 用户需求`. Commit `workspace.json` and `.onebench/ownership.json`; add `upstream` pointing to `https://github.com/diyiwuyan/onebench.git`.
4. Commit and push the full source. Wait for **Deploy user-owned workbench** to succeed, then open `https://用户名.github.io/仓库名/`. Repeat the local checks at desktop and mobile widths, including widget order and content persistence, then install it to the phone home screen. Do not claim deployment before this succeeds.
5. Explain content sync only as an explicit opt-in: use a separate private repository, enable “同步待办和备忘录内容”, and create a Fine-grained token limited to that private repository's Contents read/write permission. Do not store that token in the source repository.
6. Run the full verification gate below. Use `npm run build:extension` and verify the generated manifest when browser new-tab delivery is requested.

## Verification gate

Run `npm run validate:templates && npm run validate:modules && npm run validate:registry && npm test && npm run build && npm run test:sites`. Treat a successful build as necessary, not sufficient: browser interaction and reload persistence must also pass.

## Community updates and contributions

- Refresh the metadata catalog with `npm run update:registry`. This must never execute remote code in the browser.
- For an upstream update, fetch the `upstream` remote, review the pinned change, merge it into the user's repository, run the verification commands, and push. Preserve the user's `workspace.json` and local-data boundary.
- For a community contribution, classify it as a career pack, layout template, theme pack, module bundle, or individual module. Follow `docs/TEMPLATE-SUBMISSION.md` and `docs/COMMUNITY.md`. Require fixed source repository, path, ref, and declared permissions. Review and merge source code before enabling a module; never install arbitrary remote JavaScript dynamically.
- Treat the built-in registry as an offline snapshot. “联网检查更新” may refresh metadata only; installing new executable code still requires a pinned-source review, merge, and full verification.
- Build the optional Chrome/Edge start-page edition with `npm run build:extension`; load only the generated `dist/extension` folder. Tell the user to open `chrome://extensions` or `edge://extensions`, enable developer mode, and load that folder. Read `docs/BROWSER-EXTENSION.md` for the user-facing steps.

## Required boundaries

- Keep the app local-first. Upload daily content only after explicit opt-in to a separate private data repository; never upload credentials.
- Treat uploaded avatar photos as local daily content. Include them in an encrypted backup or private content sync only after explicit opt-in.
- Use only registered module IDs. Add a new module through the module manifest before referencing it in a pack.
- Treat role content as editable first-use seed data. Never hard-code a plan, habit, goal, link, or status that the user cannot edit or delete.
- Keep calendar and weather as shared widgets. Weather must use an explicit public source, cache the last successful result locally, and leave the offline workbench usable when refresh fails.
- Do not flatten every installed module onto the homepage. Use the left rail for application entrances and persist homepage placement, order, and size in the workspace configuration.
- For a new role template, update the template pack and shared runtime; do not hard-code a separate standalone dashboard.
- If deployment is requested, keep the build static and preserve the PWA manifest and service worker.
- Do not say “permanent”, “automatically updated”, or “already deployed” without evidence. The only acceptable long-term handoff is a user-owned source repository plus a verified deployment.

## Resources

- Run `scripts/create-workspace.mjs` to generate a portable configuration.
- Run `scripts/create-owned-workspace.mjs` when creating a user-owned repository.
- Read `references/operations.md` when choosing a recovery path, local desktop delivery, ownership setup, GitHub sync, public registry update, or community contribution workflow.
- Read `references/beginner-mode.md` for the exact low-friction conversation and handoff pattern.
