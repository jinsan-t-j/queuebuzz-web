<script setup lang="ts">
/**
 * @component HistoryListTable
 * @description Renders the history list in both desktop table and mobile card formats.
 */
import { ArrowRight as ArrowRightIcon, Inbox as InboxIcon } from 'lucide-vue-next'
import BaseBadge from '@/components/base/BaseBadge.vue'
import type { QueueHistoryItem } from '../types'

defineProps({
  items: {
    type: Array as () => QueueHistoryItem[],
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view-detail'])

function getStatusVariant(status?: string): 'mint' | 'warning' | 'danger' | 'muted' {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'closed':
      return 'mint'
    case 'active':
      return 'mint'
    case 'paused':
      return 'warning'
    case 'terminated':
    case 'expired':
      return 'danger'
    default:
      return 'muted'
  }
}

function formatStatus(status?: string) {
  if (!status) return ''
  const s = status.toLowerCase()
  if (s === 'closed') return 'Completed'
  if (s === 'expired') return 'Expired'
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<template>
  <div class="relative min-h-[200px] max-h-[400px] overflow-y-auto">
    <!-- Desktop Table -->
    <div class="hidden md:block">
      <table class="w-full text-left border-separate border-spacing-0">
        <thead class="sticky top-0 z-10 bg-white">
          <tr class="border-b border-plum-faint bg-sand/20 shadow-[0_1px_0_0_rgba(232,226,240,1)]">
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
            <th class="px-6 py-4 w-12" />
          </tr>
        </thead>
        <tbody class="divide-y divide-plum-faint">
          <!-- Loading State -->
          <template v-if="isLoading">
            <tr v-for="i in 10" :key="i" class="animate-pulse">
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

          <!-- Empty State -->
          <tr v-else-if="items.length === 0">
            <td colspan="6" class="px-6 py-24 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center">
                  <InboxIcon class="w-8 h-8 text-plum-muted/30" />
                </div>
                <p class="font-display font-bold text-xl text-plum">No history found</p>
                <p class="font-body text-sm text-plum-muted max-w-xs mx-auto">
                  We couldn't find any queues matching your current search or filters.
                </p>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-for="queue in items"
            v-else
            :key="queue.id"
            class="group hover:bg-sand/30 transition-colors cursor-pointer"
            @click="emit('view-detail', queue.id)"
          >
            <td class="px-6 py-5 whitespace-nowrap">
              <span class="font-body text-sm text-plum">{{ queue.dateFormatted }}</span>
            </td>
            <td class="px-6 py-5">
              <span class="font-body font-semibold text-sm text-plum">{{ queue.name }}</span>
            </td>
            <td class="px-6 py-5">
              <BaseBadge :variant="getStatusVariant(queue.status)">
                {{ formatStatus(queue.status) }}
              </BaseBadge>
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
      <!-- Loading -->
      <template v-if="isLoading">
        <div v-for="i in 5" :key="i" class="p-6 space-y-4 animate-pulse">
          <div class="flex justify-between items-center">
            <div class="h-4 w-24 bg-plum-faint rounded" />
            <div class="h-6 w-20 bg-plum-faint rounded-full" />
          </div>
          <div class="h-5 w-48 bg-plum-faint rounded" />
          <div class="flex gap-6">
            <div class="h-8 w-16 bg-plum-faint rounded" />
            <div class="h-8 w-16 bg-plum-faint rounded" />
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="items.length === 0" class="p-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center">
            <InboxIcon class="w-8 h-8 text-plum-muted/30" />
          </div>
          <p class="font-display font-bold text-lg text-plum">No history found</p>
        </div>
      </div>

      <!-- Rows -->
      <div
        v-for="queue in items"
        v-else
        :key="queue.id"
        class="p-6 active:bg-sand/30 transition-colors"
        @click="emit('view-detail', queue.id)"
      >
        <div class="flex justify-between items-start mb-2">
          <span class="font-body text-xs text-plum-muted">{{ queue.dateFormatted }}</span>
          <BaseBadge :variant="getStatusVariant(queue.status)" size="sm">
            {{ formatStatus(queue.status) }}
          </BaseBadge>
        </div>
        <h4 class="font-body font-semibold text-plum mb-4">{{ queue.name }}</h4>
        <div class="flex gap-8">
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
  </div>
</template>
