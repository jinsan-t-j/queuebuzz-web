<script setup lang="ts">
/**
 * @view HistoryListView
 * @description List of past queues with searching, filtering, and pagination.
 */
import { onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHistory } from '../composables/useHistory'
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Check as CheckIcon,
  X as XIcon,
  Sparkles as SparklesIcon,
} from 'lucide-vue-next'

import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import HistoryStatsOverview from '../components/HistoryStatsOverview.vue'
import HistoryListTable from '../components/HistoryListTable.vue'
import { onClickOutside } from '@vueuse/core'

const router = useRouter()
const {
  isLoading,
  queues,
  totalCount,
  totalPages,
  summary,
  currentPage,
  searchQuery,
  activeFilter,
  fetchHistory,
  handleFilterChange,
  goToPage,
} = useHistory()

// Local UI State
const isExporting = ref(false)
const isFilterOpen = ref(false)
const filterDropdownRef = ref<HTMLElement | null>(null)

const filters = [
  { value: 'all', label: 'All queues' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
]

onClickOutside(filterDropdownRef, () => {
  isFilterOpen.value = false
})

onMounted(() => {
  fetchHistory()
})

// Search Debounce
let debounceTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchHistory()
  }, 300)
})

function selectFilter(value: string) {
  handleFilterChange(value)
  isFilterOpen.value = false
}

function viewDetail(id: string) {
  router.push({ name: 'queue-history-detail', params: { id } })
}

