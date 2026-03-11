<script setup>
/**
 * @component LogoutConfirmationModal
 * @description Dialog confirming the user's intent to log out.
 */
import { LogOut } from 'lucide-vue-next'

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
        <div class="mx-auto mb-6 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-plum-faint">
          <LogOut class="h-6 w-6 text-plum" />
        </div>

        <h2 class="font-display text-[24px] font-bold leading-9 text-plum">
          Sign Out?
        </h2>
        <p class="mx-auto mt-4 max-w-[375px] font-body text-base leading-6 text-plum/50">
          Are you sure you want to sign out of your account? You will need to log in again to access the dashboard.
        </p>

        <div class="mt-8 flex flex-col items-center gap-3">
          <button
            class="w-full rounded-input bg-plum px-8 py-3 font-body text-base font-bold text-white transition-colors hover:bg-plum/90"
            @click="emit('confirm')"
          >
            Yes, Sign Out
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
