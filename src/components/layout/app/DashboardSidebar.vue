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
 */

import { defineAsyncComponent } from 'vue'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import { useLocalStorage, onKeyStroke } from '@vueuse/core'
import {
  LayoutGrid,
  Users,
  History,
  Settings,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'

const SidebarQueueControl = defineAsyncComponent(() => import('./SidebarQueueControl.vue'))
const QueueStatusUpdateModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/QueueStatusUpdateModal.vue'),
)

const { showStatusUpdateModal, statusUpdateMode, handleStatusUpdateConfirm } = useLiveQueue()

const route = useRoute()
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
    icon: LayoutGrid,
    exact: true,
  },
  {
    name: 'Queue',
    to: '/dashboard/queue',
    icon: Users,
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
  <aside
    class="relative flex shrink-0 flex-col bg-white border-r border-plum-faint transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'w-20' : 'w-[280px]'"
  >
    <!-- Logo area -->
    <div
      class="flex items-center gap-3 py-8 transition-all duration-300"
      :class="isCollapsed ? 'justify-center px-0' : 'px-7'"
    >
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint shadow-[0_8px_20px_rgba(0,229,160,0.3)]"
      >
        <LayoutGrid class="h-5 w-5 text-plum" />
      </div>
      <span
        v-if="!isCollapsed"
        class="font-display text-2xl font-black tracking-tight text-plum whitespace-nowrap overflow-hidden transition-all duration-300"
      >
        QueueBuzz
      </span>
    </div>

    <!-- Navigation -->
    <nav
      class="flex flex-1 flex-col gap-1.5 py-4 transition-all duration-300"
      :class="isCollapsed ? 'items-center px-2' : 'px-4'"
    >
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="group relative flex items-center rounded-2xl transition-all duration-300"
        :class="[
          isActive(item)
            ? 'bg-plum text-sand shadow-lg shadow-plum/10'
            : 'text-plum-muted hover:bg-sand/50 hover:text-plum',
          isCollapsed ? 'h-12 w-12 justify-center' : 'gap-3.5 px-4 py-3.5 w-full',
        ]"
      >
        <component
          :is="item.icon"
          class="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
          :class="isActive(item) ? 'text-mint' : 'text-plum-muted group-hover:text-plum'"
        />
        <span
          v-if="!isCollapsed"
          class="flex-1 font-body text-[15px] font-semibold whitespace-nowrap overflow-hidden transition-all duration-300"
        >
          {{ item.name }}
        </span>

        <!-- Active indicator -->
        <div
          v-if="isActive(item) && !isCollapsed"
          class="absolute left-0 h-6 w-1 rounded-r-full bg-mint"
        />
      </router-link>
    </nav>

    <!-- Queue Running Status -->
    <div v-if="!isCollapsed" class="transition-all duration-300">
      <SidebarQueueControl />
    </div>

    <!-- Go Premium -->
    <div v-if="!isCollapsed" class="p-4 transition-all duration-300">
      <router-link
        to="/premium"
        class="group flex flex-col gap-4 rounded-3xl bg-sand p-5 transition-all hover:bg-mint-light"
      >
        <div class="flex items-center justify-between">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110"
          >
            <Sparkles class="h-5 w-5 text-mint" />
          </div>
          <ArrowRight
            class="h-4 w-4 text-plum-muted transition-transform group-hover:translate-x-1"
          />
        </div>
        <div>
          <p class="font-body text-[13px] font-black text-plum">Upgrade to Pro</p>
          <p class="mt-1 font-body text-[11px] font-medium text-plum-muted">
            Unlimited queues & more
          </p>
        </div>
      </router-link>
    </div>

    <!-- Floating Collapse Toggle -->
    <button
      class="absolute -right-3 top-12 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-plum-faint bg-white text-plum-muted shadow-sm transition-all duration-300 hover:scale-110 hover:bg-plum hover:text-sand"
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
