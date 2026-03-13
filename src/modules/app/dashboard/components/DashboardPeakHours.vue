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
    barHeight: `${(d.value / maxVal) * 100}%`
  }))
})
</script>

<template>
  <div
    class="rounded-xl border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <div class="flex items-center justify-between">
      <h4
        class="font-body text-sm font-bold uppercase tracking-[0.7px] text-plum-muted"
      >
        Peak Hours
      </h4>

      <div class="flex gap-1 rounded-lg bg-plum-faint/50 p-0.5">
        <button
          v-for="tab in timeframes"
          :key="tab.key"
          :class="[
            'rounded-md px-3 py-1 font-body text-xs font-medium transition-colors',
            activeTimeframe === tab.key
              ? 'bg-white text-plum shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
              : 'text-plum-muted hover:text-plum',
          ]"
          @click="setTimeframe(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!hasData"
      class="flex flex-col items-center justify-center py-8 gap-3"
    >
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
        <span class="font-mono text-[10px] text-plum-muted">12 AM</span>
        <span class="font-mono text-[10px] text-plum-muted">12 PM</span>
        <span class="font-mono text-[10px] text-plum-muted">11 PM</span>
      </div>
    </div>
  </div>
</template>
