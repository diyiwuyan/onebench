# 公共资讯与 RSS

OneBench 的新闻不依赖浏览器临时调用某个免费转换代理。线上 Demo 默认读取同源静态快照：GitHub Actions 每两小时读取经过登记的公开 RSS，只保存标题、短摘要、来源、发布时间和原文链接，再生成 `public/data/news.json`。网页请求失败时不会清空数据，而是继续显示用户设备里最近一次成功缓存和内置离线示例。

## 数据流

1. 资讯源登记在 `packages/live-data/sources.json`，目前优先选择可直接访问的中文公开源。
2. `npm run refresh:feeds` 并行更新数据；单个源失败时保留该源上一次快照，所有源失败且没有旧快照时才报错。
3. `.github/workflows/refresh-public-feeds.yml` 每两小时更新并提交 `public/data/`，随后现有 Pages 工作流自动发布。
4. 工作台从自己的域名读取 `data/news.json`，按身份和用户主题在本地筛选，不会把个人资料发给资讯源。

快照只聚合索引信息，不复制文章正文。每条卡片必须保留来源和原文链接。新增源前要确认其公开访问规则、稳定性和内容授权，并运行 `npm run refresh:feeds` 与 `node --test tests/live-data.test.mjs`。

## RSS 的三层读取

- 公共目录中的源：读取同源的预生成快照，GitHub Pages、本地预览和浏览器插件都能使用。
- 部署了 OneBench Worker 的在线版：通过同源 `/api/rss` 读取用户填写的公开 HTTPS RSS；接口拒绝本机、内网地址并限制响应大小。
- 纯静态或单文件版中的自定义源：浏览器尝试直接读取；如果原站没有允许跨域访问，会提示用户改用公共源或在线版，并保留旧缓存。

服务端对内网地址的拦截是基础防护。面向大量陌生用户开放 Worker 时，仍建议在平台层增加 DNS 解析后的私网检查、域名限速、总流量限制和监控。

## 运维

- 手动更新：在 GitHub Actions 运行 `Refresh public feeds`，或本地执行 `npm run refresh:feeds`。
- 某个源失效：工作流日志会显示源 ID；在 `sources.json` 替换或停用并重新生成快照。
- 新闻过期：快照包含 `generatedAt` 和 `expiresAt`，页面仍可显示旧内容，但应检查定时工作流权限和源状态。
- 隐私边界：主题筛选在用户设备完成；公共快照不包含用户搜索词、账号或工作台内容。
