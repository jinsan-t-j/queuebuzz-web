import { useHead } from '@unhead/vue'

export interface PlanData {
  name: string
  description: string
  price: number
  isFree: boolean
  currency: string
}

export function useSchemaOrg() {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function injectSchema(key: string, schema: Record<string, any> | Record<string, any>[]) {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          key: `schema-org-${key}`,
          innerHTML: JSON.stringify(schema),
        },
      ],
    })
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

  function injectPricingSchema(plans: PlanData[]) {
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

    // Default plans if no API response is loaded yet
    const finalPlans = plans.length
      ? plans
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

    injectSchema('pricing', [webpage, product])
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
    injectLegalSchema,
  }
}
