/**
 * @module websiteRoutes
 * @description Public marketing website routes. Uses WebsiteLayout.
 */
import type { RouteRecordRaw } from 'vue-router'

export const websiteRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/WebsiteLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/modules/website/views/HomeView.vue'),
        meta: { title: 'QueueBuzz — Zero Lines. Better Business.' },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/modules/website/views/AboutView.vue'),
        meta: { title: 'About — QueueBuzz' },
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
        meta: { title: 'Support | QueueBuzz — Zero Lines, Better Business' },
      },
      {
        path: 'help',
        name: 'help-center',
        component: () => import('@/modules/website/views/HelpCenterView.vue'),
        meta: { title: 'Help Center — QueueBuzz' },
      },
      {
        path: 'help/:slug',
        name: 'help-article',
        component: () => import('@/modules/website/views/HelpArticleView.vue'),
        meta: { title: 'Help — QueueBuzz' },
      },
      {
        path: 'alternatives',
        name: 'alternatives',
        component: () => import('@/modules/website/views/AlternativesView.vue'),
        meta: { title: 'QueueBuzz vs. the Alternatives — Virtual Queue Comparisons' },
      },
      {
        path: 'alternatives/:slug',
        name: 'alternative',
        component: () => import('@/modules/website/views/AlternativeDetailView.vue'),
        meta: { title: 'QueueBuzz Comparison' },
      },
    ],
  },
  {
    path: '/launch',
    name: 'launch',
    component: () => import('@/modules/website/views/LaunchView.vue'),
    meta: { title: 'Launch — QueueBuzz' },
  },
  {
    path: '/flyer',
    name: 'flyer',
    component: () => import('@/modules/website/views/FlyerView.vue'),
    meta: { title: 'Official Launch Flyer — QueueBuzz' },
  },
]
