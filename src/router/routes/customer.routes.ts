/**
 * @module customerRoutes
 * @description Customer-facing pages: the queue experience seen by customers waiting
 * in queue. These use CustomerLayout — centred mobile column with navbar and footer.
 */
import { restrictActiveHostGuard } from '@/router/guards/restrictActiveHost.guard'
import { restrictCustomerGuard } from '@/router/guards/restrictCustomer.guard'

import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: '/q/:queueId',
    component: () => import('@/layouts/CustomerLayout.vue'),
    children: [
      {
        path: '',
        redirect: (to) => ({
          name: 'customer-join',
          params: { queueId: to.params.queueId },
        }),
      },
      {
        path: 'join/:code?',
        name: 'customer-join',
        beforeEnter: restrictCustomerGuard,
        component: () => import('@/modules/customer/views/JoinView.vue'),
        meta: { title: 'Join Queue' },
      },
      {
        path: 'waiting',
        name: 'customer-waiting',
        component: () => import('@/modules/customer/views/WaitingView.vue'),
        meta: { title: 'Your Position' },
      },
      {
        path: 'recover',
        name: 'customer-recover-by-token',
        component: () => import('@/modules/customer/views/RecoverView.vue'),
        meta: { title: 'Recover Session' },
      },
      {
        path: 'idle',
        name: 'customer-idle',
        component: () => import('@/modules/customer/views/IdleView.vue'),
        meta: { title: 'Are you still here?' },
      },
      {
        path: 'called',
        name: 'customer-called',
        component: () => import('@/modules/customer/views/CalledView.vue'),
        meta: { title: "You're Up!" },
      },
      {
        path: 'served',
        name: 'customer-served',
        component: () => import('@/modules/customer/views/ServedView.vue'),
        meta: { title: "You're All Done!" },
      },
      {
        path: 'not-found',
        name: 'customer-not-found',
        component: () => import('@/modules/customer/views/NotFoundView.vue'),
        meta: { title: 'Queue Not Found' },
      },
      {
        path: 'ended',
        name: 'customer-ended',
        component: () => import('@/modules/customer/views/EntryEndedView.vue'),
        meta: { title: 'Session Ended' },
        props: (route: RouteLocationNormalized) => ({ reason: route.query.reason }),
      },
      // Global customer wildcard for unknown queue-specific paths
      {
        path: ':catchAll(.*)*',
        redirect: { name: 'customer-not-found' },
      },
    ],
  },
  {
    path: '/join',
    component: () => import('@/layouts/CustomerLayout.vue'),
    beforeEnter: restrictActiveHostGuard,
    children: [
      {
        path: '',
        name: 'customer-join-by-code',
        beforeEnter: restrictCustomerGuard,
        component: () => import('@/modules/customer/views/JoinByCodeView.vue'),
        meta: { title: 'Enter Join Code' },
      },
    ],
  },
]
