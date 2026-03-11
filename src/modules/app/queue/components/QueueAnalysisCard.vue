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
import TrendUpIcon from '@/assets/icons/trend-up.svg?component'

defineProps({
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
})
</script>

<template>
  <div class="flex flex-1 flex-col rounded-card border border-plum/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <!-- Header -->
    <div class="flex items-center justify-between px-8 py-6">
      <h3 class="font-display text-xl font-bold text-plum">Queue Analysis</h3>
      <span class="flex items-center gap-[7px] rounded-lg bg-plum/5 px-3 py-1">
        <span class="h-[6px] w-[6px] rounded-full bg-mint" />
        <span class="font-body text-[10px] font-bold uppercase tracking-[1px] text-plum/40">Active</span>
      </span>
    </div>

    <!-- Stats row -->
    <div class="mx-8 rounded-card border border-plum/5 bg-plum/[0.02] p-8">
      <div class="flex">
        <!-- Served Today -->
        <div class="flex-1">
          <p class="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-plum/40">
            Served Today
          </p>
          <p class="mt-2 font-mono text-[60px] font-bold leading-none tracking-tight text-plum">
            {{ servedToday }}
          </p>
          <span class="mt-3 inline-flex items-center gap-1 rounded-full bg-mint/10 px-2 py-1">
            <TrendUpIcon class="h-[7px] w-3 text-mint" />
            <span class="font-body text-xs font-medium text-mint">{{ trendText }}</span>
          </span>
        </div>
        <!-- Completion Rate -->
        <div class="flex flex-col border-l border-plum/10 pl-8">
          <p class="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-plum/40">
            Completion Rate
          </p>
          <div class="mt-2 flex items-baseline">
            <span class="font-mono text-4xl font-bold leading-10 text-plum">{{ completionRate }}</span>
            <span class="font-mono text-xl font-bold text-plum/40">%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bar chart (simplified) -->
    <div class="flex flex-1 items-end gap-4 px-8 pb-4 pt-8">
      <div
        v-for="(bar, idx) in chartBars"
        :key="idx"
        class="flex flex-1 flex-col items-center gap-2"
      >
        <div
          class="w-full rounded-t-lg"
          :class="idx === 4 ? 'bg-mint' : 'bg-plum/10'"
          :style="{ height: `${bar * 1.5}px` }"
        />
      </div>
    </div>
    <div class="flex gap-4 px-8 pb-6">
      <span
        v-for="label in chartLabels"
        :key="label"
        class="flex-1 text-center font-mono text-[10px] uppercase tracking-[1px] text-plum/30"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>
