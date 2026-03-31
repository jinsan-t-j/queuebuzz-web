<script setup lang="ts">
/**
 * @component JoinByCodeView
 * @description 6-character code entry screen for joining a queue.
 * Supports partial fill, searching, and error states.
 */

import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomer } from '@/modules/customer/composables/useCustomer'

import BaseQrScanner from '@/components/base/BaseQrScanner.vue'
import ArrowRightFilledIcon from '@/assets/icons/arrow-right-filled.svg?component'
import QrCodeScanIcon from '@/assets/icons/qr-code-scan.svg?component'
import ErrorCircleOutlineIcon from '@/assets/icons/error-circle-outline.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'

const router = useRouter()
const { joinByCode, isLoading, error, clearError } = useCustomer()

// State
const codeChars = ref(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const isShaking = ref(false)
const showScanner = ref(false)

onMounted(() => {
  clearError()
  nextTick(() => inputRefs.value[0]?.focus())
})

// Computed
const codeEntered = computed(() => codeChars.value.join(''))
const isFilled = computed(() => codeEntered.value.length === 6)

// Methods
function handleInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  const val = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
  
  codeChars.value[index] = val
  
  if (val && index < 5) {
    nextTick(() => inputRefs.value[index + 1]?.focus())
  }
}

function handleKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !codeChars.value[index] && index > 0) {
    nextTick(() => inputRefs.value[index - 1]?.focus())
  }
}

function handlePaste(e: ClipboardEvent) {
  const pasteData = e.clipboardData?.getData('text') || ''
  const cleanData = pasteData.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
  
  cleanData.split('').forEach((char, i) => {
    if (i < 6) codeChars.value[i] = char
  })
  
  const nextFocus = Math.min(cleanData.length, 5)
  nextTick(() => inputRefs.value[nextFocus]?.focus())
}

async function findQueue() {
  if (!isFilled.value || isLoading.value) return
  
  const result = await joinByCode(codeEntered.value)
  if (!result || !result.found) {
    triggerError()
  }
}

function triggerError() {
  isShaking.value = true
  setTimeout(() => isShaking.value = false, 500)
  // Brief delay then clear for retry
  setTimeout(() => {
    codeChars.value = ['', '', '', '', '', '']
    inputRefs.value[0]?.focus()
  }, 1000)
}

function handleQrResult(result: string) {
  showScanner.value = false
  
  // 1. Try to extract code from URL if it's a full URL
  // Matches: .../q/QUEUE_ID/join/CODE
  const urlParts = result.split('/')
  const lastPart = urlParts[urlParts.length - 1]
  
  // 2. If it's a code (6 chars) or from URL, use it
  if (lastPart && lastPart.length === 6) {
    lastPart.split('').forEach((char, i) => {
      codeChars.value[i] = char.toUpperCase()
    })
    findQueue()
  } else if (result.length === 6) {
    result.split('').forEach((char, i) => {
      codeChars.value[i] = char.toUpperCase()
    })
    findQueue()
  } else {
      // Fallback: If maybe it's just a queueId (UUID length or similar)
      // but usually QR results are full URLs. 
      // For now, if it failed, show error.
      triggerError()
  }
}
</script>

<template>
  <div class="relative flex flex-col px-6 py-12 min-h-[85vh]">
    <!-- Decorative Blurs -->
    <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mint-light/40 blur-3xl" />
    <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-plum/5 blur-3xl opacity-50" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center">
      <h1 class="font-display text-3xl font-black text-plum text-center leading-tight">
        Joining a queue?
      </h1>
      <p class="mt-4 font-body text-sm text-plum-muted text-center max-w-[280px] leading-relaxed">
        Enter the 6-character code from the signage or your friend's ticket.
      </p>

      <!-- Code Input Grid -->
      <div 
        class="mt-12 flex justify-center gap-2.5"
        :class="{ 'animate-[shake_0.5s_ease-in-out]': isShaking }"
      >
        <input
          v-for="(char, i) in codeChars"
          :key="i"
          ref="inputRefs"
          v-model="codeChars[i]"
          type="text"
          maxlength="1"
          inputmode="text"
          autocomplete="off"
          class="h-16 w-12 rounded-2xl border-2 text-center font-mono text-3xl font-bold uppercase outline-none transition-all duration-300"
          :class="[
            error && !isShaking ? 'border-danger bg-danger/5 text-danger' : 
            codeChars[i] ? 'border-mint bg-white text-plum shadow-lg shadow-mint/10' : 
            'border-plum-faint bg-white text-plum'
          ]"
          @input="handleInput(i, $event)"
          @keydown="handleKeydown(i, $event)"
          @paste.prevent="handlePaste"
        />
      </div>

      <!-- Status Messages -->
      <div class="mt-6 min-h-[24px]">
        <div v-if="error" class="flex items-center gap-2 text-danger animate-in fade-in slide-in-from-top-1">
          <ErrorCircleOutlineIcon class="h-4 w-4" />
          <span class="font-body text-xs font-semibold uppercase tracking-wider">Invalid Code</span>
        </div>
        <p v-else class="font-body text-[11px] font-semibold text-plum-muted uppercase tracking-[0.2em] opacity-40">
          Not case sensitive
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="mt-10 flex flex-col gap-4 w-full max-w-sm">
        <button
          :disabled="!isFilled || isLoading"
          class="relative flex h-[64px] w-full items-center justify-center gap-3 overflow-hidden rounded-3xl font-display text-lg font-bold transition-all duration-500"
          :class="[
            isLoading ? 'bg-plum-faint text-plum/30' :
            isFilled ? 'bg-mint text-plum shadow-[0_16px_32px_-8px_rgba(0,229,160,0.5)] hover:shadow-[0_20px_40px_-8px_rgba(0,229,160,0.6)] transform hover:-translate-y-1' :
            'bg-plum/5 text-plum/20 cursor-not-allowed'
          ]"
          @click="findQueue"
        >
          <template v-if="isLoading">
            <SpinnerLoadingIcon class="h-6 w-6 animate-spin" />
            <span>Verifying...</span>
          </template>
          <template v-else>
            <span>Proceed to Join</span>
            <ArrowRightFilledIcon class="h-4 w-4" />
          </template>
        </button>

        <button
          class="flex h-16 w-full items-center justify-center gap-2.5 rounded-3xl border-2 border-dashed border-plum-faint font-body text-sm font-bold text-plum/60 hover:bg-white hover:border-plum/20 transition-all duration-300"
          @click="showScanner = true"
        >
          <QrCodeScanIcon class="h-5 w-5" />
          Scan QR Instead
        </button>
      </div>

      <button 
        class="mt-12 font-body text-xs font-bold text-plum-faint uppercase tracking-[0.25em] hover:text-plum transition-colors"
        @click="router.back()"
      >
        Go Back
      </button>
    </div>

    <!-- QR Scanner Overlay -->
    <Teleport to="body">
      <BaseQrScanner 
        v-if="showScanner"
        @close="showScanner = false"
        @result="handleQrResult"
        @error="showScanner = false"
      />
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>
