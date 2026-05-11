<script setup lang="ts">
/**
 * @component WebsiteLayout
 * @description Wraps all public website routes. Mounts TheNavbar and TheFooter.
 * No authentication required for routes using this layout.
 */

import { defineAsyncComponent, onMounted } from 'vue'

import TheFooter from '@/components/layout/TheFooter.vue'
import TheNavbar from '@/components/layout/TheNavbar.vue'

onMounted(() => {
  document.documentElement.classList.remove('dark')
})
const SystemAlertBanner = defineAsyncComponent(
  () => import('@/components/base/SystemAlertBanner.vue'),
)

const showMaintenanceBanner = import.meta.env.VITE_SHOW_MAINTENANCE_BANNER === 'true'
</script>

<template>
  <div class="flex min-h-screen flex-col main-bg">
    <SystemAlertBanner v-if="showMaintenanceBanner" />
    <TheNavbar />
    <main class="flex-1">
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>
