<script setup lang="ts">
/**
 * @component LogoutConfirmationModal
 * @description Dialog confirming the user's intent to log out.
 */
import { LogOut } from 'lucide-vue-next'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel', 'confirm', 'close'])
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="p-10 text-center font-body">
      <div
        class="mx-auto mb-6 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-plum-faint"
      >
        <LogOut class="h-6 w-6 text-plum" />
      </div>

      <h2 class="font-display text-[24px] font-bold leading-9 text-plum">Sign Out?</h2>
      <p class="mx-auto mt-4 max-w-[375px] font-body text-base leading-6 text-plum/50">
        Are you sure you want to sign out of your account? You will need to log in again to access
        the dashboard.
      </p>

      <div class="mt-8 flex flex-col items-center gap-3">
        <BaseButton variant="primary" size="lg" class="w-full" @click="emit('confirm')">
          Yes, Sign Out
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="lg"
          class="w-full font-bold text-plum/40 hover:text-plum"
          @click="emit('cancel')"
        >
          Cancel
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
