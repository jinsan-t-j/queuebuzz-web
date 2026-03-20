<script setup lang="ts">
/**
 * @view LiveQueueView
 * @description Authenticated host active queue dashboard.
 * Managed via useLiveQueue and useQueueStore.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

import QueueStatCards from '@/modules/app/queue/components/QueueStatCards.vue'
import LiveQueueCard from '@/modules/app/queue/components/LiveQueueCard.vue'
import TerminateQueueModal from '@/modules/app/queue/components/TerminateQueueModal.vue'
import InfoQueueModal from '@/modules/app/queue/components/InfoQueueModal.vue'
import AddGuestModal from '@/modules/app/queue/components/AddGuestModal.vue'
import ShareCodeCard from '@/modules/app/queue/components/ShareCodeCard.vue'
import QueueAnalysisCard from '@/modules/app/queue/components/QueueAnalysisCard.vue'
import LiveQueueSettingsModal from '@/modules/app/queue/components/LiveQueueSettingsModal.vue'

const router = useRouter()
const {
  activeQueue,
  isPaused,
  waitingCount,
  avgWaitTime,

  showAddGuestModal,
  showTerminateModal,
  showInfoModal,
  showSettingsModal,
  
  rawSearchQuery,
  filteredEntries,
  
  servedTodayCount,
  completionRatePercent,
  chartLabels,
  chartBars,
  trend,

  handleSearchUpdate,
  handleAddGuestSubmit,
  handleCallNext,
  handlePauseToggle,
  handleCallGuest,
  handleServeGuest,
  handleTerminateQueue,
  handleUpdateSettings,
  initializeHostQueue,
} = useLiveQueue()

onMounted(async () => {
    if (!activeQueue.value) {
        const queue = await initializeHostQueue()
        if (!queue) {
            router.push({ name: 'dashboard' })
        }
    }
})

async function onTerminateConfirmed() {
    const success = await handleTerminateQueue()
    if (success) {
        router.push({ name: 'dashboard' })
    }
}
</script>

<template>
  <div class="relative min-h-screen bg-sand px-6 py-8">
    <div class="mx-auto max-w-[1200px]">
      <!-- Header Area -->
      <header class="mb-8 flex items-end justify-between">
        <div>
          <h1 class="font-display text-4xl font-bold text-plum">
            {{ activeQueue?.name || 'Active Queue' }}
          </h1>
          <p class="mt-1 font-body text-plum/60">
            Running since {{ activeQueue?.createdAt ? new Date(activeQueue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--' }}
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            class="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-body text-sm font-bold text-plum shadow-sm border border-plum/5 hover:bg-plum/5 transition-colors cursor-pointer"
            @click="showInfoModal = true"
          >
            <span class="text-mint">#</span>
            Join Info
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <!-- Left Column: Statistics & Live List -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <QueueStatCards
            :waiting-count="waitingCount"
            :avg-wait="avgWaitTime"
          />

          <LiveQueueCard
            :entries="filteredEntries"
            :search-query="rawSearchQuery"
            :is-paused="isPaused"
            :show-terminate="true"
            @call-next="handleCallNext"
            @search="handleSearchUpdate"
            @add-guest="showAddGuestModal = true"
            @toggle-pause="handlePauseToggle"
            @terminate="showTerminateModal = true"
            @call-guest="handleCallGuest"
            @serve-guest="handleServeGuest"
            @open-settings="showSettingsModal = true"
          />
        </div>

        <!-- Right Column: Share & Insights -->
        <div class="lg:col-span-8 flex flex-col gap-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
             <ShareCodeCard
                :join-code="activeQueue?.joinCode ?? ''"
                @show-qr="showInfoModal = true"
              />
              
              <div class="flex flex-col gap-4 p-6 rounded-card border border-plum/5 bg-white shadow-sm">
                <h3 class="font-display text-lg font-bold text-plum">Quick Actions</h3>
                <div class="grid grid-cols-2 gap-3">
                   <button 
                    class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand p-4 transition-all hover:bg-mint-light group cursor-pointer"
                    @click="showAddGuestModal = true"
                   >
                     <div class="rounded-full bg-white p-2 shadow-sm group-hover:bg-mint">
                        <svg class="h-5 w-5 text-plum group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                     </div>
                     <span class="font-body text-xs font-bold text-plum">Add Guest</span>
                   </button>
                   
                   <button 
                    class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand p-4 transition-all hover:bg-plum/5 group cursor-pointer"
                    @click="handlePauseToggle"
                   >
                     <div class="rounded-full bg-white p-2 shadow-sm group-hover:bg-warning">
                        <svg class="h-5 w-5 text-plum group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                     <span class="font-body text-xs font-bold text-plum">{{ isPaused ? 'Resume' : 'Pause' }}</span>
                   </button>
                </div>
              </div>
          </div>

          <QueueAnalysisCard
            :served-today="servedTodayCount"
            :trend-text="trend.text"
            :trend-direction="trend.direction"
            :completion-rate="completionRatePercent"
            :chart-labels="chartLabels"
            :chart-bars="chartBars"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TerminateQueueModal
      :is-open="showTerminateModal"
      :still-waiting-count="waitingCount"
      @close-queue="onTerminateConfirmed"
      @keep-open="showTerminateModal = false"
    />

    <InfoQueueModal
      :is-open="showInfoModal"
      :join-code="activeQueue?.joinCode ?? ''"
      @close="showInfoModal = false"
    />

    <AddGuestModal
      :is-open="showAddGuestModal"
      @close="showAddGuestModal = false"
      @submit="handleAddGuestSubmit"
    />
    
    <LiveQueueSettingsModal
      v-if="activeQueue"
      :is-open="showSettingsModal"
      :queue="activeQueue"
      @close="showSettingsModal = false"
      @submit="handleUpdateSettings"
    />
  </div>
</template>
