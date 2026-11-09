import { createRequire } from 'module';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const require = createRequire(import.meta.url);
const { optimizedMediaMiddleware } = require('./optimizedMedia.cjs');

function optimizedMedia() {
  return {
    name: 'optimized-media',
    configureServer(server) {
      server.middlewares.use(optimizedMediaMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(optimizedMediaMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [optimizedMedia(), react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
    // The public tree is ~1.4GB of master video. Watching it makes the
    // dev server stutter every time the OS touches a file.
    watch: {
      ignored: ['**/dist/**', '**/public/**/*.{mp4,mov,webm}'],
    },
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx', './src/ShowcaseMap.jsx'],
    },
  },
});
