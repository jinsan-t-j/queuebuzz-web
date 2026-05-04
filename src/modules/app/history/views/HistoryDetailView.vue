<script setup lang="ts">
/**
 * @view HistoryDetailView
 * @description Detailed audit of a past queue session featuring rich timelines and performance insights.
 */
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHistory } from '../composables/useHistory'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import HistoryDetailTimeline from '../components/HistoryDetailTimeline.vue'
import {
  ArrowLeft as ArrowLeftIcon,
  Download as DownloadIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Search as SearchIcon,
  BookOpenIcon,
  SparklesIcon,
  QuoteIcon,
} from 'lucide-vue-next'
import type { HistoryDetail } from '../types'

const route = useRoute()
const router = useRouter()
const { isLoading, fetchHistoryDetail } = useHistory()

// State
const queueDetail = ref<HistoryDetail | null>(null)
const searchQuery = ref('')
const isExporting = ref(false)

async function loadDetail() {
  queueDetail.value = (await fetchHistoryDetail(route.params.id as string)) as HistoryDetail
}

const filteredEntries = computed(() => {
  if (!queueDetail.value?.entries) return []
  if (!searchQuery.value) return queueDetail.value.entries
  const q = searchQuery.value.toLowerCase()
  return queueDetail.value.entries.filter(
    (e) => e.displayName.toLowerCase().includes(q) || e.ticketNo.toLowerCase().includes(q),
  )
})

onBeforeMount(loadDetail)

function goBack() {
  router.push({ name: 'queue-history' })
}

