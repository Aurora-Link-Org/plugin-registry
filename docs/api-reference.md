# Aurora Terminal Plugin API Reference (API-Driven Architecture)

Aurora Terminal plugins follow a **"Microkernel + Message Passing"** architecture. Instead of calling multiple exported functions, the Host and Plugin communicate via a unified JSON-RPC event system.

## 1. Unified Exported Function

Every WASM plugin must export a single `on_event` function as the main entry point.

### `on_event(input: String) -> String`
- **Description**: Receives an event from the Host and returns a list of commands for the Host to execute.
- **Input**: A JSON string representing a `HostEvent`.
- **Output**: A JSON string representing an array of `PluginCommand` objects.

---

## 2. Host Events (Input to Plugin)

The Host sends these events to the plugin via the `on_event` function.

### `HostEvent` Structure
```json
{
  "event_type": "string",
  "payload": "string"
}
```

| `event_type` | Description | `payload` Content |
| :--- | :--- | :--- |
| `init` | Triggered when a new session starts. | JSON string of protocol settings (host, port, etc.) |
| `tcp_rx` | Raw data received from the Host's TCP socket. | Base64 encoded byte stream or raw string. |
| `ui_tx` | User typed data in the terminal UI. | The string or bytes typed by the user. |
| `tcp_closed` | The underlying TCP connection was closed. | Empty or error message. |

---

## 3. Plugin Commands (Output to Host)

The plugin returns an array of these commands to tell the Host what to do next.

### `PluginCommand` Structure
```json
{
  "action": "string",
  "payload": "string"
}
```

| `action` | Description | `payload` Content |
| :--- | :--- | :--- |
| `tcp_connect` | Request the Host to open a TCP connection. | JSON: `{"host": "...", "port": ...}` |
| `tcp_write` | Send data to the established TCP socket. | Data to be sent (string or encoded bytes). |
| `ui_print` | Render text on the terminal screen. | Plain text or ANSI escape sequences. |
| `tcp_disconnect`| Request the Host to close the TCP connection. | Empty. |

---

## 4. Host Functions (Direct System Access)

While the event system is preferred, some low-level Host Functions are still available for direct invocation.

### `host_log(level: string, message: string)`
- **Description**: Outputs plugin logs to the Aurora Terminal developer console.
- **Levels**: `info`, `warn`, `error`.

### `host_exec(command: string) -> string`
- **Description**: Executes restricted shell commands on the host system.

---

## 5. Data Processing (Lua API)

For Lua-based plugins, the API is simplified to a single global function.

### `on_data_received(data: string) -> string`
- **Description**: Intercepts and modifies the data stream.
- **Returns**: The processed string to be passed to the next stage.
