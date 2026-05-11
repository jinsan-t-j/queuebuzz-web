<script setup lang="ts">
/**
 * @component ActiveSessionWarning
 * @description Informs a customer they are already in a queue and provides options
 * to view their active ticket or leave the session to join a new one.
 */

import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'

defineProps<{
  activeQueueId: string | null | undefined
  targetQueueName?: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'leave'): void
}>()

const router = useRouter()

function goToActiveQueue(queueId: string) {
  router.push({
    name: 'customer-waiting',
    params: { queueId },
  })
}
</script>

<template>
  <BaseCard class="p-6 border-warning/30 bg-warning/5 backdrop-blur-sm overflow-hidden relative">
    <!-- Subtle background pattern -->
    <div
      class="absolute -right-4 -top-4 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none"
    />

    <div class="flex items-start gap-4">
      <div class="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <div class="flex-1">
        <h3 class="font-display font-bold text-lg text-plum leading-tight">Already in a queue</h3>
        <p class="mt-2 font-body text-sm text-plum-muted leading-relaxed">
          <template v-if="targetQueueName">
            You are currently waiting in another queue. To join
            <strong>{{ targetQueueName }}</strong
            >, you'll need to leave your current session first.
          </template>
          <template v-else>
            You're already in a queue. Joining a new one will cancel your current spot and remove
            you from the line.
          </template>
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <BaseButton
            v-if="activeQueueId"
            variant="ghost"
            size="sm"
            @click="goToActiveQueue(activeQueueId)"
          >
            View Active Ticket
          </BaseButton>
          <BaseButton variant="danger" size="sm" :is-loading="isLoading" @click="emit('leave')">
            Leave Current Queue
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
