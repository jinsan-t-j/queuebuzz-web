/**
 * @module appRoutes
 * @description Authenticated host app routes. Uses AppLayout with auth guard.
 */
import { authGuard } from '@/router/guards/auth.guard'
import { guestGuard } from '@/router/guards/guest.guard'

export const appRoutes = [
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
        path: 'queue/new',
        name: 'queue-create',
        component: () => import('@/modules/app/queue/views/CreateQueueView.vue'),
        meta: { title: 'New Queue' },
      },
      {
        path: 'queue/:queueId',
        name: 'queue-active',
        component: () => import('@/modules/app/queue/views/ActiveQueueView.vue'),
        meta: { title: 'Active Queue' },
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('@/modules/app/queue/views/HistoryQueueView.vue'),
        meta: { title: 'History' },
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
