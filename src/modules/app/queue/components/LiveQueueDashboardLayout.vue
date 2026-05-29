<script setup lang="ts">
/**
 * @component LiveQueueDashboardLayout
 * @description Shared layout for the live queue dashboard.
 * Uses useLiveQueue composable directly for state and actions.
 */
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
  onBeforeMount,
} from 'vue'
import { useRouter } from 'vue-router'

import { fetchCurrentPlan } from '@/modules/app/billing/actions/billing.actions'
import type { BillingPlan } from '@/modules/app/billing/actions/billing.actions'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import LiveSyncLoader from '@/modules/app/queue/components/LiveSyncLoader.vue'
import LiveSyncStatus from '@/modules/app/queue/components/LiveSyncStatus.vue'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import { useAuthStore } from '@/stores/auth.store'

// Critical path — renders immediately

defineProps<{
  showToastLayer?: boolean
  showNotifications?: boolean
}>()

const emit = defineEmits<{
  (
    e: 'status-confirmed',
    payload: { mode: 'pause' | 'resume' | 'terminate'; success: boolean },
  ): void
}>()

const QueueStatCards = defineAsyncComponent(
  () => import('@/modules/app/queue/components/QueueStatCards.vue'),
)
const ShareCodeCard = defineAsyncComponent(
  () => import('@/modules/app/queue/components/ShareCodeCard.vue'),
)
const QueueActionCard = defineAsyncComponent(
  () => import('@/modules/app/queue/components/QueueActionCard.vue'),
)
const SessionNotesCard = defineAsyncComponent(
  () => import('@/modules/app/queue/components/SessionNotesCard.vue'),
)
const FloatingConnectionBadge = defineAsyncComponent(
  () => import('@/modules/app/queue/components/FloatingConnectionBadge.vue'),
)
const PremiumUpgradeModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/PremiumUpgradeModal.vue'),
)
const PremiumLimitBanner = defineAsyncComponent(
  () => import('@/modules/app/queue/components/PremiumLimitBanner.vue'),
)
const PremiumExpiryBanner = defineAsyncComponent(
  () => import('@/modules/app/queue/components/PremiumExpiryBanner.vue'),
)

const {
  activeQueue,
  isPaused,
  waitingCount,
  avgWaitTime,
  isLoading,
  queueUrl,
  error,
  isStreamConnected,
  streamState,
  pingMs,

  // UI state
  showAddGuestModal,
  showStatusUpdateModal,
  statusUpdateMode,
  showInfoModal,
  showSettingsModal,

  // Data
  rawSearchQuery,
  filteredActiveEntries,
  filteredServedEntries,
  servedTodayCount,
  completionRatePercent,
  chartLabels,
  chartBars,
  trend,
  viewType,

  // Actions
  handleSearchUpdate,
  handleAddGuestSubmit,
  handleCallNext,
  handleCallGuest,
  handleServeGuest,
  handleStatusUpdateConfirm,
  handleUpdateSettings,
  handleUpdateNotes,
  isNotesSaving,
  isRefreshing,
} = useLiveQueue()

// Async Modals
const QueueStatusUpdateModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/QueueStatusUpdateModal.vue'),
)
const InfoQueueModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/InfoQueueModal.vue'),
)
const AddGuestModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/AddGuestModal.vue'),
)
const LiveQueueSettings = defineAsyncComponent(
  () => import('@/modules/app/queue/components/LiveQueueSettings.vue'),
)
const DisableStrictModeModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/DisableStrictModeModal.vue'),
)
const LiveQueueQuickSetup = defineAsyncComponent(
  () => import('@/modules/app/queue/components/LiveQueueQuickSetup.vue'),
)
const QueueAnalysisCard = defineAsyncComponent(
  () => import('@/modules/app/queue/components/QueueAnalysisCard.vue'),
)
const HostNotifications = defineAsyncComponent(
  () => import('@/components/layout/HostNotifications.vue'),
)
const showNotes = ref(false)

async function onStatusConfirm() {
  const mode = statusUpdateMode.value
  const success = await handleStatusUpdateConfirm()
  emit('status-confirmed', { mode, success })
}

function openStatusModal(mode: 'pause' | 'resume' | 'terminate') {
  statusUpdateMode.value = mode
  showStatusUpdateModal.value = true
}

const showDisableStrictModal = ref(false)

