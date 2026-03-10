<script setup>
/**
 * @component TicketView
 * @description Customer-facing notification screen shown when the customer
 * has been called. Displays a prominent "You're up!" message.
 */

// 1. Vue core imports
import { ref, computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import { formatTicketNumber } from '@/utils/format'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state
const ticketNumber = ref(42)

// 10. Computed properties
const formattedTicket = computed(() => formatTicketNumber(ticketNumber.value))

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-mint px-6">
    <div class="w-full max-w-sm text-center">
      <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white">
        <span class="font-display text-4xl font-black text-mint-dark">✓</span>
      </div>
      <h1 class="font-display text-4xl font-black text-plum">You're all set!</h1>
      <p class="mt-2 font-body text-lg font-medium text-plum/70">
        Head to the counter now.
      </p>
      <div class="mt-8 rounded-card bg-white/80 p-6">
        <p class="font-body text-xs text-plum-muted">Your Ticket</p>
        <p class="font-mono text-4xl font-semibold tracking-widest text-plum">
          {{ formattedTicket }}
        </p>
      </div>
    </div>
  </div>
</template>
