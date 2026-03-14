# Aurora Terminal 插件 API 参考

Aurora 插件基于 Extism Wasm 引擎运行。插件通过 **导出函数** 响应宿主，通过 **宿主函数** 调用系统能力。

## 1. 插件导出函数 (需由开发者实现)

这些函数由插件定义，由 Aurora Terminal 在特定生命周期阶段调用。

### `connect(settings_json: string) -> string`
- **触发时机**: 用户在 UI 点击 "Connect" 按钮。
- **参数**: `settings_json` (String) - 包含 Host, Port, Auth 等信息的 JSON 字符串。
- **返回值**: `connection_id` (String) - 插件生成的唯一连接标识符。

### `send(connection_id: string, data: Vec<u8>)`
- **触发时机**: 用户在终端输入并发送数据。
- **行为**: 插件应将字节流通过其建立的 Socket 发送出去。

### `process(data: Vec<u8>) -> Vec<u8>`
- **触发时机**: 核心拦截器。当有数据流过终端时调用。
- **行为**: 用于协议解析、解密或数据提取。返回处理后的数据以供显示或发送。

### `disconnect(connection_id: string)`
- **触发时机**: 用户点击断开连接或关闭标签页。
- **行为**: 插件应清理并关闭对应的 Socket 连接。

---

## 2. 宿主函数 (由 Aurora 提供)

这些函数由 Aurora Terminal 注入到 Wasm 沙箱中，插件可以直接调用。

### `emit_data(connection_id: string, data: Vec<u8>)`
- **说明**: **极其重要**。由于网络接收通常是异步的，插件在收到数据后必须调用此函数将数据推回给终端 UI。

### `host_exec(command: string) -> string`
- **说明**: 允许插件在宿主系统执行受限的 Shell 命令（如 `git status`）。

### `host_log(level: string, message: string)`
- **说明**: 将插件日志输出到 Aurora Terminal 的开发者控制台。`level` 可选: `info`, `warn`, `error`。

---

## 3. 数据结构示例

### 协议设置 (Settings JSON)
```json
{
  "host": "127.0.0.1",
  "port": 8080,
  "username": "admin",
  "password": "password123"
}
```
