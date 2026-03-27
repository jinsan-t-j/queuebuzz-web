<script setup lang="ts">
/**
 * @component WaitingView
 * @description Customer-facing waiting screen. Shows ticket hero, position stats,
 * progress, ad unit, save bar, and email recovery. Polls status every 10s.
 */

// 1. Vue core imports
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// 3. User workspace / internal stores
import { useCustomer } from '@/modules/customer/composables/useCustomer'
import { useQueueStore } from '@/stores/queue.store'

// 5. Component imports
import TicketHero from '@/modules/customer/components/TicketHero.vue'
import WaitingStats from '@/modules/customer/components/WaitingStats.vue'
import WaitingProgress from '@/modules/customer/components/WaitingProgress.vue'
import WaitingAdUnit from '@/modules/customer/components/WaitingAdUnit.vue'
import TicketSaveBar from '@/modules/customer/components/TicketSaveBar.vue'
import RecoverByEmailAccordion from '@/modules/customer/components/RecoverByEmailAccordion.vue'
import PWABanner from '@/modules/customer/components/PWABanner.vue'
import { useToast } from '@/composables/useToast'

// 8. Composable destructuring
const router = useRouter()
const { showToast } = useToast()
const queueStore = useQueueStore()
const { 
  ticket, 
  isJoined, 
  isLoading, 
  fetchStatus, 
  leaveQueue, 
  initialFetch 
} = useCustomer()

// 9. Reactive state
const showSaveBar = ref(true)
let pollInterval: any = null

// 10. Computed properties
const isDataLoaded = computed(() => !!ticket.value)
const queueName = computed(() => queueStore.activeQueue?.name || 'Your Queue')

// 11. Methods
async function loadStatus() {
  await fetchStatus()
}

async function handleLeave() {
  const success = await leaveQueue()
  if (success) {
    showToast('You have left the queue.', { type: 'success' })
  }
}

function handleShareCode() {
  if (!ticket.value) return
  
  const shareData = {
    title: 'Join my queue on QueueBuzz',
    text: `I'm waiting in line at ${queueName.value}. My ticket is ${ticket.value.ticketNumber}.`,
    url: window.location.href,
  }
  
  if (navigator.share) {
    navigator.share(shareData).catch(() => {})
  } else {
    navigator.clipboard.writeText(shareData.url)
    showToast('Link copied to clipboard!', { type: 'success' })
  }
}

// Watch status for changes (auto-redirect)
watch(() => ticket.value?.status, (newStatus) => {
  if (newStatus === 'idle') {
    router.push({ name: 'customer-idle' })
  } else if (newStatus === 'called') {
    router.push({ name: 'customer-called' })
  } else if (newStatus === 'served') {
    router.push({ name: 'customer-served' })
  }
})

// 12. Lifecycle hooks
onMounted(async () => {
  // Try to load ticket from storage or current state
  await initialFetch()
  
  if (!isJoined.value) {
    // If no ticket, redirect back to home or join
    router.push('/')
    return
  }

  // Poll status every 10s
  pollInterval = setInterval(loadStatus, 10000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <!-- Blob decorations — Waiting screen specific -->
    <div
      class="pointer-events-none absolute -right-16 -top-10   h-[250px] w-[250px] rounded-[125px] bg-mint-light/50 blur-[40px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-12   h-[250px] w-[250px] rounded-full bg-plum/3 blur-[80px]"
    />

    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum transition-all duration-300">
      {{ queueName }}
    </h1>

    <!-- Loading skeleton -->
    <div v-if="!isDataLoaded && !isLoading" class="flex flex-col gap-4 px-5 py-4">
      <div class="h-40 animate-pulse rounded-3xl bg-plum-faint" />
      <div class="flex gap-2.5">
        <div v-for="i in 3" :key="i" class="h-24 flex-1 animate-pulse rounded-[18px] bg-plum-faint" />
      </div>
      <div class="h-4 animate-pulse rounded-full bg-plum-faint" />
    </div>

    <!-- Populated state -->
    <div v-else-if="ticket" class="flex flex-col gap-8 px-5 py-4 animate-in fade-in duration-500">
      <!-- iOS PWA Onboarding -->
      <PWABanner />

      <!-- Ticket hero -->
      <TicketHero
        :ticket-number="ticket.ticketNumber"
        :queue-name="queueName"
        :show-leave-button="true"
        @leave-queue="handleLeave"
      />

      <!-- Stats -->
      <WaitingStats
        :position="ticket.position"
        :ahead="ticket.ahead"
        :est-wait-min="ticket.estWaitMin"
        :total-in-queue="ticket.totalInQueue"
      />

      <!-- Progress -->
      <WaitingProgress
        :position="ticket.position"
        :total-in-queue="ticket.totalInQueue"
        :served-count="ticket.servedCount"
        :buzz-enabled="ticket.buzzEnabled"
      />

      <!-- Ad unit -->
      <WaitingAdUnit :est-wait-min="ticket.estWaitMin" />

      <!-- Email recovery accordion -->
      <RecoverByEmailAccordion />

      <!-- Save bar -->
      <TicketSaveBar
        :ticket-number="ticket.ticketNumber"
        :share-code="ticket.ticketNumber"
        :is-visible="showSaveBar"
        @dismiss="showSaveBar = false"
        @share-code="handleShareCode"
      />
    </div>
  </div>
</template>
