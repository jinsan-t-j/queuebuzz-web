<script setup lang="ts">
/**
 * @component WaitingProgress
 * @description Buzz notification status indicator.
 *
 * @prop {Number} position - Current position.
 * @prop {Number} totalInQueue - Total in queue.
 * @prop {Number} servedCount - Number served so far.
 * @prop {Boolean} buzzEnabled - Whether push notifications are enabled.
 */

defineProps({
  position: { type: Number, default: 4 },
  totalInQueue: { type: Number, default: 23 },
  servedCount: { type: Number, default: 8 },
  buzzEnabled: { type: Boolean, default: true },
  permissionGranted: { type: Boolean, default: true },
})
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <template v-if="buzzEnabled && permissionGranted">
      <span class="h-1.5 w-1.5 rounded-full bg-mint" />
      <span class="font-body text-sm text-plum-muted">You'll be buzzed when it's your turn</span>
    </template>
  </div>
</template>
