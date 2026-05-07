<script setup lang="ts">
/**
 * @component LiveQueueCard
 * @description Live queue card with search bar, guest entries list,
 * "Call Next Guest" button, and optional "Terminate Queue" button.
 */
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
import { useToast } from '@/composables/useToast'
import type { QueueEntry } from '../types'
import { ENTRY_STATUS } from '@/modules/app/queue/constants'

// Icons
import SearchIcon from '@/assets/icons/search.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'
import ShieldCheckIcon from '@/assets/icons/shield-verified.svg?component'
import CheckIcon from '@/assets/icons/check-circle.svg?component'
import ActionCenterIcon from '@/assets/icons/action-center.svg?component'

// Components
import EntryDetailsModal from './EntryDetailsModal.vue'
import BaseTooltip from '@/components/base/BaseTooltip.vue'

// 6. Props
const props = defineProps<{
  activeEntries: QueueEntry[]
  servedEntries: QueueEntry[]
  searchQuery?: string
  isPaused?: boolean
  avgServiceMins?: number
  isLoading?: boolean
  isRefreshing?: boolean
  strictQueueMode?: boolean
  showPartySize?: boolean
  manualPositioning?: boolean
}>()

// 7. Emits
const emit = defineEmits<{
  (e: 'call-next'): void
  (e: 'search', query: string): void
  (e: 'call-guest', id: string): void
  (e: 'serve-guest', id: string): void
}>()

const QueueFilterDropdown = defineAsyncComponent(() => import('./QueueFilterDropdown.vue'))

// 9. Reactive state
const selectedEntry = ref<QueueEntry | null>(null)
const isDetailsModalOpen = ref(false)
const isHistoryExpanded = ref(false)
const { showToast } = useToast()
const recoveredIds = ref(new Set<string>())
const sortMode = ref<'position' | 'size-asc' | 'size-desc'>('position')
const partySizeFilter = ref<number | 'all'>('all')
const isFilterMenuOpen = ref(false)

// 10. Computed properties
const hasActiveCalledEntry = computed(() =>
  (props.activeEntries || []).some((e) => e.status === ENTRY_STATUS.CALLED),
)
const totalCount = computed(
  () => (props.activeEntries?.length || 0) + (props.servedEntries?.length || 0),
)
const availablePartySizes = computed(() => {
  const sizes = new Set(props.activeEntries.map((e) => e.partySize).filter((s): s is number => !!s))
  return Array.from(sizes).sort((a, b) => a - b)
})

const sortedActiveEntries = computed(() => {
  let entries = [...(props.activeEntries || [])]

  // 1. Filtering
  if (props.showPartySize && partySizeFilter.value !== 'all') {
    entries = entries.filter((e) => e.partySize === partySizeFilter.value)
  }

  // 2. Sorting
  return entries.sort((a, b) => {
    if (sortMode.value === 'size-asc') {
      const diff = (a.partySize || 1) - (b.partySize || 1)
      if (diff !== 0) return diff
    } else if (sortMode.value === 'size-desc') {
      const diff = (b.partySize || 1) - (a.partySize || 1)
      if (diff !== 0) return diff
    }
    // Fallback to arrival order
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
})
const nextCallDisabled = computed(() => {
  if (props.isLoading || props.isRefreshing || props.isPaused) return true
  if (props.strictQueueMode && hasActiveCalledEntry.value) return true
  return false
})

let closeTimer: ReturnType<typeof setTimeout> | null = null

function openDetails(entry: QueueEntry) {
  selectedEntry.value = entry
  isDetailsModalOpen.value = true
}

function closeDetails() {
  isDetailsModalOpen.value = false
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    selectedEntry.value = null
    closeTimer = null
  }, 300)
}

onUnmounted(() => {
  if (closeTimer) clearTimeout(closeTimer)
})

// 12. Lifecycle hooks
onMounted(() => {
  if (props.activeEntries?.length === 0 && (props.servedEntries?.length || 0) > 0) {
    isHistoryExpanded.value = true
  }
})

// 13. Watchers
watch(
  () => props.activeEntries?.length,
  (newVal) => {
    if (newVal === 0 && (props.servedEntries?.length || 0) > 0) {
      isHistoryExpanded.value = true
    }
  },
)

