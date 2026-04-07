<script setup>
/**
 * @view HistoryListView
 * @description List of past queues with searching, filtering, and pagination.
 */
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryApi } from '../composables/useHistoryApi'
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
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'

const router = useRouter()
const { isLoading, fetchQueues } = useHistoryApi()

// State
const queues = ref([])
const totalPages = ref(1)
const totalCount = ref(0)
const currentPage = ref(1)
const searchQuery = ref('')
const activeFilter = ref('all')
const isExporting = ref(false)

const filters = [
  { value: 'all', label: 'All queues' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
]

// Data Fetching
async function loadData() {
  const result = await fetchQueues({
    page: currentPage.value,
    limit: 10,
    search: searchQuery.value,
    filter: activeFilter.value === 'all' ? undefined : activeFilter.value,
  })

  if (result) {
    queues.value = result.data
    totalPages.value = result.totalPages
    totalCount.value = result.totalCount
  }
}

onMounted(loadData)

// Search Debounce
let debounceTimer
watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    loadData()
  }, 300)
})

// Filter Change
function handleFilterChange(val) {
  activeFilter.value = val
  currentPage.value = 1
  loadData()
}

// Pagination
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadData()
  }
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
  switch (status.toLowerCase()) {
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
  <div class="p-6 md:p-8 space-y-8 bg-sand min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="font-display font-bold text-3xl text-plum">Queue History</h1>
        <p class="font-body text-plum-muted mt-1">
          Review performance and data from your past sessions.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton variant="ghost" :loading="isExporting" @click="downloadCsv">
          <DownloadIcon class="w-4 h-4 mr-2" />
          Export CSV
        </BaseButton>
      </div>
    </div>

    <!-- Stats Overview (Mocks) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BaseCard class="p-6">
        <p class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted">
          Total Queues
        </p>
        <p class="font-mono text-3xl font-bold text-plum mt-2">42</p>
      </BaseCard>
      <BaseCard class="p-6">
        <p class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted">
          Total Customers Served
        </p>
        <p class="font-mono text-3xl font-bold text-plum mt-2">1,204</p>
      </BaseCard>
      <BaseCard class="p-6">
        <p class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted">
          Average Wait Time
        </p>
        <p class="font-mono text-3xl font-bold text-mint mt-2">14m</p>
      </BaseCard>
    </div>

    <!-- Toolbar -->
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-plum-faint shadow-sm"
    >
      <div class="relative w-full md:w-96">
        <SearchIcon
          class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-muted pointer-events-none"
        />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by queue name..."
          class="w-full h-[48px] bg-sand/30 border border-plum-faint rounded-2xl pl-11 pr-4 font-body text-sm text-plum placeholder:text-plum-muted focus:border-plum focus:outline-none focus:ring-0 transition-all"
        />
        <button
          v-if="searchQuery"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum"
          @click="searchQuery = ''"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="flex items-center gap-2 h-[48px] px-6 rounded-2xl border border-plum-faint font-body text-sm text-plum hover:border-plum transition-colors bg-white w-full md:w-auto justify-between"
            >
              <span class="flex items-center gap-2">
                <FilterIcon class="w-4 h-4 text-plum-muted" />
                {{ filters.find((f) => f.value === activeFilter)?.label }}
              </span>
              <ChevronDownIcon class="w-3 h-3 text-plum-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="bg-white rounded-2xl border border-plum-faint shadow-[0_8px_40px_rgba(26,10,46,0.12)] p-1 min-w-[200px]"
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
              @click="handleFilterChange(filter.value)"
            >
              {{ filter.label }}
              <CheckIcon v-if="activeFilter === filter.value" class="w-4 h-4 text-mint" />
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Content Table -->
    <BaseCard class="overflow-hidden">
      <!-- Desktop Table -->
      <div class="hidden md:block">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-plum-faint bg-sand/20">
              <th
                class="px-6 py-4 font-body text-xs font-semibold uppercase tracking-wider text-plum-muted"
              >
                Date
              </th>
              <th
                class="px-6 py-4 font-body text-xs font-semibold uppercase tracking-wider text-plum-muted"
              >
                Queue Name
              </th>
              <th
                class="px-6 py-4 font-body text-xs font-semibold uppercase tracking-wider text-plum-muted"
              >
                Status
              </th>
              <th
                class="px-6 py-4 font-body text-xs font-semibold uppercase tracking-wider text-plum-muted"
              >
                Served
              </th>
              <th
                class="px-6 py-4 font-body text-xs font-semibold uppercase tracking-wider text-plum-muted text-right"
              >
                Avg. Wait
              </th>
              <th class="px-6 py-4" />
            </tr>
          </thead>
          <tbody class="divide-y divide-plum-faint">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="px-6 py-5"><div class="h-4 w-24 bg-plum-faint rounded" /></td>
                <td class="px-6 py-5"><div class="h-4 w-40 bg-plum-faint rounded" /></td>
                <td class="px-6 py-5"><div class="h-6 w-20 bg-plum-faint rounded-full" /></td>
                <td class="px-6 py-5"><div class="h-4 w-12 bg-plum-faint rounded" /></td>
                <td class="px-6 py-5 text-right">
                  <div class="h-4 w-12 bg-plum-faint rounded ml-auto" />
                </td>
                <td class="px-6 py-5" />
              </tr>
            </template>
            <template v-else-if="queues.length === 0">
              <tr>
                <td colspan="6" class="px-6 py-20 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-2xl bg-sand flex items-center justify-center">
                      <InboxIcon class="w-8 h-8 text-plum-muted" />
                    </div>
                    <p class="font-display font-bold text-xl text-plum">No history found</p>
                    <p class="font-body text-plum-muted max-w-xs">
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
              <td class="px-6 py-5">
                <span class="font-body text-sm text-plum">{{ queue.dateFormatted }}</span>
              </td>
              <td class="px-6 py-5">
                <span
                  class="font-body font-semibold text-sm text-plum group-hover:text-mint transition-colors"
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
                  class="w-4 h-4 text-plum-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
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
        <template v-else-if="queues.length === 0">
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
            <BaseBadge :variant="getStatusVariant(queue.status)">{{ queue.status }}</BaseBadge>
          </div>
          <h4 class="font-body font-semibold text-plum mb-3">{{ queue.name }}</h4>
          <div class="flex gap-6">
            <div>
              <p class="font-body text-[10px] uppercase tracking-wider text-plum-muted">Served</p>
              <p class="font-mono text-sm text-plum font-semibold">{{ queue.totalServed }}</p>
            </div>
            <div>
              <p class="font-body text-[10px] uppercase tracking-wider text-plum-muted">
                Avg. Wait
              </p>
              <p class="font-mono text-sm text-plum font-semibold">{{ queue.avgWait }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div
        class="p-4 bg-sand/10 border-t border-plum-faint flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="font-body text-xs text-plum-muted">
          Showing
          <span class="text-plum font-medium">{{
            totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0
          }}</span>
          to
          <span class="text-plum font-medium">{{ Math.min(currentPage * 10, totalCount) }}</span> of
          <span class="text-plum font-medium">{{ totalCount }}</span> queues
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
                'w-10 h-10 rounded-xl font-body text-sm font-semibold transition-all',
                page === currentPage
                  ? 'bg-plum text-sand'
                  : 'text-plum-muted hover:bg-white hover:border-plum hover:text-plum border border-transparent',
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <div class="sm:hidden px-4 font-body text-sm text-plum-muted">
            Page {{ currentPage }} of {{ totalPages }}
          </div>

          <button
            :disabled="currentPage === totalPages"
            class="w-10 h-10 rounded-xl flex items-center justify-center border border-plum-faint text-plum-muted disabled:opacity-30 hover:border-plum hover:text-plum transition-all bg-white"
            @click="goToPage(currentPage + 1)"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- Pro Nudge -->
    <div
      class="relative overflow-hidden rounded-[32px] bg-plum p-8 md:p-12 text-white border border-plum-soft"
    >
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-mint/10 blur-[100px] rounded-full -mr-32 -mt-32"
      />
      <div
        class="absolute bottom-0 left-0 w-64 h-64 bg-plum-soft blur-[100px] rounded-full -ml-32 -mb-32 opacity-50"
      />

      <div
        class="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
      >
        <div class="max-w-xl">
          <h3 class="font-display font-bold text-2xl md:text-3xl mb-4">
            Unlock 12-Month Analytics
          </h3>
          <p class="font-body text-plum-muted text-sm md:text-md leading-relaxed">
            On the free plan, you can only see the last 30 days of history. Upgrade to Pro to access
            your full session history and generate custom monthly reports.
          </p>
        </div>
        <BaseButton
          variant="primary"
          size="lg"
          class="bg-mint text-plum hover:bg-mint/90 whitespace-nowrap px-10"
        >
          Upgrade to Pro
        </BaseButton>
      </div>
    </div>
  </div>
</template>
