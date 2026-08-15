import { injectHead, useHead } from '@unhead/vue'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export interface PlanData {
  name: string
  description: string
  price: number
  isFree: boolean
  currency: string
}

export function useSchemaOrg() {
  const head = injectHead()
  const orgId = 'https://queuebuzz.com/#organization'
  const websiteId = 'https://queuebuzz.com/#website'

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId,
    name: 'QueueBuzz',
    url: 'https://queuebuzz.com',
    logo: 'https://queuebuzz.com/favicon.svg',
    sameAs: [
      'https://reddit.com/r/queuebuzz/',
      'https://instagram.com/queuebuzz',
      'https://x.com/queuebuzz',
    ],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: 'QueueBuzz',
    url: 'https://queuebuzz.com',
    description:
      'Stop managing crowds and start managing your business. Ditch the physical line and let your customers wait on their own terms.',
    publisher: { '@id': orgId },
  }

  function injectSchema(
    key: string,
    schema: MaybeRefOrGetter<Record<string, unknown> | Record<string, unknown>[]>,
  ) {
    useHead(
      {
        script: [
          {
            type: 'application/ld+json',
            key: `schema-org-${key}`,
            innerHTML: computed(() => JSON.stringify(toValue(schema))),
          },
        ],
      },
      head ? { head } : undefined,
    )
  }

  function injectHomeSchema(faqList: { question: string; answer: string }[]) {
    const pageId = 'https://queuebuzz.com/#webpage'
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': pageId,
      url: 'https://queuebuzz.com',
      name: 'QueueBuzz — Zero Lines. Better Business.',
      description:
        'Stop managing crowds and start managing your business. Ditch the physical line and let your customers wait on their own terms.',
      isPartOf: { '@id': websiteId },
      about: { '@id': orgId },
    }

    const softwareApplication = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': 'https://queuebuzz.com/#softwareapplication',
      name: 'QueueBuzz',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      url: 'https://queuebuzz.com',
      author: { '@id': orgId },
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
      },
    }

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqList.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }

    injectSchema('home', [organization, website, webpage, softwareApplication, faqSchema])
  }

  function injectPricingSchema(plans?: MaybeRefOrGetter<PlanData[]>) {
    const pageId = 'https://queuebuzz.com/pricing/#webpage'
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': pageId,
      url: 'https://queuebuzz.com/pricing',
      name: 'Pricing Plans — QueueBuzz',
      description:
        'Transparent pricing for businesses of all sizes. Choose between our Free Forever, Pro, Business Elite, or Enterprise packages.',
      isPartOf: { '@id': websiteId },
    }

    const pricingSchema = computed(() => {
      const rawPlans = plans ? toValue(plans) : []
      // Default plans if no API response is loaded yet
      const finalPlans =
        rawPlans && rawPlans.length
          ? rawPlans
          : [
              {
                name: 'Free Forever',
                description: 'Perfect for small shops and individuals starting out.',
                price: 0,
                isFree: true,
                currency: 'USD',
              },
              {
                name: 'Pro',
                description: 'Advanced tools for growing teams and multiple queues.',
                price: 14.99,
                isFree: false,
                currency: 'USD',
              },
              {
                name: 'Business Elite',
                description: 'Full-scale solution for high-traffic businesses and brands.',
                price: 39.99,
                isFree: false,
                currency: 'USD',
              },
              {
                name: 'Enterprise',
                description: 'Custom limits and dedicated support for large organizations.',
                price: 0,
                isFree: false,
                currency: 'USD',
              },
            ]

      const product = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': 'https://queuebuzz.com/pricing/#product',
        name: 'QueueBuzz Subscription Plans',
        description: 'Virtual queue management and digital waitlist subscription tiers.',
        brand: { '@id': orgId },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: finalPlans[0]?.currency || 'USD',
          lowPrice: String(Math.min(...finalPlans.map((p) => p.price))),
          highPrice: String(Math.max(...finalPlans.map((p) => p.price))),
          offerCount: finalPlans.length,
          offers: finalPlans.map((p) => ({
            '@type': 'Offer',
            name: p.name,
            description: p.description,
            price: String(p.price),
            priceCurrency: p.currency,
            availability: 'https://schema.org/InStock',
          })),
        },
      }

      return [webpage, product]
    })

    injectSchema('pricing', pricingSchema)
  }

  function injectPremiumSchema() {
    const pageId = 'https://queuebuzz.com/premium/#webpage'
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': pageId,
      url: 'https://queuebuzz.com/premium',
      name: 'Go Premium — QueueBuzz Business Elite',
      description: 'Unlock advanced virtual queue management features for your business.',
      isPartOf: { '@id': websiteId },
    }

    const service = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'QueueBuzz Business Elite',
      description:
        'SMS notifications, dynamic priority routing, custom branding, and real-time business reports.',
      provider: { '@id': orgId },
    }

    injectSchema('premium', [webpage, service])
  }

  function injectSupportSchema() {
    const pageId = 'https://queuebuzz.com/support/#webpage'
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': pageId,
      url: 'https://queuebuzz.com/support',
      name: 'Contact & Support — QueueBuzz',
      description: 'Get help with QueueBuzz. Contact our support team for any questions or issues.',
      isPartOf: { '@id': websiteId },
      mainEntity: {
        '@type': 'Organization',
        '@id': orgId,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'support@queuebuzz.com',
            contactType: 'customer support',
            availableLanguage: 'English',
          },
          {
            '@type': 'ContactPoint',
            email: 'security@queuebuzz.com',
            contactType: 'security inquiries',
            availableLanguage: 'English',
          },
        ],
      },
    }

    injectSchema('support', [webpage])
  }

  function injectHelpCenterSchema(
    articles: { slug: string; title: string; description: string }[],
  ) {
    const pageId = 'https://queuebuzz.com/help/#webpage'
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': pageId,
      url: 'https://queuebuzz.com/help',
      name: 'Help Center — QueueBuzz',
      description: 'Guides and answers for getting the most out of QueueBuzz.',
      isPartOf: { '@id': websiteId },
    }

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://queuebuzz.com/help/${article.slug}`,
        name: article.title,
      })),
    }

    injectSchema('help-center', [webpage, itemList])
  }

  function injectHelpArticleSchema(article: { slug: string; title: string; description: string }) {
    const pageId = `https://queuebuzz.com/help/${article.slug}/#webpage`
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': pageId,
      url: `https://queuebuzz.com/help/${article.slug}`,
      headline: article.title,
      description: article.description,
      author: { '@id': orgId },
      publisher: { '@id': orgId },
      isPartOf: { '@id': websiteId },
    }

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Help Center',
          item: 'https://queuebuzz.com/help',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: article.title,
          item: `https://queuebuzz.com/help/${article.slug}`,
        },
      ],
    }

    injectSchema(`help-article-${article.slug}`, [webpage, breadcrumb])
  }

  function injectAlternativeSchema(alt: {
    slug: string
    name: string
    summary: string
    faqs: { question: string; answer: string }[]
  }) {
    const pageId = `https://queuebuzz.com/alternatives/${alt.slug}/#webpage`
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': pageId,
      url: `https://queuebuzz.com/alternatives/${alt.slug}`,
      name: `QueueBuzz vs ${alt.name} — Virtual Queue Comparison`,
      description: alt.summary,
      isPartOf: { '@id': websiteId },
    }

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: alt.faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Alternatives',
          item: 'https://queuebuzz.com/alternatives',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: alt.name,
          item: `https://queuebuzz.com/alternatives/${alt.slug}`,
        },
      ],
    }

    injectSchema(`alternative-${alt.slug}`, [webpage, faqSchema, breadcrumb])
  }

  function injectAboutSchema() {
    const pageId = 'https://queuebuzz.com/about/#webpage'
    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': pageId,
      url: 'https://queuebuzz.com/about',
      name: 'About — QueueBuzz',
      description:
        'QueueBuzz replaces the physical line with a virtual one, so customers can wander freely and businesses can manage the flow with precision.',
      isPartOf: { '@id': websiteId },
      about: { '@id': orgId },
    }

    injectSchema('about', [organization, webpage])
  }

  function injectLegalSchema(type: 'terms' | 'privacy') {
    const isTerms = type === 'terms'
    const path = isTerms ? 'terms' : 'privacy'
    const title = isTerms ? 'Terms & Conditions — QueueBuzz' : 'Privacy Policy — QueueBuzz'
    const description = isTerms
      ? 'Read the Terms of Service for QueueBuzz virtual queue management platform.'
      : 'Learn how QueueBuzz protects your privacy and minimalizes data tracking.'

    const webpage = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `https://queuebuzz.com/${path}/#webpage`,
      url: `https://queuebuzz.com/${path}`,
      name: title,
      description,
      isPartOf: { '@id': websiteId },
    }

    injectSchema(type, [webpage])
  }

  return {
    orgId,
    websiteId,
    organization,
    website,
    injectSchema,
    injectHomeSchema,
    injectPricingSchema,
    injectPremiumSchema,
    injectSupportSchema,
    injectAboutSchema,
    injectLegalSchema,
    injectHelpCenterSchema,
    injectHelpArticleSchema,
    injectAlternativeSchema,
  }
}
