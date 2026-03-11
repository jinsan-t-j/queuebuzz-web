<script setup>
/**
 * @component HistoryStatCard
 * @description Single stat card for history detail view — same spec as
 * DashboardStatCard but kept as a local component for the history module.
 *
 * @prop {String} value - The stat value to display.
 * @prop {String} label - The caption label (uppercase).
 * @prop {String} accent - Colour accent: 'mint' | 'warning' | 'danger' | 'none'.
 */

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
})
</script>

<template>
  <div
    class="rounded-2xl border border-plum/5 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <p
      class="font-body text-xs font-bold uppercase tracking-[0.6px] text-plum/40"
    >
      {{ label }}
    </p>
    <p
      :class="[
        'mt-2 font-display text-2xl font-light leading-tight',
        accent === 'mint' ? 'text-mint' : '',
        accent === 'warning' ? 'text-warning' : '',
        accent === 'danger' ? 'text-danger' : '',
        accent === 'none' ? 'text-plum' : '',
      ]"
    >
      {{ value }}
    </p>
  </div>
</template>
