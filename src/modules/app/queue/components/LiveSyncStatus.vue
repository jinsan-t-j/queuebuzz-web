<script setup lang="ts">
import HostNotificationCenter from '@/components/layout/HostNotificationCenter.vue'
import type { SseConnectionState } from '@/lib/sse'

defineProps<{
  queueName: string
  isStreamConnected: boolean
  streamState: SseConnectionState
  pingMs?: number
  showNotifications?: boolean
  strictMode?: boolean
}>()
</script>

<template>
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-3">
        <div class="relative flex h-3 w-3 items-center justify-center">
          <span
            v-if="streamState === 'connecting'"
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75"
          />
          <span
            class="relative inline-flex h-3 w-3 rounded-full transition-colors duration-300"
            :class="
              streamState === 'open'
                ? 'bg-mint'
                : streamState === 'connecting'
                  ? 'bg-warning'
                  : 'bg-danger'
            "
          />
        </div>
        <h1 class="font-display text-4xl font-bold text-plum leading-tight">
          {{ queueName }}
        </h1>
      </div>
    </div>

    <!-- Action Group -->
    <div class="flex items-center gap-6">
      <div
        v-if="!isStreamConnected && streamState !== 'connecting'"
        class="hidden md:flex text-xs font-body text-danger items-center gap-1"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        State might be stale. Reconnecting...
      </div>

      <HostNotificationCenter v-if="showNotifications" />
    </div>
  </div>
</template>
