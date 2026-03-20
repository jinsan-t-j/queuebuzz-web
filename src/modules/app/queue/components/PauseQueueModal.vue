<script setup>
/**
 * @component PauseQueueModal
 * @description Confirmation modal for pausing an active queue.
 */
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
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
  <BaseModal :is-open="isOpen" @close="emit('keep-running')">
    <div class="w-full rounded-card bg-white p-12 text-center shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
      <!-- Warning icon -->
      <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-warning/10">
        <WarningTriangleIcon class="h-10 w-10 text-warning" />
      </div>

      <h2 class="font-display text-2xl font-bold tracking-tight text-plum">Pause this queue?</h2>
      <p class="mx-auto mt-4 max-w-[407px] font-body text-sm leading-relaxed text-plum-muted">
        Guests will not be able to join the queue while it is paused. Your current waiting list will be preserved.
      </p>

      <!-- Actions -->
      <div class="mt-10 flex flex-col items-center gap-4">
        <BaseButton
          variant="primary"
          class="w-full py-4 text-plum bg-warning hover:bg-warning/90"
          @click="emit('pause-queue')"
        >
          PAUSE QUEUE
        </BaseButton>
        <BaseButton
          variant="ghost"
          class="w-full py-4 font-bold text-plum/50 hover:text-plum"
          @click="emit('keep-running')"
        >
          Keep Running
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

