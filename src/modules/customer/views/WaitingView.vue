<script setup>
/**
 * @component WaitingView
 * @description Customer-facing waiting screen. Shows ticket hero, position stats,
 * progress, ad unit, save bar, and email recovery. Polls status every 10s.
 */

// 1. Vue core imports
import { ref, onMounted, onUnmounted } from 'vue'

// 4. Local composables
import { useCustomerApi } from '@/modules/customer/composables/useCustomerApi'

// 5. Component imports
import TicketHero from '@/modules/customer/components/TicketHero.vue'
import WaitingStats from '@/modules/customer/components/WaitingStats.vue'
import WaitingProgress from '@/modules/customer/components/WaitingProgress.vue'
import WaitingAdUnit from '@/modules/customer/components/WaitingAdUnit.vue'
import TicketSaveBar from '@/modules/customer/components/TicketSaveBar.vue'
import RecoverByEmailAccordion from '@/modules/customer/components/RecoverByEmailAccordion.vue'

// 7. Emits
const emit = defineEmits(['status-change', 'leave-queue'])

// 8. Composable destructuring
const { fetchWaitingStatus, leaveQueue, isLoading } = useCustomerApi()

// 9. Reactive state
const ticketNumber = ref('Q-0042')
const queueName = ref('Chai Point · Koramangala')
const position = ref(4)
const ahead = ref(3)
const estWaitMin = ref(12)
const totalInQueue = ref(23)
const servedCount = ref(8)
const buzzEnabled = ref(true)
const status = ref('waiting')
const showSaveBar = ref(true)
const isDataLoaded = ref(false)

let pollInterval = null

// 11. Methods
async function loadStatus() {
  const result = await fetchWaitingStatus('stub-ticket-id')
  if (result) {
    ticketNumber.value = result.ticketNumber
    position.value = result.position
    ahead.value = result.ahead
    estWaitMin.value = result.estWaitMin
    totalInQueue.value = result.totalInQueue
    servedCount.value = result.servedCount
    buzzEnabled.value = result.buzzEnabled
    isDataLoaded.value = true

    if (result.status !== status.value) {
      status.value = result.status
      if (['idle', 'called', 'served'].includes(result.status)) {
        emit('status-change', result.status)
      }
    }
  }
}

async function handleLeave() {
  await leaveQueue('stub-ticket-id')
  emit('leave-queue')
}

function handleShareCode() {
  const shareData = {
    title: 'Join my queue on QueueBuzz',
    text: `Join the queue at ${queueName.value}`,
    url: 'https://queuebuzz.app/q/chaipoint-koramangala',
  }
  if (navigator.share) {
    navigator.share(shareData)
  } else {
    navigator.clipboard.writeText(shareData.url)
  }
}

// 12. Lifecycle hooks
onMounted(() => {
  loadStatus()
  pollInterval = setInterval(loadStatus, 10000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <!-- Loading skeleton -->
    <div v-if="!isDataLoaded" class="flex flex-col gap-4 px-5 py-4">
      <div class="h-40 animate-pulse rounded-3xl bg-plum-faint" />
      <div class="flex gap-2.5">
        <div v-for="i in 3" :key="i" class="h-24 flex-1 animate-pulse rounded-[18px] bg-plum-faint" />
      </div>
      <div class="h-4 animate-pulse rounded-full bg-plum-faint" />
    </div>

    <!-- Populated state -->
    <div v-else class="flex flex-col gap-8 px-5 py-4">
      <!-- Ticket hero -->
      <TicketHero
        :ticket-number="ticketNumber"
        :queue-name="queueName"
        :show-leave-button="true"
        @leave-queue="handleLeave"
      />

      <!-- Stats -->
      <WaitingStats
        :position="position"
        :ahead="ahead"
        :est-wait-min="estWaitMin"
        :total-in-queue="totalInQueue"
      />

      <!-- Progress -->
      <WaitingProgress
        :position="position"
        :total-in-queue="totalInQueue"
        :served-count="servedCount"
        :buzz-enabled="buzzEnabled"
      />

      <!-- Ad unit -->
      <WaitingAdUnit :est-wait-min="estWaitMin" />

      <!-- Email recovery accordion -->
      <RecoverByEmailAccordion />

      <!-- Save bar -->
      <TicketSaveBar
        :ticket-number="ticketNumber"
        share-code="A4X9K2"
        :is-visible="showSaveBar"
        @dismiss="showSaveBar = false"
        @share-code="handleShareCode"
      />
    </div>
  </div>
</template>
