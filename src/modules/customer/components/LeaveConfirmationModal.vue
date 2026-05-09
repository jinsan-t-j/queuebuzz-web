<script setup lang="ts">
/**
 * @component LeaveConfirmationModal
 * @description Reusable modal for confirming intent to leave the queue.
 * Used in WaitingView (via TicketHero) and CalledView.
 */
import { AlertCircle } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'ghost' | 'secondary'
}

withDefaults(defineProps<Props>(), {
  title: 'Leave queue?',
  message: 'You will lose your current position and will need to re-join the line from the start.',
  confirmText: 'Yes, Leave Now',
  cancelText: 'Keep my spot',
  variant: 'danger',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

function handleConfirm() {
  emit('confirm')
  emit('close')
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative w-full overflow-hidden bg-white p-8 text-center shadow-xl">
      <div class="flex flex-col items-center">
        <div
          :class="[
            'mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            variant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-mint-light/60 text-plum',
          ]"
        >
          <AlertCircle class="h-7 w-7" />
        </div>

        <h3 class="font-display text-2xl font-bold text-plum">
          {{ title }}
        </h3>
        <p class="mt-2 font-body text-sm text-plum/50 leading-relaxed max-w-[280px]">
          {{ message }}
        </p>

        <div class="mt-8 flex w-full flex-col gap-3">
          <BaseButton
            :variant="variant"
            class="w-full py-4 text-sm font-bold active:scale-[0.98] transition-all"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </BaseButton>
          <BaseButton
            variant="ghost"
            class="w-full h-11 text-plum-muted font-bold tracking-widest text-sm uppercase transition-all"
            @click="emit('close')"
          >
            {{ cancelText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
