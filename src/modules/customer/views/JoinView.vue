<script setup lang="ts">
/**
 * @component JoinView
 * @description Customer-facing queue join page.
 */

// 1. Vue core imports
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'
import { useQueueStore } from '@/stores/queue.store'
import { useCustomer } from '@/modules/customer/composables/useCustomer'

// 5. Component imports
import JoinQueueForm from '@/modules/customer/components/JoinQueueForm.vue'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

// 8. Composable destructuring
const { handleJoinQueue, isLoading } = useCustomer()

const queueStore = useQueueStore()
const { activeQueue, waitingCount, avgWaitTime, isLoading: queueIsLoading } = storeToRefs(queueStore)
const { fetchQueueStatus } = queueStore

// 9. Reactive state from store
const queueId = route.params.queueId as string

onBeforeMount(async () => {
    if (!activeQueue.value || (activeQueue.value.slug !== queueId && activeQueue.value.id !== queueId)) {
        const success = await fetchQueueStatus(queueId)
        if (!success) {
            showToast('Queue not found or unavailable.', { type: 'error' })
            router.push({ name: 'customer-not-found' })
        }
    }
})

function handleJoinByCode() {
  router.push({ name: 'customer-join-by-code' })
}

</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <!-- Blob decorations — Join screen specific -->
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-[250px] w-[250px] rounded-[125px] bg-mint-light/50 blur-[40px] animate-pulse"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-28 h-[238px] w-[238px] rounded-[100px] bg-warning/35 blur-[40px]"
    />

    <div v-if="queueIsLoading" class="flex flex-col items-center justify-center p-12 gap-4 flex-1">
      <div class="w-12 h-12 rounded-full border-4 border-plum-faint border-t-mint animate-spin" />
      <p class="font-body text-sm text-plum-muted">Looking up queue details...</p>
    </div>

    <template v-else-if="activeQueue">
      <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum transition-all duration-300">
        {{ activeQueue.name }}
      </h1>

      <JoinQueueForm
        :queue-name="activeQueue.name"
        :people-in-queue="waitingCount"
        :est-wait-min="avgWaitTime"
        :can-join-with-party="activeQueue.allowPartyJoining"
        :max-allowed-party-size="activeQueue.maxPartySize"
        :is-loading="isLoading"
        @join-queue="payload => handleJoinQueue(activeQueue.id, payload)"
        @go-to-join-by-code="handleJoinByCode"
      />
    </template>
    
    <!-- Error or Not Found -->
    <div v-else class="flex flex-col items-center justify-center p-12 gap-4 flex-1">
        <div class="w-12 h-12 rounded-2xl bg-plum-faint flex items-center justify-center">
            <svg class="w-6 h-6 text-plum-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <p class="font-display font-bold text-lg text-plum">Queue not found</p>
        <p class="font-body text-sm text-plum-muted text-center max-w-[280px]"> This queue might have ended or the link is incorrect. </p>
        <BaseButton variant="ghost" class="mt-4" @click="router.push('/')">Go to homepage</BaseButton>
    </div>
  </div>
</template>
