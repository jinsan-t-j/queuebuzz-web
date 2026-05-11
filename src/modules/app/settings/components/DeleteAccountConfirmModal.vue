<script setup lang="ts">
/**
 * @component DeleteAccountConfirmModal
 * @description Dialog confirming the permanent deletion of the host account.
 */
import { AlertTriangle } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

defineProps<{
  isOpen: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('cancel')">
    <div class="bg-white p-8 md:p-10 text-center">
      <!-- Warning Icon -->
      <div class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
        <AlertTriangle class="h-7 w-7 text-danger" />
      </div>

      <h2 class="font-display text-2xl font-bold text-plum">Delete Account?</h2>
      <p class="mx-auto mt-4 max-w-[375px] font-body text-base text-plum-muted">
        This will permanently remove your host profile and all related data. This action is
        irreversible.
      </p>

      <div class="mt-10 flex flex-col gap-3">
        <BaseButton
          variant="danger"
          size="lg"
          full-width
          :is-loading="isLoading"
          @click="emit('confirm')"
        >
          Yes, Delete My Account
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="lg"
          full-width
          :disabled="isLoading"
          @click="emit('cancel')"
        >
          Cancel
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
