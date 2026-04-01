import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  plugins: [],
  test: {
    environment: 'jsdom',
  },
});
