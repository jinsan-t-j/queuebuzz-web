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

import CloseCircleIcon from '@/assets/icons/close-circle.svg?component'
import navSettingsIcon from '@/assets/icons/nav-settings.svg?component'
import PlusIcon from '@/assets/icons/plus.svg?component'
import PauseCircleIcon from '@/assets/icons/pause-circle.svg?component'
import PlayIcon from '@/assets/icons/play.svg?component'
import { PenLineIcon } from 'lucide-vue-next'
import BaseTooltip from '@/components/base/BaseTooltip.vue'

const props = defineProps<{
  isPaused: boolean
  strictMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-guest'): void
  (e: 'update-status', mode: 'pause' | 'resume' | 'terminate'): void
  (e: 'open-settings'): void
  (e: 'toggle-notes'): void
  (e: 'toggle-strict-mode'): void
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
    class="flex flex-col gap-4 p-6 rounded-card border border-plum-faint bg-white shadow-sm dark:shadow-none"
  >
    <h3 class="font-display text-lg font-bold text-plum">Quick Actions</h3>
    <div class="grid grid-cols-3 gap-3">
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

      <BaseTooltip
        text="Strictly enforces the 'Call Next' action only after the previous guest has been marked as served."
      >
        <button
          class="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-all group cursor-pointer w-full h-full"
          :class="
            strictMode
              ? 'bg-mint-light dark:bg-mint-light/20 hover:bg-danger/10 dark:hover:bg-danger/20'
              : 'bg-sand dark:bg-plum-faint/30 hover:bg-mint-light dark:hover:bg-plum-faint/60'
          "
          @click="$emit('toggle-strict-mode')"
        >
          <div
            class="rounded-full p-2 shadow-sm dark:shadow-none transition-colors"
            :class="
              strictMode
                ? 'bg-mint group-hover:bg-danger'
                : 'bg-white dark:bg-plum-faint group-hover:bg-mint'
            "
          >
            <svg
              class="h-5 w-5 transition-colors"
              :class="
                strictMode
                  ? 'text-on-mint group-hover:text-white'
                  : 'text-plum group-hover:text-on-mint'
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <span
            class="font-body text-xs font-bold transition-colors text-center"
            :class="strictMode ? 'text-plum group-hover:text-danger' : 'text-plum'"
          >
            {{ strictMode ? 'Disable Strict' : 'Enable Strict' }}
          </span>
        </button>
      </BaseTooltip>
    </div>
  </div>
</template>
