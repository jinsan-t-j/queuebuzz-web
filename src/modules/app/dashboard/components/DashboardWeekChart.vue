<script setup lang="ts">
/**
 * @component DashboardWeekChart
 * @description 7-bar chart Mon–Sun showing weekly performance.
 * Pure CSS bars — no external chart library.
 *
 * @prop {Array} data - 7 items: { day, value, isFuture, isToday }.
 * @prop {Boolean} hasData - Whether there is chart data to display.
 */

import { ref, computed } from 'vue'
import BasePillSelector from '@/components/base/BasePillSelector.vue'
import BaseTooltip from '@/components/base/BaseTooltip.vue'
import BarChartEmptyIcon from '@/assets/icons/bar-chart-empty.svg?component'

interface WeekData {
  day: string
  value: number
  isFuture: boolean
  isToday: boolean
  avgWait?: string
}

interface TabOption {
  key: string
  label: string
}

const props = withDefaults(
  defineProps<{
    data?: WeekData[]
    hasData?: boolean
    isLoading?: boolean
    hasActiveQueue?: boolean
  }>(),
  {
    data: () => [],
    hasData: true,
    isLoading: false,
    hasActiveQueue: false,
  },
)

const activeTab = ref<string>('served')
const tabs: TabOption[] = [
  { key: 'served', label: 'Served' },
  { key: 'avgWait', label: 'Avg. Wait' },
]

const yAxisTicks = computed(() => {
  if (!props.data || !props.data.length || props.isLoading) return [10, 5, 0]
  const isServed = activeTab.value === 'served'
  const values = props.data.map((d) => {
    if (isServed) return d.value || 0
    return d.avgWait ? Number.parseInt(d.avgWait) : 0
  })
  const maxValue = Math.max(...values, 1)

  // Standard "nice" numbers for chart axes
  const niceNumbers = [5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000]
  const rawStep = maxValue / 4 // Aim for ~5 ticks including 0

  const step = niceNumbers.find((n) => n >= rawStep) || Math.ceil(rawStep / 1000) * 1000
  let roundedMax = Math.ceil(maxValue / step) * step

  // Always ensure at least one step of headroom
  if (roundedMax <= maxValue) {
    roundedMax += step
  }

  const ticks = []
  for (let i = roundedMax; i >= 0; i -= step) {
    ticks.push(i)
  }
  return ticks
})

const processedData = computed(() => {
  if (!props.data || !props.data.length || props.isLoading) return []
  const isServed = activeTab.value === 'served'
  const maxScaleValue = yAxisTicks.value[0] || 10

  return props.data.map((d) => {
    let val = 0
    if (isServed) {
      val = d.value || 0
    } else if (d.avgWait) {
      val = Number.parseInt(d.avgWait)
    }
    let tooltipText
    if (d.isFuture) {
      tooltipText = 'No data yet'
    } else if (isServed) {
      tooltipText = `${val} served`
    } else {
      const mins = Math.floor(val / 60)
      const secs = val % 60
      tooltipText = mins > 0 ? `Avg. Wait: ${mins}m ${secs}s` : `Avg. Wait: ${secs}s`
    }

    return {
      ...d,
      barHeight: d.isFuture ? '20%' : `${(val / maxScaleValue) * 100}%`,
      tooltipText,
    }
  })
})

function getBarClass(item: WeekData): string {
  if (item.isFuture) return 'bg-plum-faint border-t-2 border-dashed border-plum-muted/30'
  if (item.isToday) return 'bg-mint shadow-lg shadow-mint/30 dark:shadow-none'
  return 'bg-mint/40'
}
</script>

<template>
  <div
    class="rounded-[14px] border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="font-display text-base font-bold text-plum">This Week</h3>
      <!-- Tab switcher -->
      <BasePillSelector v-model="activeTab" :options="tabs" :is-loading="isLoading" />
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
    <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-12 gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint">
        <BarChartEmptyIcon class="h-5 w-5 text-plum-muted" />
      </div>
      <p class="font-display text-base font-semibold text-plum">
        {{ hasActiveQueue ? 'Tracking started' : 'No data yet' }}
      </p>
      <p class="max-w-[225px] text-center font-body text-sm text-plum-muted leading-5">
        {{
          hasActiveQueue
            ? "We're collecting data from your active session. Charts will update soon."
            : "We'll chart your weekly traffic here once your first queue becomes active."
        }}
      </p>
    </div>

    <!-- Chart -->
    <div v-else class="mt-8 flex gap-4">
      <!-- Y Axis -->
      <div
        class="flex flex-col justify-between h-44 text-[10px] font-mono text-plum-muted/50 text-right w-6 pb-2 select-none"
      >
        <span v-for="tick in yAxisTicks" :key="tick">{{ tick }}</span>
      </div>

      <div class="flex-1 relative">
        <!-- Grid Lines -->
        <div class="absolute inset-0 flex flex-col justify-between h-44 pb-2 pointer-events-none">
          <div
            v-for="tick in yAxisTicks"
            :key="tick"
            class="w-full border-t border-plum-faint/30 first:border-t-0 last:border-plum-faint/80"
          />
        </div>

        <!-- Bars -->
        <div class="relative flex items-end justify-between gap-3 h-44 z-10">
          <div
            v-for="(item, index) in processedData"
            :key="`${item.day}-${index}`"
            v-memo="[item.day, item.barHeight, item.isToday, item.tooltipText]"
            class="flex flex-1 flex-col items-center gap-2 h-full"
          >
            <div class="relative w-full flex justify-center h-full items-end">
              <BaseTooltip
                :text="item.tooltipText"
                class="w-full max-w-[48px] h-full items-end justify-center"
              >
                <div
                  :class="[
                    'w-full max-w-[48px] rounded-t-lg transition-all duration-500',
                    getBarClass(item),
                  ]"
                  :style="{ height: item.barHeight }"
                />
              </BaseTooltip>
            </div>
          </div>
        </div>

        <!-- Day labels -->
        <div class="mt-3 flex justify-between gap-3">
          <span
            v-for="(item, index) in processedData"
            :key="`${item.day}-${index}`"
            class="flex-1 text-center font-mono text-[10px] uppercase text-plum-muted"
          >
            {{ item.day }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
