<script setup lang="ts">
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
 * @prop {Boolean} isMobileOpen - Whether the sidebar is open on mobile.
 * @emits {close} - User clicked to close the sidebar on mobile.
 */

import { defineAsyncComponent, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import { useLocalStorage, onKeyStroke } from '@vueuse/core'
import {
  PanelsTopLeft,
  LineSquiggle,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-vue-next'

defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const SidebarQueueControl = defineAsyncComponent(() => import('./SidebarQueueControl.vue'))
const SidebarSubscriptionMiniCard = defineAsyncComponent(
  () => import('./SidebarSubscriptionMiniCard.vue'),
)
const QueueStatusUpdateModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/QueueStatusUpdateModal.vue'),
)

const { showStatusUpdateModal, statusUpdateMode, handleStatusUpdateConfirm } = useLiveQueue()

const route = useRoute()

// Close sidebar on route change on mobile
watch(
  () => route.path,
  () => {
    emit('close')
  },
)
const isCollapsed = useLocalStorage('qb-sidebar-collapsed', false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

// Power user shortcut: [ to toggle sidebar (standard in Linear/Notion)
onKeyStroke('[', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  toggleCollapse()
})

async function handleStatusConfirm() {
  await handleStatusUpdateConfirm()
}

interface NavItem {
  name: string
  to: string
  icon: Component
  exact?: boolean
  indent?: boolean
  badge?: Component
}

const navItems = [
  {
    name: 'Dashboard',
    to: '/dashboard',
    icon: PanelsTopLeft,
    exact: true,
  },
  {
    name: 'Queue',
    to: '/dashboard/queue',
    icon: LineSquiggle,
    exact: true,
  },
  {
    name: 'History',
    to: '/dashboard/queue/history',
    icon: History,
  },
  {
    name: 'Settings',
    to: '/dashboard/settings',
    icon: Settings,
  },
]

function isActive(item: NavItem) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}
</script>

<template>
  <!-- Mobile Backdrop -->
  <div
    v-if="isMobileOpen"
    class="fixed inset-0 z-40 bg-plum/40 backdrop-blur-sm lg:hidden"
    @click="emit('close')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col bg-sand border-r border-plum-faint transition-all duration-300 ease-in-out lg:relative"
    :class="[
      isCollapsed ? 'lg:w-20' : 'lg:w-[280px]',
      isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px] lg:translate-x-0',
    ]"
  >
    <!-- Logo area -->
    <div
      class="flex items-center gap-3 py-8 transition-all duration-300"
      :class="isCollapsed ? 'lg:justify-center lg:px-0 px-7' : 'px-7'"
    >
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint text-on-mint shadow-lg dark:shadow-none"
      >
        <PanelsTopLeft class="h-5 w-5 text-on-mint" />
      </div>
      <span
        v-if="!isCollapsed || isMobileOpen"
        class="font-display text-xl font-black tracking-tight text-plum whitespace-nowrap overflow-hidden transition-all duration-300"
      >
        QueueBuzz
      </span>

      <button class="ml-auto p-2 text-plum-muted hover:text-plum lg:hidden" @click="emit('close')">
        <X class="h-6 w-6" />
      </button>
    </div>

    <nav
      class="flex flex-1 flex-col gap-1.5 py-4 transition-all duration-300"
      :class="isCollapsed ? 'lg:items-center px-4 lg:px-2' : 'px-4'"
    >
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="group relative flex items-center rounded-2xl transition-all duration-300"
        :class="[
          isActive(item)
            ? 'bg-plum-faint text-plum'
            : 'text-plum-muted hover:bg-white hover:text-plum',
          isCollapsed
            ? 'lg:h-12 lg:w-12 lg:justify-center gap-3.5 px-4 py-3.5 w-full lg:px-0 lg:py-0'
            : 'gap-3.5 px-4 py-3.5 w-full',
        ]"
      >
        <component
          :is="item.icon"
          class="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
          :class="isActive(item) ? 'text-plum' : 'text-plum-muted group-hover:text-plum'"
        />
        <span
          v-if="!isCollapsed || isMobileOpen"
          class="flex-1 font-body text-[15px] font-semibold whitespace-nowrap overflow-hidden transition-all duration-300"
        >
          {{ item.name }}
        </span>

        <!-- Active indicator -->
        <div
          v-if="isActive(item) && (!isCollapsed || isMobileOpen)"
          class="absolute left-0 h-6 w-1 rounded-r-full bg-mint"
        />
      </router-link>
    </nav>

    <!-- Queue Running Status -->
    <div v-if="!isCollapsed || isMobileOpen" class="transition-all duration-300">
      <SidebarQueueControl />
    </div>

    <!-- Subscription / Upgrade -->
    <div v-if="!isCollapsed || isMobileOpen" class="transition-all duration-300">
      <SidebarSubscriptionMiniCard />
    </div>

    <!-- Floating Collapse Toggle -->
    <button
      class="absolute -right-3 top-12 z-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-plum-faint bg-white p-1.5 text-plum-muted transition-all duration-300 hover:scale-110 hover:bg-plum hover:text-sand"
      :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="toggleCollapse"
    >
      <component :is="isCollapsed ? ChevronRight : ChevronLeft" class="h-3.5 w-3.5" />
    </button>
    <QueueStatusUpdateModal
      :is-open="showStatusUpdateModal"
      :mode="statusUpdateMode"
      @confirm="handleStatusConfirm"
      @close="showStatusUpdateModal = false"
    />
  </aside>
</template>
