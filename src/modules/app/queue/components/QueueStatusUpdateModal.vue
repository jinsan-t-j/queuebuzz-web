<script setup lang="ts">
/**
 * @component QueueStatusUpdateModal
 * @description Flexible confirmation modal for queue state transitions (Pause, Resume, Terminate).
 *
 * @prop {boolean} isOpen - Modal visibility.
 * @prop {'pause' | 'resume' | 'terminate'} mode - Interaction context.
 * @prop {number} [stillWaitingCount=0] - Number of guests for termination warnings.
 *
 * @emits {confirm} - Action confirmed.
 * @emits {close} - Modal closed without action.
 */
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import PauseCircleIcon from '@/assets/icons/pause-circle.svg?component'
import PlayIcon from '@/assets/icons/play.svg?component'
import CloseCircleIcon from '@/assets/icons/close-circle.svg?component'
import { computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  mode: {
    type: String,
    default: 'pause',
    validator: (v: string) => ['pause', 'resume', 'terminate'].includes(v),
  },
  stillWaitingCount: { type: Number, default: 0 },
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()

const content = computed(() => {
  switch (props.mode) {
    case 'resume':
      return {
        title: 'Resume Queue?',
        description: 'This will allow you to call guests again and move the queue forward.',
        confirmText: 'Resume Now',
        variant: 'primary',
        icon: PlayIcon,
        iconBg: 'bg-mint-light',
      }
    case 'terminate':
      return {
        title: 'Terminate Queue?',
        description:
          props.stillWaitingCount > 0
            ? `There are still ${props.stillWaitingCount} people waiting. Terminating will cancel all active sessions. This cannot be undone.`
            : 'This will permanently close the queue. Once terminated, no more guests can join.',
        confirmText: 'Terminate Queue',
        variant: 'danger',
        icon: CloseCircleIcon,
        iconBg: 'bg-red-50',
      }
    default: // pause
      return {
        title: 'Pause Queue?',
        description:
          'New guests can still join, but you will not be able to call guests until you resume.',
        confirmText: 'Pause Queue',
        variant: 'secondary',
        icon: PauseCircleIcon,
        iconBg: 'bg-plum/5',
      }
  }
})
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="bg-white p-10 text-center font-body">
      <!-- Icon/Visual -->
      <div
        class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] transition-all duration-500"
        :class="content.iconBg"
      >
        <component :is="content.icon" class="h-10 w-10 text-plum" />
      </div>

      <h2 class="font-display text-[26px] font-bold tracking-tight text-plum">
        {{ content.title }}
      </h2>

      <p class="mx-auto mt-4 max-w-[380px] text-base leading-relaxed text-plum/60">
        {{ content.description }}
      </p>

      <!-- Actions -->
      <div class="mt-10 flex flex-col gap-3">
        <BaseButton
          :variant="content.variant"
          size="lg"
          class="w-full shadow-lg"
          :class="content.variant === 'danger' && 'shadow-danger/10'"
          @click="emit('confirm')"
        >
          {{ content.confirmText }}
        </BaseButton>

        <BaseButton
          variant="ghost"
          size="lg"
          class="w-full font-bold text-plum/40 hover:text-plum"
          @click="emit('close')"
        >
          Cancel
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
