/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Wrapper for Playwright tests that runs the tests and then filters the JSON output.
 * It preserves the exit code of the test run and handles extra arguments correctly.
 */

const args = process.argv.slice(2)
const resultsPath = 'playwright-report/playwright-results.json'

// Ensure the report directory exists
const reportDir = path.dirname(resultsPath)

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true })
}

console.log(`\x1b[34m[QueueBuzz] Running E2E tests...\x1b[0m`)

const pw = spawnSync(
  'npx',
  [
    'playwright',
    'test',
    '--project=chromium',
    '--project="Mobile Chrome"',
    '--reporter=json',
    ...args,
  ],
  {
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: resultsPath },
    shell: true,
    stdio: 'inherit',
  },
)

console.log(`\n\x1b[34m[QueueBuzz] Filtering results for failures and errors...\x1b[0m`)

spawnSync('node', [path.join(__dirname, 'filter-playwright-json.js'), resultsPath], {
  shell: true,
  stdio: 'inherit',
})

if (pw.status === 0) {
  console.log(`\x1b[32m[QueueBuzz] Tests passed!\x1b[0m`)
} else {
  console.log(`\x1b[31m[QueueBuzz] Tests failed with exit code ${pw.status}\x1b[0m`)
}

process.exit(pw.status)
