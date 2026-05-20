<script setup lang="ts">
/**
 * @component IdleView
 * @description Customer-facing idle/grace period screen. Shows "Did you miss your turn?"
 * countdown with the ticket hero card above it.
 */

// 1. Vue core imports
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// 4. Composables
import { useToast } from '@/composables/useToast'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'
import GracePeriodCard from '@/modules/customer/components/GracePeriodCard.vue'
import TicketHero from '@/modules/customer/components/TicketHero.vue'
import { useCustomer } from '@/modules/customer/composables/useCustomer'
import { useQueueStore } from '@/stores/queue.store'

// 5. Component imports

import LeaveConfirmationModal from '../components/LeaveConfirmationModal.vue'
import TicketCaptureTemplate from '../components/TicketCaptureTemplate.vue'

const router = useRouter()
const { showToast } = useToast()
const {
  entry,
  status,
  isLoading,
  isJoined,
  leaveQueue,
  fetchEntry,
  getDisplayTicketNumber,
  connectEvents,
  disconnectEvents,
  saveTicketAsImage,
} = useCustomer()

const queueStore = useQueueStore()
const { activeQueue } = storeToRefs(queueStore)
const queueName = computed(() => activeQueue.value?.name || 'Your Queue')
const ticketNumber = computed(() => entry.value?.ticketNo || '...')

const isLeaveModalOpen = ref(false)

// Watch for recovery or skip while on this screen
watch(
  () => status.value,
  (s) => {
    const params = router.currentRoute.value.params
    // If recovered back to WAITING or ARRIVED (e.g. they confirmed), redirect back
    if (s === 'WAITING') {
      router.push({ name: 'customer-waiting', params })
    } else if (s === 'CALLED' || s === 'ARRIVED') {
      router.push({ name: 'customer-called', params })
    } else if (s === 'LEFT' || s === 'SKIPPED') {
      router.push({ name: 'customer-ended', params, query: { reason: s.toLowerCase() } })
    } else if (s === 'SERVED') {
      router.push({
        name: 'customer-served',
        params,
        query: { t: getDisplayTicketNumber() },
      })
    }
  },
)

onBeforeMount(async () => {
  // Always fetch entry to validate active session on mount
  await fetchEntry()
  if (!isJoined.value || !entry.value) {
    showToast('Session expired', { type: 'error' })
    router.push('/')
    return
  }

  const queueId = router.currentRoute.value.params.queueId as string
  let queueValid = false
  if (queueId) {
    queueValid = await queueStore.IntializeQueueByIdOrCode(queueId)
  }

  if (!queueValid || !queueStore.activeQueue) {
    showToast('This queue is no longer available', { type: 'error' })
    router.push('/')
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

    router.replace({ name: routeName, params: { queueId: entry.value.queueId } })
    return
  }

  connectEvents(entry.value.id)
})

onUnmounted(() => {
  disconnectEvents()
})

const handleLeave = () => {
  isLeaveModalOpen.value = true
}

const handleGraceExpired = () => {
  showToast('Your session has timed out', { type: 'warning' })
  router.push({
    name: 'customer-ended',
    params: router.currentRoute.value.params,
    query: { reason: 'skipped' },
  })
}
</script>

<template>
  <div class="relative flex flex-col">
    <!-- Blob decorations — Idle screen specific (teal top-right, orange bottom-left) -->
    <div
      class="pointer-events-none absolute -right-16 -top-24 h-[300px] w-[300px] rounded-[150px] bg-[rgba(45,212,191,0.40)] blur-[40px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-12 h-[250px] w-[250px] rounded-[100px_200px_213px_163px] bg-warning/40 blur-[40px]"
    />

    <CustomerHeader
      v-if="activeQueue"
      :name="activeQueue.name"
      :profile-url="activeQueue.hostProfileImageUrl"
      :banner-url="activeQueue.hostBannerImageUrl"
    />
    <h1 v-else class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <!-- Loading skeleton -->
    <div v-if="isLoading && !entry" class="flex flex-col gap-4 px-5 py-4">
      <div class="h-64 animate-pulse rounded-3xl bg-plum-faint" />
      <div class="h-32 animate-pulse rounded-3xl bg-plum-faint" />
    </div>

    <!-- Populated State -->
    <div v-else-if="entry" class="flex flex-col gap-5 px-5 py-4 animate-in fade-in duration-500">
      <!-- Ticket hero (no leave button here — leave is on the grace card) -->
      <TicketHero
        :ticket-number="String(ticketNumber)"
        :queue-name="queueName"
        :show-leave-button="false"
        @save-ticket="saveTicketAsImage"
      />

      <!-- Grace period countdown -->
      <GracePeriodCard
        :initial-seconds="60"
        :ticket-number="String(ticketNumber)"
        @grace-period-expired="handleGraceExpired"
        @leave-queue="handleLeave"
      />
    </div>

    <!-- Leave Confirmation Modal -->
    <LeaveConfirmationModal
      :is-open="isLeaveModalOpen"
      @close="isLeaveModalOpen = false"
      @confirm="leaveQueue"
    />

    <!-- Premium Ticket Template for Capture (Off-screen) -->
    <TicketCaptureTemplate
      :ticket-number="String(entry.ticketNo)"
      :queue-name="queueName"
      join-date="Mar 31, 2026"
    />
  </div>
</template>
