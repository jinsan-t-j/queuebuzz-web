<script setup>
/**
 * @component AppLayout
 * @description Wraps all authenticated host routes. Mounts TheSidebar and TheTopbar.
 * Only rendered after the auth guard confirms a valid session.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import TheSidebar from '@/components/layout/TheSidebar.vue'
import TheTopbar from '@/components/layout/TheTopbar.vue'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-sand">
    <TheSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <TheTopbar />
      <main class="flex-1 overflow-y-auto p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
