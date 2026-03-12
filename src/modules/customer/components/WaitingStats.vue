<script setup>
/**
 * @component WaitingStats
 * @description Three stat cards showing position, ahead count, and estimated wait time.
 *
 * @prop {Number} position - Current position in queue.
 * @prop {Number} ahead - Number of people ahead.
 * @prop {Number} estWaitMin - Estimated wait time in minutes.
 * @prop {Number} totalInQueue - Total people in queue.
 */

// 6. Props
defineProps({
  position: { type: Number, default: 4 },
  ahead: { type: Number, default: 3 },
  estWaitMin: { type: Number, default: 12 },
  totalInQueue: { type: Number, default: 23 },
})
</script>

<template>
  <div>
    <!-- Three stat cards -->
    <div class="flex gap-2.5">
      <!-- Position -->
      <div class="flex flex-1 flex-col items-center rounded-[18px] border border-white bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <span class="font-mono text-4xl leading-[45px] text-plum">#{{ position }}</span>
        <span class="mt-1 font-body text-[10px] font-bold uppercase tracking-tight text-plum-muted">Position</span>
      </div>

      <!-- Ahead -->
      <div class="flex flex-1 flex-col items-center rounded-[18px] border border-white bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <span class="font-mono text-4xl leading-[45px] text-plum">{{ ahead }}</span>
        <span class="mt-1 font-body text-[10px] font-bold uppercase tracking-tight text-plum-muted">Ahead</span>
      </div>

      <!-- Est. Wait -->
      <div class="flex flex-1 flex-col items-center rounded-[18px] border border-white bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <span class="font-mono text-[28px] text-mint">~{{ estWaitMin }}m</span>
        <span class="mt-1 font-body text-[10px] font-bold uppercase tracking-tight text-plum-muted">Est. Wait</span>
      </div>
    </div>

    <!-- Position text -->
    <p class="mt-2 text-center font-body text-[13px] text-plum">
      Position {{ position }} of {{ totalInQueue }}
    </p>
  </div>
</template>
