<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  computed,
  defineAsyncComponent,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import SettingsIcon from '@/assets/icons/nav-settings.svg?component'
import BaseCard from '@/components/base/BaseCard.vue'
import { useBackgroundKeepAlive } from '@/composables/useBackgroundKeepAlive'
import { useLeaveGuard } from '@/composables/useLeaveGuard'
import { useToast } from '@/composables/useToast'
import { useWakeLock } from '@/composables/useWakeLock'
import { getRecoveryToken } from '@/modules/customer/actions/customer.action'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'
import CustomerSettingsModal from '@/modules/customer/components/CustomerSettingsModal.vue'
import HeadsUpBanner from '@/modules/customer/components/HeadsUpBanner.vue'
import PWABanner from '@/modules/customer/components/PWABanner.vue'
import TicketCaptureTemplate from '@/modules/customer/components/TicketCaptureTemplate.vue'
import TicketHero from '@/modules/customer/components/TicketHero.vue'
import TicketSaveBar from '@/modules/customer/components/TicketSaveBar.vue'
import WaitingAdUnit from '@/modules/customer/components/WaitingAdUnit.vue'
import WaitingProgress from '@/modules/customer/components/WaitingProgress.vue'
import WaitingStats from '@/modules/customer/components/WaitingStats.vue'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useQueueStore } from '@/stores/queue.store'

import { useCustomer } from '../composables/useCustomer'

const NotificationBanner = defineAsyncComponent(
  () => import('../components/NotificationBanner.vue'),
)

const router = useRouter()
const { showToast } = useToast()
const customerStore = useCustomerStore()

const isNavigatingAway = ref(false)

useLeaveGuard('Are you sure you want to leave this page?', () => !isNavigatingAway.value)

const {
  entry,
  isLoading,
  position,
  ahead,
  estWaitMin,
  status,
  isJoined,
  isSaving,
  isSaved,
  saveTicketAsImage,
  leaveQueue: baseLeaveQueue,
  fetchEntry,
  connectEvents,
  disconnectEvents,
  redirectForStatus,
} = useCustomer()

async function handleLeaveQueue() {
  isNavigatingAway.value = true
  const success = await baseLeaveQueue()
  if (!success) {
    isNavigatingAway.value = false
  }
}
const queueStore = useQueueStore()
const { activeQueue } = storeToRefs(queueStore)

const isSettingsModalOpen = ref(false)
const showEmailHighlight = ref(false)
const queueName = computed(() => activeQueue.value?.name || '')

const notificationPermission = ref<'default' | 'granted' | 'denied' | 'unsupported'>(
  typeof Notification === 'undefined'
    ? 'unsupported'
    : (Notification.permission as 'default' | 'granted' | 'denied'),
)
const isIOS = ref(false)
const isMac = ref(false)
const isAndroid = ref(false)
const isSafari = ref(false)
const isFirefox = ref(false)
const isChrome = ref(false)

const updatePermission = () => {
  if (typeof Notification === 'undefined') {
    notificationPermission.value = 'unsupported'
  } else {
    notificationPermission.value = Notification.permission as 'default' | 'granted' | 'denied'
  }
}

async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission as 'default' | 'granted' | 'denied'
    if (permission === 'granted') {
      showToast('Notifications enabled successfully!', { type: 'success' })
      await customerStore.syncPushToken()
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error requesting notification permission:', err)
  }
}

const formattedJoinDate = computed(() => {
  if (!entry.value?.createdAt) return ''
  try {
    return new Date(entry.value.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
})

// Keep screen awake and tab alive in background for real-time alerts
useWakeLock()
useBackgroundKeepAlive()

onMounted(() => {
  const ua = globalThis.navigator?.userAgent || ''
  const isAppleMobile =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && globalThis.navigator?.maxTouchPoints > 1)
  const isMacOs = /Macintosh|Mac OS X/.test(ua) && !isAppleMobile
  const isAndroidOs = /Android/i.test(ua)
  const isSafariBrowser = /Safari/.test(ua) && !/Chrome|CriOS|Android/.test(ua)
  const isFirefoxBrowser = /Firefox|FxiOS/.test(ua)
  const isChromeBrowser = /Chrome|CriOS/.test(ua)

  isIOS.value = isAppleMobile
  isMac.value = isMacOs
  isAndroid.value = isAndroidOs
  isSafari.value = isSafariBrowser
  isFirefox.value = isFirefoxBrowser
  isChrome.value = isChromeBrowser

  updatePermission()

  if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
    try {
      navigator.permissions.query({ name: 'notifications' }).then((status) => {
        status.onchange = () => {
          updatePermission()
          if (notificationPermission.value === 'granted') {
            customerStore.syncPushToken()
          }
        }
      })
    } catch {
      // Ignore unsupported browsers
    }
  }

  setTimeout(() => {
    if (entry.value && !entry.value.email) {
      showEmailHighlight.value = true
    }
  }, 1000)
})

