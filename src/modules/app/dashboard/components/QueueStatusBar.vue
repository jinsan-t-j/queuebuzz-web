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
      'group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border px-6 py-4 transition-all duration-300 shadow-none',
      isActive && !isLoading ? 'border-mint bg-mint-light' : 'border-plum-faint bg-white',
    ]"
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
      <div class="flex items-center gap-4">
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
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span
              v-if="isActive"
              class="inline-flex items-center rounded-full bg-plum px-2 py-0.5 font-body text-[10px] font-black uppercase tracking-wider text-sand"
            >
              Live
            </span>
            <span class="font-display text-base font-black text-plum">
              {{ isActive ? queueName : 'No active session' }}
            </span>
          </div>
          <p v-if="isActive" class="mt-0.5 font-body text-[13px] text-plum">
            Started <span class="font-black text-plum">{{ startedAt }}</span>
            <span class="mx-2 opacity-30">|</span>
            <span class="font-black text-mint-dark">{{ waitingCount }} customers</span> waiting
          </p>
          <p v-else class="mt-0.5 font-body text-[13px] text-plum-muted">
            Ready to start your day? Launch a new queue.
          </p>
        </div>
      </div>

      <!-- Remodified Action Button -->
      <router-link
        :to="'/dashboard/queue'"
        :class="[
          'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-display text-sm font-black transition-all duration-300',
          isActive
            ? 'bg-plum text-sand hover:bg-mint hover:text-on-mint shadow-none'
            : 'bg-plum text-sand hover:bg-mint hover:text-on-mint shadow-none',
        ]"
      >
        {{ isActive ? 'Manage Live' : 'Start Session' }}
        <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </router-link>
    </template>
  </div>
</template>
