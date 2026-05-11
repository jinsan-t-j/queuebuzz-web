<script setup lang="ts">
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

import { Activity, ArrowRight } from 'lucide-vue-next'

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
    class="group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border px-4 sm:px-6 py-4 transition-all duration-300 shadow-none"
    :class="isActive && !isLoading ? 'border-mint bg-mint-light' : 'border-plum-faint bg-white'"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="flex w-full items-center justify-between animate-pulse">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-xl bg-sand" />
        <div class="flex flex-col gap-1.5">
          <div class="h-4 w-32 rounded bg-sand" />
          <div class="h-3 w-20 rounded bg-sand" />
        </div>
      </div>
      <div class="h-10 w-28 rounded-full bg-sand" />
    </div>

    <!-- Content State -->
    <template v-else>
      <div class="flex items-center gap-4 min-w-0">
        <!-- Lively Status Indicator -->
        <div class="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <div
            v-if="isActive"
            class="absolute inset-0 animate-ping rounded-full bg-mint/20 opacity-75"
          />
          <div
            :class="[
              'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 border border-plum-faint',
              isActive ? 'bg-mint text-on-mint' : 'bg-sand text-plum-muted',
            ]"
          >
            <Activity class="h-5 w-5" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2 min-w-0">
            <span
              v-if="isActive"
              class="inline-flex shrink-0 items-center rounded-full bg-plum px-2 py-0.5 font-body text-[10px] font-black uppercase tracking-wider text-sand"
            >
              Live
            </span>
            <span class="font-display text-sm font-black text-plum truncate sm:text-base">
              {{ isActive ? queueName : 'No active session' }}
            </span>
          </div>
          <p v-if="isActive" class="mt-0.5 font-body text-[12px] text-plum sm:text-[13px]">
            <span class="hidden sm:inline">Started </span>
            <span class="font-black text-plum">{{ startedAt }}</span>
            <span class="mx-1.5 opacity-30">|</span>
            <span class="font-black text-mint-dark">{{ waitingCount }}</span>
            <span class="text-plum-muted sm:text-plum"> waiting</span>
          </p>
          <p v-else class="mt-0.5 font-body text-[12px] text-plum-muted sm:text-[13px]">
            Ready to start your day? Launch a new queue.
          </p>
        </div>
      </div>

      <!-- Remodified Action Button -->
      <router-link
        id="start-session-link"
        :to="'/dashboard/queue'"
        :class="[
          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-display text-sm font-black transition-all duration-300 sm:w-auto sm:rounded-full sm:py-2.5',
          'bg-plum text-sand hover:bg-mint hover:text-on-mint shadow-none',
        ]"
      >
        {{ isActive ? 'Manage Live' : 'Start Session' }}
        <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </router-link>
    </template>
  </div>
</template>
