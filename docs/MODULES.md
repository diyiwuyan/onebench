# 模块协议

模块是工作台能力的最小单元。模板包只能引用已注册的模块 ID。

- `local`：任务、笔记、日历等用户内容，默认只存当前设备，不能被配置同步上传。
- `local-sensitive`：健康、财务、日记等敏感内容，默认只存当前设备；只有用户主动开启私有内容同步才允许上传。
- `configuration`：主题、布局、模块开关等可写入 `workspace.json` 的设置。
- `network-cached`：天气、新闻、RSS 等公开数据，联网读取并保留最近一次本地缓存。

每个模块还要声明能力类型：`manual`（手动记录）、`derived`（自动计算）、`live`（联网更新）、`connector`（外部连接）或 `agent`（智能体整理）。这决定模块设置页应该让用户维护什么：新闻维护主题和来源，生日维护日期，汇率维护货币，智能简报维护计划，而不是统一要求用户手工填写展示内容。

新模块须在 `packages/modules/core.manifest.json` 注册，补充 UI 实现与本地数据边界，并运行 `npm run validate:modules`。外部连接器必须明确授权范围；首期不允许模块暗中上传用户内容。

要被公共目录引用的模块，还必须在 `packages/community-registry/registry.json` 固定来源仓库、文件路径、版本引用和所需权限。公共目录更新只同步元数据，绝不在浏览器内下载并执行远程脚本；模块代码要经过 PR／版本审阅后才进入用户工作台。

## 一个完整模块包含什么

- `src/data/modules.js`：用户可见名称、说明、分类与图标。
- `packages/modules/core.manifest.json`：稳定 ID 和数据边界。
- `src/lib/local-data.js`：本地默认数据与职业示例内容。
- `src/App.jsx`：复用现有卡片、列表、指标等组件的 UI。
- `src/lib/connectors.js`：联网数据源、RSS/ICS/书签解析和本地智能简报逻辑。
- `packages/community-registry/registry.json`：可选的公共目录来源、权限与 `requires` 组合。

职业包只负责组合模块，不复制模块代码。个人资料、主题和同步属于 `configuration`；任务、头像照片、笔记、进度、收入等内容属于 `local`，除非用户明确开启私有内容同步。
