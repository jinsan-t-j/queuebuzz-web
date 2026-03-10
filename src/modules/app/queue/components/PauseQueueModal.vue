<script setup>
/**
 * @component PauseQueueModal
 * @description Confirmation modal for pausing an active queue.
 * Shows a warning icon, explanatory text, and actions to pause or keep running.
 *
 * @prop {Boolean} isOpen - Whether the modal is visible.
 * @emits {pause-queue} - User confirmed pausing the queue.
 * @emits {keep-running} - User chose to cancel the pause action.
 */

import WarningTriangleIcon from '@/assets/icons/warning-triangle.svg?component'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['pause-queue', 'keep-running'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
    >
      <div class="w-full max-w-[480px] rounded-card bg-white p-12 text-center shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
        <!-- Warning icon -->
        <div class="mx-auto mb-8">
          <WarningTriangleIcon class="mx-auto h-9 w-10 text-warning" />
        </div>

        <h2 class="font-body text-2xl font-bold text-plum">Pause this queue?</h2>
        <p class="mx-auto mt-4 max-w-[407px] font-body text-sm leading-relaxed text-[#475569]">
          Guests will not be able to join the queue while it is paused. Your current waiting list will be preserved.
        </p>

        <!-- Actions -->
        <div class="mt-8 flex flex-col items-center gap-3">
          <button
            class="w-full rounded-input bg-warning px-8 py-3 font-body text-base font-bold text-white transition-colors hover:bg-warning/90"
            @click="emit('pause-queue')"
          >
            Pause Queue
          </button>
          <button
            class="font-body text-base font-bold text-plum transition-colors hover:text-plum-muted"
            @click="emit('keep-running')"
          >
            Keep Running
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
