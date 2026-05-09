<script setup lang="ts">
/**
 * @component SettingsActionBar
 * @description Sticky action bar for unsaved changes in settings.
 */
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  isSaving: { type: Boolean, default: false },
})

defineEmits(['discard', 'save'])
</script>

<template>
  <div
    class="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none lg:ml-[280px]"
  >
    <div
      class="pointer-events-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-8 px-4 sm:px-6 py-3 sm:py-4 bg-white/90 dark:bg-white/90 backdrop-blur-xl border border-plum-faint rounded-2xl sm:rounded-[28px] shadow-[0_20px_50px_rgba(26,10,46,0.12)] dark:shadow-none ring-1 ring-black/[0.02] w-full max-w-[90vw] sm:w-auto"
    >
      <div class="flex items-center gap-3 sm:gap-4">
        <div
          class="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-mint-light"
        >
          <svg
            class="h-4 w-4 sm:h-5 sm:w-5 text-mint"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="flex flex-col">
          <p class="font-body text-xs sm:text-sm font-bold text-plum leading-tight">
            Unsaved Changes
          </p>
          <p class="font-body text-[10px] sm:text-xs text-plum-muted mt-0.5">
            Don't forget to save your profile updates.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <BaseButton
          variant="ghost"
          size="sm"
          class="flex-1 sm:flex-none !min-h-[40px] sm:!min-h-[44px] text-xs sm:text-sm hover:bg-sand"
          @click="$emit('discard')"
        >
          Discard
        </BaseButton>
        <BaseButton
          :is-loading="isSaving"
          size="sm"
          class="flex-1 sm:flex-none !min-h-[40px] sm:!min-h-[44px] text-xs sm:text-sm shadow-sm"
          @click="$emit('save')"
        >
          Save Changes
        </BaseButton>
      </div>
    </div>
  </div>
</template>
