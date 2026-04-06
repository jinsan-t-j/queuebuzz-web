<script setup>
/**
 * @component ShareCodeCard
 * @description A card displaying a large join code with copy link and show QR actions.
 * Usually placed on the right side of host queue dashboards.
 *
 * @prop {String} joinCode - The code to display.
 * @emits {copy-link} - "Copy Link" clicked.
 * @emits {show-qr} - "Show QR" clicked.
 */
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
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
  }
})

const emit = defineEmits(['copy-link', 'show-qr'])
const { copy: copyToClipboard } = useClipboard()
const isLinkCopied = ref(false)

async function handleCopyLink() {
  const urlToCopy = props.shareUrl
  await copyToClipboard(urlToCopy)
  isLinkCopied.value = true
  setTimeout(() => isLinkCopied.value = false, 2000)
  emit('copy-link', urlToCopy)
}
</script>

<template>
  <div class="relative overflow-hidden rounded-card border border-plum/5 bg-white px-10 pb-8 pt-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <!-- Decorative circle -->
    <div class="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-mint/10" />

    <div class="relative flex flex-col justify-center h-full">
      <p class="font-body text-[10px] font-bold uppercase tracking-[2px] text-plum/40">
        Queue code
      </p>
      <p class="mt-2 font-mono text-5xl font-bold leading-none tracking-tight text-plum">
        <span class="text-mint">{{ joinCode.slice(0, 2) }}</span>{{ joinCode.slice(2) }}
      </p>

      <!-- Copy / QR buttons -->
      <div class="mt-8 flex items-center justify-center gap-4">
        <button
          class="flex items-center gap-2 rounded-input bg-mint px-6 py-3 font-body text-xs font-bold text-plum shadow-[0_4px_6px_rgba(0,229,160,0.10),0_10px_15px_rgba(0,229,160,0.10)] transition-colors hover:bg-mint-dark cursor-pointer"
          @click="handleCopyLink"
        >
          <CopyLinkIcon v-if="!isLinkCopied" class="h-[13px] w-[11px] text-plum" />
          {{ isLinkCopied ? 'Copied!' : 'Copy Link' }}
        </button>
        <button
          class="flex items-center gap-2 rounded-input bg-plum/5 px-6 py-3 font-body text-xs font-bold text-plum transition-colors hover:bg-plum/10 cursor-pointer"
          @click="emit('show-qr')"
        >
          <ShowQrIcon class="h-[13px] w-[13px] text-plum" />
          Show QR
        </button>
      </div>
    </div>
  </div>
</template>
