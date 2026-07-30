---
name: onebench-deploy
description: Create, customize, deploy, restore, or improve a user-owned OneBench personal workbench from a one-sentence need. Use when a user asks an agent to set up their personal dashboard, choose a OneBench role template, configure modules and themes, publish a computer/phone PWA, create a browser new-tab version, sync the reusable workspace configuration with GitHub, or update community templates and modules.
---

# OneBench Deploy

Turn a user's need into a usable local-first workbench that they own, then validate it before handoff. Treat `workspace.json` as portable configuration, and the user's repository as the durable product. Do not generate an unrelated app, a platform-only preview, or a repository containing only static assets.

## Beginner mode

Treat every user as non-technical unless they explicitly request advanced control. Start with one reassuring sentence and ask only: “你希望先管好哪几件事？” Infer the closest pack and install its defaults. Do not mention module IDs, GitHub, deployment, tokens, or configuration files until the working version exists or the user asks.

At handoff, give only three plain-language actions: where to open it, how to add it to the phone home screen, and how to say “帮我改成……” next time. Read `references/beginner-mode.md` before any beginner-facing handoff.

### Filling the two blanks

The plain-language values in the starter prompt are valid inputs; do not make beginners learn the catalog first. Normalize them as follows:

- “学生” defaults to the `university` pack (OneBench's student pack means university student); “学习” keeps that pack's course, assignment and certification defaults and includes the learning module.
- “K12 教师／老师”、“考研”、“考公”、“内容创作者”、“产品／运营”、“自由职业者” and “团队负责人” map to their identically named first-party packs.
- Use the 1–3 things after “最想管理” to prioritize the default modules and title. A broad word such as “学习” is sufficient for a working first version; a more concrete list improves the result but is never required.

## Required ownership workflow

1. Inspect the repo root, `packages/template-packs/first-party-packs.json`, `src/data/modules.js`, and `docs/OWNERSHIP.md`.
2. Derive the closest pack, required modules, and concise prompt from the user's statement. Ask only when the target role, GitHub account, repository visibility, or data boundary materially changes the workspace.
3. If the user does not already have an owned repo, create `用户账号/onebench-名称` from the `diyiwuyan/onebench` template. If template creation is unavailable, clone the full source into a new user-owned repository. Never create a `gh-pages`-only repository as the user's project.
4. In that repository, run `node scripts/create-owned-workspace.mjs --owner 用户名 --repo 仓库名 --pack 模板ID --prompt 用户需求`. Commit `workspace.json` and `.onebench/ownership.json`; add `upstream` pointing to `https://github.com/diyiwuyan/onebench.git`.
5. Commit and push the full source. Wait for **Deploy user-owned workbench** to succeed, then open `https://用户名.github.io/仓库名/` and verify the selected pack, a module change, and a daily task. Do not claim deployment before this succeeds.
6. Run `npm run validate:templates`, `npm run validate:modules`, `npm run validate:registry`, `npm test`, `npm run build`, and `npm run test:sites`. Use `npm run build:extension` when browser new-tab delivery is requested.
7. Keep personal task/note data local. Treat GitHub tokens as user secrets: never print, commit, or upload them. Use a Fine-grained token limited to the chosen repository's Contents read/write permission.

## Community updates and contributions

- Refresh the metadata catalog with `npm run update:registry`. This must never execute remote code in the browser.
- For an upstream update, fetch the `upstream` remote, review the pinned change, merge it into the user's repository, run the verification commands, and push. Preserve the user's `workspace.json` and local-data boundary.
- For a community template or module, follow `docs/COMMUNITY.md`. Require fixed source repository, path, ref, and declared permissions. Review and merge source code before enabling a module; never install arbitrary remote JavaScript dynamically.
- Build the optional Chrome/Edge start-page edition with `npm run build:extension`; load only the generated `dist/extension` folder. Read `docs/BROWSER-EXTENSION.md` for the user-facing steps.

## Required boundaries

- Keep the app local-first. Do not upload tasks, quick notes, calendar entries, or credentials through the configuration sync.
- Use only registered module IDs. Add a new module through the module manifest before referencing it in a pack.
- For a new role template, update the template pack manifest and run its validator; do not hard-code a new standalone dashboard.
- If deployment is requested, keep the build static and preserve the PWA manifest and service worker.
- Do not say “permanent”, “automatically updated”, or “already deployed” without evidence. The only acceptable long-term handoff is a user-owned source repository plus a verified deployment.

## Resources

- Run `scripts/create-workspace.mjs` to generate a portable configuration.
- Run `scripts/create-owned-workspace.mjs` when creating a user-owned repository.
- Read `references/operations.md` when choosing a recovery path, ownership setup, GitHub sync, public registry update, or community contribution workflow.
- Read `references/beginner-mode.md` for the exact low-friction conversation and handoff pattern.
