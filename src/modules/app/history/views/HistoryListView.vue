<script setup>
/**
 * @view HistoryListView
 * @description List of past queues with searching, filtering, and pagination.
 */
import { onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryApi } from '../composables/useHistoryApi'
import { onClickOutside } from '@vueuse/core'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Check as CheckIcon,
  X as XIcon,
  Inbox as InboxIcon,
  ArrowRight as ArrowRightIcon,
  Sparkles as SparklesIcon,
} from 'lucide-vue-next'

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
} = useHistoryApi()

// Local UI State
const isExporting = ref(false)
const isFilterOpen = ref(false)
const filterDropdownRef = ref(null)

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

// Data Fetching
onMounted(() => {
  fetchHistory()
})

// Search Debounce
let debounceTimer
watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchHistory()
  }, 300)
})

function selectFilter(value) {
  handleFilterChange(value)
  isFilterOpen.value = false
}

// Navigation
function viewDetail(id) {
  router.push({ name: 'queue-history-detail', params: { id } })
}

// Export CSV Stub
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

function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'active':
      return 'primary'
    case 'paused':
      return 'warning'
    case 'terminated':
      return 'danger'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <div class="px-6 md:px-8 space-y-6">
    <!-- Pro Nudge Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-plum p-1 border border-plum-soft group">
      <div
        class="absolute top-0 right-0 w-32 h-32 bg-mint/5 blur-[40px] rounded-full -mr-16 -mt-16"
      />
      <div class="relative flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4">
        <div class="flex items-center gap-4">
          <div class="hidden sm:flex w-10 h-10 rounded-2xl bg-mint/10 items-center justify-center">
            <SparklesIcon class="w-5 h-5 text-mint" />
          </div>
          <div>
            <h3 class="font-body font-bold text-white text-sm md:text-base">
              Unlock 12-Month Analytics
            </h3>
            <p class="font-body text-plum-muted text-xs md:text-sm">
              Upgrade to Pro to access your full session history and custom reports.
            </p>
          </div>
        </div>
        <BaseButton
          variant="primary"
          size="sm"
          class="bg-mint text-plum hover:bg-mint/90 font-bold px-6 shadow-lg shadow-mint/10"
        >
          Upgrade to Pro
        </BaseButton>
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <h1 class="font-display font-bold text-3xl text-plum">Queue History</h1>

      <div class="flex items-center gap-3">
        <BaseButton variant="ghost" :loading="isExporting" @click="downloadCsv">
          <DownloadIcon class="w-4 h-4 mr-2" />
          Export CSV
        </BaseButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div v-if="summary" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BaseCard class="p-6">
        <p class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted">
          Total Sessions
        </p>
        <p class="font-mono text-3xl font-bold text-plum mt-2">
          {{ summary.totalSessions ?? 0 }}
        </p>
      </BaseCard>
      <BaseCard class="p-6">
        <p class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted">
          Guests Served
        </p>
        <p class="font-mono text-3xl font-bold text-plum mt-2">
          {{ summary.totalServed?.toLocaleString() ?? 0 }}
        </p>
      </BaseCard>
      <BaseCard class="p-6">
        <p class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted">
          Avg. Session Duration
        </p>
        <p class="font-mono text-3xl font-bold text-mint mt-2">
          {{ summary.avgSessionLength ?? '0m' }}
        </p>
      </BaseCard>
    </div>

    <!-- Main Content: Combined Toolbar and Table -->
    <BaseCard class="overflow-hidden border border-plum-faint">
      <!-- Toolbar -->
      <div
        class="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-plum-faint bg-sand/10"
      >
        <div class="relative w-full md:w-96">
          <SearchIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-muted pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by queue name..."
            class="w-full h-[44px] bg-white border border-plum-faint rounded-2xl pl-11 pr-4 font-body text-sm text-plum placeholder:text-plum-muted focus:border-plum focus:outline-none focus:ring-0 transition-all"
          />
          <button
            v-if="searchQuery"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum"
            @click="searchQuery = ''"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>

        <div ref="filterDropdownRef" class="flex items-center gap-2 w-full md:w-auto relative">
          <button
            class="flex items-center gap-2 h-[44px] px-6 rounded-2xl border border-plum-faint font-body text-sm text-plum hover:border-plum transition-colors bg-white w-full md:w-auto justify-between"
            @click="isFilterOpen = !isFilterOpen"
          >
            <span class="flex items-center gap-2">
              <FilterIcon class="w-4 h-4 text-plum-muted" />
              {{ filters.find((f) => f.value === activeFilter)?.label }}
            </span>
            <ChevronDownIcon
              class="w-3 h-3 text-plum-muted transition-transform duration-200"
              :class="{ 'rotate-180': isFilterOpen }"
            />
          </button>

          <!-- Custom Dropdown Content -->
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="isFilterOpen"
              class="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl border border-plum-faint shadow-[0_8px_40px_rgba(26,10,46,0.12)] p-1 min-w-[200px]"
            >
              <button
                v-for="filter in filters"
                :key="filter.value"
                :class="[
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-left',
                  'font-body text-sm transition-colors',
                  activeFilter === filter.value
                    ? 'bg-mint-light text-plum font-semibold'
                    : 'text-plum-muted hover:bg-sand hover:text-plum',
                ]"
                @click="selectFilter(filter.value)"
              >
                {{ filter.label }}
                <CheckIcon v-if="activeFilter === filter.value" class="w-4 h-4 text-mint" />
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-plum-faint bg-sand/20">
              <th
                class="px-6 py-4 font-body text-[11px] font-bold uppercase tracking-wider text-plum-muted"
              >
                Date
              </th>
              <th
                class="px-6 py-4 font-body text-[11px] font-bold uppercase tracking-wider text-plum-muted"
              >
                Queue Name
              </th>
              <th
                class="px-6 py-4 font-body text-[11px] font-bold uppercase tracking-wider text-plum-muted"
              >
                Status
              </th>
              <th
                class="px-6 py-4 font-body text-[11px] font-bold uppercase tracking-wider text-plum-muted"
              >
                Served
              </th>
              <th
                class="px-6 py-4 font-body text-[11px] font-bold uppercase tracking-wider text-plum-muted text-right"
              >
                Avg. Wait
              </th>
              <th class="px-6 py-4" />
            </tr>
          </thead>
          <tbody class="divide-y divide-plum-faint">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="px-6 py-5">
                  <div class="h-4 w-24 bg-plum-faint rounded" />
                </td>
                <td class="px-6 py-5">
                  <div class="h-4 w-40 bg-plum-faint rounded" />
                </td>
                <td class="px-6 py-5">
                  <div class="h-6 w-20 bg-plum-faint rounded-full" />
                </td>
                <td class="px-6 py-5">
                  <div class="h-4 w-12 bg-plum-faint rounded" />
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="h-4 w-12 bg-plum-faint rounded ml-auto" />
                </td>
                <td class="px-6 py-5" />
              </tr>
            </template>
            <template v-else-if="queues?.length === 0">
              <tr>
                <td colspan="6" class="px-6 py-20 text-center text-plum-muted">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center">
                      <InboxIcon class="w-8 h-8 text-plum-muted/40" />
                    </div>
                    <p class="font-display font-bold text-xl text-plum">No history found</p>
                    <p class="font-body text-sm max-w-xs">
                      We couldn't find any queues matching your current search or filters.
                    </p>
                  </div>
                </td>
              </tr>
            </template>
            <tr
              v-for="queue in queues"
              v-else
              :key="queue.id"
              class="group hover:bg-sand/30 transition-colors cursor-pointer"
              @click="viewDetail(queue.id)"
            >
              <td class="px-6 py-5 whitespace-nowrap">
                <span class="font-body text-sm text-plum">{{ queue.dateFormatted }}</span>
              </td>
              <td class="px-6 py-5">
                <span
                  class="font-body font-semibold text-sm text-plum group-hover:text-plum transition-colors"
                  >{{ queue.name }}</span
                >
              </td>
              <td class="px-6 py-5">
                <BaseBadge :variant="getStatusVariant(queue.status)">{{ queue.status }}</BaseBadge>
              </td>
              <td class="px-6 py-5">
                <span class="font-mono text-sm text-plum">{{ queue.totalServed }}</span>
              </td>
              <td class="px-6 py-5 text-right">
                <span class="font-mono text-sm text-plum">{{ queue.avgWait }}</span>
              </td>
              <td class="px-6 py-5 text-right">
                <ArrowRightIcon
                  class="w-4 h-4 text-plum-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 ml-auto"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List -->
      <div class="md:hidden divide-y divide-plum-faint">
        <template v-if="isLoading">
          <div v-for="i in 3" :key="i" class="p-6 space-y-3 animate-pulse">
            <div class="flex justify-between">
              <div class="h-4 w-24 bg-plum-faint rounded" />
              <div class="h-6 w-20 bg-plum-faint rounded-full" />
            </div>
            <div class="h-5 w-48 bg-plum-faint rounded" />
            <div class="flex gap-4">
              <div class="h-4 w-16 bg-plum-faint rounded" />
              <div class="h-4 w-16 bg-plum-faint rounded" />
            </div>
          </div>
        </template>
        <template v-else-if="queues?.length === 0">
          <div class="p-12 text-center flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-sand flex items-center justify-center">
              <InboxIcon class="w-8 h-8 text-plum-muted" />
            </div>
            <p class="font-display font-bold text-lg text-plum">No history found</p>
          </div>
        </template>
        <div
          v-for="queue in queues"
          v-else
          :key="queue.id"
          class="p-6 hover:bg-sand/30 transition-colors"
          @click="viewDetail(queue.id)"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="font-body text-xs text-plum-muted">{{ queue.dateFormatted }}</span>
            <BaseBadge :variant="getStatusVariant(queue.status)" size="sm">{{
              queue.status
            }}</BaseBadge>
          </div>
          <h4 class="font-body font-semibold text-plum mb-3">{{ queue.name }}</h4>
          <div class="flex gap-6">
            <div>
              <p class="font-body text-[10px] font-bold uppercase tracking-wider text-plum-muted">
                Served
              </p>
              <p class="font-mono text-xs text-plum font-semibold">{{ queue.totalServed }}</p>
            </div>
            <div>
              <p class="font-body text-[10px] font-bold uppercase tracking-wider text-plum-muted">
                Avg. Wait
              </p>
              <p class="font-mono text-xs text-plum font-semibold">{{ queue.avgWait }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div
        class="p-4 bg-white border-t border-plum-faint flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="font-body text-sm text-plum-muted">
          Showing
          <span class="text-plum font-semibold">{{
            totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0
          }}</span>
          to
          <span class="text-plum font-semibold">{{ Math.min(currentPage * 10, totalCount) }}</span>
          of <span class="text-plum font-semibold">{{ totalCount }}</span> queues
        </p>

        <div class="flex items-center gap-1">
          <button
            :disabled="currentPage === 1"
            class="w-10 h-10 rounded-xl flex items-center justify-center border border-plum-faint text-plum-muted disabled:opacity-30 hover:border-plum hover:text-plum transition-all bg-white"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>

          <div class="hidden sm:flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              :class="[
                'w-10 h-10 rounded-xl font-body text-sm font-bold transition-all',
                page === currentPage
                  ? 'bg-plum text-sand shadow-lg shadow-plum/10'
                  : 'text-plum-muted hover:bg-sand border border-transparent',
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <div class="sm:hidden px-4 font-body text-sm text-plum-muted font-bold">
            {{ currentPage }} / {{ totalPages }}
          </div>

          <button
            class="w-10 h-10 rounded-xl flex items-center justify-center border border-plum-faint text-plum-muted disabled:opacity-30 hover:border-plum hover:text-plum transition-all bg-white"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
