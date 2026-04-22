<script setup>
/**
 * @component DashboardView
 * @description Host dashboard showing active queue status, weekly performance,
 * recent sessions, return rate charts, heatmaps, and onboarding checklist.
 * Handles both active (populated) and empty (new account) states.
 */

import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { ArrowRight, AlertCircle } from 'lucide-vue-next'

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
const { isLoading, error, data: dashboardData } = storeToRefs(dashboardStore)

const currentHour = ref(new Date().getHours())
let greetingTimer = null

const isNewAccount = computed(
  () => !dashboardData.value?.recentSessions?.length && !isLoading.value,
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
  await dashboardStore.fetchDashboard()
}

function retry() {
  dashboardStore.fetchDashboard(true) // Force fetch
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

      <!-- Greeting + Active State Content -->
      <template v-if="!isNewAccount || isLoading">
        <!-- Greeting -->
        <div v-if="!isNewAccount">
          <h2 class="font-display text-[22px] font-bold text-plum">
            {{ isLoading ? '' : greeting }}
          </h2>
          <p v-if="!isLoading" class="mt-1 font-body text-sm text-plum-muted">
            {{ dateString }}
          </p>
        </div>

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
        <div class="flex flex-col gap-8 md:flex-row">
          <!-- Main Stats Col (Left) -->
          <div class="flex flex-col gap-8 md:flex-[1.4]">
            <!-- Active Queue Stat (Primary) -->
            <QueueStatusBar
              :queue-name="activeQueue?.queueName"
              :started-at="activeQueue?.startedAt"
              :is-active="activeQueue?.isActive"
              :is-loading="isLoading"
              @go-to-queue="emit('go-to-queue', $event)"
              @start-queue="emit('start-queue')"
            />

            <!-- Week Overview Chart -->
            <DashboardWeekChart :data="weekChart" :has-data="hasWeekData" :is-loading="isLoading" />

            <!-- Quick Setup (visible when steps remain) -->
            <DashboardQuickSetup
              v-if="showQuickSetup && !allStepsDone"
              :steps="quickSetup.steps"
              @step-click="emit('step-click', $event)"
            />
          </div>

          <!-- Secondary Charts Col (Right) -->
          <div class="flex flex-col gap-8 md:flex-1">
            <!-- Return Rate -->
            <DashboardReturnRate
              :chart-data="returnRate?.chartData || []"
              :returning-count="returnRate?.returningCount || 0"
              :has-data="returnRate?.hasData"
              :is-loading="isLoading"
              @timeframe-change="dashboardStore.fetchDashboard(true)"
            />

            <!-- Recent Sessions -->
            <DashboardRecentSessions
              :sessions="recentSessions"
              :is-loading="isLoading"
              @select-session="emit('select-session', $event)"
              @view-history="emit('view-history')"
              @create-first-queue="emit('create-first-queue')"
            />

            <!-- Dropped & Skipped -->
            <DashboardDroppedSkipped :data="droppedSkipped" :is-loading="isLoading" />

            <!-- Peak Hours -->
            <DashboardPeakHours :data="peakHours" :has-data="hasPeakData" :is-loading="isLoading" />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
