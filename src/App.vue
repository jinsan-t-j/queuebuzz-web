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

const canonicalUrl = computed(() => {
  const cleanPath = route.path.replace(/\/$/, '')
  return `https://queuebuzz.com${cleanPath || '/'}`
})

const robotsDirective = computed(() => currentSeo.value.robots || 'noindex,nofollow')

useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    {
      rel: 'canonical',
      href: () => canonicalUrl.value,
    },
  ],
  meta: [
    {
      name: 'twitter:url',
      content: () => canonicalUrl.value,
    },
  ],
})

useSeoMeta({
  title: () => currentSeo.value.title,
  description: () => currentSeo.value.description,
  ogTitle: () => currentSeo.value.title,
  ogDescription: () => currentSeo.value.description,
  ogUrl: () => canonicalUrl.value,
  ogType: 'website',
  ogSiteName: 'QueueBuzz',
  ogLocale: 'en_IN',
  ogImage: 'https://queuebuzz.com/og-image.png',
  robots: () => robotsDirective.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => currentSeo.value.title,
  twitterDescription: () => currentSeo.value.description,
  twitterImage: 'https://queuebuzz.com/og-image.png',
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
