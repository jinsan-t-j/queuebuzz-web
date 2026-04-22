<script setup>
/**
 * @component QueueStatusBar
 * @description Concise banner showing active queue status with quick console access.
 *
 * @prop {String} queueName - Name of the active queue.
 * @prop {String} startedAt - Time the queue started.
 * @prop {Number|String} waitingCount - Number of customers currently waiting.
 * @prop {Boolean} isActive - Whether a queue is currently running.
 * @prop {Boolean} isLoading - Whether data is still fetching.
 */

import { ArrowRight, Activity } from 'lucide-vue-next'

defineProps({
  queueName: {
    type: String,
    default: 'Morning Session',
  },
  startedAt: {
    type: String,
    default: '--:--',
  },
  waitingCount: {
    type: [Number, String],
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['go-to-queue', 'start-queue'])
</script>

<template>
  <div
    :class="[
      'group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border px-6 py-4 transition-all duration-500',
      isActive && !isLoading
        ? 'border-mint/40 bg-gradient-to-r from-mint-light/30 via-white to-white shadow-[0_4px_20px_rgba(0,229,160,0.08)] hover:shadow-[0_8px_30px_rgba(0,229,160,0.12)]'
        : 'border-plum-faint bg-white',
    ]"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="flex w-full items-center justify-between animate-pulse">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-xl bg-plum-faint" />
        <div class="flex flex-col gap-1.5">
          <div class="h-4 w-32 rounded bg-plum-faint" />
          <div class="h-3 w-20 rounded bg-plum-faint" />
        </div>
      </div>
      <div class="h-10 w-28 rounded-full bg-plum-faint" />
    </div>

    <!-- Content State -->
    <template v-else>
      <div class="flex items-center gap-4">
        <!-- Lively Status Indicator -->
        <div class="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <div
            v-if="isActive"
            class="absolute inset-0 animate-ping rounded-full bg-mint/20 opacity-75"
          />
          <div
            :class="[
              'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500',
              isActive ? 'bg-mint-light border border-mint/20' : 'bg-plum-faint',
            ]"
          >
            <Activity :class="['h-5 w-5', isActive ? 'text-mint' : 'text-plum-muted']" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span
              v-if="isActive"
              class="inline-flex items-center rounded-full bg-mint px-2 py-0.5 font-body text-[10px] font-black uppercase tracking-wider text-plum"
            >
              Live
            </span>
            <span class="font-display text-base font-bold text-plum">
              {{ isActive ? queueName : 'No active session' }}
            </span>
          </div>
          <p v-if="isActive" class="mt-0.5 font-body text-xs text-plum-muted">
            Started <span class="font-semibold text-plum">{{ startedAt }}</span>
            <span class="mx-2 opacity-30">|</span>
            <span class="font-bold text-mint">{{ waitingCount }} customers</span> waiting
          </p>
          <p v-else class="mt-0.5 font-body text-xs text-plum-muted">
            Ready to start your day? Launch a new queue.
          </p>
        </div>
      </div>

      <!-- Remodified Action Button -->
      <router-link
        :to="'/dashboard/queue'"
        :class="[
          'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-display text-sm font-bold transition-all duration-300',
          isActive
            ? 'bg-mint text-plum hover:bg-mint-dark shadow-lg shadow-mint/20 hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-plum text-sand hover:bg-plum-soft',
        ]"
      >
        {{ isActive ? 'Manage Live' : 'Start Session' }}
        <ArrowRight
          :class="[
            'h-4 w-4 transition-transform duration-300',
            isActive ? 'group-hover:translate-x-1' : 'group-hover:translate-x-0.5',
          ]"
        />
      </router-link>
    </template>
  </div>
</template>
