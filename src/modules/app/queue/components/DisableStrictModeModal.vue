<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="p-10 text-center font-body">
      <div
        class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] bg-danger/10"
      >
        <svg class="w-10 h-10 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="font-display text-[26px] font-bold tracking-tight text-plum">
        Disable Strict Mode?
      </h2>
      <p class="mx-auto mt-4 max-w-[380px] text-base leading-relaxed text-plum/60">
        Disabling strict mode allows you to call multiple guests at once, even if previous guests
        haven't been marked as served yet.
      </p>
      <div class="mt-10 flex flex-col gap-3">
        <BaseButton
          variant="danger"
          size="lg"
          class="w-full shadow-lg dark:shadow-none shadow-danger/10"
          @click="emit('confirm')"
        >
          Disable
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
