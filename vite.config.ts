import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './client',
  plugins: [react()],
  proxy: {
    '/api': 'http://localhost:8000',
  },
});
