<script setup>
/**
 * @component HistoryDetailView
 * @description Queue history detail page showing stats, customer table,
 * and timeline. Two-column layout on desktop.
 */

// 1. Vue core imports
import { ref, onMounted } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables
import { useHistoryApi } from '../composables/useHistoryApi'

// 5. Component imports
import BaseButton from '@/components/base/BaseButton.vue'
import HistoryDetailHeader from '../components/HistoryDetailHeader.vue'
import HistoryStatCard from '../components/HistoryStatCard.vue'
import HistoryCustomerTable from '../components/HistoryCustomerTable.vue'
import HistoryQueueTimeline from '../components/HistoryQueueTimeline.vue'
import { AlertCircle } from 'lucide-vue-next'

// 6. Props
const props = defineProps({
  historyId: {
    type: String,
    default: '1',
  },
})

// 7. Emits
const emit = defineEmits(['go-back', 'export-csv', 'export-pdf'])

// 8. Composable destructuring
const { isLoading, error, fetchHistoryDetail, exportCsv, exportPdf } =
  useHistoryApi()

// 9. Reactive state
const detail = ref(null)
const isExportingCsv = ref(false)
const isExportingPdf = ref(false)

// 10. Computed properties

// 11. Methods
async function loadDetail() {
  detail.value = await fetchHistoryDetail(props.historyId)
}

async function handleExportCsv() {
  isExportingCsv.value = true
  await exportCsv(props.historyId)
  isExportingCsv.value = false
}

async function handleExportPdf() {
  isExportingPdf.value = true
  await exportPdf(props.historyId)
  isExportingPdf.value = false
}

function retry() {
  loadDetail()
}

// 12. Lifecycle hooks
onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Error state -->
    <div
      v-if="error && !isLoading"
      class="flex flex-col items-center justify-center py-12 gap-3"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2]"
      >
        <AlertCircle class="h-6 w-6 text-danger" />
      </div>
      <p class="font-display text-lg font-bold text-plum">
        Something went wrong
      </p>
      <p class="font-body text-sm text-plum-muted">{{ error }}</p>
      <BaseButton variant="ghost" size="sm" @click="retry">
        Try again
      </BaseButton>
    </div>

    <template v-else>
      <!-- Loading skeleton -->
      <template v-if="isLoading">
        <div class="h-20 rounded-2xl bg-plum-faint animate-pulse" />
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <div
            v-for="i in 4"
            :key="i"
            class="h-20 rounded-2xl bg-plum-faint animate-pulse"
          />
        </div>
        <div class="flex flex-col gap-6 md:flex-row">
          <div class="h-96 rounded-2xl bg-plum-faint animate-pulse md:flex-[1.4]" />
          <div class="h-96 rounded-2xl bg-plum-faint animate-pulse md:flex-1" />
        </div>
      </template>

      <!-- Content -->
      <template v-if="!isLoading && detail">
        <!-- Header -->
        <HistoryDetailHeader
          :queue-name="detail.queueName"
          :date="detail.date"
          :time-range="detail.timeRange"
          :status="detail.status"
          :is-exporting-csv="isExportingCsv"
          :is-exporting-pdf="isExportingPdf"
          @go-back="emit('go-back')"
          @export-csv="handleExportCsv"
          @export-pdf="handleExportPdf"
        />

        <!-- Stats Row -->
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <HistoryStatCard
            :value="String(detail.stats.served)"
            label="Served"
            accent="mint"
          />
          <HistoryStatCard
            :value="detail.stats.avgWait"
            label="Avg Wait"
          />
          <HistoryStatCard
            :value="String(detail.stats.peakConcurrent)"
            label="Peak Concurrent"
          />
          <HistoryStatCard
            :value="String(detail.stats.droppedNoShow)"
            label="Skipped / No-show"
            accent="warning"
          />
        </div>

        <!-- Two Column: Table + Timeline -->
        <div class="flex flex-col gap-6 md:flex-row">
          <!-- Customer Table (wider) -->
          <div class="md:flex-[1.4] md:min-w-0">
            <HistoryCustomerTable
              :entries="detail.entries"
              :is-loading="false"
              :total-count="detail.totalCount"
            />
          </div>

          <!-- Timeline (narrower) -->
          <div class="md:flex-1 md:min-w-0">
            <HistoryQueueTimeline :events="detail.timeline" />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
