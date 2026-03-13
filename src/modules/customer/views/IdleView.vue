<script setup>
/**
 * @component IdleView
 * @description Customer-facing idle/grace period screen. Shows "Did you miss your turn?"
 * countdown with the ticket hero card above it.
 */

// 1. Vue core imports
import { ref } from 'vue'

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
  <div class="relative flex flex-col">
    <!-- Blob decorations — Idle screen specific (teal top-right, orange bottom-left) -->
    <div
      class="pointer-events-none absolute -right-16 -top-24   h-[300px] w-[300px] rounded-[150px] bg-[rgba(45,212,191,0.40)] blur-[40px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-12   h-[250px] w-[250px] rounded-[100px_200px_213px_163px] bg-warning/40 blur-[40px]"
    />

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