async function confirmDisableStrictMode() {
  await handleUpdateSettings({ strictQueueMode: false })
}

const authStore = useAuthStore()
const router = useRouter()

const timeToExpiry = ref(0)
let expiryTimer: ReturnType<typeof setInterval> | null = null

function checkExpiry() {
  if (!activeQueue.value?.expiresAt) {
    timeToExpiry.value = 0
    return
  }
  const expiry = new Date(activeQueue.value.expiresAt).getTime()
  const now = Date.now()
  timeToExpiry.value = expiry - now
}

onMounted(() => {
  checkExpiry()
  expiryTimer = setInterval(checkExpiry, 1000)
})

onUnmounted(() => {
  if (expiryTimer) clearInterval(expiryTimer)
})

watch(
  () => activeQueue.value?.expiresAt,
  () => {
    checkExpiry()
  },
)

const isSessionExpired = computed(() => {
  if (authStore.isPremium) return false
  if (!activeQueue.value?.expiresAt) return false
  return timeToExpiry.value <= 0
})

const isSessionExpiringSoon = computed(() => {
  if (authStore.isPremium) return false
  if (!activeQueue.value?.expiresAt) return false
  return timeToExpiry.value > 0 && timeToExpiry.value < 15 * 60 * 1000
})

const expiryTimeLeftStr = computed(() => {
  if (timeToExpiry.value <= 0) return 'Expired'
  const minutes = Math.floor(timeToExpiry.value / 60000)
  const seconds = Math.floor((timeToExpiry.value % 60000) / 1000)
  return `${minutes}m ${seconds}s`
})

const currentPlan = ref<BillingPlan | null>(null)

onBeforeMount(async () => {
  try {
    currentPlan.value = await fetchCurrentPlan()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch plan:', e)
  }
})

const maxGuests = computed(() => {
  if (!currentPlan.value) return 25
  const max = currentPlan.value.limits?.maxGuestsPerQueue
  if (typeof max === 'number') {
    return max
  }
  return 25
})

const showLimitBanner = computed(() => {
  if (authStore.isPremium) return false
  if (maxGuests.value <= 0) return false
  return waitingCount.value >= maxGuests.value - 5 && !isSessionExpired.value
})

const isLimitReached = computed(() => {
  if (authStore.isPremium) return false
  if (maxGuests.value <= 0) return false
  return waitingCount.value >= maxGuests.value
})

const showUpgradeModal = ref(false)

function openUpgradeModal() {
  showUpgradeModal.value = true
}

function openLoginModal() {
  router.push({ name: 'login', query: { claim_queue_id: activeQueue.value?.id } })
}

function openLiveScreen() {
  if (!activeQueue.value) return
  const url = router.resolve({
    name: 'customer-queue-status',
    params: { queueId: activeQueue.value.slug || activeQueue.value.id },
  }).href
  window.open(url, '_blank')
}
</script>

