# Aurora Terminal Plugin Development Guide

Welcome to the Aurora ecosystem! This guide will help you develop, test, and publish your plugins.

## 1. Package Structure
Your plugin must be a `.zip` archive when published to GitHub Releases, with the following root structure:

```text
plugin-name/
├── manifest.json      # Required: Plugin manifest, declares UI contributions and metadata
├── icon.png           # Optional: Plugin icon (recommended 256x256)
├── README.md          # Optional: Plugin description, shown in details page
├── backend.wasm       # Optional: Wasm backend logic compiled from Rust/Go/C
└── script.lua         # Optional: Lua script backend logic
```

## 2. Submission Process

1. **Publish Release**: Create a Release in your own GitHub repository and upload the plugin `.zip` package.
2. **Fork this Repo**: Fork `aurora-terminal/plugin-registry`.
3. **Add Manifest**: Create a folder in `plugins/` (e.g., `plugins/my-plugin/`) and add your `manifest.json`.
   - **Note**: `downloadUrl` must be the direct link to your `.zip` file in the Release.
4. **Submit PR**: Open a Pull Request. Once merged, your plugin will automatically appear in the terminal's marketplace.

## 3. Technical Specs
- **Protocol Plugins**: Must implement the unified `on_event` export function (see the [Plugin Development Whitepaper](./PLUGIN_DEVELOPMENT.md)).
- **Theme Plugins**: Only need to declare `colors` in `manifest.json`.
- **API Reference**: Please refer to the [API Reference](./api-reference.md).

## 4. Recommendations
- We recommend using **Rust** with `extism-pdk` for the best performance.
- Ensure your plugin icon is clear and the description in `manifest.json` is detailed.
