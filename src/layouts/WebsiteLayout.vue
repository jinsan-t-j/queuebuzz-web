<script setup lang="ts">
/**
 * @component WebsiteLayout
 * @description Wraps all public website routes. Mounts TheNavbar and TheFooter.
 * No authentication required for routes using this layout.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import TheNavbar from '@/components/layout/TheNavbar.vue'
import TheFooter from '@/components/layout/TheFooter.vue'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex min-h-screen flex-col main-bg">
    <TheNavbar />
    <main class="flex-1">
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>
