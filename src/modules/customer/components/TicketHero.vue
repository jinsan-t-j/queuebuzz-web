<script setup lang="ts">
/**
 * @component TicketHero
 * @description Ticket card with QR code, reused across WaitingView, IdleView, CalledView.
 * Shows ticket number, QR code, and optional leave button.
 *
 * @prop {String} ticketNumber - Ticket number (e.g. "Q-0042").
 * @prop {String} queueName - Queue name for QR content.
 * @prop {Boolean} showLeaveButton - Whether to show the "Leave Queue" button.
 * @emits {leave-queue} - Emitted when leave is confirmed.
 * @emits {save-ticket} - Emitted when QR is tapped for fullscreen.
 */

// 1. Vue core imports
import { ref, onMounted } from 'vue'

// 3. Third-party composables
import QRCode from 'qrcode'

import { Download } from 'lucide-vue-next'
import LeaveConfirmationModal from './LeaveConfirmationModal.vue'

// 6. Props
const props = defineProps({
  ticketNumber: { type: String, default: 'Q-0042' },
  queueName: { type: String, default: 'Chai Point · Koramangala' },
  showLeaveButton: { type: Boolean, default: true },
})

// 7. Emits
const emit = defineEmits(['leave-queue', 'save-ticket'])

// 9. Reactive state
const qrDataUrl = ref('')
const isOpen = ref(false)

// 11. Methods
function confirmLeave() {
  isOpen.value = false
  emit('leave-queue')
}

// 12. Lifecycle hooks
onMounted(async () => {
  const qrValue = `https://queuebuzz.app/q/${props.queueName.toLowerCase().replace(/\s+/g, '-')}`
  qrDataUrl.value = await QRCode.toDataURL(qrValue, {
    width: 400,
    margin: 2,
    color: { dark: '#1A0A2E', light: '#FFFFFF' },
  })
})
</script>

<template>
  <div
    class="rounded-3xl border border-plum-faint bg-white p-5 shadow-[0_4px_24px_rgba(26,10,46,0.08)]"
  >
    <div class="flex">
      <!-- Left: Ticket info -->
      <div class="flex w-[40%] flex-col justify-center">
        <p class="font-body text-sm font-semibold uppercase tracking-[2.4px] text-plum-muted">
          Your Ticket
        </p>
        <p class="mt-1 font-mono text-5xl font-bold leading-tight text-mint">
          {{ ticketNumber }}
        </p>
      </div>

      <!-- Dashed divider -->
      <div class="relative mx-4 self-stretch border-l border-dashed border-plum-faint">
        <!-- Notch cutouts -->
        <div class="absolute -left-[5px] -top-5 h-2.5 w-2.5 rounded-full bg-sand" />
        <div class="absolute -bottom-5 -left-[5px] h-2.5 w-2.5 rounded-full bg-sand" />
      </div>

      <!-- Right: QR code -->
      <div
        class="group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(26,10,46,0.12)]"
      >
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="Queue QR code"
          class="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          @click="emit('save-ticket')"
        />

        <!-- Hover Overlay (Premium feel from InfoQueueModal) -->
        <div
          class="absolute inset-0 flex flex-col items-center justify-center bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]"
          @click="emit('save-ticket')"
        >
          <div
            class="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl"
          >
            <Download class="h-5 w-5 text-plum" />
          </div>
          <span class="font-body text-sm font-bold uppercase tracking-widest text-plum shadow-sm">
            Save Ticket
          </span>
        </div>

        <!-- Static Fallback label (visible when mobile/not hovered) -->
        <div
          class="mt-1 flex items-center gap-1 opacity-40 group-hover:opacity-0 transition-opacity lg:hidden"
        >
          <Download class="h-2.5 w-2.5 text-plum" />
          <span class="font-body text-sm font-bold uppercase tracking-wider text-plum">
            Tap to Save
          </span>
        </div>
      </div>
    </div>

    <!-- Leave Queue button -->
    <div v-if="showLeaveButton" class="mt-4">
      <button
        class="flex h-10 w-full items-center justify-center rounded-full bg-danger font-body text-sm font-bold text-white transition-colors hover:bg-danger/90"
        @click="isOpen = true"
      >
        Leave Queue
      </button>

      <!-- Leave Queue confirmation modal -->
      <LeaveConfirmationModal :is-open="isOpen" @close="isOpen = false" @confirm="confirmLeave" />
    </div>
  </div>
</template>
