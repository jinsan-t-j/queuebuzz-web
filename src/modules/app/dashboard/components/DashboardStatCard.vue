<script setup lang="ts">
/**
 * @component DashboardStatCard
 * @description Concise stat card with refined typography.
 *
 * @prop {String} value - The stat value to display.
 * @prop {String} label - The caption label.
 * @prop {String} accent - Colour accent: 'mint' | 'warning' | 'danger' | 'none'.
 * @prop {Boolean} isLoading - Show skeleton shimmer.
 */

withDefaults(
  defineProps<{
    value?: string
    label?: string
    accent?: 'mint' | 'warning' | 'danger' | 'none'
    isLoading?: boolean
  }>(),
  {
    value: '—',
    label: '',
    accent: 'none',
    isLoading: false,
  },
)
</script>

<template>
  <div
    class="group relative flex flex-col justify-between rounded-2xl border border-plum-faint bg-white p-4 transition-all duration-200 hover:border-plum"
  >
    <!-- Loading State -->
    <template v-if="isLoading">
      <div class="h-2.5 w-12 rounded bg-plum-faint animate-pulse" />
      <div class="mt-2 h-7 w-16 rounded bg-plum-faint animate-pulse" />
    </template>

    <!-- Content -->
    <template v-else>
      <p class="font-body text-[10px] font-bold uppercase tracking-wider text-plum-muted">
        {{ label }}
      </p>
      <p
        :class="[
          'mt-1 font-display text-2xl font-bold tracking-tight',
          accent === 'mint' ? 'text-mint' : 'text-plum',
        ]"
      >
        {{ value }}
      </p>
    </template>
  </div>
</template>
