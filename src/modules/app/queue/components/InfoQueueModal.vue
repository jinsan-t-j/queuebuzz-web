<script setup lang="ts">
/**
 * @component InfoQueueModal
 * @description QR code display modal with premium aesthetics.
 * Shows a generated QR code and download/share actions.
 */
import { useShare } from '@vueuse/core'
import QRCode from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// Icons
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'
import CloseXIcon from '@/assets/icons/close-x.svg?component'
import CopyIcon from '@/assets/icons/copy.svg?component'
import DownloadIcon from '@/assets/icons/download-arrow.svg?component'
import ShareIcon from '@/assets/icons/share.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useCapture } from '@/composables/useCapture'

import HostQRCaptureTemplate from './HostQRCaptureTemplate.vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    joinCode: string
    queueUrl: string
    queueName?: string
    slug?: string
    variant?: 'success' | 'qr'
    redirectUrl?: string
    showQr?: boolean
  }>(),
  {
    queueName: '',
    slug: '',
    variant: 'qr',
    redirectUrl: '',
    showQr: true,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download'): void
  (e: 'share'): void
}>()

const router = useRouter()
const { share } = useShare()
const { isCapturing, captureElement } = useCapture()

const qrDataUrl = ref('')
const copiedCode = ref(false)
const copiedLink = ref(false)

const isSuccess = computed(() => props.variant === 'success')
const currentQueueUrl = computed(() => {
  const origin = globalThis.window === undefined ? '' : globalThis.location.origin
  return props.queueUrl.startsWith('http') ? props.queueUrl : `${origin}${props.queueUrl}`
})
const currentJoinCode = computed(() => props.joinCode)

async function generateQr() {
  try {
    qrDataUrl.value = await QRCode.toDataURL(currentQueueUrl.value, {
      width: 400,
      margin: 1,
      color: { dark: '#1A0A2E', light: '#FFFFFF' },
    })
  } catch {
    qrDataUrl.value = ''
  }
}

async function handleDownload() {
  await captureElement('capture-host-qr', `queuebuzz-qr-${props.joinCode}.png`)
  emit('download')
}

async function handleCopyCode() {
  try {
    await navigator.clipboard.writeText(currentJoinCode.value)
    copiedCode.value = true
    setTimeout(() => (copiedCode.value = false), 2000)
  } catch {
    // eslint-disable-next-line no-console
    console.log('Copy failed')
  }
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
    } catch {
      // User cancelled or error
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.url)
      copiedLink.value = true
      setTimeout(() => (copiedLink.value = false), 2000)
    } catch {
      // Fallback failed
    }
  }
}

function handleConfirmRedirect() {
  if (props.redirectUrl && router) {
    router.push(props.redirectUrl)
  }
  emit('close')
}

watch(
  () => props.isOpen,
  (val) => {
    if (val && props.showQr) generateQr()
  },
  { immediate: true },
)
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative w-full overflow-hidden p-8 sm:p-9 text-center bg-white">
      <!-- Hidden Capture Template -->
      <HostQRCaptureTemplate
        v-if="showQr"
        :queue-name="queueName"
        :join-code="joinCode"
        :queue-url="currentQueueUrl"
      />

      <!-- Gradient background glow -->
      <div
        class="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-mint/10 blur-[100px] pointer-events-none"
      />
      <div
        class="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-plum/10 blur-[100px] pointer-events-none"
      />

      <!-- Close button -->
      <button
        class="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-2xl text-plum-muted/40 transition-all hover:bg-plum/5 hover:text-plum active:scale-95 cursor-pointer"
        @click="emit('close')"
      >
        <CloseXIcon class="h-4 w-4" />
      </button>

      <div class="relative z-10">
        <!-- Success Checkmark Badge -->
        <div v-if="isSuccess" class="mb-4 flex justify-center">
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-mint-light text-mint shadow-[0_0_20px_rgba(0,229,160,0.25)]"
          >
            <CheckCircleIcon class="h-8 w-8 text-mint" />
          </div>
        </div>

        <h2 class="mb-2 font-display text-[30px] font-bold leading-tight tracking-tight text-plum">
          {{ isSuccess ? 'Queue is open!' : 'Your Queue Code' }}
        </h2>

        <p class="mx-auto mb-5 max-w-[320px] font-body text-sm leading-relaxed text-plum-muted">
          {{
            isSuccess
              ? showQr
                ? 'Customers can now join your queue using the code or QR below.'
                : 'Customers can now join your queue using the code below.'
              : 'Keep this QR handy for walk-in customers to join instantly.'
          }}
        </p>

        <!-- QR Display Container -->
        <div
          v-if="showQr"
          class="group relative mx-auto mb-5 flex h-[210px] w-[210px] items-center justify-center overflow-hidden rounded-3xl bg-white p-5 shadow-[0_12px_36px_rgba(26,10,46,0.08)] border border-plum-faint transition-all hover:shadow-[0_20px_50px_rgba(26,10,46,0.12)]"
        >
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="Queue QR code"
            class="h-full w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
          <div v-else class="h-full w-full animate-pulse rounded-xl bg-plum-faint" />

          <!-- Subtle icon overlay on hover -->
          <div
            class="absolute inset-0 flex items-center justify-center bg-plum/10 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px] cursor-pointer"
          >
            <div class="rounded-full bg-white p-3 shadow-lg" @click="handleDownload">
              <DownloadIcon v-if="!isCapturing" class="h-6 w-6 text-plum" />
              <div
                v-else
                class="h-6 w-6 animate-spin rounded-full border-2 border-plum border-t-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Join Code Display Container -->
        <div class="mb-5 rounded-2xl bg-sand/70 p-4 border border-plum-faint text-center">
          <p
            class="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-plum-muted/60 mb-1"
          >
            JOIN CODE
          </p>
          <div class="flex items-center justify-center gap-3">
            <span class="font-mono text-2xl sm:text-3xl font-bold tracking-[0.2em] text-plum">
              {{ currentJoinCode }}
            </span>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-plum-muted border border-plum-faint shadow-sm transition-all hover:bg-plum hover:text-white active:scale-95 cursor-pointer"
              @click="handleCopyCode"
            >
              <CopyIcon v-if="!copiedCode" class="h-3.5 w-3.5" />
              <CheckCircleIcon v-else class="h-3.5 w-3.5 text-mint" />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <BaseButton
            variant="primary"
            class="w-full h-13 py-3.5 text-base font-bold shadow-[0_8px_24px_rgba(0,229,160,0.3)] hover:brightness-105 active:scale-95 transition-all rounded-2xl"
            @click="handleConfirmRedirect"
          >
            OPEN QUEUE
          </BaseButton>

          <button
            class="flex items-center justify-center gap-1.5 font-body text-xs font-bold transition-colors cursor-pointer mt-0.5"
            :class="copiedLink ? 'text-mint' : 'text-plum-muted/70 hover:text-plum'"
            @click="handleShare"
          >
            <VerifiedCheckIcon v-if="copiedLink" class="h-4 w-4 text-mint" />
            <ShareIcon v-else class="h-4 w-4" />
            <span>{{ copiedLink ? 'LINK COPIED!' : 'SHARE LINK INSTEAD' }}</span>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
