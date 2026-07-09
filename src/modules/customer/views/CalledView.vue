<script setup lang="ts">
/**
 * @component CalledView
 * @description Customer-facing "called" screen — "Great news! Your turn has arrived."
 * Shows ticket number prominently with QR option and I'm Here CTA.
 */

import { storeToRefs } from 'pinia'
import {
  computed,
  defineAsyncComponent,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import QrScanIcon from '@/assets/icons/qr-scan.svg?component'
import { useBackgroundKeepAlive } from '@/composables/useBackgroundKeepAlive'
import { useLeaveGuard } from '@/composables/useLeaveGuard'
import { useToast } from '@/composables/useToast'
import { useWakeLock } from '@/composables/useWakeLock'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'
import { useCustomer } from '@/modules/customer/composables/useCustomer'
import { useQueueStore } from '@/stores/queue.store'

import EntryQrModal from '../components/EntryQrModal.vue'
import LeaveConfirmationModal from '../components/LeaveConfirmationModal.vue'
import TicketCaptureTemplate from '../components/TicketCaptureTemplate.vue'

defineEmits(['arrival-confirmed', 'leave-queue', 'show-qr', 'service-finished'])

const ConnectionLostBanner = defineAsyncComponent(
  () => import('../components/ConnectionLostBanner.vue'),
)

const router = useRouter()
const { showToast } = useToast()

const isNavigatingAway = ref(false)

useLeaveGuard('Are you sure you want to leave this page?', () => !isNavigatingAway.value)

const {
  entry,
  status,
  isJoined,
  isSaving,
  isSaved,
  saveTicketAsImage,
  confirmArrival,
  finishService,
  leaveQueue: baseLeaveQueue,
  fetchEntry,
  getDisplayTicketNumber,
  connectEvents,
  disconnectEvents,
  redirectForStatus,
} = useCustomer()

async function handleLeaveQueue() {
  isNavigatingAway.value = true
  const success = await baseLeaveQueue()
  if (!success) {
    isNavigatingAway.value = false
  }
}
const queueStore = useQueueStore()
const { activeQueue } = storeToRefs(queueStore)

const isLeaveModalOpen = ref(false)
const isFinishModalOpen = ref(false)
const isQrModalOpen = ref(false)
const isConfirming = ref(false)
const isFinishing = ref(false)
const ticketDisplay = ref('')

// Watch for status changes to redirect if served or skipped
watch(
  () => status.value,
  (s) => {
    if (s && s !== 'CALLED' && s !== 'ARRIVED') {
      isNavigatingAway.value = true
      redirectForStatus(s)
    }
  },
  { immediate: true },
)

watch(
  () => entry.value,
  (nextEntry) => {
    const nextTicket = getDisplayTicketNumber(nextEntry)
    if (nextTicket) {
      ticketDisplay.value = nextTicket
    }
  },
  { immediate: true },
)

// Safety net: if entry is cleared externally (queue ended, session invalidated),
// redirect to the ended view so the customer isn't stuck on a stale screen.
watch(
  () => entry.value,
  (current, previous) => {
    if (previous && !current) {
      isNavigatingAway.value = true
      router.replace({
        name: 'customer-ended',
        params: router.currentRoute.value.params,
        query: { reason: 'terminated' },
      })
    }
  },
)

const ticketNumber = computed(() => ticketDisplay.value || '....')
const ticketNumberParts = computed(() => {
  const [prefix, suffix] = ticketNumber.value.split('-')

  if (suffix) {
    return { prefix, suffix }
  }

  if (prefix.length > 4) {
    return {
      prefix: prefix.slice(0, Math.max(1, prefix.length - 4)),
      suffix: prefix.slice(-4),
    }
  }

  return { prefix, suffix: '' }
})
const queueName = computed(() => activeQueue.value?.name || 'Your Queue')

const formattedJoinDate = computed(() => {
  if (!entry.value?.createdAt) return ''
  try {
    return new Date(entry.value.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
})

onBeforeMount(async () => {
  // Always fetch entry to validate active session on mount
  await fetchEntry()

  // 2. If still not joined after validation attempt, redirect to home
  if (!isJoined.value || !entry.value) {
    showToast('You are not joined to any queue', { type: 'error' })
    isNavigatingAway.value = true
    router.replace('/')
    return
  }

  // 3. Ensure queue context is available for estWaitMin calculation
  const queueId = router.currentRoute.value.params.queueId as string
  let queueValid = false
  if (queueId) {
    queueValid = await queueStore.IntializeQueueByIdOrCode(queueId)
  }

  if (!queueValid || !queueStore.activeQueue) {
    showToast('This queue is no longer available', { type: 'error' })
    isNavigatingAway.value = true
    router.replace('/')
    return
  }

  // Check if the ticket belongs to the loaded queue
  if (entry.value.queueId !== queueStore.activeQueue.id) {
    let routeName = 'customer-waiting'
    if (status.value === 'CALLED' || status.value === 'ARRIVED') {
      routeName = 'customer-called'
    } else if (status.value === 'IDLE') {
      routeName = 'customer-idle'
    } else if (status.value === 'SERVED') {
      routeName = 'customer-served'
    }

    isNavigatingAway.value = true
    router.replace({ name: routeName, params: { queueId: entry.value.queueId } })
    return
  }

  // Validate current status onload: must be CALLED or ARRIVED
  if (status.value && status.value !== 'CALLED' && status.value !== 'ARRIVED') {
    isNavigatingAway.value = true
    redirectForStatus(status.value)
    return
  }

  if (entry.value?.id) {
    connectEvents(entry.value.id)
  }
})

let alertInterval: ReturnType<typeof setInterval> | null = null
let playCount = 0

let audioCtx: AudioContext | null = null
let activeGestureResume: (() => void) | null = null

const getAudioContext = (): AudioContext | null => {
  if (audioCtx) return audioCtx

  try {
    const AudioContextClass =
      globalThis.AudioContext ||
      (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  } catch {
    // Ignore audio context initialisation failures
  }
  return audioCtx
}

const playRingtone = (ctx: AudioContext) => {
  const playNote = (time: number, frequency: number, duration: number) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, time)

    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.5, time + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + duration)
  }

  const now = ctx.currentTime
  playNote(now, 880, 0.8) // Ding (A5)
  playNote(now + 0.3, 698.46, 1.2) // Dong (F5)
}

const playSoundAndVibrate = () => {
  const isBuzzEnabled =
    typeof localStorage === 'undefined'
      ? true
      : localStorage.getItem('queuebuzz_buzz_enabled') !== 'false'
  if (!isBuzzEnabled) return

  try {
    const ctx = getAudioContext()
    if (ctx) {
      if (ctx.state === 'suspended') {
        if (activeGestureResume) {
          return
        }
        const resume = () => {
          ctx.resume().then(() => {
            playRingtone(ctx)
            cleanupGestureResume()
          })
        }
        activeGestureResume = resume
        document.addEventListener('click', resume)
        document.addEventListener('touchstart', resume)
        return
      }

      playRingtone(ctx)
    }
  } catch {
    // Ignore audio autoplay restrictions or browser limitations
  }

  // Vibrate using Vibration API
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300])
    }
  } catch {
    // Ignore vibration restrictions or browser limitations
  }
}

