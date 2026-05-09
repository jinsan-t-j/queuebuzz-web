<script setup lang="ts">
/**
 * @component HistoryBulkActionBar
 * @description Floating action bar that appears when items are selected in the history list.
 */
import { Check as CheckIcon } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'deselect'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-6 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-max z-50 bg-plum dark:bg-plum-faint rounded-3xl sm:rounded-full px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 shadow-[0_20px_50px_rgba(26,10,46,0.4)] border border-white/10 dark:border-plum/10"
    >
      <div class="flex items-center gap-2.5">
        <div class="w-6 h-6 rounded-full bg-mint flex items-center justify-center shrink-0">
          <CheckIcon class="w-3.5 h-3.5 text-on-mint stroke-[3]" />
        </div>
        <span class="font-body text-sm font-black text-sand dark:text-plum whitespace-nowrap">
          {{ selectedCount }} item{{ selectedCount > 1 ? 's' : '' }} selected
        </span>
      </div>
      <div class="hidden sm:block w-px h-6 bg-sand/10 dark:bg-plum/10" />
      <div class="flex gap-2 w-full sm:w-auto">
        <BaseButton
          variant="ghost"
          size="sm"
          class="flex-1 sm:flex-none text-sand/70 hover:text-sand dark:text-plum/70 dark:hover:text-plum hover:bg-white/5 font-black h-9 px-4 border border-white/5 dark:border-plum/5"
          @click="emit('deselect')"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          class="flex-1 sm:flex-none font-black h-9 px-4"
          @click="emit('delete')"
        >
          Delete
        </BaseButton>
      </div>
    </div>
  </transition>
</template>
