<script setup>
/**
 * @component IdleView
 * @description Customer-facing idle/grace period screen. Shows "Did you miss your turn?"
 * countdown with the ticket hero card above it.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 4. Local composables
import { useCustomerApi } from '@/modules/customer/composables/useCustomerApi'

// 5. Component imports
import TicketHero from '@/modules/customer/components/TicketHero.vue'
import GracePeriodCard from '@/modules/customer/components/GracePeriodCard.vue'

// 7. Emits
const emit = defineEmits(['confirmed-still-here', 'grace-period-expired', 'leave-queue'])

// 9. Reactive state
const ticketNumber = ref('Q-0042')
const queueName = ref('Chai Point · Koramangala')
</script>

<template>
  <div class="flex flex-col">
    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <div class="flex flex-col gap-5 px-5 py-4">
      <!-- Ticket hero (no leave button here — leave is on the grace card) -->
      <TicketHero
        :ticket-number="ticketNumber"
        :queue-name="queueName"
        :show-leave-button="false"
      />

      <!-- Grace period countdown -->
      <GracePeriodCard
        :initial-seconds="60"
        :ticket-number="ticketNumber"
        @confirmed-still-here="emit('confirmed-still-here')"
        @grace-period-expired="emit('grace-period-expired')"
        @leave-queue="emit('leave-queue')"
      />
    </div>
  </div>
</template>
