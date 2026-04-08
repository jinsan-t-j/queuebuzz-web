<script setup lang="ts">
/**
 * @component BaseQrScanner
 * @description Reusable QR code scanner with built-in camera feed and overlay.
 * Uses html5-qrcode for detection.
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { useQrScanner } from '@/composables/useQrScanner'
import { X, CameraOff, Sparkles } from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
  title: { type: String, default: 'Scan QR Code' },
  subtitle: { type: String, default: 'Center the QR code in the frame' },
})

const emit = defineEmits(['result', 'close', 'error'])

const { isScanning, startScanner, stopScanner } = useQrScanner()
const scannerElementId = 'qr-scanner-region'
const hasError = ref(false)

async function initialize() {
  try {
    await startScanner(scannerElementId, (text) => {
      emit('result', text)
    })
  } catch (err: unknown) {
    const error = err as { message?: string }
    hasError.value = true
    emit('error', error.message || 'Failed to start camera')
  }
}

onMounted(() => {
  initialize()
})

onUnmounted(async () => {
  await stopScanner()
})
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex flex-col bg-plum text-white overflow-hidden animate-in fade-in duration-300"
  >
    <!-- Header -->
    <header class="flex items-center justify-between p-6">
      <div class="flex flex-col gap-1">
        <h2 class="font-display text-xl font-bold text-white">{{ title }}</h2>
        <p class="font-body text-sm text-plum-muted">{{ subtitle }}</p>
      </div>
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        @click="emit('close')"
      >
        <X class="h-5 w-5" />
      </button>
    </header>

    <!-- Scanner Region -->
    <div class="relative flex-1 flex flex-col items-center justify-center px-6 pb-20">
      <!-- Loading / No Camera Fallback -->
      <div v-if="!isScanning && !hasError" class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 rounded-full border-4 border-white/20 border-t-mint animate-spin" />
        <p class="font-body text-sm text-plum-muted">Initializing camera...</p>
      </div>

      <div v-if="hasError" class="flex flex-col items-center gap-6 max-w-xs text-center">
        <div class="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
          <CameraOff class="w-8 h-8 text-danger" />
        </div>
        <div>
          <p class="font-display font-bold text-lg mb-2">Camera Access Failed</p>
          <p class="font-body text-sm text-plum-muted leading-relaxed">
            We couldn't access your camera. Please ensure permissions are granted in your browser
            settings.
          </p>
        </div>
        <BaseButton variant="primary" size="sm" @click="initialize">Try Again</BaseButton>
      </div>

      <!-- Camera Container -->
      <div
        v-show="isScanning"
        class="relative w-full aspect-square max-w-[320px] rounded-[40px] border-text border-white/10 overflow-hidden shadow-2xl"
      >
        <div :id="scannerElementId" class="w-full h-full object-cover" />

        <!-- Scanning Overlay Decorations -->
        <div
          class="absolute inset-0 border-[2px] border-mint/30 pointer-events-none rounded-[40px]"
        />

        <!-- Corner Frames -->
        <div
          class="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-mint rounded-tl-lg"
        />
        <div
          class="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-mint rounded-tr-lg"
        />
        <div
          class="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-mint rounded-bl-lg"
        />
        <div
          class="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-mint rounded-br-lg"
        />

        <!-- Scanning Line -->
        <div
          class="absolute top-0 inset-x-0 h-[2px] bg-mint/50 shadow-[0_0_15px_rgba(0,229,160,0.8)] animate-[scan_3s_infinite_linear]"
        />
      </div>

      <!-- Help Text -->
      <div
        v-if="isScanning"
        class="mt-12 flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl animate-in slide-in-from-bottom-4 duration-500"
      >
        <Sparkles class="w-4 h-4 text-mint" />
        <span class="font-body text-sm font-medium">Scanning automatically...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scan {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

:deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

/* Hide html5-qrcode's built-in messages */
:deep(#qr-scanner-region__status_span) {
  display: none !important;
}
:deep(#qr-scanner-region__dashboard) {
  display: none !important;
}
</style>
