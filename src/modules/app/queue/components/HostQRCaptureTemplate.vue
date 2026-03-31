<script setup lang="ts">
/**
 * Host QR Capture Template — optimized for high-quality off-screen rendering.
 * Used for QR code downloads in host module.
 */
import QRCode from 'qrcode'
import { ref, onMounted } from 'vue'

const props = defineProps<{
  queueName: string
  joinCode: string
  slug: string
}>()

const qrDataUrl = ref('')
const qrValue = `https://queuebuzz.app/q/${props.slug}`

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(qrValue, {
    width: 600,
    margin: 2,
    color: { dark: '#1A0A2E', light: '#FFFFFF' },
    errorCorrectionLevel: 'H'
  })
})
</script>

<template>
  <!-- Hidden capture container -->
  <div class="fixed left-[-9999px] top-[-9999px]">
    <div
      id="capture-host-qr"
      class="w-[480px] bg-sand flex flex-col items-center p-12 text-center"
    >
      <!-- Logo / Branding -->
      <div class="mb-4">
        <span class="font-display font-bold text-4xl text-plum tracking-tight">
          Queue<span class="text-mint">Buzz</span>
        </span>
      </div>

      <p class="font-body text-plum-muted text-sm mb-6 max-w-[280px]">
        Scan to join the virtual queue
      </p>

      <!-- Main QR Frame -->
      <div class="p-6 bg-white rounded-[40px] shadow-[0_8px_40px_rgba(26,10,46,0.12)] border border-plum-faint mb-6">
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="Queue QR code"
          class="w-64 h-64 rounded-2xl"
        />
        <div v-else class="w-64 h-64 rounded-2xl bg-plum-faint animate-pulse" />
      </div>

      <!-- Queue Context -->
      <h2 class="font-display font-bold text-2xl text-plum mb-2">
        {{ props.queueName }}
      </h2>
      
      <div class="inline-flex flex-col items-center gap-1">
        <span class="font-body text-xs text-plum-muted font-medium uppercase tracking-widest">
          Join Code
        </span>
        <span class="font-mono font-bold text-4xl text-plum tracking-[0.2em] -mr-[0.2em]">
          {{ props.joinCode }}
        </span>
      </div>

      <!-- Footer -->
      <div class="mt-12 flex items-center gap-2">
         <div class="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
         <span class="font-body text-[10px] text-plum-muted font-bold tracking-widest uppercase">
           queuebuzz.app
         </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
#capture-host-qr {
  /* Ensure correct font rendering in screenshot */
  font-family: 'Comfortaa Variable', sans-serif;
}
</style>
