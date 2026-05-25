import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/auth': {
        target: 'http://129.159.248.254:3001',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://129.159.248.254:3002',
        changeOrigin: true,
      },
      '/printer': {
        target: 'http://129.159.248.254:3050',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://129.159.248.254:5000',
        changeOrigin: true,
      },
    },
  },
});
