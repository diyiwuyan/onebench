# Dashboard redesign QA

- Source visual truth: `/var/folders/8r/89xh61fd2c3dr_8j53d9p79h0000gn/T/codex-clipboard-107e8824-692e-4a61-b626-7276b517643e.png`
- Implementation capture: `qa-dashboard-home.png`
- Mobile capture: `qa-dashboard-mobile.png` at 390 × 844 CSS px.
- Combined comparison: `qa-dashboard-home-comparison.png`
- Implementation viewport: 1265 × 712 CSS px, density 1.
- Source dimensions: 1901 × 833 px; normalized to 1265 × 555 px for the vertical comparison. Browser chrome and the reference's top notification bar are excluded from fidelity judgment.
- State: saved Content Creator pack; default modules loaded; task list visible.

## Findings

No actionable P0, P1, or P2 findings.

- Typography: both views prioritize a large centered clock with compact secondary date text. The implementation uses a monospaced clock for stable numeral width and a Chinese UI fallback stack.
- Spacing and layout rhythm: the implementation preserves the left utility rail, centered clock/search stack, dense identity switcher, and rounded dashboard-card grid. The card grid intentionally contains actionable OneBench modules rather than the reference's unrelated web shortcuts.
- Colors and visual tokens: both views use a near-black, low-contrast background with pale text and green active accents. The implementation avoids competing imagery so the module content remains readable.
- Image quality and assets: no reference logo, app icon, or decorative product asset was copied. OneBench uses its own icon-library controls and paper texture behind a dark overlay.
- Copy and content: reference widgets were intentionally replaced with personal-workbench content: identity pack, schedule, tasks, notes, local HTML delivery, module market, and sync.

## Interaction evidence

- Added the `专注` module from the module market; the control changed from “添加” to “已装入”.
- Updated the public registry; the UI reported “已联网更新：2 个公共条目”.
- `npm test`, `npm run build`, `npm run build:pages`, and `npm run build:extension` passed.
- Browser console errors and warnings: none.

## Comparison history

1. Replaced the prior landing-page generator layout with the selected new-tab dashboard anatomy.
2. Captured the rebuilt dashboard at the same desktop-state intent as the reference and compared it in `qa-dashboard-home-comparison.png`.
3. Verified the primary module-market and public-registry interactions after the visual check.
4. Mobile check initially exposed a native horizontal scrollbar below the identity chips (P2). Added a hidden-scrollbar treatment while retaining touch scrolling, then re-captured the mobile layout.

## Follow-up polish

- P3: users may later select a personal background image; keep a high-contrast dark fallback.
- P3: add user-configurable shortcut tiles once a privacy-preserving bookmark data model is approved.

final result: passed
