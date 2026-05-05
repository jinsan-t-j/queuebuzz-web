<script setup lang="ts">
/**
 * @component ClaimConflictModal
 * @description Modal shown when a user logs in with a pending anonymous queue claim
 * but already has an active queue on their account.
 * Requires user to type 'confirm' as a safety measure.
 */
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { AlertCircleIcon } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  oldQueueName?: string
  newQueueName?: string
}>()

const emit = defineEmits(['confirm', 'cancel'])

const confirmationText = ref('')
const errorText = ref('')
const isConfirmed = computed(() => confirmationText.value.toLowerCase() === 'confirm')

function handleConfirm() {
  if (!confirmationText.value) {
    errorText.value = 'Please type "confirm" to proceed'
    return
  }

  if (!isConfirmed.value) {
    errorText.value = 'Text does not match "confirm"'
    return
  }

  errorText.value = ''
  emit('confirm')
}

watch(confirmationText, () => {
  if (errorText.value) errorText.value = ''
})

watch(
  () => props.isOpen,
  (val) => {
    if (!val) {
      confirmationText.value = ''
      errorText.value = ''
    }
  },
)
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('cancel')">
    <div class="bg-white p-8">
      <div class="text-center">
        <!-- Warning Icon -->
        <div
          class="mx-auto mb-6 w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center"
        >
          <AlertCircleIcon class="w-8 h-8 text-danger" />
        </div>

        <h2 class="font-display font-bold text-2xl text-plum mb-3">Replace existing queue?</h2>

        <p class="font-body text-sm text-plum-muted mb-6 leading-relaxed">
          You already have an active queue
          <span class="font-semibold text-plum">"{{ oldQueueName || 'Active Queue' }}"</span>.
          Claiming your guest queue will permanently close the current one.
        </p>

        <div class="mb-8 text-left">
          <BaseInput
            v-model="confirmationText"
            label="Type 'confirm' to replace"
            placeholder="confirm"
            :is-disabled="!isOpen"
            :error="errorText"
          />
        </div>

        <div class="flex flex-col gap-3">
          <BaseButton
            class="w-full !rounded-pill"
            variant="primary"
            size="lg"
            @click="handleConfirm"
          >
            Yes, replace with guest queue
          </BaseButton>

          <BaseButton
            variant="ghost"
            class="w-full !rounded-pill"
            size="lg"
            @click="emit('cancel')"
          >
            Keep existing queue
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
