/**
 * @module appRoutes
 * @description Authenticated host app routes. Uses AppLayout with auth guard.
 */
import { authGuard } from '@/router/guards/auth.guard'
import type { RouteRecordRaw } from 'vue-router'

export const appRoutes: RouteRecordRaw[] = [
  {
    path: '/login-or-signup',
    component: () => import('@/layouts/BlankLayout.vue'),
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
    path: '/error',
    name: 'system-error',
    component: () => import('@/modules/app/shared/views/ErrorView.vue'),
    props: (route) => ({
      title: route.query.title,
      errorCode: route.query.error,
      message: route.query.description,
      requestId: route.query.request_id,
      actionText: route.query.action_text,
      actionPath: route.query.action_path,
    }),
    meta: { title: 'Error — QueueBuzz' },
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
