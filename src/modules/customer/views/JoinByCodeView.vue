<script setup lang="ts">
/**
 * @component JoinByCodeView
 * @description 6-character code entry screen for joining a queue.
 * Supports partial fill, searching, and error states.
 * Matches Figma — three states: entry, searching, error.
 */

// 1. Vue core imports
import { ref, computed } from 'vue'

// 4. Local composables
import { useCustomer } from '@/modules/customer/composables/useCustomer'

// 5. Component imports
import ArrowRightFilledIcon from '@/assets/icons/arrow-right-filled.svg?component'
import QrCodeScanIcon from '@/assets/icons/qr-code-scan.svg?component'
import ErrorCircleOutlineIcon from '@/assets/icons/error-circle-outline.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'

// 7. Emits
const emit = defineEmits(['scan-qr'])

// 8. Composable destructuring
const { joinByCode, isLoading, error } = useCustomer()

// 9. Reactive state
const code = ref(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const isShaking = ref(false)

// 10. Computed properties
const isFilled = computed(() => code.value.every((c) => c !== ''))
const codeString = computed(() => code.value.join(''))
const isError = computed(() => !!error.value)

// 11. Methods
function onInput(index: number, e: any) {
  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
  code.value[index] = val
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

function onKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !code.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  const pasted = e.clipboardData?.getData('text')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6) || ''
    
  pasted.split('').forEach((char, i) => {
    code.value[i] = char
  })
  inputRefs.value[Math.min(pasted.length, 5)]?.focus()
}

async function handleFind() {
  if (!isFilled.value) return
  const result = await joinByCode(codeString.value)
  if (!result) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 600)
    // Clear code on error after a brief delay
    setTimeout(() => {
        code.value = ['', '', '', '', '', '']
        inputRefs.value[0]?.focus()
    }, 1200)
  }
}
</script>

<template>
  <div class="relative flex flex-col px-5 py-4 min-h-[80vh]">
    <!-- Blob decorations — JoinByCode screen specific -->
    <div
      class="pointer-events-none absolute -right-16 -top-16   h-[256px] w-[256px] rounded-full bg-[radial-gradient(70.71%_70.71%_at_50%_50%,rgba(0,229,160,0.50)_0%,rgba(0,229,160,0)_70%)] blur-[40px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-28   h-[320px] w-[320px] rounded-full bg-[radial-gradient(70.71%_70.71%_at_50%_50%,rgba(26,10,46,0.35)_0%,rgba(26,10,46,0)_70%)] blur-[40px]"
    />

    <!-- Heading -->
    <div class="mt-8 text-center transition-all duration-300">
      <h1 class="font-display text-[29px] font-bold leading-[40.5px] text-plum">
        Type the queue<br />entry code
      </h1>
      <p class="mx-auto mt-3 max-w-[260px] font-body text-sm leading-relaxed text-[#6b5a7e]">
        Get the 6-letter code from the queue sign<br />or host
      </p>
    </div>

    <!-- 6 Code boxes -->
    <div
      :class="[
        'mt-8 flex justify-center gap-2',
        isShaking ? 'animate-[shake_0.5s_ease-in-out]' : '',
      ]"
    >
      <input
        v-for="(char, i) in code"
        :key="i"
        ref="inputRefs"
        :value="code[i]"
        maxlength="1"
        inputmode="text"
        autocomplete="off"
        :class="[
          'h-16 w-12 rounded-xl border-2 text-center font-mono text-3xl font-semibold uppercase outline-none transition-all duration-200',
          isError
            ? 'border-danger bg-danger/5 text-danger'
            : code[i]
              ? 'border-mint bg-white text-plum'
              : 'border-plum-faint bg-white text-plum',
          'focus:border-plum focus:ring-4 focus:ring-plum/5',
        ]"
        @input="onInput(i, $event)"
        @keydown="onKeydown(i, $event)"
        @paste.prevent="onPaste"
      />
    </div>

    <!-- Error message -->
    <div v-if="isError" class="mt-3 flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-1">
      <ErrorCircleOutlineIcon class="h-4 w-4 text-danger" />
      <span class="font-body text-[13px] font-medium text-danger">{{ error || 'Queue not found or has ended' }}</span>
    </div>

    <!-- Helper text -->
    <p class="mt-3 text-center font-body text-[13px] text-[#6b5a7e]">Not case sensitive</p>

    <!-- Action buttons -->
    <div class="mt-8 flex flex-col gap-4">
      <!-- Find / Try Again button -->
      <button
        :disabled="!isFilled || isLoading"
        :class="[
          'flex h-14 w-full items-center justify-center gap-2 rounded-full font-display text-base font-semibold transition-all duration-300',
          isLoading
            ? 'cursor-not-allowed bg-[rgba(74,222,128,0.50)] text-plum'
            : isFilled
              ? 'bg-mint text-plum shadow-[0_8px_24px_rgba(0,229,160,0.50)] hover:shadow-[0_12px_32px_rgba(0,229,160,0.60)]'
              : 'cursor-not-allowed bg-mint/45 text-plum opacity-45',
        ]"
        @click="handleFind"
      >
        <SpinnerLoadingIcon v-if="isLoading" class="h-5 w-5 animate-spin text-plum" />
        <template v-if="isLoading">Searching...</template>
        <template v-else-if="isError">Try Again</template>
        <template v-else>
          Find My Queue
          <ArrowRightFilledIcon class="h-3.5 w-3.5 text-plum" />
        </template>
      </button>

      <!-- Scan QR button -->
      <button
        class="flex h-14 w-full items-center justify-center gap-1 rounded-xl border-2 border-[rgba(107,33,168,0.30)] font-body text-base font-bold tracking-wide text-[#6b21a8] hover:bg-plum/5 transition-colors"
        @click="emit('scan-qr')"
      >
        <QrCodeScanIcon class="h-5 w-5 text-[#6b21a8]" />
        Scan QR Instead
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
</style>
