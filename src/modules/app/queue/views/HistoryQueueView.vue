<script setup lang="ts">
/**
 * @component HistoryQueueView
 * @description Queue history page with server-side pagination, search, sorting, filtering, and export.
 * Uses Pinia for dummy backend logic and TanStack Vue Query for api state management, caching & debouncing.
 */

import { useQuery } from '@tanstack/vue-query'
import { refDebounced, onClickOutside } from '@vueuse/core'
import { Search, ArrowUpDown, Filter, Download, X } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import ChevronRightIcon from '@/assets/icons/chevron-right.svg?component'
import { useQueueStore } from '@/stores/queue.store'

const router = useRouter()
const queueStore = useQueueStore()

// State
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 300)
const sortDirection = ref<'asc' | 'desc'>('desc')
const filter = ref('All')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isFilterOpen = ref(false)
const filterDropdownRef = ref(null)

const filterOptions = ['All', 'Active', 'Paused', 'Completed', 'Terminated']

onClickOutside(filterDropdownRef, () => {
  if (isFilterOpen.value) isFilterOpen.value = false
})

// Fetch using tanstack query
const { data, isLoading, isFetching } = useQuery({
  queryKey: computed(() => [
    'queuesHistory',
    {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: debouncedSearch.value,
      sortDirection: sortDirection.value,
      filter: filter.value,
    },
  ]),
  queryFn: () =>
    queueStore.fetchHistoryQueues({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: debouncedSearch.value,
      sortDirection: sortDirection.value,
      filter: filter.value,
    }),
  placeholderData: (previousData) => previousData,
})

// Quick access computeds
const pastQueues = computed(() => data.value?.data || [])
const totalPages = computed(() => data.value?.totalPages || 1)
const totalEntries = computed(() => data.value?.totalCount || 0)

// Dummy stat vars
const totalQueues = ref(42)
const totalServed = ref('1,204')
const avgWait = ref('14m')

// Methods
function toggleSort() {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
  currentPage.value = 1
}

function selectFilter(option) {
  filter.value = option
  isFilterOpen.value = false
  currentPage.value = 1
}

function clearSearch() {
  searchQuery.value = ''
}