// Track arrivals and recoveries via a lightweight status-key (avoids deep watch)
const entryStatusKey = computed(() =>
  (props.activeEntries || []).map((e) => `${e.id}:${e.status}`).join(','),
)

watch(entryStatusKey, (newKey, oldKey) => {
  if (!oldKey || !newKey) return
  const oldMap = new Map(
    oldKey
      .split(',')
      .filter(Boolean)
      .map((p) => {
        const [id, s] = p.split(':')
        return [id, s] as [string, string]
      }),
  )

  for (const entry of props.activeEntries || []) {
    const oldStatus = oldMap.get(entry.id)
    if (
      oldStatus === ENTRY_STATUS.IDLE &&
      entry.status !== ENTRY_STATUS.IDLE &&
      entry.status !== ENTRY_STATUS.SKIPPED
    ) {
      recoveredIds.value.add(entry.id)
      showToast(`Guest #${entry.ticketNo} is back in the queue!`, { type: 'success' })
      setTimeout(() => recoveredIds.value.delete(entry.id), 3000)
    }
  }
})
</script>

<template>
  <div
    class="max-h-[580px] flex flex-1 flex-col rounded-card border border-plum-faint bg-white shadow-sm dark:shadow-none"
  >
    <!-- Header -->
    <div class="border-b border-plum-faint bg-plum-faint/10 px-4 py-3 sm:px-6 sm:py-4">
      <div class="flex items-center gap-3">
        <div
          class="flex flex-1 items-center gap-0 rounded-input border border-plum-faint bg-plum-faint/10 px-3 py-1.5 sm:px-4 sm:py-2"
        >
          <SearchIcon class="h-[10px] w-[10px] text-plum-muted" />
          <input
            :value="searchQuery"
            placeholder="Search ..."
            class="ml-2 w-full border-none bg-transparent font-body text-xs sm:text-sm font-medium text-plum placeholder:text-plum-muted tracking-wider focus:outline-none"
            @input="emit('search', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <!-- Sort by party size toggle (only when party sizes are enabled) -->
        <!-- Sort & Filter (only when party sizes are enabled) -->
        <div v-if="showPartySize" class="relative">
          <button
            type="button"
            class="flex items-center gap-2 rounded-input border px-3 py-1.5 sm:py-2 font-body text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            :class="
              sortMode !== 'position' || partySizeFilter !== 'all'
                ? 'border-plum bg-plum text-sand shadow-md'
                : 'border-plum-faint text-plum-muted hover:border-plum hover:text-plum'
            "
            @click="isFilterMenuOpen = !isFilterMenuOpen"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span class="hidden sm:inline">{{
              partySizeFilter === 'all' ? 'Filter' : `Size: ${partySizeFilter}`
            }}</span>
            <svg
              class="h-3 w-3 transition-transform duration-200"
              :class="{ 'rotate-180': isFilterMenuOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <QueueFilterDropdown
            v-if="isFilterMenuOpen"
            :sort-mode="sortMode"
            :party-size-filter="partySizeFilter"
            :available-party-sizes="availablePartySizes"
            @update:sort-mode="sortMode = $event"
            @update:party-size-filter="partySizeFilter = $event"
            @close="isFilterMenuOpen = false"
            @reset="
              partySizeFilter = 'all'
              sortMode = 'position'
              isFilterMenuOpen = false
            "
          />

          <!-- Click Outside Overlay -->
          <div
            v-if="isFilterMenuOpen"
            class="fixed inset-0 z-40"
            @click="isFilterMenuOpen = false"
          />
        </div>
      </div>
    </div>

    <!-- Empty state / Entries -->
    <div
      class="flex flex-1 flex-col overflow-y-auto p-4 px-6"
      :class="totalCount === 0 ? 'items-center justify-center' : 'gap-3'"
    >
      <!-- Active Guests -->
      <!-- Case 1: No entries at all (Truly empty) -->
      <template v-if="totalCount === 0 && !searchQuery">
        <div class="flex flex-col items-center justify-center py-10 opacity-80">
          <p class="mb-4 font-body text-sm text-plum-muted text-center max-w-[280px]">
            When guests join the queue, they will appear here.
          </p>
          <ActionCenterIcon class="h-10 w-11" />
        </div>
      </template>

      <!-- Case 2: Active empty, but history has items (Queue Finished) -->
      <template v-else-if="activeEntries.length === 0 && !searchQuery">
        <div class="py-10 text-center opacity-40">
          <p class="font-body text-sm text-plum">Active queue is clear</p>
        </div>
      </template>

      <!-- Case 3: Search results empty -->
      <template v-else-if="activeEntries.length === 0 && searchQuery">
        <div class="py-10 text-center opacity-40">
          <p class="font-body text-sm text-plum">No active guests match "{{ searchQuery }}"</p>
        </div>
      </template>

      <!-- Case 4: Populated List -->
      <template v-else>
        <div
          v-for="entry in sortedActiveEntries"
          :key="entry.id"
          class="group flex cursor-pointer items-center rounded-2xl border px-3 py-3 sm:px-4 sm:py-4 transition-all duration-300 hover:shadow-md dark:hover:shadow-none"
          :class="[
            entry.status === ENTRY_STATUS.CALLED
              ? 'border-2 border-mint shadow-[0_8px_32px_-8px_rgba(0,229,160,0.4)] dark:shadow-none bg-mint/5 dark:bg-mint/10 animate-status-pulse'
              : entry.status === ENTRY_STATUS.ARRIVED
                ? 'border-mint/20 bg-mint/5 dark:bg-mint/10 shadow-sm dark:shadow-none'
                : entry.status === ENTRY_STATUS.IDLE
                  ? 'border-warning/30 bg-warning/5 dark:bg-warning/10 opacity-80'
                  : 'border-plum-faint shadow-sm dark:shadow-none bg-white dark:bg-plum-faint/30 hover:border-plum-faint/80',
            recoveredIds.has(entry.id)
              ? '!border-mint !bg-mint/10 !scale-[1.02] ring-2 ring-mint ring-offset-1 z-10'
              : '',
          ]"
          @click="openDetails(entry)"
        >
          <div class="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <span
              class="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-base sm:text-lg font-bold transition-all duration-300"
              :class="
                entry.status === ENTRY_STATUS.CALLED
                  ? 'bg-plum dark:bg-mint text-mint dark:text-on-mint'
                  : entry.status === ENTRY_STATUS.ARRIVED
                    ? 'bg-mint text-on-mint shadow-sm dark:shadow-none'
                    : entry.status === ENTRY_STATUS.IDLE
                      ? 'bg-warning/20 text-warning'
                      : 'bg-plum-faint text-plum-muted'
              "
            >
              <template v-if="entry.status === ENTRY_STATUS.CALLED">
                <CallNextIcon class="h-4 w-4" />
              </template>
              <template v-else-if="entry.status === ENTRY_STATUS.ARRIVED">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </template>
              <template v-else-if="entry.status === ENTRY_STATUS.IDLE">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </template>
              <template v-else>
                {{ entry.position }}
              </template>
            </span>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-body text-base font-bold text-plum truncate">
                  {{ entry.name }}
                </p>

                <BaseTooltip v-if="entry.createdBy" text="Added by you">
                  <ShieldCheckIcon
                    class="h-3.5 w-3.5 flex-shrink-0 text-mint-dark opacity-60 transition-opacity hover:opacity-100"
                  />
                </BaseTooltip>
              </div>
              <p class="font-body text-sm text-plum-muted truncate">
                <template v-if="showPartySize && entry.partySize">
                  <span
                    class="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 font-mono text-xs font-bold"
                    :class="
                      sortMode !== 'position'
                        ? 'bg-plum-soft/15 text-plum'
                        : 'bg-plum-faint/60 text-plum-muted'
                    "
                  >
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {{ entry.partySize }}
                  </span>
                  •
                </template>
                <span
                  :class="[
                    entry.status === ENTRY_STATUS.CALLED ? 'text-mint font-bold' : '',
                    entry.status === ENTRY_STATUS.IDLE ? 'text-warning font-bold italic' : '',
                  ]"
                >
                  {{
                    entry.status === ENTRY_STATUS.CALLED
                      ? 'At the counter'
                      : entry.status === ENTRY_STATUS.ARRIVED
                        ? 'In shop'
                        : entry.status === ENTRY_STATUS.IDLE
                          ? 'No Show (Grace Period)'
                          : `${(entry.position - 1) * (avgServiceMins || 2)} min wait`
                  }}
                </span>
              </p>
            </div>
          </div>
          <div class="relative ml-2 guest-dropdown-container">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-plum/5 dark:hover:bg-plum-faint/40 cursor-pointer"
              @click.stop="openDetails(entry)"
            >
              <div class="flex h-4 w-1 flex-col items-center justify-center gap-[2px]">
                <span class="block h-[3px] w-[3px] rounded-full bg-plum-muted" />
                <span class="block h-[3px] w-[3px] rounded-full bg-plum-muted" />
                <span class="block h-[3px] w-[3px] rounded-full bg-plum-muted" />
              </div>
            </button>
          </div>
        </div>
      </template>
    </div>

    <div
      v-if="servedEntries.length > 0"
      class="border-t border-plum-faint bg-plum-faint/10 dark:bg-plum-faint/30"
    >
      <button
        class="flex w-full items-center justify-between px-6 py-3 text-plum-muted transition-colors hover:text-plum/60 cursor-pointer"
        @click="isHistoryExpanded = !isHistoryExpanded"
      >
        <span class="font-body text-xs font-bold uppercase tracking-widest">
          Served Today ({{ servedEntries.length }})
        </span>
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': isHistoryExpanded }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Scoped scroll for history to prevent it taking over the screen on mobile -->
      <div
        v-if="isHistoryExpanded"
        class="max-h-[240px] overflow-y-auto px-6 pb-4 pt-1 flex flex-col gap-2"
      >
        <div
          v-for="entry in servedEntries"
          :key="entry.id"
          class="group flex cursor-pointer items-center rounded-xl border border-plum-faint bg-plum-faint/10 px-3 py-3 opacity-60 hover:opacity-100 transition-all"
          @click="openDetails(entry)"
        >
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <span
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-plum-faint/30 text-plum-muted font-mono text-sm font-bold"
            >
              <template v-if="entry.servedAt">
                <CheckIcon class="h-4 w-4" />
              </template>
              <template v-else>
                {{ entry.position || '—' }}
              </template>
            </span>
            <div class="flex flex-col min-w-0">
              <p class="font-body text-sm font-bold text-plum truncate">{{ entry.name }}</p>
              <p v-if="entry.servedAt" class="font-body text-sm text-plum-muted">
                Served at
                {{
                  new Date(entry.servedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div v-if="!manualPositioning" class="border-t border-plum-faint p-4">
      <button
        class="flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-3.5 sm:px-8 sm:py-4 font-body text-base sm:text-lg font-bold transition-all active:scale-[0.98] cursor-pointer"
        :disabled="nextCallDisabled"
        :class="
          !nextCallDisabled
            ? 'bg-plum text-sand hover:bg-plum-soft shadow-lg shadow-plum/10 dark:shadow-none'
            : 'bg-plum-muted/40 text-white cursor-not-allowed'
        "
        @click="emit('call-next')"
      >
        <CallNextIcon class="h-4 w-5" :class="!nextCallDisabled ? 'text-mint' : 'text-white'" />
        {{ isLoading ? 'Calling...' : 'Call Next Guest' }}
      </button>
      <p
        v-if="activeEntries.length === 0 || isPaused || (strictQueueMode && hasActiveCalledEntry)"
        class="mt-3 text-center font-body text-xs font-medium uppercase tracking-wider text-plum-muted"
      >
        <template v-if="isPaused">Resume queue to call guests</template>
        <template v-else-if="strictQueueMode && hasActiveCalledEntry">
          Serve current guest first
        </template>
        <template v-else-if="activeEntries.length === 0">No guests waiting in line</template>
      </p>
    </div>

    <!-- Entry Details Modal -->
    <EntryDetailsModal
      v-if="selectedEntry"
      :entry="selectedEntry"
      :is-open="isDetailsModalOpen"
      :avg-service-mins="avgServiceMins"
      :show-party-size="showPartySize"
      @close="closeDetails"
      @call="
        (id) => {
          emit('call-guest', id)
          closeDetails()
        }
      "
      @serve="
        (id) => {
          emit('serve-guest', id)
          closeDetails()
        }
      "
    />
  </div>
</template>

<style scoped>
@keyframes status-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-status-pulse {
  animation: status-pulse 2s infinite ease-in-out;
  contain: layout style paint;
}
</style>
