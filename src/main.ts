import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { ViteSSG } from 'vite-ssg'

import '@/assets/styles/main.css'

import '@fontsource-variable/comfortaa/index.css'
import '@fontsource-variable/schibsted-grotesk/index.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/600.css'

import App from '@/App.vue'
import { initializeForegroundNotifications, showBrowserNotification } from '@/lib/firebase'
import { routes } from '@/router'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior() {
      return { top: 0 }
    },
  },
  ({ app, head }) => {
    const pinia = createPinia()
    const isClient = !import.meta.env.SSR

    if (isClient) {
      pinia.use(piniaPluginPersistedstate)
    }

    app.use(pinia)
    app.config.globalProperties.$unhead = head
    app.use(VueQueryPlugin, {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      },
    })

    if (isClient) {
      void initializeForegroundNotifications((payload) => {
        if (document.visibilityState !== 'visible' || !document.hasFocus()) {
          void showBrowserNotification(payload)
        }
      })
    }
  },
)
