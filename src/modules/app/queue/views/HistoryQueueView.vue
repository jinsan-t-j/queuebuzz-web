<script setup>
/**
 * @component HistoryQueueView
 * @description Queue history page showing aggregate stats (Total Queues,
 * Total Served, Avg. Wait), a paginated "Past Queues" table,
 * and a "Go Pro" upgrade nudge banner.
 *
 * @prop {Number} totalQueues - Total queue count stat.
 * @prop {String} totalServed - Total served string (e.g. "1,204").
 * @prop {String} avgWait - Average wait time string.
 * @prop {Array} pastQueues - List of past queue row objects.
 * @prop {Number} currentPage - Current pagination page.
 * @prop {Number} totalPages - Total pagination pages.
 * @prop {Number} totalEntries - Total number of history entries.
 * @emits {page-change} - Pagination page changed.
 * @emits {row-click} - A history row was clicked.
 * @emits {go-pro} - "Go Pro" button clicked.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import ChevronRightIcon from '@/assets/icons/chevron-right.svg?component'
import FilterDownloadIcon from '@/assets/icons/filter-download.svg?component'

// 6. Props
const props = defineProps({
  totalQueues: {
    type: Number,
    default: 42,
  },
  totalServed: {
    type: String,
    default: '1,204',
  },
  avgWait: {
    type: String,
    default: '14m',
  },
  pastQueues: {
    type: Array,
    default: () => [
      { id: 1, date: 'Oct 24, 2023', name: 'Main Service Desk', totalServed: 128, avgWait: '12m 40s' },
      { id: 2, date: 'Oct 23, 2023', name: 'Express Checkout', totalServed: 342, avgWait: '04m 15s' },
      { id: 3, date: 'Oct 22, 2023', name: 'Weekend Pop-up', totalServed: 89, avgWait: '18m 22s' },
      { id: 4, date: 'Oct 21, 2023', name: 'Customer Returns', totalServed: 56, avgWait: '08m 50s' },
      { id: 5, date: 'Oct 20, 2023', name: 'Main Service Desk', totalServed: 145, avgWait: '11m 15s' },
    ],
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 3,
  },
  totalEntries: {
    type: Number,
    default: 42,
  },
})

// 7. Emits
const emit = defineEmits(['page-change', 'row-click', 'go-pro'])

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="relative mx-auto max-w-[752px]">
    <!-- ═══ Stats row ═══ -->
    <div class="flex gap-4">
      <!-- Total Queues -->
      <div class="flex-1 rounded-card border border-plum/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <p class="font-body text-xs font-bold uppercase tracking-[1.2px] text-ash">
          Total Queues
        </p>
        <p class="mt-2 font-mono text-[30px] font-bold leading-9 text-plum">
          {{ totalQueues }}
        </p>
      </div>
      <!-- Total Served -->
      <div class="flex-1 rounded-card border border-plum/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <p class="font-body text-xs font-bold uppercase tracking-[1.2px] text-ash">
          Total Served
        </p>
        <p class="mt-2 font-mono text-[30px] font-bold leading-9 text-plum">
          {{ totalServed }}
        </p>
      </div>
      <!-- Avg. Wait -->
      <div class="flex-1 rounded-card border border-plum/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <p class="font-body text-xs font-bold uppercase tracking-[1.2px] text-ash">
          Avg. Wait
        </p>
        <p class="mt-2 font-mono text-[30px] font-bold leading-9 text-[#4ade80]">
          {{ avgWait }}
        </p>
      </div>
    </div>

    <!-- ═══ Past Queues table card ═══ -->
    <div class="mt-6 rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <!-- Table header -->
      <div class="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-5">
        <h3 class="font-display text-lg text-plum">Past Queues</h3>
        <FilterDownloadIcon class="h-8 w-[74px] text-ash" />
      </div>

      <!-- Column headers -->
      <div class="flex items-center bg-sand/50 px-6 py-4">
        <span class="w-[160px] font-body text-[10px] font-bold uppercase tracking-[1px] text-[#64748b]">Date</span>
        <span class="w-[200px] font-body text-[10px] font-bold uppercase tracking-[1px] text-[#64748b]">Queue Name</span>
        <span class="w-[140px] font-body text-[10px] font-bold uppercase tracking-[1px] text-[#64748b]">Total Served</span>
        <span class="flex-1 font-body text-[10px] font-bold uppercase tracking-[1px] text-[#64748b]">Avg. Wait</span>
        <span class="w-6" />
      </div>

      <!-- Rows -->
      <div>
        <div
          v-for="(queue, idx) in pastQueues"
          :key="queue.id"
          class="flex cursor-pointer items-center px-6 py-5 transition-colors hover:bg-sand/30"
          :class="idx > 0 ? 'border-t border-[#f1f5f9]' : ''"
          @click="emit('row-click', queue.id)"
        >
          <span class="w-[160px] font-body text-sm text-[#475569]">{{ queue.date }}</span>
          <span class="w-[200px] font-body text-sm font-semibold text-plum">{{ queue.name }}</span>
          <span class="w-[140px] font-mono text-sm text-plum">{{ queue.totalServed }}</span>
          <span class="flex-1 font-mono text-sm text-plum">{{ queue.avgWait }}</span>
          <ChevronRightIcon class="h-[9px] w-[6px] text-ash" />
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-[#f1f5f9] px-6 py-5">
        <span class="font-body text-xs text-ash">
          Showing 1 to {{ pastQueues.length }} of {{ totalEntries }} entries
        </span>
        <div class="flex items-center gap-1">
          <button
            class="rounded-lg px-3 py-1 font-body text-xs font-bold text-ash transition-colors hover:bg-plum-faint"
            :disabled="currentPage <= 1"
            @click="emit('page-change', currentPage - 1)"
          >
            Prev
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="flex h-8 w-8 items-center justify-center rounded-lg font-body text-xs font-bold transition-colors"
            :class="
              page === currentPage
                ? 'bg-plum text-white'
                : 'text-[#475569] hover:bg-plum-faint'
            "
            @click="emit('page-change', page)"
          >
            {{ page }}
          </button>
          <button
            class="rounded-lg px-3 py-1 font-body text-xs font-bold text-[#475569] transition-colors hover:bg-plum-faint"
            :disabled="currentPage >= totalPages"
            @click="emit('page-change', currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ Upgrade nudge ═══ -->
    <div class="relative mt-6 overflow-hidden rounded-card bg-plum p-8 shadow-[0_8px_10px_rgba(0,0,0,0.10),0_20px_25px_rgba(0,0,0,0.10)]">
      <!-- Decorative circles -->
      <div class="absolute -left-10 top-0 h-28 w-36 rounded-full bg-[#4ade80]/5" />
      <div class="absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/5" />

      <div class="relative flex items-center justify-between">
        <div class="flex flex-col gap-2">
          <h4 class="font-display text-xl text-white">Need detailed analytics?</h4>
          <p class="font-body text-sm text-ash">
            Upgrade to Pro to export data for the last 12 months.
          </p>
        </div>
        <button
          class="rounded-input bg-[#4ade80] px-8 py-3 font-body text-base font-bold text-plum shadow-[0_4px_6px_rgba(74,222,128,0.20),0_10px_15px_rgba(74,222,128,0.20)] transition-colors hover:bg-[#22c55e]"
          @click="emit('go-pro')"
        >
          Go Pro
        </button>
      </div>
    </div>
  </div>
</template>
