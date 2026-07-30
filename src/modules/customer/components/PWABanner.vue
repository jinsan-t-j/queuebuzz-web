<script setup lang="ts">
/**
 * @component PWABanner
 * @description Ultra-minimal persistent instructional banner for iOS (Safari, Chrome, Firefox) & macOS Safari.
 * Includes a direct shortcut button that installs the app programmatically (Chrome/Android)
 * or opens a gorgeous interactive walkthrough helper for iOS/macOS.
 */
import { BellRing, X } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { getRecoveryToken } from '@/modules/customer/actions/customer.action'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'

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
const detectedBrowser = ref<'safari' | 'chrome' | 'firefox' | 'other'>('safari')
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)

function handleInstallPrompt(e: Event) {
  e.preventDefault()
  deferredPrompt.value = e as BeforeInstallPromptEvent
  checkVisibility()
}

function checkVisibility() {
  if (isStandalone.value && !props.forceShow) {
    isVisible.value = false
    return
  }

  const isDismissed = localStorage.getItem('qb_pwa_banner_dismissed') === 'true'
  const isDev = import.meta.env.DEV

  // Show if:
  // - forceShow is explicitly passed OR
  // - running in local development mode (for easy styling & inspection) OR
  // - on iOS (any browser), macOS Safari (native dock support), or if beforeinstallprompt is active
  isVisible.value =
    props.forceShow ||
    isDev ||
    ((isIOS.value || isMac.value || deferredPrompt.value !== null) && !isDismissed)
}

onMounted(() => {
  // 1. Detect device & PWA state
  const ua = globalThis.navigator.userAgent
  const isAppleMobile =
    /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && globalThis.navigator.maxTouchPoints > 1)
  const isMacOs = /Macintosh|Mac OS X/.test(ua) && !isAppleMobile

  const isFirefox = /firefox|fxios/i.test(ua)
  const isChrome = /chrome|crios/i.test(ua)
  const isEdge = /edgi?os|edg/i.test(ua)
  const isSafari = /safari/i.test(ua) && !isChrome && !isFirefox && !isEdge

  if (isSafari) {
    detectedBrowser.value = 'safari'
  } else if (isChrome) {
    detectedBrowser.value = 'chrome'
  } else if (isFirefox) {
    detectedBrowser.value = 'firefox'
  } else {
    detectedBrowser.value = 'other'
  }

  isIOS.value = isAppleMobile
  // Only macOS Safari supports manual installation ("Add to Dock")
  isMac.value = isMacOs && isSafari

  isStandalone.value =
    globalThis.matchMedia('(display-mode: standalone)').matches ||
    (globalThis.navigator as NavigatorWithStandalone).standalone === true

  // 2. Listen for native install prompt (Chrome / Android)
  globalThis.addEventListener('beforeinstallprompt', handleInstallPrompt)

  // 3. Initial visibility check
  checkVisibility()

  // 4. Pre-fetch and append recovery token to URL / CacheStorage for iOS/macOS Safari users
  // so that "Add to Home Screen" or "Add to Dock" transfers the session successfully.
  if ((isIOS.value || isMac.value) && !isStandalone.value) {
    const customerStore = useCustomerStore()
    if (customerStore.isJoined) {
      getRecoveryToken()
        .then(async (token) => {
          if (token && typeof globalThis !== 'undefined' && globalThis.location) {
            // 4a. Inject to URL bar as a fallback
            const url = new URL(globalThis.location.href)
            url.searchParams.set('recovery_token', token)
            globalThis.history.replaceState({}, '', url.toString())

            // 4b. Save to CacheStorage (shared between Safari and PWA on iOS)
            if ('caches' in globalThis) {
              try {
                const cache = await globalThis.caches.open('queuebuzz-session')
                await cache.put(
                  new Request('/pwa-recovery-session-token'),
                  new Response(JSON.stringify({ token }), {
                    headers: { 'Content-Type': 'application/json' },
                  }),
                )
              } catch {
                // Fail silently
              }
            }
          }
        })
        .catch(() => {
          // Fail silently
        })
    }
  }
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
    <div v-if="shouldRender" class="w-full">
      <!-- Minimalist inline card -->
      <div
        class="relative overflow-hidden rounded-3xl border border-plum-faint bg-white p-4 shadow-[0_4px_24px_rgba(26,10,46,0.06)]"
      >
        <div class="flex items-center justify-between gap-3 pr-8 flex-wrap sm:flex-nowrap">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <!-- Icon -->
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mint-light"
            >
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
            class="rounded-xl bg-plum px-3 py-1.5 font-body text-xs font-semibold text-sand hover:bg-plum-soft active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            @click="triggerInstall"
          >
            Install App
          </button>
        </div>

        <!-- Close button -->
        <button
          class="absolute right-3 top-3.5 flex h-7 w-7 items-center justify-center rounded-xl text-plum-muted hover:bg-plum-faint hover:text-plum transition-colors cursor-pointer"
          aria-label="Close banner"
          @click="dismiss"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </transition>

  <!-- PWA Install Guide Modal -->
  <PWAInstallModal
    :is-open="showGuide"
    :is-mac="isMac"
    :browser="detectedBrowser"
    @close="showGuide = false"
  />
</template>
