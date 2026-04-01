import { defineConfig } from 'vite';

export default defineConfig({
  base: '/voice-counter-website/',
  test: {
    environment: 'jsdom',
  },
});