watch(isSettingsModalOpen, (isOpen) => {
  if (isOpen) showEmailHighlight.value = false
})

async function handleShareCode() {
  if (!entry.value) return
  const token = await getRecoveryToken(true) // Get a stateless token
  const queueId = router.currentRoute.value.params.queueId as string
  const origin = globalThis.location.origin
  const shareUrl = token
    ? `${origin}/q/${queueId}/recover?token=${encodeURIComponent(token)}`
    : `${origin}/q/${queueId}` // fallback to join if token fails

  const data = {
    title: 'Join my queue on QueueBuzz',
    text: `I'm waiting at ${queueName.value}. My ticket is #${entry.value.ticketNo}.`,
    url: shareUrl,
  }
  if (navigator.share) {
    navigator.share(data).catch(() => {})
  } else {
    navigator.clipboard.writeText(data.url)
    showToast('Recovery link copied to clipboard!', { type: 'success' })
  }
}

watch(
  () => status.value,
  (s) => {
    if (s && s !== 'WAITING') {
      isNavigatingAway.value = true
      redirectForStatus(s)
    }
  },
  { immediate: true },
)

// Safety net: if entry is cleared externally (queue ended, session invalidated),
// redirect to the ended view so the customer isn't stuck on a stale screen.
watch(
  () => entry.value,
  (current, previous) => {
    if (previous && !current) {
      isNavigatingAway.value = true
      router.replace({
        name: 'customer-ended',
        params: router.currentRoute.value.params,
        query: { reason: 'terminated' },
      })
    }
  },
)

onBeforeMount(async () => {
  // Always fetch entry to validate active session on mount
  await fetchEntry()

  if (!isJoined.value || !entry.value) {
    sessionStorage.setItem('qb_toast', 'You are not joined to any queue')
    showToast('You are not joined to any queue', { type: 'error' })
    isNavigatingAway.value = true
    router.replace('/')
    return
  }

  // 3. Ensure queue context is available for estWaitMin calculation
  const queueId = router.currentRoute.value.params.queueId as string
  let queueValid = false
  if (queueId) {
    queueValid = await queueStore.IntializeQueueByIdOrCode(queueId)
  }

  if (!queueValid || !queueStore.activeQueue) {
    sessionStorage.setItem('qb_toast', 'This queue is no longer available')
    showToast('This queue is no longer available', { type: 'error' })
    isNavigatingAway.value = true
    router.replace('/')
    return
  }

  // Check if the ticket belongs to the loaded queue
  if (entry.value.queueId !== queueStore.activeQueue.id) {
    let routeName = 'customer-waiting'
    if (status.value === 'CALLED' || status.value === 'ARRIVED') {
      routeName = 'customer-called'
    } else if (status.value === 'IDLE') {
      routeName = 'customer-idle'
    } else if (status.value === 'SERVED') {
      routeName = 'customer-served'
    }

    isNavigatingAway.value = true
    router.replace({ name: routeName, params: { queueId: entry.value.queueId } })
    return
  }

  // Validate current status onload: must be WAITING
  if (status.value && status.value !== 'WAITING') {
    isNavigatingAway.value = true
    redirectForStatus(status.value)
    return
  }

  // 4. Ensure SSE stream is active
  if (entry.value?.id) {
    connectEvents(entry.value.id)
  }
})

