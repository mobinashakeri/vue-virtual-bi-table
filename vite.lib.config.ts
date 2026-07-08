import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

// Library build (npm package). The demo/app build stays in vite.config.ts.
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      cleanVueFileName: true,
      insertTypesEntry: true,
      include: [
        'src/index.ts',
        'src/components/VirtualBiTable.vue',
        'src/components/TableRow.vue',
        'src/components/Resizable.vue',
        'src/composables/useTable.ts',
        'src/types/**',
      ],
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'VueVirtualBiTable',
      formats: ['es', 'umd'],
      fileName: (format) => `vue-virtual-bi-table.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core', 'vuedraggable'],
      output: {
        assetFileNames: 'style.css',
        globals: {
          vue: 'Vue',
          '@vueuse/core': 'VueUse',
          vuedraggable: 'vuedraggable',
        },
      },
    },
  },
})
