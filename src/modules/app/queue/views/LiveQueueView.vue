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

// 4. Local composables

// 5. Component imports
import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import QrGridIcon from '@/assets/icons/qr-grid.svg?component'
import CopyLinkIcon from '@/assets/icons/copy-link.svg?component'
import ShowQrIcon from '@/assets/icons/show-qr.svg?component'
import TrendUpIcon from '@/assets/icons/trend-up.svg?component'
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

// 9. Reactive state
const showInfoModal = ref(false)
const chartLabels = ref(['10 am', '12 pm', '2 pm', '4 pm', '6 pm', '8 pm'])
const chartBars = ref([30, 45, 55, 80, 90, 60])

// 10. Computed properties

// 11. Methods
function handleShowQr() {
  showInfoModal.value = true
  emit('show-qr')
}

async function handleCopyLink() {
  await navigator.clipboard.writeText(props.joinCode)
  emit('copy-link')
}

async function handleCopyCode() {
  await navigator.clipboard.writeText(props.joinCode)
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
        :entries="entries"
        :search-query="searchQuery"
        @call-next="emit('call-next')"
        @search="emit('search', $event)"
        @add-guest="emit('add-guest')"
        @entry-menu="emit('entry-menu', $event)"
      />
    </div>

    <!-- ═══ Right column — Empty state ═══ -->
    <div
      v-if="entries.length === 0"
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
          <CopyCodeIcon class="h-[17px] w-[14px] text-plum" />
          Copy Code
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
      <div class="relative overflow-hidden rounded-card border border-plum/5 bg-white px-10 pb-8 pt-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <!-- Decorative circle -->
        <div class="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-mint/10" />

        <div class="relative">
          <QrGridIcon class="mx-auto mb-6 h-[18px] w-[18px] text-mint" />
          <p class="font-body text-[10px] font-bold uppercase tracking-[2px] text-plum/40">
            Share this code
          </p>
          <p class="mt-2 font-mono text-5xl font-bold leading-none tracking-tight text-plum">
            <span class="text-mint">{{ joinCode.slice(0, 2) }}</span>{{ joinCode.slice(2) }}
          </p>

          <!-- Copy / QR buttons -->
          <div class="mt-8 flex items-center justify-center gap-4">
            <button
              class="flex items-center gap-2 rounded-input bg-mint px-6 py-3 font-body text-xs font-bold text-plum shadow-[0_4px_6px_rgba(0,229,160,0.10),0_10px_15px_rgba(0,229,160,0.10)] transition-colors hover:bg-mint-dark"
              @click="handleCopyLink"
            >
              <CopyLinkIcon class="h-[13px] w-[11px] text-plum" />
              Copy Link
            </button>
            <button
              class="flex items-center gap-2 rounded-input bg-plum/5 px-6 py-3 font-body text-xs font-bold text-plum transition-colors hover:bg-plum/10"
              @click="handleShowQr"
            >
              <ShowQrIcon class="h-[13px] w-[13px] text-plum" />
              Show QR
            </button>
          </div>
        </div>
      </div>

      <!-- Queue Analysis card -->
      <div class="flex flex-1 flex-col rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 py-6">
          <h3 class="font-display text-xl font-bold text-plum">Queue Analysis</h3>
          <span class="flex items-center gap-[7px] rounded-lg bg-plum/5 px-3 py-1">
            <span class="h-[6px] w-[6px] rounded-full bg-mint" />
            <span class="font-body text-[10px] font-bold uppercase tracking-[1px] text-plum/40">Active</span>
          </span>
        </div>

        <!-- Stats row -->
        <div class="mx-8 rounded-card border border-plum/5 bg-plum/[0.02] p-8">
          <div class="flex">
            <!-- Served Today -->
            <div class="flex-1">
              <p class="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-plum/40">
                Served Today
              </p>
              <p class="mt-2 font-mono text-[60px] font-bold leading-none tracking-tight text-plum">
                {{ servedToday }}
              </p>
              <span class="mt-3 inline-flex items-center gap-1 rounded-full bg-mint/10 px-2 py-1">
                <TrendUpIcon class="h-[7px] w-3 text-mint" />
                <span class="font-body text-xs font-medium text-mint">{{ trendText }}</span>
              </span>
            </div>
            <!-- Completion Rate -->
            <div class="flex flex-col border-l border-plum/10 pl-8">
              <p class="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-plum/40">
                Completion Rate
              </p>
              <div class="mt-2 flex items-baseline">
                <span class="font-mono text-4xl font-bold leading-10 text-plum">{{ completionRate }}</span>
                <span class="font-mono text-xl font-bold text-plum/40">%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bar chart (simplified) -->
        <div class="flex flex-1 items-end gap-4 px-8 pb-4 pt-8">
          <div
            v-for="(bar, idx) in chartBars"
            :key="idx"
            class="flex flex-1 flex-col items-center gap-2"
          >
            <div
              class="w-full rounded-t-lg"
              :class="idx === 4 ? 'bg-mint' : 'bg-plum/10'"
              :style="{ height: `${bar * 1.5}px` }"
            />
          </div>
        </div>
        <div class="flex gap-4 px-8 pb-6">
          <span
            v-for="label in chartLabels"
            :key="label"
            class="flex-1 text-center font-mono text-[10px] uppercase tracking-[1px] text-plum/30"
          >
            {{ label }}
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ Info/QR Modal ═══ -->
    <InfoQueueModal
      :is-open="showInfoModal"
      :join-code="joinCode"
      @close="showInfoModal = false"
    />
  </div>
</template>
