<script setup lang="ts">
import CheckIcon from '@/assets/icons/check-circle.svg?component'
import XIcon from '@/assets/icons/close-x.svg?component'
import { useToast } from '@/composables/useToast'

const { isVisible, message, type } = useToast()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
    enter-from-class="translate-y-10 opacity-0 scale-90"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-10 opacity-0 scale-95"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-28 sm:bottom-12 left-1/2 z-[100] flex w-[calc(100%-32px)] sm:w-auto sm:min-w-[320px] max-w-[400px] -translate-x-1/2 items-center gap-3 rounded-2xl sm:rounded-full px-5 py-4 backdrop-blur-xl transition-all"
      :class="[
        type === 'error'
          ? 'bg-red-500/95 shadow-[0_12px_32px_rgba(239,68,68,0.4)]'
          : type === 'warning'
            ? 'bg-orange-500/95 shadow-[0_12px_32px_rgba(249,115,22,0.4)]'
            : type === 'info'
              ? 'bg-plum/95 shadow-[0_12px_32px_rgba(26,10,46,0.4)]'
              : 'bg-mint-dark/95 shadow-[0_12px_32px_rgba(0,229,160,0.4)]',
      ]"
    >
      <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
        <template v-if="type === 'error' || type === 'warning'">
          <XIcon class="h-3.5 w-3.5 text-white" />
        </template>
        <template v-else>
          <CheckIcon class="h-3.5 w-3.5 text-white" />
        </template>
      </div>
      <span class="font-body text-sm font-semibold text-white leading-tight">{{ message }}</span>
    </div>
  </Transition>
</template>
