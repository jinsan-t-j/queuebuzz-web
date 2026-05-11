<script setup lang="ts">
/**
 * @component JoinView
 * @description Customer-facing queue join page.
 */

import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { joinByCode as verifyJoinCode } from '@/modules/customer/actions/customer.action'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import type { JoinQueueFormPayload, JoinQueuePayload } from '@/modules/customer/types'
import { useQueueStore } from '@/stores/queue.store'

const ActiveSessionWarning = defineAsyncComponent(
  () => import('@/modules/customer/components/ActiveSessionWarning.vue'),
)
const JoinCodeModal = defineAsyncComponent(
  () => import('@/modules/customer/components/JoinCodeModal.vue'),
)
const JoinQueueForm = defineAsyncComponent(
  () => import('@/modules/customer/components/JoinQueueForm.vue'),
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

async function initializeQueue(queueId: string) {
  const success = await queueStore.initializeQueueById(queueId)
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
    const result = await verifyJoinCode(normalizedCode)
    if (!result.found || !result.queueId) {
      queueCodeError.value = 'Invalid join code. Please try again.'
      isCodePromptOpen.value = true
      return false
    }

    resolvedQueueId.value = result.queueId
    queueCodeInput.value = normalizedCode

    const loaded = await initializeQueue(result.queueId)
    if (!loaded) {
      queueCodeError.value = 'This queue is no longer available.'
      isCodePromptOpen.value = true
      return false
    }

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
      await queueStore.initializeQueueById(queueId)
    }
    showToast('Previous session cleared. You can now join this queue.', { type: 'success' })
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
  if (!routeCode.value) {
    isCodePromptOpen.value = true
    return
  }

  await resolveQueueCode(routeCode.value)
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
      v-if="queueIsLoading || isVerifyingCode"
      class="flex flex-col items-center px-6 py-12 flex-1 animate-in fade-in"
    >
      <!-- Skeleton Header (LCP Target) -->
      <div v-once class="h-12 w-64 bg-plum-faint rounded-2xl animate-pulse mx-auto" />

      <!-- Skeleton Form Container -->
      <div
        v-once
        class="mt-10 w-full max-w-sm rounded-[40px] border border-plum-faint bg-white p-8 shadow-sm"
      >
        <div class="h-8 w-40 bg-plum-faint rounded-lg animate-pulse mb-8" />
        <div class="h-24 w-full bg-sand rounded-3xl animate-pulse mb-6" />
        <div class="h-[60px] w-full bg-plum-faint rounded-2xl animate-pulse" />
      </div>

      <p class="mt-8 font-body text-sm text-plum-muted uppercase tracking-widest animate-pulse">
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

      <JoinQueueForm
        v-else
        :queue-name="activeQueue.name"
        :people-in-queue="waitingCount"
        :est-wait-min="avgWaitTime"
        :can-join-with-party="activeQueue.allowPartyJoining"
        :max-allowed-party-size="activeQueue.maxPartySize"
        :is-loading="isLoading"
        :collect-emails="activeQueue.collectEmails"
        @join-queue="(payload) => joinQueue(activeQueue.id, payload)"
        @go-to-join-by-code="handleJoinByCode"
      />
    </template>

    <div v-else class="flex flex-col items-center justify-center p-12 gap-4 flex-1">
      <div class="w-12 h-12 rounded-2xl bg-plum-faint flex items-center justify-center">
        <svg class="w-6 h-6 text-plum-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p class="font-display font-bold text-lg text-plum">Queue access locked</p>
      <p class="font-body text-sm text-plum-muted text-center max-w-[280px]">
        Enter the join code to open this queue.
      </p>
      <BaseButton variant="ghost" class="mt-4" @click="handleJoinByCode">Enter code</BaseButton>
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
