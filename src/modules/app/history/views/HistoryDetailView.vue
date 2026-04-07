<script setup>
/**
 * @view HistoryDetailView
 * @description Detailed view of a past queue session with the full list of served customers.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryApi } from '../composables/useHistoryApi'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import {
  ArrowLeft as ArrowLeftIcon,
  Download as DownloadIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  MoreVertical as MoreVerticalIcon,
} from 'lucide-vue-next'

const props = defineProps({
  historyId: { type: String, required: true },
})

const router = useRouter()
const { isLoading, fetchHistoryDetail } = useHistoryApi()

// State
const queueDetail = ref(null)
const searchQuery = ref('')
const isExporting = ref(false)

async function loadDetail() {
  queueDetail.value = await fetchHistoryDetail(props.historyId)
}

onMounted(loadDetail)

function goBack() {
  router.push({ name: 'queue-history' })
}

function downloadCsv() {
  if (!queueDetail.value) return
  isExporting.value = true
  const headers = ['Ticket', 'Name', 'Status', 'Wait Time', 'Joined', 'Served']
  const csvRows = [
    headers.join(','),
    ...queueDetail.value.entries.map((c) =>
      [c.ticket, c.name, c.status, c.waited, c.joined, c.servedAt].map((v) => `"${v}"`).join(','),
    ),
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `queue-${queueDetail.value.queueName}-report.csv`
  a.click()
  URL.revokeObjectURL(url)
  setTimeout(() => {
    isExporting.value = false
  }, 500)
}

function getStatusVariant(status) {
  switch (status.toLowerCase()) {
    case 'served':
      return 'success'
    case 'skipped':
      return 'danger'
    case 'removed':
      return 'secondary'
    default:
      return 'warning'
  }
}
</script>

<template>
  <div class="p-6 md:p-8 space-y-8 bg-sand min-h-screen">
    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-4">
      <BaseButton variant="ghost" size="sm" class="rounded-xl" @click="goBack">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Back to History
      </BaseButton>
    </div>

    <!-- Header Section -->
    <div v-if="queueDetail" class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <h1 class="font-display font-bold text-3xl text-plum">{{ queueDetail.queueName }}</h1>
          <BaseBadge variant="success">{{ queueDetail.status }}</BaseBadge>
        </div>
        <p class="font-body text-plum-muted flex items-center gap-2">
          <ClockIcon class="w-4 h-4" />
          {{ queueDetail.date }} • {{ queueDetail.timeRange }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton variant="ghost" :loading="isExporting" @click="downloadCsv">
          <DownloadIcon class="w-4 h-4 mr-2" />
          Export Session Data
        </BaseButton>
      </div>
    </div>

    <!-- Quick Stats -->
    <div v-if="queueDetail" class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <BaseCard class="p-5 border-l-4 border-l-plum">
        <p class="font-body text-[10px] uppercase font-bold tracking-widest text-plum-muted mb-1">
          Total Bookings
        </p>
        <div class="flex items-end gap-2">
          <span class="font-mono text-3xl font-bold text-plum">{{ queueDetail.totalCount }}</span>
          <UsersIcon class="w-5 h-5 text-plum-faint mb-1.5" />
        </div>
      </BaseCard>

      <BaseCard class="p-5 border-l-4 border-l-mint">
        <p class="font-body text-[10px] uppercase font-bold tracking-widest text-plum-muted mb-1">
          Served
        </p>
        <div class="flex items-end gap-2">
          <span class="font-mono text-3xl font-bold text-plum">{{ queueDetail.stats.served }}</span>
          <CheckCircleIcon class="w-5 h-5 text-mint mb-1.5" />
        </div>
      </BaseCard>

      <BaseCard class="p-5 border-l-4 border-l-danger">
        <p class="font-body text-[10px] uppercase font-bold tracking-widest text-plum-muted mb-1">
          Skipped / Drops
        </p>
        <div class="flex items-end gap-2">
          <span class="font-mono text-3xl font-bold text-plum">{{
            queueDetail.stats.droppedNoShow
          }}</span>
          <XCircleIcon class="w-5 h-5 text-danger mb-1.5" />
        </div>
      </BaseCard>

      <BaseCard class="p-5 border-l-4 border-l-plum-soft">
        <p class="font-body text-[10px] uppercase font-bold tracking-widest text-plum-muted mb-1">
          Avg. Wait Time
        </p>
        <div class="flex items-end gap-2">
          <span class="font-mono text-3xl font-bold text-plum">{{
            queueDetail.stats.avgWait
          }}</span>
          <ClockIcon class="w-5 h-5 text-plum-muted mb-1.5" />
        </div>
      </BaseCard>
    </div>

    <!-- Served List Table -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-display font-bold text-xl text-plum">Customer List</h2>
        <div class="flex items-center gap-3">
          <div class="relative hidden md:block">
            <SearchIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-muted pointer-events-none"
            />
            <input
              v-model="searchQuery"
              placeholder="Search customers..."
              class="h-10 w-64 bg-white border border-plum-faint rounded-xl pl-9 pr-4 font-body text-sm text-plum focus:border-plum focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <BaseCard class="overflow-hidden border-plum-faint shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-sand/30 border-b border-plum-faint">
                <th
                  class="px-6 py-4 font-body text-xs font-bold uppercase tracking-wider text-plum-muted"
                >
                  Ticket
                </th>
                <th
                  class="px-6 py-4 font-body text-xs font-bold uppercase tracking-wider text-plum-muted"
                >
                  Customer Name
                </th>
                <th
                  class="px-6 py-4 font-body text-xs font-bold uppercase tracking-wider text-plum-muted"
                >
                  Status
                </th>
                <th
                  class="px-6 py-4 font-body text-xs font-bold uppercase tracking-wider text-plum-muted"
                >
                  Joined At
                </th>
                <th
                  class="px-6 py-4 font-body text-xs font-bold uppercase tracking-wider text-plum-muted"
                >
                  Wait Time
                </th>
                <th class="px-6 py-4" />
              </tr>
            </thead>
            <tbody class="divide-y divide-plum-faint">
              <template v-if="isLoading">
                <tr v-for="i in 8" :key="i" class="animate-pulse">
                  <td class="px-6 py-5"><div class="h-4 w-12 bg-plum-faint rounded" /></td>
                  <td class="px-6 py-5"><div class="h-4 w-40 bg-plum-faint rounded" /></td>
                  <td class="px-6 py-5"><div class="h-6 w-20 bg-plum-faint rounded-full" /></td>
                  <td class="px-6 py-5"><div class="h-4 w-20 bg-plum-faint rounded" /></td>
                  <td class="px-6 py-5"><div class="h-4 w-16 bg-plum-faint rounded" /></td>
                  <td class="px-6 py-5" />
                </tr>
              </template>
              <tr
                v-for="customer in queueDetail.entries"
                v-else
                :key="customer.id"
                class="hover:bg-sand/20 transition-colors"
              >
                <td class="px-6 py-5 font-mono text-sm text-plum font-semibold">
                  {{ customer.ticket }}
                </td>
                <td class="px-6 py-5 font-body text-sm text-plum">{{ customer.name }}</td>
                <td class="px-6 py-5">
                  <BaseBadge :variant="getStatusVariant(customer.status)">{{
                    customer.status
                  }}</BaseBadge>
                </td>
                <td class="px-6 py-5 font-body text-sm text-plum-muted">{{ customer.joined }}</td>
                <td class="px-6 py-5 font-mono text-sm text-plum">{{ customer.waited }}</td>
                <td class="px-6 py-5 text-right">
                  <button
                    class="p-2 text-plum-muted hover:text-plum transition-colors rounded-lg hover:bg-sand"
                  >
                    <MoreVerticalIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Local Pagination Footer (Mock) -->
        <div
          class="px-6 py-4 border-t border-plum-faint bg-sand/5 flex items-center justify-between"
        >
          <p class="font-body text-xs text-plum-muted">
            Showing {{ queueDetail?.entries.length || 0 }} customers from this session
          </p>
          <div class="flex items-center gap-2">
            <button
              disabled
              class="w-9 h-9 flex items-center justify-center rounded-xl border border-plum-faint text-plum-muted opacity-30"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <button
              disabled
              class="w-9 h-9 flex items-center justify-center rounded-xl border border-plum-faint text-plum-muted opacity-30"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Feedback / Notes Card -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <BaseCard class="p-6">
        <h3 class="font-display font-bold text-lg text-plum mb-4">Session Notes</h3>
        <p class="font-body text-sm text-plum-muted leading-relaxed">
          {{
            queueDetail?.notes ||
            'No notes were added for this session. You can add notes during the live queue to help with future reporting.'
          }}
        </p>
      </BaseCard>

      <BaseCard class="p-6 bg-mint-light/30 border-dashed border-2 border-mint/50">
        <h3 class="font-display font-bold text-lg text-plum mb-4">Performance Insights</h3>
        <ul class="space-y-3">
          <li class="flex items-start gap-3">
            <div
              class="w-5 h-5 rounded-full bg-mint flex items-center justify-center mt-0.5 shrink-0"
            >
              <CheckCircleIcon class="w-3 h-3 text-plum" />
            </div>
            <p class="font-body text-sm text-plum">
              Your served rate was 15% higher than previous Monday session.
            </p>
          </li>
          <li class="flex items-start gap-3">
            <div
              class="w-5 h-5 rounded-full bg-mint flex items-center justify-center mt-0.5 shrink-0"
            >
              <CheckCircleIcon class="w-3 h-3 text-plum" />
            </div>
            <p class="font-body text-sm text-plum">
              Peak rush occurred between 11:30 AM and 12:15 PM.
            </p>
          </li>
        </ul>
      </BaseCard>
    </div>
  </div>
</template>
