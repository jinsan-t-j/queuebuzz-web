/**
 * @module lhci-login
 * @description Puppeteer script for LHCI to bypass authentication on protected routes.
 * Sets a mock auth cookie before Lighthouse audits dashboard pages.
 *
 * NOTE: This script runs in the LHCI collect phase. The preview server serves
 * a static build, so authenticated routes will render their loading/redirect state.
 * For full authenticated audits, use Playwright E2E tests with mocked APIs instead.
 */

/**
 * @param {import('puppeteer').Browser} browser
 * @param {{ url: string }} options
 */
module.exports = async (browser, _options) => {
  const page = await browser.newPage()
  const client = await page.createCDPSession()

  // Set auth cookies via CDP so protected routes don't redirect to login
  await client.send('Network.setCookies', {
    cookies: [
      {
        name: 'qb_access',
        value: 'lhci-mock-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
      {
        name: 'qb_refresh',
        value: 'lhci-mock-refresh',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ],
  })

  // Close the setup page — LHCI will open its own
  await page.close()
}
