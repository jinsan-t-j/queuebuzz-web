<script setup lang="ts">
/**
 * @component GuestHostLiveQueueView
 * @description Anonymous (guest) host active queue dashboard.
 */
import { onBeforeMount, watch, computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import QueueStatusUpdateModal from '@/modules/app/queue/components/QueueStatusUpdateModal.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import AddGuestModal from '@/modules/app/queue/components/AddGuestModal.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import QueueActionCard from '@/modules/app/queue/components/QueueActionCard.vue'
import LiveQueueSettingsModal from '@/modules/app/queue/components/LiveQueueSettingsModal.vue'
import EmailNoticePopup from '@/modules/app/queue/components/EmailNoticePopup.vue'

const router = useRouter()
const route = useRoute()

const {
  activeQueue,
  isPaused,
  waitingCount,
  avgWaitTime,
  isLoading: isApiLoading,
  queueUrl,

  showAddGuestModal,
  showStatusUpdateModal,
  statusUpdateMode,
  showInfoModal,
  showSettingsModal,
  
  rawSearchQuery,
  filteredEntries,
  
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
  initializeQueueById,
} = useLiveQueue()

const isRecoveryEmailMissing = computed(() => !activeQueue.value?.recoveryEmail)
const isNoticeVisible = ref(false)
const storageKey = 'queuebuzz_hide_email_notice'
let noticeInterval: ReturnType<typeof setInterval> | null = null

function checkAndShowNotice() {
  const isHiddenPermanently = localStorage.getItem(storageKey) === 'true'
  if (isRecoveryEmailMissing.value && !isHiddenPermanently) {
    isNoticeVisible.value = true
  } else {
    isNoticeVisible.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    checkAndShowNotice()
  }, 1000)
  
  noticeInterval = setInterval(() => {
    checkAndShowNotice()
  }, 15 * 60 * 1000)
})

onUnmounted(() => {
  if (noticeInterval) clearInterval(noticeInterval)
})

function handleNoticeClose(doNotShowAgain: boolean) {
  isNoticeVisible.value = false
  if (doNotShowAgain) {
    localStorage.setItem(storageKey, 'true')
  }
}

async function handleNoticeSubmit(email: string) {
  await handleUpdateSettings({
    recoveryEmail: email
  })
  isNoticeVisible.value = false
}

const queueId = route.params.id as string
let hasInitialized = false

onBeforeMount(async () => {
  if (!activeQueue.value?.id || activeQueue.value.id !== queueId) {
    await initializeQueueById(queueId)
    hasInitialized = true
    if (!activeQueue.value) {
      // TODO: The queue might be terminated or not found. We should redirect to the appropriate page.
      router.push({ name: 'guest-host-queue-ended', query: { reason: 'terminated' } })
    }
  }
})

watch(activeQueue, (queue) => {
  if (hasInitialized && !queue) {
    router.push({ name: 'guest-host-queue-ended', query: { reason: 'terminated' } })
  }
})

async function onStatusUpdateConfirmed() {
  const isTerminate = statusUpdateMode.value === 'terminate'
  const success = await handleStatusUpdateConfirm()
  if (success && isTerminate) {
    router.push({ name: 'guest-host-complete' })
  }
}

function openStatusModal(mode: 'pause' | 'resume' | 'terminate') {
    statusUpdateMode.value = mode
    showStatusUpdateModal.value = true
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <div class="relative z-10 mx-auto max-w-[1280px] px-6 py-4">
      <!-- Loading State -->
      <div v-if="isApiLoading && !activeQueue" class="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div class="h-16 w-16 rounded-full border-4 border-plum-faint border-t-mint animate-spin" />
        <p class="font-display text-xl font-bold text-plum/60">Loading your live queue...</p>
      </div>

      <div v-else-if="activeQueue" class="flex gap-8">
        <!-- Left column -->
        <div class="flex w-[381px] shrink-0 flex-col gap-6">
          <QueueStatCards
            :waiting-count="waitingCount"
            :avg-wait="avgWaitTime"
          />

          <LiveQueueCard
            :entries="filteredEntries"
            :search-query="rawSearchQuery"
            :is-paused="isPaused"
            @call-next="handleCallNext"
            @search="handleSearchUpdate($event)"
            @call-guest="handleCallGuest"
            @serve-guest="handleServeGuest"
          />
        </div>

        <!-- Right column -->
        <div class="flex flex-1 flex-col gap-8">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ShareCodeCard
              :join-code="activeQueue?.joinCode ?? ''"
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

    <!-- Footer nudge -->
    <div class="relative z-10 py-6 text-center">
      <p class="font-body text-sm text-[#6b7280]">
        Want to manage with a dashboard?
        <router-link
          to="/login"
          class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
        >
          Create a free account
        </router-link>
      </p>
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
      v-if="activeQueue"
      :is-open="showInfoModal"
      :join-code="activeQueue.joinCode"
      :queue-url="queueUrl"
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

    <!-- Floating recovery email notice -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-4 opacity-0 scale-95"
    >
      <EmailNoticePopup
        v-if="isNoticeVisible"
        :is-loading="isApiLoading"
        @submit="handleNoticeSubmit"
        @close="handleNoticeClose"
      />
    </Transition>
  </div>
</template>
