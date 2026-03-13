<script setup>
/**
 * @component TicketSaveBar
 * @description Bottom bar showing ticket save confirmation and share button.
 * Matches Figma — header with X, progress bar, saved + share buttons.
 *
 * @prop {String} ticketNumber - Ticket number.
 * @prop {String} shareCode - Share code.
 * @prop {Boolean} isVisible - Whether bar is visible.
 * @emits {dismiss} - Close the bar.
 * @emits {share-code} - Share the code.
 */

// 5. Component imports
import { X, Check } from 'lucide-vue-next'

// 6. Props
defineProps({
  ticketNumber: { type: String, default: 'Q-0042' },
  shareCode: { type: String, default: 'A4X9K2' },
  isVisible: { type: Boolean, default: true },
})

// 7. Emits
const emit = defineEmits(['dismiss', 'share-code'])
</script>

<template>
  <div
    v-if="isVisible"
    class="rounded-2xl border-t border-plum/5 bg-white p-3 backdrop-blur-xl"
  >
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <span class="font-body text-xs font-bold uppercase tracking-[0.6px] text-plum">
        Ticket Saved to Gallery
      </span>
      <button class="text-plum-muted" @click="emit('dismiss')">
        <X class="h-2.5 w-2.5" />
      </button>
    </div>

    <!-- Progress bar -->
    <div class="mt-2 h-1.5 w-full rounded-full bg-mint" />

    <!-- Buttons row -->
    <div class="mt-3 flex gap-3">
      <div class="flex h-[55px] flex-1 items-center justify-center gap-2 rounded-2xl border border-plum/10 bg-plum/5">
        <Check class="h-4 w-4 text-plum/40" />
        <span class="font-body text-sm font-bold text-plum/40">Ticket Saved</span>
      </div>
      <button
        class="flex-1 rounded-2xl bg-plum font-body text-sm font-bold text-white transition-colors hover:bg-plum-soft"
        @click="emit('share-code')"
      >
        Share Code
      </button>
    </div>
  </div>
</template>