const cleanupGestureResume = () => {
  if (activeGestureResume) {
    document.removeEventListener('click', activeGestureResume)
    document.removeEventListener('touchstart', activeGestureResume)
    activeGestureResume = null
  }
}

const startAlertLoop = () => {
  playSoundAndVibrate()
  playCount = 1

  alertInterval = setInterval(() => {
    if (playCount < 20) {
      playSoundAndVibrate()
      playCount++
    } else {
      stopAlertLoop()
    }
  }, 2500)
}

const stopAlertLoop = () => {
  if (alertInterval) {
    clearInterval(alertInterval)
    alertInterval = null
  }
  if (audioCtx) {
    try {
      audioCtx.close()
    } catch {
      // Ignore context close failures
    }
    audioCtx = null
  }
}

// Keep screen awake and tab alive in background for real-time alerts
useWakeLock()
useBackgroundKeepAlive()

// Re-alert when user returns to the tab (e.g. after switching apps or unlocking phone)
function handleVisibilityReAlert() {
  if (
    document.visibilityState === 'visible' &&
    (status.value === 'CALLED' || status.value === 'ARRIVED') &&
    !alertInterval
  ) {
    startAlertLoop()
  }
}

onMounted(() => {
  startAlertLoop()
  document.addEventListener('visibilitychange', handleVisibilityReAlert)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityReAlert)
  disconnectEvents()
  stopAlertLoop()
  cleanupGestureResume()
})

const handleMainCta = async () => {
  if (status.value === 'ARRIVED') {
    isFinishModalOpen.value = true
  } else {
    isConfirming.value = true
    await confirmArrival()
    isConfirming.value = false
  }
  stopAlertLoop()
}

const handleFinishService = async () => {
  const tNumber = ticketDisplay.value || ticketNumber.value
  isFinishing.value = true
  const success = await finishService()
  isFinishing.value = false
  if (success) {
    isFinishModalOpen.value = false
    isNavigatingAway.value = true
    router.replace({
      name: 'customer-served',
      params: router.currentRoute.value.params,
      query: { t: tNumber },
    })
  }
}
</script>

