import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/devin': {
        target: 'https://api.devin.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api\/devin/, ''),
      },
    },
  },
});
