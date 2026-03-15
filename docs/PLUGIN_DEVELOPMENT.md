# Aurora Terminal Plugin Development Whitepaper (API-Driven Architecture)

Aurora Terminal provides a high-performance, low-memory footprint plugin system. Based on **Extism (WASM)** and **mlua (Lua)**, you can easily extend the terminal with new protocols (such as SSH, MQTT, Telnet) or data processing logic.

## Core Architectural Philosophy: Host Provides I/O, Plugin Implements Protocol

**You should not hardcode specific business protocols (such as SSH, Modbus) in the main program (Rust).**

WASM plugins run in a secure sandbox and cannot directly call the operating system's underlying network APIs (such as `std::net::TcpStream`). Therefore, Aurora Terminal adopts a **"Microkernel + Message Passing (JSON-RPC)"** architecture:

1. **Host (Aurora Rust Main Program)**: Responsible only for providing **underlying Raw I/O capabilities** (such as Raw TCP Socket, Raw Serial Port, UDP) and **UI rendering interfaces**.
2. **Plugin (WASM Plugin)**: Acts as a pure **state machine**. It does not initiate network requests directly. Instead, it tells the Host "please connect to a certain IP" via JSON messages. When it receives TCP data from the Host, it parses the protocol (such as SSH handshake) and tells the Host "please print this text on the screen".

This architecture completely decouples the host and the protocol, allowing you to write plugins in any language without modifying a single line of Rust host code!

## Plugin Directory Structure

A standard Aurora plugin is a folder containing a `manifest.json`, typically structured as follows:

```text
my-plugin/
├── manifest.json       # Plugin manifest file (Required)
├── backend.wasm        # WASM backend logic (Optional)
├── script.lua          # Lua data processing script (Optional)
├── ui.js               # Frontend UI rendering logic (Optional)
└── translations/       # Multi-language translation files (Optional)
    ├── en-US.json
    └── zh-CN.json
```

## Manifest Specification (`manifest.json`)

`manifest.json` is the entry point for the plugin, defining basic information, UI configuration, and backend entry points.

```json
{
  "id": "ssh-client",
  "name": "SSH Client",
  "version": "1.0.0",
  "author": "Aurora Team",
  "description": "A full SSH client implemented in WASM.",
  "backend": "backend.wasm",
  "contributes": {
    "protocols": [
      {
        "id": "ssh",
        "label": "SSH Client",
        "settings": [
          { "id": "host", "label": "Host", "type": "string", "default": "127.0.0.1" },
          { "id": "port", "label": "Port", "type": "number", "default": 22 },
          { "id": "username", "label": "Username", "type": "string", "default": "root" }
        ]
      }
    ]
  }
}
```

## Backend Development (WASM / Rust)

If you need to handle complex data parsing or implement custom protocols, it is recommended to use Rust compiled to WASM.

### 1. Data Interception and Filtering (Data Filter)
If you only need to modify existing data streams (e.g., converting all lowercase to uppercase), simply export a `process` function:

```rust
use extism_pdk::*;

#[plugin_fn]
pub fn process(input: Vec<u8>) -> FnResult<Vec<u8>> {
    let mut output = input.clone();
    // Data processing logic...
    Ok(output)
}
```

### 2. Full Protocol Implementation (JSON-RPC Mode)
If you want to implement a completely new protocol (such as SSH), you need to export an `on_event` function to receive events from the Host and return commands:

```rust
use extism_pdk::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct HostEvent {
    event_type: String, // "init", "tcp_rx", "tcp_closed"
    payload: String,
}

#[derive(Serialize)]
struct PluginCommand {
    action: String,     // "tcp_connect", "tcp_write", "ui_print"
    payload: String,
}

#[plugin_fn]
pub fn on_event(input: String) -> FnResult<String> {
    let event: HostEvent = serde_json::from_str(&input)?;
    let mut commands = Vec::new();

    if event.event_type == "init" {
        // Plugin initialization, request Host to open an underlying TCP connection
        commands.push(PluginCommand {
            action: "tcp_connect".to_string(),
            payload: "{\"host\": \"192.168.1.1\", \"port\": 22}".to_string(),
        });
    } else if event.event_type == "tcp_rx" {
        // Received underlying TCP data from Host, perform SSH protocol parsing
        let parsed_text = parse_ssh_data(&event.payload);
        
        // Request Host to print the parsed text on the UI
        commands.push(PluginCommand {
            action: "ui_print".to_string(),
            payload: parsed_text,
        });
    }

    Ok(serde_json::to_string(&commands)?)
}
```

## Data Processing (Lua)

For simple data filtering, highlighting, or conversion, you can use Lua scripts directly.

1. Specify `"backend": "script.lua"` in `manifest.json`.
2. Write `script.lua` and implement the `on_data_received` global function:

```lua
function on_data_received(data)
    -- Simple replacement logic
    local processed = string.gsub(data, "error", "ERROR")
    return processed
end
```

## Summary: Why Keep `tcp.rs`?

You might ask: Since all protocols are implemented by plugins, why is `tcp.rs` still in the main program?

The answer is: **`tcp.rs` is not a "business protocol"; it is the "underlying infrastructure (Raw I/O Provider)" provided by the Host to the plugins.**
WASM plugins cannot call the network card themselves. They must tell the Host via JSON-RPC: "Please call your `tcp.rs` to help me connect to this IP, and then send me the received byte stream."

Through this design, you can implement countless protocols such as SSH, MQTT, Redis, etc., using WASM, and **never need to modify the main program's Rust code again**!