// Export CSV
function downloadCsv() {
  isExporting.value = true
  const headers = ['Date', 'Queue Name', 'Status', 'Served', 'Wait']
  const csvRows = [
    headers.join(','),
    ...queues.value.map((q) =>
      [q.dateFormatted, q.name, q.status, q.totalServed, q.avgWait].map((v) => `"${v}"`).join(','),
    ),
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `queuebuzz-history-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  setTimeout(() => {
    isExporting.value = false
  }, 500)
}
</script>

<template>
  <div class="px-6 md:px-8 space-y-8 pb-12">
    <!-- Pro Banner -->
    <div
      class="group relative overflow-hidden rounded-3xl bg-plum p-1 border border-plum-faint shadow-none"
    >
      <div class="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-5">
        <div class="flex items-center gap-5 text-center md:text-left">
          <div
            class="hidden sm:flex w-12 h-12 rounded-2xl bg-sand/10 items-center justify-center border border-sand/20 group-hover:scale-105 transition-transform duration-300"
          >
            <SparklesIcon class="w-6 h-6 text-mint" />
          </div>
          <div>
            <h3 class="font-display font-black text-sand text-lg">Unlock 12-Month Analytics</h3>
            <p class="font-body text-sand/60 text-sm mt-0.5">
              Upgrade to Pro to access your full session history and custom reports.
            </p>
          </div>
        </div>
        <BaseButton
          variant="primary"
          class="bg-mint text-on-mint hover:bg-mint/90 font-black px-8 h-12 border-0 shadow-none"
        >
          Upgrade for ₹499/mo
        </BaseButton>
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="font-display font-black text-4xl text-plum tracking-tight">Queue History</h1>
        <p class="font-body text-plum-muted text-sm font-medium">
          Monitor and export your past queue performance
        </p>
      </div>

      <BaseButton
        variant="ghost"
        :loading="isExporting"
        class="h-11 font-black"
        @click="downloadCsv"
      >
        <DownloadIcon class="w-4 h-4 mr-2" />
        Export All Data
      </BaseButton>
    </div>

    <!-- Stats -->
    <HistoryStatsOverview :summary="summary" :is-loading="isLoading" />

    <!-- Main List Section -->
    <BaseCard class="overflow-hidden border border-plum-faint shadow-none bg-white">
      <!-- Toolbar -->
      <div
        class="flex flex-col md:flex-row items-center justify-between gap-4 p-5 border-b border-plum-faint bg-sand"
      >
        <!-- Search -->
        <div class="relative w-full md:w-[400px]">
          <SearchIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-muted pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by queue name..."
            class="w-full h-12 bg-white border border-plum-faint rounded-2xl pl-11 pr-10 font-body text-sm text-plum placeholder:text-plum-muted focus:border-plum transition-all outline-none"
          />
          <button
            v-if="searchQuery"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum transition-colors"
            @click="searchQuery = ''"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Filter -->
        <div ref="filterDropdownRef" class="w-full md:w-auto relative">
          <button
            class="flex items-center gap-3 h-12 px-6 rounded-2xl border border-plum-faint font-body text-sm text-plum hover:border-plum hover:bg-white transition-all bg-white w-full md:w-[200px] justify-between shadow-none"
            @click="isFilterOpen = !isFilterOpen"
          >
            <span class="flex items-center gap-2 font-black">
              <FilterIcon class="w-4 h-4 text-plum-muted" />
              {{ filters.find((f) => f.value === activeFilter)?.label }}
            </span>
            <ChevronDownIcon
              class="w-4 h-4 text-plum-muted transition-transform duration-300"
              :class="{ 'rotate-180': isFilterOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform translate-y-2 opacity-0 scale-95"
            enter-to-class="transform translate-y-0 opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100 scale-100"
            leave-to-class="transform translate-y-2 opacity-0 scale-95"
          >
            <div
              v-if="isFilterOpen"
              class="absolute top-full right-0 mt-3 z-50 bg-white rounded-2xl border border-plum-faint shadow-none p-1.5 min-w-[220px]"
            >
              <button
                v-for="filter in filters"
                :key="filter.value"
                :class="[
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-left',
                  'font-body text-sm transition-all',
                  activeFilter === filter.value
                    ? 'bg-mint-light text-plum font-black'
                    : 'text-plum-muted hover:bg-sand hover:text-plum',
                ]"
                @click="selectFilter(filter.value)"
              >
                {{ filter.label }}
                <CheckIcon
                  v-if="activeFilter === filter.value"
                  class="w-4 h-4 text-mint stroke-[3]"
                />
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Table Section -->
      <HistoryListTable :items="queues" :is-loading="isLoading" @view-detail="viewDetail" />

      <!-- Pagination -->
      <div
        class="p-5 bg-white border-t border-plum-faint flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div class="font-body text-sm text-plum-muted">
          Showing
          <span class="text-plum font-black tracking-tight px-1">{{
            totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0
          }}</span>
          to
          <span class="text-plum font-black tracking-tight px-1">{{
            Math.min(currentPage * 10, totalCount)
          }}</span>
          of <span class="text-plum font-black tracking-tight px-1">{{ totalCount }}</span> entries
        </div>

        <div class="flex items-center gap-2">
          <!-- Prev -->
          <button
            :disabled="currentPage === 1"
            class="w-11 h-11 rounded-2xl flex items-center justify-center border border-plum-faint text-plum-muted disabled:opacity-20 hover:border-plum hover:text-plum hover:bg-sand transition-all bg-white shadow-none"
            aria-label="Previous page"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>

          <!-- Numbers -->
          <div class="hidden sm:flex items-center gap-1.5 px-2">
            <button
              v-for="page in totalPages"
              :key="page"
              :class="[
                'w-11 h-11 rounded-2xl font-body text-sm font-black transition-all shadow-none',
                page === currentPage
                  ? 'bg-plum text-sand'
                  : 'text-plum-muted hover:bg-sand border border-plum-faint bg-white',
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <!-- Mobile page indicator -->
          <div
            class="sm:hidden px-6 font-body text-sm text-plum font-black bg-sand py-2.5 rounded-2xl"
          >
            {{ currentPage }} / {{ totalPages }}
          </div>

          <!-- Next -->
          <button
            :disabled="currentPage === totalPages || totalPages === 0"
            class="w-11 h-11 rounded-2xl flex items-center justify-center border border-plum-faint text-plum-muted disabled:opacity-20 hover:border-plum hover:text-plum hover:bg-sand transition-all bg-white shadow-none"
            aria-label="Next page"
            @click="goToPage(currentPage + 1)"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
