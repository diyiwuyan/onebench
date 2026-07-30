# 让工作台真正属于用户

OneBench 的交付物不是一个临时链接，而是用户自己 GitHub 账号下的完整仓库：源码、`workspace.json`、自动部署工作流和公开网址都在里面。

## 智能体交付验收

交付前必须同时满足：

1. 创建 `用户账号/onebench-名称`，默认分支为 `main`，仓库含完整 OneBench 源码；不能只上传 `dist`、`assets` 或 `gh-pages` 文件。
2. 在仓库根目录运行 `node scripts/create-owned-workspace.mjs --owner 用户名 --repo 仓库名 --pack 模板 --prompt 需求`，提交生成的 `workspace.json` 与 `.onebench/ownership.json`。
3. 推送后等待 **Deploy user-owned workbench** 成功，并打开 `https://用户名.github.io/仓库名/` 验收。未成功不得称“已上线”。
4. 添加 `upstream` 远程指向 `https://github.com/diyiwuyan/onebench.git`，使后续可以获得公共修复和模块目录更新。

## 用户以后怎么改

用户只需对智能体说“帮我把待办改成只显示本周作业”或“帮我加一个背单词模块”。智能体在用户仓库里修改、测试、推送；GitHub Pages 会自动发布。日常待办和笔记仍默认只保存在各自设备，不会被提交到 Git。

## 不允许的伪交付

- 只交付平台域名、临时预览域名或只有静态产物的仓库。
- 没有等部署工作流成功就宣称完成。
- 将 GitHub Token、任务、笔记或第三方账号资料提交到仓库。
- 声称“永久在线”。应说明服务由 GitHub Pages 提供，用户可在自己的仓库中继续维护或迁移。
