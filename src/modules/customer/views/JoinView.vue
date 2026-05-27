<script setup lang="ts">
/**
 * @component JoinView
 * @description Customer-facing queue join page.
 */

import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from '@/composables/useToast'
import { QUEUE_ERROR_REASONS } from '@/modules/app/queue/constants'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'
import JoinQueueForm from '@/modules/customer/components/JoinQueueForm.vue'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import type { JoinQueueFormPayload, JoinQueuePayload } from '@/modules/customer/types'
import { useQueueStore } from '@/stores/queue.store'

const ActiveSessionWarning = defineAsyncComponent(
  () => import('@/modules/customer/components/ActiveSessionWarning.vue'),
)
const JoinCodeModal = defineAsyncComponent(
  () => import('@/modules/customer/components/JoinCodeModal.vue'),
)
const QueueStateOverlay = defineAsyncComponent(
  () => import('@/modules/customer/components/QueueStateOverlay.vue'),
)

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

const queueRouteKey = computed(() => {
  const value = route.params.queueId
  return Array.isArray(value) ? value[0] : value?.toString() || ''
})
const routeCode = computed(() => {
  const value = route.params.code
  const raw = Array.isArray(value) ? value[0] : value?.toString() || ''
  return raw.trim()
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

const joinQueue = async (queueId: string, payload: JoinQueueFormPayload) => {
  const targetQueueId = queueId || resolvedQueueId.value || activeQueue.value?.id
  if (!targetQueueId) return null

  const joinPayload: JoinQueuePayload = { ...payload, code: queueCodeInput.value }

  const result = await customerStore.joinQueue(targetQueueId, joinPayload)
  if (result) {
    router.push({ name: 'customer-waiting', params: { queueId: targetQueueId } })
  } else {
    showToast(customerStore.error ?? 'Failed to join queue', { type: 'error' })
  }
  return result
}

onBeforeMount(async () => {
  if (customerStore.isJoined) {
    await customerStore.fetchEntry()
  }

  if (routeCode.value) {
    await resolveQueueCode(routeCode.value)
    return
  }

  if (queueRouteKey.value) {
    const success = await initializeQueue(queueRouteKey.value)
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
})

function handleJoinByCode() {
  isCodePromptOpen.value = true
}
</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <!-- Blob decorations — Join screen specific -->
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-[250px] w-[250px] rounded-[125px] bg-mint-light/70 blur-[40px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-28 h-[238px] w-[238px] rounded-[100px] bg-warning/35 blur-[40px]"
    />

    <div
      v-if="isLoading || queueIsLoading"
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
        :collect-emails="activeQueue.collectEmails"
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
      @action="
        queueStore.error === QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND
          ? router.push('/')
          : handleJoinByCode()
      "
    />

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
