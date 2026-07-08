<script setup lang="ts">
/**
 * @component QueueStatusView
 * @description TV-friendly live queue dashboard for physical TV monitors.
 * Displays the current serving ticket and upcoming tickets in real-time.
 */

import {
  AlertCircle,
  Clock,
  Maximize2,
  Minimize2,
  Sparkles,
  Tv,
  Volume2,
  VolumeX,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import QRCode from 'qrcode'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import { useLeaveGuard } from '@/composables/useLeaveGuard'
import { ENTRY_STATUS } from '@/modules/app/queue/constants'
import { useQueueStore } from '@/stores/queue.store'

const route = useRoute()
const queueStore = useQueueStore()

useLeaveGuard()
const { activeQueue, entries, isLoading, error } = storeToRefs(queueStore)

const queueId = computed(() => (route.params.queueId as string) || '')

const location = globalThis.location

// TV Customization Options
const isSoundEnabled = ref(true)
const textZoom = ref<'normal' | 'large' | 'huge'>('normal')
const isFullscreen = ref(false)
const isFlashing = ref(false)
const qrDataUrl = ref('')

// Live Clock
const clockString = ref('')
let clockInterval: ReturnType<typeof setInterval> | null = null

// Sound chime using browser AudioContext (zero-dependency)
function playChime() {
  if (!isSoundEnabled.value) return
  try {
    const AudioContextClass =
      globalThis.AudioContext ||
      (globalThis as unknown as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Bell high note 1
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.08, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.5)

    // Bell high note 2
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12) // A5
    gain2.gain.setValueAtTime(0.08, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.8)
  } catch {
    // Chime fallback silent catch
  }
}

let currentSpeechId = 0

// Text-to-Speech (Voice-over) using Web Speech API
function speakTicket(ticketNo: string) {
  if (!isSoundEnabled.value) return
  try {
    if (globalThis.window === undefined || !globalThis.speechSynthesis) return

    currentSpeechId++
    const mySpeechId = currentSpeechId
    globalThis.speechSynthesis.cancel()

    const text = `Ticket number ${ticketNo}`
    const repeatText = `I repeat, ticket number ${ticketNo}`

    // Set voice based on user's system locale and fallback preferences
    const userLocale = typeof navigator === 'undefined' ? 'en-IN' : navigator.language
    const [, regionPart] = userLocale.toLowerCase().split('-')
    const targetRegionLang = regionPart ? `en-${regionPart}` : 'en-in'

    const voices = globalThis.speechSynthesis.getVoices()
    const femaleVoicePatterns = [
      'veena', // macOS Indian English female
      'heera', // Windows Indian English female
      'samantha', // macOS standard clear female
      'zira', // Windows standard clear female
      'karen', // macOS Australian English female
      'tessa', // macOS South African English female
      'moira', // macOS Irish English female
      'female',
      'woman',
      'google us english', // Chrome/Android female
      'google uk english female',
    ]

    const getVoiceScore = (v: SpeechSynthesisVoice) => {
      let score = 0
      const nameLower = v.name.toLowerCase()
      const langLower = v.lang.toLowerCase().replace('_', '-')

      if (langLower === targetRegionLang) {
        score += 100
      } else if (regionPart && langLower.startsWith(`en-${regionPart}`)) {
        score += 80
      }

      if (langLower === 'en-in') {
        score += 50
      }

      const isFemale = femaleVoicePatterns.some((pattern) => nameLower.includes(pattern))
      if (isFemale) {
        score += 30
      }

      if (langLower.startsWith('en')) {
        score += 10
      }

      return score
    }

    const sortedVoices = [...voices]
      .map((v) => ({ voice: v, score: getVoiceScore(v) }))
      .sort((a, b) => b.score - a.score)

    const selectedVoice =
      sortedVoices.length > 0 && sortedVoices[0].score > 0 ? sortedVoices[0].voice : null

    const speakIteration = (count: number) => {
      if (count <= 0) return
      if (mySpeechId !== currentSpeechId) return
      if (globalThis.window === undefined || !globalThis.speechSynthesis) return

      const speechText = count === 1 ? repeatText : text
      const utterance = new SpeechSynthesisUtterance(speechText)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.rate = 0.7 // Slower speech rate for better comprehension over speaker systems
      utterance.pitch = 1

      utterance.onend = () => {
        if (mySpeechId !== currentSpeechId) return
        setTimeout(() => {
          if (mySpeechId !== currentSpeechId) return
          speakIteration(count - 1)
        }, 800)
      }

      globalThis.speechSynthesis.speak(utterance)
    }

    speakIteration(2)
  } catch {
    // TTS fallback silent catch
  }
}

