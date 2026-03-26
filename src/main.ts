import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from '@/router'
import App from '@/App.vue'
import '@/assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(VueQueryPlugin, {
    queryClientConfig: {
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                refetchOnWindowFocus: false,
            },
        },
    },
})
app.use(router)

app.mount('#app')
