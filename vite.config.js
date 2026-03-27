import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      tailwindcss(),
      svgLoader(),
      {
        name: 'fcm-service-worker',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/firebase-messaging-sw.js') {
              const swCode = await server.transformRequest('src/firebase-messaging-sw.js')
              if (swCode) {
                res.setHeader('Content-Type', 'application/javascript')
                res.end(swCode.code)
                return
              }
            }
            next()
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
    },
    build: {
      sourcemap: env.VITE_ENV != 'production' ? 'inline-source-map' : false,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          'firebase-messaging-sw': fileURLToPath(new URL('./src/firebase-messaging-sw.js', import.meta.url))
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'firebase-messaging-sw'
              ? '[name].js'
              : 'assets/[name]-[hash].js'
          }
        }
      }
    }
  }
})
