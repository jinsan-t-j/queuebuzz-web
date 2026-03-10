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
    ],
  },
]
