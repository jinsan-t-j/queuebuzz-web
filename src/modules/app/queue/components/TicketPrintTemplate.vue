<script setup lang="ts">
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  ticketNumber: string
  verifyCode: string
  queueName: string
  joinTime: string
  joinDate: string
  qrValue: string
}>()

const qrDataUrl = ref('')

const generateQr = async () => {
  if (!props.qrValue) return
  try {
    qrDataUrl.value = await QRCode.toDataURL(props.qrValue, {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
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
  <div class="w-full p-4 bg-white text-black font-body text-center flex flex-col items-center">
    <!-- Header: Business Name -->
    <h1 class="text-lg font-bold font-display uppercase tracking-wider mb-0.5 line-clamp-2">
      {{ queueName }}
    </h1>
    <div class="w-full border-t border-dashed border-black/20 my-2" />

    <!-- Ticket Label -->
    <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-0.5">Your Ticket Number</p>
    <!-- Ticket Number -->
    <h2 class="text-5xl font-mono font-bold leading-none my-1 tracking-tight">
      {{ ticketNumber }}
    </h2>

    <div class="w-full border-t border-dashed border-black/20 my-2" />

    <!-- Details: Joined date/time -->
    <div class="flex justify-between w-full text-[10px] text-gray-600 px-1 mb-2">
      <div>
        <span class="block text-gray-400 uppercase tracking-wider">Date</span>
        <span class="font-bold">{{ joinDate }}</span>
      </div>
      <div>
        <span class="block text-gray-400 uppercase tracking-wider">Time</span>
        <span class="font-bold">{{ joinTime }}</span>
      </div>
    </div>

    <!-- QR Code Section -->
    <div v-if="qrDataUrl" class="flex flex-col items-center my-1">
      <img :src="qrDataUrl" class="w-2/5 max-w-[120px] min-w-[80px] aspect-square" alt="QR" />
      <p class="text-[9px] uppercase tracking-widest text-gray-500 mt-1 max-w-[200px]">
        Scan to verify
      </p>
      <p class="text-[9px] uppercase tracking-widest text-gray-500 mt-1 max-w-[200px]">Or</p>
      <p class="text-[9px] uppercase tracking-widest text-gray-500 mt-1 max-w-[200px]">
        Share the code <strong>{{ verifyCode }}</strong>
      </p>
    </div>

    <div class="w-full border-t border-dashed border-black/20 my-3" />

    <!-- Footer -->
    <p class="text-[9px] text-gray-400 tracking-wider">Powered by QueueBuzz</p>
  </div>
</template>
