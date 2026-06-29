<script setup lang="ts">
/**
 * @component BaseQrScanner
 * @description Reusable QR code scanner with built-in camera feed and overlay.
 * Uses html5-qrcode for detection.
 */

import { X, CameraOff, Sparkles } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import { useQrScanner } from '@/composables/useQrScanner'

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
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-plum/60 backdrop-blur-sm animate-in fade-in duration-300"
  >
    <!-- Modal Card -->
    <div
      class="relative bg-plum text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 flex flex-col animate-in zoom-in-95 duration-300"
    >
      <!-- Header -->
      <header class="flex items-center justify-between p-6 pb-4">
        <div class="flex flex-col gap-1">
          <h2 class="font-display text-lg font-bold text-white">{{ title }}</h2>
          <p class="font-body text-xs text-plum-muted">{{ subtitle }}</p>
        </div>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <!-- Scanner Region -->
      <div class="relative flex flex-col items-center justify-center px-6 pb-8 pt-4">
        <!-- Loading / No Camera Fallback -->
        <div v-if="!isScanning && !hasError" class="flex flex-col items-center gap-4 py-8">
          <div class="w-10 h-10 rounded-full border-4 border-white/20 border-t-mint animate-spin" />
          <p class="font-body text-xs text-plum-muted">Initializing camera...</p>
        </div>

        <div v-if="hasError" class="flex flex-col items-center gap-6 py-6 max-w-xs text-center">
          <div class="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <CameraOff class="w-6 h-6 text-danger" />
          </div>
          <div>
            <p class="font-display font-bold text-base mb-1">Camera Access Failed</p>
            <p class="font-body text-xs text-plum-muted leading-relaxed">
              Ensure camera permissions are granted in your browser settings.
            </p>
          </div>
          <BaseButton variant="primary" size="sm" @click="initialize">Try Again</BaseButton>
        </div>

        <!-- Camera Container -->
        <div
          v-show="isScanning"
          class="relative w-full aspect-square max-w-[260px] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl"
        >
          <div :id="scannerElementId" class="w-full h-full object-cover" />

          <!-- Scanning Overlay Decorations -->
          <div
            class="absolute inset-0 border-[2px] border-mint/30 pointer-events-none rounded-[32px]"
          />

          <!-- Corner Frames -->
          <div
            class="absolute top-6 left-6 w-6 h-6 border-t-4 border-l-4 border-mint rounded-tl-lg"
          />
          <div
            class="absolute top-6 right-6 w-6 h-6 border-t-4 border-r-4 border-mint rounded-tr-lg"
          />
          <div
            class="absolute bottom-6 left-6 w-6 h-6 border-b-4 border-l-4 border-mint rounded-bl-lg"
          />
          <div
            class="absolute bottom-6 right-6 w-6 h-6 border-b-4 border-r-4 border-mint rounded-br-lg"
          />

          <!-- Scanning Line -->
          <div
            class="absolute top-0 inset-x-0 h-[2px] bg-mint/50 shadow-[0_0_15px_rgba(0,229,160,0.8)] animate-[scan_3s_infinite_linear]"
          />
        </div>

        <!-- Help Text -->
        <div
          v-if="isScanning"
          class="mt-6 flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl animate-in slide-in-from-bottom-4 duration-500"
        >
          <Sparkles class="w-3.5 h-3.5 text-mint" />
          <span class="font-body text-xs font-medium">Scanning automatically...</span>
        </div>
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
