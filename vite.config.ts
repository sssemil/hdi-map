import { defineConfig } from 'vite';

export default defineConfig({
  base: '/hdi-map/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
  },
});
