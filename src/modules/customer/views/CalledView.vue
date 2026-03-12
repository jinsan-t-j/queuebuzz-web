<script setup>
/**
 * @component CalledView
 * @description Customer-facing "called" screen — "Great news! Your turn has arrived."
 * Shows ticket number prominently with QR option and I'm Here CTA.
 *
 * @prop {String} ticketNumber - Ticket number.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 3. Third-party composables
import QRCode from 'qrcode'

// 4. Local composables
import { useCustomerApi } from '@/modules/customer/composables/useCustomerApi'

// 5. Component imports
import QrScanIcon from '@/assets/icons/qr-scan.svg?component'

// 6. Props
const props = defineProps({
  ticketNumber: { type: String, default: 'Q-0042' },
})

// 7. Emits
const emit = defineEmits(['arrival-confirmed', 'leave-queue', 'show-qr', 'claim-earlier'])

// 8. Composable destructuring
const { confirmArrival, leaveQueue } = useCustomerApi()

// 9. Reactive state
const queueName = ref('Chai Point · Koramangala')
const isConfirming = ref(false)

// 11. Methods
async function handleConfirmArrival() {
  isConfirming.value = true
  const result = await confirmArrival('stub-ticket-id')
  isConfirming.value = false
  if (result.success) {
    emit('arrival-confirmed')
  }
}

async function handleLeave() {
  await leaveQueue('stub-ticket-id')
  emit('leave-queue')
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <div class="flex flex-col px-5 py-4">
      <!-- Heading section -->
      <div class="mt-2 text-center">
        <h2 class="font-body text-2xl font-semibold text-plum">Great news!</h2>
        <p class="mt-2 font-body text-base font-medium text-plum/60">Your turn has arrived.</p>
      </div>

      <!-- Ticket card -->
      <div class="mt-6 rounded-[40px] border-2 border-mint bg-white p-6 text-center shadow-[0_20px_50px_rgba(0,229,160,0.12)]">
        <!-- Decorative notches -->
        <div class="relative">
          <div class="absolute -left-6 top-1/2 h-6 w-3 -translate-y-1/2 rounded-r-full bg-sand" />
          <div class="absolute -right-6 top-1/2 h-6 w-3 -translate-y-1/2 rounded-l-full bg-sand" />
        </div>

        <p class="font-body text-xs font-normal uppercase tracking-[2.4px] text-plum/60">Your Ticket</p>
        <p class="mt-4 font-mono text-[92px] font-black leading-[92px] text-plum">
          {{ ticketNumber.split('-')[0] }}-<br />{{ ticketNumber.split('-')[1] || '0042' }}
        </p>

        <!-- Show QR button -->
        <button
          class="mx-auto mt-4 flex items-center gap-1.5 rounded-[15px] border border-sand px-4 py-2"
          @click="emit('show-qr')"
        >
          <QrScanIcon class="h-4 w-4 text-[#64748b]" />
          <span class="font-body text-sm tracking-tight text-[#64748b]">SHOW QR</span>
        </button>
      </div>

      <!-- Hurray message -->
      <p class="mt-8 text-center font-body text-xs font-light text-plum-soft">
        🎉 Hurray Its your turn, Please head in.
      </p>

      <!-- I'm Here CTA -->
      <button
        :disabled="isConfirming"
        :class="[
          'mt-4 flex h-[68px] w-full items-center justify-center rounded-2xl bg-mint font-body text-lg font-bold text-plum shadow-[0_8px_10px_rgba(0,229,160,0.20),0_20px_25px_rgba(0,229,160,0.20)] transition-all',
          isConfirming ? 'cursor-not-allowed opacity-70' : '',
        ]"
        @click="handleConfirmArrival"
      >
        {{ isConfirming ? 'Confirming…' : "I'm Here" }}
      </button>

      <!-- Leave link -->
      <button
        class="mt-4 text-center font-body text-sm font-medium text-danger"
        @click="handleLeave"
      >
        Leave
      </button>
    </div>
  </div>
</template>
