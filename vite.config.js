import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = { '/api': `http://localhost:${process.env.API_PORT || 4000}` };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, proxy: api },
  preview: { port: 4173, strictPort: true, proxy: api },
});
