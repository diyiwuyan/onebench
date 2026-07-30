# 一句工作台 / OneBench

> 不会搭网站也没关系。选一个身份，点一下，就有自己的工作台。

开源、配置驱动、本地优先的个人工作台：一句话选择场景与模块，生成可安装的 PWA；可将 `workspace.json` 推送到自己的 GitHub 仓库恢复配置。

## 第一次使用：不需要懂技术

1. 打开网页，选身份，点“先帮我搭一个”。
2. 直接在“今天的工作台”添加待办、快速记录。
3. 手机浏览器选择“添加到主屏幕”。

详细说明见 [给第一次使用的人](docs/BEGINNER.md)。想交给智能体，直接复制 [一句发给智能体](docs/AGENT-STARTER.md)。

## Phase 0 + 1 已实现

- `workspace.json` v1 协议与模块注册表
- 8 个职业／学习场景包，复用通用模块
- 本地保存、JSON 导入导出、离线 PWA shell
- GitHub Contents API 拉取／推送配置（仅配置，不上传私密任务数据）
- 模板贡献规范与 JSON Schema
- 模块数据边界协议与可分发的 `onebench-deploy` 智能体 Skill

## 开发

```bash
npm install
npm run dev
```

## GitHub 同步

创建 Fine-grained personal access token，仅授予目标仓库的 **Contents: Read and write** 权限。Token 仅保存在当前浏览器的本地存储中；公共演示环境请不要填写真实 token。

## 后续

下一阶段可接入社区精选目录、第三方连接器与正式 GitHub OAuth 应用。当前已具备模板 PR 校验、冲突提示和加密备份。
