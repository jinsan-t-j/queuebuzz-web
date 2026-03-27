<script setup>
import { useToast } from '@/composables/useToast'
import CheckIcon from '@/assets/icons/check-circle.svg?component'
import XIcon from '@/assets/icons/close-x.svg?component'

const { isVisible, message, type } = useToast()
</script>

<template>
  <div
    class="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-[100px] px-6 py-4 transition-all duration-300"
    :class="[
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none',
      type === 'error' 
        ? 'bg-red-500 shadow-[0_12px_24px_rgba(239,68,68,0.3)]' 
        : type === 'info'
          ? 'bg-plum shadow-[0_12px_24px_rgba(26,10,46,0.3)]'
          : 'bg-mint-dark shadow-[0_12px_24px_rgba(0,229,160,0.3)]'
    ]"
  >
    <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
      <template v-if="type === 'error'">
        <XIcon class="h-3.5 w-3.5 text-white" />
      </template>
      <template v-else>
        <CheckIcon class="h-3.5 w-3.5 text-white" />
      </template>
    </div>
    <span class="font-body text-sm font-semibold text-white">{{ message }}</span>
  </div>
</template>
