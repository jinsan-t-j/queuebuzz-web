<script setup>
/**
 * @component WaitingView
 * @description Customer-facing waiting screen. Shows the customer's position
 * in the queue, estimated wait time, and ticket number.
 */

// 1. Vue core imports
import { ref, computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import { formatTicketNumber, formatWaitTime } from '@/utils/format'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state
const position = ref(5)
const ticketNumber = ref(42)
const estimatedWait = ref(12)

// 10. Computed properties
const formattedTicket = computed(() => formatTicketNumber(ticketNumber.value))
const formattedWait = computed(() => formatWaitTime(estimatedWait.value))

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-6">
    <div class="w-full max-w-sm text-center">
      <p class="font-body text-sm font-medium text-plum-muted">Your Position</p>
      <p class="mt-2 font-display text-7xl font-black text-plum">
        {{ position }}
      </p>

      <div class="mt-8 rounded-card bg-white p-6 shadow-card">
        <div class="flex items-center justify-between">
          <div class="text-left">
            <p class="font-body text-xs text-plum-muted">Ticket</p>
            <p class="font-mono text-lg font-semibold text-plum">{{ formattedTicket }}</p>
          </div>
          <div class="text-right">
            <p class="font-body text-xs text-plum-muted">Est. Wait</p>
            <p class="font-body text-lg font-semibold text-plum">{{ formattedWait }}</p>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <p class="font-body text-sm text-plum-muted">
          Hang tight — we'll notify you when it's your turn.
        </p>
        <div class="mt-4 flex items-center justify-center gap-1">
          <span class="h-2 w-2 animate-bounce rounded-full bg-mint" style="animation-delay: 0ms" />
          <span class="h-2 w-2 animate-bounce rounded-full bg-mint" style="animation-delay: 150ms" />
          <span class="h-2 w-2 animate-bounce rounded-full bg-mint" style="animation-delay: 300ms" />
        </div>
      </div>
    </div>
  </div>
</template>
