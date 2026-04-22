<script setup>
/**
 * @component DashboardPeakHours
 * @description Bar chart showing peak hours distribution.
 * Pure CSS bars — no external chart library.
 *
 * @prop {Array} data - Array of { hour, value }.
 * @prop {Boolean} hasData - Whether to show chart or empty state.
 */

import { computed, ref } from 'vue'
import BasePillSelector from '@/components/base/BasePillSelector.vue'
import PeakEmptyIcon from '@/assets/icons/peak-empty.svg?component'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  hasData: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['timeframe-change'])

const activeTimeframe = ref('week') // Peak hours usually defaults to week for better data
const timeframes = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
]

function setTimeframe(key) {
  activeTimeframe.value = key
  emit('timeframe-change', key)
}

const processedData = computed(() => {
  if (!props.data.length) return []
  const maxVal = Math.max(...props.data.map((d) => d.value), 1)
  return props.data.map((d) => ({
    ...d,
    barHeight: `${(d.value / maxVal) * 100}%`,
  }))
})
</script>

<template>
  <div class="rounded-xl border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <div class="flex items-center justify-between">
      <h4 class="font-body text-sm font-bold uppercase tracking-[0.7px] text-plum-muted">
        Peak Hours
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
    <div v-if="isLoading" class="mt-4 flex items-end gap-1 px-1 h-[84px]">
      <div
        v-for="i in 24"
        :key="i"
        class="flex-1 rounded-t-sm bg-plum-faint animate-pulse"
        :style="{
          height: `${[40, 20, 10, 10, 10, 20, 50, 80, 70, 40, 30, 25, 45, 60, 90, 100, 80, 60, 50, 40, 60, 75, 40, 20][i - 1]}%`,
        }"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-8 gap-3">
      <PeakEmptyIcon class="h-7 w-8 text-plum-faint" />
      <p class="font-body text-sm text-ash">Not enough data yet</p>
    </div>

    <!-- Chart -->
    <div v-else class="mt-4">
      <div class="flex items-end gap-px h-20">
        <div
          v-for="item in processedData"
          :key="item.hour"
          class="flex-1 flex items-end justify-center h-full"
        >
          <div
            class="w-full max-w-[14px] rounded-t-xs bg-mint/60 transition-all duration-500 hover:bg-mint"
            :style="{ height: item.barHeight }"
          />
        </div>
      </div>

      <!-- Hour labels -->
      <div class="mt-2 flex justify-between">
        <span class="font-mono text-sm text-plum-muted">12 AM</span>
        <span class="font-mono text-sm text-plum-muted">12 PM</span>
        <span class="font-mono text-sm text-plum-muted">11 PM</span>
      </div>
    </div>
  </div>
</template>
