<script setup lang="ts">
/**
 * @component NotificationSetupGuide
 * @description Compact device-specific push notification and alert setup guide.
 */
import { Share } from 'lucide-vue-next'

defineProps<{
  isIOS: boolean
  isAndroid: boolean
  isMac: boolean
  isSafari: boolean
  isFirefox: boolean
  isChrome: boolean
}>()
</script>

<template>
  <div
    class="rounded-3xl border border-plum-faint bg-white/60 p-4 text-left shadow-xs transition-all animate-in fade-in slide-in-from-top-2"
  >
    <div class="flex gap-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mint-light">
        <svg class="h-4.5 w-4.5 text-plum animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C10.9 2 10 2.9 10 4V4.29C7.12 5.15 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.15 14 4.29V4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <p class="font-body text-xs font-bold text-plum">
          <span v-if="isIOS">iPhone &amp; iPad Setup</span>
          <span v-else-if="isAndroid">Android Setup</span>
          <span v-else-if="isMac && isSafari">Mac Safari Setup</span>
          <span v-else-if="isFirefox">Firefox Setup</span>
          <span v-else-if="isChrome">Chrome Setup</span>
          <span v-else>Browser Alert Setup</span>
        </p>
        <p class="font-body text-[11px] text-plum-muted mt-0.5 leading-normal">
          To get instant sound &amp; vibration alerts when it's your turn:
        </p>
        <ul class="mt-2.5 space-y-2 font-body text-[11px] text-plum-soft">
          <!-- iOS Safari -->
          <template v-if="isIOS">
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">1.</span>
              <span>
                Tap Safari's <strong class="text-plum font-semibold">Share</strong> button
                <Share class="inline h-3 w-3 align-text-bottom mx-0.5 text-plum" /> and choose
                <strong class="text-plum font-semibold">Add to Home Screen</strong>.
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">2.</span>
              <span>
                Launch the app from your Home Screen to activate the
                <strong class="text-plum font-semibold">Buzz</strong> notification.
              </span>
            </li>
          </template>

          <!-- Android Chrome -->
          <template v-else-if="isAndroid">
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">1.</span>
              <span>
                Tap Chrome's menu and select
                <strong class="text-plum font-semibold">Install app</strong> or
                <strong class="text-plum font-semibold">Add to Home screen</strong>.
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">2.</span>
              <span>
                Ensure notifications are allowed when prompted to enable the
                <strong class="text-plum font-semibold">Buzz</strong> feature.
              </span>
            </li>
          </template>

          <!-- Mac Safari -->
          <template v-else-if="isMac && isSafari">
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">1.</span>
              <span>
                Go to <strong class="text-plum font-semibold">File</strong> &gt;
                <strong class="text-plum font-semibold">Add to Dock</strong> in Safari's menu.
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">2.</span>
              <span>
                Choose <strong class="text-plum font-semibold">Safari</strong> &gt;
                <strong class="text-plum font-semibold">Settings for This Website</strong> and set
                notifications to <strong class="text-plum font-semibold">Allow</strong>.
              </span>
            </li>
          </template>

          <!-- Firefox -->
          <template v-else-if="isFirefox">
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">1.</span>
              <span>
                Click the <strong class="text-plum font-semibold">Lock 🔒</strong> or site settings
                icon next to the URL in the address bar.
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">2.</span>
              <span>
                Under Permissions, change
                <strong class="text-plum font-semibold">Send Notifications</strong> to
                <strong class="text-plum font-semibold">Allow</strong>.
              </span>
            </li>
          </template>

          <!-- Desktop Chrome / Chromium -->
          <template v-else-if="isChrome">
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">1.</span>
              <span>
                Click the <strong class="text-plum font-semibold">Install icon</strong> in the
                address bar to install the app.
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">2.</span>
              <span>
                Click the <strong class="text-plum font-semibold">Lock 🔒</strong> icon next to the
                URL and allow notifications.
              </span>
            </li>
          </template>

          <!-- Generic Fallback -->
          <template v-else>
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">1.</span>
              <span>
                Click the <strong class="text-plum font-semibold">Lock 🔒</strong> or settings icon
                next to the URL in your browser's address bar.
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold text-plum shrink-0">2.</span>
              <span>
                Find <strong class="text-plum font-semibold">Notifications</strong> and select
                <strong class="text-plum font-semibold">Allow</strong>.
              </span>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