// Trigger screen blink / flash
function triggerFlash() {
  isFlashing.value = true
  setTimeout(() => {
    isFlashing.value = false
  }, 2500)
}

// Compute currently called / serving guest
const activeCalls = computed(() => {
  return entries.value
    .filter((e) => e.status === ENTRY_STATUS.CALLED || e.status === ENTRY_STATUS.ARRIVED)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
})

const currentServing = computed(() => {
  return activeCalls.value[0] || null
})

const otherServing = computed(() => {
  return activeCalls.value.slice(1, 4)
})

// Join URL for QR Code
const joinUrl = computed(() => {
  if (!activeQueue.value) return ''
  const slugOrId = activeQueue.value.slug || activeQueue.value.id
  return `${globalThis.location.origin}/q/${slugOrId}`
})

// Watch called state to play sound & flash
watch(
  () => activeCalls.value.map((c) => c.ticketNo).join(','),
  (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal && newVal !== '') {
      playChime()
      triggerFlash()
      const nextTicket = activeCalls.value[0]
      if (nextTicket && nextTicket.ticketNo) {
        setTimeout(() => {
          speakTicket(String(nextTicket.ticketNo))
        }, 800)
      }
    }
  },
)

// Generate QR Code when URL changes
watch(
  joinUrl,
  async (newVal) => {
    if (!newVal) return
    try {
      qrDataUrl.value = await QRCode.toDataURL(newVal, {
        width: 600,
        margin: 1,
        color: {
          dark: '#1A0A2E', // text-plum
          light: '#FFFFFF',
        },
      })
    } catch {
      // QR Code fallback silent catch
    }
  },
  { immediate: true },
)

// Fullscreen helpers
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
    isFullscreen.value = false
  } else {
    document.documentElement
      .requestFullscreen()
      .then(() => {
        isFullscreen.value = true
      })
      .catch(() => {
        // Fullscreen request silent catch
      })
  }
}

