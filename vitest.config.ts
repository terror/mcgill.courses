import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './client',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['../vitest.setup.ts'],
    css: true,
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
  },
});
