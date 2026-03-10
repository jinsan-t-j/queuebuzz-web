<script setup>
/**
 * @component TerminateQueueModal
 * @description Confirmation modal for closing/terminating an active queue.
 * Shows a warning icon, the number of people still waiting, and
 * "Close Queue" / "Keep Open" actions.
 *
 * @prop {Boolean} isOpen - Whether the modal is visible.
 * @prop {Number} stillWaitingCount - Number of people still waiting.
 * @emits {close-queue} - User confirmed closing the queue.
 * @emits {keep-open} - User chose to keep the queue open.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import WarningTriangleIcon from '@/assets/icons/warning-triangle.svg?component'

// 6. Props
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  stillWaitingCount: {
    type: Number,
    default: 12,
  },
})

// 7. Emits
const emit = defineEmits(['close-queue', 'keep-open'])

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
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
          <WarningTriangleIcon class="mx-auto h-9 w-10 text-danger" />
        </div>

        <h2 class="font-body text-2xl font-bold text-plum">Close this queue?</h2>
        <p class="mx-auto mt-4 max-w-[407px] font-body text-sm leading-relaxed text-[#475569]">
          {{ stillWaitingCount }} people are still waiting for their turn. This action will cancel
          their sessions.
        </p>

        <!-- Still waiting count -->
        <p class="mt-6 font-display text-[32px] font-semibold text-warning">
          {{ stillWaitingCount }} still waiting
        </p>

        <!-- Actions -->
        <div class="mt-8 flex flex-col items-center gap-3">
          <button
            class="w-full rounded-input bg-danger px-8 py-3 font-body text-base font-bold text-white transition-colors hover:bg-danger/90"
            @click="emit('close-queue')"
          >
            Close Queue
          </button>
          <button
            class="font-body text-base font-bold text-plum transition-colors hover:text-plum-muted"
            @click="emit('keep-open')"
          >
            Keep Open
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
