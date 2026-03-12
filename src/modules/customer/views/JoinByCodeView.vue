<script setup>
/**
 * @component JoinByCodeView
 * @description 6-character code entry screen for joining a queue.
 * Supports partial fill, searching, and error states.
 */

// 1. Vue core imports
import { ref, computed } from 'vue'

// 4. Local composables
import { useCustomerApi } from '@/modules/customer/composables/useCustomerApi'

// 5. Component imports
import { Loader2, AlertCircle } from 'lucide-vue-next'
import ArrowRightBoldIcon from '@/assets/icons/arrow-right-bold.svg?component'
import QrScanIcon from '@/assets/icons/qr-scan.svg?component'

// 7. Emits
const emit = defineEmits(['queue-found', 'scan-qr'])

// 8. Composable destructuring
const { joinByCode } = useCustomerApi()

// 9. Reactive state
const code = ref(['', '', '', '', '', ''])
const inputRefs = ref([])
const isError = ref(false)
const isSearching = ref(false)

// 10. Computed properties
const isFilled = computed(() => code.value.every((c) => c !== ''))
const codeString = computed(() => code.value.join(''))

// 11. Methods
function onInput(index, e) {
  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
  code.value[index] = val
  isError.value = false
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

function onKeydown(index, e) {
  if (e.key === 'Backspace' && !code.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

function onPaste(e) {
  const pasted = e.clipboardData
    .getData('text')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6)
  pasted.split('').forEach((char, i) => {
    code.value[i] = char
  })
  inputRefs.value[Math.min(pasted.length, 5)]?.focus()
}

async function handleFind() {
  if (!isFilled.value) return
  isSearching.value = true
  isError.value = false
  const result = await joinByCode(codeString.value)
  isSearching.value = false
  if (result.found) {
    emit('queue-found', result)
  } else {
    isError.value = true
    setTimeout(() => {
      code.value = ['', '', '', '', '', '']
      inputRefs.value[0]?.focus()
    }, 1200)
  }
}
</script>

<template>
  <div class="flex flex-col px-5 py-4">
    <!-- Heading -->
    <div class="mt-8 text-center">
      <h1 class="font-display text-[29px] font-bold leading-[40.5px] text-plum">
        Type the queue<br />entry code
      </h1>
      <p class="mx-auto mt-3 max-w-[260px] font-body text-sm leading-relaxed text-[#6b5a7e]">
        Get the 6-letter code from the queue sign<br />or host
      </p>
    </div>

    <!-- 6 Code boxes -->
    <div class="mt-8 flex justify-center gap-2">
      <input
        v-for="(char, i) in code"
        :key="i"
        :ref="(el) => { if (el) inputRefs[i] = el }"
        :value="code[i]"
        maxlength="1"
        inputmode="text"
        autocomplete="off"
        :class="[
          'h-16 w-12 rounded-xl border-2 text-center font-mono text-3xl font-semibold uppercase outline-none transition-colors',
          isError
            ? 'border-danger bg-danger/5 text-danger'
            : code[i]
              ? 'border-mint bg-white text-plum'
              : 'border-plum-faint bg-white text-plum',
          'focus:border-plum',
        ]"
        @input="onInput(i, $event)"
        @keydown="onKeydown(i, $event)"
        @paste.prevent="onPaste"
      />
    </div>

    <!-- Error message -->
    <div v-if="isError" class="mt-3 flex items-center justify-center gap-1.5">
      <AlertCircle class="h-4 w-4 text-danger" />
      <span class="font-body text-[13px] font-medium text-danger">Queue not found or has ended</span>
    </div>

    <!-- Helper text -->
    <p class="mt-3 text-center font-body text-[13px] text-[#6b5a7e]">Not case sensitive</p>

    <!-- Action buttons -->
    <div class="mt-8 flex flex-col gap-4">
      <!-- Find / Try Again button -->
      <button
        :disabled="!isFilled || isSearching"
        :class="[
          'flex h-14 w-full items-center justify-center gap-2 rounded-full font-display text-base font-semibold transition-all',
          isSearching
            ? 'cursor-not-allowed bg-[rgba(74,222,128,0.50)] text-plum'
            : isFilled
              ? 'bg-mint text-plum shadow-[0_8px_24px_rgba(0,229,160,0.50)] hover:shadow-[0_12px_32px_rgba(0,229,160,0.60)]'
              : 'cursor-not-allowed bg-mint/45 text-plum opacity-45',
        ]"
        @click="handleFind"
      >
        <Loader2 v-if="isSearching" class="h-5 w-5 animate-spin text-plum" />
        <template v-if="isSearching">Searching...</template>
        <template v-else-if="isError">Try Again</template>
        <template v-else>
          Find My Queue
          <ArrowRightBoldIcon class="h-3.5 w-3.5 text-plum" />
        </template>
      </button>

      <!-- Scan QR button -->
      <button
        class="flex h-14 w-full items-center justify-center gap-1 rounded-xl border-2 border-[rgba(107,33,168,0.30)] font-body text-base font-bold tracking-wide text-[#6b21a8]"
        @click="emit('scan-qr')"
      >
        <QrScanIcon class="h-5 w-5 text-[#6b21a8]" />
        Scan QR Instead
      </button>
    </div>
  </div>
</template>
