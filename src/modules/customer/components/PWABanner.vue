<script setup lang="ts">
/**
 * @component PWABanner
 * @description Persistent instructional banner for iOS users to "Add to Home Screen"
 * as it is required for push notifications in Safari.
 * Hidden if in standalone mode or dismissed by user.
 */
import { ref, onMounted, computed } from 'vue'
import { X, Share } from 'lucide-vue-next'

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

const isVisible = ref(false)
const isIOS = ref(false)
const isStandalone = ref(false)

interface WindowWithMSStream extends Window {
  MSStream?: unknown
}

onMounted(() => {
  // 1. Detect device & PWA state
  const ua = globalThis.navigator.userAgent
  isIOS.value =
    /iPad|iPhone|iPod/.test(ua) && !(globalThis as unknown as WindowWithMSStream).MSStream
  isStandalone.value =
    globalThis.matchMedia('(display-mode: standalone)').matches ||
    (globalThis.navigator as NavigatorWithStandalone).standalone === true

  // 2. Check dismissal state
  const isDismissed = localStorage.getItem('qb_pwa_banner_dismissed') === 'true'

  // 3. Show only to iOS users not in PWA mode and haven't dismissed
  isVisible.value = isIOS.value && !isStandalone.value && !isDismissed
})

function dismiss() {
  isVisible.value = false
  localStorage.setItem('qb_pwa_banner_dismissed', 'true')
}

// Check if we should even render (performance optimization - zero DOM impact if false)
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
    <div v-if="shouldRender" class="sticky top-4 z-[60] mx-4 mb-8">
      <div
        class="relative overflow-hidden rounded-[24px] border border-warning/20 bg-white p-5 shadow-[0_12px_40px_rgba(26,10,46,0.12)]"
      >
        <!-- Background Accent -->
        <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-warning/10 blur-2xl" />

        <div class="flex items-start gap-4">
          <!-- Icon Circle -->
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warning/15"
          >
            <Share class="h-5 w-5 text-warning" />
          </div>

          <!-- Content -->
          <div class="flex-1 pr-6 text-left">
            <h3 class="font-body text-sm font-bold text-plum">Add to Home Screen</h3>
            <p class="mt-1 font-body text-sm leading-relaxed text-plum-muted">
              Safari requires this to receive <strong class="text-plum">buzz alerts</strong> and
              real-time updates while you wait.
            </p>

            <div
              class="mt-3 flex items-center gap-1.5 font-body text-sm font-semibold uppercase tracking-wider text-plum-muted"
            >
              <span>Tap</span>
              <Share class="h-3 w-3" />
              <span>then</span>
              <span class="rounded bg-sand px-1 py-0.5 text-sm text-plum">Add to Home Screen</span>
            </div>
          </div>

          <!-- Close button -->
          <button
            class="absolute right-3 top-3 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center text-plum-muted transition-colors hover:bg-sand active:scale-95"
            aria-label="Close banner"
            @click="dismiss"
          >
            <X class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
