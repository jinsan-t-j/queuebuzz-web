<script setup>
/**
 * @component LiveQueueCard
 * @description Live queue card with search bar, guest entries list,
 * "Call Next Guest" button, and optional "Terminate Queue" button.
 * Supports both populated and empty states.
 *
 * @prop {Array} entries - List of queue entry objects.
 * @prop {String} searchQuery - Current search filter text.
 * @emits {call-next} - "Call Next Guest" button clicked.
 * @emits {search} - Search input changed.
 */

// 1. Vue core imports
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import EntryDetailsModal from './EntryDetailsModal.vue'
import BaseTooltip from '@/components/base/BaseTooltip.vue'

import SearchIcon from '@/assets/icons/search.svg?component'
import ActionCenterIcon from '@/assets/icons/action-center.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'
import ShieldCheckIcon from '@/assets/icons/shield-verified.svg?component'

// 6. Props
const props = defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: '',
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  avgServiceMins: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  strictQueueMode: {
    type: Boolean,
    default: false,
  },
  showPartySize: {
    type: Boolean,
    default: true,
  },
})

// 7. Emits
const emit = defineEmits([
  'call-next',
  'call-guest',
  'search',
  'serve-guest',
])

// 8. Composable destructuring

// 9. Reactive state
const openDropdownId = ref(null)
const selectedEntry = ref(null)
const isDetailsModalOpen = ref(false)

// 10. Computed properties
const hasActiveCalledEntry = computed(() => props.entries.some(e => e.status === 'CALLED'))
const nextCallDisabled = computed(() => {
  if (props.isLoading || props.isPaused) return true
  if (props.strictQueueMode && hasActiveCalledEntry.value) return true
  return false
})

function openDetails(entry) {
  selectedEntry.value = entry
  isDetailsModalOpen.value = true
}

function closeDetails() {
  isDetailsModalOpen.value = false
  setTimeout(() => {
    selectedEntry.value = null
  }, 300)
}

function onClickOutside(e) {
  if (!e.target.closest('.guest-dropdown-container')) {
    openDropdownId.value = null
  }
}

// 12. Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="min-h-[580px] flex flex-1 flex-col rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <!-- Header -->
    <div class="border-b border-plum/5 bg-plum/[0.02] px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="flex flex-1 items-center gap-0 rounded-input border border-plum/5 bg-sand px-4 py-2">
          <SearchIcon class="h-[10px] w-[10px] text-plum/40" />
          <input
            :value="searchQuery"
            placeholder="Search guests..."
            class="ml-2 w-full border-none bg-transparent font-body text-sm text-plum placeholder:text-plum/30 outline-none"
            @input="emit('search', $event.target.value)"
          />
        </div>
      </div>
    </div>

    <!-- Empty state / Entries -->
    <div class="flex flex-1 flex-col max-h-[400px] overflow-y-auto" :class="entries.length === 0 ? 'items-center justify-center p-6' : 'gap-3 p-4 px-6'">
      <template v-if="entries.length === 0">
        <p class="mb-4 font-body text-[10px] font-bold uppercase tracking-[2px] text-plum/30">
          Action Center
        </p>
        <ActionCenterIcon class="h-10 w-11 text-plum/10" />
      </template>
      <template v-else>
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="group flex cursor-pointer items-center rounded-2xl border px-4 py-4 transition-all duration-300 hover:shadow-md"
          :class="[
            entry.status === 'CALLED'
              ? 'border-2 border-mint shadow-[0_8px_32px_-8px_rgba(0,229,160,0.4)] bg-mint/[0.03] animate-status-pulse'
              : entry.status === 'ARRIVED'
                ? 'border-mint/20 bg-mint/5 shadow-sm'
                : 'border-plum/5 shadow-sm bg-white hover:border-plum/20'
          ]"
          @click="openDetails(entry)"
        >
          <div class="flex items-center gap-4">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-lg font-bold transition-all duration-300"
              :class="
                entry.status === 'CALLED'
                  ? 'bg-plum text-mint'
                  : entry.status === 'ARRIVED'
                    ? 'bg-mint text-sand shadow-sm'
                    : 'bg-plum/5 text-plum/40'
              "
            >
              <template v-if="entry.status === 'CALLED'">
                <CallNextIcon class="h-4 w-4" />
              </template>
              <template v-else-if="entry.status === 'ARRIVED'">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </template>
              <template v-else>
                {{ entry.position }}
              </template>
            </span>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <p 
                  class="font-body text-base font-bold text-plum truncate max-w-[180px]"
                  :class="entry.status === 'CALLED' ? 'text-plum' : ''"
                >
                  {{ entry.name }}
                </p>

                <BaseTooltip v-if="entry.createdBy" text="Entry added by you">
                  <ShieldCheckIcon
                    class="h-3.5 w-3.5 flex-shrink-0 text-[#00B87A] opacity-60 transition-opacity hover:opacity-100"
                  />
                </BaseTooltip>
              </div>
              <p class="font-body text-xs text-plum-muted">
                <template v-if="showPartySize && entry.partySize > 1">
                  Party of {{ entry.partySize }} •
                </template>
                <span :class="entry.status === 'CALLED' ? 'text-mint font-bold' : ''">
                  {{ entry.status === 'CALLED' ? 'At the counter' : entry.status === 'ARRIVED' ? 'Waiting in shop' : `${(entry.position - 1) * (avgServiceMins || 0)} min wait` }}
                </span>
              </p>
            </div>
          </div>
          <div class="relative ml-auto guest-dropdown-container">
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
        v-if="entries.length === 0 || isPaused || (strictQueueMode && hasActiveCalledEntry)"
        class="mt-3 text-center font-body text-[10px] font-bold uppercase tracking-wider text-plum/30"
      >
        <template v-if="isPaused">Resume queue to call guests</template>
        <template v-else-if="strictQueueMode && hasActiveCalledEntry">
          Serve current guest first
        </template>
        <template v-else-if="entries.length === 0">No guests waiting</template>
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
      @call="(id) => { emit('call-guest', id); closeDetails(); }"
      @serve="(id) => { emit('serve-guest', id); closeDetails(); }"
    />
  </div>
</template>

<style scoped>
@keyframes status-pulse {
  0%, 100% { 
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
