<script setup lang="ts">
/**
 * @component CancelSubscriptionConfirmModal
 * @description Dialog confirming subscription cancellation with reason/feedback inputs.
 */
import { AlertTriangle } from 'lucide-vue-next'
import { ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

defineProps<{
  isOpen: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm', data: { comment: string; feedback: string }): void
}>()

const comment = ref('')
const feedback = ref('')

function handleConfirm() {
  emit('confirm', { comment: comment.value, feedback: feedback.value })
  // Reset for next open
  comment.value = ''
  feedback.value = ''
}

function handleCancel() {
  emit('cancel')
  // Reset for next open
  comment.value = ''
  feedback.value = ''
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="handleCancel">
    <div class="bg-white p-8 md:p-10 text-center">
      <!-- Warning Icon -->
      <div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
        <AlertTriangle class="h-7 w-7 text-danger" />
      </div>

      <h2 class="font-display text-2xl font-bold text-plum">Cancel Subscription?</h2>
      <p class="mx-auto mt-4 max-w-[375px] font-body text-base text-plum-muted">
        Your subscription will remain active until the end of the current billing period. You won't
        be charged again.
      </p>

      <div class="mt-8 space-y-6 text-left">
        <div>
          <label for="cancel-comment" class="mb-2 block font-body text-sm font-medium text-plum">
            Reason (optional)
          </label>
          <textarea
            id="cancel-comment"
            v-model="comment"
            rows="3"
            placeholder="Tell us why you're leaving…"
            class="w-full rounded-2xl border border-plum-faint bg-white p-4 font-body text-sm text-plum placeholder:text-plum-muted focus:border-plum focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label for="cancel-feedback" class="mb-2 block font-body text-sm font-medium text-plum">
            Feedback category
          </label>
          <select
            id="cancel-feedback"
            v-model="feedback"
            class="w-full rounded-2xl border border-plum-faint bg-white p-4 font-body text-sm text-plum focus:border-plum focus:outline-none transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%237B6B95%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12"
          >
            <option value="">Select a reason</option>
            <option value="too_expensive">Too expensive</option>
            <option value="missing_features">Missing features</option>
            <option value="not_using">Not using it enough</option>
            <option value="switching">Switching to another tool</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-3">
        <BaseButton
          variant="danger"
          size="lg"
          full-width
          :is-loading="isLoading"
          @click="handleConfirm"
        >
          Cancel Subscription
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="lg"
          full-width
          :disabled="isLoading"
          @click="handleCancel"
        >
          Keep Subscription
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
