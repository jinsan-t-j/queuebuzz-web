import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      tailwindcss(),
      svgLoader({
        defaultImport: 'component',
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
            'removeDimensions',
          ],
        },
      }),
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
        },
      },
      // Inject <link rel="preload"> for critical latin font files post-build.
      // Eliminates the CSS→font waterfall that delays LCP by ~300ms.
      {
        name: 'font-preload',
        enforce: 'post',
        transformIndexHtml: {
          order: 'post',
          handler(_html, ctx) {
            const bundle = ctx.bundle
            if (!bundle) return []

            const fontPreloads = []
            const criticalFonts = [
              'comfortaa-latin-wght-normal',
              'dm-sans-latin-400-normal',
              'dm-sans-latin-700-normal',
            ]

            for (const fileName of Object.keys(bundle)) {
              if (!fileName.endsWith('.woff2')) continue
              const base = path.basename(fileName)
              if (criticalFonts.some((f) => base.includes(f))) {
                fontPreloads.push({
                  tag: 'link',
                  attrs: {
                    rel: 'preload',
                    href: `/${fileName}`,
                    as: 'font',
                    type: 'font/woff2',
                    crossorigin: 'anonymous',
                  },
                  injectTo: 'head-prepend',
                })
              }
            }
            return fontPreloads
          },
        },
      },
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
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          'firebase-messaging-sw': fileURLToPath(
            new URL('./src/firebase-messaging-sw.js', import.meta.url),
          ),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'firebase'
              if (id.includes('html5-qrcode')) return 'qr-scanner'
              if (id.includes('lucide-vue-next')) return 'icons'
              if (id.includes('@tanstack/vue-query')) return 'query'
              if (id.includes('radix-vue') || id.includes('reka-ui') || id.includes('@vueuse'))
                return 'radix'
              if (id.includes('vee-validate') || id.includes('yup')) return 'form-validation'
              if (id.includes('html-to-image')) return 'capture'
              if (id.includes('axios')) return 'axios'
              if (id.includes('date-fns') || id.includes('dompurify')) return 'utils'
              if (id.includes('vue') || id.includes('pinia')) return 'vendor'
            }
          },
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'firebase-messaging-sw'
              ? '[name].js'
              : 'assets/[name]-[hash].js'
          },
        },
      },
    },
  }
})
