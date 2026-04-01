<script setup lang="ts">
/**
 * @component LeaveConfirmationModal
 * @description Reusable modal for confirming intent to leave the queue.
 * Used in WaitingView (via TicketHero) and CalledView.
 */
import { AlertCircle } from 'lucide-vue-next'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

function confirmLeave() {
  emit('confirm')
  emit('close')
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative w-full overflow-hidden bg-white p-8 text-center shadow-xl">
      <div class="flex flex-col items-center">
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle class="h-7 w-7" />
        </div>
        
        <h3 class="font-display text-2xl font-bold text-plum">
          Leave queue?
        </h3>
        <p class="mt-2 font-body text-sm text-plum/50 leading-relaxed">
          You will lose your current position and will need to re-join the line from the start.
        </p>

        <div class="mt-8 flex w-full flex-col gap-3">
          <BaseButton
            variant="danger"
            class="w-full py-4 text-sm font-bold active:scale-[0.98] transition-all"
            @click="confirmLeave"
          >
            Yes, Leave Now
          </BaseButton>
          <BaseButton
            variant="ghost"
            class="w-full h-11 text-plum-muted font-bold tracking-widest text-[10px] uppercase transition-all"
            @click="emit('close')"
          >
            Keep my spot
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
