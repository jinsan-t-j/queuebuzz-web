<script setup>
/**
 * @component WaitingProgress
 * @description Buzz notification status indicator.
 *
 * @prop {Number} position - Current position.
 * @prop {Number} totalInQueue - Total in queue.
 * @prop {Number} servedCount - Number served so far.
 * @prop {Boolean} buzzEnabled - Whether push notifications are enabled.
 * @emits {enable-buzz} - Emitted to enable notifications.
 */

// 6. Props
defineProps({
  position: { type: Number, default: 4 },
  totalInQueue: { type: Number, default: 23 },
  servedCount: { type: Number, default: 8 },
  buzzEnabled: { type: Boolean, default: true },
})

// 7. Emits
const emit = defineEmits(['enable-buzz'])
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <template v-if="buzzEnabled">
      <span class="h-1.5 w-1.5 rounded-full bg-mint" />
      <span class="font-body text-[13px] text-plum-muted">You'll be buzzed when it's your turn</span>
    </template>
    <template v-else>
      <span class="h-1.5 w-1.5 rounded-full bg-warning" />
      <button class="cursor-pointer font-body text-[13px] text-warning" @click="emit('enable-buzz')">
        Tap to enable notifications
      </button>
    </template>
  </div>
</template>
