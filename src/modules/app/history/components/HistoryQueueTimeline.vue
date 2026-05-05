<script setup lang="ts">
/**
 * @component HistoryQueueTimeline
 * @description Vertical timeline showing chronological queue events
 * with coloured dots by event type.
 *
 * @prop {Array} events - Array of { time, label, sub, type }.
 *   type: 'success' | 'warning' | 'danger'
 */

interface TimelineEvent {
  time: string
  label: string
  sub?: string
  type?: 'success' | 'warning' | 'danger'
}

withDefaults(
  defineProps<{
    events?: TimelineEvent[]
  }>(),
  {
    events: () => [],
  },
)

function dotColor(type?: string) {
  const map: Record<string, string> = {
    success: 'bg-mint border-white',
    warning: 'bg-warning border-white',
    danger: 'bg-plum border-white',
  }
  return type && map[type] ? map[type] : map.success
}
</script>

<template>
  <div class="rounded-2xl border border-plum-faint bg-white p-6">
    <h3 class="font-display text-xl font-black text-plum">Queue Timeline</h3>

    <div class="relative mt-8 ml-1.5">
      <!-- Vertical line -->
      <div class="absolute left-[5px] top-1 bottom-1 w-[1px] bg-plum-faint" />

      <!-- Events -->
      <div class="flex flex-col gap-6">
        <div v-for="(event, idx) in events" :key="idx" class="relative flex gap-6 pl-8">
          <!-- Dot -->
          <div
            :class="[
              'absolute left-0 top-1 h-2.5 w-2.5 rounded-full border border-plum-faint z-10',
              dotColor(event.type),
            ]"
          />

          <!-- Content -->
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[10px] text-plum-muted font-black uppercase tracking-wider">
              {{ event.time }}
            </span>
            <span class="font-body text-sm font-black text-plum leading-tight">
              {{ event.label }}
            </span>
            <span v-if="event.sub" class="font-body text-xs text-plum-muted font-medium">
              {{ event.sub }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
