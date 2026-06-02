<script setup lang="ts">
/**
 * @component DashboardDroppedSkipped
 * @description Heatmap grid showing dropped & skipped volume by hour and day.
 * Pure CSS grid — no external chart library.
 *
 * @prop {Array} data - Array of { hour, day, value } heatmap cells.
 */

import { computed, ref } from 'vue'

import WavesEmptyIcon from '@/assets/icons/waves-empty.svg?component'
import BasePillSelector from '@/components/base/BasePillSelector.vue'

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

const dayLabels: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  0: 'Sun',
}

const displayedDays = computed(() => {
  const todayDayIdx = new Date().getDay()
  return activeTimeframe.value === 'today' ? [todayDayIdx] : [1, 2, 3, 4, 5, 6, 0] // Monday to Sunday
})

function setTimeframe(key) {
  activeTimeframe.value = key
  emit('timeframe-change', key)
}

const gridCells = computed(() => {
  const rowsMap = new Map()
  for (const element of props.data) {
    const item = element
    if (!rowsMap.has(item.day)) {
      rowsMap.set(item.day, new Map())
    }
    rowsMap.get(item.day).set(item.hour, item.value)
  }

  const hours = Array.from({ length: 12 }, (_, i) => 8 + i)

  return displayedDays.value.map((day) => {
    const dayMap = rowsMap.get(day)
    return {
      dayLabel: dayLabels[day] || '',
      cells: hours.map((hour) => (dayMap ? dayMap.get(hour) || 0 : 0)),
    }
  })
})

const maxValue = computed(() => {
  let max = 1
  gridCells.value.forEach((row) => {
    row.cells.forEach((val) => {
      if (val > max) max = val
    })
  })
  return max
})

const hasData = computed(() => {
  return gridCells.value.some((row) => row.cells.some((val) => val > 0))
})

function cellColor(value: number) {
  const intensity = value / maxValue.value
  if (intensity === 0) return 'bg-plum-faint/30'
  if (intensity < 0.3) return 'bg-warning/20'
  if (intensity < 0.5) return 'bg-warning/40'
  if (intensity < 0.7) return 'bg-warning/60'
  return 'bg-warning/80'
}

const hoveredDot = ref<{ x: number; y: number; value: number; hour: number } | null>(null)

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`
}

const lineChartPlot = computed(() => {
  if (activeTimeframe.value !== 'today' || !gridCells.value.length) {
    return { path: '', areaPath: '', dots: [] }
  }
  const cells = gridCells.value[0].cells
  const width = 440
  const height = 120
  const paddingX = 16
  const paddingY = 16
  const maxVal = maxValue.value

  const stepX = (width - paddingX * 2) / (cells.length - 1)
  const dots = cells.map((val, i) => {
    const x = paddingX + i * stepX
    const y = height - paddingY - (val / maxVal) * (height - paddingY * 2)
    return { x, y, value: val, hour: 8 + i }
  })

  if (dots.length === 0) return { path: '', areaPath: '', dots: [] }

  // Build smooth curve
  let path = `M ${dots[0].x} ${dots[0].y}`
  for (let i = 1; i < dots.length; i++) {
    const prev = dots[i - 1]
    const curr = dots[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpx2 = prev.x + ((curr.x - prev.x) * 2) / 3
    path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`
  }

  // Area path
  const baselineY = height - paddingY / 2
  const areaPath = `${path} L ${dots[dots.length - 1].x} ${baselineY} L ${dots[0].x} ${baselineY} Z`

  return { path, areaPath, dots }
})
</script>

