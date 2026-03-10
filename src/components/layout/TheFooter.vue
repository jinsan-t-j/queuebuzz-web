<script setup>
/**
 * @component TheFooter
 * @description Public website footer with links and copyright.
 * Used once inside WebsiteLayout.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties
import { computed } from 'vue'
const currentYear = computed(() => new Date().getFullYear())

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <footer class="border-t border-plum-faint bg-white py-8">
    <div class="mx-auto max-w-7xl px-6">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <router-link to="/" class="font-display text-lg font-bold text-plum">
          QueueBuzz
        </router-link>
        <div class="flex gap-6">
          <router-link
            to="/pricing"
            class="font-body text-sm text-plum-muted transition-colors hover:text-plum"
          >
            Pricing
          </router-link>
          <router-link
            to="/login"
            class="font-body text-sm text-plum-muted transition-colors hover:text-plum"
          >
            Sign In
          </router-link>
        </div>
        <p class="font-body text-xs text-plum-muted">
          © {{ currentYear }} QueueBuzz. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
