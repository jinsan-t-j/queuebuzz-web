/**
 * @module appRoutes
 * @description Authenticated host app routes. Uses AppLayout with auth guard.
 */
import { authGuard } from '@/router/guards/auth.guard'
import { guestGuard } from '@/router/guards/guest.guard'
import type { RouteRecordRaw } from 'vue-router'

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/layouts/BlankLayout.vue'),
    beforeEnter: guestGuard,
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/modules/app/auth/views/LoginView.vue'),
        meta: { title: 'Sign In — QueueBuzz' },
      },
    ],
  },
  {
    path: '/magic-link',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        name: 'magic-link',
        component: () => import('@/modules/app/auth/views/MagicLinkView.vue'),
        meta: { title: 'Check Your Email — QueueBuzz' },
      },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/AppLayout.vue'),
    beforeEnter: authGuard,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/modules/app/dashboard/views/DashboardView.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'queue',
        name: 'queue',
        component: () => import('@/modules/app/queue/views/CreateQueueView.vue'),
        meta: { title: 'Queue' },
      },
      {
        path: 'queue/history',
        name: 'queue-history',
        component: () => import('@/modules/app/history/views/HistoryListView.vue'),
        meta: { title: 'History' },
      },
      {
        path: 'queue/history/:id',
        name: 'queue-history-detail',
        component: () => import('@/modules/app/history/views/HistoryDetailView.vue'),
        meta: { title: 'Queue History' },
        props: (route) => ({ historyId: String(route.params.id ?? '') }),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/modules/app/settings/views/SettingsView.vue'),
        meta: { title: 'Settings' },
      },
    ],
  },
]