<template>
  <HostNotifications v-if="showToastLayer && showNotifications" />

  <LiveSyncLoader :is-loading="isLoading" :has-queue="!!activeQueue" :error="error">
    <div
      class="flex flex-col gap-2 transition-opacity duration-300"
      :class="{ 'opacity-60 pointer-events-none': isRefreshing }"
    >
      <!-- Content Header (Slot for custom titles/slugs) -->
      <header v-if="activeQueue" class="py-2 flex flex-col gap-4">
        <LiveSyncStatus
          :queue-name="activeQueue?.name"
          :is-stream-connected="isStreamConnected"
          :stream-state="streamState"
          :ping-ms="pingMs"
          :strict-mode="activeQueue?.strictQueueMode"
          :show-notifications="showNotifications"
        />

        <!-- Premium Expiry Banner -->
        <transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <PremiumExpiryBanner
            v-if="(isSessionExpired || isSessionExpiringSoon) && !showLimitBanner"
            :is-expired="isSessionExpired"
            :time-left-str="expiryTimeLeftStr"
            :is-authenticated="authStore.isAuthenticated"
            @upgrade="openUpgradeModal"
            @login="openLoginModal"
          />
        </transition>

        <!-- Premium Limit Banner -->
        <transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <PremiumLimitBanner
            v-if="showLimitBanner"
            :is-limit-reached="isLimitReached"
            :waiting-count="waitingCount"
            :is-authenticated="authStore.isAuthenticated"
            :max-guests="maxGuests"
            @upgrade="openUpgradeModal"
            @login="openLoginModal"
          />
        </transition>
      </header>

      <!-- Main Responsive Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <!-- Left Column: Statistics & Live List -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <QueueStatCards :waiting-count="waitingCount" :avg-wait-time="avgWaitTime" />

          <LiveQueueCard
            :active-entries="filteredActiveEntries"
            :served-entries="filteredServedEntries"
            :search-query="rawSearchQuery"
            :is-paused="isPaused"
            :is-loading="isLoading"
            :is-refreshing="isRefreshing"
            :strict-queue-mode="activeQueue?.strictQueueMode"
            :manual-positioning="activeQueue?.manualPositioning"
            :avg-service-mins="activeQueue?.avgServiceMins || 2"
            :show-party-size="activeQueue?.allowPartyJoining"
            @call-next="handleCallNext"
            @search="handleSearchUpdate"
            @call-guest="handleCallGuest"
            @serve-guest="handleServeGuest"
            @disable-strict-mode="showDisableStrictModal = true"
          />
        </div>

        <!-- Right Column: Share & Insights -->
        <div class="lg:col-span-8 flex flex-col gap-6">
          <div v-if="activeQueue" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ShareCodeCard
              :join-code="activeQueue?.joinCode"
              :share-url="queueUrl"
              :expires-at="activeQueue?.expiresAt"
              @show-qr="showInfoModal = true"
            />

            <div class="relative">
              <QueueActionCard
                :is-paused="isPaused"
                :manual-positioning="activeQueue?.manualPositioning"
                @add-guest="
                  isLimitReached || isSessionExpired || isSessionExpiringSoon
                    ? (showUpgradeModal = true)
                    : (showAddGuestModal = true)
                "
                @update-status="openStatusModal"
                @open-settings="showSettingsModal = true"
                @toggle-notes="showNotes = !showNotes"
                @open-live-screen="openLiveScreen"
              />

              <SessionNotesCard
                v-if="showNotes"
                class="z-50"
                :initial-notes="activeQueue?.notes"
                :is-saving="isNotesSaving"
                @update="handleUpdateNotes"
                @close="showNotes = false"
              />
            </div>
          </div>

          <QueueAnalysisCard
            v-model:view-type="viewType"
            :served-today="servedTodayCount"
            :trend-text="trend.text"
            :trend-direction="trend.direction"
            :completion-rate="completionRatePercent"
            :chart-labels="chartLabels"
            :chart-bars="chartBars"
            :created-at="activeQueue?.createdAt"
            :expires-at="activeQueue?.expiresAt"
          />
        </div>
      </div>

      <slot name="footer" />
    </div>

    <QueueStatusUpdateModal
      :is-open="showStatusUpdateModal"
      :mode="statusUpdateMode"
      :still-waiting-count="waitingCount"
      @confirm="onStatusConfirm"
      @close="showStatusUpdateModal = false"
    />

    <InfoQueueModal
      v-if="activeQueue"
      :is-open="showInfoModal"
      :join-code="activeQueue?.joinCode"
      :queue-url="queueUrl"
      :queue-name="activeQueue?.name"
      :slug="activeQueue?.slug"
      @close="showInfoModal = false"
    />

    <AddGuestModal
      :is-open="showAddGuestModal"
      @close="showAddGuestModal = false"
      @submit="handleAddGuestSubmit"
    />

    <LiveQueueSettings
      v-if="activeQueue"
      :is-open="showSettingsModal"
      :queue="activeQueue"
      :manual-positioning="activeQueue?.manualPositioning"
      @close="showSettingsModal = false"
      @submit="handleUpdateSettings"
    />

    <LiveQueueQuickSetup />

    <DisableStrictModeModal
      v-if="!activeQueue?.manualPositioning"
      :is-open="showDisableStrictModal"
      @close="showDisableStrictModal = false"
      @confirm="confirmDisableStrictMode"
    />

    <FloatingConnectionBadge :stream-state="streamState" :ping-ms="pingMs" />

    <PremiumUpgradeModal
      :is-open="showUpgradeModal"
      :is-limit-reached="isLimitReached"
      :queue-id="activeQueue?.id"
      @close="showUpgradeModal = false"
    />
  </LiveSyncLoader>
</template>
