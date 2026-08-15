<script setup lang="ts">
/**
 * @component JoinView
 * @description Customer-facing queue join page.
 */

import { useSeoMeta } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useLeaveGuard } from '@/composables/useLeaveGuard'
import { usePrefetch } from '@/composables/usePrefetch'
import { useToast } from '@/composables/useToast'
import { QUEUE_ERROR_REASONS } from '@/modules/app/queue/constants'
import ActiveSessionWarning from '@/modules/customer/components/ActiveSessionWarning.vue'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'
import JoinCodeModal from '@/modules/customer/components/JoinCodeModal.vue'
import JoinQueueForm from '@/modules/customer/components/JoinQueueForm.vue'
import PWABanner from '@/modules/customer/components/PWABanner.vue'
import QueueStateOverlay from '@/modules/customer/components/QueueStateOverlay.vue'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import type { JoinQueueFormPayload, JoinQueuePayload } from '@/modules/customer/types'
import { useQueueStore } from '@/stores/queue.store'

const route = useRoute()
const router = useRouter()

const { showToast } = useToast()
const customerStore = useCustomerStore()
const queueStore = useQueueStore()

const queueCodeInput = ref('')
const queueCodeError = ref('')
const isCodePromptOpen = ref(false)
const isVerifyingCode = ref(false)
const resolvedQueueId = ref<string | null>(null)
const isAndroid = ref(false)

if (typeof navigator !== 'undefined') {
  isAndroid.value = /Android/i.test(navigator.userAgent)
}

const queueRouteKey = computed(() => {
  const value = route.params.queueId
  return Array.isArray(value) ? value[0] : value?.toString() || ''
})
const routeCode = computed(() => {
  const value = route.params.code
  const raw = Array.isArray(value) ? value[0] : value?.toString() || ''
  const trimmed = raw.trim()
  return trimmed.toLowerCase() === 'join' ? '' : trimmed
})

const { entry: customerEntry, isLoading } = storeToRefs(customerStore)

async function initializeQueue(queueId?: string, code?: string) {
  const success = await queueStore.IntializeQueueByIdOrCode(queueId, code)
  if (!success || !queueStore.activeQueue) {
    return false
  }

  if (customerStore.isJoined && customerEntry.value?.queueId === queueStore.activeQueue.id) {
    const status = customerEntry.value.status
    let routeName = 'customer-waiting'
    if (status === 'CALLED') {
      routeName = 'customer-called'
    } else if (status === 'IDLE') {
      routeName = 'customer-idle'
    }

    isNavigatingAway.value = true
    router.replace({ name: routeName, params: { queueId: queueStore.activeQueue.id } })
  }

  return true
}

async function resolveQueueCode(code: string) {
  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode) {
    queueCodeError.value = 'Enter the join code to continue.'
    isCodePromptOpen.value = true
    return false
  }

  isVerifyingCode.value = true
  queueCodeError.value = ''
  try {
    const targetQueue = queueRouteKey.value || undefined
    const loaded = await initializeQueue(targetQueue, normalizedCode)

    if (!loaded) {
      if (queueStore.error === QUEUE_ERROR_REASONS.SESSION_EXPIRED) {
        queueCodeError.value = 'Session expired. Please try again.'
      } else if (queueStore.error === QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND) {
        queueCodeError.value = 'This queue is no longer available.'
      } else {
        queueCodeError.value = 'Invalid join code. Please try again.'
      }
      isCodePromptOpen.value = true
      return false
    }

    if (queueStore.activeQueue) {
      resolvedQueueId.value = queueStore.activeQueue.id
    }
    queueCodeInput.value = normalizedCode
    isCodePromptOpen.value = false
    return true
  } finally {
    isVerifyingCode.value = false
  }
}

async function handleCodeSubmit(code: string) {
  queueCodeInput.value = code
  await resolveQueueCode(code)
}

