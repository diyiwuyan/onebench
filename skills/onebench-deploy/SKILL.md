---
name: onebench-deploy
description: Create, customize, deploy, restore, or improve a OneBench personal workbench from a user's one-sentence need. Use when a user asks an agent to set up their personal dashboard, choose a OneBench role template, configure modules and themes, make the PWA usable on computer or phone, or sync the reusable workspace configuration with GitHub.
---

# OneBench Deploy

Turn a user's need into a usable local-first workbench, then validate it before handoff. Treat `workspace.json` as the portable product; do not generate an unrelated app per user.

## Beginner mode

Treat every user as non-technical unless they explicitly request advanced control. Start with one reassuring sentence and ask only: “你希望先管好哪几件事？” Infer the closest pack and install its defaults. Do not mention module IDs, GitHub, deployment, tokens, or configuration files until the working version exists or the user asks.

At handoff, give only three plain-language actions: where to open it, how to add it to the phone home screen, and how to say “帮我改成……” next time. Read `references/beginner-mode.md` before any beginner-facing handoff.

### Filling the two blanks

The plain-language values in the starter prompt are valid inputs; do not make beginners learn the catalog first. Normalize them as follows:

- “学生” defaults to the `university` pack (OneBench's student pack means university student); “学习” keeps that pack's course, assignment and certification defaults and includes the learning module.
- “K12 教师／老师”、“考研”、“考公”、“内容创作者”、“产品／运营”、“自由职业者” and “团队负责人” map to their identically named first-party packs.
- Use the 1–3 things after “最想管理” to prioritize the default modules and title. A broad word such as “学习” is sufficient for a working first version; a more concrete list improves the result but is never required.

## Workflow

1. Inspect the repo root, `packages/template-packs/first-party-packs.json`, and `src/data/modules.js`.
2. Derive the closest pack, required modules, and a concise prompt from the user's statement. Ask only when the target role or data boundary materially changes the workspace.
3. Generate or update `workspace.json` with `scripts/create-workspace.mjs`. Keep personal task/note data local; the file contains structure and settings only.
4. Run `npm run validate:templates`, `npm test`, `npm run build`, and `npm run test:sites`. Open the local app and test the selected pack, module change, and a daily task.
5. Explain computer/phone use: install the PWA when supported; otherwise add it to the mobile home screen. Restore the same configuration by importing `workspace.json`, a passphrase-encrypted backup, or pulling from the user's GitHub repository.
6. Treat GitHub tokens as user secrets: never print, commit, or upload them. Use a Fine-grained token limited to the chosen repository's Contents read/write permission.

## Required boundaries

- Keep the app local-first. Do not upload tasks, quick notes, calendar entries, or credentials through the configuration sync.
- Use only registered module IDs. Add a new module through the module manifest before referencing it in a pack.
- For a new role template, update the template pack manifest and run its validator; do not hard-code a new standalone dashboard.
- If deployment is requested, keep the build static and preserve the PWA manifest and service worker.

## Resources

- Run `scripts/create-workspace.mjs` to generate a portable configuration.
- Read `references/operations.md` when choosing a recovery path, GitHub sync, or community contribution workflow.
- Read `references/beginner-mode.md` for the exact low-friction conversation and handoff pattern.
