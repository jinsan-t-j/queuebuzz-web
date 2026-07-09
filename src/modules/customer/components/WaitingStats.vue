<script setup lang="ts">
/**
 * @component WaitingStats
 * @description Stat cards for the customer waiting screen.
 * When manualPositioning is true, exact position is hidden because the host
 * calls guests manually, not in a strict FIFO order.
 * Shows a friendly "You're on the list!" with estimated wait only.
 *
 * @prop {Number} position - Current position in queue.
 * @prop {Number} ahead - Number of people ahead.
 * @prop {Number} estWaitMin - Estimated wait time in minutes.
 */

defineProps({
  position: { type: Number, default: null },
  ahead: { type: Number, default: null },
  estWaitMin: { type: Number, default: null },
  manualPositioning: { type: Boolean, default: false },
})
</script>

<template>
  <div>
    <template v-if="manualPositioning">
      <div
        class="flex flex-[2] flex-col items-center justify-center rounded-[18px] border border-white bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <span class="font-display text-lg font-bold text-plum">You're on the list!</span>
        <span class="mt-1 font-body text-xs text-plum-muted text-center leading-relaxed">
          Seating depends on availability — you'll be called when a spot opens for your group.
        </span>
      </div>
    </template>

    <!-- Standard FIFO mode: show all three stat cards -->
    <template v-else>
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
          <span class="font-mono text-[28px] text-mint-dark">~{{ estWaitMin }}m</span>
          <span class="mt-1 font-body text-sm font-bold uppercase tracking-tight text-plum-muted"
            >Est. Wait</span
          >
        </div>
      </div>
    </template>
  </div>
</template>
