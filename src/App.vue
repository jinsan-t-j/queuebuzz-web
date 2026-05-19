<script setup lang="ts">
/**
 * @component App
 * @description Root application shell. Renders the active route via router-view.
 * Layout is determined by the route definition, not by this component.
 *
 * The `isRouterReady` guard prevents the homepage layout from flashing
 * while the router resolves async guards (e.g. authGuard on /dashboard).
 */

import { useSeoMeta, useHead } from '@unhead/vue'
import { onMounted, defineAsyncComponent, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from '@/composables/useToast'
import seoConfig from '@/config/seo.constants.json'

const route = useRoute()
const router = useRouter()

const isRouterReady = ref(import.meta.env.SSR)

onMounted(async () => {
  await router.isReady()
  isRouterReady.value = true
})

const currentSeo = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/'
  return seoConfig[path as keyof typeof seoConfig] || seoConfig['/']
})

useHead({
  htmlAttrs: { lang: 'en' },
})

useSeoMeta({
  title: () => currentSeo.value.title,
  description: () => currentSeo.value.description,
  ogTitle: () => currentSeo.value.title,
  ogDescription: () => currentSeo.value.description,
})

const GlobalToast = defineAsyncComponent(() => import('@/components/common/GlobalToast.vue'))

onMounted(() => {
  const persistentMessage = sessionStorage.getItem('qb_toast')
  if (persistentMessage) {
    const { showToast } = useToast()
    showToast(persistentMessage, { type: 'error' })
    sessionStorage.removeItem('qb_toast')
  }
})
</script>

<template>
  <div id="queuebuzz-app">
    <router-view v-if="isRouterReady" />
    <GlobalToast />
  </div>
</template>
