<script setup lang="ts">
/**
 * @component App
 * @description Root application shell. Renders the active route via router-view.
 * Layout is determined by the route definition, not by this component.
 */

import { onMounted, defineAsyncComponent } from 'vue'
import { useToast } from '@/composables/useToast'

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
