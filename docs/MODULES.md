# 模块协议

模块是工作台能力的最小单元。模板包只能引用已注册的模块 ID。

- `local`：任务、笔记、日历等用户内容，默认只存当前设备，不能被配置同步上传。
- `configuration`：主题、布局、模块开关等可写入 `workspace.json` 的设置。

新模块须在 `packages/modules/core.manifest.json` 注册，补充 UI 实现与本地数据边界，并运行 `npm run validate:modules`。外部连接器必须明确授权范围；首期不允许模块暗中上传用户内容。
