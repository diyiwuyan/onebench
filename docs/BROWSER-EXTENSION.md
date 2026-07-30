# 作为浏览器新标签页使用

OneBench 可打包成 Chrome 或 Edge 的新标签页扩展。扩展不申请网站访问权限，工作台配置与日常数据保存在浏览器扩展自己的本地存储中。

## 构建与安装

```bash
npm run build:extension
```

1. 打开 `chrome://extensions`（Edge 使用 `edge://extensions`）。
2. 开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择 `dist/extension` 文件夹。
4. 打开一个新标签页，即可看到自己的工作台。

修改工作台源码后重新运行构建，并在扩展管理页点击“重新加载”。这是一份浏览器本地副本；网页 PWA 与扩展的日常数据互不自动同步，可用 `workspace.json` 恢复相同的布局、主题和模块。
