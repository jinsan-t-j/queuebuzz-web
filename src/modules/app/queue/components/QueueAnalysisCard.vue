<script setup lang="ts">
/**
 * @component QueueAnalysisCard
 * @description A card displaying high-level statistics about the queue,
 * including served today count, completion rate, and an activity bar chart.
 *
 * @prop {Number} servedToday - Total served today.
 * @prop {String} trendText - Trend comparison text for served today.
 * @prop {Number} completionRate - Completion rate percentage.
 * @prop {Array} chartLabels - Labels for the activity bar chart.
 * @prop {Array} chartBars - Data values for the activity bar chart.
 */
import { computed } from 'vue'

import TrendUpIcon from '@/assets/icons/trend-up.svg?component'

interface Props {
  servedToday: number
  trendText: string
  completionRate: number
  chartLabels: string[]
  chartBars: number[]
  trendDirection?: 'up' | 'down' | 'flat'
  viewType?: 'day' | 'week'
}

const props = withDefaults(defineProps<Props>(), {
  trendDirection: 'up',
  viewType: 'day',
})

const emit = defineEmits<{
  (e: 'update:viewType', value: 'day' | 'week'): void
}>()

const maxBarValue = computed(() => Math.max(1, ...props.chartBars))
const statsLabel = computed(() => (props.viewType === 'week' ? 'Served this Week' : 'Served Today'))
</script>

<template>
  <div
    class="flex flex-1 flex-col rounded-card border border-plum/5 dark:border-plum-faint bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
  >
    <!-- Header -->
    <div
      class="px-6 py-4 sm:px-8 sm:py-6 border-b border-plum/5 sm:border-none flex items-center justify-between"
    >
      <h3 class="font-display text-lg sm:text-xl font-bold text-plum">Queue Analysis</h3>
      <div class="flex items-center gap-1 bg-sand p-1 rounded-xl border border-plum-faint">
        <button
          :class="[
            'px-3 py-1 text-xs font-semibold rounded-lg transition-colors font-body cursor-pointer',
            viewType === 'day' ? 'bg-plum text-sand' : 'text-plum-muted hover:text-plum',
          ]"
          @click="emit('update:viewType', 'day')"
        >
          Day
        </button>
        <button
          :class="[
            'px-3 py-1 text-xs font-semibold rounded-lg transition-colors font-body cursor-pointer',
            viewType === 'week' ? 'bg-plum text-sand' : 'text-plum-muted hover:text-plum',
          ]"
          @click="emit('update:viewType', 'week')"
        >
          Week
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div
      class="mx-4 sm:mx-8 mt-6 sm:mt-0 rounded-card border border-plum/5 dark:border-plum-faint bg-plum/[0.02] dark:bg-plum-faint/10 p-6 sm:p-8"
    >
      <div class="flex flex-col gap-6 sm:flex-row sm:gap-0">
        <!-- Served Today / Week -->
        <div class="flex-1">
          <p class="font-body text-xs sm:text-sm font-bold uppercase tracking-[1.1px] text-plum/40">
            {{ statsLabel }}
          </p>
          <p
            class="mt-1 sm:mt-2 font-mono text-[48px] sm:text-[60px] font-bold leading-none tracking-tight text-plum"
          >
            {{ servedToday }}
          </p>
          <span
            class="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1"
            :class="{
              'bg-danger/10': trendDirection === 'down',
              'bg-mint/10': trendDirection === 'up',
              'bg-plum/5': trendDirection === 'flat' || !trendDirection,
            }"
          >
            <TrendUpIcon
              v-if="trendDirection !== 'flat'"
              class="h-[7px] w-3 transition-transform"
              :class="[trendDirection === 'down' ? 'rotate-180 text-danger' : 'text-mint']"
            />
            <span
              class="font-body text-sm font-medium"
              :class="{
                'text-danger': trendDirection === 'down',
                'text-mint': trendDirection === 'up',
                'text-plum-muted': trendDirection === 'flat' || !trendDirection,
              }"
            >
              {{ trendText }}
            </span>
          </span>
        </div>
        <!-- Completion Rate -->
        <div
          class="flex flex-col border-t sm:border-t-0 sm:border-l border-plum/10 pt-6 sm:pt-0 sm:pl-8"
        >
          <p class="font-body text-xs sm:text-sm font-bold uppercase tracking-[1.1px] text-plum/40">
            Completion Rate
          </p>
          <div class="mt-1 sm:mt-2 flex items-baseline">
            <span class="font-mono text-3xl sm:text-4xl font-bold leading-10 text-plum">{{
              completionRate
            }}</span>
            <span class="font-mono text-lg sm:text-xl font-bold text-plum/40">%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bar chart -->
    <div class="flex flex-1 items-end gap-3 px-8 pb-3 pt-8">
      <div
        v-for="(bar, idx) in chartBars"
        :key="idx"
        class="group relative flex flex-1 flex-col items-center justify-end h-[60px]"
      >
        <!-- Tooltip on hover -->
        <div
          class="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-plum px-2 py-1 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10"
        >
          {{ bar }} served
        </div>

        <div
          class="w-full rounded-t-lg transition-all duration-500 ease-out"
          :class="[
            idx === chartBars.length - 1
              ? 'bg-mint'
              : 'bg-plum/10 dark:bg-plum-faint/20 group-hover:bg-plum/20 dark:group-hover:bg-plum-faint/30',
            bar === 0 ? 'bg-plum/[0.03] dark:bg-plum-faint/5' : '',
          ]"
          :style="{ height: `${Math.max((bar / maxBarValue) * 60, 4)}px` }"
        />
      </div>
    </div>

    <!-- Labels -->
    <div class="flex gap-2 sm:gap-3 px-6 sm:px-8 pb-6 sm:pb-8">
      <span
        v-for="label in chartLabels"
        :key="label"
        class="flex-1 text-center font-mono text-[10px] sm:text-sm font-bold uppercase tracking-[1px] text-plum/30"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>
