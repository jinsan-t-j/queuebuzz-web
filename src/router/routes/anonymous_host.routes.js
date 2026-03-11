/**
 * @module AnonymousHostRoutes
 * @description Anonymous host-facing pages: the queue experience seen by customers waiting
 * in queue. These use BlankLayout — no host app chrome.
 */

export const anoymousHostRoutes = [
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
                path: 'queue/:queueId',
                name: 'guest-host-active',
                component: () => import('@/modules/app/queue/views/GuestHostLiveQueueView.vue'),
                meta: { title: 'Active Queue — QueueBuzz' },
            },
            {
                path: 'queue/:queueId/complete',
                name: 'guest-host-complete',
                component: () => import('@/modules/app/queue/views/GuestHostQueueCompleteView.vue'),
                meta: { title: 'Queue Complete — QueueBuzz' },
            },
        ],
    },
]