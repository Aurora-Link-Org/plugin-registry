use extism_pdk::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct HostEvent {
    event_type: String, // "init", "tcp_rx", "ui_tx", "tcp_closed"
    payload: String,
}

#[derive(Serialize)]
struct PluginCommand {
    action: String,     // "tcp_connect", "tcp_write", "ui_print", "tcp_disconnect"
    payload: String,
}

#[plugin_fn]
pub fn on_event(input: String) -> FnResult<String> {
    let event: HostEvent = serde_json::from_str(&input)?;
    let mut commands = Vec::new();

    match event.event_type.as_str() {
        "init" => {
            // payload contains settings from UI: {"host": "127.0.0.1", "port": 8080}
            // We tell the Host to open a raw TCP connection
            commands.push(PluginCommand {
                action: "tcp_connect".to_string(),
                payload: event.payload,
            });
            commands.push(PluginCommand {
                action: "ui_print".to_string(),
                payload: "TCP Client Initialized. Connecting...\n".to_string(),
            });
        },
        "tcp_rx" => {
            // Raw data received from the Host's TCP socket.
            // For a simple TCP client, we just pass it directly to the UI.
            // In a more complex protocol, we would parse frames here.
            commands.push(PluginCommand {
                action: "ui_print".to_string(),
                payload: event.payload,
            });
        },
        "ui_tx" => {
            // User typed something in the terminal, send it to the TCP socket
            commands.push(PluginCommand {
                action: "tcp_write".to_string(),
                payload: event.payload,
            });
        },
        "tcp_closed" => {
            commands.push(PluginCommand {
                action: "ui_print".to_string(),
                payload: "\n[TCP Connection Closed by Remote Host]\n".to_string(),
            });
        },
        _ => {
            // Ignore unknown events
        }
    }

    // Return the commands back to the Host as a JSON array
    Ok(serde_json::to_string(&commands)?)
}
