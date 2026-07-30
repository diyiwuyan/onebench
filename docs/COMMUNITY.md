# 社区模板与模块目录

社区贡献的是可审阅、可组合的配置和源码，不是从网页静默下载并执行的未知脚本。

## 模板贡献

提交模板包时，沿用 `packages/template-packs/template-pack.schema.json`，只引用已注册模块；在 PR 中说明目标人群、默认模块、桌面和手机截图。运行：

```bash
npm run validate:templates
npm test
```

## 模块贡献

模块必须注册到 `packages/modules/core.manifest.json`，声明本地数据边界、所需权限和 UI 实现；第三方连接器必须明确授权范围。不要上传用户任务、笔记、令牌或账号资料。

```bash
npm run validate:modules
```

## 公共目录与更新

`packages/community-registry/registry.json` 是机器可读的公共目录。每个条目固定来源仓库、文件路径与版本引用，并声明权限。更新本地目录：

```bash
npm run update:registry
```

该命令只下载和校验目录元数据，不会下载或执行第三方 JavaScript。真正使用社区模块时，应由智能体固定来源版本、审阅代码、合并到用户仓库、运行测试后再部署。这使“可更新”不以牺牲安全为代价。
