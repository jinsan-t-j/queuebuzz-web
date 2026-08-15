import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOMAIN = 'https://queuebuzz.com'

// Define public marketing and legal pages to be crawled
const routes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'weekly' },
  { path: '/premium', priority: '0.8', changefreq: 'weekly' },
  { path: '/launch', priority: '0.7', changefreq: 'monthly' },
  { path: '/support', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
  { path: '/help', priority: '0.7', changefreq: 'weekly' },
  { path: '/help/getting-started', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/sharing-your-queue', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/live-queue-dashboard', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/location-verification', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/notifications', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/queue-history', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/billing-and-plans', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/account-settings', priority: '0.6', changefreq: 'monthly' },
  { path: '/help/joining-a-queue-as-a-customer', priority: '0.6', changefreq: 'monthly' },
  { path: '/alternatives', priority: '0.7', changefreq: 'monthly' },
  { path: '/alternatives/waitwhile', priority: '0.6', changefreq: 'monthly' },
  { path: '/alternatives/qminder', priority: '0.6', changefreq: 'monthly' },
  { path: '/alternatives/tablelist-yelp-waitlist', priority: '0.6', changefreq: 'monthly' },
]

function generateSitemap() {
  const urlElements = routes
    .map((route) => {
      const url = `${DOMAIN}${route.path}`
      return `  <url>
    <loc>${url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>
`

  // Write to public/sitemap.xml for development / source tracking
  const publicPath = path.resolve(__dirname, '../public/sitemap.xml')
  fs.writeFileSync(publicPath, xml, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`Sitemap successfully written to ${publicPath}`)

  // Write to dist/sitemap.xml if the dist directory exists (post-build hook)
  const distDir = path.resolve(__dirname, '../dist')
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml')
    fs.writeFileSync(distPath, xml, 'utf8')
    // eslint-disable-next-line no-console
    console.log(`Sitemap successfully copied to ${distPath}`)
  }
}

generateSitemap()
