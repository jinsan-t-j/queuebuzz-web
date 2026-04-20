<script setup>
/**
 * @component App
 * @description Root application shell. Renders the active route via router-view.
 * Layout is determined by the route definition, not by this component.
 */

import { onMounted, defineAsyncComponent } from 'vue'

const GlobalToast = defineAsyncComponent(() => import('@/components/common/GlobalToast.vue'))

onMounted(async () => {
  const persistentMessage = sessionStorage.getItem('qb_toast')
  if (persistentMessage) {
    const { useToast } = await import('@/composables/useToast')
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
