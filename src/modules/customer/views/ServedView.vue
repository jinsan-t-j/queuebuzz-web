<script setup lang="ts">
/**
 * @component ServedView
 * @description Customer-facing "served/done" screen with star rating.
 * Shows ticket summary, celebration confetti, and rating prompt.
 */

import { computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'

import { useCustomer } from '@/modules/customer/composables/useCustomer'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useQueueStore } from '@/stores/queue.store'

import BaseBadge from '@/components/base/BaseBadge.vue'
import ConfettiPartyIcon from '@/assets/icons/confetti-party.svg?component'

const { clearEntry } = useCustomerStore()
const { entry, disconnectEvents } = useCustomer()
const queueStore = useQueueStore()
const router = useRouter()

const TALLY_FORM_URL = import.meta.env.VITE_TALLY_URL

const queueName = computed(() => queueStore.activeQueue?.name || 'Your Queue')
const ticketNumber = computed(
  () => (router.currentRoute.value.query.t as string) || entry.value?.ticketNo || '...',
)

onBeforeMount(async () => {
  const queueId = router.currentRoute.value.params.queueId as string
  if (queueId) {
    await queueStore.initializeQueueById(queueId)
  }

  disconnectEvents()
  clearEntry()
})

const handleFeedback = () => {
  const tNum = ticketNumber.value
  const qName = queueName.value
  window.open(`${TALLY_FORM_URL}?ticket=${tNum}&queue=${encodeURIComponent(qName)}`, '_blank')
}

function handleDone() {
  router.push('/')
}
</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <!-- Blob decorations — Served screen specific (soft mint gradient blobs) -->
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-[300px] w-[300px] rounded-full bg-mint-light/60 blur-[60px]"
    />
    <div
      class="pointer-events-none absolute -bottom-20 -left-16 h-[280px] w-[280px] rounded-full bg-mint-light/40 blur-[60px]"
    />

    <!-- Queue name header -->
    <h1
      class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum transition-all duration-300"
    >
      {{ queueName }}
    </h1>

    <div class="flex flex-col items-center px-5 py-4 animate-in zoom-in-95 duration-500">
      <!-- Ticket summary card -->
      <div
        class="w-full rounded-[32px] border-2 border-mint bg-mint-light/10 p-7 text-center shadow-[0_8px_30px_rgba(0,229,160,0.08)]"
      >
        <p class="font-body text-sm font-semibold uppercase tracking-[2.4px] text-plum-muted/70">
          Your Ticket
        </p>
        <p class="mt-2 font-mono text-4xl font-bold text-plum tracking-tight">{{ ticketNumber }}</p>
        <div class="mt-4 flex justify-center">
          <BaseBadge variant="mint" class="px-4 py-1.5 font-bold tracking-wider">SERVED</BaseBadge>
        </div>
      </div>

      <!-- Confetti icon -->
      <div class="mt-8 transform transition-transform hover:scale-110 duration-300">
        <ConfettiPartyIcon class="h-[84px] w-[84px] text-mint" />
      </div>

      <!-- Success message -->
      <div class="text-center mt-5">
        <h2 class="font-display text-[28px] font-extrabold text-plum leading-tight">
          You're all done!
        </h2>
        <p class="mt-2 font-body text-base font-medium text-plum/50">Thanks for using QueueBuzz</p>
      </div>

      <!-- Feedback section (Tally) -->
      <div class="mt-10 flex flex-col items-center gap-4 w-full">
        <button
          class="flex items-center justify-center gap-2 px-8 h-[60px] w-full rounded-[20px] bg-mint text-plum font-body font-bold shadow-md hover:scale-[1.02] active:scale-100 transition-all"
          @click="handleFeedback"
        >
          Share Feedback
        </button>
        <p class="font-mono text-sm font-bold uppercase tracking-[3px] text-plum/30">
          How was your experience?
        </p>
      </div>

      <!-- Done button -->
      <button
        class="mt-12 h-14 w-full rounded-2xl bg-white border border-plum-faint font-body text-base font-bold text-plum shadow-sm hover:bg-plum-faint transition-all"
        @click="handleDone"
      >
        Done & Exit
      </button>
    </div>
  </div>
</template>
