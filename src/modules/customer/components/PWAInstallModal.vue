<script setup lang="ts">
/**
 * @component PWAInstallModal
 * @description Accessible instructions walkthrough for multiple browsers (Safari, Chrome, Firefox)
 * on how to manually install QueueBuzz PWA using browser-specific steps on iOS/macOS.
 */
import { Check, Copy, Info, Menu, Share, X } from 'lucide-vue-next'
import { ref, watch } from 'vue'

import BaseModal from '@/components/base/BaseModal.vue'
import { getRecoveryToken } from '@/modules/customer/actions/customer.action'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    isMac: boolean
    browser?: 'safari' | 'chrome' | 'firefox' | 'other'
  }>(),
  {
    browser: 'safari',
  },
)
const emit = defineEmits<{
  (e: 'close'): void
}>()

const customerStore = useCustomerStore()
const copied = ref(false)
const recoveryLink = ref('')

async function prefetchRecoveryLink() {
  try {
    let url = globalThis.location.href

    if (customerStore.isJoined && customerStore.entry?.queueId) {
      const token = await getRecoveryToken()
      if (token) {
        url = `${globalThis.location.origin}/q/${customerStore.entry.queueId}/recover?token=${token}`
      }
    }
    recoveryLink.value = url
  } catch {
    recoveryLink.value = globalThis.location.href
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      prefetchRecoveryLink()
    }
  },
  { immediate: true },
)

