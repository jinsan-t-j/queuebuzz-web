<script setup lang="ts">
/**
 * @component EmailNoticePopup
 * @description Floating popup encouraging guest hosts to add a recovery email.
 */
import { ref } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import WarningIcon from '@/assets/icons/warning-triangle.svg?component'
import CloseIcon from '@/assets/icons/close-x.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'

const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', email: string): void
  (e: 'close', doNotShowAgain: boolean): void
}>()

const email = ref('')
const doNotShowAgain = ref(false)
const error = ref('')

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function handleSubmit() {
  error.value = ''
  if (!email.value) {
    error.value = 'Email is required'
    return
  }
  if (!validateEmail(email.value)) {
    error.value = 'Invalid email address'
    return
  }
  emit('submit', email.value)
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 w-full max-w-[340px]">
    <BaseCard padding="none" class="relative group overflow-hidden border border-plum/5 shadow-[0_12px_48px_rgba(26,10,46,0.16)] transition-all">
      <!-- Glow effect -->
      <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mint-light opacity-30 blur-2xl transition-all group-hover:opacity-50" />
      
      <!-- Close button -->
      <button 
        class="absolute right-4 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-sand/80 text-plum/30 transition-all hover:bg-plum-faint hover:text-plum cursor-pointer"
        @click="$emit('close', doNotShowAgain)"
      >
        <CloseIcon class="h-3.5 w-3.5" />
      </button>

      <div class="flex flex-col p-6">
        <!-- Header -->
        <div class="mb-5 flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF9F2]">
            <WarningIcon class="h-5 w-5 text-[#F97316]" />
          </div>
          <div>
            <h3 class="font-display text-base font-bold text-plum leading-tight">
              Save your queue
            </h3>
            <p class="font-body text-[11px] text-plum-muted mt-0.5">
              Recovery email needed to resume later.
            </p>
          </div>
        </div>

        <!-- Input Section -->
        <div class="space-y-4">
          <div class="relative">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full rounded-2xl border border-plum/10 bg-sand/50 px-4 py-3 font-body text-sm text-plum placeholder:text-plum/30 outline-none transition-all focus:border-mint focus:ring-4 focus:ring-mint/5"
              :class="{ 'border-danger/50 focus:border-danger': error }"
              @keydown.enter="handleSubmit"
            />
            <VerifiedCheckIcon v-if="validateEmail(email) && !error" class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-mint" />
          </div>
          
          <p v-if="error" class="font-body text-[10px] font-bold text-danger uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
            {{ error }}
          </p>

          <BaseButton 
            variant="primary" 
            class="w-full py-3 shadow-[0_4px_12px_rgba(0,229,160,0.24)]"
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <div class="flex items-center justify-center gap-2">
              <SpinnerLoadingIcon v-if="isLoading" class="h-4 w-4 animate-spin" />
              <span class="font-bold uppercase tracking-[1px] text-xs">Secure Access</span>
            </div>
          </BaseButton>

          <!-- Checkbox: Do not show again -->
          <div class="flex items-center gap-2 mt-2 group/check cursor-pointer select-none" @click="doNotShowAgain = !doNotShowAgain">
            <div 
              class="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all"
              :class="[
                doNotShowAgain 
                  ? 'border-mint bg-mint text-white' 
                  : 'border-plum/20 bg-white group-hover/check:border-plum/40'
              ]"
            >
              <VerifiedCheckIcon v-if="doNotShowAgain" class="h-2.5 w-2.5" />
            </div>
            <span class="font-body text-[10px] text-plum-muted group-hover/check:text-plum transition-colors">
              Don't show this notification again
            </span>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
