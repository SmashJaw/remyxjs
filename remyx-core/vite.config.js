import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'RemyxCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `remyx-core.${format === 'es' ? 'js' : 'cjs'}`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['mammoth', 'pdfjs-dist'],
    },
    cssCodeSplit: false,
  },
})
