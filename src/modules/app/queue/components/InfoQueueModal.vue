<script setup lang="ts">
/**
 * @component InfoQueueModal
 * @description QR code display modal with premium aesthetics.
 * Shows a generated QR code and download/share actions.
 */
import { ref, computed, watch } from 'vue'
import { useShare } from '@vueuse/core'
import QRCode from 'qrcode'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import HostQRCaptureTemplate from './HostQRCaptureTemplate.vue'
import { useCapture } from '@/composables/useCapture'

// Icons
import CloseXIcon from '@/assets/icons/close-x.svg?component'
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'
import DownloadIcon from '@/assets/icons/download-arrow.svg?component'
import ShareIcon from '@/assets/icons/share.svg?component'
import CopyIcon from '@/assets/icons/copy.svg?component'

const props = defineProps<{
  isOpen: boolean
  joinCode: string
  queueUrl: string
  queueName: string
  slug?: string
  variant?: 'success' | 'qr'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download'): void
  (e: 'share'): void
}>()

const { share } = useShare()
const { isCapturing, captureElement } = useCapture()

const qrDataUrl = ref('')
const copied = ref(false)

const isSuccess = computed(() => props.variant === 'success')
const currentQueueUrl = computed(() => props.queueUrl)
const currentJoinCode = computed(() => props.joinCode)

async function generateQr() {
  try {
    qrDataUrl.value = await QRCode.toDataURL(currentQueueUrl.value, {
      width: 400,
      margin: 2,
      color: { dark: '#1A0A2E', light: '#FFFFFF' },
    })
  } catch (err) {
    console.error('QR Generation Error:', err)
    qrDataUrl.value = ''
  }
}

async function handleDownload() {
  await captureElement(
    'capture-host-qr',
    `queuebuzz-qr-${props.joinCode}.png`
  )
  emit('download')
}

async function handleShare() {
  const shareData = {
    title: 'Join my queue on QueueBuzz',
    text: `Skip the wait — join my virtual queue with code: ${currentJoinCode.value}`,
    url: currentQueueUrl.value,
  }

  if (navigator.share) {
    try {
      await share(shareData)
      emit('share')
    } catch (err) {
      // User cancelled or error
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.url)
      copied.value = true
      setTimeout(() => (copied.value = false), 2000)
    } catch {
      // Fallback failed
    }
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) generateQr()
  },
  { immediate: true }
)
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative w-full overflow-hidden rounded-[48px] bg-white p-8 text-center shadow-[0_30px_80px_rgba(26,10,46,0.15)]">
      <!-- Hidden Capture Template -->
      <HostQRCaptureTemplate
        :queue-name="queueName"
        :join-code="joinCode"
        :slug="slug"
      />

      <!-- Gradient background glow -->
      <div class="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-mint/5 blur-[100px]" />
      <div class="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-plum/5 blur-[100px]" />

      <!-- Close button -->
      <button
        class="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-2xl text-plum/20 transition-all hover:bg-plum/5 hover:text-plum active:scale-95"
        @click="emit('close')"
      >
        <CloseXIcon class="h-4 w-4" />
      </button>

      <div class="relative z-10">
        <!-- Success/Heading -->
        <div v-if="isSuccess" class="mb-4 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-mint-light/50 text-mint shadow-[0_0_20px_rgba(0,229,160,0.2)]">
            <CheckCircleIcon class="h-8 w-8" />
          </div>
        </div>

        <h2 class="mb-4 font-display text-[32px] font-bold leading-tight tracking-tight text-plum">
          {{ isSuccess ? 'Queue is open!' : 'Your Queue Code' }}
        </h2>

        <p class="mx-auto mb-4 max-w-[320px] font-body text-sm leading-relaxed text-plum/50">
          {{
            isSuccess
              ? 'Customers can now join your queue using the code or QR below.'
              : 'Keep this QR handy for walk-in customers to join instantly.'
          }}
        </p>

        <!-- QR Display -->
        <div class="group relative mx-auto mb-4 flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(26,10,46,0.08)] transition-all hover:shadow-[0_20px_60px_rgba(26,10,46,0.12)]">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="Queue QR code"
            class="h-full w-full rounded-xl transition-transform duration-500 group-hover:scale-110"
          />
          <div v-else class="h-full w-full animate-pulse rounded-xl bg-plum-faint" />
          
          <!-- Subtle icon overlay on hover -->
          <div class="absolute inset-0 flex items-center justify-center bg-white/20 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px]">
            <div class="rounded-full bg-white p-3 shadow-lg" @click="handleDownload">
              <DownloadIcon v-if="!isCapturing" class="h-6 w-6 text-plum" />
              <div v-else class="h-6 w-6 animate-spin rounded-full border-2 border-plum border-t-transparent" />
            </div>
          </div>
        </div>

        <!-- Join Code Display -->
        <div class="mb-4 rounded-3xl bg-sand/50 p-6 border border-plum/5">
          <p class="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-plum/30 mb-2">JOIN CODE</p>
          <div class="flex items-center justify-center gap-4">
            <span class="font-mono text-3xl font-bold tracking-[0.2em] text-plum">
              {{ currentJoinCode }}
            </span>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-plum/40 shadow-sm transition-all hover:bg-plum hover:text-white active:scale-95"
              @click="handleShare"
            >
              <CopyIcon v-if="!copied" class="h-3.5 w-3.5" />
              <CheckCircleIcon v-else class="h-3.5 w-3.5 text-mint" />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <BaseButton
            variant="primary"
            :isLoading="isCapturing"
            class="w-full py-5 text-lg font-bold shadow-xl shadow-mint/20 active:scale-95 transition-all"
            @click="handleDownload"
          >
            <DownloadIcon v-if="!isCapturing" class="mr-2 h-5 w-5" />
            {{ isCapturing ? 'GENERATING...' : 'DOWNLOAD QR' }}
          </BaseButton>

          <BaseButton 
            variant="ghost" 
            class="w-full h-14 text-plum/60 hover:text-plum font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            @click="handleShare"
          >
            <ShareIcon class="h-4 w-4" />
            {{ copied ? 'URL COPIED!' : 'SHARE JOIN LINK' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
