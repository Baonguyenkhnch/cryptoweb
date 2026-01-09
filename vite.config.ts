import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],


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
