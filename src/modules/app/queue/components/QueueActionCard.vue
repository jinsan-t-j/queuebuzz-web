<script setup lang="ts">
/**
 * @component QueueActionCard
 * @description Quick actions for managing the queue (Add Guest, Pause/Resume, Settings, Terminate).
 *
 * @prop {boolean} isPaused - Whether the queue is currently paused.
 * @emits {add-guest} - "Add Guest" clicked.
 * @emits {toggle-pause} - "Pause/Resume" clicked.
 * @emits {open-settings} - "Queue Settings" clicked.
 * @emits {terminate} - "Terminate Queue" clicked.
 */

import { PenLineIcon } from 'lucide-vue-next'

import CloseCircleIcon from '@/assets/icons/close-circle.svg?component'
import navSettingsIcon from '@/assets/icons/nav-settings.svg?component'
import PauseCircleIcon from '@/assets/icons/pause-circle.svg?component'
import PlayIcon from '@/assets/icons/play.svg?component'
import PlusIcon from '@/assets/icons/plus.svg?component'

const props = defineProps<{
  isPaused: boolean
  manualPositioning?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-guest'): void
  (e: 'update-status', mode: 'pause' | 'resume' | 'terminate'): void
  (e: 'open-settings'): void
  (e: 'toggle-notes'): void
}>()

function handlePauseClick() {
  emit('update-status', props.isPaused ? 'resume' : 'pause')
}

function handleTerminateClick() {
  emit('update-status', 'terminate')
}
</script>

<template>
  <div
    class="flex flex-col gap-4 p-4 sm:p-6 rounded-card border border-plum-faint bg-white shadow-sm dark:shadow-none"
  >
    <h3 class="font-display text-base sm:text-lg font-bold text-plum">Quick Actions</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
      <button
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand dark:bg-plum-faint/30 p-4 transition-all hover:bg-mint-light dark:hover:bg-plum-faint/60 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sand dark:disabled:hover:bg-plum-faint/30"
        :disabled="isPaused"
        @click="$emit('add-guest')"
      >
        <div
          class="rounded-full bg-white dark:bg-plum-faint p-2 shadow-sm dark:shadow-none group-hover:bg-mint transition-colors group-disabled:group-hover:bg-white dark:group-disabled:group-hover:bg-plum-faint"
        >
          <PlusIcon
            class="h-5 w-5 text-plum group-hover:text-on-mint transition-colors group-disabled:group-hover:text-plum"
          />
        </div>
        <span class="font-body text-xs font-bold text-plum">Add Guest</span>
      </button>

      <button
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand dark:bg-plum-faint/30 p-4 transition-all hover:bg-plum/5 dark:hover:bg-plum-faint/60 group cursor-pointer"
        @click="handlePauseClick"
      >
        <div
          class="rounded-full bg-white dark:bg-plum-faint p-2 shadow-sm dark:shadow-none group-hover:bg-warning transition-colors"
        >
          <template v-if="isPaused">
            <PlayIcon class="h-5 w-5 text-plum group-hover:text-white transition-colors" />
          </template>
          <template v-else>
            <PauseCircleIcon class="h-5 w-5 text-plum group-hover:text-white transition-colors" />
          </template>
        </div>
        <span class="font-body text-xs font-bold text-plum">{{
          isPaused ? 'Resume' : 'Pause'
        }}</span>
      </button>

      <button
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand dark:bg-plum-faint/30 p-4 transition-all hover:bg-plum/5 dark:hover:bg-plum-faint/60 group cursor-pointer"
        @click="$emit('open-settings')"
      >
        <div
          class="rounded-full bg-white dark:bg-plum-faint p-2 shadow-sm dark:shadow-none group-hover:bg-plum transition-colors"
        >
          <navSettingsIcon class="h-4 w-4 text-plum group-hover:text-sand transition-colors" />
        </div>
        <span class="font-body text-xs font-bold text-plum">Settings</span>
      </button>

      <button
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand dark:bg-plum-faint/30 p-4 transition-all hover:bg-danger/10 dark:hover:bg-danger/20 group cursor-pointer"
        @click="handleTerminateClick"
      >
        <div
          class="rounded-full bg-white dark:bg-plum-faint p-2 shadow-sm dark:shadow-none group-hover:bg-danger transition-colors"
        >
          <CloseCircleIcon class="h-4 w-4 text-danger group-hover:text-white transition-colors" />
        </div>
        <span class="font-body text-xs font-bold text-danger">Terminate</span>
      </button>

      <button
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand dark:bg-plum-faint/30 p-4 transition-all hover:bg-mint-light dark:hover:bg-plum-faint/60 group cursor-pointer"
        @click="$emit('toggle-notes')"
      >
        <div
          class="rounded-full bg-white dark:bg-plum-faint p-2 shadow-sm dark:shadow-none group-hover:bg-mint transition-colors"
        >
          <PenLineIcon class="h-5 w-5 text-plum group-hover:text-on-mint transition-colors" />
        </div>
        <span class="font-body text-xs font-bold text-plum">Notes</span>
      </button>
    </div>
  </div>
</template>
