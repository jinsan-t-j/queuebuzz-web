<script setup>
/**
 * @component QueueStatusBar
 * @description Slim bar showing active queue status or inactive state.
 * Navigation notice only — not an operational panel.
 *
 * @prop {String} queueName - Name of the active queue.
 * @prop {String} startedAt - Time the queue started (e.g. "9:14 AM").
 * @prop {Boolean} isActive - Whether a queue is currently running.
 * @emits {go-to-queue} - User wants to navigate to live queue.
 * @emits {start-queue} - User wants to start a new queue.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import { ArrowRight } from 'lucide-vue-next'

// 6. Props
defineProps({
  queueName: {
    type: String,
    default: 'Morning Consultation',
  },
  startedAt: {
    type: String,
    default: '9:14 AM',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

// 7. Emits
const emit = defineEmits(['go-to-queue', 'start-queue'])
</script>

<template>
  <div
    class="flex items-center justify-between rounded-2xl border border-plum/5 bg-white px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <div class="flex items-center gap-4">
      <!-- Pulsing dot -->
      <span
        :class="[
          'relative flex h-3 w-3',
        ]"
      >
        <span
          v-if="isActive"
          class="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75"
        />
        <span
          :class="[
            'relative inline-flex h-3 w-3 rounded-full',
            isActive ? 'bg-mint' : 'bg-plum-faint',
          ]"
        />
      </span>

      <div class="flex flex-col gap-0.5">
        <p class="font-body text-sm text-plum">
          {{ isActive ? `${queueName} is live` : 'No queue running' }}
        </p>
        <p
          v-if="isActive"
          class="font-body text-xs font-light text-plum-muted"
        >
          Started {{ startedAt }}
        </p>
      </div>
    </div>

    <button
      class="inline-flex items-center gap-2 rounded-xl bg-mint/80 px-5 py-2 font-body text-sm font-bold text-plum transition-colors hover:bg-mint"
      @click="isActive ? emit('go-to-queue') : emit('start-queue')"
    >
      {{ isActive ? 'Go to live queue' : 'Start a Queue' }}
      <ArrowRight class="h-3 w-3" />
    </button>
  </div>
</template>