<template>
  <div class="relative flex flex-col">
    <!-- Blob decorations — Called screen specific (two large mint blobs) -->
    <div
      class="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-mint/16 blur-[80px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-10 h-[350px] w-[350px] rounded-full bg-mint/16 blur-[80px]"
    />

    <CustomerHeader
      v-if="activeQueue"
      :name="activeQueue.name"
      :profile-url="activeQueue.hostProfileImageUrl"
      :banner-url="activeQueue.hostBannerImageUrl"
    />
    <h1 v-else class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <div class="flex flex-col px-5 py-4">
      <!-- Heading section -->
      <div class="mt-2 text-center">
        <h2 class="font-body text-2xl font-semibold text-plum">Great news!</h2>
        <p class="mt-2 font-body text-base font-medium text-plum/60">Your turn has arrived.</p>
      </div>

      <ConnectionLostBanner />

      <!-- Chime Alert Banner -->
      <div
        class="mt-4 flex items-center justify-between rounded-2xl bg-mint-light/40 border border-mint/20 px-4 py-3 animate-pulse"
      >
        <div class="flex items-center gap-3">
          <!-- Beautiful pulsing sound/bell icon -->
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/10 text-plum animate-bounce"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.02 6.02 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div class="text-left">
            <p class="font-body text-sm font-semibold text-plum">
              Hurray Its your turn, Please head in.
            </p>
          </div>
        </div>
      </div>

      <!-- Ticket card -->
      <div
        class="relative mt-6 overflow-hidden rounded-[40px] border-2 border-mint bg-[#fdfcfe] p-6 text-center shadow-[0_20px_50px_rgba(0,229,160,0.12)]"
      >
        <!-- Decorative notches -->
        <div
          class="absolute -left-[7px] top-1/2 h-6 w-3.5 -translate-y-1/2 rounded-r-full bg-sand"
        />
        <div
          class="absolute -right-[7px] top-1/2 h-6 w-3.5 -translate-y-1/2 rounded-l-full bg-sand"
        />

        <p class="font-body text-sm font-normal uppercase tracking-[2.4px] text-plum/60">
          Your Ticket
        </p>
        <p class="mt-4 font-mono text-[92px] font-black leading-[92px] text-plum">
          {{ ticketNumberParts.prefix
          }}<template v-if="ticketNumberParts.suffix">-<br />{{ ticketNumber }}</template>
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
          class="mx-auto mt-2 flex items-center gap-1.5 px-4 py-2 font-body text-sm font-semibold text-plum-muted transition-opacity hover:opacity-80"
          :disabled="isSaving"
          @click="saveTicketAsImage"
        >
          {{ isSaved ? '✓ SAVED TO GALLERY' : 'SAVE TICKET IMAGE' }}
        </button>
      </div>

      <!-- Verification Code -->
      <div
        v-if="entry?.verifyCode"
        class="mt-4 rounded-2xl border border-plum-faint bg-white/60 px-5 py-4 text-center"
      >
        <p class="font-body text-xs uppercase tracking-[2.4px] text-plum/50">Verification Code</p>
        <p class="mt-1.5 font-mono text-2xl font-bold tracking-[0.3em] text-plum">
          {{ entry.verifyCode }}
        </p>
        <p class="mt-1 font-body text-xs text-plum-muted">Share this with the host if asked</p>
      </div>

      <!-- Main CTA Button (I'm Here / Service Finished) -->
      <button
        :disabled="isConfirming || isFinishing"
        :class="[
          'cursor-pointer mt-4 flex h-[68px] w-full items-center justify-center rounded-2xl font-body text-lg font-bold transition-all',
          status === 'ARRIVED'
            ? 'bg-plum text-sand shadow-lg border border-plum'
            : 'bg-mint text-on-mint shadow-[0_8px_10px_rgba(0,229,160,0.20),0_20px_25px_rgba(0,229,160,0.20)]',
          isConfirming || isFinishing ? 'cursor-not-allowed opacity-70' : '',
        ]"
        @click="handleMainCta"
      >
        <template v-if="isConfirming">Confirming…</template>
        <template v-else-if="isFinishing">Finishing…</template>
        <template v-else-if="status === 'ARRIVED'"> Service Finished? </template>
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
        @confirm="handleLeaveQueue"
      />

      <!-- Finish Service Confirmation Modal -->
      <LeaveConfirmationModal
        :is-open="isFinishModalOpen"
        title="Service Finished?"
        message="Are you sure you want to end your session? You can then rate your experience."
        confirm-text="Yes, Finished"
        variant="primary"
        @close="isFinishModalOpen = false"
        @confirm="handleFinishService"
      />

      <!-- Arrival QR Modal -->
      <EntryQrModal
        v-if="entry"
        :is-open="isQrModalOpen"
        :entry-id="entry.id"
        :ticket-no="ticketNumber"
        :verify-code="entry.verifyCode || ''"
        @close="isQrModalOpen = false"
      />

      <!-- Hidden Capture Template -->
      <TicketCaptureTemplate
        v-if="entry"
        :ticket-number="String(entry.ticketNo)"
        :queue-name="queueName"
        :join-date="formattedJoinDate"
      />
    </div>
  </div>
</template>
