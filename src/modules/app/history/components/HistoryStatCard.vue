<script setup lang="ts">
/**
 * @component HistoryStatCard
 * @description Single stat card for history detail view — same spec as
 * DashboardStatCard but kept as a local component for the history module.
 *
 * @prop {String} value - The stat value to display.
 * @prop {String} label - The caption label (uppercase).
 * @prop {String} accent - Colour accent: 'mint' | 'warning' | 'danger' | 'none'.
 */

withDefaults(
  defineProps<{
    value?: string
    label?: string
    accent?: 'mint' | 'warning' | 'danger' | 'none'
  }>(),
  {
    value: '—',
    label: '',
    accent: 'none',
  },
)
</script>

<template>
  <div class="rounded-2xl border border-plum-faint bg-white p-5">
    <p class="font-body text-[11px] font-black uppercase tracking-[1px] text-plum-muted">
      {{ label }}
    </p>
    <p
      :class="[
        'mt-2 font-display text-2xl font-black leading-tight',
        accent === 'mint' ? 'text-mint-dark' : '',
        accent === 'warning' ? 'text-warning-dark' : '',
        accent === 'danger' ? 'text-danger-dark' : '',
        accent === 'none' ? 'text-plum' : '',
      ]"
    >
      {{ value }}
    </p>
  </div>
</template>
