<script setup>
/**
 * @component AppLayout
 * @description Wraps all authenticated host routes. Mounts DashboardSidebar and DashboardTopbar.
 * Only rendered after the auth guard confirms a valid session.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import DashboardSidebar from '@/components/layout/app/DashboardSidebar.vue'
import DashboardTopbar from '@/components/layout/app/DashboardTopbar.vue'
import HostNotifications from '@/components/layout/HostNotifications.vue'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <HostNotifications />
    <DashboardSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <DashboardTopbar />
      <main class="flex-1 overflow-y-auto p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
