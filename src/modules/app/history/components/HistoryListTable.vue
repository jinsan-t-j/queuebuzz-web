<script setup lang="ts">
/**
 * @component HistoryListTable
 * @description Renders the history list with selection and deletion support.
 */
import { computed } from 'vue'
import {
  ArrowRight as ArrowRightIcon,
  Inbox as InboxIcon,
  Trash2 as TrashIcon,
  Check as CheckIcon,
} from 'lucide-vue-next'
import BaseBadge from '@/components/base/BaseBadge.vue'
import type { QueueHistoryItem } from '../types'

const props = defineProps({
  items: {
    type: Array as () => QueueHistoryItem[],
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  selectedIds: {
    type: Array as () => string[],
    default: () => [],
  },
  canViewDetail: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['view-detail', 'update:selectedIds', 'delete-single'])

const isAllSelected = computed({
  get: () => props.items.length > 0 && props.selectedIds.length === props.items.length,
  set: (val) => {
    if (val) {
      emit(
        'update:selectedIds',
        props.items.map((i) => i.id),
      )
    } else {
      emit('update:selectedIds', [])
    }
  },
})

function toggleSelection(id: string) {
  const newSelection = [...props.selectedIds]
  const idx = newSelection.indexOf(id)
  if (idx === -1) {
    newSelection.push(id)
  } else {
    newSelection.splice(idx, 1)
  }
  emit('update:selectedIds', newSelection)
}

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
  <div class="relative min-h-[200px] max-h-[600px] overflow-y-auto scrollbar-hidden">
    <!-- Desktop Table -->
    <div class="hidden sm:block overflow-x-auto scrollbar-hidden">
      <table class="w-full text-left border-separate border-spacing-0 min-w-[700px]">
        <thead class="sticky top-0 z-10 bg-white border-b border-plum-faint">
          <tr class="bg-sand/50 border-b border-plum-faint">
            <th class="px-6 py-4 w-10">
              <button
                type="button"
                aria-label="Select all queues"
                class="w-5 h-5 rounded-md border border-plum-faint flex items-center justify-center transition-all bg-white"
                :class="{ 'bg-mint border-mint': isAllSelected }"
                @click="isAllSelected = !isAllSelected"
              >
                <CheckIcon v-if="isAllSelected" class="w-3.5 h-3.5 text-plum stroke-[3]" />
              </button>
            </th>
            <th
              class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
            >
              Date
            </th>
            <th
              class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
            >
              Queue Name
            </th>
            <th
              class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
            >
              Status
            </th>
            <th
              class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted"
            >
              Served
            </th>
            <th
              class="px-6 py-4 font-body text-[11px] font-black uppercase tracking-wider text-plum-muted text-right"
            >
              Avg. Wait
            </th>
            <th class="px-6 py-4 w-24" />
          </tr>
        </thead>
        <tbody class="divide-y divide-plum-faint">
          <!-- Loading State -->
          <template v-if="isLoading">
            <tr v-for="i in 10" :key="i" class="animate-pulse">
              <td class="px-6 py-5">
                <div class="h-4 w-4 bg-sand rounded" />
              </td>
              <td class="px-6 py-5">
                <div class="h-4 w-24 bg-sand rounded" />
              </td>
              <td class="px-6 py-5">
                <div class="h-4 w-40 bg-sand rounded" />
              </td>
              <td class="px-6 py-5">
                <div class="h-6 w-20 bg-sand rounded-full" />
              </td>
              <td class="px-6 py-5">
                <div class="h-4 w-12 bg-sand rounded" />
              </td>
              <td class="px-6 py-5 text-right">
                <div class="h-4 w-12 bg-sand rounded ml-auto" />
              </td>
              <td class="px-6 py-5" />
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-else-if="items.length === 0">
            <td colspan="7" class="px-6 py-24 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center">
                  <InboxIcon class="w-8 h-8 text-plum-muted/30" />
                </div>
                <p class="font-display font-black text-xl text-plum">No history found</p>
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
            class="group transition-colors border-b border-plum-faint"
            :class="[
              selectedIds.includes(queue.id) ? 'bg-mint-light/30' : '',
              canViewDetail ? 'hover:bg-sand cursor-pointer' : 'cursor-default opacity-80',
            ]"
            @click="canViewDetail && emit('view-detail', queue.id)"
          >
            <td class="px-6 py-4">
              <button
                type="button"
                :aria-label="`Select queue ${queue.name}`"
                class="w-5 h-5 rounded-md border border-plum-faint flex items-center justify-center transition-all bg-white"
                :class="{ 'bg-mint border-mint': selectedIds.includes(queue.id) }"
                @click.stop="toggleSelection(queue.id)"
              >
                <CheckIcon
                  v-if="selectedIds.includes(queue.id)"
                  class="w-3.5 h-3.5 text-plum stroke-[3]"
                />
              </button>
            </td>
            <td class="px-6 py-5 whitespace-nowrap">
              <span class="font-body text-sm text-plum font-black">{{ queue.dateFormatted }}</span>
            </td>
            <td class="px-6 py-5">
              <span class="font-body font-black text-sm text-plum">{{ queue.name }}</span>
            </td>
            <td class="px-6 py-5">
              <BaseBadge :variant="getStatusVariant(queue.status)" class="font-black">
                {{ formatStatus(queue.status) }}
              </BaseBadge>
            </td>
            <td class="px-6 py-5">
              <span class="font-mono text-sm text-plum font-black">{{ queue.totalServed }}</span>
            </td>
            <td class="px-6 py-5 text-right">
              <span class="font-mono text-sm text-plum font-black">{{ queue.avgWait }}</span>
            </td>
            <td class="px-6 py-5 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="p-2 rounded-xl text-plum-muted hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete entry"
                  :aria-label="`Delete queue ${queue.name}`"
                  @click.stop="emit('delete-single', queue.id)"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
                <ArrowRightIcon
                  v-if="canViewDetail"
                  class="w-4 h-4 text-plum-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile List -->
    <div class="sm:hidden divide-y divide-plum-faint">
      <!-- Loading -->
      <template v-if="isLoading">
        <div v-for="i in 5" :key="i" class="p-5 space-y-4 animate-pulse">
          <div class="flex justify-between items-center">
            <div class="h-4 w-24 bg-sand rounded" />
            <div class="h-6 w-20 bg-sand rounded-full" />
          </div>
          <div class="h-5 w-48 bg-sand rounded" />
          <div class="flex gap-6">
            <div class="h-8 w-16 bg-sand rounded" />
            <div class="h-8 w-16 bg-sand rounded" />
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="items.length === 0" class="p-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center">
            <InboxIcon class="w-8 h-8 text-plum-muted/30" />
          </div>
          <p class="font-display font-black text-lg text-plum">No history found</p>
        </div>
      </div>

      <!-- Rows -->
      <div
        v-for="queue in items"
        v-else
        :key="queue.id"
        class="p-5 transition-colors relative"
        :class="[
          selectedIds.includes(queue.id) ? 'bg-mint-light/20' : '',
          canViewDetail ? 'active:bg-sand' : 'opacity-80',
        ]"
        @click="canViewDetail && emit('view-detail', queue.id)"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-3">
            <button
              type="button"
              :aria-label="`Select queue ${queue.name}`"
              class="w-6 h-6 rounded-lg border border-plum-faint flex items-center justify-center transition-all bg-white shadow-sm"
              :class="{ 'bg-mint border-mint': selectedIds.includes(queue.id) }"
              @click.stop="toggleSelection(queue.id)"
            >
              <CheckIcon
                v-if="selectedIds.includes(queue.id)"
                class="w-4 h-4 text-plum stroke-[3]"
              />
            </button>
            <span
              class="font-body text-[11px] text-plum-muted font-bold uppercase tracking-wider"
              >{{ queue.dateFormatted }}</span
            >
          </div>
          <div class="flex items-center gap-1.5">
            <BaseBadge :variant="getStatusVariant(queue.status)" size="sm" class="font-black">
              {{ formatStatus(queue.status) }}
            </BaseBadge>
            <button
              class="p-2 text-plum-muted active:text-danger active:bg-danger/10 rounded-xl transition-colors"
              :aria-label="`Delete queue ${queue.name}`"
              title="Delete entry"
              @click.stop="emit('delete-single', queue.id)"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <h4 class="font-body font-black text-lg text-plum mb-4 leading-tight">{{ queue.name }}</h4>

        <div class="flex items-center justify-between">
          <div class="flex gap-6">
            <div>
              <p
                class="font-body text-[9px] font-black uppercase tracking-widest text-plum-muted mb-1"
              >
                Served
              </p>
              <p
                class="font-mono text-sm text-plum font-black bg-sand px-2 py-1 rounded-lg inline-block"
              >
                {{ queue.totalServed }}
              </p>
            </div>
            <div>
              <p
                class="font-body text-[9px] font-black uppercase tracking-widest text-plum-muted mb-1"
              >
                Avg. Wait
              </p>
              <p
                class="font-mono text-sm text-plum font-black bg-sand px-2 py-1 rounded-lg inline-block"
              >
                {{ queue.avgWait }}
              </p>
            </div>
          </div>

          <ArrowRightIcon v-if="canViewDetail" class="w-5 h-5 text-plum-muted/50" />
        </div>
      </div>
    </div>
  </div>
</template>
