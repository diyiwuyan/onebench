# OneBench 生活创作旗舰版 Design QA

## 对比目标

- source visual truth: `audit-2026-08-02/hu-original-1.webp`（每日计划）、`audit-2026-08-02/hu-original-2.webp`（抽屉导航）及 `audit-2026-08-02/08-hu-original-contact-sheet.png`（六屏模块结构）
- implementation screenshots: `design-evidence/14-lifestyle-mobile-home-pass2.png`、`design-evidence/21-lifestyle-mobile-drawer-pass2.png`、`design-evidence/16-lifestyle-idea-feed.png`、`design-evidence/17-lifestyle-trend-feed.png`、`design-evidence/18-lifestyle-violin.png`、`design-evidence/19-lifestyle-desktop-home.png`
- combined comparisons: `design-evidence/15-lifestyle-home-comparison-pass2.png`、`design-evidence/22-lifestyle-drawer-comparison-pass2.png`（仅保留在本地 QA 工作区，不提交包含原作者界面的合成图）
- source pixels: 首页 451 × 960；抽屉 442 × 960
- implementation pixels: 手机截图 375 × 812；桌面截图 1425 × 868
- CSS viewport: 手机覆盖设置为 390 × 844，浏览器可见内容截图为 375 × 812；桌面覆盖设置为 1440 × 900
- deviceScaleFactor: 1
- normalization: 来源首页等比缩放到 375 px 宽并补白至 375 × 812；来源抽屉等比缩放到 812 px 高并居中补白至 375 × 812；实现截图保持原始像素，再分别水平合成为 750 × 812 对比图。
- state: 生活创作旗舰版每日计划首屏与打开模块抽屉状态；动态内容使用 OneBench 原创示例，非逐字复制原作者数据。

## Full-view comparison evidence

`design-evidence/15-lifestyle-home-comparison-pass2.png` 同屏展示来源每日计划与实现：顶栏、纵向完成数字、个人日常、绿色任务卡、创作任务和白灰背景的层级一致。实现保留了 OneBench 的新增与编辑入口，但没有增加破坏首屏结构的后台仪表盘。

`design-evidence/22-lifestyle-drawer-comparison-pass2.png` 同屏展示来源抽屉与实现：白色左侧抽屉、模块顺序、橄榄绿选中态、底部状态均保持一致；实现增加了设置、备份入口和原创来源说明，这是产品要求下的有意扩展。

## Focused-region comparison evidence

- `design-evidence/16-lifestyle-idea-feed.png` 对照来源六屏中的“选题每日灵感”：序号、分类、内容标题、说明与三类行动按钮清晰可读。
- `design-evidence/17-lifestyle-trend-feed.png` 对照“热点视频／二创”：热点标签、适合原因、二创方向和平台/收藏/任务操作形成同类信息结构。
- `design-evidence/18-lifestyle-violin.png` 对照两张小提琴来源屏：当前阶段、进度、今日练习和资源入口均可见；无需再裁切即可判断字体、间距和控件状态。

## Findings

- fonts and typography: passed。顶部与正文使用中文系统无衬线字体，模块标题和内容标题层级接近来源；英文 kicker 只用于次级识别，不占据每日计划首屏。
- spacing and layout rhythm: passed。手机首屏使用纵向指标、白色大卡和 10–16 px 节奏；抽屉比例在第二轮从 88vw 收窄到 72vw，恢复来源中的背景露出和层级感；桌面端居中加密并提供左侧快速模块入口。
- colors and tokens: passed。默认橄榄绿、白色、浅灰和少量暖金对应来源；暖陶与雾蓝是用户主动选择的主题，不影响默认高保真状态。未使用渐变。
- image quality and asset fidelity: passed。来源核心界面没有必须复制的摄影资产；实现未复制人物头像、截图、插画或品牌素材，图标统一使用 Phosphor 图标库。用户上传头像使用本地真实图像。
- copy and content: passed。模块名称与来源工作流一致，说明与示例内容为 OneBench 原创；页面明确说明灵感来源，避免让用户误认为获得原作者授权。
- icons: passed。导航、状态、任务和操作使用同一图标库；移动端图标尺寸、描边和选中状态一致，无手写 SVG、CSS 图形或文本字符替代。
- behavior: passed。浏览器实测任务增删改勾选、灵感加入任务、刷新后保存、筛选/换一批、热点存灵感/加入任务、复盘指标编辑、备忘新增/搜索/归档、练习完成与阶段进度、主题切换、设置与备份入口。
- responsiveness: passed。375 × 812 手机内容无横向溢出；1425 × 868 桌面内容保持移动 App 信息结构，同时用快速模块入口利用宽屏空间。
- accessibility: passed for visible scope。抽屉为对话框，核心按钮有可访问名称，表单字段具备标签，头像具备替代文本，动效支持 `prefers-reduced-motion`。完整屏幕阅读器专项测试不在本轮范围。
- console: passed。应用页面未产生错误；记录到的 warning 均来自用户 Chrome 中第三方钱包扩展的 contentscript，不属于 OneBench。

## Comparison history

1. P1 — 第一轮实现给每日计划增加了来源不存在的大标题，并把两张完成指标并排显示。
   - fix: 删除每日计划 hero，把待完成和完成率恢复为移动端纵向大卡；去掉彩色纸张背景。
   - post-fix evidence: `design-evidence/15-lifestyle-home-comparison-pass2.png`。
2. P2 — 第一轮抽屉占据 88vw，背景几乎不可见，和来源窄抽屉比例不符。
   - fix: 抽屉收窄为 `min(340px, 72vw)`，同时保留长模块名与底部设置入口的可读性。
   - post-fix evidence: `design-evidence/22-lifestyle-drawer-comparison-pass2.png`。
3. P1 — 旧专业版把灵感、内容和学习压成通用阶段卡与分钟记录，无法复现真实工作流。
   - fix: 拆出每日灵感、热点二创、内容复盘、小提琴和英语独立页面，并实现收藏→灵感→任务的数据流转和阶段进度。
   - post-fix evidence: `design-evidence/16-lifestyle-idea-feed.png`、`design-evidence/17-lifestyle-trend-feed.png`、`design-evidence/18-lifestyle-violin.png`。

## Primary interactions tested

- 灵感“加入任务”后按钮变为“已加入任务”，每日计划出现对应创作任务。
- 页面刷新后任务与练习完成状态仍然存在。
- 备忘录可新增，并生成带标签的可编辑条目。
- 橄榄森林 → 暖陶生活 → 橄榄森林主题切换会即时改变根节点主题类。
- 每个抽屉入口都能进入对应独立页面；设置可从抽屉底部打开。

## Implementation checklist

- [x] 移动端 App 顶栏和窄抽屉导航
- [x] 每日计划纵向指标和两类真实任务
- [x] 灵感、热点、任务跨模块流转
- [x] 内容复盘自动指标与结论编辑
- [x] 备忘录搜索、编辑、完成、归档、删除
- [x] 小提琴和英语阶段路线、今日练习与资源入口
- [x] 姓名、角色、状态、头像与三套主题
- [x] 本地持久化、导入、导出和恢复示例
- [x] 手机与桌面浏览器验收
- [x] 自动测试、Pages、扩展和 Sites worker 构建

## Follow-up polish

- P3：未来接入真实热点源后，可增加骨架加载和单条刷新失败状态；当前离线示例与本地缓存路径已经可用。
- P3：来源包含系统状态栏，现有 Web/PWA 截图不复制设备系统 UI，属于预期差异。

final result: passed
