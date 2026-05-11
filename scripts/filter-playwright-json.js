/* eslint-disable no-console */
import fs from 'node:fs'

/**
 * Filters Playwright JSON results to only include failed or error tests.
 * Usage: node scripts/filter-playwright-json.js [filePath]
 */

const filePath =
  process.argv[2] ||
  process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ||
  'playwright-report/playwright-results.json'

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`)
  process.exit(1)
}

try {
  const content = fs.readFileSync(filePath, 'utf8')
  if (!content.trim()) {
    console.log('File is empty, skipping filtering.')
    process.exit(0)
  }

  const results = JSON.parse(content)

  function filterSuite(suites) {
    if (!suites) return []
    return suites
      .map((suite) => {
        const filteredSuites = filterSuite(suite.suites)
        const filteredSpecs = (suite.specs || []).filter((spec) => {
          return (spec.tests || []).some((test) =>
            (test.results || []).some(
              (result) => result.status === 'failed' || result.status === 'error',
            ),
          )
        })

        if (filteredSuites.length > 0 || filteredSpecs.length > 0) {
          return {
            ...suite,
            suites: filteredSuites,
            specs: filteredSpecs,
          }
        }
        return null
      })
      .filter(Boolean)
  }

  if (results.suites) {
    results.suites = filterSuite(results.suites)
  }

  // Also keep top-level errors if they exist
  if (!results.errors) {
    results.errors = []
  }

  fs.writeFileSync(filePath, JSON.stringify(results, null, 2))
  console.log(`Successfully filtered failures and errors into ${filePath}`)
} catch (err) {
  console.error('Error processing Playwright JSON:', err)
  process.exit(1)
}
