# OneBench 专业版终态 Design QA

## 对比目标

- source visual truth: `design-evidence/01-user-professional-editions-audit.png`
- implementation screenshot: `design-evidence/09-teacher-final-pass.png`
- combined comparison: `design-evidence/10-teacher-before-after-final.png`
- source pixels: 1565 × 853
- implementation pixels: 1265 × 712
- CSS viewport: 1280 px 宽（浏览器内容区 1265 px）
- deviceScaleFactor: 1
- normalization: 为同屏比较，将 source 等比之外按验收画布缩放为 1265 × 712；实现截图保持原始像素，合并图为 2530 × 712。
- state: 班主任工作台首页，桌面宽度，左侧导航和底部设置入口同时可见。

## Full-view comparison evidence

`design-evidence/10-teacher-before-after-final.png` 在同一张图中并排展示了用户标注的旧版和最终实现。最终实现保留了薄荷色班主任视觉、左侧专业导航、问候、三项指标和待办主区；同时移除了顶端版本切换器，并把左下角改成“设置”。页面没有横向滚动，控制台无错误。

## Focused-region comparison

本轮不需要额外裁切：唯一必须精确核对的顶部版本切换器和左下角入口都在 2530 × 712 的合并图中清晰可读；首页标题、指标、待办与删除控件也都处于首屏。

## Findings

- fonts and typography: passed。中文使用系统无衬线字体，标题／指标／正文层级清楚；胡楚靓同款和创作者版单独使用衬线展示标题，版本间视觉差异明确。
- spacing and layout rhythm: passed。侧栏、顶栏、三列指标和主卡片在桌面宽度对齐；专业内容区使用 flex 剩余宽度，不再横向溢出。
- colors and tokens: passed。考公粉、教师薄荷、生活橄榄、创作者暖米白分别使用独立 token；状态色和文字对比清楚。
- image quality and asset fidelity: passed。专业版没有用复制截图、CSS 画图、手写 SVG 或占位图替代界面资产；图标统一使用 Phosphor 图标库。
- copy and content: passed。主界面不再出现架构性“返回基础版”或顶部版本标签；模块说明对应真实操作。
- behavior: passed。浏览器已验证设置内版本切换、教师新增／删除学生、创作者新增选题、专业数据本地保存；29 项自动测试通过。
- responsiveness: passed。`design-evidence/05-hu-mobile.png` 证明 375 × 812 手机视口下侧栏、设置、待办和内容卡片可用，无横向滚动。
- accessibility: passed for visible scope。导航、表单、设置对话框和删除按钮具有语义与可访问名称；截图无法证明完整键盘顺序或屏幕阅读器体验，这部分由后续专项测试覆盖。

## Comparison history

1. P1 — 顶部版本切换器破坏专业版沉浸感；左下角“返回基础版”暴露产品架构。
   - fix: 删除 `.edition-switcher`，新增左下角“设置”和设置抽屉；基础版／专业版切换全部移入设置。
   - post-fix evidence: `design-evidence/03-settings-panel.png`、`design-evidence/10-teacher-before-after-final.png`。
2. P1 — 四个专业版共用 `SecondaryView`，只有进度条和备注，无法完成真实流程。
   - fix: 拆成 `ExamEdition`、`TeacherEdition`、`HuEdition`、`CreatorEdition` 四套数据与页面；提供新增、更新、删除、状态推进、统计和座位交换。
   - post-fix evidence: `design-evidence/04-creator-pipeline.png`，以及浏览器交互验收记录。
3. P2 — 桌面 flex 内容区一度产生横向溢出。
   - fix: 专业内容区改为 `flex: 1; width: auto; min-width: 0`。
   - post-fix evidence: 终态浏览器测量 `innerWidth: 1280`、`scrollWidth: 1265`，不存在页面级横向滚动。
4. P2 — 教师版学生数显示为仅已录入的 3 条示例记录，无法表达真实班级规模。
   - fix: 新增可在设置中编辑的 `classSize`，默认 42；学生跟进记录继续独立维护。
   - post-fix evidence: `design-evidence/09-teacher-final-pass.png` 显示 42 名班级学生。

## Implementation checklist

- [x] 去掉顶部专业版切换器
- [x] 左下角改为设置，版本切换和返回基础版进入设置
- [x] 四版独立导航、数据模型和核心 CRUD
- [x] 本地持久化、旧数据 ID 迁移、导入／导出／恢复
- [x] 指定专业版单文件生成参数 `--edition`
- [x] 桌面和手机浏览器验收
- [x] 自动测试、构建、Sites worker 验证

final result: passed
