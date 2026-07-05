import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // https://vitejs.dev/config/shared-options.html#resolve-conditions
    conditions: ['node'],
  },
});
