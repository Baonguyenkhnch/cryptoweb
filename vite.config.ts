import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const sanitizeEnvUrl = (input: unknown): string => {
  const value = String(input ?? '').trim()
  const unquoted = value.replace(/^['"]|['"]$/g, '')
  const withoutComment = unquoted.replace(/\s+#.*$/, '').replace(/\s+\/\/.*$/, '')
  return withoutComment.trim()
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') as any
  const backendBaseRaw = env.VITE_BACKEND_URL || env.VITE_DEV_URL || 'http://localhost:8080'
  const backendBase = sanitizeEnvUrl(backendBaseRaw).replace(/\/+$/, '').replace(/\/api$/, '')
  const useProxy = String(env.VITE_USE_VITE_PROXY || '').toLowerCase() === 'true'

  return {
    plugins: [react()],

    // Optional: Avoid CORS in local dev by proxying /api -> backend
    server: useProxy
      ? {
          proxy: {
            '/api': {
              target: backendBase,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
        buffer: 'buffer',
      },
    },

    define: {
      global: {},
    },

    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  }
})
