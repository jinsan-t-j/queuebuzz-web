<script setup lang="ts">
/**
 * @component PWABanner
 * @description Ultra-minimal persistent instructional banner for iOS/macOS Safari.
 * Includes a direct shortcut button that installs the app programmatically (Chrome/Android)
 * or opens a gorgeous interactive walkthrough helper for iOS/macOS Safari.
 */
import { BellRing, X } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import PWAInstallModal from './PWAInstallModal.vue'

const props = defineProps({
  forceShow: {
    type: Boolean,
    default: false,
  },
})

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

// Custom interface for beforeinstallprompt event support
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

const isVisible = ref(false)
const isIOS = ref(false)
const isMac = ref(false)
const isStandalone = ref(false)
const showGuide = ref(false)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)

interface WindowWithMSStream extends Window {
  MSStream?: unknown
}

function handleInstallPrompt(e: Event) {
  e.preventDefault()
  deferredPrompt.value = e as BeforeInstallPromptEvent
}

onMounted(() => {
  // 1. Detect device & PWA state
  const ua = globalThis.navigator.userAgent
  isMac.value = /Macintosh|Mac OS X/.test(ua)

  const isApple =
    /iPad|iPhone|iPod|Macintosh/.test(ua) && !(globalThis as unknown as WindowWithMSStream).MSStream
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)

  isIOS.value = isApple && isSafari

  isStandalone.value =
    globalThis.matchMedia('(display-mode: standalone)').matches ||
    (globalThis.navigator as NavigatorWithStandalone).standalone === true

  // 2. Check dismissal state
  const isDismissed = localStorage.getItem('qb_pwa_banner_dismissed') === 'true'

  // 3. Listen for native install prompt (Chrome / Android)
  globalThis.addEventListener('beforeinstallprompt', handleInstallPrompt)

  // 4. Show if:
  // - forceShow is explicitly passed OR
  // - running in local development mode (for easy styling & inspection) OR
  // - on iOS/macOS Safari, not running in PWA mode, and not previously dismissed
  const isDev = import.meta.env.DEV
  isVisible.value = props.forceShow || isDev || (isIOS.value && !isStandalone.value && !isDismissed)
})

onUnmounted(() => {
  globalThis.removeEventListener('beforeinstallprompt', handleInstallPrompt)
})

async function triggerInstall() {
  if (deferredPrompt.value) {
    // If native prompt is available (Chrome / Android), trigger it directly
    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.value = null
    }
  } else {
    // Fallback: iOS/macOS Safari does not support programmatic installs.
    // Display a beautiful interactive guide overlay.
    showGuide.value = true
  }
}

function dismiss() {
  isVisible.value = false
  localStorage.setItem('qb_pwa_banner_dismissed', 'true')
}

const shouldRender = computed(() => isVisible.value)
</script>

<template>
  <transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div v-if="shouldRender" class="sticky top-4 z-[60] mx-4 mb-6">
      <!-- Minimalist inline card -->
      <div
        class="relative overflow-hidden rounded-[20px] border border-plum-faint bg-white py-3 pl-4 pr-12 shadow-[0_8px_30px_rgba(26,10,46,0.06)]"
      >
        <div class="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div class="flex items-center gap-3">
            <!-- Icon -->
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mint-light">
              <BellRing class="h-4.5 w-4.5 text-plum" />
            </div>

            <!-- Instruction Text -->
            <p class="font-body text-xs leading-normal text-plum-soft">
              Get live buzz alerts: Add to {{ isMac ? 'Dock' : 'Home Screen' }} to never miss your
              turn.
            </p>
          </div>

          <!-- Install Action Button -->
          <button
            class="rounded-xl bg-plum px-3 py-1.5 font-body text-[11px] font-semibold text-sand hover:bg-plum-soft active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            @click="triggerInstall"
          >
            Install App
          </button>
        </div>

        <!-- Close button -->
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 flex items-center justify-center text-plum-muted transition-colors hover:bg-sand active:scale-90"
          aria-label="Close banner"
          @click="dismiss"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </transition>

  <!-- PWA Install Guide Modal -->
  <PWAInstallModal :is-open="showGuide" :is-mac="isMac" @close="showGuide = false" />
</template>
