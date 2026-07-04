<script setup lang="ts">
/**
 * @component QueueStatCards
 * @description Row of two stat cards showing "Waiting Now" count and
 * "Avg. Wait" time. Used across both authenticated and anonymous
 * active queue views.
 *
 * @prop {Number} waitingCount - Number of guests currently waiting.
 * @prop {Number} avgWaitTime - Average wait time in minutes.
 * @prop {Number} bufferMins - Push delay wait time buffer in minutes.
 * @prop {Boolean} allowPush - Whether to show push delay controls (host views only).
 */

import { Info, Trash2 } from 'lucide-vue-next'

import ClockWaitIcon from '@/assets/icons/clock-wait.svg?component'
import HourglassIcon from '@/assets/icons/hourglass.svg?component'
import BaseTooltip from '@/components/base/BaseTooltip.vue'

const props = defineProps({
  waitingCount: {
    type: Number,
    default: 0,
  },
  avgWaitTime: {
    type: Number,
    default: 0,
  },
  bufferMins: {
    type: Number,
    default: 0,
  },
  allowPush: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'update-buffer', value: number): void
}>()

function isButtonActive(mins: number): boolean {
  if (props.bufferMins <= 0) return false
  if (mins === 5) return props.bufferMins > 0 && props.bufferMins <= 5
  if (mins === 10) return props.bufferMins > 5 && props.bufferMins <= 10
  if (mins === 15) return props.bufferMins > 10
  return false
}

function formatDuration(totalMins: number): string {
  if (totalMins < 60) {
    return `${totalMins}m`
  }

  const days = Math.floor(totalMins / 1440)
  const remainingMinsAfterDays = totalMins % 1440
  const hours = Math.floor(remainingMinsAfterDays / 60)
  const mins = remainingMinsAfterDays % 60

  const parts = []
  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`)
  }
  if (mins > 0 || (days === 0 && hours === 0)) {
    parts.push(`${mins}m`)
  }
  return parts.join(' ')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Stats Cards Row -->
    <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <!-- Waiting Now -->
      <div
        class="flex-1 rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
      >
        <div class="flex items-center justify-between">
          <p class="font-display text-xs font-bold text-plum-muted sm:text-sm">Waiting Now</p>
          <HourglassIcon class="h-4 w-3 text-plum" />
        </div>
        <p class="mt-1 sm:mt-2 font-mono text-3xl sm:text-5xl font-bold leading-none text-plum">
          {{ String(waitingCount).padStart(2, '0') }}
        </p>
      </div>
      <!-- Avg. Wait -->
      <div
        class="flex-1 rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none relative"
      >
        <div class="flex items-center justify-between">
          <p class="font-display text-xs font-bold text-plum-muted sm:text-sm">Avg. Wait</p>
          <ClockWaitIcon class="h-4 w-3 text-plum" />
        </div>
        <div class="mt-1 sm:mt-2 flex items-baseline justify-between w-full">
          <div class="flex items-baseline">
            <template v-if="avgWaitTime < 60">
              <span class="font-mono text-3xl sm:text-5xl font-bold leading-none text-plum">{{
                avgWaitTime
              }}</span>
              <span class="ml-1 font-mono text-lg sm:text-xl font-bold text-plum-muted">m</span>
            </template>
            <template v-else>
              <span class="font-mono text-xl sm:text-3xl font-bold leading-none text-plum">{{
                formatDuration(avgWaitTime)
              }}</span>
            </template>
          </div>
          <span
            v-if="bufferMins > 0"
            class="font-body text-[10px] sm:text-xs text-warning font-semibold self-end mb-1"
          >
            {{ formatDuration(avgWaitTime + bufferMins) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Push Time Bouncer Controls -->
    <div
      v-if="allowPush"
      class="rounded-card border border-plum-faint bg-white p-3 sm:px-4 sm:py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div class="flex items-center gap-1.5">
        <span class="font-body text-[10px] font-bold uppercase tracking-wider text-plum-muted"
          >Push Delay</span
        >
        <BaseTooltip text="Push extra wait time shown to each customers.">
          <Info class="h-3.5 w-3.5 text-plum-muted cursor-help" />
        </BaseTooltip>
      </div>
      <div class="flex items-center gap-1.5 w-full sm:w-auto">
        <button
          v-for="mins in [5, 10, 15]"
          :key="mins"
          class="flex-1 sm:flex-initial min-w-[44px] sm:min-w-[48px] py-1.5 px-2 rounded-lg border font-body text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1"
          :class="[
            isButtonActive(mins)
              ? 'border-warning bg-warning/10 text-warning hover:border-danger hover:bg-danger/10 hover:text-danger'
              : 'border-plum-faint hover:border-plum text-plum bg-sand/30',
          ]"
          @click="emit('update-buffer', isButtonActive(mins) ? 0 : mins)"
        >
          <span>+{{ mins }}m</span>
          <Trash2 v-if="isButtonActive(mins)" class="h-3.5 w-3.5 flex-shrink-0" />
        </button>
      </div>
    </div>
  </div>
</template>
