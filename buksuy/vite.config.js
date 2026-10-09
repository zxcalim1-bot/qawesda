import { defineConfig } from 'vite';

// SINGLE=1 — сборка для запуска двойным щелчком: все картинки внутрь js,
// потом tools/pack-single.mjs вклеивает js и css прямо в html.
const single = !!process.env.SINGLE;

export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  build: {
    outDir: single ? 'dist-single' : 'dist',
    chunkSizeWarningLimit: 1500,
    assetsInlineLimit: single ? 64 * 1024 * 1024 : 4096,
    modulePreload: false,
    cssCodeSplit: false,
  },
});
