import { test, expect } from '../fixtures/base.fixture'
import AxeBuilder from '@axe-core/playwright'
import { makeDashboardResponse, makeActiveQueueDashboard } from '../fixtures/mocks/host.mock'

/**
 * @spec Accessibility Audit (WCAG AA)
 * @description Validates WCAG 2.1 AA compliance for all key pages in both light and dark themes.
 * Uses @axe-core/playwright for automated a11y scanning.
 */

const PAGES = [
  { name: 'Home', path: '/', auth: false, supportsDarkMode: false },
  { name: 'Pricing', path: '/pricing', auth: false, supportsDarkMode: false },
  { name: 'Support', path: '/support', auth: false, supportsDarkMode: false },
  { name: 'Terms', path: '/terms', auth: false, supportsDarkMode: false },
  { name: 'Privacy', path: '/privacy', auth: false, supportsDarkMode: false },
  { name: 'Premium Upgrade', path: '/premium', auth: false, supportsDarkMode: false },
  { name: 'Login', path: '/login-or-signup', auth: false, supportsDarkMode: false },
  {
    name: 'Dashboard (Empty)',
    path: '/dashboard',
    auth: true,
    mockKey: 'empty',
    supportsDarkMode: true,
  },
  {
    name: 'Dashboard (Active)',
    path: '/dashboard',
    auth: true,
    mockKey: 'active',
    supportsDarkMode: true,
  },
  { name: 'Queue Management', path: '/dashboard/queue', auth: true, supportsDarkMode: true },
  { name: 'History', path: '/dashboard/queue/history', auth: true, supportsDarkMode: true },
  { name: 'Settings', path: '/dashboard/settings', auth: true, supportsDarkMode: true },
  { name: 'Error Page', path: '/error', auth: false, supportsDarkMode: false },
] as const

const MODES = ['light', 'dark'] as const

test.describe('WCAG AA Compliance Audit', () => {
  for (const mode of MODES) {
    for (const pageInfo of PAGES) {
      if (mode === 'dark' && !pageInfo.supportsDarkMode) continue

      test(`${pageInfo.name} — ${mode} mode`, async ({ page, mockApi }) => {
        // Set color scheme preference
        await page.emulateMedia({ colorScheme: mode })

        // Mock data for authenticated pages
        if (pageInfo.auth) {
          if ('mockKey' in pageInfo && pageInfo.mockKey === 'active') {
            await mockApi('/queue/dashboard', makeActiveQueueDashboard())
          } else {
            await mockApi('/queue/dashboard', makeDashboardResponse())
          }
          await mockApi('/queue/manage/q-123/live', { data: [] })
          await mockApi('/queue/history', { data: { data: [], total_pages: 0, total_count: 0 } })
          await mockApi('/host/settings', { data: {} })
        }

        // Navigate fresh
        await page.goto(pageInfo.path)

        // Toggle dark mode via class (app uses class-based dark mode)
        if (mode === 'dark') {
          await page.evaluate(() => {
            document.documentElement.classList.add('dark')
          })
          // Wait for dark mode styles to apply
          await page.waitForTimeout(300)
        } else {
          await page.evaluate(() => {
            document.documentElement.classList.remove('dark')
          })
        }

        // Wait for content
        await page.waitForLoadState('networkidle')

        const axeBuilder = new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .disableRules(['heading-order'])
          .exclude('[class*="blur-"]')
          .exclude('[class*="animate-blob"]')

        const results = await axeBuilder.analyze()

        // Filter out false positives: color-contrast violations caused by
        // decorative blur backgrounds that axe incorrectly uses as bg reference
        const realViolations = results.violations.filter((v) => {
          if (v.id !== 'color-contrast') return true
          // Filter nodes where the bg is a decorative blur element
          v.nodes = v.nodes.filter((node) => {
            const relatedBgs = node.any?.flatMap((a) => a.relatedNodes || []) || []
            const isDecorativeBg = relatedBgs.some(
              (r) => r.html?.includes('blur-') || r.html?.includes('animate-blob'),
            )
            return !isDecorativeBg
          })
          return v.nodes.length > 0
        })

        // Report violations with details
        if (realViolations.length > 0) {
          const summary = realViolations
            .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
            .join('\n')
          // eslint-disable-next-line no-console
          console.log(`A11y violations on ${pageInfo.name} (${mode}):\n${summary}`)
        }

        expect(realViolations).toEqual([])
      })
    }
  }
})
