<script setup lang="ts">
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
import BasePillSelector from '@/components/base/BasePillSelector.vue'

interface PeakData {
  hour: string
  day?: number
  value: number
}

const props = withDefaults(
  defineProps<{
    data?: PeakData[]
    hasData?: boolean
    isLoading?: boolean
  }>(),
  {
    data: () => [],
    hasData: false,
    isLoading: false,
  },
)

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

const HOURS_24 = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
]

const processedData = computed(() => {
  if (activeTimeframe.value === 'today') {
    const hourMap = new Map<string, number>()
    const todayDayIdx = new Date().getDay()
    props.data.forEach((d) => {
      if (d.day === todayDayIdx) {
        hourMap.set(d.hour, (hourMap.get(d.hour) || 0) + d.value)
      }
    })

    const aggregated = HOURS_24.map((hour) => ({
      label: hour,
      value: hourMap.get(hour) || 0,
    }))

    const maxVal = Math.max(...aggregated.map((d) => d.value), 1)
    return aggregated.map((d) => ({
      ...d,
      barHeight: `${(d.value / maxVal) * 100}%`,
    }))
  } else {
    // Week timeframe: aggregate by weekday (Mon to Sun: 1, 2, 3, 4, 5, 6, 0)
    const dayMap = new Map<number, number>()
    props.data.forEach((d) => {
      if (d.day !== undefined) {
        dayMap.set(d.day, (dayMap.get(d.day) || 0) + d.value)
      }
    })

    const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0] // Monday to Sunday
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const aggregated = DAYS_ORDER.map((dayIdx) => ({
      label: dayNames[dayIdx],
      value: dayMap.get(dayIdx) || 0,
    }))

    const maxVal = Math.max(...aggregated.map((d) => d.value), 1)
    return aggregated.map((d) => ({
      ...d,
      barHeight: `${(d.value / maxVal) * 100}%`,
    }))
  }
})

const hasPeakData = computed(() => {
  return props.hasData && processedData.value.some((d) => d.value > 0)
})
</script>

<template>
  <div
    class="rounded-xl border border-plum-faint bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h4 class="font-body text-xs font-bold uppercase tracking-[0.7px] text-plum-muted sm:text-sm">
        Peak Hours
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
    <div v-if="isLoading" class="mt-4 flex items-end gap-[1px] h-[84px] sm:gap-1">
      <div
        v-for="i in activeTimeframe === 'today' ? 24 : 7"
        :key="i"
        class="flex-1 rounded-t-sm bg-plum-faint animate-pulse"
        :style="{
          height:
            activeTimeframe === 'today'
              ? `${[40, 20, 10, 10, 10, 20, 50, 80, 70, 40, 30, 25, 45, 60, 90, 100, 80, 60, 50, 40, 60, 75, 40, 20][i - 1]}%`
              : `${[30, 50, 80, 60, 40, 70, 90][i - 1]}%`,
        }"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasPeakData" class="flex flex-col items-center justify-center py-10 gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint">
        <PeakEmptyIcon class="h-6 w-6 text-plum-muted" />
      </div>
      <p class="font-display text-base font-semibold text-plum">Not enough data</p>
      <p class="max-w-[200px] text-center font-body text-sm text-plum-muted leading-5">
        Peak hours will appear after your first few sessions.
      </p>
    </div>

    <!-- Chart -->
    <div v-else class="mt-4">
      <div class="flex items-end gap-[1px] h-20 sm:gap-px">
        <div
          v-for="item in processedData"
          :key="item.label"
          class="flex-1 flex items-end justify-center h-full"
        >
          <div
            class="w-full max-w-[14px] rounded-t-xs bg-mint/60 transition-all duration-500 hover:bg-mint"
            :style="{ height: item.barHeight }"
          />
        </div>
      </div>

      <!-- Hour/Day labels -->
      <div class="mt-2">
        <div v-if="activeTimeframe === 'today'" class="flex justify-between">
          <span class="font-mono text-[10px] text-plum-muted sm:text-sm">12 AM</span>
          <span class="font-mono text-[10px] text-plum-muted sm:text-sm">12 PM</span>
          <span class="font-mono text-[10px] text-plum-muted sm:text-sm">11 PM</span>
        </div>
        <div v-else class="flex gap-[1px] sm:gap-px">
          <span
            v-for="item in processedData"
            :key="item.label"
            class="flex-1 text-center font-mono text-[9px] sm:text-[10px] text-plum-muted uppercase"
          >
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
