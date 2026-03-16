<script setup>
/**
 * @component QueueCreatedModal
 * @description Success modal displayed after a new queue is created.
 * Shows a check icon, join code in a dashed-border card,
 * "Go to Dashboard" primary action, and "Copy Link Instead" secondary.
 *
 * @prop {Boolean} isOpen - Whether the modal is visible.
 * @prop {String} joinCode - The generated join code to display.
 * @emits {copy-link} - User clicked "Copy Link Instead".
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'
import XIcon from '@/assets/icons/close-x.svg?component'
import CopyLinkIcon from '@/assets/icons/copy-link.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'

// 6. Props
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  joinCode: {
    type: String,
    default: '',
  },
})

// 7. Emits
const emit = defineEmits(['close', 'copy-link', 'go-dashboard'])

// 8. Composable destructuring

// 9. Reactive state
const isCopied = ref(false)

// 10. Computed properties

// 11. Methods
function handleCopy() {
  emit('copy-link')
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

function goToDashboard() {
  emit('go-dashboard')
}

// 12. Lifecycle hooks
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
    >
      <div class="relative w-full max-w-[480px] rounded-card bg-white p-10 text-center shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
        <!-- Close button -->
        <button
          class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-plum-muted transition-colors cursor-pointer hover:bg-plum/5 hover:text-danger"
          @click="emit('close')"
          aria-label="Close modal"
        >
          <XIcon class="h-[18px] w-[18px]" />
        </button>

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
            class="w-full rounded-input bg-plum px-8 py-3 font-body text-base font-bold text-white transition-colors cursor-pointer hover:bg-plum-soft"
            @click="goToDashboard"
          >
            Go to Dashboard
          </button>
          <button
            class="flex items-center gap-1.5 font-body text-sm font-bold transition-colors cursor-pointer"
            :class="isCopied ? 'text-mint' : 'text-plum/40 hover:text-plum'"
            @click="handleCopy"
          >
            <VerifiedCheckIcon v-if="isCopied" class="h-4 w-4" />
            <CopyLinkIcon v-else class="h-4 w-4" />
            <span>{{ isCopied ? 'Link Copied!' : 'Copy Link Instead' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
