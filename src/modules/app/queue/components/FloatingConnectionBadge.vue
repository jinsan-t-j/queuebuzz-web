<script setup lang="ts">
defineProps<{
  streamState: 'open' | 'connecting' | 'closed' | 'error' | 'idle'
  pingMs?: number
}>()
</script>

<template>
  <div
    class="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 rounded-2xl border border-plum/10 bg-white/80 backdrop-blur-md px-4 py-2.5 shadow-lg z-50"
  >
    <div class="flex items-end gap-[2px] h-3.5" title="Connection Quality">
      <div
        class="w-[3px] h-1.5 rounded-full transition-colors"
        :class="
          streamState === 'open'
            ? 'bg-mint'
            : streamState === 'connecting'
              ? 'bg-warning animate-pulse'
              : 'bg-danger'
        "
      />
      <div
        class="w-[3px] h-2.5 rounded-full transition-colors delay-75"
        :class="
          streamState === 'open'
            ? 'bg-mint'
            : streamState === 'connecting'
              ? 'bg-plum-faint'
              : 'bg-danger'
        "
      />
      <div
        class="w-[3px] h-3.5 rounded-full transition-colors delay-150"
        :class="
          streamState === 'open'
            ? 'bg-mint shadow-[0_0_8px_rgba(0,229,160,0.4)]'
            : streamState === 'connecting'
              ? 'bg-plum-faint'
              : 'bg-danger'
        "
      />
    </div>
    <span
      v-if="streamState === 'open' && pingMs !== undefined"
      class="font-mono text-xs font-medium text-plum-muted"
    >
      {{ pingMs }}ms
    </span>
    <span
      v-else-if="streamState === 'connecting'"
      class="font-mono text-xs font-medium text-warning"
    >
      Connecting...
    </span>
    <span v-else class="font-mono text-xs font-medium text-danger"> Offline </span>
  </div>
</template>
