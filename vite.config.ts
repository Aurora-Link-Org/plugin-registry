import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

// Custom plugin to generate registry.json and dummy WASM files for development
const registryPlugin = () => {
  return {
    name: 'registry-generator',
    buildStart() {
      const pluginsDir = path.resolve(__dirname, 'plugins');
      const publicDir = path.resolve(__dirname, 'public');
      const registry = { plugins: [] };

      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

      if (fs.existsSync(pluginsDir)) {
        const items = fs.readdirSync(pluginsDir);
        items.forEach(item => {
          const itemPath = path.join(pluginsDir, item);
          if (fs.statSync(itemPath).isDirectory()) {
            const manifestPath = path.join(itemPath, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
              try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                
                // Create dummy WASM if it doesn't exist
                const wasmPath = path.join(itemPath, 'plugin.wasm');
                if (!fs.existsSync(wasmPath)) {
                  fs.writeFileSync(wasmPath, 'dummy wasm content');
                }

                // Update URLs for local development
                const appUrl = process.env.APP_URL || '';
                manifest.downloadUrl = `${appUrl}/plugins/${item}/plugin.wasm`;
                manifest.iconUrl = `${appUrl}/plugins/${item}/icon.svg`;

                registry.plugins.push(manifest);
              } catch (e) {
                console.error(`Error processing plugin ${item}:`, e);
              }
            }
          }
        });
      }

      fs.writeFileSync(
        path.join(__dirname, 'public/registry.json'),
        JSON.stringify(registry, null, 2)
      );
      
      // Also write to root for dev server access if needed
      fs.writeFileSync(
        path.join(__dirname, 'registry.json'),
        JSON.stringify(registry, null, 2)
      );
    }
  };
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), registryPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
