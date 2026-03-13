<script setup>
/**
 * @component JoinQueueForm
 * @description Join queue form with name input, buzz toggle, email recovery accordion,
 * and queue stats header.
 *
 * @prop {String} queueName - Name of the queue.
 * @prop {Number} peopleInQueue - Number of people currently in queue.
 * @prop {Number} estWaitMin - Estimated wait time in minutes.
 * @emits {join-queue} - Emitted with { name, buzzEnabled, email } payload.
 * @emits {go-to-join-by-code} - Emitted when "Join now" link is clicked.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 5. Component imports
import BaseToggle from '@/components/base/BaseToggle.vue'
import ClockFilledIcon from '@/assets/icons/clock-filled.svg?component'
import ArrowRightBoldIcon from '@/assets/icons/arrow-right-bold.svg?component'
import { User, AtSign, ChevronDown, Info } from 'lucide-vue-next'

// 6. Props
defineProps({
  queueName: { type: String, default: 'Chai Point · Koramangala' },
  peopleInQueue: { type: Number, default: 23 },
  estWaitMin: { type: Number, default: 35 },
})

// 7. Emits
const emit = defineEmits(['join-queue', 'go-to-join-by-code'])

// 9. Reactive state
const displayName = ref('')
const buzzEnabled = ref(true)
const email = ref('')
const isEmailExpanded = ref(false)
const isJoining = ref(false)

// 11. Methods
function toggleEmail() {
  isEmailExpanded.value = !isEmailExpanded.value
}

async function handleJoin() {
  isJoining.value = true
  emit('join-queue', {
    name: displayName.value || 'Guest',
    buzzEnabled: buzzEnabled.value,
    email: email.value,
  })
}
</script>

<template>
  <div class="flex flex-col px-5 py-4">
    <!-- Stats card -->
    <div class="rounded-3xl border border-plum-faint bg-white p-5 text-center">
      <p class="font-body text-xs font-semibold uppercase tracking-[2.4px] text-plum-muted">
        People in queue
      </p>
      <p class="mt-2.5 font-display text-[84px] font-normal leading-[84px] text-plum">
        {{ peopleInQueue }}
      </p>
      <div class="mx-auto mt-2.5 flex w-fit items-center gap-2 rounded-full border border-plum-faint/50 bg-sand px-4 py-2">
        <ClockFilledIcon class="h-4 w-4 text-mint" />
        <span class="font-body text-lg font-bold text-plum">~{{ estWaitMin }} min</span>
        <span class="font-body text-lg text-plum-muted">Wait</span>
      </div>
      <p class="mt-2.5 font-body text-[9px] leading-snug text-plum-muted">
        Your wait time is estimated,<br />
        it may slightly shift as the queue moves.
      </p>
    </div>

    <!-- Section heading -->
    <h2 class="mt-8 font-body text-2xl font-bold text-plum">Secure your spot</h2>

    <!-- Name input card -->
    <div class="mt-6 flex items-start gap-4 rounded-3xl border border-plum-faint bg-white p-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum-faint">
        <User class="h-4 w-4 text-plum-muted" />
      </div>
      <div class="flex-1">
        <input
          v-model="displayName"
          type="text"
          placeholder="What should we call you?"
          class="w-full border-none bg-transparent font-body text-[17px] text-plum placeholder:text-plum-muted/40 focus:outline-none"
        />
        <p class="mt-1 font-body text-[11px] text-plum-muted">Appears as Guest if skipped</p>
      </div>
    </div>

    <!-- Buzz toggle card -->
    <div class="mt-6 flex items-center justify-between rounded-3xl border border-plum-faint bg-white p-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-light">
          <svg class="h-5 w-5 text-mint" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C10.9 2 10 2.9 10 4V4.29C7.12 5.15 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.15 14 4.29V4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" />
          </svg>
        </div>
        <div>
          <p class="font-body text-[15px] font-semibold text-plum">Buzz me when ready</p>
          <p class="font-body text-xs text-plum-muted">Get a push notification</p>
        </div>
      </div>
      <BaseToggle v-model="buzzEnabled" />
    </div>

    <!-- Email recovery accordion -->
    <div class="mt-6">
      <!-- Header row -->
      <button
        class="flex w-full cursor-pointer items-center gap-4 py-4"
        @click="toggleEmail"
      >
        <AtSign class="h-4 w-4 shrink-0 text-plum-muted" />
        <span class="flex-1 text-left font-body text-sm font-medium text-plum-muted">Add email for recovery</span>
        <ChevronDown
          :class="[
            'h-2.5 w-2.5 text-plum-muted transition-transform duration-200',
            isEmailExpanded ? 'rotate-180' : '',
          ]"
        />
      </button>

      <!-- Expanded panel -->
      <div v-show="isEmailExpanded" class="rounded-2xl border border-plum-faint bg-plum-faint/30 p-4">
        <input
          v-model="email"
          type="email"
          placeholder="your@email.com"
          class="w-full border-none bg-transparent font-body text-sm text-plum placeholder:text-plum-muted/60 focus:outline-none"
        />
        <div class="mt-3 flex items-start gap-2">
          <Info class="mt-0.5 h-3 w-3 shrink-0 text-plum-muted/80" />
          <p class="font-body text-xs leading-relaxed text-plum-muted/80">
            Receive updates &amp; recover your spot if you close
            the browser.
          </p>
        </div>
      </div>
    </div>

    <!-- Join CTA -->
    <button
      :disabled="isJoining"
      :class="[
        'mt-6 flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-mint font-body text-lg font-semibold text-plum shadow-[0_8px_24px_rgba(0,229,160,0.50)] transition-all',
        isJoining ? 'cursor-not-allowed opacity-70' : 'hover:shadow-[0_12px_32px_rgba(0,229,160,0.60)]',
      ]"
      @click="handleJoin"
    >
      {{ isJoining ? 'Joining…' : 'Join the Queue' }}
      <ArrowRightBoldIcon v-if="!isJoining" class="h-4 w-4 text-plum" />
    </button>

    <!-- Join by code link -->
    <p class="mt-5 text-center font-body text-sm text-plum-muted">
      Have an existing code?
      <button class="font-body text-sm text-plum-muted underline" @click="emit('go-to-join-by-code')">Join now.</button>
    </p>
  </div>
</template>
