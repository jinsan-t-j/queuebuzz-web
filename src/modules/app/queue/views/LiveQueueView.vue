<script setup lang="ts">
/**
 * @view LiveQueueView
 * @description Authenticated host active queue dashboard.
 * Managed via useLiveQueue and useQueueStore.
 */
import { useRouter } from 'vue-router'
import { onBeforeMount, defineAsyncComponent } from 'vue'

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import QueueActionCard from '@/modules/app/queue/components/QueueActionCard.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

// Modals: only loaded on user action
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
const HostTips = defineAsyncComponent(() => import('@/modules/app/queue/components/HostTips.vue'))
import EnableNotificationsBanner from '@/components/base/EnableNotificationsBanner.vue'

const router = useRouter()
const {
  activeQueue,
  isPaused,
  waitingCount,
  avgWaitTime,
  isLoading,
  queueUrl,

  showAddGuestModal,
  showStatusUpdateModal,
  statusUpdateMode,
  showInfoModal,
  showSettingsModal,

  rawSearchQuery,
  filteredActiveEntries,
  filteredServedEntries,

  servedTodayCount,
  completionRatePercent,
  chartLabels,
  chartBars,
  trend,

  handleSearchUpdate,
  handleAddGuestSubmit,
  handleCallNext,
  handleCallGuest,
  handleServeGuest,
  handleStatusUpdateConfirm,
  handleUpdateSettings,
  initializeHostQueue,
} = useLiveQueue()

onBeforeMount(async () => {
  if (!activeQueue.value) {
    const queue = await initializeHostQueue()
    if (!queue) {
      router.push({ name: 'dashboard' })
    }
  }
})

async function onStatusUpdateConfirmed() {
  const isTerminate = statusUpdateMode.value === 'terminate'
  const success = await handleStatusUpdateConfirm()
  if (success && isTerminate) {
    router.push({ name: 'dashboard' })
  }
}

function openStatusModal(mode: 'pause' | 'resume' | 'terminate') {
  statusUpdateMode.value = mode
  showStatusUpdateModal.value = true
}
</script>

<template>
  <div class="relative min-h-screen bg-sand px-6 py-8">
    <div class="mx-auto max-w-[1200px]">
      <!-- Header Area -->
      <header class="mb-8 flex items-end justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="font-display text-4xl font-bold text-plum">
              {{ activeQueue?.name || 'Active Queue' }}
            </h1>
            <BaseBadge
              v-if="activeQueue?.strictQueueMode"
              variant="muted"
              class="bg-plum text-sand"
            >
              STRICT MODE ACTIVE
            </BaseBadge>
          </div>
          <p class="mt-1 font-body text-plum/60">
            Running since
            {{
              activeQueue?.createdAt
                ? new Date(activeQueue.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'
            }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-body text-sm font-bold text-plum shadow-sm border border-plum/5 hover:bg-plum/5 transition-colors cursor-pointer"
            @click="showInfoModal = true"
          >
            <span class="text-mint">#</span>
            Join Info
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <!-- Left Column: Statistics & Live List -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <QueueStatCards :waiting-count="waitingCount" :avg-wait="avgWaitTime" />

          <LiveQueueCard
            :active-entries="filteredActiveEntries"
            :served-entries="filteredServedEntries"
            :search-query="rawSearchQuery"
            :is-paused="isPaused"
            :is-loading="isLoading"
            :strict-queue-mode="activeQueue?.strictQueueMode"
            :avg-service-mins="activeQueue?.avgServiceMins"
            :show-party-size="activeQueue?.allowPartyJoining"
            @call-next="handleCallNext"
            @search="handleSearchUpdate"
            @call-guest="handleCallGuest"
            @serve-guest="handleServeGuest"
          />
        </div>

        <!-- Right Column: Share & Insights -->
        <div class="lg:col-span-8 flex flex-col gap-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ShareCodeCard
              :join-code="activeQueue?.joinCode"
              :share-url="queueUrl"
              @show-qr="showInfoModal = true"
            />

            <QueueActionCard
              :is-paused="isPaused"
              @add-guest="showAddGuestModal = true"
              @update-status="openStatusModal"
              @open-settings="showSettingsModal = true"
            />
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
    </div>

    <!-- Modals -->
    <QueueStatusUpdateModal
      :is-open="showStatusUpdateModal"
      :mode="statusUpdateMode"
      :still-waiting-count="waitingCount"
      @confirm="onStatusUpdateConfirmed"
      @close="showStatusUpdateModal = false"
    />

    <InfoQueueModal
      :is-open="showInfoModal"
      :join-code="activeQueue?.joinCode ?? ''"
      :queue-url="queueUrl"
      :queue-name="activeQueue?.name ?? ''"
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
      @close="showSettingsModal = false"
      @submit="handleUpdateSettings"
    />

    <HostTips />
    <EnableNotificationsBanner />
  </div>
</template>
