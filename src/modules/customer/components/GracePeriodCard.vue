<script setup>
/**
 * @component GracePeriodCard
 * @description Countdown card shown during idle/grace period when customer may have missed their turn.
 *
 * @prop {Number} initialSeconds - Starting countdown value.
 * @prop {String} ticketNumber - Ticket number.
 * @emits {confirmed-still-here} - Customer confirmed presence.
 * @emits {grace-period-expired} - Countdown reached zero.
 * @emits {leave-queue} - Customer chose to leave.
 */

// 1. Vue core imports
import { ref, onMounted, onUnmounted } from 'vue'

// 4. Local composables
import { useCustomer } from '@/modules/customer/composables/useCustomer'

// 5. Component imports
import ClockWarningOrangeIcon from '@/assets/icons/clock-warning-orange.svg?component'

// 6. Props
const props = defineProps({
  initialSeconds: { type: Number, default: 60 },
  ticketNumber: { type: String, default: 'Q-0042' },
})

// 7. Emits
const emit = defineEmits(['confirmed-still-here', 'grace-period-expired', 'leave-queue'])

// 8. Composable destructuring
const { confirmStillHere, isLoading } = useCustomer()

// 9. Reactive state
const secondsLeft = ref(props.initialSeconds)
let timer = null

// 12. Lifecycle hooks
onMounted(() => {
  timer = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      clearInterval(timer)
      emit('grace-period-expired')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div
    class="rounded-3xl border border-warning/45 bg-white/80 p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <!-- Clock icon -->
    <ClockWarningOrangeIcon class="mx-auto h-7 w-7" />

    <!-- Heading -->
    <h2 class="mt-2.5 font-body text-xl font-medium text-plum">Did you miss your turn?</h2>

    <!-- Countdown -->
    <p class="mt-2.5 font-display text-5xl font-semibold leading-none tracking-tight text-warning">
      {{ secondsLeft }}
    </p>

    <!-- Sub text -->
    <p class="mt-2.5 font-body text-sm font-normal uppercase tracking-[0.6px] text-plum/60">
      before your spot is given away
    </p>

    <!-- Info message -->
    <p class="mt-4 font-body text-sm font-medium text-[#64748b]">You're up — please head in now.</p>

    <!-- Confirm button -->
    <button
      :disabled="isLoading"
      :class="[
        'cursor-pointer mt-6 flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#2dd4bf] font-body text-lg font-bold text-plum shadow-[0_8px_10px_rgba(45,212,191,0.20),0_20px_25px_rgba(45,212,191,0.20)] transition-all',
        isLoading ? 'cursor-not-allowed opacity-70' : '',
      ]"
      @click="confirmStillHere"
    >
      {{ isLoading ? 'Confirming…' : "I'm Still Here" }}
    </button>

    <!-- Leave link -->
    <button class="mt-3 font-body text-sm font-semibold text-danger" @click="emit('leave-queue')">
      Leave Queue
    </button>
  </div>
</template>
