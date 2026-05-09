<script setup lang="ts">
/**
 * @component RecoverView
 * @description Resolves a guest recovery token from an email link and redirects
 * the customer into the correct queue screen.
 */

import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { recoverGuestSessionByToken } from '@/modules/customer/actions/customer.action'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useQueueStore } from '@/stores/queue.store'

const route = useRoute()
const router = useRouter()
const queueStore = useQueueStore()
const customerStore = useCustomerStore()

const isLoading = ref(true)
const errorMessage = ref('')

function routeForStatus(queueId: string, status: string) {
  if (status === 'CALLED' || status === 'ARRIVED') {
    return { name: 'customer-called', params: { queueId } }
  }

  if (status === 'IDLE') {
    return { name: 'customer-idle', params: { queueId } }
  }

  if (status === 'SERVED') {
    return { name: 'customer-served', params: { queueId } }
  }

  if (status === 'LEFT' || status === 'SKIPPED') {
    return { name: 'customer-ended', params: { queueId }, query: { reason: status.toLowerCase() } }
  }

  return { name: 'customer-waiting', params: { queueId } }
}

onBeforeMount(async () => {
  const queueId = route.params.queueId as string
  const token = route.query.token

  if (!queueId || typeof token !== 'string' || !token) {
    errorMessage.value = 'Missing recovery token.'
    isLoading.value = false
    return
  }

  const entry = await recoverGuestSessionByToken(token)
  if (!entry) {
    errorMessage.value = 'This recovery link is invalid or has already been used.'
    isLoading.value = false
    return
  }

  customerStore.setEntry(entry)
  await queueStore.initializeQueueById(queueId)

  await router.replace(routeForStatus(queueId, entry.status))
  isLoading.value = false
})
</script>

<template>
  <div class="flex min-h-[70vh] flex-col items-center justify-center px-6 py-12">
    <div
      class="w-full max-w-md rounded-[32px] border border-plum-faint bg-white p-8 text-center shadow-sm"
    >
      <div v-if="isLoading" class="space-y-4">
        <div class="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-mint-light" />
        <h1 class="font-display text-2xl font-bold text-plum">Recovering your session</h1>
        <p class="font-body text-sm text-plum-muted">
          Hang tight while we restore your queue position.
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger"
        >
          !
        </div>
        <h1 class="font-display text-2xl font-bold text-plum">Session recovery failed</h1>
        <p class="font-body text-sm text-plum-muted">
          {{ errorMessage }}
        </p>
        <button
          class="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-mint px-5 font-body text-sm font-semibold text-on-mint"
          @click="router.push('/')"
        >
          Go to homepage
        </button>
      </div>
    </div>
  </div>
</template>
