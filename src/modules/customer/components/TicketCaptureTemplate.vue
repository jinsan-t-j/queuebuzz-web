<script setup lang="ts">
/**
 * @component TicketCaptureTemplate
 * @description Hidden template designed specifically for high-quality ticket image generation.
 * Follows a premium digital pass aesthetic (Apple Wallet style).
 */
import QRCode from 'qrcode'
import { ref, onMounted } from 'vue'

defineProps<{
  ticketNumber: string
  queueName: string
  joinDate: string
}>()

const qrDataUrl = ref('')

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(globalThis.location.href, {
    width: 600,
    margin: 2,
    color: { dark: '#1A0A2E', light: '#FFFFFF' },
  })
})
</script>

<template>
  <div class="fixed left-[-9999px] top-0 overflow-hidden">
    <!-- The Ticket Card (Portrait Pass) -->
    <div
      id="capture-ticket"
      class="relative flex w-[480px] flex-col overflow-hidden bg-white p-0 text-plum font-body shadow-2xl"
    >
      <!-- Top Branding Section -->
      <div class="bg-mint px-10 py-12 text-center relative">
        <!-- Branding -->
        <div class="flex items-center justify-center gap-2 mb-6 opacity-30">
          <div
            class="h-6 w-6 rounded-lg flex items-center justify-center font-display font-black text-plum text-sm"
          >
            Q
          </div>
          <h3 class="font-display text-white text-sm font-bold tracking-widest uppercase">
            Visitor Ticket
          </h3>
        </div>

        <h1 class="font-display text-4xl font-bold leading-tight line-clamp-2">{{ queueName }}</h1>
        <p class="mt-3 font-body text-sm font-medium text-plum opacity-90 tracking-wide uppercase">
          Confirmed Entry
        </p>

        <!-- Top corner glows -->
        <div class="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div class="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-plum/10 blur-3xl" />
      </div>

      <!-- Perforated Notch Divider -->
      <div class="relative h-10 w-full bg-white">
        <div class="absolute inset-0 flex items-center px-6">
          <div class="w-full border-t-[3px] border-dashed border-plum/10" />
        </div>
        <!-- Notches -->
        <div class="absolute left-[-20px] top-0 h-10 w-10 rounded-full bg-plum" />
        <div class="absolute right-[-20px] top-0 h-10 w-10 rounded-full bg-plum" />
      </div>

      <!-- Ticket ID Section -->
      <div class="bg-white px-8 pb-12 pt-8 text-center relative">
        <p class="font-body text-sm font-bold uppercase tracking-[0.4em] text-plum/30 mb-2">
          Ticket Number
        </p>
        <div class="flex items-center justify-center min-h-[140px]">
          <h2
            class="font-mono font-black text-plum tracking-tighter leading-none"
            :class="ticketNumber.length > 4 ? 'text-7xl' : 'text-9xl'"
          >
            {{ ticketNumber }}
          </h2>
        </div>

        <div class="mt-12 flex items-center justify-center gap-10">
          <div class="text-left">
            <p class="text-sm font-bold uppercase tracking-wider text-plum/20">Date</p>
            <p class="text-base font-bold">{{ joinDate }}</p>
          </div>
          <div class="h-8 w-px bg-plum/5" />
          <div class="text-left">
            <p class="text-sm font-bold uppercase tracking-wider text-plum/20">Serial No.</p>
            <p class="text-base font-bold">QB-{{ String(Date.now()).slice(-6) }}</p>
          </div>
        </div>
      </div>

      <!-- QR Code Section -->
      <div
        class="mx-10 mb-12 rounded-[48px] bg-sand/40 p-10 border border-plum/5 flex flex-col items-center"
      >
        <div class="relative bg-white p-6 rounded-3xl shadow-[0_15px_45px_rgba(26,10,46,0.06)]">
          <img v-if="qrDataUrl" :src="qrDataUrl" class="h-44 w-44" alt="QR" />
          <div v-else class="h-44 w-44 animate-pulse bg-plum-faint" />
        </div>
        <p class="mt-8 font-body text-sm font-bold uppercase tracking-[0.2em] text-plum/40">
          Present this QR at the counter
        </p>
      </div>

      <!-- Platform Footer -->
      <div class="bg-plum/5 px-10 py-8 flex items-center justify-between">
        <span class="font-display text-base font-bold text-plum/50">QueueBuzz</span>
        <span class="font-body text-sm font-bold text-plum/30">queuebuzz.app</span>
      </div>
    </div>
  </div>
</template>
