/**
 * @module websiteRoutes
 * @description Public marketing website routes. Uses WebsiteLayout.
 */
export const websiteRoutes = [
  {
    path: '/',
    component: () => import('@/layouts/WebsiteLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/modules/website/views/HomeView.vue'),
        meta: { title: 'QueueBuzz — Virtual Queue Management' },
      },
      {
        path: 'pricing',
        name: 'pricing',
        component: () => import('@/modules/website/views/PricingView.vue'),
        meta: { title: 'Pricing — QueueBuzz' },
      },
      {
        path: 'premium',
        name: 'go-premium',
        component: () => import('@/modules/website/premium/views/GoPremiumView.vue'),
        meta: { title: 'Go Premium — QueueBuzz' },
      },
      {
        path: 'terms',
        name: 'terms',
        component: () => import('@/modules/website/views/TermsView.vue'),
        meta: { title: 'Terms & Conditions — QueueBuzz' },
      },
      {
        path: 'privacy',
        name: 'privacy',
        component: () => import('@/modules/website/views/PrivacyView.vue'),
        meta: { title: 'Privacy Policy — QueueBuzz' },
      },
      {
        path: 'support',
        name: 'support',
        component: () => import('@/modules/website/views/SupportView.vue'),
        meta: { title: 'Support — QueueBuzz' },
      },
    ],
  },
]
