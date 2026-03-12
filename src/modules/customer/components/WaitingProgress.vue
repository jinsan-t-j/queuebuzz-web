<script setup>
/**
 * @component WaitingProgress
 * @description Progress bar with notification status.
 *
 * @prop {Number} position - Current position.
 * @prop {Number} totalInQueue - Total in queue.
 * @prop {Number} servedCount - Number served so far.
 * @prop {Boolean} buzzEnabled - Whether push notifications are enabled.
 * @emits {enable-buzz} - Emitted to enable notifications.
 */

// 1. Vue core imports
import { computed } from 'vue'

// 6. Props
const props = defineProps({
  position: { type: Number, default: 4 },
  totalInQueue: { type: Number, default: 23 },
  servedCount: { type: Number, default: 8 },
  buzzEnabled: { type: Boolean, default: true },
})

// 7. Emits
const emit = defineEmits(['enable-buzz'])

// 10. Computed
const progressPercent = computed(() => {
  if (props.totalInQueue === 0) return 0
  return Math.round((props.servedCount / props.totalInQueue) * 100)
})
</script>

<template>
  <div>
    <!-- Progress bar -->
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-plum-faint">
      <div
        class="h-full rounded-full bg-mint transition-all duration-700 ease-out"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Notification row -->
    <div class="mt-3 flex items-center justify-center gap-2">
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
  </div>
</template>
