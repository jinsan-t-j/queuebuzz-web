/**
 * @module router
 * @description Vue Router instance with all route groups and global guards.
 * Title updates are handled via the afterEach hook.
 */
import { useHead } from '@unhead/vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'

import { anoymousHostRoutes } from '@/router/routes/anonymous_host.routes'
import { appRoutes } from '@/router/routes/app.routes'
import { customerRoutes } from '@/router/routes/customer.routes'
import { websiteRoutes } from '@/router/routes/website.routes'

export const routes = [
  ...websiteRoutes,
  ...appRoutes,
  ...customerRoutes,
  ...anoymousHostRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes,
})

/**
 * @description Updates the document title based on route meta after every navigation.
 */
router.afterEach((to) => {
  const title = to.meta?.title
  if (typeof title === 'string' && title) {
    useHead({ title })
  }
})

export default router
