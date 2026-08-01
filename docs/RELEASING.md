# OneBench 版本发布说明

## 发布前

1. 确认模板、模块和公共目录校验通过，运行完整测试与网页构建。
2. 构建浏览器扩展，确认新标签页可打开、无宽泛网站权限，并完成一次备份／恢复。
3. 在桌面与手机尺寸验收线上 Demo，检查离线状态和联网模块的失败提示。
4. 发布说明列出新增能力、权限变化、迁移步骤、已知限制和回退版本。

## GitHub 发布

创建纯数字语义版本标签，例如 `v0.2.0`，然后发布 GitHub Release。`Package browser extension` 工作流会：

1. 用标签版本重新构建同一套 OneBench 应用。
2. 验证 Manifest V3、资源路径、图标、权限和包体。
3. 生成根目录含 `manifest.json` 和 `INSTALL.txt` 的 `onebench-browser-extension.zip`。
4. 把安装包上传为 Actions artifact，并附加到 Release。

GitHub Pages 继续由主分支部署工作流发布。发布后分别打开线上 Demo 和扩展新标签页，完成冒烟验收，再把 Release 标记为推荐版本。

## 回退

网页出现阻断问题时，重新发布最后一个通过验收的 commit。扩展出现问题时保留上一版 Release 安装包，并在新版本说明中提示用户先导出备份，再加载上一版文件夹。不要通过修改公共目录让用户静默执行回退代码。
