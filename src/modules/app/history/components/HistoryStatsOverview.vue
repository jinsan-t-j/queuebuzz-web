<script setup lang="ts">
/**
 * @component HistoryStatsOverview
 * @description Renders the summary statistics for the history view.
 */
import BaseCard from '@/components/base/BaseCard.vue'

interface Summary {
  totalSessions: number
  totalServed: number
  avgSessionLength: string
}

defineProps<{
  summary: Summary | null
  isLoading: boolean
}>()
</script>

<template>
  <div
    class="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible scrollbar-hidden pb-2 md:pb-0 px-0.5"
  >
    <!-- Total Sessions -->
    <BaseCard
      class="min-w-[160px] flex-1 p-4 sm:p-6 border border-plum-faint shadow-none bg-white rounded-2xl sm:rounded-3xl"
    >
      <div v-if="isLoading" class="animate-pulse space-y-2">
        <div class="h-2.5 w-16 bg-sand rounded" />
        <div class="h-6 w-12 bg-sand rounded" />
      </div>
      <template v-else>
        <p
          class="font-body text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-plum-muted truncate"
        >
          Total Sessions
        </p>
        <p class="font-mono text-xl sm:text-3xl font-black text-plum mt-1 sm:mt-2">
          {{ summary?.totalSessions ?? 0 }}
        </p>
      </template>
    </BaseCard>

    <!-- Guests Served -->
    <BaseCard
      class="min-w-[160px] flex-1 p-4 sm:p-6 border border-plum-faint shadow-none bg-white rounded-2xl sm:rounded-3xl"
    >
      <div v-if="isLoading" class="animate-pulse space-y-2">
        <div class="h-2.5 w-16 bg-sand rounded" />
        <div class="h-6 w-12 bg-sand rounded" />
      </div>
      <template v-else>
        <p
          class="font-body text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-plum-muted truncate"
        >
          Guests Served
        </p>
        <p class="font-mono text-xl sm:text-3xl font-black text-plum mt-1 sm:mt-2">
          {{ summary?.totalServed?.toLocaleString() ?? 0 }}
        </p>
      </template>
    </BaseCard>

    <!-- Avg Session Length -->
    <BaseCard
      class="min-w-[160px] flex-1 p-4 sm:p-6 border border-plum-faint shadow-none bg-white rounded-2xl sm:rounded-3xl"
    >
      <div v-if="isLoading" class="animate-pulse space-y-2">
        <div class="h-2.5 w-16 bg-sand rounded" />
        <div class="h-6 w-12 bg-sand rounded" />
      </div>
      <template v-else>
        <p
          class="font-body text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-plum-muted truncate"
        >
          Avg. Session
        </p>
        <p class="font-mono text-xl sm:text-3xl font-black text-mint-dark mt-1 sm:mt-2">
          {{ summary?.avgSessionLength ?? '0m' }}
        </p>
      </template>
    </BaseCard>
  </div>
</template>
