<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'

import TicketHero from '@/modules/customer/components/TicketHero.vue'
import WaitingStats from '@/modules/customer/components/WaitingStats.vue'
import WaitingProgress from '@/modules/customer/components/WaitingProgress.vue'
import WaitingAdUnit from '@/modules/customer/components/WaitingAdUnit.vue'
import TicketSaveBar from '@/modules/customer/components/TicketSaveBar.vue'
import CustomerSettingsModal from '@/modules/customer/components/CustomerSettingsModal.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import PWABanner from '@/modules/customer/components/PWABanner.vue'
import TicketCaptureTemplate from '@/modules/customer/components/TicketCaptureTemplate.vue'

import { useCustomer } from '../composables/useCustomer'
import SettingsIcon from '@/assets/icons/nav-settings.svg?component'

const router = useRouter()
const { showToast } = useToast()

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
  leaveQueue,
  fetchEntry,
  getDisplayTicketNumber,
  connectEvents,
  disconnectEvents,
} = useCustomer()
const queueStore = useQueueStore()

const isSettingsModalOpen = ref(false)
const showEmailHighlight = ref(false)
const queueName = computed(() => queueStore.activeQueue?.name || '')

onMounted(() => {
  setTimeout(() => {
    if (entry.value && !entry.value.email) {
      showEmailHighlight.value = true
    }
  }, 1000)
})

watch(isSettingsModalOpen, (isOpen) => {
  if (isOpen) showEmailHighlight.value = false
})

function handleShareCode() {
  if (!entry.value) return
  const data = {
    title: 'Join my queue on QueueBuzz',
    text: `I'm waiting at ${queueName.value}. My ticket is #${entry.value.ticketNo}.`,
    url: window.location.href,
  }
  if (navigator.share) {
    navigator.share(data).catch(() => {})
  } else {
    navigator.clipboard.writeText(data.url)
    showToast('Link copied!', { type: 'success' })
  }
}

watch(
  () => status.value,
  (s) => {
    const params = router.currentRoute.value.params
    if (s === 'CALLED' || s === 'ARRIVED') router.push({ name: 'customer-called', params })
    else if (s === 'IDLE') router.push({ name: 'customer-idle', params })
    else if (s === 'SERVED') {
      router.push({
        name: 'customer-served',
        params,
        query: { t: getDisplayTicketNumber() },
      })
    } else if (s === 'LEFT' || s === 'SKIPPED') {
      router.push({ name: 'customer-ended', params, query: { reason: s.toLowerCase() } })
    }
  },
  { immediate: true },
)

onBeforeMount(async () => {
  if (!isJoined.value) {
    await fetchEntry()
  }

  if (!isJoined.value) {
    showToast('You are not joined to any queue', { type: 'error' })
    router.push('/')
    return
  }

  // 3. Ensure queue context is available for estWaitMin calculation
  const queueId = router.currentRoute.value.params.queueId as string
  if (queueId) {
    await queueStore.initializeQueueById(queueId)
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
    <h1
      class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum transition-all duration-300"
    >
      {{ queueName }}
    </h1>

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

      <div ref="ticketRef" class="relative">
        <!-- Blob decorations behind ticket & stats -->
        <div
          class="pointer-events-none absolute -right-10 -top-10 h-[250px] w-[250px] rounded-full bg-mint-light blur-[40px] z-0"
        />
        <div
          class="pointer-events-none absolute -bottom-24 -left-12 h-[320px] w-[320px] rounded-full bg-warning/45 blur-[70px] z-0"
        />

        <div class="relative z-10 flex flex-col gap-5 p-1">
          <TicketHero
            :ticket-number="String(entry.ticketNo)"
            :queue-name="queueName"
            :show-leave-button="true"
            @leave-queue="leaveQueue"
            @save-ticket="saveTicketAsImage"
          />

          <WaitingStats :position="position" :ahead="ahead" :est-wait-min="estWaitMin" />
        </div>
      </div>

      <WaitingProgress :position="position" />

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
                class="animate-pulse rounded-full bg-mint px-2 py-0.5 font-body text-sm font-bold text-plum"
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
        join-date="Mar 31, 2026"
      />

      <CustomerSettingsModal v-model:is-open="isSettingsModalOpen" />
    </div>
  </div>
</template>
