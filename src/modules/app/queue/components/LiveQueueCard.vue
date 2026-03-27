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
import { ref, onMounted, onUnmounted } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import EntryDetailsModal from './EntryDetailsModal.vue'

import SearchIcon from '@/assets/icons/search.svg?component'
import ActionCenterIcon from '@/assets/icons/action-center.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'

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

// 11. Methods

function handleCallGuest(id) {
  emit('call-guest', id)
  openDropdownId.value = null
}

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
    <div class="flex flex-1 flex-col max-h-[400px] overflow-y-auto" :class="entries.length === 0 ? 'items-center justify-center p-6' : 'gap-3 p-4'">
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
          class="group flex cursor-pointer items-center rounded-2xl border px-4 py-3 transition-all hover:border-mint/50 hover:bg-mint/5 hover:shadow-sm"
          :class="
            entry.status === 'CALLED'
              ? 'border-2 border-mint shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-plum font-bold'
              : 'border-plum/5 shadow-sm bg-white'
          "
          @click="openDetails(entry)"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-lg font-bold"
              :class="
                entry.status === 'CALLED'
                  ? 'bg-plum text-mint'
                  : 'bg-plum/5 text-plum/40'
              "
            >
              {{ entry.position }}
            </span>
            <div>
              <p class="font-body text-base font-bold text-plum">{{ entry.name }}</p>
              <p class="font-body text-xs text-plum/40">
                Party of {{ entry.partySize }} •
                <span :class="entry.status === 'CALLED' ? 'text-mint' : ''">
                  {{ (entry.position - 1) * (avgServiceMins || 0) }} min wait
                </span>
              </p>
            </div>
          </div>
          <div class="relative ml-auto guest-dropdown-container">
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-plum/5 cursor-pointer"
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
        :disabled="entries.length === 0 || isPaused"
        :class="
          entries.length > 0 && !isPaused
            ? 'bg-plum text-sand hover:bg-plum-soft shadow-lg shadow-plum/10'
            : 'bg-plum/40 text-white cursor-not-allowed'
        "
        @click="emit('call-next')"
      >
        <CallNextIcon class="h-4 w-5" :class="entries.length > 0 && !isPaused ? 'text-mint' : 'text-white'" />
        Call Next Guest
      </button>
      <p
        v-if="entries.length === 0 || isPaused"
        class="mt-3 text-center font-body text-xs font-medium text-plum/30"
      >
        {{ isPaused ? 'Resume queue to call guests' : '' }}
      </p>
    </div>

    <!-- Entry Details Modal -->
    <EntryDetailsModal
      v-if="selectedEntry"
      :entry="selectedEntry"
      :is-open="isDetailsModalOpen"
      :avg-service-mins="avgServiceMins"
      @close="closeDetails"
      @call="(id) => { emit('call-guest', id); closeDetails(); }"
      @serve="(id) => { emit('serve-guest', id); closeDetails(); }"
    />
  </div>
</template>
