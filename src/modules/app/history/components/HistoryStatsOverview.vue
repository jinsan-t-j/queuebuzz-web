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
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Total Sessions -->
    <BaseCard class="p-6 relative overflow-hidden group">
      <div v-if="isLoading" class="animate-pulse space-y-3">
        <div class="h-3 w-24 bg-plum-faint rounded" />
        <div class="h-8 w-16 bg-plum-faint rounded" />
      </div>
      <template v-else>
        <p
          class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted group-hover:text-plum transition-colors"
        >
          Total Sessions
        </p>
        <p class="font-mono text-3xl font-bold text-plum mt-2">
          {{ summary?.totalSessions ?? 0 }}
        </p>
      </template>
    </BaseCard>

    <!-- Guests Served -->
    <BaseCard class="p-6 relative overflow-hidden group">
      <div v-if="isLoading" class="animate-pulse space-y-3">
        <div class="h-3 w-24 bg-plum-faint rounded" />
        <div class="h-8 w-16 bg-plum-faint rounded" />
      </div>
      <template v-else>
        <p
          class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted group-hover:text-plum transition-colors"
        >
          Guests Served
        </p>
        <p class="font-mono text-3xl font-bold text-plum mt-2">
          {{ summary?.totalServed?.toLocaleString() ?? 0 }}
        </p>
      </template>
    </BaseCard>

    <!-- Avg Session Length -->
    <BaseCard class="p-6 relative overflow-hidden group border-mint/20">
      <div v-if="isLoading" class="animate-pulse space-y-3">
        <div class="h-3 w-24 bg-plum-faint rounded" />
        <div class="h-8 w-16 bg-plum-faint rounded" />
      </div>
      <template v-else>
        <p
          class="font-body text-xs font-semibold uppercase tracking-wider text-plum-muted group-hover:text-mint transition-colors"
        >
          Avg. Session Duration
        </p>
        <p class="font-mono text-3xl font-bold text-mint mt-2">
          {{ summary?.avgSessionLength ?? '0m' }}
        </p>
      </template>
    </BaseCard>
  </div>
</template>
