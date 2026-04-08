<script setup>
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

const props = defineProps({
  servedToday: {
    type: Number,
    required: true,
  },
  trendText: {
    type: String,
    required: true,
  },
  completionRate: {
    type: Number,
    required: true,
  },
  chartLabels: {
    type: Array,
    required: true,
  },
  chartBars: {
    type: Array,
    required: true,
  },
  trendDirection: {
    type: String,
    default: 'up',
  },
})

const maxBarValue = computed(() => Math.max(1, ...props.chartBars))
</script>

<template>
  <div
    class="flex flex-1 flex-col rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <!-- Header -->
    <div class="px-8 py-6">
      <h3 class="font-display text-xl font-bold text-plum">Queue Analysis</h3>
    </div>

    <!-- Stats row -->
    <div class="mx-8 rounded-card border border-plum/5 bg-plum/[0.02] p-8">
      <div class="flex">
        <!-- Served Today -->
        <div class="flex-1">
          <p class="font-body text-sm font-bold uppercase tracking-[1.1px] text-plum/40">
            Served Today
          </p>
          <p class="mt-2 font-mono text-[60px] font-bold leading-none tracking-tight text-plum">
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
        <div class="flex flex-col border-l border-plum/10 pl-8">
          <p class="font-body text-sm font-bold uppercase tracking-[1.1px] text-plum/40">
            Completion Rate
          </p>
          <div class="mt-2 flex items-baseline">
            <span class="font-mono text-4xl font-bold leading-10 text-plum">{{
              completionRate
            }}</span>
            <span class="font-mono text-xl font-bold text-plum/40">%</span>
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
            idx === chartBars.length - 1 ? 'bg-mint' : 'bg-plum/10 group-hover:bg-plum/20',
            bar === 0 ? 'bg-plum/[0.03]' : '',
          ]"
          :style="{ height: `${Math.max((bar / maxBarValue) * 60, 4)}px` }"
        />
      </div>
    </div>

    <!-- Labels -->
    <div class="flex gap-3 px-8 pb-8">
      <span
        v-for="label in chartLabels"
        :key="label"
        class="flex-1 text-center font-mono text-sm font-bold uppercase tracking-[1px] text-plum/30"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>
