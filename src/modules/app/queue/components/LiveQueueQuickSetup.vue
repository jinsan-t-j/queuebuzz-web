<script setup lang="ts">
import { BellRingIcon, X as XIcon } from 'lucide-vue-next'
import { ref, onMounted, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

/**
 * @component LiveQueueQuickSetup
 * @description Simplified notification prompt to enable FCM push notifications on host dashboard.
 */

const { activeQueue, hasHostFcmToken, handleEnableNotifications, isFcmRegistering, error } =
  useLiveQueue()

const isNotifDismissed = ref(false)
const isTemporarilyHidden = ref(false)
const browserPermission = ref(
  typeof Notification === 'undefined' ? 'default' : Notification.permission,
)
const isNotifDenied = ref(false)

function updateBrowserPermission() {
  if (typeof Notification !== 'undefined') {
    browserPermission.value = Notification.permission
    isNotifDenied.value = Notification.permission === 'denied'
  }
}

onMounted(() => {
  updateBrowserPermission()

  globalThis.addEventListener('focus', updateBrowserPermission)

  if (globalThis.Notification && Notification.permission === 'denied') {
    isNotifDenied.value = true
  }
})

watch(activeQueue, () => {
  updateBrowserPermission()
})

async function handleEnableNotifs() {
  const queueId = activeQueue.value?.id
  if (!queueId) return

  isNotifDenied.value = false
  isTemporarilyHidden.value = true

  const success = await handleEnableNotifications(queueId)
  updateBrowserPermission()

  if (!success) {
    isTemporarilyHidden.value = false
  }
}

function dismissNudge() {
  isNotifDismissed.value = true
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-4 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-4 opacity-0 scale-95"
  >
    <div
      v-if="
        !isNotifDismissed &&
        !isTemporarilyHidden &&
        !(hasHostFcmToken && browserPermission === 'granted')
      "
      class="fixed bottom-18 right-6 z-50 max-w-[340px] w-full font-body"
    >
      <div
        class="relative w-full bg-white border border-plum-faint rounded-3xl p-5 shadow-[0_16px_48px_rgba(26,10,46,0.12)] overflow-hidden"
      >
        <!-- Dismiss Button -->
        <button
          class="absolute top-4 right-4 p-1.5 rounded-full text-plum-muted hover:text-danger hover:bg-sand transition-colors cursor-pointer"
          aria-label="Dismiss Notification Nudge"
          @click="dismissNudge"
        >
          <XIcon class="w-3.5 h-3.5" />
        </button>

        <div class="flex flex-col gap-4">
          <!-- Banner Header / Icon -->
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-2xl bg-mint-light flex items-center justify-center shrink-0"
            >
              <BellRingIcon
                class="w-5 h-5 text-plum animate-bounce"
                style="animation-duration: 3s"
              />
            </div>
            <div class="space-y-1">
              <h3 class="font-display font-bold text-sm text-plum">Never Miss a Guest</h3>
              <p class="text-xs text-plum-muted leading-relaxed">
                Get instant desktop alerts when customers join or update in your queue.
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="h-px bg-plum-faint" />

          <!-- Denied State Guide -->
          <div v-if="browserPermission === 'denied'" class="space-y-3">
            <div
              class="bg-sand rounded-2xl p-3 border border-plum-faint space-y-1.5 text-[11px] text-plum-soft"
            >
              <p class="font-bold text-danger flex items-center gap-1">
                <span>⚠️</span> Notifications Blocked
              </p>
              <p class="leading-relaxed">
                Please click the <span class="font-bold text-plum">lock icon</span> (🔒) next to the
                URL, reset notification permissions to "Allow", and try again.
              </p>
            </div>
            <BaseButton variant="ghost" class="w-full h-10 text-xs" @click="handleEnableNotifs">
              Try Again
            </BaseButton>
          </div>

          <!-- Default State / Enabling -->
          <div v-else class="space-y-3">
            <BaseButton
              variant="primary"
              class="w-full h-10 bg-mint text-plum hover:bg-mint/90 text-xs font-semibold flex items-center justify-center gap-2"
              :disabled="isFcmRegistering"
              @click="handleEnableNotifs"
            >
              <div
                v-if="isFcmRegistering"
                class="w-4 h-4 border-2 border-plum/30 border-t-plum rounded-full animate-spin"
              />
              <BellRingIcon v-else class="w-4 h-4" />
              <span>Enable Live Alerts</span>
            </BaseButton>
            <p v-if="error" class="font-body text-[10px] font-bold text-danger text-center px-1">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
