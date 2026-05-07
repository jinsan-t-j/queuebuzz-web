/* eslint-disable no-console */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()

page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.text()))
page.on('pageerror', (error) => console.log('BROWSER ERROR:', error.message))

await page.goto('http://localhost:4002/dashboard')
await page.waitForTimeout(5000)
await browser.close()
