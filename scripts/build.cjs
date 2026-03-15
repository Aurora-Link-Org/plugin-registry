const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(__dirname, '../plugins');
const outputDir = path.join(__dirname, '../dist');

const registry = { plugins: [] };

// 1. 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 2. 复制整个 plugins 目录到 dist/plugins (解决下载 404 问题)
const distPluginsDir = path.join(outputDir, 'plugins');
if (fs.existsSync(pluginsDir)) {
  // 如果 dist/plugins 已存在，先删除，确保是最新的
  if (fs.existsSync(distPluginsDir)) {
    fs.rmSync(distPluginsDir, { recursive: true });
  }
  fs.cpSync(pluginsDir, distPluginsDir, { recursive: true });
  console.log(`✅ 成功将 plugins 目录复制到 dist/plugins`);
}

// 3. 遍历 plugins 目录下的所有插件文件夹
if (fs.existsSync(pluginsDir)) {
  const items = fs.readdirSync(pluginsDir);

  items.forEach(item => {
    const itemPath = path.join(pluginsDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const manifestPath = path.join(itemPath, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

          // 4. 修正图标路径 (解决图标不显示问题)
          // 将 "icon.svg" 转换为 "plugins/ssh-manager/icon.svg"
          // 这是相对于 registry.json 的正确相对路径
          if (manifest.icon && !manifest.icon.startsWith('http')) {
            manifest.icon = `plugins/${item}/${manifest.icon}`;
          }

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

// 5. 写入最终的 registry.json
fs.writeFileSync(
  path.join(outputDir, 'registry.json'), 
  JSON.stringify(registry, null, 2)
);

// 6. 写入一个简单的 index.html 防止 404
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aurora Link Plugin Registry</title>
    <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #1e1e1e; color: #ccc; }
        a { color: #007fd4; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Aurora Link Plugin Registry</h1>
    <p>This is the plugin registry for Aurora Link.</p>
    <p>View the registry JSON here: <a href="registry.json">registry.json</a></p>
</body>
</html>
`;
fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);

console.log(`\n🎉 构建完成！共收录 ${registry.plugins.length} 个插件。`);