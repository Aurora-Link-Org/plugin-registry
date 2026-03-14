// src/lib.rs (编译目标为 wasm32-unknown-unknown)

// 1. 导入宿主 (主程序) 提供的底层 API
extern "C" {
    // 调用主程序的底层 TCP 连接
    fn host_tcp_connect(host_ptr: *const u8, host_len: usize, port: u32) -> i32;
    // 将收到的数据发给前端 UI 显示
    fn host_emit_data(data_ptr: *const u8, data_len: usize);
}

// 2. 暴露给宿主调用的接口
#[no_mangle]
pub extern "C" fn connect(settings_ptr: *const u8, settings_len: usize) -> i32 {
    // 1. 解析前端传过来的 JSON 设置 (包含 host 和 port)
    // 2. 调用 host_tcp_connect 发起真实连接
    // 3. 返回连接状态
    0
}

#[no_mangle]
pub extern "C" fn send(data_ptr: *const u8, data_len: usize) -> i32 {
    // 1. 在这里可以对发送的数据进行高性能的二次处理（例如加 CRC 校验、加密等）
    // 2. 将处理后的字节流通过宿主发送出去
    0
}

#[no_mangle]
pub extern "C" fn on_receive(data_ptr: *const u8, data_len: usize) {
    // 1. 宿主收到 TCP 数据后会调用这里
    // 2. 在这里进行高性能的粘包处理、协议解析
    // 3. 解析完成后，调用 host_emit_data 发给前端显示
}
