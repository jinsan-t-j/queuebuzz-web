/**
 * @module useHelpArticles
 * @description Loads help center articles from markdown files at build time.
 */
import DOMPurify from 'dompurify'
import { marked } from 'marked'

export interface HelpArticle {
  slug: string
  title: string
  description: string
  html: string
}

const rawFiles = import.meta.glob('../content/help/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseArticle(path: string, raw: string): HelpArticle {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  const frontmatter: Record<string, string> = {}
  if (frontmatterMatch) {
    for (const line of frontmatterMatch[1].split('\n')) {
      const [key, ...rest] = line.split(':')
      if (key) frontmatter[key.trim()] = rest.join(':').trim()
    }
  }
  const body = raw.slice(frontmatterMatch?.[0].length ?? 0)

  const rendered = marked.parse(body, { async: false }) as string
  // DOMPurify needs a browser DOM; during SSG prerendering (Node) there is none.
  // Content is repo-authored markdown, not user input, so raw output during SSG is safe —
  // the client re-sanitizes on hydration.
  const html = typeof window === 'undefined' ? rendered : DOMPurify.sanitize(rendered)

  return {
    slug,
    title: frontmatter.title ?? slug,
    description: frontmatter.description ?? '',
    html,
  }
}

const articles: HelpArticle[] = Object.entries(rawFiles)
  .map(([path, raw]) => parseArticle(path, raw))
  .sort((a, b) => a.title.localeCompare(b.title))

export function useHelpArticles() {
  function getArticle(slug: string): HelpArticle | undefined {
    return articles.find((article) => article.slug === slug)
  }

  return { articles, getArticle }
}
