<script setup>
/**
 * @component HistoryCustomerTable
 * @description Searchable table with ticket, name, joined, waited, status, served at.
 * Includes client-side search and pagination.
 *
 * @prop {Array} entries - Array of entry objects.
 * @prop {Boolean} isLoading - Show skeleton rows.
 * @prop {Number} totalCount - Total number of entries (for pagination text).
 * @emits {page-change} - Emitted with page number on pagination.
 */

import { ref, computed, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

const props = defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['page-change'])

// Search
const searchQuery = ref('')
let debounceTimer

watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
})

// Filtered entries
const filteredEntries = computed(() => {
  if (!searchQuery.value.trim()) return props.entries
  const q = searchQuery.value.toLowerCase()
  return props.entries.filter(
    (e) => e.name.toLowerCase().includes(q) || e.ticket.toLowerCase().includes(q),
  )
})

// Pagination
const currentPage = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEntries.value.length / pageSize)))

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredEntries.value.slice(start, start + pageSize)
})

const showingFrom = computed(() => {
  if (filteredEntries.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize + 1
})

const showingTo = computed(() => {
  return Math.min(currentPage.value * pageSize, filteredEntries.value.length)
})

function goTo(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
}

// Status chip classes
function statusClasses(status) {
  const map = {
    served: 'bg-mint-light text-[#00B87A]',
    skipped: 'bg-plum-faint text-plum-muted',
    'no-show': 'bg-[#FFF7ED] text-warning',
  }
  return map[status] || map.served
}

function statusLabel(status) {
  const map = {
    served: 'Served',
    skipped: 'Skipped',
    'no-show': 'No-show',
  }
  return map[status] || status
}

// Table columns
const columns = ['Ticket', 'Name', 'Joined', 'Waited', 'Status', 'Served At']
</script>

<template>
  <div class="rounded-2xl border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <!-- Header with search -->
    <div
      class="flex flex-col gap-4 border-b border-plum/5 px-6 py-5 md:flex-row md:items-center md:justify-between"
    >
      <h3 class="font-display text-xl font-bold text-plum">Customer History</h3>

      <!-- Search input -->
      <div class="relative w-full max-w-xs">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-plum/30"
        />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by name or ticket..."
          class="h-10 w-full rounded-xl border border-plum-faint bg-white py-2 pl-9 pr-8 font-body text-sm text-plum placeholder:text-plum-muted/60 focus:border-plum focus:outline-none focus:ring-0"
        />
        <button
          v-if="searchQuery"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum"
          @click="searchQuery = ''"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="px-6 py-4">
      <div v-for="i in 5" :key="i" class="flex gap-6 border-b border-plum/5 py-4 last:border-0">
        <div class="h-4 w-12 rounded bg-plum-faint animate-pulse" />
        <div class="h-4 w-24 rounded bg-plum-faint animate-pulse" />
        <div class="h-4 w-16 rounded bg-plum-faint animate-pulse" />
        <div class="h-4 w-12 rounded bg-plum-faint animate-pulse" />
        <div class="h-4 w-14 rounded bg-plum-faint animate-pulse" />
        <div class="h-4 w-16 rounded bg-plum-faint animate-pulse" />
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <!-- Empty state -->
      <div
        v-if="filteredEntries.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-3"
      >
        <p class="font-display text-base font-semibold text-plum">No entries found</p>
        <p class="font-body text-sm text-plum-muted">
          Try a different search term or clear the search.
        </p>
      </div>

      <table v-else class="w-full">
        <!-- Header -->
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col"
              class="px-6 py-3 text-left font-body text-sm font-bold uppercase tracking-[0.6px] text-plum/40"
            >
              {{ col }}
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <tr v-for="entry in paginatedEntries" :key="entry.id" class="border-t border-plum/5">
            <td class="px-6 py-3.5">
              <span class="font-mono text-sm font-bold text-mint">
                {{ entry.ticket }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <span class="font-body text-sm font-bold text-plum">
                {{ entry.name }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <span class="font-mono text-sm text-plum/60">
                {{ entry.joined }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <span class="font-mono text-sm text-plum/60">
                {{ entry.waited }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-sm font-semibold',
                  statusClasses(entry.status),
                ]"
              >
                <span
                  :class="[
                    'h-1.5 w-1.5 rounded-full',
                    entry.status === 'served' ? 'bg-[#00B87A]' : '',
                    entry.status === 'skipped' ? 'bg-warning' : '',
                    entry.status === 'no-show' ? 'bg-warning' : '',
                  ]"
                />
                {{ statusLabel(entry.status) }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <span class="font-mono text-sm text-plum/60">
                {{ entry.servedAt || '—' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination footer -->
    <div
      v-if="!isLoading && filteredEntries.length > 0"
      class="flex items-center justify-between border-t border-plum/5 px-6 py-4"
    >
      <p class="font-body text-sm text-plum/60">
        Showing {{ showingFrom }}–{{ showingTo }} of
        {{ totalCount || filteredEntries.length }}
      </p>

      <div class="flex items-center gap-2">
        <button
          :disabled="currentPage === 1"
          class="rounded-lg border border-plum-faint px-3 py-1.5 font-body text-sm font-bold text-plum/60 transition-colors hover:border-plum hover:text-plum disabled:opacity-30"
          @click="goTo(currentPage - 1)"
        >
          Prev
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="rounded-lg border border-plum-faint px-3 py-1.5 font-body text-sm font-bold text-plum/60 transition-colors hover:border-plum hover:text-plum disabled:opacity-30"
          @click="goTo(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
