<script setup>
/**
 * @component ServedView
 * @description Customer-facing "served/done" screen with star rating.
 * Shows ticket summary, celebration, and rating prompt.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 4. Local composables
import { useCustomerApi } from '@/modules/customer/composables/useCustomerApi'

// 5. Component imports
import StarRating from '@/modules/customer/components/StarRating.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import ConfettiIcon from '@/assets/icons/confetti.svg?component'

// 7. Emits
const emit = defineEmits(['done'])

// 8. Composable destructuring
const { submitRating } = useCustomerApi()

// 9. Reactive state
const queueName = ref('Chai Point · Koramangala')
const ticketNumber = ref('Q-0042')
const currentRating = ref(3)

// 11. Methods
async function handleRatingUpdate(rating) {
  currentRating.value = rating
  await submitRating('stub-ticket-id', rating)
}

function handleDone() {
  emit('done')
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <div class="flex flex-col items-center px-5 py-4">
      <!-- Ticket summary card -->
      <div class="w-full rounded-3xl border-2 border-mint bg-[#f0fff4] p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <p class="font-body text-xs font-semibold uppercase tracking-[2.4px] text-plum-muted">
          Your Ticket
        </p>
        <p class="mt-2 font-mono text-3xl font-bold text-plum">{{ ticketNumber }}</p>
        <div class="mt-3 flex justify-center">
          <BaseBadge variant="mint">SERVED</BaseBadge>
        </div>
      </div>

      <!-- Confetti icon -->
      <div class="mt-6">
        <ConfettiIcon class="h-16 w-16" />
      </div>

      <!-- Success message -->
      <h2 class="mt-3 font-display text-[28px] font-extrabold text-plum">You're all done!</h2>
      <p class="mt-1 font-body text-sm font-medium text-plum/60">Thanks for using QueueBuzz</p>

      <!-- Star rating -->
      <div class="mt-6 flex flex-col items-center gap-4">
        <StarRating
          :max-stars="5"
          :initial-rating="3"
          @update:rating="handleRatingUpdate"
        />
        <p class="font-mono text-xs uppercase tracking-[2.4px] text-plum/60">
          Rate your experience
        </p>
      </div>

      <!-- Done button -->
      <button
        class="mt-6 font-body text-base font-bold text-plum"
        @click="handleDone"
      >
        Done
      </button>
    </div>
  </div>
</template>
