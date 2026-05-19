<script setup lang="ts">
/**
 * @component ShareCodeCard
 * @description A card displaying a large join code with copy link and show QR actions.
 * Usually placed on the right side of host queue dashboards.
 *
 * @prop {String} joinCode - The code to display.
 * @prop {String} shareUrl - The link to share.
 * @prop {String} [expiresAt] - Optional expiration date of this queue.
 * @emits {copy-link} - "Copy Link" clicked.
 * @emits {show-qr} - "Show QR" clicked.
 */
import { useClipboard } from '@vueuse/core'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import CopyLinkIcon from '@/assets/icons/copy-link.svg?component'
import ShowQrIcon from '@/assets/icons/show-qr.svg?component'

const props = defineProps({
  joinCode: {
    type: String,
    required: true,
  },
  shareUrl: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['copy-link', 'show-qr'])
const { copy: copyToClipboard } = useClipboard()
const isLinkCopied = ref(false)

const timeLeftStr = ref('')
const isExpiringSoon = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

function updateCountdown() {
  if (!props.expiresAt) {
    timeLeftStr.value = ''
    return
  }

  const expiry = new Date(props.expiresAt).getTime()
  const now = Date.now()
  const diff = expiry - now

  if (diff <= 0) {
    timeLeftStr.value = 'Expired'
    isExpiringSoon.value = true
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    return
  }

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  // Expiring soon if less than 15 minutes
  isExpiringSoon.value = diff < 15 * 60 * 1000

  if (days > 0) {
    timeLeftStr.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
  } else if (hours > 0) {
    timeLeftStr.value = `${hours}h ${minutes}m ${seconds}s`
  } else {
    timeLeftStr.value = `${minutes}m ${seconds}s`
  }
}

onMounted(() => {
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

watch(
  () => props.expiresAt,
  (newVal) => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    updateCountdown()
    if (newVal) {
      timerInterval = setInterval(updateCountdown, 1000)
    }
  },
)

async function handleCopyLink() {
  const urlToCopy = props.shareUrl
  await copyToClipboard(urlToCopy)
  isLinkCopied.value = true
  setTimeout(() => (isLinkCopied.value = false), 2000)
  emit('copy-link', urlToCopy)
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-card border border-plum-faint bg-white px-6 pb-6 pt-10 sm:px-10 sm:pb-8 sm:pt-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
  >
    <!-- Decorative circle -->
    <div class="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-mint/10" />

    <div class="relative flex flex-col justify-center h-full">
      <p class="font-display text-xs sm:text-sm font-bold text-plum/40 uppercase tracking-wider">
        Queue code
      </p>
      <p
        class="mt-2 font-mono text-4xl sm:text-5xl font-bold leading-none tracking-tight text-plum"
      >
        <span class="text-mint">{{ joinCode.slice(0, 2) }}</span
        >{{ joinCode.slice(2) }}
      </p>

      <!-- Copy / QR buttons -->
      <div
        class="mt-6 sm:mt-8 flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4"
      >
        <button
          class="flex w-full xs:w-auto items-center justify-center gap-2 rounded-input bg-mint px-6 py-2.5 sm:py-3 font-body text-sm font-bold text-on-mint shadow-[0_4px_6px_rgba(0,229,160,0.10),0_10px_15px_rgba(0,229,160,0.10)] transition-colors hover:bg-mint-dark cursor-pointer"
          @click="handleCopyLink"
        >
          <CopyLinkIcon v-if="!isLinkCopied" class="h-[13px] w-[11px] text-on-mint" />
          {{ isLinkCopied ? 'Copied!' : 'Copy Link' }}
        </button>
        <button
          class="flex w-full xs:w-auto items-center justify-center gap-2 rounded-input bg-plum/5 dark:bg-plum-faint px-6 py-2.5 sm:py-3 font-body text-sm font-bold text-plum transition-colors hover:bg-plum/10 dark:hover:bg-plum-faint/80 cursor-pointer"
          @click="emit('show-qr')"
        >
          <ShowQrIcon class="h-[13px] w-[13px] text-plum" />
          Show QR
        </button>
      </div>

      <!-- Expiry Countdown (Muted / Low Precedence) -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="timeLeftStr"
          class="mt-6 flex items-center justify-center gap-1.5 text-xs text-plum-muted/70 font-body"
        >
          <span
            class="inline-block w-1.5 h-1.5 rounded-full"
            :class="isExpiringSoon ? 'bg-danger/80 animate-pulse' : 'bg-plum-muted/40'"
          />
          <span>Expires in:</span>
          <span
            class="font-mono font-semibold"
            :class="isExpiringSoon ? 'text-danger/90 font-bold' : 'text-plum-muted'"
          >
            {{ timeLeftStr }}
          </span>
        </div>
      </transition>
    </div>
  </div>
</template>
