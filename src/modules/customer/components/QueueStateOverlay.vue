<script setup lang="ts">
/**
 * @component QueueStateOverlay
 * @description Full-page overlay for queue error or locked states.
 */

import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  errorType?: 'NOT_FOUND' | 'LOCKED' | 'FULL'
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
  errorType: 'LOCKED',
  errorMessage: '',
})

defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center p-12 gap-4 flex-1 animate-in fade-in zoom-in-95 duration-200"
  >
    <div class="w-12 h-12 rounded-2xl bg-plum-faint flex items-center justify-center">
      <svg
        v-if="errorType === 'FULL'"
        class="w-6 h-6 text-warning"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <svg
        v-else
        class="w-6 h-6 text-plum-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>

    <template v-if="errorType === 'NOT_FOUND'">
      <h2 class="font-display font-bold text-xl text-plum">Queue not found</h2>
      <p class="font-body text-sm text-plum-muted text-center max-w-[280px]">
        The queue you're looking for doesn't exist or has been removed.
      </p>
      <BaseButton variant="ghost" class="mt-4" @click="$emit('action')">Go to home</BaseButton>
    </template>

    <template v-else-if="errorType === 'FULL'">
      <h2 class="font-display font-bold text-xl text-plum">Queue is currently full</h2>
      <p class="font-body text-sm text-plum-muted text-center max-w-[290px]">
        {{
          errorMessage ||
          'This queue has reached its maximum capacity. Please contact the business owner or try again later.'
        }}
      </p>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-pill font-body font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum px-6 py-2.5 text-sm min-h-[48px] mt-4 bg-plum text-sand hover:bg-plum-soft hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
        @click="$emit('action')"
      >
        Check Again
      </button>
    </template>

    <template v-else>
      <p class="font-display font-bold text-lg text-plum">Queue access locked</p>
      <p class="font-body text-sm text-plum-muted text-center max-w-[280px]">
        Enter the join code to open this queue.
      </p>
      <BaseButton variant="ghost" class="mt-4" @click="$emit('action')">Enter code</BaseButton>
    </template>
  </div>
</template>
