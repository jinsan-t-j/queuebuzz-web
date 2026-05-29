<script setup lang="ts">
/**
 * @component ActiveQueueConflictModal
 * @description Modal shown when a guest or host attempts to create a new queue
 * but already has an active queue session. Offers clear choices to resume or terminate.
 */
import { AlertCircleIcon } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

defineProps<{
  isOpen: boolean
  queueId: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm-terminate'): void
  (e: 'confirm-resume'): void
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('cancel')">
    <div class="bg-white p-6 sm:p-8">
      <div class="text-center">
        <!-- Warning Icon -->
        <div
          class="mx-auto mb-6 w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center animate-bounce"
        >
          <AlertCircleIcon class="w-8 h-8 text-warning" />
        </div>

        <h2 class="font-display font-black text-2xl text-plum mb-3 leading-tight">
          Active Queue Running
        </h2>

        <p class="font-body text-sm text-plum-muted mb-8 leading-relaxed max-w-sm mx-auto">
          You already have an active queue session running on this device. Would you like to resume
          managing your current queue, or terminate it to start this new one?
        </p>

        <div class="flex flex-col gap-3">
          <!-- Option 1: Resume Active Queue -->
          <BaseButton
            class="w-full !rounded-pill bg-mint hover:bg-mint-dark text-plum font-semibold"
            variant="primary"
            size="lg"
            @click="emit('confirm-resume')"
          >
            Resume Current Queue
          </BaseButton>

          <!-- Option 2: Terminate & Start New -->
          <BaseButton
            variant="ghost"
            class="w-full !rounded-pill border border-plum-faint hover:border-danger hover:text-danger text-plum"
            size="lg"
            @click="emit('confirm-terminate')"
          >
            Terminate & Start New
          </BaseButton>

          <!-- Cancel -->
          <BaseButton
            variant="ghost"
            class="w-full !rounded-pill text-plum-muted hover:text-plum"
            size="md"
            @click="emit('cancel')"
          >
            Cancel
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
