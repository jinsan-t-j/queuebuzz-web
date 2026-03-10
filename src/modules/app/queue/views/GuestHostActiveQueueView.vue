<script setup>
/**
 * @component GuestHostActiveQueueView
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
import SearchIcon from '@/assets/icons/search.svg?component'
import QrGridIcon from '@/assets/icons/qr-grid.svg?component'
import CopyLinkIcon from '@/assets/icons/copy-link.svg?component'
import ShowQrIcon from '@/assets/icons/show-qr.svg?component'
import TrendUpIcon from '@/assets/icons/trend-up.svg?component'

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
const chartLabels = ref(['10 am', '12 pm', '2 pm', '4 pm', '6 pm', '8 pm'])
const chartBars = ref([30, 45, 55, 80, 90, 60])

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

async function handleCopyLink() {
  await navigator.clipboard.writeText(props.joinCode)
  emit('copy-link')
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
            :waiting-count="waitingCount"
            :avg-wait="avgWait"
          />

          <LiveQueueCard
            :entries="entries"
            :search-query="searchQuery"
            :show-terminate="true"
            @call-next="emit('call-next')"
            @search="emit('search', $event)"
            @add-guest="emit('add-guest')"
            @entry-menu="emit('entry-menu', $event)"
            @terminate="handleTerminateClick"
          />
        </div>

        <!-- ═══ Right column ═══ -->
        <div class="flex flex-1 flex-col gap-8">
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
  </div>
</template>
