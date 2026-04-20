<script setup>
/**
 * @component DashboardSidebar
 * @description Host dashboard sidebar navigation. Shows the QueueBuzz wordmark,
 * primary nav links, a queue-running status panel, and a Go Premium link.
 * Used once inside AppLayout.
 *
 * @prop {Boolean} isQueueRunning - Whether a queue session is currently active.
 * @prop {Boolean} isQueuePaused - Whether the active queue is currently paused.
 * @prop {String|Date} pausedAt - Timestamp when the queue was paused.
 * @emits {pause-queue} - User clicked "Pause Queue".
 * @emits {resume-queue} - User clicked "Resume Queue".
 * @emits {terminate-queue} - User clicked "Terminate".
 */

import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

import SidebarLogo from '@/assets/icons/sidebar-logo.svg?component'
import NavDashboard from '@/assets/icons/nav-dashboard.svg?component'
import Queue from '@/assets/icons/queue.svg?component'
import NavHistory from '@/assets/icons/nav-history.svg?component'
import NavSettings from '@/assets/icons/nav-settings.svg?component'
import DiamondPremium from '@/assets/icons/diamond-premium.svg?component'

const SidebarQueueControl = defineAsyncComponent(() => import('./SidebarQueueControl.vue'))
const QueueStatusUpdateModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/QueueStatusUpdateModal.vue'),
)

const { showStatusUpdateModal, statusUpdateMode, handleStatusUpdateConfirm } = useLiveQueue()

const route = useRoute()

async function handleStatusConfirm() {
  await handleStatusUpdateConfirm()
}

const navItems = [
  {
    name: 'Dashboard',
    to: '/dashboard',
    icon: NavDashboard,
    exact: true,
  },
  {
    name: 'Queue',
    to: '/dashboard/queue',
    icon: Queue,
    exact: true,
  },
  {
    name: 'History',
    to: '/dashboard/queue/history',
    icon: NavHistory,
  },
  {
    name: 'Settings',
    to: '/dashboard/settings',
    icon: NavSettings,
  },
]

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
        <component :is="item.badge" v-if="item.badge" class="h-4 w-4" />
      </router-link>
    </nav>

    <!-- Queue Running Status -->
    <SidebarQueueControl />

    <!-- Go Premium -->
    <div class="border-t border-white/10 p-4">
      <router-link
        to="/premium"
        class="flex items-center gap-[9px] px-3 py-2.5 font-body text-sm text-mint transition-colors hover:text-mint-dark"
      >
        <DiamondPremium class="h-[19px] w-[21px] text-mint" />
        Go Premium
      </router-link>
    </div>
    <QueueStatusUpdateModal
      :is-open="showStatusUpdateModal"
      :mode="statusUpdateMode"
      @confirm="handleStatusConfirm"
      @close="showStatusUpdateModal = false"
    />
  </aside>
</template>
