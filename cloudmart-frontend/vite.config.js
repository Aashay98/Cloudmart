import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { transform } from 'esbuild'

function jsxInJs() {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (id.endsWith('.js') && id.includes('/src/')) {
        const result = await transform(code, {
          loader: 'jsx',
          jsx: 'automatic',
          sourcefile: id,
        })
        return { code: result.code, map: result.map || null }
      }
      return null
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [jsxInJs(), react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})