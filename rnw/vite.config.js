import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  define: {
    __DEV__: JSON.stringify(!isProduction),
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
  },
  resolve: {
    alias: [{ find: /^react-native$/, replacement: 'react-native-web' }],
  },
  build: {
    outDir: '../dist-rnw',
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use dom')) {
          return;
        }

        warn(warning);
      },
    },
  },
});
