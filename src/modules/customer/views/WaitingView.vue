<script setup lang="ts">
import { ref, computed, onBeforeMount, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'

import TicketHero from '@/modules/customer/components/TicketHero.vue'
import WaitingStats from '@/modules/customer/components/WaitingStats.vue'
import WaitingProgress from '@/modules/customer/components/WaitingProgress.vue'
import WaitingAdUnit from '@/modules/customer/components/WaitingAdUnit.vue'
import TicketSaveBar from '@/modules/customer/components/TicketSaveBar.vue'
import RecoverByEmailAccordion from '@/modules/customer/components/RecoverByEmailAccordion.vue'
import PWABanner from '@/modules/customer/components/PWABanner.vue'

const router = useRouter()
const { showToast } = useToast()
const customerStore = useCustomerStore()
const queueStore = useQueueStore()

const showSaveBar = ref(true)
const queueName = computed(() => queueStore.activeQueue?.name ?? 'Your Queue')

async function handleLeave() {
  const success = await customerStore.leaveQueue()
  if (success) showToast('You have left the queue.', { type: 'success' })
}

function handleShareCode() {
  if (!customerStore.entry) return
  const data = {
    title: 'Join my queue on QueueBuzz',
    text: `I'm waiting at ${queueName.value}. My ticket is #${customerStore.entry.ticketNo}.`,
    url: window.location.href,
  }
  if (navigator.share) {
    navigator.share(data).catch(() => {})
  } else {
    navigator.clipboard.writeText(data.url)
    showToast('Link copied!', { type: 'success' })
  }
}

// Redirect on status change from SSE
watch(
  () => customerStore.status,
  (s) => {
    if (s === 'CALLED') router.push({ name: 'customer-called' })
    else if (s === 'SERVED') router.push({ name: 'customer-served' })
    else if (s === 'LEFT' || s === 'SKIPPED') router.push('/')
  }
)

onBeforeMount(async () => {
  // 1. If not in store, attempt to re-hydrate from cookie session
  if (!customerStore.isJoined) {
    await customerStore.fetchEntry()
  }

  // 2. If still not joined after hydration attempt, redirect to home
  if (!customerStore.isJoined) {
    router.push('/')
    return
  }

  // 3. Ensure queue context is available for estWaitMin calculation
  const queueId = router.currentRoute.value.params.queueId as string
  if (queueId) {
    await queueStore.initializeQueueById(queueId)
  }

  // 4. Ensure SSE stream is active
  customerStore.connectToEvents(customerStore.entryId!)
})

onUnmounted(() => {
  customerStore.disconnectLiveUpdates()
})

</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <!-- Blob decorations -->
    <div class="pointer-events-none absolute -right-16 -top-10 h-[250px] w-[250px] rounded-[125px] bg-mint-light/50 blur-[40px]" />
    <div class="pointer-events-none absolute -bottom-16 -left-12 h-[250px] w-[250px] rounded-full bg-plum/3 blur-[80px]" />

    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum transition-all duration-300">
      {{ queueName }}
    </h1>

    <!-- Loading skeleton -->
    <div v-if="customerStore.isLoading && !customerStore.entry" class="flex flex-col gap-4 px-5 py-4">
      <div class="h-40 animate-pulse rounded-3xl bg-plum-faint" />
      <div class="flex gap-2.5">
        <div v-for="i in 3" :key="i" class="h-24 flex-1 animate-pulse rounded-[18px] bg-plum-faint" />
      </div>
      <div class="h-4 animate-pulse rounded-full bg-plum-faint" />
    </div>

    <!-- Populated state -->
    <div v-else-if="customerStore.entry" class="flex flex-col gap-8 px-5 py-4 animate-in fade-in duration-500">
      <PWABanner />

      <TicketHero
        :ticket-number="String(customerStore.entry.ticketNo)"
        :queue-name="queueName"
        :show-leave-button="true"
        @leave-queue="handleLeave"
      />

      <WaitingStats
        :position="customerStore.position"
        :ahead="customerStore.ahead"
        :est-wait-min="customerStore.estWaitMin"
      />

      <WaitingProgress
        :position="customerStore.position"
      />

      <WaitingAdUnit :est-wait-min="customerStore.estWaitMin" />

      <RecoverByEmailAccordion />

      <TicketSaveBar
        :ticket-number="String(customerStore.entry.ticketNo)"
        :share-code="String(customerStore.entry.ticketNo)"
        :is-visible="showSaveBar"
        @dismiss="showSaveBar = false"
        @share-code="handleShareCode"
      />
    </div>
  </div>
</template>
