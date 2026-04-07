<script setup lang="ts">
/**
 * @component LiveQueueCard
 * @description Live queue card with search bar, guest entries list,
 * "Call Next Guest" button, and optional "Terminate Queue" button.
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import type { QueueEntry } from '../types'
import { ENTRY_STATUS } from '@/modules/app/queue/constants'

// Icons
import SearchIcon from '@/assets/icons/search.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'
import ShieldCheckIcon from '@/assets/icons/shield-verified.svg?component'
import CheckIcon from '@/assets/icons/check-circle.svg?component'

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
  strictQueueMode?: boolean
  showPartySize?: boolean
}>()

// 7. Emits
const emit = defineEmits<{
  (e: 'call-next'): void
  (e: 'search', query: string): void
  (e: 'terminate'): void
  (e: 'call', id: string): void
  (e: 'serve', id: string): void
}>()

// 9. Reactive state
const selectedEntry = ref<QueueEntry | null>(null)
const isDetailsModalOpen = ref(false)
const isHistoryExpanded = ref(false)
const { showToast } = useToast()
const recoveredIds = ref(new Set<string>())

// 10. Computed properties
const hasActiveCalledEntry = computed(() =>
  (props.activeEntries || []).some((e) => e.status === ENTRY_STATUS.CALLED),
)
const totalCount = computed(
  () => (props.activeEntries?.length || 0) + (props.servedEntries?.length || 0),
)
const nextCallDisabled = computed(() => {
  if (props.isLoading || props.isPaused) return true
  if (props.strictQueueMode && hasActiveCalledEntry.value) return true
  return false
})

function openDetails(entry: QueueEntry) {
  selectedEntry.value = entry
  isDetailsModalOpen.value = true
}

function closeDetails() {
  isDetailsModalOpen.value = false
  setTimeout(() => {
    selectedEntry.value = null
  }, 300)
}

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

// Track arrivals and recoveries for the "Pulse" effect
watch(
  () => props.activeEntries,
  (newEntries, oldEntries) => {
    if (!oldEntries || !newEntries) return

    newEntries.forEach((entry) => {
      const oldEntry = (oldEntries as QueueEntry[]).find((e) => e.id === entry.id)
      if (
        oldEntry &&
        oldEntry.status === ENTRY_STATUS.IDLE &&
        entry.status !== ENTRY_STATUS.IDLE &&
        entry.status !== ENTRY_STATUS.SKIPPED
      ) {
        // Just recovered!
        recoveredIds.value.add(entry.id)
        showToast(`Guest #${entry.ticketNo} is back in the queue!`, { type: 'success' })
        setTimeout(() => {
          recoveredIds.value.delete(entry.id)
        }, 3000)
      }
    })
  },
  { deep: true },
)
</script>

<template>
  <div
    class="max-h-[580px] flex flex-1 flex-col rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <!-- Header -->
    <div class="border-b border-plum/5 bg-plum/[0.02] px-6 py-4">
      <div class="flex items-center gap-3">
        <div
          class="flex flex-1 items-center gap-0 rounded-input border border-plum/5 bg-sand px-4 py-2"
        >
          <SearchIcon class="h-[10px] w-[10px] text-plum/40" />
          <input
            :value="searchQuery"
            placeholder="Search guests..."
            class="ml-2 w-full border-none bg-transparent font-body text-sm text-plum placeholder:text-plum/30 outline-none"
            @input="emit('search', ($event.target as HTMLInputElement).value)"
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
        <div class="flex flex-col items-center justify-center py-10 opacity-40">
          <p class="mb-4 font-body text-[10px] font-bold uppercase tracking-[2px] text-plum">
            Action Center
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
          v-for="entry in activeEntries"
          :key="entry.id"
          class="group flex cursor-pointer items-center rounded-2xl border px-4 py-4 transition-all duration-300 hover:shadow-md"
          :class="[
            entry.status === ENTRY_STATUS.CALLED
              ? 'border-2 border-mint shadow-[0_8px_32px_-8px_rgba(0,229,160,0.4)] bg-mint/[0.03] animate-status-pulse'
              : entry.status === ENTRY_STATUS.ARRIVED
                ? 'border-mint/20 bg-mint/5 shadow-sm'
                : entry.status === ENTRY_STATUS.IDLE
                  ? 'border-warning/30 bg-warning/[0.03] opacity-80'
                  : 'border-plum/5 shadow-sm bg-white hover:border-plum/20',
            recoveredIds.has(entry.id)
              ? '!border-mint !bg-mint/10 !scale-[1.02] ring-2 ring-mint ring-offset-1 z-10'
              : '',
          ]"
          @click="openDetails(entry)"
        >
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <span
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-lg font-bold transition-all duration-300"
              :class="
                entry.status === ENTRY_STATUS.CALLED
                  ? 'bg-plum text-mint'
                  : entry.status === ENTRY_STATUS.ARRIVED
                    ? 'bg-mint text-sand shadow-sm'
                    : entry.status === ENTRY_STATUS.IDLE
                      ? 'bg-warning/20 text-warning'
                      : 'bg-plum/5 text-plum/40'
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

                <BaseTooltip v-if="entry.createdBy" text="Entry added by host">
                  <ShieldCheckIcon
                    class="h-3.5 w-3.5 flex-shrink-0 text-[#00B87A] opacity-60 transition-opacity hover:opacity-100"
                  />
                </BaseTooltip>
              </div>
              <p class="font-body text-xs text-plum-muted truncate">
                <template v-if="showPartySize && entry.partySize > 1">
                  P-{{ entry.partySize }} •
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
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-plum/5 cursor-pointer"
              @click.stop="openDetails(entry)"
            >
              <div class="flex h-4 w-1 flex-col items-center justify-center gap-[2px]">
                <span class="block h-[3px] w-[3px] rounded-full bg-plum/40" />
                <span class="block h-[3px] w-[3px] rounded-full bg-plum/40" />
                <span class="block h-[3px] w-[3px] rounded-full bg-plum/40" />
              </div>
            </button>
          </div>
        </div>
      </template>
    </div>

    <div v-if="servedEntries.length > 0" class="border-t border-plum/5 bg-plum/[0.01]">
      <button
        class="flex w-full items-center justify-between px-6 py-3 text-plum/40 hover:text-plum/60 transition-colors cursor-pointer"
        @click="isHistoryExpanded = !isHistoryExpanded"
      >
        <span class="font-body text-[10px] font-bold uppercase tracking-widest">
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
          class="group flex cursor-pointer items-center rounded-xl border border-plum/[0.03] bg-sand/30 px-3 py-3 opacity-60 hover:opacity-100 transition-all"
          @click="openDetails(entry)"
        >
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <span
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-plum/5 text-plum/30 font-mono text-xs font-bold"
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
              <p v-if="entry.servedAt" class="font-body text-[10px] text-plum-muted">
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
    <div class="border-t border-plum/5 p-4">
      <button
        class="flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 font-body text-lg font-bold transition-all active:scale-[0.98] cursor-pointer"
        :disabled="nextCallDisabled"
        :class="
          !nextCallDisabled
            ? 'bg-plum text-sand hover:bg-plum-soft shadow-lg shadow-plum/10'
            : 'bg-plum/40 text-white cursor-not-allowed'
        "
        @click="emit('call-next')"
      >
        <CallNextIcon class="h-4 w-5" :class="!nextCallDisabled ? 'text-mint' : 'text-white'" />
        {{ isLoading ? 'Calling...' : 'Call Next Guest' }}
      </button>
      <p
        v-if="activeEntries.length === 0 || isPaused || (strictQueueMode && hasActiveCalledEntry)"
        class="mt-3 text-center font-body text-[10px] font-bold uppercase tracking-wider text-plum/30"
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
          emit('call', id)
          closeDetails()
        }
      "
      @serve="
        (id) => {
          emit('serve', id)
          closeDetails()
        }
      "
    />
  </div>
</template>

<style scoped>
@keyframes status-pulse {
  0%,
  100% {
    border-color: rgba(0, 229, 160, 0.3);
    box-shadow: 0 8px 32px -12px rgba(0, 229, 160, 0.2);
  }
  50% {
    border-color: rgba(0, 229, 160, 1);
    box-shadow: 0 8px 32px -8px rgba(0, 229, 160, 0.4);
  }
}

.animate-status-pulse {
  animation: status-pulse 2.5s infinite ease-in-out;
}
</style>
