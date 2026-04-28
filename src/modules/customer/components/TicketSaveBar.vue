<script setup lang="ts">
/**
 * @component TicketSaveBar
 * @description Bottom bar showing ticket save confirmation and share button.
 * Matches Figma — header with X, progress bar, saved + share buttons.
 *
 * @prop {String} ticketNumber - Ticket number.
 * @prop {String} shareCode - Share code.
 * @emits {share-code} - Share the code.
 */

// 5. Component imports
import { Check, Download } from 'lucide-vue-next'

// 6. Props
defineProps({
  ticketNumber: { type: String, default: 'Q-0042' },
  shareCode: { type: String, default: 'A4X9K2' },
  isSaving: { type: Boolean, default: false },
  isSaved: { type: Boolean, default: false },
})

// 7. Emits
const emit = defineEmits(['share-code', 'save'])
</script>

<template>
  <div
    class="rounded-2xl border-t border-plum/5 bg-white p-3 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300"
  >
    <!-- Buttons row -->
    <div class="mt-3 flex gap-3">
      <!-- Save Button -->
      <button
        :disabled="isSaving"
        class="flex h-[55px] flex-1 items-center justify-center gap-2 rounded-2xl border border-plum/10 transition-all active:scale-[0.98] bg-white hover:bg-plum/5"
        @click="emit('save')"
      >
        <template v-if="isSaving">
          <div class="h-4 w-4 rounded-full border-2 border-plum/20 border-t-plum animate-spin" />
          <span class="font-body text-sm font-bold text-plum">Saving...</span>
        </template>
        <template v-else-if="isSaved">
          <Check class="h-4 w-4 text-mint" />
          <span class="font-body text-sm font-bold text-plum">Ticket saved</span>
        </template>
        <template v-else>
          <Download class="h-4 w-4 text-plum" />
          <span class="font-body text-sm font-bold text-plum">Save Ticket</span>
        </template>
      </button>

      <button
        class="flex-1 rounded-2xl bg-plum font-body text-sm font-bold text-white transition-all hover:bg-plum-soft active:scale-[0.98]"
        @click="emit('share-code')"
      >
        Share Code
      </button>
    </div>
  </div>
</template>
