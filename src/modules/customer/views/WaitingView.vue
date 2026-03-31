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
import TicketCaptureTemplate from '@/modules/customer/components/TicketCaptureTemplate.vue'

import { toPng } from 'html-to-image'

const router = useRouter()
const { showToast } = useToast()
const customerStore = useCustomerStore()
const queueStore = useQueueStore()

const ticketRef = ref<HTMLElement | null>(null)
const isSaving = ref(false)
const isSaved = ref(false)

const queueName = computed(() => queueStore.activeQueue?.name ?? 'Your Queue')

async function handleLeave() {
  const success = await customerStore.leaveQueue()
  if (success) showToast('You have left the queue.', { type: 'success' })
}

async function saveTicketAsImage() {
  const element = document.getElementById('capture-ticket')
  if (!element || !customerStore.entry) return
  
  const filename = `queuebuzz-ticket-${customerStore.entry.ticketNo}.png`
  isSaving.value = true
  
  try {
    // 1. Ensure fonts are fully loaded
    if (document.fonts) {
      await document.fonts.ready
    }
    
    // 2. Extra delay for rendered components like QR inside the capture template
    await new Promise(r => setTimeout(r, 800))
    
    const dataUrl = await toPng(element, {
      backgroundColor: '#F7F3EE', // bg-sand
      pixelRatio: 2,
      cacheBust: true,
      style: {
        transform: 'scale(1)',
        margin: '0',
      }
    })
    
    // BEST PRACTICE: Use Web Share API for files if supported (reliable on mobile)
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], filename, { type: 'image/png' })
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Queue Ticket',
            text: `Entry #${customerStore.entry.ticketNo} at ${queueName.value}`
          })
          isSaved.value = true
          showToast('Ticket shared/saved successfully', { type: 'success' })
          return
        }
      } catch (shareErr) {
        // User cancelled or other error — don't show error toast if it's just a cancel
        console.warn('Share failed or cancelled:', shareErr)
      }
    }

    // FALLBACK: Traditional anchor download (less reliable for 'ensuring' save)
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
    
    isSaved.value = true
    showToast('Download started', { type: 'success' })
  } catch (err: any) {
    console.error('Failed to save ticket:', err)
    
    // Fallback attempt if it's the font error
    if (err.message?.includes('font') || err.message?.includes('trim')) {
      try {
        const dataUrlFallback = await toPng(element, {
          backgroundColor: '#F7F3EE',
          pixelRatio: 1,
          skipFonts: true
        })
        const link = document.createElement('a')
        link.download = filename
        link.href = dataUrlFallback
        link.click()
        isSaved.value = true
        showToast('Download started', { type: 'success' })
        return
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr)
      }
    }
    
    showToast('Failed to save ticket image', { type: 'error' })
  } finally {
    isSaving.value = false
  }
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
    <div v-else-if="customerStore.entry" class="flex flex-col gap-5 px-5 py-4 animate-in fade-in duration-500">
      <PWABanner />

      <div ref="ticketRef" class="relative">
        <!-- Blob decorations behind ticket & stats -->
        <div class="pointer-events-none absolute -right-10 -top-10 h-[250px] w-[250px] rounded-full bg-mint-light blur-[40px] z-0" />
        <div class="pointer-events-none absolute -bottom-24 -left-12 h-[320px] w-[320px] rounded-full bg-warning/45 blur-[70px] z-0" />

        <div class="relative z-10 flex flex-col gap-5 p-1">
          <TicketHero
            :ticket-number="String(customerStore.entry.ticketNo)"
            :queue-name="queueName"
            :show-leave-button="true"
            @leave-queue="handleLeave"
            @save-ticket="saveTicketAsImage"
          />

          <WaitingStats
            :position="customerStore.position"
            :ahead="customerStore.ahead"
            :est-wait-min="customerStore.estWaitMin"
          />
        </div>
      </div>

      <WaitingProgress
        :position="customerStore.position"
      />

      <WaitingAdUnit :est-wait-min="customerStore.estWaitMin" />

      <RecoverByEmailAccordion />

      <TicketSaveBar
        :ticket-number="String(customerStore.entry.ticketNo)"
        :share-code="String(customerStore.entry.ticketNo)"
        :is-saving="isSaving"
        :is-saved="isSaved"
        @share-code="handleShareCode"
        @save="saveTicketAsImage"
      />

      <!-- Premium Ticket Template for Capture (Off-screen) -->
      <TicketCaptureTemplate
        :ticket-number="String(customerStore.entry.ticketNo)"
        :queue-name="queueName"
        join-date="Mar 31, 2026"
      />
    </div>
  </div>
</template>
