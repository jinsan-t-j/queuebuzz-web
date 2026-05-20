<script setup lang="ts">
/**
 * @component PWAInstallModal
 * @description Accessible instructions walkthrough for Safari (macOS & iOS) users
 * on how to manually install QueueBuzz PWA using the browser's native share menu.
 */
import { Share, X } from 'lucide-vue-next'

import BaseModal from '@/components/base/BaseModal.vue'

defineProps<{
  isOpen: boolean
  isMac: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative p-6 max-w-md w-full mx-auto">
      <!-- Close Icon -->
      <button
        class="absolute right-4 top-4 rounded-full h-8 w-8 flex items-center justify-center text-plum-muted hover:bg-sand active:scale-90 cursor-pointer"
        aria-label="Close modal"
        @click="emit('close')"
      >
        <X class="h-4 w-4" />
      </button>

      <!-- Guide Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint-light">
          <Share class="h-5 w-5 text-plum" />
        </div>
        <div class="text-left">
          <h4 class="font-display text-sm font-bold text-plum">Install QueueBuzz</h4>
          <p class="font-body text-[10px] text-plum-muted">iOS Instruction</p>
        </div>
      </div>

      <!-- Description -->
      <p class="font-body text-xs text-plum-soft leading-relaxed text-left">
        Follow these 2 quick steps to receive instant sound and buzz alerts:
      </p>

      <!-- Native Steps Guide -->
      <div
        class="mt-4 flex flex-col gap-3 rounded-2xl bg-sand p-3.5 border border-plum-faint/60 text-left"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-plum text-[10px] font-bold text-sand font-mono"
          >
            1
          </span>
          <p class="font-body text-xs text-plum-soft leading-normal">
            Tap Safari's <strong class="font-semibold text-plum">Share</strong> button
            <Share class="inline-block h-3.5 w-3.5 text-plum mx-1 align-text-bottom" />
            {{ isMac ? 'in top toolbar.' : 'at the bottom of your screen.' }}
          </p>
        </div>
        <div class="flex items-center gap-2.5">
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-plum text-[10px] font-bold text-sand font-mono"
          >
            2
          </span>
          <p class="font-body text-xs text-plum-soft leading-normal">
            Choose
            <strong class="font-semibold text-plum">{{
              isMac ? "'Add to Dock'" : "'Add to Home Screen'"
            }}</strong>
            from the list.
          </p>
        </div>
      </div>

      <!-- Got it button -->
      <button
        class="mt-5 w-full rounded-xl bg-plum py-2.5 font-body text-xs font-semibold text-sand hover:bg-plum-soft transition-colors cursor-pointer"
        @click="emit('close')"
      >
        Got it, let's install!
      </button>
    </div>
  </BaseModal>
</template>
