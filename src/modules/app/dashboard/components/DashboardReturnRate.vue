<script setup>
/**
 * @component DashboardReturnRate
 * @description Day vs Return Rate line chart + Queues vs Return Rate horizontal bars.
 * Pure SVG/CSS — no external chart library.
 *
 * @prop {Array} chartData - Array of { day, rate }.
 * @prop {Array} byQueue - Array of { label, rate }.
 * @prop {Boolean} hasData - Whether to show chart or empty state.
 */

import { computed } from 'vue'
import MountainEmptyIcon from '@/assets/icons/mountain-empty.svg?component'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => [],
  },
  byQueue: {
    type: Array,
    default: () => [],
  },
  hasData: {
    type: Boolean,
    default: false,
  },
})

// Build SVG path for the line chart
const svgPath = computed(() => {
  if (!props.chartData.length) return ''
  const width = 440
  const height = 120
  const padding = 10
  const maxRate = 100
  const stepX = (width - padding * 2) / (props.chartData.length - 1)

  const points = props.chartData.map((d, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((d.rate / maxRate) * (height - padding * 2))
    return { x, y }
  })

  // Build smooth curve
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpx2 = prev.x + ((curr.x - prev.x) * 2) / 3
    path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`
  }

  return path
})

const dotPoints = computed(() => {
  if (!props.chartData.length) return []
  const width = 440
  const height = 120
  const padding = 10
  const maxRate = 100
  const stepX = (width - padding * 2) / (props.chartData.length - 1)

  return props.chartData.map((d, i) => ({
    x: padding + i * stepX,
    y: height - padding - ((d.rate / maxRate) * (height - padding * 2)),
    rate: d.rate,
  }))
})

const dayLabels = computed(() => {
  if (!props.chartData.length) return []
  return ['Mon', 'Wed', 'Fri', 'Sun']
})
</script>

<template>
  <div
    class="rounded-xl border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <!-- Empty state -->
    <div
      v-if="!hasData"
      class="flex flex-col items-center justify-center py-16 gap-3"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint"
      >
        <MountainEmptyIcon class="h-5 w-5 text-plum-muted" />
      </div>
      <p class="font-display text-base font-semibold text-plum">No data yet</p>
      <p
        class="max-w-[240px] text-center font-body text-sm text-plum-muted leading-5"
      >
        We will show an analysis of the same customers returning to your queues.
      </p>
    </div>

    <!-- Chart content -->
    <template v-else>
      <!-- Day vs Return Rate -->
      <h4
        class="font-body text-sm font-semibold uppercase tracking-[0.7px] text-plum-muted"
      >
        Day vs. Return Rate
      </h4>

      <div class="mt-4">
        <svg
          viewBox="0 0 440 120"
          class="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            :d="svgPath"
            fill="none"
            stroke="#00E5A0"
            stroke-width="2"
            stroke-linecap="round"
          />
          <circle
            v-for="(point, idx) in dotPoints"
            :key="idx"
            :cx="point.x"
            :cy="point.y"
            r="3"
            fill="#00E5A0"
            stroke="white"
            stroke-width="2"
          />
        </svg>

        <!-- X-axis labels -->
        <div class="mt-2 flex justify-between px-2">
          <span
            v-for="label in dayLabels"
            :key="label"
            class="font-mono text-[10px] uppercase text-plum-muted"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <!-- Separator -->
      <div class="my-6 border-t border-plum-faint" />

      <!-- Queues vs Return Rate -->
      <h4
        class="font-body text-sm font-semibold uppercase tracking-[0.7px] text-plum-muted"
      >
        Queues vs. Return Rate
      </h4>

      <div class="mt-4 flex flex-col gap-3">
        <div
          v-for="item in byQueue"
          :key="item.label"
          class="flex items-center gap-3"
        >
          <span class="w-14 shrink-0 font-mono text-[10px] text-plum-muted">
            {{ item.label }}
          </span>
          <div class="flex-1 h-4 rounded-full bg-plum-faint/50 overflow-hidden">
            <div
              class="h-full rounded-full bg-mint transition-all duration-700"
              :style="{ width: `${item.rate}%` }"
            />
          </div>
          <span class="w-8 text-right font-mono text-[10px] font-bold text-plum">
            {{ item.rate }}%
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
