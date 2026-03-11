<script setup>
/**
 * @component HistoryQueueTimeline
 * @description Vertical timeline showing chronological queue events
 * with coloured dots by event type.
 *
 * @prop {Array} events - Array of { time, label, sub, type }.
 *   type: 'success' | 'warning' | 'danger'
 */

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})

function dotColor(type) {
  const map = {
    success: 'bg-mint border-white',
    warning: 'bg-warning border-white',
    danger: 'bg-plum border-white',
  }
  return map[type] || map.success
}

function lineColor(type) {
  const map = {
    success: 'bg-mint',
    warning: 'bg-plum/20',
    danger: 'bg-plum',
  }
  return map[type] || map.success
}
</script>

<template>
  <div
    class="rounded-2xl border border-plum/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <h3 class="font-display text-xl font-bold text-plum">Queue Timeline</h3>

    <div class="relative mt-8 ml-1.5">
      <!-- Vertical line -->
      <div
        class="absolute left-[5px] top-1 bottom-1 w-0.5 bg-plum/10"
      />

      <!-- Events -->
      <div class="flex flex-col gap-5">
        <div
          v-for="(event, idx) in events"
          :key="idx"
          class="relative flex gap-6 pl-8"
        >
          <!-- Dot -->
          <div
            :class="[
              'absolute left-0 top-0.5 h-3 w-3 rounded-full border-2',
              dotColor(event.type),
            ]"
          />

          <!-- Content -->
          <div class="flex flex-col">
            <span class="font-mono text-xs text-plum/40">
              {{ event.time }}
            </span>
            <span class="font-body text-sm font-bold text-plum">
              {{ event.label }}
            </span>
            <span
              v-if="event.sub"
              class="font-body text-xs text-plum-muted"
            >
              {{ event.sub }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
