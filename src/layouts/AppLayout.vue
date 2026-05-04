<script setup lang="ts">
/**
 * @component AppLayout
 * @description Wraps all authenticated host routes. Mounts DashboardSidebar and DashboardTopbar.
 * Only rendered after the auth guard confirms a valid session.
 */

import { defineAsyncComponent, watchEffect, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

import DashboardSidebar from '@/components/layout/app/DashboardSidebar.vue'
import DashboardTopbar from '@/components/layout/app/DashboardTopbar.vue'

const { theme } = useTheme()

watchEffect(() => {
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

onUnmounted(() => {
  // Always revert to light theme when leaving the app module
  document.documentElement.classList.remove('dark')
})

const SystemAlertBanner = defineAsyncComponent(
  () => import('@/components/base/SystemAlertBanner.vue'),
)

const HostNotifications = defineAsyncComponent(
  () => import('@/components/layout/HostNotifications.vue'),
)

const showMaintenanceBanner = import.meta.env.VITE_SHOW_MAINTENANCE_BANNER === 'true'
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-sand">
    <SystemAlertBanner v-if="showMaintenanceBanner" />
    <div class="flex flex-1 overflow-hidden">
      <HostNotifications />
      <DashboardSidebar />
      <div class="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar />
        <main class="flex-1 overflow-y-auto p-8 bg-sand">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>
