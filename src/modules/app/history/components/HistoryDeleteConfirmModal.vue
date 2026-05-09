<script setup lang="ts">
/**
 * @component HistoryDeleteConfirmModal
 * @description Confirmation modal for deleting queue history (single or bulk).
 */
import { Trash2 as TrashIcon } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

defineProps<{
  isOpen: boolean
  isLoading?: boolean
  isBulkDelete?: boolean
  selectedCount?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="p-10 text-center">
      <div
        class="mx-auto mb-6 w-20 h-20 rounded-[32px] bg-danger/5 flex items-center justify-center"
      >
        <TrashIcon class="w-10 h-10 text-danger" />
      </div>
      <h2 class="font-display font-black text-2xl text-plum mb-3">Permanent Deletion</h2>
      <p class="font-body text-sm text-plum-muted mb-8 leading-relaxed">
        Are you sure you want to delete
        <span class="font-black text-plum">{{
          isBulkDelete ? selectedCount + ' queues' : 'this queue'
        }}</span
        >? All analytics and guest data will be permanently removed. This action cannot be undone.
      </p>
      <div class="grid grid-cols-2 gap-4">
        <BaseButton variant="ghost" class="h-14 font-black rounded-3xl" @click="emit('close')">
          Cancel
        </BaseButton>
        <BaseButton
          variant="danger"
          class="h-14 font-black rounded-3xl shadow-lg shadow-danger/10"
          :loading="isLoading"
          @click="emit('confirm')"
        >
          Confirm
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
