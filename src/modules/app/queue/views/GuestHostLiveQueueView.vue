<script setup>
/**
 * @component GuestHostLiveQueueView
 * @description Anonymous (guest) host active queue dashboard. Two-column layout
 * showing live queue management on the left and share code + queue analysis
 * on the right. Includes a footer nudge and terminate queue support.
 *
 * @prop {Number} waitingCount - Number of guests currently waiting.
 * @prop {String} avgWait - Average wait time string.
 * @prop {String} joinCode - The join code to share.
 * @prop {Array} entries - List of queue entry objects.
 * @prop {String} searchQuery - Current search filter text.
 * @prop {Number} servedToday - Total served today count.
 * @prop {Number} completionRate - Completion rate percentage.
 * @prop {String} trendText - Trend comparison text.
 * @emits {call-next} - "Call Next Guest" button clicked.
 * @emits {search} - Search input changed.
 * @emits {copy-link} - "Copy Link" clicked.
 * @emits {show-qr} - "Show QR" clicked.
 * @emits {add-guest} - Add guest button clicked.
 * @emits {create-account} - "Create a free account" footer link clicked.
 * @emits {entry-menu} - Three-dot menu on an entry clicked.
 * @emits {terminate} - Terminate queue confirmed.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import TerminateQueueModal from '@/modules/app/queue/components/TerminateQueueModal.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import AddGuestModal from '@/modules/app/queue/components/AddGuestModal.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import CheckCircleIcon from '@/assets/icons/verified-check.svg?component'

// 6. Props
const props = defineProps({
  waitingCount: {
    type: Number,
    default: 5,
  },
  avgWait: {
    type: String,
    default: '12',
  },
  joinCode: {
    type: String,
    default: '8X4K2F',
  },
  entries: {
    type: Array,
    default: () => [
      { id: 1, position: 1, name: 'Elena G.', partySize: 4, waitTime: '8m', status: 'called' },
      { id: 2, position: 2, name: 'Marcus V.', partySize: 2, waitTime: '12m', status: 'waiting' },
      { id: 3, position: 3, name: 'Jessica W.', partySize: 6, waitTime: '15m', status: 'waiting' },
    ],
  },
  searchQuery: {
    type: String,
    default: '',
  },
  servedToday: {
    type: Number,
    default: 142,
  },
  completionRate: {
    type: Number,
    default: 94,
  },
  trendText: {
    type: String,
    default: '12% vs last hour',
  },
})

// 7. Emits
const emit = defineEmits([
  'call-next',
  'search',
  'copy-link',
  'show-qr',
  'add-guest',
  'create-account',
  'entry-menu',
  'terminate',
])

// 8. Composable destructuring

// 9. Reactive state
const showTerminateModal = ref(false)
const showInfoModal = ref(false)

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue.js'
const {
  showAddGuestModal,
  showToast,
  toastMessage,
  guestEntries,
  rawSearchQuery,
  debouncedSearchQuery,
  filteredEntries,
  activeWaitCount,
  servedTodayCount,
  completionRatePercent,
  chartLabels,
  chartBars,
  computedTrend,
  handleSearchUpdate,
  handleAddGuestSubmit
} = useLiveQueue(props.entries, props.searchQuery)

// 10. Computed properties

// 11. Methods
function handleTerminateClick() {
  showTerminateModal.value = true
}

function handleCloseQueue() {
  showTerminateModal.value = false
  emit('terminate')
}

function handleKeepOpen() {
  showTerminateModal.value = false
}

function handleShowQr() {
  showInfoModal.value = true
  emit('show-qr')
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <!-- ═══ Main Content ═══ -->
    <div class="relative z-10 mx-auto max-w-[1024px] px-6 py-8">
      <div class="flex gap-8">
        <!-- ═══ Left column ═══ -->
        <div class="flex w-[381px] shrink-0 flex-col gap-6">
          <QueueStatCards
            :waiting-count="activeWaitCount"
            :avg-wait="avgWait"
          />

          <LiveQueueCard
            :entries="filteredEntries"
            :search-query="rawSearchQuery"
            :show-terminate="true"
            @call-next="emit('call-next')"
            @search="handleSearchUpdate($event, (v) => emit('search', v))"
            @add-guest="showAddGuestModal = true"
            @entry-menu="emit('entry-menu', $event)"
            @terminate="handleTerminateClick"
          />
        </div>

        <!-- ═══ Right column ═══ -->
        <div class="flex flex-1 flex-col gap-8">
          <!-- Share code card -->
          <ShareCodeCard
            :join-code="joinCode"
            @copy-link="emit('copy-link')"
            @show-qr="handleShowQr"
          />

          <!-- Queue Analysis card -->
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

    <!-- ═══ Footer nudge ═══ -->
    <div class="relative z-10 py-6 text-center">
      <p class="font-body text-sm text-[#6b7280]">
        Want to manage with a dashboard?
        <router-link
          to="/login"
          class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
          @click="emit('create-account')"
        >
          Create a free account
        </router-link>
      </p>
    </div>

    <!-- Modals -->
    <TerminateQueueModal
      :is-open="showTerminateModal"
      :still-waiting-count="waitingCount"
      @close-queue="handleCloseQueue"
      @keep-open="handleKeepOpen"
    />

    <InfoQueueModal
      :is-open="showInfoModal"
      :join-code="joinCode"
      @close="showInfoModal = false"
    />

    <!-- ═══ Add Guest Modal ═══ -->
    <AddGuestModal
      :is-open="showAddGuestModal"
      @close="showAddGuestModal = false"
      @submit="handleAddGuestSubmit"
    />

    <!-- ═══ Success Toast ═══ -->
    <div 
      class="fixed bottom-6 right-6 z-50 flex transform items-center gap-3 rounded-2xl bg-plum px-6 py-4 shadow-[0_10px_25px_rgba(26,10,46,0.20)] transition-all duration-300"
      :class="showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'"
    >
      <CheckCircleIcon class="h-5 w-5 text-mint" />
      <span class="font-body text-sm font-semibold text-white">{{ toastMessage }}</span>
    </div>
  </div>
</template>
