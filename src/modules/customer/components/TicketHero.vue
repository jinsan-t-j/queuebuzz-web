<script setup>
/**
 * @component TicketHero
 * @description Ticket card with QR code, reused across WaitingView, IdleView, CalledView.
 * Shows ticket number, QR code, and optional leave button.
 *
 * @prop {String} ticketNumber - Ticket number (e.g. "Q-0042").
 * @prop {String} queueName - Queue name for QR content.
 * @prop {Boolean} showLeaveButton - Whether to show the "Leave Queue" button.
 * @emits {leave-queue} - Emitted when leave is confirmed.
 * @emits {show-qr} - Emitted when QR is tapped for fullscreen.
 */

// 1. Vue core imports
import { ref, onMounted } from 'vue'

// 3. Third-party composables
import QRCode from 'qrcode'

// 5. Component imports
import { Maximize2 } from 'lucide-vue-next'

// 6. Props
const props = defineProps({
  ticketNumber: { type: String, default: 'Q-0042' },
  queueName: { type: String, default: 'Chai Point · Koramangala' },
  showLeaveButton: { type: Boolean, default: true },
})

// 7. Emits
const emit = defineEmits(['leave-queue', 'show-qr'])

// 9. Reactive state
const qrDataUrl = ref('')
const isConfirmingLeave = ref(false)

// 11. Methods
function handleLeaveClick() {
  isConfirmingLeave.value = true
}

function confirmLeave() {
  isConfirmingLeave.value = false
  emit('leave-queue')
}

function cancelLeave() {
  isConfirmingLeave.value = false
}

// 12. Lifecycle hooks
onMounted(async () => {
  const qrValue = `https://queuebuzz.app/q/${props.queueName.toLowerCase().replace(/\s+/g, '-')}`
  qrDataUrl.value = await QRCode.toDataURL(qrValue, {
    width: 160,
    margin: 2,
    color: { dark: '#1A0A2E', light: '#FFFFFF' },
  })
})
</script>

<template>
  <div class="rounded-3xl border border-plum-faint bg-white p-5 shadow-[0_4px_24px_rgba(26,10,46,0.08)]">
    <div class="flex">
      <!-- Left: Ticket info -->
      <div class="flex w-[55%] flex-col justify-center">
        <p class="font-body text-xs font-semibold uppercase tracking-[2.4px] text-plum-muted">
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
      <div class="flex w-[45%] flex-col items-center justify-center">
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="Queue QR code"
          class="h-20 w-20 cursor-pointer rounded-lg"
          @click="emit('show-qr')"
        />
        <div v-else class="h-20 w-20 animate-pulse rounded-lg bg-plum-faint" />
        <button
          class="mt-1 flex items-center gap-1 text-plum-muted"
          @click="emit('show-qr')"
        >
          <Maximize2 class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- Leave Queue button -->
    <div v-if="showLeaveButton" class="mt-4">
      <!-- Default state -->
      <button
        v-if="!isConfirmingLeave"
        class="flex h-10 w-full items-center justify-center rounded-full bg-danger font-body text-sm font-bold text-white transition-colors hover:bg-danger/90"
        @click="handleLeaveClick"
      >
        Leave Queue
      </button>

      <!-- Confirm row -->
      <div v-else class="flex items-center justify-center gap-3">
        <span class="font-body text-sm text-plum-muted">Sure?</span>
        <button
          class="rounded-full bg-danger px-4 py-1.5 font-body text-xs font-semibold text-white"
          @click="confirmLeave"
        >
          Yes
        </button>
        <button
          class="rounded-full border border-plum-faint px-4 py-1.5 font-body text-xs font-semibold text-plum"
          @click="cancelLeave"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
