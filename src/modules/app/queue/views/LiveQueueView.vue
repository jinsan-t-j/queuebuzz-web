<script setup>
/**
 * @component LiveQueueView
 * @description Live queue management dashboard for authenticated hosts.
 * Two-column layout supporting both empty and populated states.
 * Left: stat cards, live queue guest list with search, and call next button.
 * Right: share code panel when empty, or queue analysis when populated.
 *
 * @prop {Number} waitingCount - Number of guests currently waiting.
 * @prop {String} avgWait - Average wait time string (e.g. "12").
 * @prop {String} joinCode - The join code to share.
 * @prop {Array} entries - List of queue entry objects.
 * @prop {Number} servedToday - Total served today count.
 * @prop {Number} completionRate - Completion rate percentage.
 * @prop {String} trendText - Trend comparison text.
 * @prop {String} searchQuery - Current search filter text.
 * @emits {call-next} - "Call Next Guest" button clicked.
 * @emits {search} - Search input changed.
 * @emits {copy-link} - "Copy Link" clicked.
 * @emits {copy-code} - "Copy Code" clicked.
 * @emits {show-qr} - "Show QR" clicked.
 * @emits {add-guest} - Add guest button clicked.
 * @emits {entry-menu} - Three-dot menu on an entry clicked.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables
import { useClipboard } from '@vueuse/core'

// 4. Local composables

// 5. Component imports
import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import AddGuestModal from '@/modules/app/queue/components/AddGuestModal.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import CheckCircleIcon from '@/assets/icons/verified-check.svg?component'
import EmptyQueueIcon from '@/assets/icons/empty-queue.svg?component'
import CopyCodeIcon from '@/assets/icons/copy-code.svg?component'
import ShowQrGridIcon from '@/assets/icons/show-qr-grid.svg?component'

// 6. Props
const props = defineProps({
  waitingCount: {
    type: Number,
    default: 0,
  },
  avgWait: {
    type: String,
    default: '0',
  },
  joinCode: {
    type: String,
    default: '8X4K2F',
  },
  entries: {
    type: Array,
    default: () => [],
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
  searchQuery: {
    type: String,
    default: '',
  },
})

// 7. Emits
const emit = defineEmits([
  'call-next',
  'search',
  'copy-link',
  'copy-code',
  'show-qr',
  'add-guest',
  'entry-menu',
])

// 8. Composable destructuring
const { copy: copyToClipboard } = useClipboard()

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue.js'
const {
  showAddGuestModal,
  showToast,
  toastMessage,
  guestEntries,
  rawSearchQuery,
  debouncedSearchQuery,
  filteredEntries,
  handleSearchUpdate,
  handleAddGuestSubmit
} = useLiveQueue(props.entries, props.searchQuery)

// 9. Reactive state
const showInfoModal = ref(false)

const chartLabels = ref(['10 am', '12 pm', '2 pm', '4 pm', '6 pm', '8 pm'])
const chartBars = ref([30, 45, 55, 80, 90, 60])
const isCodeCopied = ref(false)

// 10. Computed properties

// 11. Methods
function handleShowQr() {
  showInfoModal.value = true
  emit('show-qr')
}

async function handleCopyCode() {
  await copyToClipboard(props.joinCode)
  isCodeCopied.value = true
  setTimeout(() => isCodeCopied.value = false, 2000)
  emit('copy-code')
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex gap-8 min-h-[calc(100vh-128px)]">
    <!-- ═══ Left column ═══ -->
    <div class="flex w-[381px] shrink-0 flex-col gap-6">
      <QueueStatCards
        :waiting-count="waitingCount"
        :avg-wait="avgWait"
      />

      <LiveQueueCard
        :entries="filteredEntries"
        :search-query="rawSearchQuery"
        @call-next="emit('call-next')"
        @search="handleSearchUpdate($event, (v) => emit('search', v))"
        @add-guest="showAddGuestModal = true"
        @entry-menu="emit('entry-menu', $event)"
      />
    </div>

    <!-- ═══ Right column — Empty state ═══ -->
    <div
      v-if="guestEntries.length === 0"
      class="flex flex-1 flex-col items-center justify-center rounded-card border border-plum/10 bg-white p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <!-- Empty state illustration -->
      <div class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-mint/15">
        <EmptyQueueIcon class="h-9 w-9 text-mint" />
      </div>

      <h2 class="font-display text-[28px] font-bold text-plum">Queue is empty</h2>
      <p class="mx-auto mt-4 max-w-[381px] font-body text-sm font-medium leading-5 text-plum/60">
        There are currently no customers waiting in line. Share your
        join code to start accepting guests.
      </p>

      <!-- Direct Join Code card -->
      <div class="mx-auto mt-10 w-full max-w-[448px] rounded-card border border-plum/5 bg-sand/50 px-10 py-8">
        <p class="mb-4 font-body text-[10px] font-bold uppercase tracking-[1px] text-plum/40">
          Direct Join Code
        </p>
        <p class="font-mono text-5xl font-bold leading-none tracking-tight text-mint">
          {{ joinCode }}
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

    <!-- ═══ Right column — Populated state ═══ -->
    <div v-else class="flex flex-1 flex-col gap-8">
      <!-- Share code card -->
      <ShareCodeCard
        :join-code="joinCode"
        @copy-link="emit('copy-link')"
        @show-qr="handleShowQr"
      />

      <!-- Queue Analysis card -->
      <QueueAnalysisCard
        :served-today="servedToday"
        :trend-text="trendText"
        :completion-rate="completionRate"
        :chart-labels="chartLabels"
        :chart-bars="chartBars"
      />
    </div>

    <!-- ═══ Info/QR Modal ═══ -->
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
