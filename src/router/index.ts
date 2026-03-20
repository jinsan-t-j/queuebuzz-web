/**
 * @module router
 * @description Vue Router instance with all route groups and global guards.
 * Title updates are handled via the afterEach hook.
 */
import { createRouter, createWebHistory } from 'vue-router'
import { websiteRoutes } from '@/router/routes/website.routes'
import { appRoutes } from '@/router/routes/app.routes'
import { customerRoutes } from '@/router/routes/customer.routes'
import { anoymousHostRoutes } from '@/router/routes/anonymous_host.routes'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    ...websiteRoutes,
    ...appRoutes,
    ...customerRoutes,
    ...anoymousHostRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
})

/**
 * @description Updates the document title based on route meta after every navigation.
 */
router.afterEach((to) => {
  const title = to.meta?.title
  if (typeof title === 'string' && title) {
    document.title = title
  }
})

export default router
