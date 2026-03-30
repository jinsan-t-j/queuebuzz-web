<script setup>
/**
 * @component CalledView
 * @description Customer-facing "called" screen — "Great news! Your turn has arrived."
 * Shows ticket number prominently with QR option and I'm Here CTA.
 * Matches Figma — large ticket card with decorative punches, mint border.
 */

// 1. Vue core imports
import { ref } from 'vue'

import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomer } from '@/modules/customer/composables/useCustomer'
import { useQueueStore } from '@/stores/queue.store'
import QrScanIcon from '@/assets/icons/qr-scan.svg?component'

const router = useRouter()
const { entry, confirmArrival, leaveQueue, connectEvents, disconnectEvents } = useCustomer()
const queueStore = useQueueStore()

const emit = defineEmits(['arrival-confirmed', 'leave-queue', 'show-qr'])

const ticketNumber = computed(() => entry.value?.ticketNumber || '...')
const queueName = computed(() => queueStore.activeQueue?.name || 'Your Queue')
const isConfirming = ref(false)

onMounted(() => {
  if (entry.value) {
    connectEvents(entry.value.id)
  }
})

async function handleConfirmArrival() {
  if (isConfirming.value) return
  isConfirming.value = true
  const success = await confirmArrival()
  isConfirming.value = false
  if (success) {
    emit('arrival-confirmed')
  }
}

async function handleLeave() {
  const success = await leaveQueue()
  if (success) {
    emit('leave-queue')
    router.push('/')
  }
}

</script>

<template>
  <div class="relative flex flex-col">
    <!-- Blob decorations — Called screen specific (two large mint blobs) -->
    <div
      class="pointer-events-none absolute -top-20 left-1/2   h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-mint/16 blur-[80px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-10   h-[350px] w-[350px] rounded-full bg-mint/16 blur-[80px]"
    />

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
      <div class="relative mt-6 overflow-hidden rounded-[40px] border-2 border-mint bg-[#fdfcfe] p-6 text-center shadow-[0_20px_50px_rgba(0,229,160,0.12)]">
        <!-- Decorative notches -->
        <div class="absolute -left-[7px] top-1/2 h-6 w-3.5 -translate-y-1/2 rounded-r-full bg-sand" />
        <div class="absolute -right-[7px] top-1/2 h-6 w-3.5 -translate-y-1/2 rounded-l-full bg-sand" />

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
