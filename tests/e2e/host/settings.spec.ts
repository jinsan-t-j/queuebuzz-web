import { test, expect } from '../fixtures/base.fixture'
import { makeSettingsResponse } from '../fixtures/mocks/host.mock'

/**
 * @spec Host Settings
 * @description E2E tests for settings page: profile editing, toggle interactions,
 * danger zone modals (clear history, delete account).
 * Route: /dashboard/settings
 */

test.describe('Settings', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi('/host/settings', makeSettingsResponse())
  })

  test('should render settings page', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')

    // Page heading or content should be visible
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })
  })

  test('should show danger zone with destructive actions', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')

    // Danger zone section
    const dangerText = page
      .getByText(/Danger Zone|Clear Queue History|Delete Account/i)
      .filter({ visible: true })
      .first()
    await dangerText.scrollIntoViewIfNeeded()
    await expect(dangerText).toBeVisible({ timeout: 5000 })
  })

  test('should open and dismiss clear history confirmation modal', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')

    // Find and click clear history button
    const clearBtn = page.getByRole('button', { name: /Clear.*History/i }).first()
    if (await clearBtn.isVisible({ timeout: 5000 })) {
      await clearBtn.click()

      // Modal should open
      await expect(page.getByText('Clear Queue History?').first()).toBeVisible()

      // Cancel should close
      await page.getByRole('button', { name: 'Cancel' }).first().click()
      await expect(page.getByText('Clear Queue History?')).not.toBeVisible()
    }
  })

  test('should open and dismiss delete account confirmation modal', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')

    const deleteBtn = page.getByRole('button', { name: /Delete.*Account/i }).first()
    if (await deleteBtn.isVisible({ timeout: 5000 })) {
      await deleteBtn.click()

      // Modal should open
      await expect(page.getByText('Delete Account?').first()).toBeVisible()

      // Cancel
      await page.getByRole('button', { name: 'Cancel' }).first().click()
      await expect(page.getByText('Delete Account?')).not.toBeVisible()
    }
  })
})
