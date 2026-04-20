<script setup lang="ts">
/**
 * @component LiveSyncLoader
 * @description Centralized loader and error fallback for live queue synchronization.
 */
import { RouterLink } from 'vue-router'

defineProps<{
  isLoading: boolean
  hasQueue: boolean
  error?: string | null
}>()
</script>

<template>
  <div class="relative">
    <!-- Loading State -->
    <div
      v-if="isLoading && !hasQueue && !error"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <div class="h-16 w-16 rounded-full border-4 border-plum-faint border-t-mint animate-spin" />
      <p class="font-display text-xl font-bold text-plum/60">Syncing with server...</p>
    </div>

    <!-- Error State fallback (if redirection hasn't triggered yet) -->
    <div
      v-else-if="error && !hasQueue"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4"
    >
      <div class="w-16 h-16 rounded-2xl bg-[#FEF2F2] flex items-center justify-center">
        <svg class="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="font-display text-2xl font-bold text-plum">System offline or session expired</h2>
      <p class="font-body text-plum-muted max-w-sm">
        We encountered an issue connecting to your queue. Redirecting you to the home page...
      </p>
      <RouterLink to="/" class="text-plum underline font-medium">Head back now</RouterLink>
    </div>

    <!-- Content Slot -->
    <slot v-else />
  </div>
</template>
