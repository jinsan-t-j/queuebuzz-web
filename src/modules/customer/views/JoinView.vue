<script setup lang="ts">
/**
 * @component JoinView
 * @description Customer-facing queue join page.
 */

import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'
import { useQueueStore } from '@/stores/queue.store'
import { useCustomer } from '@/modules/customer/composables/useCustomer'

import JoinQueueForm from '@/modules/customer/components/JoinQueueForm.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'

const route = useRoute()
const router = useRouter()

const { handleJoinQueue, isLoading } = useCustomer()

const queueStore = useQueueStore()
const {
  activeQueue,
  waitingCount,
  avgWaitTime,
  isLoading: queueIsLoading,
} = storeToRefs(queueStore)

const queueId = route.params.queueId as string

onBeforeMount(async () => {
  await queueStore.initializeQueueById(queueId)
})

function handleJoinByCode() {
  router.push({ name: 'customer-join-by-code' })
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
      v-if="queueIsLoading"
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

      <JoinQueueForm
        :queue-name="activeQueue.name"
        :people-in-queue="waitingCount"
        :est-wait-min="avgWaitTime"
        :can-join-with-party="activeQueue.allowPartyJoining"
        :max-allowed-party-size="activeQueue.maxPartySize"
        :is-loading="isLoading"
        :collect-emails="activeQueue.collectEmails"
        @join-queue="(payload) => handleJoinQueue(activeQueue.id, payload)"
        @go-to-join-by-code="handleJoinByCode"
      />
    </template>

    <!-- Error or Not Found -->
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
      <p class="font-display font-bold text-lg text-plum">Queue not found</p>
      <p class="font-body text-sm text-plum-muted text-center max-w-[280px]">
        This queue might have ended or the link is incorrect.
      </p>
      <BaseButton variant="ghost" class="mt-4" @click="router.push('/')">Go to homepage</BaseButton>
    </div>
  </div>
</template>
