# OneBench widget workbench QA

- Reference capture: `/tmp/onebench-audit/02-itab-app.png` (iTab current web start page).
- Implementation capture: `/tmp/onebench-audit/06-onebench-final-desktop.png`.
- Combined comparison: `/tmp/onebench-audit/07-comparison.png`.
- Mobile capture: `/tmp/onebench-audit/05-onebench-mobile-cdp.png` at 390 × 844 CSS px.
- State: postgraduate exam pack, campus-blue local test theme state, editable role starter data.

## Visual findings

No actionable P0, P1, or P2 findings.

- Borrowed the useful iTab anatomy without copying its visual skin: persistent left application rail, a curated first-screen widget canvas, compact calendar/weather, and a module market.
- Preserved OneBench's accepted product identity: warm paper artwork, calm lifestyle hierarchy, role-specific headline, summary rhythm, light surfaces, thin borders and rounded cards.
- The homepage is no longer a flat dump of installed modules. Non-home modules remain reachable from the “全部” application drawer.
- Widget edit controls are visible only in edit mode except for the small pencil entry, which makes the previously static-looking cards discoverably editable.
- Desktop keeps a denser two/three-column widget rhythm. At 390 × 844 the side rail becomes bottom navigation, cards collapse to one column, and the document reports no horizontal overflow.
- Calendar, weather, task and role progress widgets fit the same component system; no foreign dashboard style was introduced.

## Interaction evidence

1. Edited “数学” to “数学冲刺” in the learning-plan editor and reloaded; the value persisted.
2. Entered widget edit mode, changed weather from small to medium and reloaded; the size persisted.
3. Reordered calendar with the keyboard drag sensor; DOM order changed from `calendar,tasks,...` to `tasks,calendar,...` and persisted after reload.
4. Moved weather to the sidebar, confirmed it disappeared from the homepage, then restored it from “全部应用”.
5. Refreshed Beijing weather through Open-Meteo; the widget changed from the starter cache to 31°C and the editor reported a successful cached update.
6. Verified that learning, tasks, calendar, habits, goals, countdowns, files, role progress, detail lists, metrics, analytics, focus, review and weather all have a direct interaction or an add/edit/delete editor.
7. Ran template, module and registry validation; 12 unit tests; Sites build tests; production build; and MV3 extension build.

## Intentional differences from iTab

1. OneBench leads with the user's role and current intent instead of a search box and website shortcuts.
2. OneBench keeps private daily work data local by default and treats online refresh/sync as explicit upgrades.
3. Career packs preload a theme, useful modules and editable first-use examples; iTab's generic component grid does not supply this role layer.

final result: passed
