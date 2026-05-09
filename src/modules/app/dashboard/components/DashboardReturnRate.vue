<script setup lang="ts">
/**
 * @component DashboardReturnRate
 * @description Day vs Return Rate line chart + Queues vs Return Rate horizontal bars.
 * Pure SVG/CSS — no external chart library.
 *
 * @prop {Array} chartData - Array of { day, rate }.
 * @prop {Array} byQueue - Array of { label, rate }.
 * @prop {Boolean} hasData - Whether to show chart or empty state.
 */

import { computed, ref } from 'vue'
import BasePillSelector from '@/components/base/BasePillSelector.vue'
import MountainEmptyIcon from '@/assets/icons/mountain-empty.svg?component'

interface ChartData {
  day: string
  rate: number
}

interface QueueRate {
  label: string
  rate: number
}

const props = withDefaults(
  defineProps<{
    chartData?: ChartData[]
    byQueue?: QueueRate[]
    hasData?: boolean
    isLoading?: boolean
    isRefreshing?: boolean
  }>(),
  {
    chartData: () => [],
    byQueue: () => [],
    hasData: false,
    isLoading: false,
    isRefreshing: false,
  },
)

const emit = defineEmits(['timeframe-change'])

const activeTimeframe = ref('today')
const timeframes = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
]

const isExpanded = ref(false)

const displayedQueues = computed(() => {
  if (isExpanded.value || props.byQueue.length <= 3) return props.byQueue
  return props.byQueue.slice(0, 3)
})

function setTimeframe(key) {
  activeTimeframe.value = key
  emit('timeframe-change', key)
}

