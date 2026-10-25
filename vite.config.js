import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './'：相对路径产物，可部署到 GitHub Pages 任意子路径（spike 风险点 c 验证项）
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', assetsDir: 'assets' },
});
