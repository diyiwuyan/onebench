# OneBench 专业版 Design QA

## Comparison target

- Source visual truth:
  - 考公：`/tmp/onebench-pro-refs/exam.png`（952 × 935）
  - 教师：`/tmp/onebench-pro-refs/teacher.png`（952 × 935）
  - 胡楚靓同款：`/tmp/onebench-hu-display.webp`（1080 × 2297）
  - 创作者：`/tmp/onebench-pro-refs/creator.png`（952 × 935）
- Final implementation captures:
  - `/tmp/onebench-pro-refs/exam-implementation-final.png`
  - `/tmp/onebench-pro-refs/teacher-implementation-final.png`
  - `/tmp/onebench-pro-refs/hu-implementation-final.png`
  - `/tmp/onebench-pro-refs/creator-implementation-final.png`
- Combined comparison evidence:
  - `/tmp/onebench-pro-refs/exam-comparison-final.jpg`
  - `/tmp/onebench-pro-refs/teacher-comparison-final.jpg`
  - `/tmp/onebench-pro-refs/hu-comparison-final.jpg`
  - `/tmp/onebench-pro-refs/creator-comparison-final.jpg`
- Implementation viewport: 390 × 844 CSS px, device scale 1; every implementation capture is 390 × 844 px.
- Normalization: source captures were proportionally resized to 844 px high and placed beside the implementation. Browser chrome and小红书正文区域 were treated as surrounding evidence, not app-owned UI.
- State: each professional version's default home screen; creator pipeline and secondary module interactions were also tested separately.

## Full-view comparison evidence

- 考公：粉色低压背景、窄侧栏、倒计时、每日计划和分科卡片与来源的信息层级一致；重新设计了兔子图标与示例数据。
- 教师：薄荷绿班主任侧栏、班级身份卡、班级统计、待办和学生关注区与来源结构一致；隐私敏感内容使用虚拟数据。
- 胡楚靓同款：白色／橄榄绿、每日计划中心、生活领域侧栏、灵感／复盘／学习卡片与来源移动端节奏一致。
- 创作者：暖米白、今日推进、内容管线、阶段状态和 OKR 与来源视频中的创作者看板主任务一致。

Focused region comparison was not required after normalization: each implementation is a native 390 × 844 capture and the source app regions, sidebars, primary cards, labels and controls are legible in the combined files. Original author avatars, video overlays and小红书 controls were intentionally excluded.

## Required fidelity surfaces

- Fonts and typography: uses system sans-serif for operational UI and Songti/Georgia fallback for the two lifestyle/editorial headings. Weight, hierarchy and wrapping remain legible at 390 px. No clipped persistent control was found.
- Spacing and layout rhythm: mobile sidebars were widened from 58 px to 88 px after the first comparison so labels remain visible like the sources. Cards use consistent 14–24 px rhythm and 14–24 px radii.
- Colors and tokens: each edition uses a separate solid palette—pink, mint, olive, warm beige. Decorative gradients were removed. Status colors retain sufficient contrast on light surfaces.
- Image quality and assets: original author imagery, avatars, video frames and proprietary artwork are not shipped. Standard UI imagery uses Phosphor icons, including the rabbit mark; there are no placeholder images, handmade SVGs or CSS illustrations.
- Copy and content: visible copy is rewritten for OneBench and uses realistic but fictional tasks, students, scores and content projects. Source-specific prompts and paid/proprietary materials were not copied.

## Comparison history

### Iteration 1

- [P1] Switching from the lifestyle edition to creator caused a blank screen because the previous edition's data did not contain `pipeline`.
  - Fix: load the target edition's data before switching and add a defensive creator-pipeline fallback.
  - Post-fix evidence: creator home renders and `选题 → 制作中` advances without an error.
- [P2] Mobile navigation hid every label and reduced the source's recognizable information architecture to icons.
  - Fix: widen the mobile rail to 88 px and retain visible 9 px labels.
  - Post-fix evidence: all four final comparison captures show labeled side navigation.
- [P2] Secondary navigation only changed the selected icon; the professional modules did not change content.
  - Fix: add dedicated interactive pages for exam practice, essay, mistakes, learning data, students, scores, assignments, conversations, inspiration, review, memo, learning, pipeline, schedule and OKR. Each page has completion toggles, progress and an auto-saved note.
  - Post-fix evidence: the creator `内容管线` page renders, accepts a note and preserves it after reload.

## Findings

No actionable P0, P1 or P2 issue remains in the four primary screens or the tested professional navigation flow.

## Follow-up polish

- [P3] The edition switcher is intentionally visible above the app content, while the source projects do not show a cross-edition switcher.
- [P3] Exact original fonts, avatars, animal artwork and creator video imagery are intentionally not reproduced for copyright and attribution reasons.
- [P3] A future iteration can add true drag-and-drop scheduling to the creator edition and photo/voice input to the exam mistake book.

## Primary interactions tested

- Open the professional-version picker from the basic edition.
- Switch among exam, teacher, lifestyle and creator editions.
- Add and complete a teacher task.
- Advance a creator pipeline item.
- Open a secondary module, toggle its entries and save a note.
- Reload and verify the note remains in local storage.
- Return-to-basic control remains present in every edition.
- Browser console checked: the only captured error was the earlier creator-switch failure before its fix; subsequent reloads and interactions produced no new runtime error.

final result: passed
