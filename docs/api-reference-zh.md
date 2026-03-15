# Aurora Terminal 插件 API 参考 (API 驱动架构)

Aurora Terminal 插件采用 **“微内核 + 消息传递”** 架构。宿主 (Host) 与插件 (Plugin) 之间不再通过多个分散的导出函数交互，而是通过统一的 JSON-RPC 事件系统进行通信。

## 1. 统一导出函数

每个 WASM 插件必须导出一个名为 `on_event` 的函数作为主入口。

### `on_event(input: String) -> String`
- **说明**: 接收来自宿主的事件，并返回一系列指令供宿主执行。
- **输入**: 代表 `HostEvent` 的 JSON 字符串。
- **输出**: 代表 `PluginCommand` 数组的 JSON 字符串。

---

## 2. 宿主事件 (发送给插件)

宿主通过 `on_event` 函数将以下事件发送给插件。

### `HostEvent` 结构
```json
{
  "event_type": "string",
  "payload": "string"
}
```

| `event_type` | 说明 | `payload` 内容 |
| :--- | :--- | :--- |
| `init` | 当新会话开始时触发。 | 协议设置的 JSON 字符串 (host, port 等) |
| `tcp_rx` | 从宿主 TCP Socket 收到的原始数据。 | Base64 编码的字节流或原始字符串。 |
| `ui_tx` | 用户在终端 UI 中输入的数据。 | 用户输入的字符串或字节。 |
| `tcp_closed` | 底层 TCP 连接已关闭。 | 为空或包含错误信息。 |

---

## 3. 插件指令 (返回给宿主)

插件返回一个指令数组，告诉宿主下一步该做什么。

### `PluginCommand` 结构
```json
{
  "action": "string",
  "payload": "string"
}
```

| `action` | 说明 | `payload` 内容 |
| :--- | :--- | :--- |
| `tcp_connect` | 请求宿主打开一个 TCP 连接。 | JSON: `{"host": "...", "port": ...}` |
| `tcp_write` | 向已建立的 TCP Socket 发送数据。 | 待发送的数据 (字符串或编码后的字节)。 |
| `ui_print` | 在终端屏幕上渲染文本。 | 普通文本或 ANSI 转义序列。 |
| `tcp_disconnect`| 请求宿主关闭 TCP 连接。 | 为空。 |

---

## 4. 宿主函数 (直接系统访问)

虽然推荐使用事件系统，但一些底层的宿主函数 (Host Functions) 仍可直接调用。

### `host_log(level: string, message: string)`
- **说明**: 将插件日志输出到 Aurora Terminal 的开发者控制台。
- **级别**: `info`, `warn`, `error`。

### `host_exec(command: string) -> string`
- **说明**: 在宿主系统执行受限的 Shell 命令。

---

## 5. 数据处理 (Lua API)

对于基于 Lua 的插件，API 简化为一个全局函数。

### `on_data_received(data: string) -> string`
- **说明**: 拦截并修改数据流。
- **返回值**: 处理后的字符串，将传递给下一阶段。
