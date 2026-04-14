import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const swId = fileURLToPath(new URL('./src/firebase-messaging-sw.js', import.meta.url))

  function getFirebaseRuntimeConfig() {
    return {
      apiBaseUrl: env.VITE_API_BASE_URL || '',
      firebaseApiKey: env.VITE_FIREBASE_API_KEY || '',
      firebaseAuthDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: env.VITE_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: env.VITE_FIREBASE_APP_ID || '',
      firebaseVapidKey: env.VITE_FIREBASE_VAPID_KEY || '',
    }
  }

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
            if (req.url?.startsWith('/firebase-config.json')) {
              res.setHeader('Content-Type', 'application/json')
              res.setHeader(
                'Cache-Control',
                'no-store, no-cache, must-revalidate, proxy-revalidate',
              )
              res.end(JSON.stringify(getFirebaseRuntimeConfig()))
              return
            }

            if (req.url === '/firebase-messaging-sw.js') {
              const swCode = await server.transformRequest(swId, { ssr: false })

              if (swCode) {
                const config = getFirebaseRuntimeConfig()
                const injectedCode = swCode.code.replace(
                  /const\s+FIREBASE_CONFIG_PLACEHOLDER\s*=\s*null;?/g,
                  `const FIREBASE_CONFIG_PLACEHOLDER = ${JSON.stringify(config)}`,
                )
                res.setHeader('Content-Type', 'application/javascript')
                res.setHeader(
                  'Cache-Control',
                  'no-store, no-cache, must-revalidate, proxy-revalidate',
                )
                res.end(injectedCode)
                return
              }
            }
            next()
          })
        },
      },
      // Inject <link rel="preload"> for critical fonts and CSS post-build.
      // Eliminates waterfalls that delay LCP.
      {
        name: 'firebase-runtime-config-build',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'firebase-config.json',
            source: JSON.stringify(getFirebaseRuntimeConfig(), null, 2),
          })
        },
      },
      {
        name: 'critical-preload',
        enforce: 'post',
        transformIndexHtml: {
          order: 'post',
          handler(_html, ctx) {
            const bundle = ctx.bundle
            if (!bundle) return []

            const preloads = []
            const criticalFonts = [
              'comfortaa-latin-wght-normal',
              'dm-sans-latin-400-normal',
              'dm-sans-latin-700-normal',
            ]

            for (const fileName of Object.keys(bundle)) {
              const base = path.basename(fileName)

              // Font preloading
              if (fileName.endsWith('.woff2') && criticalFonts.some((f) => base.includes(f))) {
                preloads.push({
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

              // CSS Preloading (to reduce render-blocking perception)
              if (fileName.endsWith('.css') && base.startsWith('main-')) {
                preloads.push({
                  tag: 'link',
                  attrs: {
                    rel: 'preload',
                    href: `/${fileName}`,
                    as: 'style',
                  },
                  injectTo: 'head-prepend',
                })
              }
            }
            return preloads
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
      host: '127.0.0.1',
      port: parseInt(env.VITE_PORT) || 3000,
    },
    build: {
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          'firebase-messaging-sw': swId,
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
