const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginsDir = path.join(__dirname, '../plugins');

// 遍历 plugins 目录下的所有插件文件夹
if (fs.existsSync(pluginsDir)) {
  const items = fs.readdirSync(pluginsDir);

  items.forEach(item => {
    const itemPath = path.join(pluginsDir, item);
    
    // 只处理包含 Cargo.toml 的 Rust 项目
    if (fs.statSync(itemPath).isDirectory() && fs.existsSync(path.join(itemPath, 'Cargo.toml'))) {
      console.log(`\n🚀 开始编译 Rust 插件: ${item}...`);
      
      try {
        // 1. 执行 cargo build
        execSync('cargo build --target wasm32-unknown-unknown --release', { 
          cwd: itemPath, 
          stdio: 'inherit' // 将输出打印到控制台
        });

        // 2. 读取 Cargo.toml 获取 package name (因为编译出的 wasm 名字和 package name 有关)
        const cargoToml = fs.readFileSync(path.join(itemPath, 'Cargo.toml'), 'utf-8');
        const nameMatch = cargoToml.match(/name\s*=\s*"([^"]+)"/);
        
        if (!nameMatch) {
          console.error(`❌ 无法在 ${item}/Cargo.toml 中找到 package name`);
          return;
        }

        // Rust 会把中划线转为下划线
        const wasmName = nameMatch[1].replace(/-/g, '_') + '.wasm';
        const sourceWasmPath = path.join(itemPath, `target/wasm32-unknown-unknown/release/${wasmName}`);
        
        // 3. 确保 dist 目录存在
        const distDir = path.join(itemPath, 'dist');
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }

        // 4. 复制并重命名文件
        const targetWasmPath = path.join(distDir, 'plugin.wasm');
        if (fs.existsSync(sourceWasmPath)) {
          fs.copyFileSync(sourceWasmPath, targetWasmPath);
          console.log(`✅ 成功将 ${wasmName} 复制到 ${item}/dist/plugin.wasm`);
        } else {
          console.error(`❌ 找不到编译产物: ${sourceWasmPath}`);
        }

      } catch (error) {
        console.error(`❌ 编译插件 ${item} 失败:`, error.message);
      }
    }
  });
}

console.log('\n🎉 所有 Rust 插件编译与提取完成！');
