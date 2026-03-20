<script setup>
/**
 * @component TerminateQueueModal
 * @description Confirmation modal for closing/terminating an active queue.
 */
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import WarningTriangleIcon from '@/assets/icons/warning-triangle.svg?component'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  stillWaitingCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['close-queue', 'keep-open'])
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('keep-open')">
    <div class="w-full rounded-card bg-white p-12 text-center shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
      <!-- Warning icon -->
      <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-danger/10">
        <WarningTriangleIcon class="h-10 w-10 text-danger" />
      </div>

      <h2 class="font-display text-2xl font-bold tracking-tight text-plum">Close this queue?</h2>
      <p class="mx-auto mt-4 max-w-[407px] font-body text-sm leading-relaxed text-plum-muted">
        <span v-if="stillWaitingCount > 0" class="font-bold text-danger">{{ stillWaitingCount }} people</span> 
        are still waiting for their turn. This action will cancel their sessions.
      </p>

      <!-- Actions -->
      <div class="mt-10 flex flex-col items-center gap-4">
        <BaseButton
          variant="danger"
          class="w-full py-4 text-white shadow-xl shadow-danger/10"
          @click="emit('close-queue')"
        >
          CLOSE QUEUE
        </BaseButton>
        <BaseButton
          variant="ghost"
          class="w-full py-4 font-bold text-plum/50 hover:text-plum"
          @click="emit('keep-open')"
        >
          Keep Open
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