// Watch fullscreen state changes from ESC key
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(async () => {
  if (queueId.value) {
    const queue = await queueStore.fetchPublicStatus(queueId.value)
    if (queue && queue.queue?.id) {
      queueStore.connectToPublicEvents(queue.queue.id)
    }
  }

  // Live clock interval
  const updateClock = () => {
    const d = new Date()
    clockString.value = d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  queueStore.disconnectLiveUpdates()
  if (clockInterval) clearInterval(clockInterval)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <div
    class="min-h-screen bg-sand px-6 py-8 md:px-10 md:py-10 text-plum font-body flex flex-col justify-between"
  >
    <!-- Background visual decorations -->
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full bg-mint-light/30 blur-[80px]"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-warning/10 blur-[90px]"
    />

    <!-- 1. LOADING STATE -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center flex-grow gap-4 z-10">
      <div class="h-12 w-12 rounded-full border-4 border-plum-faint border-t-mint animate-spin" />
      <p class="text-plum-muted font-body font-medium animate-pulse">Loading live dashboard...</p>
    </div>

    <!-- 2. ERROR STATE -->
    <div v-else-if="error" class="flex flex-col items-center justify-center flex-grow z-10">
      <div
        class="bg-white border border-plum-faint rounded-3xl p-10 max-w-md w-full shadow-[0_12px_50px_rgba(26,10,46,0.08)] flex flex-col items-center text-center gap-6"
      >
        <div
          class="h-16 w-16 bg-red-50 text-danger rounded-3xl flex items-center justify-center border border-red-100 shadow-xs"
        >
          <AlertCircle class="h-8 w-8" />
        </div>
        <h2 class="font-display font-bold text-2xl text-plum">Queue is currently offline</h2>
        <BaseButton variant="primary" @click="queueStore.fetchPublicStatus(queueId)">
          Try Again
        </BaseButton>
      </div>
    </div>

    <!-- 4. ACTIVE LIVE STATUS BOARD -->
    <div v-else-if="activeQueue" class="flex flex-col flex-grow justify-between gap-6 z-10">
      <!-- HEADER ROW -->
      <header
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-plum-faint pb-6"
      >
        <div class="flex items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-display font-bold text-2xl tracking-tight text-plum"
                >QueueBuzz</span
              >
              <BaseBadge variant="mint" class="animate-pulse">LIVE SCREEN</BaseBadge>
            </div>
            <h1 class="font-body font-semibold text-lg text-plum-muted mt-0.5">
              {{ activeQueue.name }}
            </h1>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full md:w-auto justify-between md:justify-end"
        >
          <!-- Real-Time clock -->
          <div
            class="bg-white border border-plum-faint px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl flex items-center gap-1.5 sm:gap-2 shadow-sm shrink-0"
          >
            <Clock class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-plum-muted" />
            <span
              class="font-mono text-plum font-semibold text-sm sm:text-base md:text-lg uppercase tracking-wide"
            >
              {{ clockString }}
            </span>
          </div>

          <!-- Quick TV display options -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <!-- Chime Toggle -->
            <button
              class="p-2 sm:p-3.5 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-sm"
              :class="
                isSoundEnabled
                  ? 'bg-white border-plum-faint text-plum hover:bg-plum-faint'
                  : 'bg-red-50 border-red-200 text-danger'
              "
              :title="isSoundEnabled ? 'Chime sound is active' : 'Chime is muted'"
              @click="isSoundEnabled = !isSoundEnabled"
            >
              <Volume2 v-if="isSoundEnabled" class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <VolumeX v-else class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>

            <!-- Text Zoom Selector -->
            <button
              class="px-2.5 py-2 sm:px-4 sm:py-3.5 rounded-2xl bg-white border border-plum-faint hover:bg-plum-faint text-plum font-semibold font-body text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer select-none"
              title="Change Text Size"
              @click="
                textZoom =
                  textZoom === 'normal' ? 'large' : textZoom === 'large' ? 'huge' : 'normal'
              "
            >
              <span class="text-xs text-plum-muted uppercase leading-5">Size:</span>
              <span class="capitalize leading-5">{{ textZoom }}</span>
            </button>

            <!-- Fullscreen -->
            <button
              class="p-2 sm:p-3.5 rounded-2xl bg-white border border-plum-faint hover:bg-plum-faint text-plum flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Toggle Fullscreen"
              @click="toggleFullscreen"
            >
              <Minimize2 v-if="isFullscreen" class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <Maximize2 v-else class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT GRID -->
      <main class="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow items-stretch my-4">
        <!-- LEFT PANEL: NOW SERVING (60%) -->
        <section class="lg:col-span-7 flex flex-col justify-between">
          <div class="flex flex-col h-full justify-between">
            <h2 class="font-body font-bold text-sm tracking-widest text-plum-muted uppercase mb-3">
              Now Serving
            </h2>

            <!-- Main Serve Card -->
            <BaseCard
              class="flex-grow flex flex-col items-center justify-center text-center p-8 md:p-12 transition-all duration-700 ease-out border"
              :class="[
                isFlashing
                  ? 'bg-mint-light border-mint border-4 shadow-[0_0_60px_rgba(0,229,160,0.4)] scale-[1.02]'
                  : 'bg-white border-plum-faint border-2 shadow-[0_8px_40px_rgba(26,10,46,0.04)]',
              ]"
            >
              <div v-if="currentServing" class="w-full flex flex-col items-center justify-center">
                <!-- Visual Bell Alert -->
                <div
                  v-if="isFlashing"
                  class="mb-6 bg-mint text-white px-6 py-2 rounded-full font-body font-bold tracking-wider animate-bounce flex items-center gap-2 text-sm shadow-md"
                >
                  <Sparkles class="h-4 w-4" /> NEW TICKET CALLED
                </div>

                <p
                  class="font-body text-sm font-semibold tracking-wider text-plum-muted uppercase mb-4"
                >
                  Please proceed to counter
                </p>

                <!-- Ticket Display with Dynamic Sizes -->
                <div
                  class="font-mono font-bold text-plum tracking-wider select-none"
                  :class="{
                    'text-7xl md:text-8xl lg:text-9xl': textZoom === 'normal',
                    'text-8xl md:text-9xl lg:text-[11rem]': textZoom === 'large',
                    'text-9xl md:text-[11rem] lg:text-[13rem]': textZoom === 'huge',
                  }"
                >
                  {{ currentServing.ticketNo }}
                </div>

                <!-- Repeat Button -->
                <div class="mt-8 flex justify-center">
                  <BaseButton
                    variant="outline"
                    size="sm"
                    class="flex items-center gap-2"
                    @click="speakTicket(String(currentServing.ticketNo))"
                  >
                    <Volume2 class="h-4 w-4 text-plum" />
                    <span>Repeat Announcement</span>
                  </BaseButton>
                </div>
              </div>

              <!-- Empty/Idle state -->
              <div
                v-else
                class="flex flex-col items-center justify-center text-center max-w-sm py-16 gap-4"
              >
                <div
                  class="h-20 w-20 rounded-3xl bg-sand flex items-center justify-center border border-plum-faint text-plum-muted"
                >
                  <Tv class="h-10 w-10 animate-pulse" />
                </div>
                <h3 class="font-display font-bold text-xl text-plum">Waiting for Host</h3>
                <p class="font-body text-sm text-plum-muted leading-relaxed">
                  No ticket is currently called. The next ticket will display here as soon as the
                  host calls them.
                </p>
              </div>
            </BaseCard>

            <!-- Other active calls (if any) -->
            <div v-if="otherServing.length > 0" class="mt-6">
              <h3
                class="font-body font-semibold text-xs tracking-wider text-plum-muted uppercase mb-3"
              >
                Recently Called Tickets
              </h3>
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="entry in otherServing"
                  :key="entry.id"
                  class="bg-white border border-plum-faint rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm"
                >
                  <span class="font-mono font-bold text-2xl text-plum-soft">{{
                    entry.ticketNo
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT PANEL: JOIN INFO (40%) -->
        <section class="lg:col-span-5 flex flex-col h-full">
          <!-- SCAN TO JOIN BOX -->
          <div class="flex flex-col h-full">
            <h2 class="font-body font-bold text-sm tracking-widest text-plum-muted uppercase mb-3">
              Scan to Join Queue
            </h2>

            <div
              class="bg-white border border-plum-faint rounded-3xl p-8 shadow-[0_8px_40px_rgba(26,10,46,0.04)] flex flex-col items-center justify-center gap-8 flex-grow h-full"
            >
              <!-- QR Image -->
              <div
                class="relative bg-white border border-plum-faint rounded-3xl shadow-xs shrink-0 flex items-center justify-center transition-all duration-300"
                :class="{
                  'p-3': textZoom === 'normal',
                  'p-4': textZoom === 'large',
                  'p-6': textZoom === 'huge',
                }"
              >
                <img
                  v-if="qrDataUrl"
                  :src="qrDataUrl"
                  alt="Join Queue QR"
                  class="select-none transition-all duration-300"
                  :class="{
                    'w-48 h-48 md:w-56 md:h-56': textZoom === 'normal',
                    'w-64 h-64 md:w-72 md:h-72': textZoom === 'large',
                    'w-80 h-80 md:w-96 md:h-96': textZoom === 'huge',
                  }"
                />
                <div
                  v-else
                  class="bg-plum-faint animate-pulse rounded-2xl transition-all duration-300"
                  :class="{
                    'w-48 h-48 md:w-56 md:h-56': textZoom === 'normal',
                    'w-64 h-64 md:w-72 md:h-72': textZoom === 'large',
                    'w-80 h-80 md:w-96 md:h-96': textZoom === 'huge',
                  }"
                />
              </div>

              <!-- Code details -->
              <div class="flex flex-col items-center text-center justify-center">
                <p class="font-body text-xs text-plum-muted font-bold tracking-wider mb-2">
                  OR VISIT {{ location.host }} AND ENTER
                </p>
                <div
                  class="font-mono font-bold text-plum bg-sand border border-plum-faint rounded-2xl tracking-widest shadow-xs select-all transition-all duration-300"
                  :class="{
                    'text-3xl px-6 py-3': textZoom === 'normal',
                    'text-4xl px-8 py-4': textZoom === 'large',
                    'text-5xl px-10 py-5': textZoom === 'huge',
                  }"
                >
                  {{ activeQueue.joinCode }}
                </div>
                <p
                  class="font-body text-plum-muted mt-4 leading-relaxed transition-all duration-300"
                  :class="{
                    'text-sm max-w-sm': textZoom === 'normal',
                    'text-base max-w-md': textZoom === 'large',
                    'text-lg max-w-lg': textZoom === 'huge',
                  }"
                >
                  Scan on your smartphone to join virtually, check live status, and skip the wait
                  line.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- TV FOOTER WATERMARK -->
      <footer
        class="flex items-center justify-between border-t border-plum-faint pt-4 text-xs font-body text-plum-muted"
      >
        <div class="flex items-center gap-1">
          <span>Powered by</span>
          <span class="font-display font-bold text-plum">QueueBuzz</span>
        </div>
      </footer>
    </div>
  </div>
</template>
