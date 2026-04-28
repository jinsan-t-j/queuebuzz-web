<script setup lang="ts">
/**
 * @component DashboardView
 * @description Host dashboard showing active queue status, weekly performance,
 * recent sessions, return rate charts, heatmaps, and onboarding checklist.
 * Handles both active (populated) and empty (new account) states.
 */

import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-vue-next'

import { useDashboardStore } from '@/stores/dashboard.store'

import BaseButton from '@/components/base/BaseButton.vue'
import QueueStatusBar from '../components/QueueStatusBar.vue'
import DashboardStatCard from '../components/DashboardStatCard.vue'

const emit = defineEmits([
  'go-to-queue',
  'start-queue',
  'start-now',
  'select-session',
  'view-history',
  'create-first-queue',
  'step-click',
])

const DashboardWeekChart = defineAsyncComponent(
  () => import('../components/DashboardWeekChart.vue'),
)
const DashboardRecentSessions = defineAsyncComponent(
  () => import('../components/DashboardRecentSessions.vue'),
)
const DashboardReturnRate = defineAsyncComponent(
  () => import('../components/DashboardReturnRate.vue'),
)
const DashboardDroppedSkipped = defineAsyncComponent(
  () => import('../components/DashboardDroppedSkipped.vue'),
)
const DashboardPeakHours = defineAsyncComponent(
  () => import('../components/DashboardPeakHours.vue'),
)
const DashboardQuickSetup = defineAsyncComponent(
  () => import('../components/DashboardQuickSetup.vue'),
)

const router = useRouter()
const route = useRoute()
const dashboardStore = useDashboardStore()
const { isLoading, isRefreshing, error, data: dashboardData } = storeToRefs(dashboardStore)

const currentHour = ref(new Date().getHours())
let greetingTimer = null

const isNewAccount = computed(
  () =>
    !dashboardData.value?.recentSessions?.length &&
    !dashboardData.value?.activeQueue?.isActive &&
    !isLoading.value,
)

