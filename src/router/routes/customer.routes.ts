/**
 * @module customerRoutes
 * @description Customer-facing pages: the queue experience seen by customers waiting
 * in queue. These use CustomerLayout — centred mobile column with navbar and footer.
 */
import type { RouteRecordRaw } from 'vue-router'

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: '/q/:hostSlug',
    component: () => import('@/layouts/CustomerLayout.vue'),
    children: [
      {
        path: 'join/:code?',
        name: 'customer-join',
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
    ],
  },
  {
    path: '/join-by-code',
    component: () => import('@/layouts/CustomerLayout.vue'),
    children: [
      {
        path: '',
        name: 'customer-join-by-code',
        component: () => import('@/modules/customer/views/JoinByCodeView.vue'),
        meta: { title: 'Enter Join Code' },
      },
    ],
  },
]
