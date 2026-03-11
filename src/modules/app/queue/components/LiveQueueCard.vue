<script setup>
/**
 * @component LiveQueueCard
 * @description Live queue card with search bar, guest entries list,
 * "Call Next Guest" button, and optional "Terminate Queue" button.
 * Supports both populated and empty states.
 *
 * @prop {Array} entries - List of queue entry objects.
 * @prop {String} searchQuery - Current search filter text.
 * @prop {Boolean} showTerminate - Whether to show the Terminate Queue button.
 * @emits {call-next} - "Call Next Guest" button clicked.
 * @emits {search} - Search input changed.
 * @emits {add-guest} - Add guest button clicked.
 * @emits {entry-menu} - Three-dot menu on an entry clicked.
 * @emits {terminate} - "Terminate Queue" button clicked.
 */

// 1. Vue core imports
import { ref, onMounted, onUnmounted } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import SearchIcon from '@/assets/icons/search.svg?component'
import AddPersonIcon from '@/assets/icons/add-person.svg?component'
import ActionCenterIcon from '@/assets/icons/action-center.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'
import CloseCircleIcon from '@/assets/icons/close-circle.svg?component'

// 6. Props
defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: '',
  },
  showTerminate: {
    type: Boolean,
    default: false,
  },
})

// 7. Emits
const emit = defineEmits([
  'call-next',
  'call-guest',
  'search',
  'add-guest',
  'entry-menu',
  'terminate',
])

// 8. Composable destructuring

// 9. Reactive state
const openDropdownId = ref(null)

// 10. Computed properties

// 11. Methods
function toggleDropdown(id) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function handleCallGuest(id) {
  emit('call-guest', id)
  openDropdownId.value = null
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
  <div class="flex flex-1 flex-col rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <!-- Header -->
    <div class="border-b border-plum/5 bg-plum/[0.02] px-6 py-4">
      <div class="mb-3 flex items-center gap-[7px]">
        <span class="h-[6px] w-[6px] rounded-full bg-mint" />
        <span class="font-body text-xs font-bold uppercase tracking-[1.2px] text-plum/60">
          Live Queue
        </span>
      </div>
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
        <button
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-plum"
          @click="emit('add-guest')"
        >
          <AddPersonIcon class="h-3 w-4 text-sand" />
        </button>
      </div>
    </div>

    <!-- Empty state / Entries -->
    <div class="flex flex-1 flex-col" :class="entries.length === 0 ? 'items-center justify-center p-6' : 'gap-3 p-4'">
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
          v-memo="[entry.status, entry.waitTime, entry.position, entry.name, entry.partySize, openDropdownId === entry.id]"
          class="flex items-center rounded-2xl border px-4 py-3"
          :class="
            entry.status === 'called'
              ? 'border-2 border-mint shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
              : 'border-plum/5'
          "
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-lg font-bold"
              :class="
                entry.status === 'called'
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
                <span :class="entry.status === 'called' ? 'text-mint' : ''">
                  {{ entry.waitTime }} wait
                </span>
              </p>
            </div>
          </div>
          <div class="relative ml-auto guest-dropdown-container">
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-plum/5"
              @click="toggleDropdown(entry.id)"
            >
              <div class="flex h-4 w-1 flex-col items-center justify-center gap-[2px]">
                <span class="block h-[3px] w-[3px] rounded-full bg-plum/40" />
                <span class="block h-[3px] w-[3px] rounded-full bg-plum/40" />
                <span class="block h-[3px] w-[3px] rounded-full bg-plum/40" />
              </div>
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div
                v-if="openDropdownId === entry.id"
                class="absolute right-0 top-full z-10 mt-2 w-40 origin-top-right rounded-xl border border-plum/10 bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <button
                  class="flex w-full items-center px-4 py-2 font-body text-sm font-medium text-plum hover:bg-plum/5"
                  @click="handleCallGuest(entry.id)"
                >
                  <CallNextIcon class="mr-2 h-4 w-4 text-mint" />
                  Call Guest
                </button>
              </div>
            </transition>
          </div>
        </div>
      </template>
    </div>

    <!-- Action buttons -->
    <div class="border-t border-plum/5 p-4">
      <button
        class="flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 font-body text-lg font-bold transition-colors"
        :disabled="entries.length === 0"
        :class="
          entries.length > 0
            ? 'bg-plum text-sand hover:bg-plum-soft'
            : 'bg-plum/40 text-white'
        "
        @click="emit('call-next')"
      >
        <CallNextIcon class="h-4 w-5" :class="entries.length > 0 ? 'text-mint' : 'text-white'" />
        Call Next Guest
      </button>
      <p
        v-if="entries.length === 0"
        class="mt-3 text-center font-body text-xs font-medium text-plum/30"
      >
        Queue must have guests to call
      </p>

      <!-- Terminate button -->
      <button
        v-if="showTerminate"
        class="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-danger px-8 py-4 font-body text-lg font-bold text-danger transition-colors hover:bg-danger/5"
        @click="emit('terminate')"
      >
        <CloseCircleIcon class="h-4 w-4 text-danger" />
        Terminate Queue
      </button>
    </div>
  </div>
</template>
