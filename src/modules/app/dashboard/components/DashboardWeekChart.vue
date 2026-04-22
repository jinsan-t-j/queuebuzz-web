<script setup>
/**
 * @component DashboardWeekChart
 * @description 7-bar chart Mon–Sun showing weekly performance.
 * Pure CSS bars — no external chart library.
 *
 * @prop {Array} data - 7 items: { day, value, isFuture, isToday }.
 * @prop {Boolean} hasData - Whether there is chart data to display.
 */

import { ref, computed } from 'vue'
import BarChartEmptyIcon from '@/assets/icons/bar-chart-empty.svg?component'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  hasData: {
    type: Boolean,
    default: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const activeTab = ref('served')
const tabs = [
  { key: 'served', label: 'Served' },
  { key: 'avgWait', label: 'Avg. Wait' },
]

const processedData = computed(() => {
  if (!props.data || !props.data.length || props.isLoading) return []
  const isServed = activeTab.value === 'served'

  const values = props.data.map((d) =>
    isServed ? d.value || 0 : d.avgWait ? parseInt(d.avgWait) : 0,
  )
  const maxValue = Math.max(...values, 1)

  return props.data.map((d, i) => ({
    ...d,
    barHeight: d.isFuture ? '20%' : `${(values[i] / maxValue) * 100}%`,
  }))
})
</script>

<template>
  <div
    class="rounded-[14px] border border-ash-border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <!-- Header -->
    <div v-once class="flex items-center justify-between">
      <h3 class="font-display text-base font-bold text-plum">This Week</h3>
      <!-- Tab switcher -->
      <div v-if="!isLoading" class="flex gap-1 rounded-lg bg-plum-faint/50 p-0.5">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'rounded-md px-4 py-2 font-body text-sm font-medium transition-colors min-h-[40px] md:min-h-[36px]',
            activeTab === tab.key
              ? 'bg-white text-plum shadow-xs'
              : 'text-plum-muted hover:text-plum',
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <!-- Tab Skeleton -->
      <div v-else class="flex gap-1 rounded-lg bg-plum-faint/50 p-0.5">
        <div class="h-9 w-20 rounded-md bg-white/50 animate-pulse" />
        <div class="h-9 w-20 rounded-md bg-transparent animate-pulse" />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="mt-6">
      <div class="flex items-end justify-between gap-3 h-44">
        <div v-for="i in 7" :key="i" class="flex-1 flex flex-col items-center gap-2 h-full">
          <div class="relative w-full flex justify-center h-full items-end">
            <div
              class="w-full max-w-[48px] rounded-t-lg bg-plum-faint animate-pulse"
              :style="{ height: `${[40, 60, 30, 80, 50, 20, 45][i - 1]}%` }"
            />
          </div>
        </div>
      </div>
      <div class="mt-3 flex justify-between gap-3">
        <div v-for="i in 7" :key="i" class="h-3 w-8 bg-plum-faint rounded animate-pulse mx-auto" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" v-once class="flex flex-col items-center justify-center py-12 gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint">
        <BarChartEmptyIcon class="h-5 w-5 text-plum-muted" />
      </div>
      <p class="font-display text-base font-semibold text-plum">No data yet</p>
      <p class="max-w-[225px] text-center font-body text-sm text-plum-muted leading-5">
        We'll chart your weekly traffic here once your first queue becomes active.
      </p>
    </div>

    <!-- Chart -->
    <div v-else class="mt-6">
      <!-- Bars -->
      <div class="flex items-end justify-between gap-3 h-44">
        <div
          v-for="item in processedData"
          :key="item.day"
          v-memo="[item.day, item.barHeight, item.isToday]"
          class="flex flex-1 flex-col items-center gap-2 h-full"
        >
          <div class="relative w-full flex justify-center h-full items-end">
            <div
              :class="[
                'w-full max-w-[48px] rounded-t-lg transition-all duration-500',
                item.isFuture
                  ? 'bg-plum-faint border-t-2 border-dashed border-plum-muted/30'
                  : item.isToday
                    ? 'bg-mint shadow-[0_4px_16px_rgba(0,229,160,0.3)]'
                    : 'bg-mint/40',
              ]"
              :style="{ height: item.barHeight }"
            />
          </div>
        </div>
      </div>

      <!-- Day labels -->
      <div class="mt-3 flex justify-between gap-3">
        <span
          v-for="item in processedData"
          :key="item.day"
          class="flex-1 text-center font-mono text-sm uppercase text-plum-muted"
        >
          {{ item.day }}
        </span>
      </div>
    </div>
  </div>
</template>
