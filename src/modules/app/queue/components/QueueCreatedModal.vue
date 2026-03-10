<script setup>
/**
 * @component QueueCreatedModal
 * @description Success modal displayed after a new queue is created.
 * Shows a check icon, join code in a dashed-border card,
 * "Go to Dashboard" primary action, and "Copy Link Instead" secondary.
 *
 * @prop {Boolean} isOpen - Whether the modal is visible.
 * @prop {String} joinCode - The generated join code to display.
 * @emits {go-to-dashboard} - User clicked "Go to Dashboard".
 * @emits {copy-link} - User clicked "Copy Link Instead".
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'

// 6. Props
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  joinCode: {
    type: String,
    default: '8X4K2F',
  },
})

// 7. Emits
const emit = defineEmits(['go-to-dashboard', 'copy-link'])

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
      <div class="w-full max-w-[480px] rounded-card bg-white p-10 text-center shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
        <!-- Check icon -->
        <div class="mx-auto mb-6 flex h-[33px] w-[33px] items-center justify-center">
          <CheckCircleIcon class="h-[33px] w-[33px] text-mint" />
        </div>

        <h2 class="font-display text-[30px] font-bold leading-9 text-plum">
          Queue is open!
        </h2>
        <p class="mx-auto mt-4 max-w-[375px] font-body text-base leading-6 text-plum/50">
          Customers can now join your queue using the code
          below.
        </p>

        <!-- Join code card -->
        <div class="mx-auto mt-6 rounded-card border-2 border-dashed border-plum/10 bg-sand px-10 py-6">
          <p class="mb-2 font-body text-[10px] font-bold uppercase tracking-[2px] text-plum/30">
            Join Code
          </p>
          <p class="font-mono text-5xl font-bold uppercase tracking-[4.8px] text-plum">
            {{ joinCode }}
          </p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex flex-col items-center gap-3">
          <button
            class="w-full rounded-input bg-plum px-8 py-3 font-body text-base font-bold text-white transition-colors hover:bg-plum-soft"
            @click="emit('go-to-dashboard')"
          >
            Go to Dashboard
          </button>
          <button
            class="font-body text-sm font-bold text-plum/40 transition-colors hover:text-plum"
            @click="emit('copy-link')"
          >
            Copy Link Instead
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