const chartPlot = computed(() => {
  if (!props.chartData.length || props.isLoading) return { path: '', dots: [] }
  const width = 440
  const height = 120
  const padding = 10
  const maxRate = 100
  const pointsCount = Math.max(props.chartData.length - 1, 1)
  const stepX = (width - padding * 2) / pointsCount

  const dots = props.chartData.map((d, i) => ({
    x: padding + i * stepX,
    y: height - padding - (d.rate / maxRate) * (height - padding * 2),
    rate: d.rate,
  }))

  // Build smooth curve
  let path = `M ${dots[0].x} ${dots[0].y}`
  for (let i = 1; i < dots.length; i++) {
    const prev = dots[i - 1]
    const curr = dots[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpx2 = prev.x + ((curr.x - prev.x) * 2) / 3
    path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`
  }

  return { path, dots }
})

const dayLabels = computed(() => {
  if (!props.chartData.length || props.isLoading) return []
  return ['Mon', 'Wed', 'Fri', 'Sun']
})
</script>

<template>
  <div
    class="rounded-xl border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
  >
    <!-- Loading skeleton -->
    <template v-if="isLoading">
      <div class="flex items-center justify-between mb-4">
        <div class="h-4 w-32 bg-plum-faint rounded animate-pulse" />
        <div class="h-8 w-24 bg-plum-faint/50 rounded-lg animate-pulse" />
      </div>
      <div class="relative h-[120px] w-full mt-4">
        <svg viewBox="0 0 440 120" class="w-full h-full opacity-20">
          <path
            d="M 10 80 C 60 80, 100 40, 150 40 C 200 40, 250 90, 300 90 C 350 90, 400 30, 440 30"
            fill="none"
            stroke="currentColor"
            class="text-plum-faint animate-pulse"
          />
        </svg>
      </div>
      <div class="mt-4 border-t border-plum-faint pt-6">
        <div class="h-4 w-40 bg-plum-faint rounded animate-pulse mb-4" />
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 mb-3">
          <div class="h-3 w-10 bg-plum-faint rounded animate-pulse" />
          <div class="flex-1 h-4 bg-plum-faint/50 rounded-full animate-pulse" />
          <div class="h-3 w-8 bg-plum-faint rounded animate-pulse" />
        </div>
      </div>
    </template>

    <!-- Empty state (Only if no data at all AND no queues to show) -->
    <div
      v-else-if="!hasData && !byQueue.length"
      class="flex flex-col items-center justify-center py-16 gap-3"
    >
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint">
        <MountainEmptyIcon class="h-5 w-5 text-plum-muted" />
      </div>
      <p class="font-display text-base font-semibold text-plum">No data yet</p>
      <p class="max-w-[240px] text-center font-body text-sm text-plum-muted leading-5">
        We will show an analysis of the same customers returning to your queues.
      </p>
    </div>

    <!-- Chart content -->
    <template v-else>
      <div
        :class="[
          'transition-opacity duration-300',
          isRefreshing ? 'opacity-50 pointer-events-none' : 'opacity-100',
        ]"
      >
        <!-- Day vs Return Rate -->
        <div class="flex flex-col gap-4 pb-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
          <h4
            class="font-body text-xs font-semibold uppercase tracking-[0.7px] text-plum-muted sm:text-sm"
          >
            Day vs. Return Rate
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

        <div class="mt-4">
          <div
            v-if="!hasData"
            class="flex flex-col items-center justify-center h-[120px] bg-plum-faint/20 rounded-xl border border-dashed border-plum-faint"
          >
            <MountainEmptyIcon class="h-5 w-5 text-plum-muted/50 mb-1" />
            <span class="font-body text-[10px] uppercase tracking-wider text-plum-muted/60"
              >No activity this period</span
            >
          </div>
          <svg
            v-else
            viewBox="0 0 440 120"
            class="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="spikeGradient"
                gradientUnits="userSpaceOnUse"
                x1="0"
                x2="440"
                y1="0"
                y2="0"
              >
                <stop
                  v-for="(dot, i) in chartPlot.dots"
                  :key="i"
                  :offset="`${(dot.x / 440) * 100}%`"
                  :stop-color="dot.rate > 0 ? 'var(--color-mint)' : 'var(--color-plum-faint)'"
                />
              </linearGradient>
            </defs>
            <path
              :d="chartPlot.path"
              fill="none"
              stroke="url(#spikeGradient)"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle
              v-for="(point, idx) in chartPlot.dots"
              :key="idx"
              :cx="point.x"
              :cy="point.y"
              :r="point.rate > 0 ? 3 : 2"
              :fill="point.rate > 0 ? 'var(--color-mint)' : 'var(--color-plum-faint)'"
              :stroke="point.rate > 0 ? 'var(--color-white)' : 'none'"
              stroke-width="2"
            />
          </svg>

          <!-- X-axis labels -->
          <div class="mt-2 flex justify-between px-2">
            <span
              v-for="label in dayLabels"
              :key="label"
              class="font-mono text-[10px] uppercase text-plum-muted sm:text-sm"
            >
              {{ label }}
            </span>
          </div>
        </div>

        <!-- Separator -->
        <div class="my-6 border-t border-plum-faint" />

        <!-- Queues vs Return Rate -->
        <h4
          class="font-body text-xs font-semibold uppercase tracking-[0.7px] text-plum-muted sm:text-sm"
        >
          Queues vs. Return Rate
        </h4>

        <div class="mt-4 flex flex-col gap-3">
          <template v-if="displayedQueues.length > 0">
            <div
              v-for="(item, idx) in displayedQueues"
              :key="item.label + idx"
              class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
            >
              <span
                class="font-body text-[11px] font-semibold text-plum-muted truncate sm:w-24 sm:shrink-0 sm:text-xs"
                :title="item.label"
              >
                {{ item.label || 'Unnamed Queue' }}
              </span>
              <div class="flex flex-1 items-center gap-3">
                <div class="flex-1 h-3 rounded-full bg-plum-faint/50 overflow-hidden sm:h-4">
                  <div
                    class="h-full rounded-full bg-mint transition-all duration-700"
                    :style="{ width: `${item.rate}%` }"
                  />
                </div>
                <span class="w-8 text-right font-mono text-xs font-bold text-plum sm:text-sm">
                  {{ Math.round(item.rate || 0) }}%
                </span>
              </div>
            </div>

            <!-- Show more / less button -->
            <button
              v-if="byQueue.length > 3"
              class="mt-1 self-start font-body text-[10px] font-bold uppercase tracking-wider text-plum-muted hover:text-plum transition-colors"
              @click="isExpanded = !isExpanded"
            >
              {{ isExpanded ? 'Show less' : `+ ${byQueue.length - 3} more queues` }}
            </button>
          </template>
          <div v-else class="py-4 text-center border border-dashed border-plum-faint rounded-xl">
            <p class="font-body text-xs text-plum-muted">No activity this week</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
