import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@api': path.resolve(rootDir, './src/api'),
      '@components': path.resolve(rootDir, './src/components'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@context': path.resolve(rootDir, './src/context'),
      '@utils': path.resolve(rootDir, './src/utils'),
      '@hooks': path.resolve(rootDir, './src/hooks'),
      '@types': path.resolve(rootDir, './src/types'),
    },
  },
  server: {
    port: 5173,
  },
});
