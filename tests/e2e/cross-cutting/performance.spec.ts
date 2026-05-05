import { test, chromium } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'
import * as httpNode from 'node:http'
import * as net from 'node:net'
import {
  makeActiveQueueDashboard,
  makeDashboardResponse,
  makeHostProfile,
  makeBillingPlan,
  makeHistoryList,
  makeSettingsResponse,
} from '../fixtures/mocks/host.mock'

/**
 * @spec Performance Audit (Lighthouse)
 * @description Playwright-Lighthouse audit for internal authenticated routes.
 *
 * Architecture:
 * 1. Persistent browser context to bypass auth
 * 2. page.route for API mocking (no MSW Node shim needed)
 * 3. NDJSON streaming server for high-frequency data
 * 4. CDP session for 4x CPU throttle + heap monitoring
 * 5. Measures: LCP, CLS, TBT, INP, Performance, A11y, Best Practices, SEO
 */

const pagesToAudit = [
  { name: 'Dashboard', path: '/dashboard', mock: 'active' },
  { name: 'Dashboard (Empty)', path: '/dashboard', mock: 'empty' },
  { name: 'Create Queue', path: '/dashboard/queue' },
  { name: 'History List', path: '/dashboard/queue/history' },
  { name: 'Settings', path: '/dashboard/settings' },
] as const

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

test.describe('Lighthouse Performance Audit', () => {
  let streamServer: httpNode.Server
  let streamPort: number

  test.beforeAll(async () => {
    // NDJSON streaming server (200+ events/sec)
    streamServer = httpNode.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/x-ndjson',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })

      const interval = setInterval(() => {
        const payload = JSON.stringify({
          timestamp: Date.now(),
          type: 'TICK',
          memoryLoad: process.memoryUsage().heapUsed,
        })
        res.write(payload + '\n')
      }, 5)

      req.on('close', () => clearInterval(interval))
    })

    streamServer.listen(0, () => {
      streamPort = (streamServer.address() as net.AddressInfo).port
    })
  })

  test.afterAll(() => {
    streamServer?.close()
  })

  pagesToAudit.forEach((pageRoute) => {
    ;(['light', 'dark'] as const).forEach((theme) => {
      test(`${pageRoute.name} (${theme} mode)`, async () => {
        // Get a free port for remote debugging
        const portServer = net.createServer().listen(0)
        const port = (portServer.address() as net.AddressInfo).port
        portServer.close()

        const context = await chromium.launchPersistentContext('', {
          args: [`--remote-debugging-port=${port}`],
          headless: true,
          colorScheme: theme,
        })

        const page = await context.newPage()

        // API mocking via page.route
        await page.route('**/api/v1/**', async (route) => {
          const url = route.request().url()

          if (route.request().method() === 'OPTIONS') {
            return route.fulfill({ status: 204, headers: corsHeaders() })
          }

          // Stream interception
          if (url.includes('/stream')) {
            return route.continue({
              url: `http://localhost:${streamPort}/api/v1/stream`,
            })
          }

          // SSE
          if (url.includes('/events')) {
            return route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
          }

          // Bootstrap mocks
          if (url.includes('/host/me')) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: corsHeaders(),
              body: JSON.stringify({ data: makeHostProfile(), success: true }),
            })
          }

          if (url.includes('/billing/current-plan')) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: corsHeaders(),
              body: JSON.stringify({ data: makeBillingPlan(), success: true }),
            })
          }

          if (url.includes('/queue/dashboard')) {
            const data =
              'mock' in pageRoute && pageRoute.mock === 'active'
                ? makeActiveQueueDashboard()
                : makeDashboardResponse()
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: corsHeaders(),
              body: JSON.stringify(data),
            })
          }

          if (url.includes('/queue/active') || url.includes('/queue/live')) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: corsHeaders(),
              body: JSON.stringify({ data: null, success: true }),
            })
          }

          if (url.includes('/queue/history')) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: corsHeaders(),
              body: JSON.stringify(makeHistoryList()),
            })
          }

          if (url.includes('/host/settings')) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: corsHeaders(),
              body: JSON.stringify(makeSettingsResponse()),
            })
          }

          if (url.includes('/auth/logout')) {
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: corsHeaders(),
              body: JSON.stringify({ data: { message: 'OK' }, success: true }),
            })
          }

          await route.continue()
        })

        // CDP: CPU throttle + heap monitoring
        const client = await context.newCDPSession(page)
        await client.send('Performance.enable')
        await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })

        client.on('Performance.metrics', (metrics) => {
          const heapSize = metrics.metrics.find((m) => m.name === 'JSHeapUsedSize')?.value
          if (heapSize && heapSize > 50_000_000) {
            // eslint-disable-next-line no-console
            console.warn(
              `[HEAP WARNING] ${pageRoute.name}: ${(heapSize / 1024 / 1024).toFixed(2)} MB`,
            )
          }
        })

        // GC tracing
        await client.send('Tracing.start', {
          categories: 'v8,disabled-by-default-v8.gc',
        })

        // Theme injection
        await context.addInitScript((mode: string) => {
          localStorage.setItem('vueuse-color-scheme', mode)
          if (mode === 'dark') document.documentElement.classList.add('dark')
          else document.documentElement.classList.remove('dark')
        }, theme)

        await page.goto(`http://localhost:4002${pageRoute.path}`)
        await page.waitForTimeout(3000)

        // Stop GC tracing
        const traceData: unknown[] = []
        client.on('Tracing.dataCollected', (event) => {
          traceData.push(...(event as { value: unknown[] }).value)
        })
        await client.send('Tracing.end')

        // Lighthouse audit
        await playAudit({
          page,
          port,
          thresholds: {
            performance: 40,
            accessibility: 85,
            'best-practices': 85,
            seo: 85,
          },
          reports: {
            formats: { html: true },
            name: `lighthouse-${pageRoute.name.replace(/\s+/g, '-').toLowerCase()}-${theme}`,
            directory: 'test-results/lighthouse',
          },
        })

        await context.close()
      })
    })
  })
})
