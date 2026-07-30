# OneBench role ecosystem QA

- Source visual truth: `qa-onebench-v2-desktop-final.png`
- Implementation capture: `qa-onebench-v3-desktop-final.png`
- Mobile capture: `qa-onebench-v3-mobile-final.png` at 390 × 844 CSS px.
- Combined comparison: `qa-onebench-v3-comparison.png`
- Desktop viewport: 1280 × 720 CSS px; both full-page captures are 1265 px wide.
- State: first-party postgraduate exam pack, warm-paper theme, realistic starter data.

## Findings

No actionable P0, P1, or P2 findings.

- Visual continuity: the v3 implementation preserves the accepted warm-paper visual system, hero artwork, left navigation, summary row, 12-column card rhythm, typography, borders and corner radii.
- New role behavior: switching to Creator changes the theme to `creator-coral`, updates the hero and installs inbox, content calendar and content pipeline. Switching to K12 Teacher changes the theme to `chalk-sage` and installs lesson plans, meetings, projects and classroom modules.
- Personal identity: display name, workspace name and icon-library avatar persist after reload. User-uploaded photos remain local content and are included only in local export, encrypted backup or opted-in private content sync.
- Ecosystem: the market shows 32 built-in modules plus an offline snapshot of 4 community templates and 4 community modules. Installing “内容创作引擎” adds its registered module combination without executing remote code.
- Sync: the drawer clearly separates local-only use, configuration sync and opt-in content sync, with an AES-GCM encrypted migration package available without an account.
- Responsive layout: at 390 × 844, the mobile bottom navigation is active, the Studio drawer fits the viewport, avatar controls use three columns and the document has no horizontal overflow.
- Browser console errors and warnings: none.

## Interaction evidence

1. Changed the display name to “小鹿”, selected the Creator avatar and Creator pack; the coral theme and role modules appeared.
2. Reloaded the page; display name, avatar choice, role, theme and modules persisted.
3. Switched to K12 Teacher; sage theme, lesson-planning content, meetings and classroom data appeared without undefined content.
4. Installed the registered “内容创作引擎” community combination; inbox, publishing calendar and content pipeline were added.
5. Opened the sync drawer and verified local, encrypted backup, configuration sync and private content sync controls.
6. Repeated the Studio flow at mobile width and confirmed no horizontal overflow.

## Comparison history

1. Kept the accepted v2 personal-workbench anatomy instead of introducing a new dashboard style.
2. Added the role-linked theme and module layers within the existing cards and drawers.
3. Compared the v2 and v3 default exam states together; the only intentional homepage addition is the registered “公告与报名” role module.
4. Verified richer Creator and Teacher states separately, then returned the Demo to the postgraduate-exam default for release.

final result: passed
