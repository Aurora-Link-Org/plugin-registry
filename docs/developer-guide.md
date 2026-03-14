# Aurora Terminal Plugin Development Guide

Welcome to the Aurora ecosystem! This guide will help you develop and publish your plugins.

## 1. Package Structure
Your plugin (.zip) must contain:
- `manifest.json`: Metadata and contribution declarations.
- `backend.wasm` (Optional): Wasm logic compiled from Rust/Go.
- `script.lua` (Optional): Lua script logic.
- `icon.png`: 256x256 icon.

## 2. Submission Process
1. **Publish Release**: Create a Release in your own repo and upload the `.zip` package.
2. **Fork this Repo**: Fork `aurora-terminal/plugin-registry`.
3. **Add Manifest**: Create a folder in `plugins/` (e.g., `plugins/my-plugin/`) and add your `manifest.json`.
   - **Note**: `downloadUrl` must be the direct link to your `.zip` file.
4. **Submit PR**: Open a Pull Request. Once merged, it will be live!

## 3. Technical Specs
- **Protocol Plugins**: Must implement `connect`, `send`, `disconnect` exports.
- **Theme Plugins**: Only need to declare `colors` in `manifest.json`.
---

### 4. 补充建议：提供一个 `types` 定义

如果你的 API 涉及复杂的 JSON 交互，建议在文档里给出一个 **JSON Schema** 或 **TypeScript Interface**。

例如：
> "当调用 `connect` 时，`settings` 参数的结构如下："
```json
{
  "host": "string",
  "port": "number",
  "auth": { "type": "password | key", "value": "string" }
}