async function handleLeaveQueue() {
  const success = await customerStore.leaveQueue()
  if (success) {
    // Re-initialize the target queue since leaveQueue clears the entire queue context
    const queueId = queueStore.activeQueue?.id || resolvedQueueId.value || queueRouteKey.value
    if (queueId) {
      await queueStore.IntializeQueueByIdOrCode(queueId)
    }
    showToast('Previous session cleared. You can now join this queue.', { type: 'success' })
  }
}

async function handleRecheck() {
  const targetQueueId = activeQueue.value?.id || resolvedQueueId.value || queueRouteKey.value
  if (targetQueueId) {
    customerStore.error = null
    customerStore.errorCode = null
    await queueStore.IntializeQueueByIdOrCode(targetQueueId, queueCodeInput.value)
  }
}

const {
  activeQueue,
  waitingCount,
  avgWaitTime,
  isLoading: queueIsLoading,
} = storeToRefs(queueStore)

useSeoMeta({
  title: 'Join Queue — QueueBuzz',
  description:
    'Join the virtual waitlist on QueueBuzz. Check live positions, get instant notifications, and skip the wait.',
  ogTitle: 'Join Queue — QueueBuzz',
  ogDescription:
    'Join the virtual waitlist on QueueBuzz. Check live positions, get instant notifications, and skip the wait.',
  twitterTitle: 'Join Queue — QueueBuzz',
  twitterDescription:
    'Join the virtual waitlist on QueueBuzz. Check live positions, get instant notifications, and skip the wait.',
})

const isJoining = ref(false)
const isNavigatingAway = ref(false)

useLeaveGuard(
  'Are you sure you want to leave this page?',
  () => !isJoining.value && !isNavigatingAway.value,
)

const joinQueue = async (queueId: string, payload: JoinQueueFormPayload) => {
  const targetQueueId = queueId || resolvedQueueId.value || activeQueue.value?.id
  if (!targetQueueId) return null

  isJoining.value = true

  const joinPayload: JoinQueuePayload = { ...payload, code: queueCodeInput.value }

  try {
    const result = await customerStore.joinQueue(targetQueueId, joinPayload)
    if (result) {
      isNavigatingAway.value = true
      router.replace({ name: 'customer-waiting', params: { queueId: targetQueueId } })
    } else {
      showToast(customerStore.error ?? 'Failed to join queue', { type: 'error' })
    }
    return result
  } finally {
    isJoining.value = false
  }
}

// Initialize queue state immediately on component creation for faster loading
const initQueueState = async () => {
  // Execute both entry fetching and queue initialization in parallel to avoid sequential network round-trips.
  // Avoid duplicate network requests if the entry has already been loaded by the navigation guard.
  const fetchEntryPromise =
    customerStore.isJoined && !customerStore.entry ? customerStore.fetchEntry() : Promise.resolve()

  let initQueuePromise: Promise<boolean>
  if (routeCode.value) {
    initQueuePromise = resolveQueueCode(routeCode.value)
  } else if (queueRouteKey.value) {
    initQueuePromise = initializeQueue(queueRouteKey.value)
  } else {
    initQueuePromise = Promise.resolve(false)
  }

  await Promise.all([fetchEntryPromise, initQueuePromise])

  if (routeCode.value) {
    return
  }

  if (queueRouteKey.value) {
    const success = await initQueuePromise
    if (success) {
      if (queueStore.activeQueue?.status === 'PAUSED') {
        return
      }
      if (!queueCodeInput.value) {
        isCodePromptOpen.value = true
        return
      }
      return
    }
  }

  // If initialization failed with 404, don't show the prompt
  if (queueStore.error === QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND) {
    return
  }

  isCodePromptOpen.value = true
}

onBeforeMount(async () => {
  await initQueueState()
})

function handleJoinByCode() {
  isCodePromptOpen.value = true
}

function handleQueueNotFoundAction() {
  if (queueStore.error === QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND) {
    isNavigatingAway.value = true
    router.push('/')
  } else {
    handleJoinByCode()
  }
}