function copyLink() {
  try {
    const url = recoveryLink.value || globalThis.location.href
    navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fail silently
  }
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative p-6 max-w-md w-full mx-auto">
      <!-- Close Icon -->
      <button
        class="absolute right-4 top-4 rounded-full h-8 w-8 flex items-center justify-center text-plum-muted hover:bg-sand active:scale-90 cursor-pointer"
        aria-label="Close modal"
        @click="emit('close')"
      >
        <X class="h-4 w-4" />
      </button>

      <!-- Guide Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint-light">
          <component :is="props.browser === 'firefox' ? Menu : Share" class="h-5 w-5 text-plum" />
        </div>
        <div class="text-left">
          <h4 class="font-display text-sm font-bold text-plum">Install QueueBuzz</h4>
          <p class="font-body text-[10px] text-plum-muted">
            <span class="capitalize">{{ props.browser }}</span> on {{ isMac ? 'macOS' : 'iOS' }}
          </p>
        </div>
      </div>

      <!-- Description -->
      <p class="font-body text-xs text-plum-soft leading-relaxed text-left">
        Follow these quick steps to receive instant sound and buzz alerts:
      </p>

      <!-- Unsupported warning for macOS Firefox/Others -->
      <div
        v-if="isMac && props.browser !== 'safari'"
        class="mt-4 p-4 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-left"
      >
        <div class="flex gap-2.5 items-start">
          <Info class="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p class="font-body text-xs font-semibold text-plum">Installation Not Supported</p>
            <p class="font-body text-[11px] text-plum-soft mt-1 leading-normal">
              {{ props.browser === 'firefox' ? 'Firefox' : 'This browser' }} does not support PWA
              installation on macOS. Please open QueueBuzz in
              <strong class="font-semibold">Safari</strong> or
              <strong class="font-semibold">Google Chrome</strong> to install.
            </p>
          </div>
        </div>
      </div>

      <!-- Native Steps Guide -->
      <div
        v-else
        class="mt-4 flex flex-col gap-3 rounded-2xl bg-sand p-3.5 border border-plum-faint/60 text-left"
      >
        <!-- Step 1 -->
        <div class="flex items-start gap-2.5">
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-plum text-[10px] font-bold text-sand font-mono mt-0.5"
          >
            1
          </span>
          <p
            v-if="props.browser === 'safari'"
            class="font-body text-xs text-plum-soft leading-normal"
          >
            Tap Safari's <strong class="font-semibold text-plum">Share</strong> button
            <Share class="inline-block h-3.5 w-3.5 text-plum mx-1 align-text-bottom" />
            {{ isMac ? 'in top toolbar.' : 'at the bottom of your screen.' }}
          </p>
          <p
            v-else-if="props.browser === 'chrome'"
            class="font-body text-xs text-plum-soft leading-normal"
          >
            Tap Chrome's <strong class="font-semibold text-plum">Share</strong> button
            <Share class="inline-block h-3.5 w-3.5 text-plum mx-1 align-text-bottom" />
            in the address bar.
          </p>
          <p
            v-else-if="props.browser === 'firefox'"
            class="font-body text-xs text-plum-soft leading-normal"
          >
            <strong class="font-semibold text-plum">Copy the website link</strong> by tapping below:
            <button
              :class="[
                'mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[11px] font-semibold cursor-pointer active:scale-95',
                copied
                  ? 'bg-mint-light border-mint/30 text-[#00B87A]'
                  : 'bg-white border-plum-faint text-plum-muted hover:border-plum hover:text-plum',
              ]"
              @click="copyLink"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-[#00B87A]" />
              <Copy v-else class="w-3.5 h-3.5" />
              {{ copied ? 'Link Copied!' : 'Copy Link' }}
            </button>
          </p>
          <p v-else class="font-body text-xs text-plum-soft leading-normal">
            Tap your browser's <strong class="font-semibold text-plum">Menu</strong> or
            <strong class="font-semibold text-plum">Share</strong> button.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="flex items-start gap-2.5">
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-plum text-[10px] font-bold text-sand font-mono mt-0.5"
          >
            2
          </span>
          <p
            v-if="props.browser === 'safari'"
            class="font-body text-xs text-plum-soft leading-normal"
          >
            Choose
            <strong class="font-semibold text-plum">{{
              isMac ? "'Add to Dock'" : "'Add to Home Screen'"
            }}</strong>
            from the menu.
          </p>
          <p
            v-else-if="props.browser === 'firefox'"
            class="font-body text-xs text-plum-soft leading-normal"
          >
            Open <strong class="font-semibold text-plum">Safari</strong>, paste the link, tap the
            <strong class="font-semibold text-plum">Share</strong> button
            <Share class="inline-block h-3.5 w-3.5 text-plum mx-1 align-text-bottom" />, and select
            <strong class="font-semibold text-plum">'Add to Home Screen'</strong>.
          </p>
          <p v-else class="font-body text-xs text-plum-soft leading-normal">
            Choose
            <strong class="font-semibold text-plum">'Add to Home Screen'</strong>
            from the options list.
          </p>
        </div>
      </div>

      <!-- Manual Sync Details (Safari to PWA fallback) -->
      <div
        v-if="customerStore.isJoined && customerStore.entry"
        class="mt-4 p-4 rounded-2xl bg-mint-light border border-mint/20 text-left"
      >
        <p class="font-body text-xs font-semibold text-plum flex items-center gap-1.5">
          Ready to Sync with App?
        </p>
        <p class="font-body text-[11px] text-plum-soft mt-1 leading-normal">
          Once you open the installed app, click
          <strong class="font-semibold text-plum">Sync Safari Ticket</strong> and paste your
          recovery link:
        </p>
        <button
          :class="[
            'mt-2.5 flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl border transition-all text-xs font-semibold cursor-pointer active:scale-95',
            copied
              ? 'bg-mint-light border-mint/30 text-[#00B87A]'
              : 'bg-white border-plum-faint text-plum-muted hover:border-plum hover:text-plum',
          ]"
          @click="copyLink"
        >
          <Check v-if="copied" class="w-3.5 h-3.5 text-[#00B87A]" />
          <Copy v-else class="w-3.5 h-3.5" />
          {{ copied ? 'Recovery Link Copied!' : 'Copy Recovery Link' }}
        </button>
      </div>

      <!-- Got it button -->
      <button
        class="mt-5 w-full rounded-xl bg-plum py-2.5 font-body text-xs font-semibold text-sand hover:bg-plum-soft transition-colors cursor-pointer"
        @click="emit('close')"
      >
        Got it, let's install!
      </button>
    </div>
  </BaseModal>
</template>
