import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/files': {
        target: 'http://129.159.248.254:5000',
        changeOrigin: true,
      },
    },
  },
});
