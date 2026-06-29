<script setup lang="ts">
/**
 * @component TicketCaptureTemplate
 * @description Hidden template designed specifically for high-quality ticket image generation.
 * Follows a premium digital pass aesthetic (Apple Wallet style).
 */
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'

import { APP_BASE_URL } from '@/config/api.constants'

const props = defineProps<{
  ticketNumber: string
  queueName: string
  joinDate: string
  qrValue?: string
}>()

const qrDataUrl = ref('')

const generateQr = async () => {
  const value = props.qrValue || globalThis.location.href
  try {
    qrDataUrl.value = await QRCode.toDataURL(value, {
      width: 600,
      margin: 2,
      color: { dark: '#1A0A2E', light: '#FFFFFF' },
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate QR code', e)
  }
}

onMounted(() => {
  generateQr()
})

watch(
  () => props.qrValue,
  () => {
    generateQr()
  },
)
</script>

<template>
  <div
    class="fixed left-[-9999px] top-0 overflow-hidden print:relative print:left-0 print:w-full print:overflow-visible"
  >
    <!-- The Ticket Card (Portrait Pass) -->
    <div
      id="capture-ticket"
      class="relative flex w-[480px] flex-col overflow-hidden bg-white p-0 text-plum font-body shadow-2xl print:shadow-none print:border print:border-plum/10 print:w-full"
    >
      <!-- Top Branding Section -->
      <div
        class="bg-mint px-10 py-12 text-center relative print:bg-white print:py-6 print:border-b print:border-plum-faint"
      >
        <!-- Branding -->
        <div
          class="flex items-center justify-center gap-2 mb-6 opacity-30 print:mb-3 print:opacity-60"
        >
          <div
            class="h-6 w-6 rounded-lg flex items-center justify-center font-display font-black text-plum text-sm border border-plum/10"
          >
            Q
          </div>
          <h3 class="font-display text-plum text-sm font-bold tracking-widest uppercase">
            Visitor Ticket
          </h3>
        </div>

        <h1
          class="font-display text-4xl font-bold leading-tight line-clamp-2 print:text-plum print:text-3xl"
        >
          {{ queueName }}
        </h1>
        <p
          class="mt-3 font-body text-sm font-medium text-plum opacity-90 tracking-wide uppercase print:text-plum-muted print:opacity-100 print:mt-1"
        >
          Confirmed Entry
        </p>

        <!-- Top corner glows -->
        <div
          class="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-3xl print:hidden"
        />
        <div
          class="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-plum/10 blur-3xl print:hidden"
        />
      </div>

      <!-- Perforated Notch Divider -->
      <div class="relative h-10 w-full bg-white print:h-6">
        <div class="absolute inset-0 flex items-center px-6">
          <div class="w-full border-t-[3px] border-dashed border-plum/10 print:border-plum-faint" />
        </div>
        <!-- Notches -->
        <div class="absolute left-[-20px] top-0 h-10 w-10 rounded-full bg-plum print:hidden" />
        <div class="absolute right-[-20px] top-0 h-10 w-10 rounded-full bg-plum print:hidden" />
      </div>

      <!-- Ticket ID Section -->
      <div class="bg-white px-8 pb-12 pt-8 text-center relative print:pb-6 print:pt-4">
        <p
          class="font-body text-sm font-bold uppercase tracking-[0.4em] text-plum/30 mb-2 print:text-plum-muted"
        >
          Ticket Number
        </p>
        <div class="flex items-center justify-center min-h-[140px] print:min-h-[100px]">
          <h2
            class="font-mono font-black text-plum tracking-tighter leading-none print:text-6xl"
            :class="ticketNumber.length > 4 ? 'text-7xl' : 'text-9xl'"
          >
            {{ ticketNumber }}
          </h2>
        </div>

        <div class="mt-12 flex items-center justify-center gap-10 print:mt-6 print:gap-6">
          <div class="text-left">
            <p
              class="text-sm font-bold uppercase tracking-wider text-plum/20 print:text-plum-muted"
            >
              Date
            </p>
            <p class="text-base font-bold print:text-sm">{{ joinDate }}</p>
          </div>
          <div class="h-8 w-px bg-plum/5 print:bg-plum-faint" />
          <div class="text-left">
            <p
              class="text-sm font-bold uppercase tracking-wider text-plum/20 print:text-plum-muted"
            >
              Serial No.
            </p>
            <p class="text-base font-bold print:text-sm">QB-{{ String(Date.now()).slice(-6) }}</p>
          </div>
        </div>
      </div>

      <!-- QR Code Section -->
      <div
        class="mx-10 mb-12 rounded-[48px] bg-sand/40 p-10 border border-plum/5 flex flex-col items-center print:mx-6 print:mb-6 print:p-6 print:rounded-3xl print:bg-sand/10"
      >
        <div
          class="relative bg-white p-6 rounded-3xl shadow-[0_15px_45px_rgba(26,10,46,0.06)] print:p-3 print:shadow-none print:border print:border-plum-faint"
        >
          <img v-if="qrDataUrl" :src="qrDataUrl" class="h-44 w-44 print:h-32 print:w-32" alt="QR" />
          <div v-else class="h-44 w-44 animate-pulse bg-plum-faint print:h-32 print:w-32" />
        </div>
        <p
          class="mt-8 font-body text-sm font-bold uppercase tracking-[0.2em] text-plum/40 print:mt-4 print:text-xs print:text-plum-muted"
        >
          Present this QR at the counter
        </p>
      </div>

      <!-- Platform Footer -->
      <div
        class="bg-plum/5 px-10 py-8 flex items-center justify-between print:bg-white print:border-t print:border-plum-faint print:py-4 print:px-6"
      >
        <span
          class="font-display text-base font-bold text-plum/50 print:text-xs print:text-plum-muted"
          >QueueBuzz</span
        >
        <span
          class="font-body text-sm font-bold text-plum/30 print:text-xs print:text-plum-muted"
          >{{ APP_BASE_URL }}</span
        >
      </div>
    </div>
  </div>
</template>
