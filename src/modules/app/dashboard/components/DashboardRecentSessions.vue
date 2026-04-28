<script setup lang="ts">
/**
 * @component DashboardRecentSessions
 * @description List of recent queue sessions with name, date, duration, and served count.
 *
 * @prop {Array} sessions - Array of { id, name, date, duration, served }.
 * @prop {Boolean} isLoading - Show skeleton rows.
 * @emits {select-session} - Emitted with session id when a row is clicked.
 * @emits {view-history} - Emitted when "View Full History" is clicked.
 * @emits {create-first-queue} - Emitted when empty state CTA is clicked.
 */

import CalendarSessionIcon from '@/assets/icons/calendar-session.svg?component'
import ClockEmptyIcon from '@/assets/icons/clock-empty.svg?component'

interface Session {
  id: string
  name: string
  date: string
  duration: string
  served: number
}

withDefaults(
  defineProps<{
    sessions?: Session[]
    isLoading?: boolean
    hasActiveQueue?: boolean
  }>(),
  {
    sessions: () => [],
    isLoading: false,
    hasActiveQueue: false,
  },
)

const emit = defineEmits(['select-session', 'view-history', 'create-first-queue'])
</script>

<template>
  <div
    class="rounded-2xl border border-ash-border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
  >
    <h3 v-once class="font-body text-lg font-bold text-plum">Recent Sessions</h3>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="mt-6 flex flex-col gap-4">
      <div v-for="i in 3" v-once :key="i" class="flex items-center gap-4">
        <div class="h-9 w-9 rounded-lg bg-plum-faint animate-pulse" />
        <div class="flex-1">
          <div class="h-3 w-24 rounded bg-plum-faint animate-pulse" />
          <div class="mt-2 h-2.5 w-16 rounded bg-plum-faint animate-pulse" />
        </div>
        <div class="h-4 w-6 rounded bg-plum-faint animate-pulse" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="sessions.length === 0"
      v-once
      class="flex flex-col items-center justify-center py-12 gap-4"
    >
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint">
        <ClockEmptyIcon class="h-6 w-6 text-plum-muted" />
      </div>
      <p class="font-display text-base font-semibold text-plum">
        {{ hasActiveQueue ? 'First session active!' : 'No queues yet' }}
      </p>
      <p class="max-w-[216px] text-center font-body text-sm text-plum-muted leading-5">
        {{
          hasActiveQueue
            ? "Your active session will appear here once it's completed."
            : 'Create your first service queue to start tracking activity.'
        }}
      </p>
      <button
        v-if="!hasActiveQueue"
        class="font-body text-sm font-bold text-mint hover:text-mint-dark transition-colors"
        @click="emit('create-first-queue')"
      >
        Create first queue
      </button>
    </div>

    <!-- Session list -->
    <div v-else class="mt-6 flex flex-col gap-4">
      <button
        v-for="session in sessions"
        :key="session.id"
        v-memo="[session.id, session.served]"
        class="flex items-center gap-4 rounded-xl p-2 -mx-2 text-left transition-colors hover:bg-plum-faint/30"
        @click="emit('select-session', session.id)"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-plum-faint/50">
          <CalendarSessionIcon class="h-4 w-4 text-plum-muted" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-display text-sm font-semibold text-plum truncate">
            {{ session.name }}
          </p>
          <p class="font-body text-sm text-ash">{{ session.date }} • {{ session.duration }}</p>
        </div>
        <span class="font-body text-sm font-bold text-plum">
          {{ session.served }}
        </span>
      </button>
    </div>

    <!-- View Full History -->
    <div v-if="!isLoading && sessions.length > 0" class="mt-6">
      <button
        v-once
        class="mx-auto block rounded-xl border border-plum-faint px-6 py-2.5 font-display text-sm font-semibold text-plum transition-colors hover:border-plum hover:bg-plum-faint/30"
        @click="emit('view-history')"
      >
        View Full History
      </button>
    </div>
  </div>
</template>
