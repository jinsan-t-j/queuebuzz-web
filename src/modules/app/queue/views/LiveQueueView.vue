<script setup lang="ts">
/**
 * @component LiveQueueView
 * @description Live queue management dashboard for authenticated hosts.
 */
import { ref, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import AddGuestModal from '@/modules/app/queue/components/AddGuestModal.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import EmptyQueueIcon from '@/assets/icons/empty-queue.svg?component'
import CopyCodeIcon from '@/assets/icons/copy-code.svg?component'
import ShowQrGridIcon from '@/assets/icons/show-qr-grid.svg?component'

const emit = defineEmits([
  'call-next',
  'search',
  'copy-link',
  'copy-code',
  'show-qr',
  'add-guest',
  'entry-menu',
])

const { copy: copyToClipboard } = useClipboard()

const {
  activeQueue,
  isPaused,
  waitingCount,
  avgWaitTime,

  showAddGuestModal,
  showInfoModal,
  
  rawSearchQuery,
  filteredEntries,
  
  servedTodayCount,
  completionRatePercent,
  chartLabels,
  chartBars,
  trend,

  handleSearchUpdate,
  handleAddGuestSubmit,
  handleCallNext,
  handlePauseToggle,
  handleCallGuest,
  handleSkipGuest,
  handleServeGuest,
  initializeHostQueue,
} = useLiveQueue()

const isCodeCopied = ref(false)

onMounted(() => {
  initializeHostQueue()
})

function handleShowQr() {
  showInfoModal.value = true
  emit('show-qr')
}

async function handleCopyCode() {
  if (activeQueue.value?.joinCode) {
    await copyToClipboard(activeQueue.value.joinCode)
  }
  isCodeCopied.value = true
  setTimeout(() => isCodeCopied.value = false, 2000)
  emit('copy-code')
}
</script>

<template>
  <div class="flex gap-8 min-h-[calc(100vh-128px)]">
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
        @call-next="handleCallNext"
        @toggle-pause="handlePauseToggle"
        @call-guest="handleCallGuest"
        @skip-guest="handleSkipGuest"
        @serve-guest="handleServeGuest"
        @search="handleSearchUpdate($event, (v) => emit('search', v))"
        @add-guest="showAddGuestModal = true"
        @entry-menu="emit('entry-menu', $event)"
      />
    </div>

    <!-- Right column — Empty state -->
    <div
      v-if="filteredEntries.length === 0"
      class="flex flex-1 flex-col items-center justify-center rounded-card border border-plum/10 bg-white p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <div class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-mint/15">
        <EmptyQueueIcon class="h-9 w-9 text-mint" />
      </div>

      <h2 class="font-display text-[28px] font-bold text-plum">Queue is empty</h2>
      <p class="mx-auto mt-4 max-w-[381px] font-body text-sm font-medium leading-5 text-plum/60">
        There are currently no customers waiting in line. Share your
        join code to start accepting guests.
      </p>

      <!-- Join Code card -->
      <div class="mx-auto mt-10 w-full max-w-[448px] rounded-card border-2 border-dashed border-plum/10 bg-sand px-10 py-8">
        <p class="mb-4 font-body text-[10px] font-bold uppercase tracking-[1px] text-plum/40">
          Join Code
        </p>
        <p class="font-mono text-5xl font-bold leading-none tracking-tight text-mint">
          {{ activeQueue?.joinCode ?? '' }}
        </p>
      </div>

      <!-- Copy / QR buttons -->
      <div class="mt-8 flex items-center justify-center gap-4">
        <button
          class="flex items-center gap-2 rounded-2xl bg-mint px-8 py-4 font-body text-base font-bold text-plum shadow-[0_8px_10px_rgba(0,229,160,0.20),0_20px_25px_rgba(0,229,160,0.20)] transition-colors hover:bg-mint-dark"
          @click="handleCopyCode"
        >
          <CopyCodeIcon v-if="!isCodeCopied" class="h-[17px] w-[14px] text-plum" />
          {{ isCodeCopied ? 'Copied!' : 'Copy Code' }}
        </button>
        <button
          class="flex items-center gap-2 rounded-2xl border border-plum/10 bg-white px-8 py-4 font-body text-base font-bold text-plum transition-colors hover:bg-sand"
          @click="handleShowQr"
        >
          <ShowQrGridIcon class="h-[15px] w-[15px] text-plum" />
          Show QR
        </button>
      </div>
    </div>

    <!-- Right column — Populated state -->
    <div v-else class="flex flex-1 flex-col gap-8">
      <ShareCodeCard
        :join-code="activeQueue?.joinCode ?? ''"
        @copy-link="emit('copy-link')"
        @show-qr="handleShowQr"
      />

      <QueueAnalysisCard
        :served-today="servedTodayCount"
        :trend-text="trend.text"
        :trend-direction="trend.direction"
        :completion-rate="completionRatePercent"
        :chart-labels="chartLabels"
        :chart-bars="chartBars"
      />
    </div>

    <!-- Info/QR Modal -->
    <InfoQueueModal
      :is-open="showInfoModal"
      :join-code="activeQueue?.joinCode ?? ''"
      @close="showInfoModal = false"
    />

    <!-- Add Guest Modal -->
    <AddGuestModal
      :is-open="showAddGuestModal"
      @close="showAddGuestModal = false"
      @submit="handleAddGuestSubmit"
    />
  </div>
</template>
