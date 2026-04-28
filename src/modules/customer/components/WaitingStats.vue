<script setup lang="ts">
/**
 * @component WaitingStats
 * @description Three stat cards showing position, ahead count, and estimated wait time.
 * Matches Figma Waiting screen layout with progress line underneath.
 *
 * @prop {Number} position - Current position in queue.
 * @prop {Number} ahead - Number of people ahead.
 * @prop {Number} estWaitMin - Estimated wait time in minutes.
 * @prop {Number} totalInQueue - Total people in queue.
 */

// 1. Vue core imports

// 6. Props
defineProps({
  position: { type: Number, default: null },
  ahead: { type: Number, default: null },
  estWaitMin: { type: Number, default: null },
})
</script>

<template>
  <div>
    <!-- Three stat cards -->
    <div class="flex gap-2.5">
      <!-- Position -->
      <div
        class="flex flex-1 flex-col items-center rounded-[18px] border border-white bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <span class="font-mono text-4xl leading-[45px] text-plum">#{{ position }}</span>
        <span class="mt-1 font-body text-sm font-bold uppercase tracking-tight text-plum-muted"
          >Position</span
        >
      </div>

      <!-- Ahead -->
      <div
        class="flex flex-1 flex-col items-center rounded-[18px] border border-white bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <span class="font-mono text-4xl leading-[45px] text-plum">{{ ahead }}</span>
        <span class="mt-1 font-body text-sm font-bold uppercase tracking-tight text-plum-muted"
          >Ahead</span
        >
      </div>

      <!-- Est. Wait -->
      <div
        class="flex flex-1 flex-col items-center rounded-[18px] border border-white bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <span class="font-mono text-[28px] text-mint">~{{ estWaitMin }}m</span>
        <span class="mt-1 font-body text-sm font-bold uppercase tracking-tight text-plum-muted"
          >Est. Wait</span
        >
      </div>
    </div>
  </div>
</template>
