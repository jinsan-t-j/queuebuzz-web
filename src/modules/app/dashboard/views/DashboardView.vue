<script setup>
/**
 * @component DashboardView
 * @description Host dashboard showing active queue status, weekly performance,
 * recent sessions, return rate charts, heatmaps, and onboarding checklist.
 * Handles both active (populated) and empty (new account) states.
 */

// 1. Vue core imports
import { ref, shallowRef, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { ArrowRight, AlertCircle } from 'lucide-vue-next'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables
import { useDashboardApi } from '../composables/useDashboardApi'

// 5. Component imports
import BaseButton from '@/components/base/BaseButton.vue'
import QueueStatusBar from '../components/QueueStatusBar.vue'
import DashboardStatCard from '../components/DashboardStatCard.vue'

// 6. Macros
const emit = defineEmits([
  'go-to-queue',
  'start-queue',
  'start-now',
  'select-session',
  'view-history',
  'create-first-queue',
  'step-click',
])

// 7. Below-fold async components
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

// 8. Composable destructuring
const { isLoading, error, fetchDashboard } = useDashboardApi()

// 9. Reactive state
const dashboardData = shallowRef(null)
const currentHour = ref(new Date().getHours())
let greetingTimer = null

// 10. Computed properties
const isNewAccount = computed(() => !dashboardData.value?.recentSessions?.length)

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

const activeQueue = computed(() => dashboardData.value?.activeQueue || {})
const stats = computed(() => dashboardData.value?.stats || {})
const weekChart = computed(() => dashboardData.value?.weekChart || [])
const recentSessions = computed(() => dashboardData.value?.recentSessions || [])
const returnRate = computed(() => dashboardData.value?.returnRate || { hasData: false })
const droppedSkipped = computed(() => dashboardData.value?.droppedSkipped || [])
const peakHours = computed(() => dashboardData.value?.peakHours || [])
const quickSetup = computed(() => dashboardData.value?.quickSetup || { show: false, steps: [] })

const showQuickSetup = computed(() => {
  const setup = quickSetup.value
  if (!setup.steps?.length) return false
  // Show if explicitly flagged or if new account
  return setup.show || isNewAccount.value || setup.steps.some((s) => !s.isDone)
})

const allStepsDone = computed(() => {
  return quickSetup.value.steps?.every((s) => s.isDone) ?? false
})

const hasWeekData = computed(() => {
  return weekChart.value.some((d) => d.value > 0 && !d.isFuture)
})

const hasPeakData = computed(() => peakHours.value.length > 0 && !isNewAccount.value)

// 11. Methods
async function loadDashboard() {
  dashboardData.value = await fetchDashboard()
}

function retry() {
  loadDashboard()
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
  <div class="flex flex-col gap-8">
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
      <!-- Welcome Banner (new account only) -->
      <div
        v-if="!isLoading && isNewAccount"
        class="flex flex-col gap-2 rounded-xl border border-mint/10 bg-mint-light/40 px-8 py-8 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-2">
          <h1 class="font-display text-lg font-bold text-plum">
            Welcome to QueueBuzz, {{ dashboardData?.greeting?.name || 'John Doe' }}
          </h1>
          <p class="max-w-lg font-body text-base text-plum-muted leading-relaxed">
            Let's get your first queue set up and manage your customers efficiently. Your dashboard
            will start showing data as soon as customers join.
          </p>
        </div>
        <button
          class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-mint/80 px-6 py-3 font-body text-base font-bold text-plum transition-colors hover:bg-mint"
          @click="emit('start-now')"
        >
          Start now
          <ArrowRight class="h-4 w-4" />
        </button>
      </div>

      <!-- Greeting + Queue Status Bar (active account) -->
      <template v-if="!isNewAccount || isLoading">
        <!-- Greeting -->
        <div>
          <h2 class="font-display text-[22px] font-bold text-plum">
            {{ isLoading ? '' : greeting }}
          </h2>
          <p v-if="!isLoading" class="mt-1 font-body text-[13px] text-plum-muted">
            {{ dateString }}
          </p>
        </div>

        <!-- Queue Status Bar -->
        <QueueStatusBar
          v-if="!isLoading"
          v-memo="[activeQueue.queueName, activeQueue.isActive]"
          :queue-name="activeQueue.queueName"
          :started-at="activeQueue.startedAt"
          :is-active="activeQueue.isActive"
          @go-to-queue="emit('go-to-queue')"
          @start-queue="emit('start-queue')"
        />
      </template>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
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

      <!-- Two Column Layout -->
      <div v-if="!isLoading" class="flex flex-col gap-8 md:flex-row">
        <!-- Left Column (wider) -->
        <div class="flex flex-col gap-8 md:flex-[1.4] md:min-w-0">
          <!-- Week Chart -->
          <DashboardWeekChart :data="weekChart" :has-data="hasWeekData" />

          <!-- Return Rate (hidden entirely when no data / empty state) -->
          <DashboardReturnRate
            v-if="returnRate.hasData"
            :chart-data="returnRate.chartData"
            :by-queue="returnRate.byQueue"
            :has-data="returnRate.hasData"
          />

          <!-- Return Rate empty state for new accounts -->
          <DashboardReturnRate v-if="isNewAccount" :has-data="false" />

          <!-- Quick Setup (visible when steps remain) -->
          <DashboardQuickSetup
            v-if="showQuickSetup && !allStepsDone"
            :steps="quickSetup.steps"
            @step-click="emit('step-click', $event)"
          />
        </div>

        <!-- Right Column (narrower) -->
        <div class="flex flex-col gap-8 md:flex-1 md:min-w-0">
          <!-- Recent Sessions -->
          <DashboardRecentSessions
            :sessions="recentSessions"
            :is-loading="false"
            @select-session="emit('select-session', $event)"
            @view-history="emit('view-history')"
            @create-first-queue="emit('create-first-queue')"
          />

          <!-- Dropped & Skipped -->
          <DashboardDroppedSkipped :data="droppedSkipped" />

          <!-- Peak Hours -->
          <DashboardPeakHours :data="peakHours" :has-data="hasPeakData" />
        </div>
      </div>

      <!-- Loading skeleton for two-column area -->
      <div v-if="isLoading" class="flex flex-col gap-8 md:flex-row">
        <div class="flex flex-col gap-8 md:flex-[1.4]">
          <div class="h-72 rounded-[14px] bg-plum-faint animate-pulse" />
          <div class="h-96 rounded-xl bg-plum-faint animate-pulse" />
        </div>
        <div class="flex flex-col gap-8 md:flex-1">
          <div class="h-80 rounded-2xl bg-plum-faint animate-pulse" />
          <div class="h-48 rounded-xl bg-plum-faint animate-pulse" />
          <div class="h-36 rounded-xl bg-plum-faint animate-pulse" />
        </div>
      </div>
    </template>
  </div>
</template>
