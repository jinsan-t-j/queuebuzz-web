<script setup>
/**
 * @component CalledView
 * @description Customer-facing "called" screen — "Great news! Your turn has arrived."
 * Shows ticket number prominently with QR option and I'm Here CTA.
 */

import { ref, watch, computed, onBeforeMount, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { useCustomer } from '@/modules/customer/composables/useCustomer'
import { useQueueStore } from '@/stores/queue.store'
import { useToast } from '@/composables/useToast'

import QrScanIcon from '@/assets/icons/qr-scan.svg?component'
import { CheckIcon } from 'lucide-vue-next'
import TicketCaptureTemplate from '../components/TicketCaptureTemplate.vue'

import LeaveConfirmationModal from '../components/LeaveConfirmationModal.vue'
import EntryQrModal from '../components/EntryQrModal.vue'
import { fetchEntry } from '../actions/customer.action'

const router = useRouter()
const { showToast } = useToast()
const {
  entry,
  status,
  isJoined,
  isSaving,
  isSaved,
  saveTicketAsImage,
  confirmArrival,
  leaveQueue,
  connectEvents,
  disconnectEvents
} = useCustomer()
const queueStore = useQueueStore()

const isLeaveModalOpen = ref(false)
const isQrModalOpen = ref(false)
const isConfirming = ref(false)

const emit = defineEmits(['arrival-confirmed', 'leave-queue', 'show-qr'])

// Watch for status changes to redirect if served or skipped
watch(
  () => status.value,
  (s) => {
    const params = router.currentRoute.value.params
    if (s === 'SERVED') router.push({ name: 'customer-served', params })
    else if (s === 'ARRIVED') {
      // Stay on this page but shows "Arrived" state
    }
    else if (s === 'LEFT' || s === 'SKIPPED') {
      router.push({ name: 'customer-ended', params, query: { reason: s.toLowerCase() } })
    }
  },
  { immediate: true }
)

const ticketNumber = computed(() => entry.value?.ticketNumber || '...')
const queueName = computed(() => queueStore.activeQueue?.name || 'Your Queue')

onBeforeMount(async () => {
  // 1. If not in store, attempt to re-hydrate from cookie session
  if (!isJoined.value) {
    await fetchEntry()
  }

  // 2. If still not joined after hydration attempt, redirect to home
  if (!isJoined.value) {
    showToast('You are not joined to any queue', {type: 'error'})
    router.push('/')
    return
  }

  // 3. Ensure queue context is available for estWaitMin calculation
  const queueId = router.currentRoute.value.params.queueId
  if (queueId) {
    await queueStore.initializeQueueById(queueId)
  }

  connectEvents(entry.value.id)
})

onUnmounted(() => {
  disconnectEvents()
})

</script>

<template>
  <div class="relative flex flex-col">
    <!-- Blob decorations — Called screen specific (two large mint blobs) -->
    <div
      class="pointer-events-none absolute -top-20 left-1/2   h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-mint/16 blur-[80px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-10   h-[350px] w-[350px] rounded-full bg-mint/16 blur-[80px]"
    />

    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <div class="flex flex-col px-5 py-4">
      <!-- Heading section -->
      <div class="mt-2 text-center">
        <h2 class="font-body text-2xl font-semibold text-plum">Great news!</h2>
        <p class="mt-2 font-body text-base font-medium text-plum/60">Your turn has arrived.</p>
      </div>

      <!-- Ticket card -->
      <div class="relative mt-6 overflow-hidden rounded-[40px] border-2 border-mint bg-[#fdfcfe] p-6 text-center shadow-[0_20px_50px_rgba(0,229,160,0.12)]">
        <!-- Decorative notches -->
        <div class="absolute -left-[7px] top-1/2 h-6 w-3.5 -translate-y-1/2 rounded-r-full bg-sand" />
        <div class="absolute -right-[7px] top-1/2 h-6 w-3.5 -translate-y-1/2 rounded-l-full bg-sand" />

        <p class="font-body text-xs font-normal uppercase tracking-[2.4px] text-plum/60">Your Ticket</p>
        <p class="mt-4 font-mono text-[92px] font-black leading-[92px] text-plum">
          {{ ticketNumber.split('-')[0] }}-<br />{{ ticketNumber.split('-')[1] || '0042' }}
        </p>

        <!-- Show QR button -->
        <button
          class="mx-auto mt-4 flex items-center gap-1.5 rounded-[15px] border border-sand px-4 py-2"
          @click="isQrModalOpen = true"
        >
          <QrScanIcon class="h-4 w-4 text-[#64748b]" />
          <span class="font-body text-sm tracking-tight text-[#64748b]">SHOW QR</span>
        </button>

        <!-- Save Ticket Button (Secondary) -->
        <button
          class="mx-auto mt-2 flex items-center gap-1.5 px-4 py-2 font-body text-xs font-semibold text-plum-muted transition-opacity hover:opacity-80"
          :disabled="isSaving"
          @click="saveTicketAsImage"
        >
          {{ isSaved ? '✓ SAVED TO GALLERY' : 'SAVE TICKET IMAGE' }}
        </button>
      </div>

      <!-- Hurray message -->
      <p class="mt-8 text-center font-body text-xs font-light text-plum-soft">
        🎉 Hurray Its your turn, Please head in.
      </p>

      <!-- I'm Here CTA -->
      <button
        :disabled="isConfirming || status === 'ARRIVED'"
        :class="[
          'cursor-pointer mt-4 flex h-[68px] w-full items-center justify-center rounded-2xl font-body text-lg font-bold transition-all',
          status === 'ARRIVED' 
            ? 'bg-plum-faint text-plum-muted shadow-none border border-plum-faint' 
            : 'bg-mint text-plum shadow-[0_8px_10px_rgba(0,229,160,0.20),0_20px_25px_rgba(0,229,160,0.20)]',
          isConfirming || status === 'ARRIVED' ? 'cursor-not-allowed opacity-70' : '',
        ]"
        @click="confirmArrival"
      >
        <template v-if="isConfirming">Confirming…</template>
        <template v-else-if="status === 'ARRIVED'">
          <CheckIcon class="mr-2 h-5 w-5 text-mint" />
          Arrived!
        </template>
        <template v-else>I'm Here</template>
      </button>

      <!-- Leave link -->
      <button
        class="mt-4 cursor-pointer text-center font-body text-sm font-medium text-danger"
        @click="isLeaveModalOpen = true"
      >
        Leave
      </button>

      <!-- Reusable Leave Confirmation Modal -->
      <LeaveConfirmationModal
        :is-open="isLeaveModalOpen"
        @close="isLeaveModalOpen = false"
        @confirm="leaveQueue"
      />

      <!-- Arrival QR Modal -->
      <EntryQrModal
        v-if="entry"
        :is-open="isQrModalOpen"
        :entry-id="entry.id"
        :ticket-no="ticketNumber"
        @close="isQrModalOpen = false"
      />

      <!-- Hidden Capture Template -->
      <TicketCaptureTemplate
        v-if="entry"
        :ticket-number="String(entry.ticketNo)"
        :queue-name="queueName"
        join-date="Apr 01, 2026"
      />
    </div>
  </div>
</template>
