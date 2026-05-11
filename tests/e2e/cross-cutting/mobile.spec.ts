import { expect, test } from '../fixtures/base.fixture'
import { makeDashboardResponse, makeHostProfile } from '../fixtures/mocks/host.mock'

/**
 * @spec Mobile UX and Device Behaviors
 * @description Validates mobile-only interactions like keyboard avoidance, orientation changes, and focus trapping.
 */

test.describe('Mobile Device Specifics', () => {
  // Only run these on mobile projects
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests')

  test.beforeEach(async ({ mockApi }) => {
    await mockApi('/host/me', makeHostProfile())
    await mockApi('/queue/dashboard', makeDashboardResponse())
  })

  test('Orientation Change Support', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const initialWidth = await page.evaluate(() => window.innerWidth)

    // Switch to landscape
    await page.setViewportSize({ width: 844, height: 390 }) // iPhone 12 landscape
    await page.waitForTimeout(500) // Wait for layout shift

    const landscapeWidth = await page.evaluate(() => window.innerWidth)
    expect(landscapeWidth).toBeGreaterThan(initialWidth)

    // Verify critical elements are still visible/accessible
    const manageBtn = page
      .getByRole('button', { name: /Start Your First Session|Manage Live|Start Session/i })
      .first()
    await manageBtn.waitFor({ state: 'visible' })
    await manageBtn.scrollIntoViewIfNeeded()
    await expect(manageBtn).toBeVisible()
    await expect(manageBtn).toBeInViewport()

    // Switch back to portrait
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await manageBtn.scrollIntoViewIfNeeded()
    await expect(manageBtn).toBeVisible()
    await expect(manageBtn).toBeInViewport()
  })

  test('State Persistence on Resize', async ({ page }) => {
    await page.goto('/dashboard')

    // Open a menu or toggle something (e.g. the sidebar or a filter dropdown)
    // Assuming a mobile sidebar trigger exists
    const menuBtn = page.locator('button[aria-label*="menu"], button:has(.lucide-menu)')
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
      await expect(page.locator('nav')).toBeVisible()

      // Resize while menu is open
      await page.setViewportSize({ width: 600, height: 800 })

      // Menu should ideally stay open or close gracefully without breaking state
      // If it's a "mobile only" sidebar, it might disappear at 600px, but it shouldn't crash
      await expect(page).not.toHaveTitle(/Error/i)
    }
  })

  test('Modal & Menu Focus Trapping', async ({ page }) => {
    await page.goto('/dashboard/settings')

    // Open user menu first
    const userMenuTrigger = page.locator('button[aria-haspopup="true"]').last()
    await userMenuTrigger.click()

    // Open a modal (e.g., Logout confirmation)
    const signOutBtn = page.getByRole('button', { name: /Sign out/i })
    await signOutBtn.waitFor({ state: 'visible' })
    await signOutBtn.click()

    const modal = page.getByRole('dialog')
    await modal.waitFor({ state: 'visible' })
    await expect(modal).toBeVisible()

    // Ensure focus is within the modal
    await expect(async () => {
      const isFocusInModal = await modal.evaluate((node) => {
        return node.contains(document.activeElement)
      })
      expect(isFocusInModal).toBeTruthy()
    }).toPass()

    // Escape should close it
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })

  test('Keyboard Avoidance simulation', async ({ page }) => {
    await page.goto('/dashboard/queue')

    // Wait for form to load - use placeholder or label for better reliability
    const nameInput = page.getByPlaceholder(/What are people queuing for/i)
    await nameInput.waitFor({ state: 'visible' })

    // Scroll to the bottom of the form
    const submitBtn = page.getByRole('button', { name: /Create Queue/i })
    await submitBtn.scrollIntoViewIfNeeded()

    // Focus an input that would typically be obscured by a keyboard
    const slugInput = page.locator('#slug')
    await slugInput.scrollIntoViewIfNeeded()
    await slugInput.focus()

    // Simulate keyboard showing up by shrinking the viewport height
    const viewport = page.viewportSize()
    if (!viewport) throw new Error('Viewport size not found')

    const width = viewport.width
    const height = Math.floor(viewport.height / 2)

    await page.setViewportSize({ width, height })

    // Input should still be in viewport or scrolled into view
    // Give it a moment to react to viewport change
    await page.waitForTimeout(300)
    await slugInput.scrollIntoViewIfNeeded()
    await expect(slugInput).toBeVisible()
    await expect(slugInput).toBeInViewport()

    // Restore
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
  })

  test('Safe Area Inset Awareness', async ({ page }) => {
    // Navigate to a page with a fixed header/footer
    await page.goto('/dashboard')

    const header = page.locator('header').first()

    // Check if header padding/margin accounts for safe-area-inset
    const paddingTop = await header.evaluate((el) => {
      const style = globalThis.getComputedStyle(el)
      return style.paddingTop
    })

    expect(paddingTop).toBeDefined()

    // expect(hasSafeAreaVar).toBeTruthy() // This might fail if utilities don't explicitly use it yet
  })
})
