<script setup lang="ts">
/**
 * @component App
 * @description Root application shell. Renders the active route via router-view.
 * Layout is determined by the route definition, not by this component.
 */

import { useSeoMeta, useHead } from '@unhead/vue'
import { onMounted, defineAsyncComponent, computed } from 'vue'
import { useRoute } from 'vue-router'

import { useToast } from '@/composables/useToast'
import seoConfig from '@/config/seo.constants.json'

const route = useRoute()
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
    <router-view />
    <GlobalToast />
  </div>
</template>