const greeting = computed(() => {
  const name = dashboardData.value?.greeting?.name || 'there'
  if (currentHour.value < 12) return `Good morning, ${name}`
  if (currentHour.value < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
})

const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US'

const dateFormatter = new Intl.DateTimeFormat(locale, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const dateString = computed(() => {
  const hourSnapshot = currentHour.value
  const today = new Date()
  today.setHours(hourSnapshot, 0, 0, 0)
  return dateFormatter.format(today)
})

const activeQueue = computed(
  () =>
    dashboardData.value?.activeQueue || {
      isActive: false,
      queueName: '',
      startedAt: '',
      waiting: 0,
    },
)
const stats = computed(
  () => dashboardData.value?.stats || { servedToday: 0, avgWait: '0m', peakWait: 0, skipped: 0 },
)
const weekChart = computed(() => dashboardData.value?.weekChart || [])
const recentSessions = computed(() => dashboardData.value?.recentSessions || [])
const returnRate = computed(
  () =>
    dashboardData.value?.returnRate || {
      hasData: false,
      returningCount: 0,
      chartData: [],
      byQueue: [],
    },
)
const droppedSkipped = computed(() => dashboardData.value?.droppedSkipped || [])
const peakHours = computed(() => dashboardData.value?.peakHours || [])
const quickSetup = computed(() => dashboardData.value?.quickSetup || { show: false, steps: [] })

const returnRateByQueue = computed(() => {
  const now = new Date()
  const monday = new Date(now)
  const day = now.getDay()
  // Adjust to get Monday (1-6 for Mon-Sat, 0 for Sun)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)

  const existing = returnRate.value?.byQueue || []
  const existingNames = new Set(existing.map((e) => e.label))

  const names = new Set<string>()
  // Active queue is always considered "current"
  if (activeQueue.value?.queueName) {
    names.add(activeQueue.value.queueName)
  }

  // Only include names from sessions that happened this week
  recentSessions.value?.forEach((s) => {
    if (s.name && s.date) {
      const sessionDate = new Date(s.date)
      if (sessionDate >= monday) {
        names.add(s.name)
      }
    }
  })

  // Merge: Keep existing rates, add others with 0%
  const merged = [...existing]
  names.forEach((name) => {
    if (!existingNames.has(name)) {
      merged.push({ label: name, rate: 0 })
    }
  })

  return merged
})

const showQuickSetup = computed(() => {
  const setup = quickSetup.value
  if (!setup.steps?.length) return false
  return setup.show || isNewAccount.value || setup.steps.some((s) => !s.isDone)
})

const allStepsDone = computed(() => {
  return quickSetup.value.steps?.every((s) => s.isDone) ?? false
})

const hasWeekData = computed(() => {
  return weekChart.value.some((d) => d.value > 0 && !d.isFuture)
})

const hasPeakData = computed(() => peakHours.value.length > 0 && !isNewAccount.value)

watch(
  () => route.query.claim_queue_id,
  (id) => {
    if (id) {
      router.replace({
        name: 'queue',
        query: { claim_queue_id: id },
      })
    }
  },
  { immediate: true },
)

// 11. Methods
async function loadDashboard() {
  await dashboardStore.fetchDashboard({ force: true })
}

function retry() {
  if (isLoading.value || isRefreshing.value) return
  dashboardStore.fetchDashboard({ force: true, silent: true })
}

function clearGreetingTimer() {
  if (greetingTimer !== null) {
    window.clearTimeout(greetingTimer)
    greetingTimer = null
  }
}

function scheduleGreetingUpdate() {
  clearGreetingTimer()

  const now = new Date()
  currentHour.value = now.getHours()

  const nextBoundary = new Date(now)

  if (now.getHours() < 12) {
    nextBoundary.setHours(12, 0, 0, 0)
  } else if (now.getHours() < 17) {
    nextBoundary.setHours(17, 0, 0, 0)
  } else {
    nextBoundary.setDate(nextBoundary.getDate() + 1)
    nextBoundary.setHours(0, 0, 0, 0)
  }

  const timeoutMs = Math.max(nextBoundary.getTime() - now.getTime(), 1000)
  greetingTimer = window.setTimeout(scheduleGreetingUpdate, timeoutMs)
}

function handleVisibilityChange() {
  if (!document.hidden) {
    scheduleGreetingUpdate()
  }
}

// 12. Lifecycle hooks
onMounted(() => {
  scheduleGreetingUpdate()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  loadDashboard()
})

onBeforeUnmount(() => {
  clearGreetingTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Error state -->
    <div v-if="error && !isLoading" class="flex flex-col items-center justify-center py-12 gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF2F2]">
        <AlertCircle class="h-6 w-6 text-danger" />
      </div>
      <p class="font-display text-lg font-bold text-plum">Something went wrong</p>
      <p class="font-body text-sm text-plum-muted">{{ error }}</p>
      <BaseButton variant="ghost" size="sm" @click="retry"> Try again </BaseButton>
    </div>

    <template v-else>
      <!-- Welcome Hero (Compact) -->
      <div
        v-if="!isLoading && isNewAccount"
        class="rounded-2xl border border-mint/20 bg-mint-light/30 px-8 py-8"
      >
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-col gap-1.5">
            <h1 class="font-display text-xl font-bold text-plum tracking-tight">
              Ready to serve, {{ dashboardData?.greeting?.name || 'John' }}?
            </h1>
            <p class="max-w-md font-body text-sm text-plum-muted leading-relaxed">
              Launch your first queue session and start tracking customer wait times in real-time.
            </p>
          </div>
          <button
            class="group flex items-center justify-center gap-3 rounded-xl bg-plum px-8 py-3.5 font-display text-sm font-bold text-sand transition-all hover:bg-plum-soft shadow-lg shadow-plum/10"
            @click="emit('start-now')"
          >
            Start Session
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <!-- Greeting + Active State Content -->
      <template v-if="!isNewAccount || isLoading">
        <!-- Header Section -->
        <div class="flex items-center justify-between">
          <div v-if="!isNewAccount">
            <h2 class="font-display text-2xl font-bold text-plum">
              {{ isLoading ? 'Loading...' : greeting }}
            </h2>
            <p v-if="!isLoading" class="font-body text-xs text-plum-muted opacity-80">
              {{ dateString }}
            </p>
          </div>

          <button
            v-if="!isLoading"
            :disabled="isRefreshing"
            class="flex items-center gap-2 rounded-lg border border-plum-faint bg-white px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-widest text-plum-muted transition-all hover:border-plum hover:text-plum shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            @click="retry"
          >
            <RefreshCw class="h-3 w-3 opacity-60" :class="{ 'animate-spin': isRefreshing }" />
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <DashboardStatCard
            :value="isNewAccount ? '—' : String(stats.servedToday ?? '—')"
            label="Served Today"
            :accent="isNewAccount ? 'none' : 'mint'"
            :is-loading="isLoading"
          />
          <DashboardStatCard
            :value="isNewAccount ? '—' : (stats.avgWait ?? '—')"
            label="Avg Wait"
            :is-loading="isLoading"
          />
          <DashboardStatCard
            :value="isNewAccount ? '—' : String(stats.peakWait ?? '—')"
            label="Peak Wait"
            :is-loading="isLoading"
          />
          <DashboardStatCard
            :value="isNewAccount ? '—' : String(stats.skipped ?? '—')"
            label="Avg Skipped"
            :accent="isNewAccount ? 'none' : 'danger'"
            :is-loading="isLoading"
          />
        </div>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <!-- Main Content (Left/Center) -->
          <div class="flex flex-col gap-6 lg:col-span-8">
            <!-- Active Queue Stat (In-context) -->
            <QueueStatusBar
              :queue-name="activeQueue?.queueName"
              :started-at="activeQueue?.startedAt"
              :waiting-count="activeQueue?.waiting ?? 0"
              :is-active="activeQueue?.isActive"
              :is-loading="isLoading"
              @go-to-queue="emit('go-to-queue', $event)"
              @start-queue="emit('start-queue')"
            />

            <!-- Primary Chart -->
            <DashboardWeekChart
              :data="weekChart"
              :has-data="hasWeekData"
              :is-loading="isLoading"
              :has-active-queue="activeQueue?.isActive"
            />

            <!-- Analytical Widgets Mini-Grid -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DashboardReturnRate
                :chart-data="returnRate?.chartData || []"
                :by-queue="returnRateByQueue"
                :returning-count="returnRate?.returningCount || 0"
                :has-data="returnRate?.hasData"
                :is-loading="isLoading"
                :is-refreshing="isRefreshing"
                @timeframe-change="dashboardStore.fetchDashboard({ force: true, silent: true })"
              />
              <DashboardDroppedSkipped :data="droppedSkipped" :is-loading="isLoading" />
            </div>

            <!-- Quick Setup (Onboarding focus) -->
            <DashboardQuickSetup
              v-if="showQuickSetup && !allStepsDone"
              :steps="quickSetup.steps"
              @step-click="emit('step-click', $event)"
            />
          </div>

          <!-- Side Panel (Right) -->
          <div class="flex flex-col gap-6 lg:col-span-4">
            <!-- Recent Activity -->
            <DashboardRecentSessions
              :sessions="recentSessions"
              :is-loading="isLoading"
              :has-active-queue="activeQueue?.isActive"
              @select-session="emit('select-session', $event)"
              @view-history="emit('view-history')"
              @create-first-queue="emit('create-first-queue')"
            />

            <!-- Operational Insights -->
            <DashboardPeakHours :data="peakHours" :has-data="hasPeakData" :is-loading="isLoading" />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
