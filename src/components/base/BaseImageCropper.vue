<script setup lang="ts">
/**
 * @component BaseImageCropper
 * @description Image cropping modal using vue-advanced-cropper.
 */
import { ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import 'vue-advanced-cropper/dist/theme.classic.css'

import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  isOpen: boolean
  imageSrc: string | null
  aspectRatio?: number
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'crop', croppedDataUrl: string): void
}>()

interface CropperInstance {
  getResult: () => {
    canvas: HTMLCanvasElement | null
  }
}

const cropperRef = ref<CropperInstance | null>(null)
const isProcessing = ref(false)

async function handleCrop() {
  if (!cropperRef.value) return
  const result = cropperRef.value.getResult()
  const canvas = result.canvas

  if (canvas) {
    isProcessing.value = true

    // Add a tiny artificial delay so the user can actually see the "magic" happen
    // This creates a much more satisfying UX than an instant jump.
    await new Promise((r) => setTimeout(r, 800))

    // 1. Determine target dimensions (max 1200px)
    const MAX_DIMENSION = 1200
    let width = canvas.width
    let height = canvas.height

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width)
        width = MAX_DIMENSION
      } else {
        width = Math.round((width * MAX_DIMENSION) / height)
        height = MAX_DIMENSION
      }
    }

    // 2. Create a temporary canvas for resizing
    const resizeCanvas = document.createElement('canvas')
    resizeCanvas.width = width
    resizeCanvas.height = height
    const ctx = resizeCanvas.getContext('2d')

    if (ctx) {
      // Draw and resize
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(canvas, 0, 0, width, height)

      // 3. Export as compressed JPEG (0.85 quality)
      const dataUrl = resizeCanvas.toDataURL('image/jpeg', 0.85)
      emit('crop', dataUrl)
      emit('close')
    } else {
      // Fallback if context creation fails
      emit('crop', canvas.toDataURL('image/jpeg', 0.85))
      emit('close')
    }
    isProcessing.value = false
  }
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="!isProcessing && emit('close')">
    <div class="flex flex-col bg-white overflow-hidden relative">
      <!-- ═══ Hyper-Realistic Liquid Glass Ripple Overlay ═══ -->
      <Transition name="magic-fade">
        <div
          v-if="isProcessing"
          class="absolute inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none"
        >
          <!-- Background Dimmer -->
          <div class="absolute inset-0 bg-plum/10 backdrop-blur-[2px]" />

          <!-- Singular Glass Wave Ripple -->
          <div class="glass-wave-container absolute inset-0">
            <div class="glass-wave animate-wave-sweep">
              <!-- Glossy Reflection Edge -->
              <div
                class="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-60"
              />
              <!-- Frosted Texture -->
              <div
                class="absolute inset-0 bg-white/5 backdrop-blur-[40px] brightness-125 saturate-150 shadow-[0_0_120px_rgba(0,229,160,0.15)]"
              />
              <!-- Ray-traced Shimmer -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40 skew-x-[-15deg] translate-x-[-50%] animate-shimmer-ray"
              />
            </div>
          </div>

          <!-- Futuristic Center Glow -->
          <div class="relative z-10 flex h-32 w-32 items-center justify-center rounded-full">
            <div class="absolute inset-0 animate-pulse rounded-full bg-mint/5 blur-3xl" />
            <div class="h-12 w-12 animate-spin rounded-full border border-mint/30 border-t-mint" />
          </div>

          <!-- Distortion SVG Filter (Hidden) -->
          <svg class="hidden">
            <filter id="ripple-distort">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="3"
                result="noise"
              />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
            </filter>
          </svg>
        </div>
      </Transition>

      <!-- Header -->
      <div class="border-b border-plum-faint p-6">
        <h3 class="font-display text-xl font-bold text-plum">{{ title || 'Crop Image' }}</h3>
        <p class="font-body text-sm text-plum-muted">Adjust the image to fit the area.</p>
      </div>

      <!-- Cropper Area -->
      <div
        :class="[
          'bg-plum-faint p-4 min-h-[300px] flex items-center justify-center overflow-hidden transition-all duration-700',
          isProcessing ? 'filter-ripple scale-[1.02]' : '',
        ]"
      >
        <Cropper
          v-if="imageSrc"
          ref="cropperRef"
          :src="imageSrc"
          :stencil-props="{
            aspectRatio: aspectRatio,
            linesClassnames: {
              default: 'border-white/50',
            },
            handlersClassnames: {
              default: 'bg-white',
            },
          }"
          class="max-h-[60vh] w-full"
        />
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between border-t border-plum-faint p-6">
        <BaseButton variant="ghost" :disabled="isProcessing" @click="emit('close')"
          >Cancel</BaseButton
        >
        <BaseButton :is-loading="isProcessing" @click="handleCrop">Apply Crop</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style>
/* Customizing the cropper appearance to match QueueBuzz */
.vue-advanced-cropper__background {
  background: transparent !important;
}
.vue-advanced-cropper__foreground {
  background: rgba(26, 10, 46, 0.6) !important;
}

.glass-wave-container {
  perspective: 1000px;
}

.glass-wave {
  position: absolute;
  top: -20%;
  bottom: -20%;
  width: 40%;
  transform: skewX(-25deg) translateX(-150%);
  z-index: 5;
}

@keyframes wave-sweep {
  0% {
    transform: skewX(-25deg) translateX(-150%);
  }
  100% {
    transform: skewX(-25deg) translateX(250%);
  }
}

@keyframes shimmer-ray {
  0% {
    transform: skewX(-15deg) translateX(-100%);
  }
  100% {
    transform: skewX(-15deg) translateX(100%);
  }
}

.animate-wave-sweep {
  animation: wave-sweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.animate-shimmer-ray {
  animation: shimmer-ray 1.5s ease-in-out infinite;
}

.filter-ripple {
  filter: url(#ripple-distort);
}

.magic-fade-enter-active,
.magic-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.magic-fade-enter-from,
.magic-fade-leave-to {
  opacity: 0;
}
</style>