onUnmounted(() => {
  disconnectEvents()
})
</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <CustomerHeader
      v-if="activeQueue"
      :name="activeQueue.name"
      :profile-url="activeQueue.hostProfileImageUrl"
      :banner-url="activeQueue.hostBannerImageUrl"
    />
    <div
      v-else
      class="flex items-center justify-center gap-2 px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum transition-all duration-300"
    >
      <span>{{ queueName }}</span>
      <!-- Live Beep Status Indicator -->
      <span class="relative flex h-2.5 w-2.5 shrink-0" title="Live status active">
        <span
          class="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75"
        />
        <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
      </span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading && !entry" class="flex flex-col gap-4 px-5 py-4">
      <div class="h-40 animate-pulse rounded-3xl bg-plum-faint" />
      <div class="flex gap-2.5">
        <div
          v-for="i in 3"
          :key="i"
          class="h-24 flex-1 animate-pulse rounded-[18px] bg-plum-faint"
        />
      </div>
      <div class="h-4 animate-pulse rounded-full bg-plum-faint" />
    </div>

    <!-- Populated state -->
    <div v-else-if="entry" class="flex flex-col gap-5 px-5 py-4 animate-in fade-in duration-500">
      <PWABanner />

      <!-- Heads-up / almost up notification banner -->
      <HeadsUpBanner :position="position" />

      <!-- Notification Reminder Banner -->
      <NotificationBanner
        :notification-permission="notificationPermission"
        :is-i-o-s="isIOS"
        :is-mac="isMac"
        :is-android="isAndroid"
        :is-safari="isSafari"
        :is-firefox="isFirefox"
        :is-chrome="isChrome"
        @request-permission="requestNotificationPermission"
      />

      <div ref="ticketRef" class="relative">
        <!-- Blob decorations behind ticket & stats -->
        <div
          class="pointer-events-none absolute -right-10 -top-10 h-[250px] w-[250px] rounded-full bg-mint-light blur-[40px] z-0"
        />
        <div
          class="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-[320px] w-[320px] rounded-full bg-warning/45 blur-[70px] z-0"
        />

        <div class="relative z-10 flex flex-col gap-5 p-1">
          <TicketHero
            :ticket-number="String(entry.ticketNo)"
            :queue-name="queueName"
            :show-leave-button="true"
            @leave-queue="handleLeaveQueue"
            @save-ticket="saveTicketAsImage"
          />

          <WaitingStats
            :position="position"
            :ahead="ahead"
            :est-wait-min="estWaitMin"
            :manual-positioning="activeQueue?.manualPositioning"
          />
        </div>
      </div>

      <WaitingProgress
        :position="position"
        :permission-granted="notificationPermission === 'granted'"
      />

      <WaitingAdUnit :est-wait-min="estWaitMin" />

      <!-- Entry Settings Section -->
      <BaseCard
        :class="[
          'p-6 border-dashed transition-all duration-700',
          showEmailHighlight
            ? 'border-mint bg-mint-light/30 ring-2 ring-mint ring-offset-sand scale-[1.02] shadow-[0_0_20px_rgba(0,229,160,0.25)]'
            : 'border-plum-faint bg-white/50',
        ]"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-0.5">
              <h3 class="font-display text-base font-bold text-plum">Settings</h3>
              <span
                v-if="showEmailHighlight"
                class="animate-pulse rounded-full bg-mint px-2 py-0.5 font-body text-sm font-bold text-on-mint"
              >
                Recommended
              </span>
            </div>
            <p class="font-body text-sm text-plum-muted/80">
              Update details or add a recovery email to keep your spot.
            </p>
          </div>
          <button
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-plum-faint bg-white text-plum shadow-sm hover:border-plum transition-colors relative"
            @click="isSettingsModalOpen = true"
          >
            <SettingsIcon class="h-5 w-5" />
            <span v-if="showEmailHighlight" class="absolute -right-1 -top-1 flex h-3 w-3">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75"
              />
              <span class="relative inline-flex h-3 w-3 rounded-full bg-mint" />
            </span>
          </button>
        </div>
      </BaseCard>

      <TicketSaveBar
        :ticket-number="String(entry.ticketNo)"
        :share-code="String(entry.ticketNo)"
        :is-saving="isSaving"
        :is-saved="isSaved"
        @share-code="handleShareCode"
        @save="saveTicketAsImage"
      />

      <!-- Premium Ticket Template for Capture (Off-screen) -->
      <TicketCaptureTemplate
        :ticket-number="String(entry.ticketNo)"
        :queue-name="queueName"
        :join-date="formattedJoinDate"
      />

      <CustomerSettingsModal v-model:is-open="isSettingsModalOpen" />
    </div>
  </div>
</template>
