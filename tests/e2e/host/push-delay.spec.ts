import { test, expect } from '../fixtures/base.fixture'
import { makeActiveQueueDashboard } from '../fixtures/mocks/host.mock'

test.describe('Queue Push Delay', () => {
  test('should allow setting, displaying, and clearing push delay', async ({ page, mockApi }) => {
    // 1. Mock active queue with buffer_mins = 0
    const queueData = {
      id: 'q-123',
      public_id: 'p-q-123',
      name: 'Morning Consultation',
      status: 'active',
      waiting: 2,
      avg_service_mins: 10,
      buffer_mins: 0,
      is_active: true,
      joinCode: 'CLNC01',
      startedAt: new Date().toISOString(),
      entries: [
        {
          id: 'e-1',
          ticket_no: 101,
          name: 'Aditya R.',
          status: 'waiting',
          position: 1,
          created_at: new Date().toISOString(),
        },
      ],
    }

    await mockApi(
      '/queue/dashboard',
      makeActiveQueueDashboard({
        active_queue: {
          id: 'q-123',
          queueName: 'Morning Consultation',
          status: 'active',
          waiting: 2,
          avgWaitTime: 10,
          bufferMins: 0,
          joinCode: 'CLNC01',
          isActive: true,
        },
      }),
    )

    await mockApi('/queue/live', { data: queueData })
    await mockApi('/queue/manage/q-123/live', {
      data: [
        {
          id: 'e-1',
          ticket_no: 101,
          name: 'Aditya R.',
          status: 'waiting',
          position: 1,
          createdAt: new Date().toISOString(),
        },
      ],
    })

    // Track patch requests
    let patchPayload: Record<string, unknown> | null = null
    await page.route('**/api/v1/queue/manage/q-123', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchPayload = route.request().postDataJSON() as Record<string, unknown>
        const newBuffer = (patchPayload?.buffer_mins as number) ?? 0
        const updatedQueue = {
          ...queueData,
          buffer_mins: newBuffer,
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': route.request().headers().origin || '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          body: JSON.stringify({ data: updatedQueue, success: true }),
        })
      } else {
        await route.continue()
      }
    })

    // Navigate to manage queue page
    await page.goto('/dashboard/queue')
    await page.waitForLoadState('networkidle')

    // Verify initial layout: wait estimate says 10m, buffer indicator not visible
    await expect(page.getByText('Avg. Wait')).toBeVisible()
    const avgWaitCard = page.locator('div', { has: page.getByText('Avg. Wait').first() }).first()
    const mainWait = avgWaitCard.locator('span.font-mono').first()
    await expect(mainWait).toContainText('10')

    // Buffer estimate should not be visible
    const warningEstimate = avgWaitCard.locator('span.text-warning')
    await expect(warningEstimate).not.toBeVisible()

    // 2. Click +5m button to add push delay
    const btn5 = page.getByRole('button', { name: '+5m' })
    await expect(btn5).toBeVisible()
    await btn5.click()

    // Verify PATCH request payload was sent with buffer_mins: 5
    expect(patchPayload).toEqual({ buffer_mins: 5 })

    // Verify button has warning style (is active)
    await expect(btn5).toHaveClass(/border-warning/)

    // Verify wait estimate updates to show buffered estimate (15m)
    await expect(avgWaitCard.locator('span.text-warning')).toContainText('15m')

    // 3. Click the active button (+5m) again to clear it
    await btn5.click()

    // Verify PATCH request payload was sent with buffer_mins: 0
    expect(patchPayload).toEqual({ buffer_mins: 0 })

    // Verify button goes back to normal, and warning estimate is removed
    await expect(btn5).not.toHaveClass(/border-warning/)
    await expect(avgWaitCard.locator('span.text-warning')).not.toBeVisible()
  })
})
