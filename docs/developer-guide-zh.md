# Aurora Terminal 插件开发指南

欢迎加入 Aurora 生态！本文将指导你如何开发、测试并上架你的插件。

## 1. 插件包结构 (Package Structure)
你的插件发布到 GitHub Releases 时，必须是一个 `.zip` 压缩包，解压后的根目录结构如下：

```text
plugin-name/
├── manifest.json      # 必须：插件清单，声明 UI 贡献和元数据
├── icon.png           # 可选：插件图标 (建议 256x256)
├── README.md          # 可选：插件说明，显示在详情页
├── backend.wasm       # 可选：使用 Rust/Go/C 编译的 Wasm 后端逻辑
└── script.lua         # 可选：Lua 脚本后端逻辑
```

## 2. 提交流程 (Submission Process)

1. **发布 Release**: 在你自己的 GitHub 仓库发布一个 Release，并上传插件 `.zip` 包。
2. **Fork 本仓库**: Fork `aurora-terminal/plugin-registry`。
3. **添加清单**: 在 `plugins/` 目录下新建文件夹（如 `plugins/my-plugin/`），放入 `manifest.json`。
   - **注意**: `downloadUrl` 必须指向你 Release 中的 `.zip` 直链。
4. **提交 PR**: 发起 Pull Request。审核通过后，插件将自动出现在终端的市场列表中。

## 3. 技术规范 (Technical Specs)
- **协议类插件**: 必须实现统一的 `on_event` 导出函数 (详见 [《插件开发白皮书》](./PLUGIN_DEVELOPMENT-zh.md))。
- **主题插件**: 仅需在 `manifest.json` 中声明 `colors`。
- **API 参考**: 请查阅 [API 参考文档](./api-reference-zh.md)。

## 4. 开发建议
- 推荐使用 **Rust** 配合 `extism-pdk` 进行开发以获得最佳性能。
- 确保插件图标清晰，`manifest.json` 中的描述信息详尽。
