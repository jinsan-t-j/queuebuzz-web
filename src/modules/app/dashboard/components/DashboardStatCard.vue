<script setup>
/**
 * @component DashboardStatCard
 * @description Single stat card with large number value, caption label,
 * and optional accent colour. Used 4× in the stats row.
 *
 * @prop {String} value - The stat value to display.
 * @prop {String} label - The caption label (uppercase).
 * @prop {String} accent - Colour accent: 'mint' | 'warning' | 'danger' | 'none'.
 * @prop {Boolean} isLoading - Show skeleton shimmer instead of content.
 */

// 6. Props
defineProps({
  value: {
    type: String,
    default: '—',
  },
  label: {
    type: String,
    default: '',
  },
  accent: {
    type: String,
    default: 'none',
    validator: (v) => ['mint', 'warning', 'danger', 'none'].includes(v),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="rounded-xl border border-plum-faint bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <!-- Loading skeleton -->
    <template v-if="isLoading">
      <div class="h-3 w-20 rounded bg-plum-faint animate-pulse" />
      <div class="mt-3 h-7 w-16 rounded bg-plum-faint animate-pulse" />
    </template>

    <!-- Content -->
    <template v-else>
      <p class="font-body text-sm font-semibold uppercase tracking-[0.6px] text-plum-muted">
        {{ label }}
      </p>
      <p
        :class="[
          'mt-2 font-display text-[27px] font-normal leading-tight',
          accent === 'mint' ? 'text-mint' : '',
          accent === 'warning' ? 'text-warning' : '',
          accent === 'danger' ? 'text-danger' : '',
          accent === 'none' ? 'text-plum' : '',
        ]"
      >
        {{ value }}
      </p>
    </template>
  </div>
</template>
