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

// In a real SSH implementation, you would use a crate like `russh` or `thrussh`
// and maintain the SSH state machine here. For demonstration, we simulate the state.
#[plugin_fn]
pub fn on_event(input: String) -> FnResult<String> {
    let event: HostEvent = serde_json::from_str(&input)?;
    let mut commands = Vec::new();

    match event.event_type.as_str() {
        "init" => {
            // payload contains settings from UI: {"host": "...", "port": ..., "username": "...", "password": "..."}
            // 1. Initialize the internal SSH state machine here.
            
            // 2. Ask the Host to open a raw TCP connection to the target server.
            commands.push(PluginCommand {
                action: "tcp_connect".to_string(),
                payload: event.payload,
            });
            commands.push(PluginCommand {
                action: "ui_print".to_string(),
                payload: "SSH Plugin Initialized. Establishing TCP connection...\n".to_string(),
            });
        },
        "tcp_rx" => {
            // Raw bytes received from the Host's TCP socket.
            // 1. Feed the raw bytes into the SSH state machine.
            // let decrypted_text = ssh_machine.consume(event.payload);
            
            // 2. Send the decrypted text to the UI for rendering.
            let decrypted_text = format!("[SSH Decrypted] {}", event.payload);
            commands.push(PluginCommand {
                action: "ui_print".to_string(),
                payload: decrypted_text,
            });
        },
        "ui_tx" => {
            // User typed something in the terminal.
            // 1. Feed the plaintext into the SSH state machine to encrypt it.
            // let encrypted_bytes = ssh_machine.encrypt(event.payload);
            
            // 2. Send the encrypted bytes to the Host's TCP socket.
            let encrypted_bytes = format!("[SSH Encrypted] {}", event.payload);
            commands.push(PluginCommand {
                action: "tcp_write".to_string(),
                payload: encrypted_bytes,
            });
        },
        "tcp_closed" => {
            commands.push(PluginCommand {
                action: "ui_print".to_string(),
                payload: "\n[SSH Connection Closed]\n".to_string(),
            });
        },
        _ => {
            // Ignore unknown events
        }
    }

    // Return the commands back to the Host as a JSON array
    Ok(serde_json::to_string(&commands)?)
}
