/**
 * @module customerRoutes
 * @description Customer-facing pages: the queue experience seen by customers waiting
 * in queue. These use CustomerLayout — centred mobile column with navbar and footer.
 */
import { restrictHostGuard } from '@/router/guards/restrictHost.guard'
import { restrictCustomerGuard } from '@/router/guards/restrictCustomer.guard'
import type { RouteRecordRaw } from 'vue-router'

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: '/q/:queueId',
    component: () => import('@/layouts/CustomerLayout.vue'),
    beforeEnter: restrictHostGuard,
    children: [
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
      // Global customer wildcard for unknown queue-specific paths
      {
        path: ':catchAll(.*)*',
        redirect: { name: 'customer-not-found' },
      },
    ],
  },
  {
    path: '/join-by-code',
    component: () => import('@/layouts/CustomerLayout.vue'),
    beforeEnter: restrictHostGuard,
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
