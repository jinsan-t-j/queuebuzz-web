<script setup lang="ts">
import { ref, computed, onBeforeMount, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'

import TicketHero from '@/modules/customer/components/TicketHero.vue'
import WaitingStats from '@/modules/customer/components/WaitingStats.vue'
import WaitingProgress from '@/modules/customer/components/WaitingProgress.vue'
import WaitingAdUnit from '@/modules/customer/components/WaitingAdUnit.vue'
import TicketSaveBar from '@/modules/customer/components/TicketSaveBar.vue'
import RecoverByEmailAccordion from '@/modules/customer/components/RecoverByEmailAccordion.vue'
import PWABanner from '@/modules/customer/components/PWABanner.vue'
import TicketCaptureTemplate from '@/modules/customer/components/TicketCaptureTemplate.vue'

import { useCustomer } from '../composables/useCustomer'
import { useCapture } from '@/composables/useCapture'

const router = useRouter()
const { showToast } = useToast()
const { isCapturing: isSaving, hasCaptured: isSaved, captureElement } = useCapture()

const {entry, isLoading, position, ahead, estWaitMin, status, isJoined, leaveQueue, fetchEntry, connectEvents, disconnectEvents} = useCustomer()
const queueStore = useQueueStore()

const queueName = computed(() => queueStore.activeQueue?.name ?? 'Your Queue')

async function saveTicketAsImage() {
  if (!entry.value) return
  
  await captureElement(
    'capture-ticket',
    `queuebuzz-ticket-${entry.value.ticketNo}.png`,
    {
      title: 'My Queue Ticket',
      text: `I'm waiting at ${queueName.value}. My ticket is #${entry.value.ticketNo}.`
    }
  )
}



function handleShareCode() {
  if (!entry.value) return
  const data = {
    title: 'Join my queue on QueueBuzz',
    text: `I'm waiting at ${queueName.value}. My ticket is #${entry.value.ticketNo}.`,
    url: window.location.href,
  }
  if (navigator.share) {
    navigator.share(data).catch(() => {})
  } else {
    navigator.clipboard.writeText(data.url)
    showToast('Link copied!', { type: 'success' })
  }
}

// Redirect on status change from SSE
watch(
  () => status.value,
  (s) => {
    if (s === 'CALLED') router.push({ name: 'customer-called' })
    else if (s === 'SERVED') router.push({ name: 'customer-served' })
    else if (s === 'LEFT' || s === 'SKIPPED') router.push('/')
  }
)

onBeforeMount(async () => {
  // 1. If not in store, attempt to re-hydrate from cookie session
  if (!isJoined) {
    await fetchEntry()
  }

  // 2. If still not joined after hydration attempt, redirect to home
  if (!isJoined) {
    router.push('/')
    return
  }

  // 3. Ensure queue context is available for estWaitMin calculation
  const queueId = router.currentRoute.value.params.queueId as string
  if (queueId) {
    await queueStore.initializeQueueById(queueId)
  }

  // 4. Ensure SSE stream is active
  connectEvents(entry.value!.id)
})

onUnmounted(() => {
  disconnectEvents()
})

</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum transition-all duration-300">
      {{ queueName }}
    </h1>

    <!-- Loading skeleton -->
    <div v-if="isLoading && !entry" class="flex flex-col gap-4 px-5 py-4">
      <div class="h-40 animate-pulse rounded-3xl bg-plum-faint" />
      <div class="flex gap-2.5">
        <div v-for="i in 3" :key="i" class="h-24 flex-1 animate-pulse rounded-[18px] bg-plum-faint" />
      </div>
      <div class="h-4 animate-pulse rounded-full bg-plum-faint" />
    </div>

    <!-- Populated state -->
    <div v-else-if="entry" class="flex flex-col gap-5 px-5 py-4 animate-in fade-in duration-500">
      <PWABanner />

      <div ref="ticketRef" class="relative">
        <!-- Blob decorations behind ticket & stats -->
        <div class="pointer-events-none absolute -right-10 -top-10 h-[250px] w-[250px] rounded-full bg-mint-light blur-[40px] z-0" />
        <div class="pointer-events-none absolute -bottom-24 -left-12 h-[320px] w-[320px] rounded-full bg-warning/45 blur-[70px] z-0" />

        <div class="relative z-10 flex flex-col gap-5 p-1">
          <TicketHero
            :ticket-number="String(entry.ticketNo)"
            :queue-name="queueName"
            :show-leave-button="true"
            @leave-queue="leaveQueue"
            @save-ticket="saveTicketAsImage"
          />

          <WaitingStats
            :position="position"
            :ahead="ahead"
            :est-wait-min="estWaitMin"
          />
        </div>
      </div>

      <WaitingProgress
        :position="position"
      />

      <WaitingAdUnit :est-wait-min="estWaitMin" />

      <RecoverByEmailAccordion />

      <TicketSaveBar
        :ticket-number="String(entry.ticketNo)"
        :share-code="String(entry.ticketNo)"
        :is-saving="isSaving"
        :is-saved="isSaved"
        @share-code="handleShareCode"
        @save="saveTicketAsImage"
      />

      <!-- Premium Ticket Template for Capture (Off-screen) -->
      <TicketCaptureTemplate
        :ticket-number="String(entry.ticketNo)"
        :queue-name="queueName"
        join-date="Mar 31, 2026"
      />
    </div>
  </div>
</template>
