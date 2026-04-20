<script setup lang="ts">
/**
 * @component SidebarQueueControl
 * @description Quick controls for the active queue in the sidebar.
 * Shows status (Running/Paused), a timer if paused, and actions to pause/resume/terminate.
 */
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import PauseCircleIcon from '@/assets/icons/pause-circle.svg?component'
import { PlayCircle as PlayCircleIcon } from 'lucide-vue-next'
import TerminateIcon from '@/assets/icons/terminate.svg?component'

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
    class="mx-4 mb-2 rounded-2xl border bg-white/5 p-4 transition-colors"
    :class="isPaused ? 'border-warning/30' : 'border-white/10'"
  >
    <div class="flex items-center justify-between mb-4">
      <p
        class="font-body text-sm font-bold uppercase tracking-[1px]"
        :class="isPaused ? 'text-warning' : 'text-white/40'"
      >
        Queue {{ isPaused ? 'PAUSED' : 'RUNNING' }}
      </p>
      <span v-if="isPaused" class="font-mono text-sm font-bold text-warning">
        {{ pausedTimeFormatted }}
      </span>
    </div>

    <div class="flex flex-col gap-2">
      <button
        v-if="!isPaused"
        class="flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
        @click="openPauseModal"
      >
        <PauseCircleIcon class="h-3 w-3 text-white/80" />
        Pause Queue
      </button>
      <button
        v-else
        class="flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm font-semibold text-warning transition-colors hover:bg-warning/10"
        @click="handleResume"
      >
        <PlayCircleIcon class="h-[14px] w-[14px] text-warning" />
        Resume Queue
      </button>
      <button
        class="flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm font-semibold text-[#f87171] transition-colors hover:bg-white/10"
        @click="openTerminateModal"
      >
        <TerminateIcon class="h-[10px] w-[9px] text-[#f87171]" />
        Terminate
      </button>
    </div>
  </div>
</template>
