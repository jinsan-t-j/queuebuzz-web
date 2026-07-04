<script setup lang="ts">
/**
 * @component ConnectionLostBanner
 * @description Shows a warning banner when live SSE updates are lost due to network failure.
 * Auto-hides when the connection is restored (isConnectionLost becomes false).
 */

import { storeToRefs } from 'pinia'

import { useCustomerStore } from '@/modules/customer/stores/customer.store'

const customerStore = useCustomerStore()
const { isConnectionLost } = storeToRefs(customerStore)
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 -translate-y-2"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="isConnectionLost"
      class="flex items-center gap-3 rounded-2xl border border-warning/30 bg-[#FFF7ED] px-4 py-3"
      role="alert"
    >
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-warning/10">
        <svg class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M8.464 15.536a5 5 0 010-7.072M15.536 8.464a5 5 0 010 7.072"
          />
        </svg>
      </div>
      <div>
        <p class="font-body text-sm font-semibold text-plum">Live updates paused</p>
        <p class="font-body text-xs text-plum-muted">
          Checking connection… your place is still saved.
        </p>
      </div>
    </div>
  </Transition>
</template>
