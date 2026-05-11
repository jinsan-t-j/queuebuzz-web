<script setup lang="ts">
/**
 * @component LiveQueueDashboardLayout
 * @description Shared layout for the live queue dashboard.
 * Uses useLiveQueue composable directly for state and actions.
 */
import { ref, defineAsyncComponent } from 'vue'

import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import LiveSyncLoader from '@/modules/app/queue/components/LiveSyncLoader.vue'
import LiveSyncStatus from '@/modules/app/queue/components/LiveSyncStatus.vue'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

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
const LiveQueueSettingsModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/LiveQueueSettingsModal.vue'),
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
  showDisableStrictModal.value = false
}

function handleToggleStrictMode() {
  if (activeQueue.value?.manualPositioning) return

  if (activeQueue.value?.strictQueueMode) {
    showDisableStrictModal.value = true
  } else {
    handleUpdateSettings({ strictQueueMode: true })
  }
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
      <header v-if="activeQueue" class="py-2">
        <LiveSyncStatus
          :queue-name="activeQueue?.name"
          :is-stream-connected="isStreamConnected"
          :stream-state="streamState"
          :ping-ms="pingMs"
          :strict-mode="activeQueue?.strictQueueMode"
          :show-notifications="showNotifications"
        />
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
              title="Queue URL"
              @show-qr="showInfoModal = true"
            />

            <div class="relative">
              <QueueActionCard
                :is-paused="isPaused"
                :strict-mode="activeQueue?.strictQueueMode"
                :manual-positioning="activeQueue?.manualPositioning"
                @add-guest="showAddGuestModal = true"
                @update-status="openStatusModal"
                @open-settings="showSettingsModal = true"
                @toggle-notes="showNotes = !showNotes"
                @toggle-strict-mode="handleToggleStrictMode"
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
            :served-today="servedTodayCount"
            :trend-text="trend.text"
            :trend-direction="trend.direction"
            :completion-rate="completionRatePercent"
            :chart-labels="chartLabels"
            :chart-bars="chartBars"
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

    <LiveQueueSettingsModal
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
  </LiveSyncLoader>
</template>
