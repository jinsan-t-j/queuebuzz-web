<script setup lang="ts">
/**
 * @component DashboardView
 * @description Host dashboard showing active queue status, weekly performance,
 * recent sessions, return rate charts, heatmaps, and onboarding checklist.
 * Handles both active (populated) and empty (new account) states.
 */

import { RefreshCw } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useRefresh } from '@/composables/useRefresh'
import { useToast } from '@/composables/useToast'
import { useDashboardStore } from '@/stores/dashboard.store'

import DashboardStatCard from '../components/DashboardStatCard.vue'
import QueueStatusBar from '../components/QueueStatusBar.vue'

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
const DashboardOnboardingHero = defineAsyncComponent(
  () => import('../components/DashboardOnboardingHero.vue'),
)

const DashboardErrorState = defineAsyncComponent(
  () => import('../components/DashboardErrorState.vue'),
)

const router = useRouter()
const route = useRoute()
const dashboardStore = useDashboardStore()
const { isLoading, isRefreshing, error, data: dashboardData } = storeToRefs(dashboardStore)

const currentHour = ref(new Date().getHours())
let greetingTimer = null

const isNewAccount = computed(
  () =>
    !dashboardData.value?.hasHistory &&
    !dashboardData.value?.activeQueue?.isActive &&
    !isLoading.value,
)

const greeting = computed(() => {
  const name = dashboardData.value?.greeting?.name || 'there'
  if (currentHour.value < 12) return `Good morning, ${name}`
  if (currentHour.value < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
})

const locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language || 'en-US'

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

watch(
  () => route.query.redirect,
  (redirectPath) => {
    if (redirectPath) {
      router.replace(redirectPath as string)
    }
  },
  { immediate: true },
)

// 11. Methods
async function loadDashboard() {
  await dashboardStore.fetchDashboard({ force: true })
}

const { onRefresh } = useRefresh()
onRefresh(async () => {
  await dashboardStore.fetchDashboard({ force: true, silent: true })
})

function retry() {
  if (isLoading.value || isRefreshing.value) return
  dashboardStore.fetchDashboard({ force: true, silent: true })
}

function clearGreetingTimer() {
  if (greetingTimer !== null) {
    globalThis.clearTimeout(greetingTimer)
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
  greetingTimer = globalThis.setTimeout(scheduleGreetingUpdate, timeoutMs)
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

  // Handle payment redirects
  if (route.query.checkout === 'success') {
    const { showToast } = useToast()
    const planName = String(route.query.plan || 'Premium')
    showToast(`Welcome to ${planName}! Your subscription is now active.`, {
      type: 'success',
      duration: 5000,
    })
    // Clean up URL
    router.replace({ query: { ...route.query, checkout: undefined, plan: undefined } })
  } else if (route.query.checkout === 'error') {
    const { showToast } = useToast()
    showToast('Payment failed or was cancelled. Please try again.', {
      type: 'error',
    })
    // Clean up URL
    router.replace({ query: { ...route.query, checkout: undefined } })
  }
})

onBeforeUnmount(() => {
  onRefresh(null)
  clearGreetingTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Error state -->
    <DashboardErrorState v-if="error && !isLoading" :error="error" @retry="retry" />

    <template v-else>
      <!-- Welcome Hero (Enhanced Onboarding) -->
      <DashboardOnboardingHero
        v-if="!isLoading && isNewAccount"
        :user-name="dashboardData?.greeting?.name"
        :quick-setup="quickSetup"
        :show-quick-setup="showQuickSetup"
        @start-now="emit('start-now')"
        @create-first-queue="emit('create-first-queue')"
        @step-click="emit('step-click', $event)"
      />

      <!-- Greeting + Active State Content -->
      <template v-if="!isNewAccount || isLoading">
        <!-- Header Section -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div v-if="!isNewAccount">
            <h2
              data-testid="greeting-header"
              class="font-display text-xl font-bold text-plum sm:text-2xl"
            >
              {{ isLoading ? 'Loading...' : greeting }}
            </h2>
            <p
              v-if="!isLoading"
              data-testid="current-date"
              class="font-body text-[10px] text-plum-muted sm:text-xs"
            >
              {{ dateString }}
            </p>
          </div>

          <button
            v-if="!isLoading"
            :disabled="isRefreshing"
            class="hidden sm:flex items-center justify-center gap-2 rounded-xl border border-plum-faint bg-white px-3 py-1.5 font-body text-sm font-bold uppercase tracking-widest text-plum-muted transition-all hover:border-plum hover:text-plum shadow-sm dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            @click="retry"
          >
            <RefreshCw class="h-3 w-3 opacity-60" :class="{ 'animate-spin': isRefreshing }" />
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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
