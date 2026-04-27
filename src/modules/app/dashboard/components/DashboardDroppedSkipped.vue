<script setup lang="ts">
/**
 * @component DashboardDroppedSkipped
 * @description Heatmap grid showing dropped & skipped volume by hour and day.
 * Pure CSS grid — no external chart library.
 *
 * @prop {Array} data - Array of { hour, day, value } heatmap cells.
 */

import { computed, ref } from 'vue'
import BasePillSelector from '@/components/base/BasePillSelector.vue'
import WavesEmptyIcon from '@/assets/icons/waves-empty.svg?component'

interface HeatmapCell {
  hour: number
  day: number
  value: number
}

const props = withDefaults(
  defineProps<{
    data?: HeatmapCell[]
    isLoading?: boolean
  }>(),
  {
    data: () => [],
    isLoading: false,
  },
)

const emit = defineEmits(['timeframe-change'])

const activeTimeframe = ref('today')
const timeframes = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
]

function setTimeframe(key) {
  activeTimeframe.value = key
  emit('timeframe-change', key)
}

const hasData = computed(() => props.data.length > 0)

// Group data into rows (by day) and columns (by hour)
const maxValue = computed(() => {
  if (!props.data.length) return 1
  return Math.max(...props.data.map((d) => d.value), 1)
})

// Generate grid efficiently without O(N^2) lookups
const gridCells = computed(() => {
  if (!props.data.length) return []

  const rowsMap = new Map()
  const hoursSet = new Set<number>()

  for (let i = 0; i < props.data.length; i++) {
    const item = props.data[i]
    hoursSet.add(item.hour)
    if (!rowsMap.has(item.day)) {
      rowsMap.set(item.day, new Map())
    }
    rowsMap.get(item.day).set(item.hour, item.value)
  }

  const days = Array.from(rowsMap.keys()).sort()
  const hours = Array.from(hoursSet).sort((a, b) => a - b)

  return days.map((day) => {
    const dayMap = rowsMap.get(day)
    return hours.map((hour) => dayMap.get(hour) || 0)
  })
})

function cellColor(value: number) {
  const intensity = value / maxValue.value
  if (intensity === 0) return 'bg-plum-faint/30'
  if (intensity < 0.3) return 'bg-warning/20'
  if (intensity < 0.5) return 'bg-warning/40'
  if (intensity < 0.7) return 'bg-warning/60'
  return 'bg-warning/80'
}
</script>

<template>
  <div class="rounded-xl border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <div class="flex items-center justify-between">
      <h4 class="font-body text-sm font-bold uppercase tracking-[0.7px] text-plum-muted">
        Dropped & Skipped
      </h4>

      <BasePillSelector
        v-model="activeTimeframe"
        :options="timeframes"
        :is-loading="isLoading"
        :skeleton-count="3"
        @update:model-value="setTimeframe"
      />
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="mt-4 animate-pulse">
      <div class="flex flex-col gap-1.5">
        <div v-for="r in 3" :key="r" class="flex gap-1.5">
          <div v-for="c in 12" :key="c" class="h-6 flex-1 rounded-xs bg-plum-faint" />
        </div>
      </div>
      <div class="mt-4 flex justify-between">
        <div class="h-3 w-10 bg-plum-faint rounded" />
        <div class="h-3 w-10 bg-plum-faint rounded" />
        <div class="h-3 w-10 bg-plum-faint rounded" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-10 gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint">
        <WavesEmptyIcon class="h-5 w-5 text-plum-muted" />
      </div>
      <p class="font-display text-base font-semibold text-plum">No data yet</p>
      <p class="max-w-[240px] text-center font-body text-sm text-plum-muted leading-5">
        We'll show you the heap map of your lost or skipped traffic.
      </p>
    </div>

    <!-- Heatmap grid -->
    <div v-else class="mt-4">
      <div class="flex flex-col gap-1.5">
        <div v-for="(row, rowIdx) in gridCells" :key="rowIdx" class="flex gap-1.5">
          <div
            v-for="(value, colIdx) in row"
            :key="colIdx"
            :class="['h-6 flex-1 rounded-xs transition-colors', cellColor(value)]"
          />
        </div>
      </div>

      <!-- Hour labels -->
      <div class="mt-2 flex justify-between">
        <span class="font-mono text-sm text-plum-muted">08:00</span>
        <span class="font-mono text-sm text-plum-muted">14:00</span>
        <span class="font-mono text-sm text-plum-muted">20:00</span>
      </div>
    </div>
  </div>
</template>