<template>
  <div
    class="rounded-xl border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h4 class="font-body text-xs font-bold uppercase tracking-[0.7px] text-plum-muted sm:text-sm">
        Dropped & Skipped
      </h4>

      <BasePillSelector
        v-model="activeTimeframe"
        :options="timeframes"
        :is-loading="isLoading"
        :skeleton-count="3"
        class="w-full sm:w-auto"
        @update:model-value="setTimeframe"
      />
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="mt-4 animate-pulse">
      <div class="flex flex-col gap-1.5">
        <div v-for="r in activeTimeframe === 'today' ? 1 : 7" :key="r" class="flex items-center">
          <!-- Skeleton label -->
          <div class="h-6 w-8 shrink-0 flex items-center justify-end pr-2">
            <div class="h-3.5 w-6 bg-plum-faint rounded-xs" />
          </div>
          <!-- Skeleton cells -->
          <div class="flex-1 flex gap-1.5">
            <div v-for="c in 12" :key="c" class="h-6 flex-1 rounded-xs bg-plum-faint" />
          </div>
        </div>
      </div>
      <div class="mt-2 flex">
        <div class="w-8 shrink-0" />
        <div class="flex-1 flex justify-between">
          <div class="h-3 w-10 bg-plum-faint rounded" />
          <div class="h-3 w-10 bg-plum-faint rounded" />
          <div class="h-3 w-10 bg-plum-faint rounded" />
        </div>
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

    <!-- Today Line Graph -->
    <div v-else-if="activeTimeframe === 'today'" class="mt-4">
      <div class="relative w-full">
        <!-- SVG Line Graph -->
        <svg viewBox="0 0 440 120" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="droppedSkippedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F97316" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#F97316" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          <line
            x1="16"
            y1="16"
            x2="424"
            y2="16"
            stroke="#E8E2F0"
            stroke-dasharray="4 4"
            stroke-width="1"
          />
          <line
            x1="16"
            y1="60"
            x2="424"
            y2="60"
            stroke="#E8E2F0"
            stroke-dasharray="4 4"
            stroke-width="1"
          />
          <line
            x1="16"
            y1="104"
            x2="424"
            y2="104"
            stroke="#E8E2F0"
            stroke-dasharray="4 4"
            stroke-width="1"
          />

          <!-- Gradient Area Under Curve -->
          <path
            v-if="lineChartPlot.areaPath"
            :d="lineChartPlot.areaPath"
            fill="url(#droppedSkippedGradient)"
          />

          <!-- Curve Line -->
          <path
            v-if="lineChartPlot.path"
            :d="lineChartPlot.path"
            fill="none"
            stroke="#F97316"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Visual dots -->
          <circle
            v-for="(dot, idx) in lineChartPlot.dots"
            :key="'dot-' + idx"
            :cx="dot.x"
            :cy="dot.y"
            :r="hoveredDot?.hour === dot.hour ? 5 : 3.5"
            fill="#F97316"
            stroke="#FFFFFF"
            stroke-width="1.5"
            class="transition-all duration-150"
          />

          <!-- Interactive hit targets -->
          <circle
            v-for="(dot, idx) in lineChartPlot.dots"
            :key="'hit-' + idx"
            :cx="dot.x"
            :cy="dot.y"
            r="16"
            fill="transparent"
            class="cursor-pointer"
            @mouseenter="hoveredDot = dot"
            @mouseleave="hoveredDot = null"
          />
        </svg>

        <!-- Tooltip overlay -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="hoveredDot"
            class="absolute pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-plum text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md font-body z-20 flex flex-col items-center"
            :style="{
              left: `${(hoveredDot.x / 440) * 100}%`,
              top: `${(hoveredDot.y / 120) * 100}%`,
            }"
          >
            <span class="font-semibold">{{ formatHour(hoveredDot.hour) }}</span>
            <span class="text-[10px] text-white/80 font-mono">{{ hoveredDot.value }} skipped</span>
            <!-- Arrow -->
            <div
              class="absolute top-full left-1/2 -translate-x-1/2 border-x-[4px] border-t-[4px] border-x-transparent border-t-plum"
            />
          </div>
        </Transition>
      </div>

      <!-- X-Axis Labels -->
      <div class="mt-2 flex">
        <div class="w-4 shrink-0" />
        <div class="flex-1 flex justify-between px-2">
          <span class="font-mono text-sm text-plum-muted">08:00</span>
          <span class="font-mono text-sm text-plum-muted">14:00</span>
          <span class="font-mono text-sm text-plum-muted">20:00</span>
        </div>
        <div class="w-4 shrink-0" />
      </div>
    </div>

    <!-- Heatmap grid -->
    <div v-else class="mt-4">
      <div class="flex flex-col gap-1.5">
        <div v-for="(row, rowIdx) in gridCells" :key="rowIdx" class="flex items-center">
          <!-- Weekday label -->
          <span
            class="font-body text-[11px] font-semibold text-plum-muted h-6 w-8 flex items-center justify-end pr-2 select-none"
          >
            {{ row.dayLabel }}
          </span>
          <!-- Row cells -->
          <div class="flex-1 flex gap-1.5">
            <div
              v-for="(value, colIdx) in row.cells"
              :key="colIdx"
              :class="['h-6 flex-1 rounded-xs transition-colors', cellColor(value)]"
            />
          </div>
        </div>
      </div>

      <!-- Hour labels -->
      <div class="mt-2 flex">
        <div class="w-8 shrink-0" />
        <div class="flex-1 flex justify-between">
          <span class="font-mono text-sm text-plum-muted">08:00</span>
          <span class="font-mono text-sm text-plum-muted">14:00</span>
          <span class="font-mono text-sm text-plum-muted">20:00</span>
        </div>
      </div>
    </div>
  </div>
</template>
