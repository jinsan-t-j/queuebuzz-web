<script setup lang="ts">
/**
 * @component EntryQrModal
 * @description Modal that displays a QR code for the customer's entry.
 * Primarily used by the host to scan and verify arrival.
 *
 * @prop {Boolean} isOpen - Modal visibility state.
 * @prop {String} entryId - The entry ID to encode in the QR.
 * @prop {String} ticketNo - Displayed alongside the QR for reference.
 * @emits {close} - Emitted when modal is dismissed.
 */

import QRCode from 'qrcode'
import { ref, onMounted, watch } from 'vue'

import CloseIcon from '@/assets/icons/close-x.svg?component'
import DownloadIcon from '@/assets/icons/download-arrow.svg?component'
import QrGridIcon from '@/assets/icons/qr-grid.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  entryId: {
    type: String,
    required: true,
  },
  ticketNo: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const qrDataUrl = ref('')

async function generateQr() {
  if (!props.entryId) return

  try {
    // We encode the entry ID directly.
    // The host app's scanner will use this ID to identify the guest.
    qrDataUrl.value = await QRCode.toDataURL(props.entryId, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1A0A2E',
        light: '#FFFFFF',
      },
    })
  } catch {
    // QR generation failed
  }
}

function downloadQr() {
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `queuebuzz-ticket-${props.ticketNo || 'entry'}.png`
  a.click()
}

// Re-generate if entry ID changes or modal opens
watch(
  () => props.isOpen,
  (val) => {
    if (val) generateQr()
  },
)

onMounted(() => {
  if (props.isOpen) generateQr()
})
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative bg-white p-8">
      <!-- Close button -->
      <button
        class="cursor-pointer absolute right-6 top-6 rounded-full p-2 text-plum-muted transition-colors hover:bg-plum-faint hover:text-plum"
        @click="emit('close')"
      >
        <CloseIcon class="h-5 w-5" />
      </button>

      <div class="flex flex-col items-center">
        <!-- Header -->
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-light"
          >
            <QrGridIcon class="h-6 w-6 text-mint" />
          </div>
          <h3 class="font-display text-xl font-bold text-plum">Your Arrival QR</h3>
          <p class="mt-1 font-body text-sm text-plum-muted">
            Show this to the host when you reach.
          </p>
        </div>

        <!-- QR Code Container -->
        <div
          class="relative mb-8 flex h-64 w-64 items-center justify-center rounded-[32px] border border-plum-faint bg-white p-6 shadow-sm"
        >
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="Arrival QR"
            class="h-full w-full object-contain"
          />
          <div
            v-else
            class="flex h-full w-full animate-pulse items-center justify-center rounded-2xl bg-plum-faint"
          >
            <div
              class="h-12 w-12 rounded-full border-4 border-plum-faint border-t-mint animate-spin"
            />
          </div>

          <!-- Neatly styled ticket number badge -->
          <div
            v-if="ticketNo"
            class="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-plum px-5 py-2 shadow-xl ring-4 ring-white"
          >
            <span class="font-body text-sm font-bold tracking-[0.2em] text-sand/50 uppercase"
              >Ticket</span
            >
            <span class="font-mono text-lg font-black text-sand leading-none">
              {{ ticketNo }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex w-full flex-col gap-3">
          <BaseButton variant="primary" class="w-full !rounded-2xl !py-4" @click="emit('close')">
            Got it
          </BaseButton>

          <button
            class="flex items-center justify-center gap-1.5 py-2 font-body text-sm font-semibold text-plum-muted transition-colors hover:text-plum"
            @click="downloadQr"
          >
            <DownloadIcon class="h-4 w-4" />
            Save to Gallery
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
