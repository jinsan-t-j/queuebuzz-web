<script setup>
/**
 * @component InfoQueueModal
 * @description QR code display modal. Shows a generated QR code
 * and download/share actions. Supports two variants:
 * - 'success': shown after queue creation with "Queue is open!" heading.
 * - 'qr': shown when the host clicks "Show QR" with "Your Queue Code" heading.
 *
 * @prop {Boolean} isOpen - Whether the modal is visible.
 * @prop {String} variant - 'success' | 'qr'.
 * @prop {String} joinCode - The join code (used in download filename and share text).
 * @prop {String} queueUrl - The URL to encode in the QR code.
 * @emits {close} - User clicked the close button.
 * @emits {download} - User clicked "Download".
 * @emits {share} - User clicked "Share".
 */

// 1. Vue core imports
import { ref, computed, watch } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables
import { useShare } from '@vueuse/core'

// 4. Local composables

// 5. Component imports
import CloseXIcon from '@/assets/icons/close-x.svg?component'
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'

// 6. Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'qr',
    validator: (v) => ['success', 'qr'].includes(v),
  },
  joinCode: {
    type: String,
    default: '',
  },
  queueUrl: {
    type: String,
    default: 'https://queuebuzz.app/q/8X4K2F',
  },
})

const isSuccess = computed(() => props.variant === 'success')

// 7. Emits
const emit = defineEmits(['close', 'download', 'share'])

// 8. Composable destructuring
const { share } = useShare()

// 9. Reactive state
const qrDataUrl = ref('')

// 10. Computed properties

// 11. Methods
async function generateQr() {
  try {
    const QRCode = await import('qrcode')
    qrDataUrl.value = await QRCode.toDataURL(props.queueUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#1A0A2E', light: '#FFFFFF' },
    })
  } catch {
    qrDataUrl.value = ''
  }
}

function handleDownload() {
  if (qrDataUrl.value) {
    const a = document.createElement('a')
    a.href = qrDataUrl.value
    a.download = `queuebuzz-${props.joinCode}.png`
    a.click()
  }
  emit('download')
}

async function handleShare() {
  if (!navigator || !navigator.share) {
    console.warn('Web Share API is not supported in this browser/environment.')
    return
  }

  try {
    await share({
      title: 'Join my queue on QueueBuzz',
      text: `Join code: ${props.joinCode}`,
      url: props.queueUrl,
    })
    emit('share')
  } catch {
    
  }
}

// 12. Lifecycle hooks
watch(() => props.isOpen, (val) => {
  if (val) generateQr()
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-plum/40 p-4 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div 
          class="relative w-full max-w-[480px] rounded-[48px] bg-[#f8f8f8] p-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.10)]"
          @click.stop
        >
        <!-- Close button -->
        <button
          class="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-plum/40 transition-colors hover:bg-plum/5 hover:text-plum"
          @click="emit('close')"
        >
          <CloseXIcon class="h-3 w-3" />
        </button>

        <!-- Success icon (only for success variant) -->
        <div v-if="isSuccess" class="mx-auto mb-6 flex h-[33px] w-[33px] items-center justify-center">
          <CheckCircleIcon class="h-[33px] w-[33px] text-mint" />
        </div>

        <h2 class="mb-4 font-display text-[30px] font-semibold leading-9 tracking-tight text-plum">
          {{ isSuccess ? 'Queue is open!' : 'Your Queue Code' }}
        </h2>

        <div class="mx-auto mb-8 flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="Queue QR code"
            class="h-full w-full"
          />
          <div v-else class="h-full w-full animate-pulse bg-plum-faint" />
        </div>

        <p class="mx-auto max-w-[370px] font-body text-base leading-6 text-plum/50">
          {{ isSuccess
            ? 'Customers can now join your queue using the code below.'
            : 'Customers can now join instantly to your queue using the QR.'
          }}
        </p>

        <!-- Action buttons -->
        <div class="mt-5 flex flex-col items-center gap-4">
          <button
            class="w-full rounded-2xl bg-mint px-8 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.35px] text-plum shadow-[0_2px_4px_rgba(128,229,192,0.20),0_4px_6px_rgba(128,229,192,0.20)] transition-colors cursor-pointer hover:bg-mint-dark"
            @click="handleDownload"
          >
            DOWNLOAD
          </button>
          <button
            class="font-body text-sm font-semibold uppercase tracking-[0.35px] text-[#4a3b5d] transition-colors cursor-pointer hover:text-plum"
            @click="handleShare"
          >
            SHARE
          </button>
        </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
