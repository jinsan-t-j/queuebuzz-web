<script setup lang="ts">
/**
 * @component GuestHostLiveQueueView
 * @description Anonymous (guest) host active queue dashboard.
 */
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQueueStore } from '@/stores/queue.store'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import TerminateQueueModal from '@/modules/app/queue/components/TerminateQueueModal.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import AddGuestModal from '@/modules/app/queue/components/AddGuestModal.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import { onBeforeMount } from 'vue'

const router = useRouter()
const store = useQueueStore()

const {
  activeQueue,
  isPaused,
  waitingCount,
  avgWaitTime,

  showAddGuestModal,
  showTerminateModal,
  showInfoModal,
  
  rawSearchQuery,
  filteredEntries,
  
  servedTodayCount,
  completionRatePercent,
  chartLabels,
  chartBars,
  computedTrend,

  handleSearchUpdate,
  handleAddGuestSubmit,
  handleCallNext,
  handlePauseToggle,
  handleTerminateQueue,
} = useLiveQueue()

onBeforeMount(() => {
  if (!store.activeQueue) {
    const route = useRoute()
    store.fetchQueueById(route.params.id as string)
    if (!store.activeQueue) {
      router.push({ name: 'guest-host-queue-ended', query: { reason: 'terminated' } })
    }
  }
})

async function onTerminateConfirmed() {
  const success = await handleTerminateQueue()
  if (success) {
    router.push({ name: 'guest-host-complete' })
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <div class="relative z-10 mx-auto max-w-[1024px] px-6 py-4">
      <div class="flex gap-8">
        <!-- Left column -->
        <div class="flex w-[381px] shrink-0 flex-col gap-6">
          <QueueStatCards
            :waiting-count="waitingCount"
            :avg-wait="avgWaitTime"
          />

          <LiveQueueCard
            :entries="filteredEntries"
            :search-query="rawSearchQuery"
            :is-paused="isPaused"
            :show-terminate="true"
            @call-next="handleCallNext"
            @search="handleSearchUpdate($event)"
            @add-guest="showAddGuestModal = true"
            @toggle-pause="handlePauseToggle"
            @terminate="showTerminateModal = true"
          />
        </div>

        <!-- Right column -->
        <div class="flex flex-1 flex-col gap-8">
          <ShareCodeCard
            :join-code="activeQueue?.joinCode ?? ''"
            @show-qr="showInfoModal = true"
          />

          <QueueAnalysisCard
            :served-today="servedTodayCount"
            :trend-text="computedTrend.text"
            :trend-direction="computedTrend.direction"
            :completion-rate="completionRatePercent"
            :chart-labels="chartLabels"
            :chart-bars="chartBars"
          />
        </div>
      </div>
    </div>

    <!-- Footer nudge -->
    <div class="relative z-10 py-6 text-center">
      <p class="font-body text-sm text-[#6b7280]">
        Want to manage with a dashboard?
        <router-link
          to="/login"
          class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
        >
          Create a free account
        </router-link>
      </p>
    </div>

    <!-- Modals -->
    <TerminateQueueModal
      :is-open="showTerminateModal"
      :still-waiting-count="waitingCount"
      @close-queue="onTerminateConfirmed"
      @keep-open="showTerminateModal = false"
    />

    <InfoQueueModal
      :is-open="showInfoModal"
      :join-code="activeQueue?.joinCode ?? ''"
      @close="showInfoModal = false"
    />

    <AddGuestModal
      :is-open="showAddGuestModal"
      @close="showAddGuestModal = false"
      @submit="handleAddGuestSubmit"
    />
  </div>
</template>
