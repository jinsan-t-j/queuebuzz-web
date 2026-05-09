<script setup lang="ts">
import { onMounted, watch, ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useHistory } from '../composables/useHistory'
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  X as XIcon,
} from 'lucide-vue-next'

import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import HistoryStatsOverview from '../components/HistoryStatsOverview.vue'
import HistoryListTable from '../components/HistoryListTable.vue'
import { fetchSubscription, type Subscription } from '../../billing/actions/billing.actions'

const HistoryUpgradeBanner = defineAsyncComponent(
  () => import('../components/HistoryUpgradeBanner.vue'),
)

const HistoryDeleteConfirmModal = defineAsyncComponent(
  () => import('../components/HistoryDeleteConfirmModal.vue'),
)

const HistoryBulkActionBar = defineAsyncComponent(
  () => import('../components/HistoryBulkActionBar.vue'),
)

const HistoryFilterDropdown = defineAsyncComponent(
  () => import('../components/HistoryFilterDropdown.vue'),
)

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
  deleteHistoryItem,
  deleteHistoryItems,
} = useHistory()

// Local UI State
const isExporting = ref(false)
const subscription = ref<Subscription | null>(null)
const selectedIds = ref<string[]>([])

// Deletion State
const isDeleteModalOpen = ref(false)
const isBulkDelete = ref(false)
const targetId = ref<string | null>(null)

const filters = [
  { value: 'all', label: 'All queues' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
]

onMounted(async () => {
  fetchHistory()
  subscription.value = await fetchSubscription()
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

// Deletion logic
function openDeleteModal(bulk = false, id: string | null = null) {
  isBulkDelete.value = bulk
  targetId.value = id
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  let success = false
  if (isBulkDelete.value) {
    success = await deleteHistoryItems(selectedIds.value)
    if (success) selectedIds.value = []
  } else if (targetId.value) {
    success = await deleteHistoryItem(targetId.value)
  }

  if (success) {
    isDeleteModalOpen.value = false
    targetId.value = null
  }
}
</script>

<template>
  <div class="px-4 sm:px-6 md:px-8 space-y-6 md:space-y-8 pb-12 relative">
    <!-- Pro Banner -->
    <HistoryUpgradeBanner />

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="font-display font-black text-3xl sm:text-4xl text-plum tracking-tight">
          Queue History
        </h1>
        <p class="font-body text-plum-muted text-sm font-medium">
          Monitor and export your past queue performance
        </p>
      </div>

      <BaseButton
        v-if="subscription?.canExportData"
        variant="ghost"
        :loading="isExporting"
        class="h-11 font-black w-full md:w-auto"
        @click="downloadCsv"
      >
        <DownloadIcon class="w-4 h-4 mr-2" />
        Export All Data
      </BaseButton>
    </div>

    <!-- Stats -->
    <HistoryStatsOverview :summary="summary" :is-loading="isLoading" />

    <!-- Main List Section -->
    <BaseCard
      class="overflow-hidden border border-plum-faint shadow-none bg-white rounded-[2rem] sm:rounded-3xl"
    >
      <!-- Toolbar -->
      <div
        class="flex flex-col lg:flex-row items-center justify-between gap-3 p-3.5 sm:p-5 border-b border-plum-faint bg-sand"
      >
        <!-- Search -->
        <div class="relative w-full lg:w-[400px]">
          <SearchIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-muted pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by queue name..."
            class="w-full h-12 bg-white border border-plum-faint rounded-2xl pl-11 pr-10 font-body text-sm text-plum placeholder:text-plum-muted focus:border-plum transition-all outline-none shadow-none"
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
        <HistoryFilterDropdown
          :active-filter="activeFilter"
          :filters="filters"
          @select="selectFilter"
        />
      </div>

      <!-- Table Section -->
      <HistoryListTable
        v-model:selected-ids="selectedIds"
        :items="queues"
        :is-loading="isLoading"
        :can-view-detail="subscription?.canViewHistory ?? false"
        @view-detail="viewDetail"
        @delete-single="openDeleteModal(false, $event)"
      />

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="p-4 sm:p-5 bg-white border-t border-plum-faint flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
      >
        <div class="font-body text-sm text-plum-muted text-center sm:text-left">
          Showing
          <span class="text-plum font-black tracking-tight px-0.5">{{
            totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0
          }}</span>
          to
          <span class="text-plum font-black tracking-tight px-0.5">{{
            Math.min(currentPage * 10, totalCount)
          }}</span>
          of
          <span class="text-plum font-black tracking-tight px-0.5">{{ totalCount }}</span> entries
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
                  ? 'bg-plum text-sand border-plum'
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

    <!-- Bulk Action Bar -->
    <HistoryBulkActionBar
      :selected-count="selectedIds.length"
      @deselect="selectedIds = []"
      @delete="openDeleteModal(true)"
    />

    <!-- Confirmation Modal -->
    <HistoryDeleteConfirmModal
      :is-open="isDeleteModalOpen"
      :is-bulk-delete="isBulkDelete"
      :is-loading="isLoading"
      :selected-count="selectedIds.length"
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
