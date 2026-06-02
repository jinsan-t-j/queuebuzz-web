import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOMAIN = 'https://queuebuzz.com'
const CURRENT_DATE = new Date().toISOString().split('T')[0]

// Define public marketing and legal pages to be crawled
const routes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/pricing', priority: '0.8', changefreq: 'weekly' },
  { path: '/premium', priority: '0.8', changefreq: 'weekly' },
  { path: '/launch', priority: '0.7', changefreq: 'monthly' },
  { path: '/support', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
]

function generateSitemap() {
  const urlElements = routes
    .map((route) => {
      const url = `${DOMAIN}${route.path}`
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
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
