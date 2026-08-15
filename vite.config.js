import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import esbuild from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const swId = fileURLToPath(new URL('./src/firebase-messaging-sw.js', import.meta.url))

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
              const result = await esbuild.build({
                entryPoints: [swId],
                bundle: true,
                write: false,
                format: 'iife',
                platform: 'browser',
                define: {
                  'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
                    env.VITE_FIREBASE_API_KEY || '',
                  ),
                  'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(
                    env.VITE_FIREBASE_AUTH_DOMAIN || '',
                  ),
                  'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(
                    env.VITE_FIREBASE_PROJECT_ID || '',
                  ),
                  'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
                    env.VITE_FIREBASE_STORAGE_BUCKET || '',
                  ),
                  'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
                    env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
                  ),
                  'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(
                    env.VITE_FIREBASE_APP_ID || '',
                  ),
                },
              })

              if (result.outputFiles?.[0]) {
                res.setHeader('Content-Type', 'application/javascript')
                res.setHeader(
                  'Cache-Control',
                  'no-store, no-cache, must-revalidate, proxy-revalidate',
                )
                res.end(result.outputFiles[0].text)
                return
              }
            }
            next()
          })
        },
        // Build phase: generate a self-contained IIFE for production
        async closeBundle() {
          const distSwPath = path.resolve(process.cwd(), 'dist/firebase-messaging-sw.js')
          await esbuild.build({
            entryPoints: [swId],
            bundle: true,
            outfile: distSwPath,
            format: 'iife',
            platform: 'browser',
            minify: true,
            define: {
              'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
                env.VITE_FIREBASE_API_KEY || '',
              ),
              'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(
                env.VITE_FIREBASE_AUTH_DOMAIN || '',
              ),
              'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(
                env.VITE_FIREBASE_PROJECT_ID || '',
              ),
              'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
                env.VITE_FIREBASE_STORAGE_BUCKET || '',
              ),
              'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
                env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
              ),
              'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(
                env.VITE_FIREBASE_APP_ID || '',
              ),
            },
          })
        },
      },
      // Inject <link rel="preload"> for critical fonts and CSS post-build.
      // Eliminates waterfalls that delay LCP.
      {
        name: 'critical-preload',
        enforce: 'post',
        transformIndexHtml: {
          order: 'post',
          handler(_html, ctx) {
            const bundle = ctx.bundle
            if (!bundle) return []

            const preloads = []
            const criticalFonts = ['comfortaa-latin-wght-normal']

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
      host: 'localhost',
      port: Number.parseInt(env.VITE_PORT) || 3000,
    },
    build: {
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
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
              if (
                id.includes('/node_modules/vue/') ||
                id.includes('/node_modules/@vue/') ||
                id.includes('/node_modules/vue-router/') ||
                id.includes('/node_modules/pinia/')
              )
                return 'vendor'
            }
          },
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
    ssgOptions: {
      script: 'async',
      formatting: 'minify',
      dirStyle: 'nested',
      includedRoutes(paths) {
        // Save a clean SPA shell as 200.html before pre-rendering overwrites index.html.
        // Cloudflare Pages and Netlify auto-serve 200.html as the SPA fallback.
        const distDir = path.resolve(process.cwd(), 'dist')
        const indexHtmlPath = path.join(distDir, 'index.html')
        const spaFallbackPath = path.join(distDir, 'spa.htm')

        if (fs.existsSync(indexHtmlPath)) {
          fs.copyFileSync(indexHtmlPath, spaFallbackPath)
        }

        // Pre-render the core landing pages
        return [
          '/',
          '/support',
          '/login-or-signup',
          '/pricing',
          '/premium',
          '/terms',
          '/privacy',
          '/launch',
          '/help',
          '/help/getting-started',
          '/help/sharing-your-queue',
          '/help/live-queue-dashboard',
          '/help/location-verification',
          '/help/notifications',
          '/help/queue-history',
          '/help/billing-and-plans',
          '/help/account-settings',
          '/help/joining-a-queue-as-a-customer',
          '/alternatives',
          '/alternatives/waitwhile',
          '/alternatives/qminder',
          '/alternatives/tablelist-yelp-waitlist',
        ]
      },
      async onPageRendered(route, html) {
        const fs = await import('node:fs')
        const path = await import('node:path')
        const seoConfig = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, 'src/config/seo.constants.json'), 'utf-8'),
        )

        const normalizedRoute = '/' + route.replaceAll(/^\/|\/$/g, '')
        const config = seoConfig[normalizedRoute] || seoConfig['/']
        const canonicalUrl = `https://queuebuzz.com${normalizedRoute === '/' ? '/' : normalizedRoute}`
        const robots = config.robots || 'noindex,nofollow'
        const pageType = normalizedRoute === '/support' ? 'ContactPage' : 'WebPage'
        const pageSchema = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://queuebuzz.com/#organization',
              name: 'QueueBuzz',
              url: 'https://queuebuzz.com',
              logo: 'https://queuebuzz.com/favicon.svg',
            },
            {
              '@type': 'WebSite',
              '@id': 'https://queuebuzz.com/#website',
              name: 'QueueBuzz',
              url: 'https://queuebuzz.com',
              publisher: { '@id': 'https://queuebuzz.com/#organization' },
            },
            {
              '@type': pageType,
              '@id': `${canonicalUrl}#webpage`,
              url: canonicalUrl,
              name: config.title,
              description: config.description,
              isPartOf: { '@id': 'https://queuebuzz.com/#website' },
              about: { '@id': 'https://queuebuzz.com/#organization' },
            },
          ],
        }
        const schemaJson = JSON.stringify(pageSchema).replaceAll('<', '\\u003c')

        return html
          .replace(/<title>.*?<\/title>/, `<title>${config.title}</title>`)
          .replace(
            /<meta name="description" content=".*?">/,
            `<meta name="description" content="${config.description}">`,
          )
          .replace(
            /<meta property="og:title" content=".*?">/,
            `<meta property="og:title" content="${config.title}">`,
          )
          .replace(
            /<meta property="og:description" content=".*?">/,
            `<meta property="og:description" content="${config.description}">`,
          )
          .replace(
            /<meta property="og:url" content=".*?">/,
            `<meta property="og:url" content="${canonicalUrl}">`,
          )
          .replace(
            /<meta name="twitter:url" content=".*?">/,
            `<meta name="twitter:url" content="${canonicalUrl}">`,
          )
          .replace(
            /<meta name="twitter:title" content=".*?">/,
            `<meta name="twitter:title" content="${config.title}">`,
          )
          .replace(
            /<meta name="twitter:description" content=".*?">/,
            `<meta name="twitter:description" content="${config.description}">`,
          )
          .replace(/<meta name="robots" content=".*?">/, `<meta name="robots" content="${robots}">`)
          .replace(
            /<link rel="canonical" href=".*?">/,
            `<link rel="canonical" href="${canonicalUrl}">`,
          )
          .replace(
            '</head>',
            `<script type="application/ld+json" id="queuebuzz-page-schema">${schemaJson}</script></head>`,
          )
      },
    },
  }
})
