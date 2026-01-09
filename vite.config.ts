import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Replace the common lodash global detection `Function("return this")()` which
// is blocked by strict CSP (disallows eval/Function). Switching to globalThis
// keeps behaviour while remaining CSP-safe.
const cspSafeGlobalThis = (): Plugin => ({
  name: 'csp-safe-global-this',
  enforce: 'pre',
  transform(code) {
    return code.includes('Function("return this")()')
      ? code.replace(/Function\("return this"\)\(\)/g, 'globalThis')
      : null
  },
})

export default defineConfig({
  plugins: [react(), cspSafeGlobalThis()],


  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      // Prevent node modules from being bundled
      'events': path.resolve(__dirname, './polyfills.ts'),
      'util': path.resolve(__dirname, './polyfills.ts'),
      'buffer': path.resolve(__dirname, './polyfills.ts'),
      'stream': path.resolve(__dirname, './polyfills.ts'),
    },
  },

  optimizeDeps: {
    exclude: ['events', 'util', 'buffer', 'stream'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },

  worker: {
    format: 'es',
    rollupOptions: {
      external: ['events', 'util', 'buffer', 'stream'],
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['events'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'recharts'],
        },
      },
    },
  },
})