import { defineConfig } from 'vite';

import solid from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

const config = defineConfig({
  root: './',
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'solid-flip',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web'],
      output: {
        globals: {
          'solid-js': 'solid',
          'solid-js/web': 'solid',
        },
      },
    },
    minify: 'terser',
  },
  plugins: [
    solid(),
    dts({ rollupTypes: true }),
  ],
});

export default config;
