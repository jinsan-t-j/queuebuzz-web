<script setup>
/**
 * @component TheSidebar
 * @description Host app sidebar navigation. Shows the QueueBuzz wordmark,
 * primary nav links, a queue-running status panel, and a Go Premium link.
 * Used once inside AppLayout.
 *
 * @prop {Boolean} isQueueRunning - Whether a queue session is currently active.
 * @emits {pause-queue} - User clicked "Pause Queue".
 * @emits {terminate-queue} - User clicked "Terminate".
 */

import { computed, ref } from 'vue'

import { useRoute } from 'vue-router'

import SidebarLogo from '@/assets/icons/sidebar-logo.svg?component'
import NavDashboard from '@/assets/icons/nav-dashboard.svg?component'
import NavActiveQueue from '@/assets/icons/nav-active-queue.svg?component'
import NavNewQueue from '@/assets/icons/nav-new-queue.svg?component'
import NavHistory from '@/assets/icons/nav-history.svg?component'
import NavSettings from '@/assets/icons/nav-settings.svg?component'
import PauseCircleIcon from '@/assets/icons/pause-circle.svg?component'
import TerminateIcon from '@/assets/icons/terminate.svg?component'
import DiamondPremium from '@/assets/icons/diamond-premium.svg?component'
import TerminateQueueModal from '@/modules/app/queue/components/TerminateQueueModal.vue'

const props = defineProps({
  isQueueRunning: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['pause-queue', 'terminate-queue'])

const route = useRoute()
const showTerminateModal = ref(false)

function openTerminateModal() {
  showTerminateModal.value = true
}

function handleCloseQueue() {
  showTerminateModal.value = false
  emit('terminate-queue')
}

function handleKeepOpen() {
  showTerminateModal.value = false
}

const navItems = computed(() => [
  {
    name: 'Dashboard',
    to: '/dashboard',
    icon: NavDashboard,
    exact: true,
  },
  {
    name: 'Active Queue',
    to: '/dashboard/queue',
    icon: NavActiveQueue,
    exact: true,
  },
  {
    name: 'New Queue',
    to: '/dashboard/queue/new',
    icon: NavNewQueue,
    exact: true,
  },
  {
    name: 'History',
    to: '/dashboard/history',
    icon: NavHistory,
  },
  {
    name: 'Settings',
    to: '/dashboard/settings',
    icon: NavSettings,
  },
])

function isActive(item) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col bg-plum">
    <!-- Wordmark -->
    <div class="flex h-16 items-center gap-3 px-6">
      <SidebarLogo class="h-[22px] w-6 text-mint" />
      <span class="font-display text-xl text-white">Queue Buzz</span>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-1 flex-col gap-2 px-4 py-4">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 rounded-input px-3 py-2.5 font-body text-base font-medium transition-colors"
        :class="[
          isActive(item)
            ? 'bg-mint text-plum shadow-[0_4px_6px_rgba(0,229,160,0.20),0_10px_15px_rgba(0,229,160,0.20)]'
            : item.indent
              ? 'text-ash pl-10'
              : 'text-white/60 hover:text-white/80',
        ]"
      >
        <component
          :is="item.icon"
          class="h-[18px] w-[18px]"
          :class="isActive(item) ? 'text-plum' : item.indent ? 'text-ash' : 'text-white/60'"
        />
        <span class="flex-1">{{ item.name }}</span>
        <component
          v-if="item.badge"
          :is="item.badge"
          class="h-4 w-4"
        />
      </router-link>
    </nav>

    <!-- Queue Running Status -->
    <div
      v-if="isQueueRunning"
      class="mx-4 mb-2 rounded-2xl border border-white/10 bg-white/5 p-4"
    >
      <p class="mb-4 font-body text-[10px] font-bold uppercase tracking-[1px] text-white/40">
        Queue RUNNING
      </p>
      <div class="flex flex-col gap-2">
        <button
          class="flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
          @click="emit('pause-queue')"
        >
          <PauseCircleIcon class="h-3 w-3 text-white/80" />
          Pause Queue
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

    <!-- Go Premium -->
    <div class="border-t border-white/10 p-4">
      <router-link
        to="/premium"
        class="flex items-center gap-[9px] px-3 py-2.5 font-body text-xs text-mint transition-colors hover:text-mint-dark"
      >
        <DiamondPremium class="h-[19px] w-[21px] text-mint" />
        Go Premium
      </router-link>
    </div>
    <TerminateQueueModal
      :is-open="showTerminateModal"
      @close-queue="handleCloseQueue"
      @keep-open="handleKeepOpen"
    />
  </aside>
</template>
