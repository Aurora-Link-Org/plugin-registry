// src/lib.rs (编译目标为 wasm32-unknown-unknown)

extern "C" {
    fn host_ssh_connect(host_ptr: *const u8, host_len: usize, port: u32, user_ptr: *const u8, user_len: usize, pass_ptr: *const u8, pass_len: usize) -> i32;
    fn host_emit_data(data_ptr: *const u8, data_len: usize);
}

#[no_mangle]
pub extern "C" fn connect(settings_ptr: *const u8, settings_len: usize) -> i32 {
    // 1. 解析前端传过来的 JSON 设置 (包含 host, port, username, password)
    // 2. 调用 host_ssh_connect 发起真实连接
    0
}

#[no_mangle]
pub extern "C" fn send(data_ptr: *const u8, data_len: usize) -> i32 {
    // 1. 发送数据到 SSH 通道
    0
}

#[no_mangle]
pub extern "C" fn on_receive(data_ptr: *const u8, data_len: usize) {
    // 1. 收到 SSH 数据后调用 host_emit_data 发给前端
}
