import { defineConfig } from 'vite';
import * as path from "path";
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './src',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