// Speculative prefetch of subsequent customer views in the background to guarantee instant transitions
usePrefetch({
  WaitingView: () => import('@/modules/customer/views/WaitingView.vue'),
  CalledView: () => import('@/modules/customer/views/CalledView.vue'),
  IdleView: () => import('@/modules/customer/views/IdleView.vue'),
})

// Clean up the public events connection when navigating away to conserve bandwidth and CPU
onUnmounted(() => {
  queueStore.disconnectLiveUpdates()
})
</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <div class="relative z-10 flex flex-col flex-1">
      <div
        v-if="(isLoading || queueIsLoading) && !isJoining"
        class="flex flex-col items-center flex-1 animate-in fade-in"
      >
        <!-- Skeleton Header (LCP Target) using CustomerHeader's built-in Shimmer -->
        <CustomerHeader :is-loading="true" />

        <!-- Skeleton Form Container -->
        <div
          v-once
          class="mt-10 mx-6 w-[calc(100%-48px)] max-w-sm rounded-[40px] border border-plum-faint bg-white p-8 shadow-sm"
        >
          <div class="h-8 w-40 bg-plum-faint rounded-lg animate-pulse mb-8" />
          <div class="h-24 w-full bg-sand rounded-3xl animate-pulse mb-6" />
          <div class="h-[60px] w-full bg-plum-faint rounded-2xl animate-pulse" />
        </div>

        <p
          class="mt-8 pb-12 font-body text-sm text-plum-muted uppercase tracking-widest animate-pulse"
        >
          Connecting to queue...
        </p>
      </div>

      <template v-else-if="activeQueue">
        <CustomerHeader
          :name="activeQueue.name"
          :profile-url="activeQueue.hostProfileImageUrl"
          :banner-url="activeQueue.hostBannerImageUrl"
        />

        <PWABanner v-if="!isAndroid" />

        <!-- Already in another queue warning -->
        <ActiveSessionWarning
          v-if="customerStore.isJoined && customerEntry?.queueId !== activeQueue.id"
          class="px-6 mt-8"
          :active-queue-id="customerEntry?.queueId"
          :target-queue-name="activeQueue.name"
          :is-loading="isLoading"
          @leave="handleLeaveQueue"
        />

        <QueueStateOverlay
          v-else-if="customerStore.errorCode === 'QUEUE_FULL'"
          error-type="FULL"
          :error-message="customerStore.error || ''"
          @action="handleRecheck"
        />

        <QueueStateOverlay
          v-else-if="customerStore.errorCode === 'QUEUE_PAUSED' || activeQueue.status === 'PAUSED'"
          error-type="DENIED"
          :error-message="customerStore.error || ''"
          @action="handleRecheck"
        />

        <JoinQueueForm
          v-else
          :queue-name="activeQueue.name"
          :people-in-queue="waitingCount"
          :est-wait-min="avgWaitTime"
          :can-join-with-party="activeQueue.allowPartyJoining"
          :max-allowed-party-size="activeQueue.maxPartySize"
          :is-loading="isLoading"
          :is-geo-locked="activeQueue.isGeoLocked"
          :venue-latitude="activeQueue.latitude"
          :venue-longitude="activeQueue.longitude"
          :geo-radius-meters="activeQueue.geoRadiusMeters"
          @join-queue="(payload) => joinQueue(activeQueue.id, payload)"
          @go-to-join-by-code="handleJoinByCode"
        />
      </template>

      <QueueStateOverlay
        v-else
        :error-type="
          queueStore.error === QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND ? 'NOT_FOUND' : 'LOCKED'
        "
        @action="handleQueueNotFoundAction"
      />
    </div>

    <JoinCodeModal
      :is-open="isCodePromptOpen"
      :is-loading="isVerifyingCode"
      :error="queueCodeError"
      :initial-code="queueCodeInput"
      @submit="handleCodeSubmit"
      @close="isCodePromptOpen = true"
    />
  </div>
</template>
