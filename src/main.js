import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import router from '@/router/index.js'
import App from '@/App.vue'
import '@/assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
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
