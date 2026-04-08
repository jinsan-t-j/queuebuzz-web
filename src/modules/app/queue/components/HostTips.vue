<script setup lang="ts">
/**
 * @component HostTips
 * @description A small floating tip popover that rolls through different usage tips.
 * Includes "Do not show again" persistence.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import CloseIcon from '@/assets/icons/close-x.svg?component'
import LightningIcon from '@/assets/icons/lightning.svg?component'

const TIPS = [
  'Did you know? You can enable <strong>Strict Calling Mode</strong> in settings to enforce guest order.',
  'You can add guests manually using the <strong>Add Guest</strong> button for walk-ins without phones.',
  'Keep your queue active! Queues expire after 24 hours of inactivity.',
  'Share your queue link via WhatsApp or QR code to let guests join from anywhere.',
  'Need to take a break? Use the <strong>Pause</strong> button to temporarily stop new joins.',
]

const currentTipIndex = ref(0)
const isVisible = ref(false)
const isPermanentlyHidden = ref(false)
const timerIds: ReturnType<typeof setTimeout>[] = []

function trackTimer(id: ReturnType<typeof setTimeout>) {
  timerIds.push(id)
  return id
}

function clearAllTimers() {
  for (const id of timerIds) clearTimeout(id)
  timerIds.length = 0
}

function dismiss() {
  isVisible.value = false
}

function hidePermanently() {
  localStorage.setItem('queuebuzz_hide_host_tips', 'true')
  isPermanentlyHidden.value = true
  isVisible.value = false
  clearAllTimers()
}

function scheduleAutoHide() {
  trackTimer(
    setTimeout(() => {
      if (isVisible.value) isVisible.value = false
      scheduleNextTip()
    }, 10000),
  )
}

function scheduleNextTip() {
  if (isPermanentlyHidden.value) return

  const delay = Math.floor(Math.random() * (90000 - 45000 + 1) + 45000)

  trackTimer(
    setTimeout(() => {
      currentTipIndex.value = (currentTipIndex.value + 1) % TIPS.length
      isVisible.value = true
      scheduleAutoHide()
    }, delay),
  )
}

onMounted(() => {
  isPermanentlyHidden.value = localStorage.getItem('queuebuzz_hide_host_tips') === 'true'
  if (!isPermanentlyHidden.value) {
    trackTimer(
      setTimeout(() => {
        isVisible.value = true
        scheduleAutoHide()
      }, 5000),
    )
  }
})

onUnmounted(() => {
  clearAllTimers()
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="-translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-4 opacity-0"
  >
    <div
      v-if="isVisible"
      :key="currentTipIndex"
      class="fixed top-24 right-8 z-[60] w-[440px] rounded-2xl border border-plum/10 bg-white p-4 shadow-[0_20px_50px_rgba(26,10,46,0.15)] overflow-hidden"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mint/10 text-mint"
        >
          <LightningIcon class="h-4 w-4" />
        </div>

        <div class="flex-1 pr-4">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p class="font-body text-sm leading-snug text-plum" v-html="TIPS[currentTipIndex]" />

          <button
            class="mt-2 font-body text-sm font-bold uppercase tracking-wider text-plum/30 transition-colors hover:text-danger cursor-pointer"
            @click="hidePermanently"
          >
            Do not show again
          </button>
        </div>

        <button
          class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-sand transition-colors cursor-pointer"
          @click="dismiss"
        >
          <CloseIcon class="h-3 text-plum/30" />
        </button>
      </div>

      <!-- Decorative progress bar for the 10s timeout -->
      <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-plum/5">
        <div class="h-full bg-mint tip-progress-fill" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tip-progress-fill {
  width: 0%;
  animation: tip-progress 10s linear forwards;
  transform-origin: left;
}

@keyframes tip-progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
</style>
