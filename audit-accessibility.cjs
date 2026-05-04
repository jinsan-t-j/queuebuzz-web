/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:4002';

async function runAudit() {
  console.log('Starting Accessibility Audit...');
  const browser = await chromium.launch({ headless: true });
  
  // Create context with forced dark mode
  const context = await browser.newContext({
    colorScheme: 'dark',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();

  // MOCK ALL API CALLS
  await page.route('**/api/v1/**', async route => {
    const url = route.request().url();
    console.log(`Mocking API: ${url}`);
    
    if (url.includes('/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'user-1', name: 'Test User', email: 'test@queuebuzz.app', avatar: 'T' } })
      });
    }
    
    if (url.includes('/dashboard/summary')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            greeting: { name: 'Test User' },
            stats: { servedToday: 42, avgWait: '12m', peakWait: 25, skipped: 3 },
            activeQueue: { isActive: true, queueName: 'Morning Rush', startedAt: new Date().toISOString(), waiting: 8 },
            hasHistory: true,
            recentSessions: [
               { id: 's1', name: 'Afternoon Session', date: new Date().toISOString(), served: 15 }
            ],
            weekChart: [
               { label: 'Mon', value: 10 }, { label: 'Tue', value: 20 }, { label: 'Wed', value: 15 }
            ]
          }
        })
      });
    }

    // Default fallback for other APIs
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {}, message: 'Mocked Response' })
    });
  });

  console.log(`Navigating to ${BASE_URL}/dashboard...`);
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Force Dark Mode again just in case
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vueuse-color-scheme', 'dark');
    });
    
    await page.waitForTimeout(5000); // Wait for everything to render

    const auditResults = await page.evaluate(() => {
      const results = [];

      function getLuminance(r, g, b) {
        const [R, G, B] = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      }

      function getContrast(rgb1, rgb2) {
        const parse = (s) => {
           const match = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
           return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [0,0,0];
        };
        const lum1 = getLuminance(...parse(rgb1));
        const lum2 = getLuminance(...parse(rgb2));
        return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
      }

      // 1. Body Background (Should be #0a0a0a -> rgb(10, 10, 10))
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      results.push({ name: 'Body Background', value: bodyBg, pass: bodyBg === 'rgb(10, 10, 10)' });

      // 2. Sidebar Contrast
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const sidebarBg = getComputedStyle(sidebar).backgroundColor;
        const textEl = sidebar.querySelector('span') || sidebar;
        const sidebarText = getComputedStyle(textEl).color;
        const contrast = getContrast(sidebarBg, sidebarText);
        results.push({ name: 'Sidebar Text Contrast', bg: sidebarBg, text: sidebarText, contrast: contrast.toFixed(2), pass: contrast >= 4.5 });
      } else {
        results.push({ name: 'Sidebar', value: 'Not found', pass: false });
      }

      // 3. Card Borders (Should be #262626 -> rgb(38, 38, 38))
      const cards = document.querySelectorAll('.bg-white, .border-plum-faint');
      if (cards.length > 0) {
        const card = cards[0];
        const borderColor = getComputedStyle(card).borderTopColor;
        results.push({ name: 'Card Border Color', value: borderColor, pass: borderColor === 'rgb(38, 38, 38)' });
      } else {
        results.push({ name: 'Cards', value: 'Not found', pass: false });
      }

      // 4. Mint Element Contrast (Check all elements with bg-mint)
      const mintElements = document.querySelectorAll('.bg-mint');
      mintElements.forEach((el, index) => {
        const bg = getComputedStyle(el).backgroundColor;
        const text = getComputedStyle(el).color;
        const contrast = getContrast(bg, text);
        const name = `Mint Element ${index + 1} (${el.tagName}: ${el.innerText.substring(0, 20).replace(/\n/g, ' ')})`;
        results.push({ 
          name, 
          bg, 
          text, 
          contrast: contrast.toFixed(2), 
          pass: contrast >= 4.5,
          html: el.outerHTML.substring(0, 100) 
        });
      });

      return results;
    });

    console.log('AUDIT_RESULTS_JSON:' + JSON.stringify(auditResults));

    const screenshotPath = path.join(process.cwd(), 'audit-results.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

  } catch (err) {
    console.error('Audit failed:', err);
    // Take error screenshot
    await page.screenshot({ path: path.join(process.cwd(), 'audit-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

runAudit();