function downloadCsv() {
  if (!queueDetail.value?.entries) return
  isExporting.value = true
  const headers = ['Ticket', 'Name', 'Status', 'Wait (min)', 'Served At']
  const csvRows = [
    headers.join(','),
    ...queueDetail.value.entries.map((c) =>
      [c.ticketNo, c.displayName, c.status, c.waitTimeMin, c.servedAt]
        .map((v) => `"${v || '---'}"`)
        .join(','),
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

function getStatusVariant(status: string) {
  if (!status) return 'warning'
  switch (status.toLowerCase()) {
    case 'served':
      return 'mint'
    case 'skipped':
    case 'left':
      return 'danger'
    default:
      return 'warning'
  }
}

function getQueueStatusVariant(status: string): 'mint' | 'warning' | 'danger' | 'muted' {
  switch (status?.toLowerCase()) {
    case 'closed':
    case 'completed':
      return 'mint'
    case 'expired':
      return 'danger'
    default:
      return 'muted'
  }
}

function formatStatus(status: string) {
  if (!status) return ''
  const s = status.toLowerCase()
  if (s === 'closed') return 'Completed'
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<template>
  <div class="px-6 md:px-8 space-y-8 min-h-screen pb-12 bg-sand">
    <!-- Navigation -->
    <div class="flex items-center gap-4">
      <BaseButton variant="ghost" size="sm" class="rounded-xl font-black" @click="goBack">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Back to History
      </BaseButton>
    </div>

    <!-- Header Section -->
    <div v-if="queueDetail" class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <h1 class="font-display font-black text-3xl text-plum tracking-tight">
            {{ queueDetail.queueName }}
          </h1>
          <BaseBadge :variant="getQueueStatusVariant(queueDetail.status)" class="font-black">{{
            formatStatus(queueDetail.status)
          }}</BaseBadge>
        </div>
        <p class="font-body text-plum-muted flex items-center gap-2 font-medium">
          <ClockIcon class="w-4 h-4" />
          {{ queueDetail.date }}
          <template v-if="queueDetail?.closedAt">
            • Closed at
            {{
              new Date(queueDetail.closedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </template>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton variant="ghost" :loading="isExporting" class="font-black" @click="downloadCsv">
          <DownloadIcon class="w-4 h-4 mr-2" />
          Export Session Data
        </BaseButton>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Column: Stats & Entries (8 cols) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Session Stats Grid -->
        <div v-if="queueDetail?.stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BaseCard class="p-5 border border-plum-faint shadow-none bg-white">
            <p
              class="font-body text-[10px] uppercase font-black tracking-widest text-plum-muted mb-1"
            >
              Bookings
            </p>
            <div class="flex items-end gap-2">
              <span class="font-mono text-2xl font-black text-plum">{{
                queueDetail.stats.totalBookings || 0
              }}</span>
              <UsersIcon class="w-4 h-4 text-plum-faint mb-1" />
            </div>
          </BaseCard>

          <BaseCard class="p-5 border border-plum-faint shadow-none bg-white">
            <p
              class="font-body text-[10px] uppercase font-black tracking-widest text-plum-muted mb-1"
            >
              Served
            </p>
            <div class="flex items-end gap-2">
              <span class="font-mono text-2xl font-black text-plum">{{
                queueDetail.stats.totalServed || 0
              }}</span>
              <CheckCircleIcon class="w-4 h-4 text-mint mb-1" />
            </div>
          </BaseCard>

          <BaseCard class="p-5 border border-plum-faint shadow-none bg-white">
            <p
              class="font-body text-[10px] uppercase font-black tracking-widest text-plum-muted mb-1"
            >
              Drops
            </p>
            <div class="flex items-end gap-2">
              <span class="font-mono text-2xl font-black text-plum">{{
                queueDetail.stats.totalSkipped || 0
              }}</span>
              <XCircleIcon class="w-4 h-4 text-danger mb-1" />
            </div>
          </BaseCard>

          <BaseCard class="p-5 border border-plum-faint shadow-none bg-white">
            <p
              class="font-body text-[10px] uppercase font-black tracking-widest text-plum-muted mb-1"
            >
              Avg Wait
            </p>
            <div class="flex items-end gap-2">
              <span class="font-mono text-2xl font-black text-plum">{{
                queueDetail.stats.avgWaitTime || '0m'
              }}</span>
              <ClockIcon class="w-4 h-4 text-plum-muted mb-1" />
            </div>
          </BaseCard>
        </div>

        <!-- Loading Stats -->
        <div v-else-if="isLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="h-20 bg-sand animate-pulse rounded-2xl border border-plum-faint"
          />
        </div>

        <!-- Customer List -->
        <div class="space-y-4">
          <div class="flex items-center justify-between px-1">
            <h2 class="font-display font-black text-xl text-plum tracking-tight">
              Customer Entries
            </h2>
            <div class="relative">
              <SearchIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-muted pointer-events-none"
              />
              <input
                v-model="searchQuery"
                placeholder="Search ticket or name..."
                class="h-9 w-48 bg-white border border-plum-faint rounded-xl pl-9 pr-4 font-body text-xs text-plum focus:border-plum transition-all outline-none"
              />
            </div>
          </div>

          <BaseCard class="overflow-hidden border border-plum-faint shadow-none bg-white">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr class="bg-sand border-b border-plum-faint">
                    <th
                      class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
                    >
                      Ticket
                    </th>
                    <th
                      class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
                    >
                      Name
                    </th>
                    <th
                      class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
                    >
                      Status
                    </th>
                    <th
                      class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
                    >
                      Wait Time
                    </th>
                    <th
                      class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
                    >
                      Served At
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-plum-faint">
                  <template v-if="isLoading">
                    <tr v-for="i in 5" :key="i" class="animate-pulse">
                      <td v-for="j in 5" :key="j" class="px-6 py-4">
                        <div class="h-4 bg-sand rounded w-full" />
                      </td>
                    </tr>
                  </template>
                  <template v-else-if="filteredEntries.length > 0">
                    <tr
                      v-for="entry in filteredEntries"
                      :key="entry.ticketNo"
                      class="hover:bg-sand transition-colors border-b border-plum-faint/50"
                    >
                      <td class="px-6 py-4 font-mono text-sm text-plum font-black">
                        {{ entry.ticketNo }}
                      </td>
                      <td class="px-6 py-4 font-body text-sm text-plum font-black">
                        {{ entry.displayName }}
                      </td>
                      <td class="px-6 py-4">
                        <BaseBadge :variant="getStatusVariant(entry.status)" class="font-black"
                          >{{ formatStatus(entry.status) }}
                        </BaseBadge>
                      </td>
                      <td class="px-6 py-4 font-mono text-xs text-plum font-black">
                        {{ entry.waitTimeMin ? `${entry.waitTimeMin}m` : '---' }}
                      </td>
                      <td class="px-6 py-4 font-body text-xs text-plum font-black">
                        {{
                          entry.servedAt
                            ? new Date(entry.servedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '---'
                        }}
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td
                      colspan="5"
                      class="px-6 py-12 text-center text-plum-muted font-body text-sm italic font-medium"
                    >
                      No entries match your search.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Right Column: Timeline & Insights (4 cols) -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Private Notes (If any) -->
        <BaseCard
          v-if="queueDetail?.notes"
          class="p-6 bg-white border border-plum-faint shadow-none relative"
        >
          <QuoteIcon class="absolute top-4 right-4 w-12 h-12 text-plum-faint/40 rotate-180" />
          <div class="flex items-center gap-2 mb-4">
            <BookOpenIcon class="w-4 h-4 text-plum" />
            <h3 class="font-display font-black text-plum tracking-tight">Session Notes</h3>
          </div>
          <p class="font-body text-sm text-plum font-medium leading-relaxed relative z-10">
            "{{ queueDetail.notes }}"
          </p>
        </BaseCard>

        <!-- Insights -->
        <BaseCard class="p-6 bg-mint-light/10 border border-mint/20 shadow-none">
          <div class="flex items-center gap-2 mb-4">
            <SparklesIcon class="w-4 h-4 text-mint" />
            <h3 class="font-display font-black text-plum tracking-tight">Session Insights</h3>
          </div>
          <ul v-if="queueDetail?.insights?.length" class="space-y-3">
            <li v-for="(insight, i) in queueDetail.insights" :key="i" class="flex gap-3">
              <span class="w-1.5 h-1.5 rounded-full bg-mint mt-1.5 flex-shrink-0" />
              <span class="font-body text-sm text-plum font-black">{{ insight }}</span>
            </li>
          </ul>
          <div v-else class="py-2">
            <p class="font-body text-xs text-plum-muted italic font-medium">
              No specific insights generated for this session.
            </p>
          </div>
        </BaseCard>

        <!-- Timeline -->
        <div class="space-y-4">
          <h3 class="font-display font-black text-xl text-plum px-1 tracking-tight">
            Session Timeline
          </h3>
          <BaseCard
            class="p-6 bg-white border border-plum-faint shadow-none min-h-[200px] flex flex-col justify-center"
          >
            <HistoryDetailTimeline :events="queueDetail?.timeline || []" />
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>
