<script setup lang="ts">
/**
 * @component NotificationBanner
 * @description Minimal, expandable push notification permission banner.
 * Shows Enable Now / Check Status CTAs, Know More dropdown, and device setup guide.
 */
import { Bell, ChevronDown, X } from 'lucide-vue-next'
import { defineAsyncComponent, ref } from 'vue'

defineProps({
  notificationPermission: {
    type: String as () => 'default' | 'granted' | 'denied' | 'unsupported',
    default: 'default',
  },
  isIOS: { type: Boolean, default: false },
  isMac: { type: Boolean, default: false },
  isAndroid: { type: Boolean, default: false },
  isSafari: { type: Boolean, default: false },
  isFirefox: { type: Boolean, default: false },
  isChrome: { type: Boolean, default: false },
})

const emit = defineEmits(['request-permission'])

const NotificationSetupGuide = defineAsyncComponent(() => import('./NotificationSetupGuide.vue'))

const showNotificationHelp = ref(false)
const isBannerDismissed = ref(false)

function handleRequestPermission() {
  showNotificationHelp.value = true
  emit('request-permission')
}
</script>

<template>
  <div
    v-if="
      !isBannerDismissed &&
      notificationPermission !== 'granted' &&
      notificationPermission !== 'unsupported'
    "
    class="bg-white rounded-3xl border border-plum-faint p-4 shadow-[0_4px_24px_rgba(26,10,46,0.06)] transition-all overflow-hidden"
  >
    <!-- Minimal Header Row -->
    <div class="flex items-start justify-between gap-3">
      <!-- Left: Bell Icon & Title/Subtitle with text-based Know More button on next line -->
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div
          :class="[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-colors mt-0.5',
            notificationPermission === 'denied'
              ? 'bg-danger/10 text-danger'
              : 'bg-mint-light text-plum',
          ]"
        >
          <Bell class="h-4.5 w-4.5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-body text-sm font-semibold text-plum truncate">
            {{
              notificationPermission === 'denied'
                ? 'Notifications Blocked'
                : 'Enable Live Buzz Alerts'
            }}
          </p>
          <p class="font-body text-xs text-plum-muted truncate">
            {{
              notificationPermission === 'denied'
                ? 'Browser is blocking alerts'
                : 'Get buzzed when your turn arrives'
            }}
          </p>

          <!-- Text-based "Know more" button on next line -->
          <button
            type="button"
            class="mt-1.5 inline-flex items-center gap-1 font-body text-xs font-semibold text-plum hover:text-plum-soft transition-colors cursor-pointer"
            @click="showNotificationHelp = !showNotificationHelp"
          >
            <span>Know more</span>
            <ChevronDown
              :class="[
                'h-3.5 w-3.5 text-plum-muted transition-transform duration-200',
                showNotificationHelp ? 'rotate-180' : '',
              ]"
            />
          </button>
        </div>
      </div>

      <!-- Right Action Controls -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Primary Action Button -->
        <button
          class="rounded-xl bg-plum px-3 py-1.5 font-body text-xs font-semibold text-sand hover:bg-plum-soft transition-colors cursor-pointer"
          @click="handleRequestPermission"
        >
          {{ notificationPermission === 'denied' ? 'Check Status' : 'Enable Now' }}
        </button>

        <!-- Close / Dismiss Button (No localStorage) -->
        <button
          class="flex h-7 w-7 items-center justify-center rounded-xl text-plum-muted hover:bg-plum-faint hover:text-plum transition-colors cursor-pointer"
          aria-label="Close notification banner"
          @click="isBannerDismissed = true"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Expandable Instructional Panel -->
    <div v-show="showNotificationHelp" class="mt-3 pt-1">
      <NotificationSetupGuide
        :is-i-o-s="isIOS"
        :is-android="isAndroid"
        :is-mac="isMac"
        :is-safari="isSafari"
        :is-firefox="isFirefox"
        :is-chrome="isChrome"
      />
    </div>
  </div>
</template>
