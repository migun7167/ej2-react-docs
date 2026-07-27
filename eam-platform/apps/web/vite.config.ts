import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // dev: proxy ไป api บน host (รัน npm run start:dev ใน apps/api)
    proxy: { '/api': 'http://localhost:3000' },
  },
});
