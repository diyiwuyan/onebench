# 贡献模板包

一句工作台的模板不是独立页面，而是可组合的配置包。贡献新场景时：

1. 复制 `packages/template-packs/first-party-packs.json` 中一个 pack 的字段结构，提交你的场景包 PR。
2. 指定默认模块、主题和引导语；模块 ID 必须来自 `src/data/modules.js`。
3. 运行 `npm run validate:templates`；CI 会同时执行测试和构建。
4. 使用 `packages/workspace-schema/workspace.schema.json` 校验导出的工作台配置。
5. 在 PR 中附上 1 张桌面截图、1 张手机截图和目标用户说明。

不要在模板包中放真实用户数据、令牌或第三方账号信息。
