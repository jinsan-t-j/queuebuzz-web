<script setup>
/**
 * @component QueueStatCards
 * @description Row of two stat cards showing "Waiting Now" count and
 * "Avg. Wait" time. Used across both authenticated and anonymous
 * active queue views.
 *
 * @prop {Number} waitingCount - Number of guests currently waiting.
 * @prop {String} avgWait - Average wait time string (e.g. "12").
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import HourglassIcon from '@/assets/icons/hourglass.svg?component'
import ClockWaitIcon from '@/assets/icons/clock-wait.svg?component'

// 6. Props
defineProps({
  waitingCount: {
    type: Number,
    default: 0,
  },
  avgWait: {
    type: String,
    default: '0',
  },
})

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex gap-4">
    <!-- Waiting Now -->
    <div class="flex-1 rounded-card border border-plum/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div class="flex items-center justify-between">
        <p class="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-plum/40">
          Waiting Now
        </p>
        <HourglassIcon class="h-5 w-4 text-plum/20" />
      </div>
      <p class="mt-2 font-mono text-5xl font-bold leading-none text-plum">
        {{ String(waitingCount).padStart(2, '0') }}
      </p>
    </div>
    <!-- Avg. Wait -->
    <div class="flex-1 rounded-card border border-plum/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div class="flex items-center justify-between">
        <p class="font-body text-[11px] font-bold uppercase tracking-[1.1px] text-plum/40">
          Avg. Wait
        </p>
        <ClockWaitIcon class="h-[21px] w-[18px] text-plum/20" />
      </div>
      <div class="mt-2 flex items-baseline">
        <span class="font-mono text-5xl font-bold leading-none text-plum">{{ avgWait }}</span>
        <span class="ml-1 font-mono text-xl font-bold text-plum/40">m</span>
      </div>
    </div>
  </div>
</template>
