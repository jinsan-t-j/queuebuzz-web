<script setup>
/**
 * @component DeleteAccountConfirmModal
 * @description Dialog confirming the permanent deletion of the host account.
 */
import { AlertTriangle } from 'lucide-vue-next'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
    >
      <div class="w-full max-w-[480px] rounded-card bg-white p-10 text-center shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
        <div class="mx-auto mb-6 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-red-100">
          <AlertTriangle class="h-6 w-6 text-red-600" />
        </div>

        <h2 class="font-display text-[24px] font-bold leading-9 text-plum">
          Delete Account?
        </h2>
        <p class="mx-auto mt-4 max-w-[375px] font-body text-base leading-6 text-plum/50">
          This will permanently remove your host profile and all related data from our systems. This action cannot be undone.
        </p>

        <div class="mt-8 flex flex-col items-center gap-3">
          <button
            class="w-full rounded-input bg-red-600 px-8 py-3 font-body text-base font-bold text-white transition-colors hover:bg-red-700"
            @click="emit('confirm')"
          >
            Yes, Delete Account
          </button>
          <button
            class="font-body text-sm font-bold text-plum/40 transition-colors hover:text-plum"
            @click="emit('cancel')"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
