/**
 * @module AnonymousHostRoutes
 * @description Anonymous host-facing pages: the queue experience seen by customers waiting
 * in queue. These use WebsiteLayout — no host app chrome.
 */
import type { RouteRecordRaw } from 'vue-router'

export const anoymousHostRoutes: RouteRecordRaw[] = [
  {
    path: '/guest-host',
    component: () => import('@/layouts/WebsiteLayout.vue'),
    children: [
      {
        path: 'queue/create',
        name: 'guest-host-create',
        component: () => import('@/modules/app/queue/views/GuestHostCreateQueueView.vue'),
        meta: { title: 'Create Queue — QueueBuzz' },
      },
      {
        path: 'queue/:id/live',
        name: 'guest-host-live-queue',
        component: () => import('@/modules/app/queue/views/GuestHostLiveQueueView.vue'),
        meta: { title: 'Active Queue — QueueBuzz' },
      },
      {
        path: 'queue/:id/complete',
        name: 'guest-host-complete',
        component: () => import('@/modules/app/queue/views/GuestHostQueueCompleteView.vue'),
        props: (route) => ({
          servedCount: Number(route.query.served) || 0,
          totalTime: route.query.total?.toString() || '0m',
          avgTime: route.query.avg?.toString() || '0m',
          email: route.query.email?.toString() || '',
          notes: route.query.notes?.toString() || '',
        }),
        meta: { title: 'Queue Complete — QueueBuzz' },
      },
      {
        path: 'queue/ended',
        name: 'guest-host-queue-ended',
        component: () => import('@/modules/app/queue/views/GuestHostQueueEndedView.vue'),
        props: (route) => ({ reason: route.query.reason }),
        meta: { title: 'Session Expired — QueueBuzz' },
      },
    ],
  },
]
