<script setup lang="ts">
/**
 * @component GuestHostLiveQueueView
 * @description Anonymous (guest) host active queue dashboard.
 */
import { onBeforeMount, watch, computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQueueStore } from '@/stores/queue.store'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

import TimeIcon from '@/assets/icons/clock-time.svg?component'
import BrandingIcon from '@/assets/icons/branding-pro.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'

import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import TerminateQueueModal from '@/modules/app/queue/components/TerminateQueueModal.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import AddGuestModal from '@/modules/app/queue/components/AddGuestModal.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import LiveQueueSettingsModal from '@/modules/app/queue/components/LiveQueueSettingsModal.vue'
import EmailNoticePopup from '@/modules/app/queue/components/EmailNoticePopup.vue'
const router = useRouter()
const route = useRoute()
const store = useQueueStore()

const {
  activeQueue,
  isPaused,
  waitingCount,
  avgWaitTime,
  isLoading: isApiLoading,

  showAddGuestModal,
  showTerminateModal,
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
  handlePauseToggle,
  handleCallGuest,
  handleServeGuest,
  handleTerminateQueue,
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
  // Delay initial check by 1 second after component mount
  setTimeout(() => {
    checkAndShowNotice()
  }, 1000)
  
  // Set interval for every 15 minutes
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
  if (!store.activeQueue?.id || store.activeQueue.id !== queueId) {
    await initializeQueueById(queueId)
    hasInitialized = true
    if (!store.activeQueue) {
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

async function onTerminateConfirmed() {
  const success = await handleTerminateQueue()
  if (success) {
    router.push({ name: 'guest-host-complete' })
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <div class="relative z-10 mx-auto max-w-[1024px] px-6 py-4">
      <div class="flex gap-8">
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
            :show-terminate="true"
            @call-next="handleCallNext"
            @search="handleSearchUpdate($event)"
            @add-guest="showAddGuestModal = true"
            @toggle-pause="handlePauseToggle"
            @terminate="showTerminateModal = true"
            @call-guest="handleCallGuest"
            @serve-guest="handleServeGuest"
            @open-settings="showSettingsModal = true"
          />
        </div>

        <!-- Right column -->
        <div class="flex flex-1 flex-col gap-8">
          <ShareCodeCard
            :join-code="activeQueue?.joinCode ?? ''"
            @show-qr="showInfoModal = true"
          />

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
    <TerminateQueueModal
      :is-open="showTerminateModal"
      :still-waiting-count="waitingCount"
      @close-queue="onTerminateConfirmed"
      @keep-open="showTerminateModal = false"
    />

    <InfoQueueModal
      :is-open="showInfoModal"
      :join-code="activeQueue?.joinCode ?? ''"
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
