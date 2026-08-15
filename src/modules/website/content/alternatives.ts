/**
 * @module alternatives
 * @description Content for QueueBuzz-vs-competitor comparison pages.
 * Keep claims about competitors general/category-level — pricing and feature
 * specifics on other products change without notice and aren't ours to promise.
 */
export interface AlternativeFaq {
  question: string
  answer: string
}

export interface Alternative {
  slug: string
  name: string
  category: string
  summary: string
  considerations: string[]
  queuebuzzDifference: string[]
  faqs: AlternativeFaq[]
}

export const ALTERNATIVES: Alternative[] = [
  {
    slug: 'waitwhile',
    name: 'Waitwhile',
    category: 'virtual waitlist and appointment platform',
    summary:
      'Waitwhile is a virtual waitlist and scheduling platform used by retail, healthcare, and government service providers to manage walk-ins and appointments together.',
    considerations: [
      'Whether you need combined appointment scheduling and walk-in queuing, or just a simple walk-in queue.',
      'How notifications reach customers — some platforms rely on SMS, which carries a per-message cost that scales with your customer volume.',
      'Setup time — how quickly you can get a queue live without a sales call or onboarding project.',
    ],
    queuebuzzDifference: [
      'QueueBuzz is built specifically for walk-in queuing, not scheduling — so setup is a few minutes, not a project.',
      'Customer alerts go through the browser (push notifications), not SMS, so there is no per-message cost as your line grows.',
      'No app download for customers on either side — hosts and customers both use the browser.',
    ],
    faqs: [
      {
        question: 'Is QueueBuzz a good alternative to Waitwhile?',
        answer:
          'If you only need walk-in queue management — not appointment scheduling — QueueBuzz gives you a simpler, faster setup with no per-message notification costs.',
      },
      {
        question: 'Does QueueBuzz support appointment booking like Waitwhile?',
        answer:
          'No — QueueBuzz is focused on live, walk-in virtual queues. If you need combined scheduling and waitlisting, a platform built around both may suit you better.',
      },
    ],
  },
  {
    slug: 'qminder',
    name: 'Qminder',
    category: 'queue management system',
    summary:
      'Qminder is a queue management system aimed at retail and service businesses, typically used with dedicated check-in kiosks or ticket displays.',
    considerations: [
      'Whether you want hardware (kiosks, ticket printers, wall displays) or a fully browser-based setup.',
      'How customers see their position — a shared in-store display versus each customer following it live on their own phone.',
      'Whether your business needs multi-location, multi-staff coordination or a single queue per location.',
    ],
    queuebuzzDifference: [
      'No kiosk or extra hardware required — customers join by scanning a QR code or opening a link on their own phone.',
      'Each customer tracks their own live position and gets notified individually, rather than reading a shared display.',
      'Free tier available, with Premium unlocking higher guest and queue limits as you grow.',
    ],
    faqs: [
      {
        question: 'Is QueueBuzz a good alternative to Qminder?',
        answer:
          'If you want a queue customers manage from their own phone instead of a shared kiosk display, QueueBuzz gets you there without extra hardware.',
      },
      {
        question: 'Do I need a kiosk or printer to use QueueBuzz?',
        answer:
          'No. Customers join with a QR code, join code, or link on their own device — no dedicated hardware to buy or maintain.',
      },
    ],
  },
  {
    slug: 'tablelist-yelp-waitlist',
    name: 'Tablelist & Yelp Waitlist',
    category: 'restaurant waitlist tool',
    summary:
      'Tablelist and Yelp Waitlist (formerly Yelp Nowait) are restaurant-focused waitlist tools, often bundled with reservation or point-of-sale systems.',
    considerations: [
      'Whether you want a waitlist tied to a specific reservation/POS ecosystem, or one that works independently of what you already use.',
      'Whether your business is restaurant-only, or spans other walk-in scenarios (clinics, salons, retail, events) where a restaurant-specific tool is a poor fit.',
      'How customers are notified — in-app for diners already using that platform, versus anyone with a browser.',
    ],
    queuebuzzDifference: [
      'Not restaurant-specific — the same queue works for a clinic, salon, retail counter, or event check-in.',
      'Customers do not need to be on any specific platform or app to join or get notified — just a browser.',
      'No POS or reservation system lock-in; QueueBuzz runs standalone.',
    ],
    faqs: [
      {
        question: 'Is QueueBuzz a good alternative to Tablelist or Yelp Waitlist?',
        answer:
          'If you want a waitlist that is not tied to a specific reservation platform, or you run a non-restaurant business, QueueBuzz works the same way without that lock-in.',
      },
      {
        question: 'Can QueueBuzz be used outside of restaurants?',
        answer:
          'Yes — QueueBuzz is a general-purpose virtual queue used for restaurants, clinics, salons, retail, and events alike.',
      },
    ],
  },
]

export function getAlternative(slug: string): Alternative | undefined {
  return ALTERNATIVES.find((alt) => alt.slug === slug)
}
