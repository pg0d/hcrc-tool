import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    port: 5173
  },
  clearScreen: false
});
