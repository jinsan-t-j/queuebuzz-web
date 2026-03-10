/**
 * @module customerRoutes
 * @description Customer-facing pages: the queue experience seen by customers waiting
 * in queue. These use BlankLayout — no host app chrome.
 */

export const customerRoutes = [
  {
    path: '/q/:hostSlug',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
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
        path: 'ticket',
        name: 'customer-ticket',
        component: () => import('@/modules/customer/views/TicketView.vue'),
        meta: { title: "You're Up!" },
      },
    ],
  },
  {
    path: '/join',
    component: () => import('@/layouts/BlankLayout.vue'),
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
