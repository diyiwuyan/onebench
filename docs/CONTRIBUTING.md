# 贡献模板包

一句工作台的模板不是独立页面，而是可组合的配置包。贡献新场景时：

1. 复制 `packages/template-packs/first-party-packs.json` 中一个 pack 的字段结构，提交你的场景包 PR。
2. 指定默认模块、职业主题、首页引导语和无隐私示例内容；模块 ID 必须来自 `src/data/modules.js`。
3. 运行 `npm run validate:templates`；CI 会同时执行测试、公共目录校验和构建。
4. 使用 `packages/workspace-schema/workspace.schema.json` 校验导出的工作台配置。
5. 在 PR 中附上 1 张桌面截图、1 张手机截图和目标用户说明。

不要在模板包中放真实用户数据、头像、令牌或第三方账号信息。想让模板出现在公共目录时，还要在 `packages/community-registry/registry.json` 增加固定来源、版本引用、`requires` 和权限声明，并运行 `npm run validate:registry`。

## 贡献模块

1. 在 `src/data/modules.js` 和 `packages/modules/core.manifest.json` 使用同一个唯一 ID。
2. 在 `src/lib/local-data.js` 增加默认数据，并在 `src/App.jsx` 实现真实可用状态。
3. 明确 `local` 或 `configuration` 数据边界；需要联网时写清权限和失败降级方式。
4. 在社区目录登记固定源码位置与所需模块组合。
5. 完成桌面、手机、离线与刷新持久化验收。
