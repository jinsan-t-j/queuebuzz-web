<script setup lang="ts">
/**
 * @component WaitingAdUnit
 * @description Sponsored ad placeholder shown when estimated wait is above threshold.
 *
 * @prop {Number} estWaitMin - Estimated wait time in minutes.
 */

// 6. Props
defineProps({
  estWaitMin: { type: Number, default: 0 },
})
</script>

<template>
  <div v-if="estWaitMin > 3" class="text-center">
    <p class="mb-3 font-body text-sm font-bold uppercase tracking-[1px] text-plum-muted/60">
      Sponsored
    </p>
    <div class="rounded-xl border border-plum-faint bg-white p-2">
      <!-- 320×100 AdSense placeholder — swap inner content in production -->
      <div class="flex h-[100px] w-full items-center justify-center rounded-lg bg-plum-faint">
        <span class="font-display text-sm text-plum-muted/40">320x100 Ad Space</span>
      </div>
    </div>
  </div>
</template>
