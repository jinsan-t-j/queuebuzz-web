<script setup lang="ts">
/**
 * @component SidebarQueueControl
 * @description Quick controls for the active queue in the sidebar.
 * Shows status (Running/Paused), a timer if paused, and actions to pause/resume/terminate.
 */
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import { PauseCircle, PlayCircle, LogOut } from 'lucide-vue-next'

const {
  activeQueue,
  isPaused,
  showStatusUpdateModal,
  statusUpdateMode,
  handleStatusUpdateConfirm,
} = useLiveQueue()

const now = useNow()
const pausedAt = computed(() => activeQueue.value?.updatedAt || null)

const pausedTimeFormatted = computed(() => {
  if (!isPaused.value || !pausedAt.value) return '00m 00s'
  const start = new Date(pausedAt.value).getTime()
  if (isNaN(start)) return '00m 00s'

  const diffMs = now.value.getTime() - start
  if (diffMs < 0) return '00m 00s'

  const totalSeconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
})

function openPauseModal() {
  statusUpdateMode.value = 'pause'
  showStatusUpdateModal.value = true
}

async function handleResume() {
  statusUpdateMode.value = 'resume'
  await handleStatusUpdateConfirm()
}

function openTerminateModal() {
  statusUpdateMode.value = 'terminate'
  showStatusUpdateModal.value = true
}
</script>

<template>
  <div
    v-if="activeQueue"
    class="mx-4 mb-4 rounded-3xl border border-plum-faint bg-sand/50 p-5 transition-all hover:bg-sand"
  >
    <div class="flex items-center justify-between mb-5">
      <div class="flex flex-col">
        <span class="text-[10px] font-black uppercase tracking-wider text-plum-muted">Status</span>
        <p class="font-body text-xs font-bold" :class="isPaused ? 'text-warning' : 'text-mint'">
          {{ isPaused ? 'Paused' : 'Active Now' }}
        </p>
      </div>
      <div v-if="isPaused" class="flex flex-col items-end">
        <span class="text-[10px] font-black uppercase tracking-wider text-plum-muted"
          >Duration</span
        >
        <span class="font-mono text-xs font-bold text-plum">
          {{ pausedTimeFormatted }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <button
        v-if="!isPaused"
        class="group flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-2.5 font-body text-[13px] font-bold text-plum shadow-sm transition-all hover:bg-plum hover:text-sand"
        @click="openPauseModal"
      >
        <PauseCircle class="h-4 w-4 text-plum group-hover:text-mint" />
        Pause Queue
      </button>
      <button
        v-else
        class="group flex w-full items-center gap-3 rounded-2xl bg-warning px-4 py-2.5 font-body text-[13px] font-bold text-white shadow-md transition-all hover:opacity-90"
        @click="handleResume"
      >
        <PlayCircle class="h-4 w-4 text-white" />
        Resume Now
      </button>

      <button
        class="group flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 font-body text-[13px] font-bold text-danger transition-all hover:bg-danger/10"
        @click="openTerminateModal"
      >
        <LogOut class="h-3.5 w-3.5 text-danger" />
        End Session
      </button>
    </div>
  </div>
</template>
