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

const cropperRef = ref<any>(null)

function handleCrop() {
  if (!cropperRef.value) return
  const { canvas } = cropperRef.value.getResult()
  if (canvas) {
    emit('crop', canvas.toDataURL())
    emit('close')
  }
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="flex flex-col bg-white">
      <!-- Header -->
      <div class="border-b border-plum-faint p-6">
        <h3 class="font-display text-xl font-bold text-plum">{{ title || 'Crop Image' }}</h3>
        <p class="font-body text-sm text-plum-muted">Adjust the image to fit the area.</p>
      </div>

      <!-- Cropper Area -->
      <div class="bg-plum-faint p-4 min-h-[300px] flex items-center justify-center overflow-hidden">
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
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton @click="handleCrop">Apply Crop</BaseButton>
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
</style>