function handleExport() {
  if (!pastQueues.value || pastQueues.value.length === 0) return

  // Define CSV headers
  const headers = ['ID', 'Date', 'Queue Name', 'Status', 'Total Served', 'Avg Wait']

  // Format rows matching currently fetched data
  const rows = pastQueues.value.map((q) => [
    q.id,
    `"${q.dateFormatted}"`,
    `"${q.name}"`,
    `"${q.status}"`,
    q.totalServed,
    `"${q.avgWait}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'queues_export.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function handleRowClick(id) {
  router.push(`/dashboard/queue/${id}`)
}
</script>

<template>
  <div class="relative mx-auto max-w-[752px]">
    <!-- ═══ Stats row ═══ -->
    <div class="flex gap-4">
      <div
        class="flex-1 rounded-card border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <p class="font-body text-sm font-bold uppercase tracking-[1.2px] text-plum-muted">
          Total Queues
        </p>
        <p class="mt-2 font-mono text-[30px] font-bold leading-9 text-plum">{{ totalQueues }}</p>
      </div>
      <div
        class="flex-1 rounded-card border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <p class="font-body text-sm font-bold uppercase tracking-[1.2px] text-plum-muted">
          Total Served
        </p>
        <p class="mt-2 font-mono text-[30px] font-bold leading-9 text-plum">{{ totalServed }}</p>
      </div>
      <div
        class="flex-1 rounded-card border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <p class="font-body text-sm font-bold uppercase tracking-[1.2px] text-plum-muted">
          Avg. Wait
        </p>
        <p class="mt-2 font-mono text-[30px] font-bold leading-9 text-mint-dark">{{ avgWait }}</p>
      </div>
    </div>

    <!-- ═══ Past Queues TABLE CARD ═══ -->
    <div
      class="mt-6 rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
    >
      <!-- Toolbar: Title + Search + Filters -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-plum-faint px-6 py-5 gap-4"
      >
        <h3 class="font-display text-lg text-plum w-48">Past Queues</h3>

        <div class="flex flex-1 items-center justify-end gap-3 w-full">
          <!-- Interactive Search Bar -->
          <div class="relative flex-1 max-w-[240px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-plum-muted" />
            <input
              v-model="searchQuery"
              placeholder="Search queue name..."
              class="w-full rounded-full border border-plum-faint pl-9 pr-8 py-2 text-sm font-body text-plum outline-none focus:border-plum transition-colors"
            />
            <button
              v-if="searchQuery"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum transition-colors"
              @click="clearSearch"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Dropdown Filter -->
          <div ref="filterDropdownRef" class="relative">
            <button
              class="flex items-center gap-2 rounded-full border border-plum/10 px-4 py-2 text-sm font-body font-medium text-plum transition-colors hover:bg-plum/5"
              @click="isFilterOpen = !isFilterOpen"
            >
              <Filter class="h-4 w-4" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isFilterOpen"
              class="absolute right-0 top-full mt-2 w-48 rounded-lg border border-plum/10 bg-white py-2 shadow-lg z-20"
            >
              <button
                v-for="opt in filterOptions"
                :key="opt"
                class="w-full px-4 py-2 text-left font-body text-sm text-plum hover:bg-plum/5 transition-colors"
                :class="{ 'font-bold bg-plum/5': filter === opt }"
                @click="selectFilter(opt)"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <!-- Export Option -->
          <button
            class="flex items-center gap-2 rounded-full bg-plum/5 px-4 py-2 text-sm font-body font-medium text-plum transition-colors hover:bg-plum/10"
            @click="handleExport"
          >
            <Download class="h-4 w-4" />
            <span class="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <!-- Column headers -->
      <div class="flex items-center bg-sand/50 px-6 py-4">
        <!-- Sortable Date Column -->
        <button
          class="flex items-center gap-1 w-[160px] font-body text-sm font-bold uppercase tracking-[1px] text-plum-muted hover:text-plum transition-colors group cursor-pointer"
          @click="toggleSort"
        >
          DATE
          <ArrowUpDown
            class="h-3 w-3 transition-opacity group-hover:opacity-100"
            :class="sortDirection ? 'opacity-100 text-plum' : 'opacity-40'"
          />
        </button>
        <span class="w-[200px] font-body text-sm font-bold uppercase tracking-[1px] text-plum-muted"
          >Queue Name</span
        >
        <span class="w-[120px] font-body text-sm font-bold uppercase tracking-[1px] text-plum-muted"
          >Status</span
        >
        <span class="w-[120px] font-body text-sm font-bold uppercase tracking-[1px] text-plum-muted"
          >Total Served</span
        >
        <span class="flex-1 font-body text-sm font-bold uppercase tracking-[1px] text-plum-muted"
          >Avg. Wait</span
        >
        <span class="w-6" />
      </div>

      <!-- Loading / Empty / Rows -->
      <div class="relative min-h-[200px]">
        <!-- Loading overlay map to generic spinner -->
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-white/50 z-10"
        >
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-plum border-t-transparent"
          />
        </div>

        <div
          v-if="!isLoading && pastQueues.length === 0"
          class="flex items-center justify-center p-12 text-center text-plum-muted font-body"
        >
          No matching queues found.
        </div>

        <div
          v-for="(queue, idx) in pastQueues"
          v-else
          :key="queue.id"
          class="flex cursor-pointer items-center px-6 py-5 transition-colors hover:bg-plum-faint/30"
          :class="idx > 0 ? 'border-t border-plum-faint' : ''"
          @click="handleRowClick(queue.id)"
        >
          <span class="w-[160px] font-body text-sm text-plum-muted">{{ queue.dateFormatted }}</span>
          <span class="w-[200px] font-body text-sm font-semibold text-plum truncate pr-4">{{
            queue.name
          }}</span>
          <span class="w-[120px] font-body text-sm font-bold leading-5">
            <span
              class="inline-flex rounded-full px-2.5 py-0.5"
              :class="{
                'bg-mint/10 text-mint-dark': queue.status === 'Completed',
                'bg-plum-faint text-plum': queue.status === 'Active',
                'bg-warning/10 text-warning-dark': queue.status === 'Paused',
                'bg-danger/10 text-danger-dark': queue.status === 'Terminated',
              }"
            >
              {{ queue.status }}
            </span>
          </span>
          <span class="w-[120px] font-mono text-sm text-plum">{{ queue.totalServed }}</span>
          <span class="flex-1 font-mono text-sm text-plum">{{ queue.avgWait }}</span>
          <ChevronRightIcon class="h-[9px] w-[6px] text-plum-muted" />
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-plum-faint px-6 py-5">
        <span class="font-body text-sm text-plum-muted flex items-center gap-2">
          <span
            v-if="isFetching && !isLoading"
            class="h-3 w-3 animate-spin rounded-full border-2 border-plum-muted border-t-transparent"
          />
          Showing page {{ currentPage }} of {{ totalPages }} ({{ totalEntries }} total)
        </span>
        <div class="flex items-center gap-1">
          <button
            class="rounded-lg px-3 py-1 font-body text-sm font-bold text-ash transition-colors hover:bg-plum-faint disabled:opacity-50"
            :disabled="currentPage <= 1 || isLoading"
            @click="goToPage(currentPage - 1)"
          >
            Prev
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg font-body text-sm font-bold transition-colors"
            :class="[
              page === currentPage ? 'bg-plum text-white' : 'text-plum-muted hover:bg-plum-faint',
              { 'opacity-50 pointer-events-none': isLoading },
            ]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="rounded-lg px-3 py-1 font-body text-sm font-bold text-plum-muted transition-colors hover:bg-plum-faint disabled:opacity-50"
            :disabled="currentPage >= totalPages || isLoading"
            @click="goToPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ Upgrade nudge ═══ -->
    <div
      class="relative mt-6 overflow-hidden rounded-card bg-plum p-8 shadow-[0_8px_10px_rgba(0,0,0,0.10),0_20px_25px_rgba(0,0,0,0.10)]"
    >
      <div class="absolute -left-10 top-0 h-28 w-36 rounded-full bg-mint/5" />
      <div class="absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/5" />

      <div class="relative flex items-center justify-between">
        <div class="flex flex-col gap-2">
          <h4 class="font-display text-xl text-white">Need detailed analytics?</h4>
          <p class="font-body text-sm text-ash">
            Upgrade to Pro to export data for the last 12 months.
          </p>
        </div>
        <router-link
          to="/premium"
          class="rounded-input bg-mint px-8 py-3 font-body text-base font-bold text-plum shadow-lg transition-colors hover:bg-mint-dark hover:text-white"
        >
          Go Pro
        </router-link>
      </div>
    </div>
  </div>
</template>
