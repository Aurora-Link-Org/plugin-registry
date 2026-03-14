const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(__dirname, '../plugins');
const outputDir = path.join(__dirname, '../dist');

const registry = { plugins: [] };

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 遍历 plugins 目录下的所有插件文件夹
if (fs.existsSync(pluginsDir)) {
  const items = fs.readdirSync(pluginsDir);

  items.forEach(item => {
    const itemPath = path.join(pluginsDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const manifestPath = path.join(itemPath, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          // 基础校验：必须包含 id, version 和 downloadUrl
          if (manifest.id && manifest.version && manifest.downloadUrl) {
            registry.plugins.push(manifest);
            console.log(`✅ 成功加载插件: ${manifest.id} v${manifest.version}`);
          } else {
            console.warn(`⚠️ 插件 ${item} 缺少必要字段 (id, version, downloadUrl)`);
          }
        } catch (error) {
          console.error(`❌ 解析失败 ${manifestPath}:`, error.message);
        }
      }
    }
  });
}

// 写入最终的 registry.json
fs.writeFileSync(
  path.join(outputDir, 'registry.json'), 
  JSON.stringify(registry, null, 2)
);

console.log(`\n🎉 构建完成！共收录 ${registry.plugins.length} 个插件。`);
