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

defineProps<{
  isPaused: boolean
}>()

defineEmits<{
  (e: 'add-guest'): void
  (e: 'toggle-pause'): void
  (e: 'open-settings'): void
  (e: 'terminate'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-4 p-6 rounded-card border border-plum/5 bg-white shadow-sm">
    <h3 class="font-display text-lg font-bold text-plum">Quick Actions</h3>
    <div class="grid grid-cols-2 gap-3">
       <button 
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand p-4 transition-all hover:bg-mint-light group cursor-pointer"
        @click="$emit('add-guest')"
       >
         <div class="rounded-full bg-white p-2 shadow-sm group-hover:bg-mint transition-colors">
            <PlusIcon class="h-5 w-5 text-plum group-hover:text-white transition-colors" />
         </div>
         <span class="font-body text-xs font-bold text-plum">Add Guest</span>
       </button>
       
       <button 
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand p-4 transition-all hover:bg-plum/5 group cursor-pointer"
        @click="$emit('toggle-pause')"
       >
         <div class="rounded-full bg-white p-2 shadow-sm group-hover:bg-warning transition-colors">
            <template v-if="isPaused">
              <PlayIcon class="h-5 w-5 text-plum group-hover:text-white transition-colors" />
            </template>
            <template v-else>
              <PauseCircleIcon class="h-5 w-5 text-plum group-hover:text-white transition-colors" />
            </template>
         </div>
         <span class="font-body text-xs font-bold text-plum">{{ isPaused ? 'Resume' : 'Pause' }}</span>
       </button>

       <button 
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand p-4 transition-all hover:bg-plum/5 group cursor-pointer"
        @click="$emit('open-settings')"
       >
         <div class="rounded-full bg-white p-2 shadow-sm group-hover:bg-plum transition-colors">
            <navSettingsIcon class="h-4 w-4 text-plum group-hover:text-white transition-colors" />
         </div>
         <span class="font-body text-xs font-bold text-plum">Settings</span>
       </button>

       <button 
        class="flex flex-col items-center justify-center gap-2 rounded-2xl bg-sand p-4 transition-all hover:bg-danger/10 group cursor-pointer"
        @click="$emit('terminate')"
       >
         <div class="rounded-full bg-white p-2 shadow-sm group-hover:bg-danger transition-colors">
            <CloseCircleIcon class="h-4 w-4 text-danger group-hover:text-white transition-colors" />
         </div>
         <span class="font-body text-xs font-bold text-danger">Terminate</span>
       </button>
    </div>
  </div>
</template>
