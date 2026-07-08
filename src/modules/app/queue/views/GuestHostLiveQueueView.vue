<script setup lang="ts">
/**
 * @view GuestHostLiveQueueView
 * @description Anonymous guest host live queue dashboard.
 * Focuses on session lifecycle and specialized guest redirections.
 */
import { onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import { QUEUE_ERROR_REASONS } from '@/modules/app/queue/constants'
import { formatWaitTime } from '@/utils/format'

import LiveQueueDashboardLayout from '../components/LiveQueueDashboardLayout.vue'

const router = useRouter()
const route = useRoute()
const {
  activeQueue,
  isLoading,
  error,
  servedTodayCount,
  revalidateQueue,
  disposeLiveQueue,
  isTerminating,
} = useLiveQueue()

const queueId = route.params.id as string

// Keep track of last known data for the summary screen after termination
const lastSessionData = ref({
  servedCount: 0,
  avgMins: 0,
  createdAt: null,
  notes: '',
})

watch(
  activeQueue,
  (val) => {
    if (val) {
      lastSessionData.value = {
        servedCount: servedTodayCount.value,
        avgMins: val.avgServiceMins || 2,
        createdAt: val.createdAt,
        notes: val.notes || '',
      }
    }
  },
  { immediate: true },
)

// Also watch servedTodayCount because it updates independently of activeQueue
watch(servedTodayCount, (val) => {
  if (activeQueue.value) {
    lastSessionData.value.servedCount = val
  }
})

onBeforeMount(async () => {
  try {
    await revalidateQueue(queueId)
  } finally {
    if (!activeQueue.value && !error.value && !isLoading.value) {
      handleRedirection(QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND)
    }
  }
})

onUnmounted(() => {
  disposeLiveQueue()
})

watch(error, (newError) => {
  if (newError) handleRedirection(newError as string)
})

watch(activeQueue, (newQueue, oldQueue) => {
  if (isTerminating.value) return
  if (!newQueue && oldQueue && !isLoading.value) {
    handleRedirection(QUEUE_ERROR_REASONS.QUEUE_ENDED)
  }
})

function handleRedirection(reason: string) {
  router.push({
    name: 'guest-host-queue-ended',
    query: { reason },
  })
}

/**
 * Handle queue termination - redirects guest host to the completion summary page.
 */
async function onStatusUpdateConfirmed({
  mode,
  success,
}: {
  mode: 'pause' | 'resume' | 'terminate'
  success: boolean
}) {
  const isTerminate = mode === 'terminate'

  if (success && isTerminate) {
    const { servedCount, avgMins, createdAt } = lastSessionData.value
    let durationFormatted = '0m'

    if (createdAt) {
      const startTime = new Date(createdAt).getTime()
      const now = Date.now()
      const diffMins = Math.max(0, Math.round((now - startTime) / (1000 * 60)))
      durationFormatted = formatWaitTime(diffMins)
    }

    router.push({
      name: 'guest-host-complete',
      params: { id: queueId },
      query: {
        served: servedCount.toString(),
        total: durationFormatted,
        avg: formatWaitTime(avgMins),
        notes: lastSessionData.value.notes,
      },
    })
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-sand">
    <!-- Guest-specific decorations -->
    <div
      class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]"
    />
    <div
      class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]"
    />

    <div class="relative z-10 mx-auto max-w-[1280px] px-6 pt-4 pb-2">
      <LiveQueueDashboardLayout
        show-toast-layer
        show-notifications
        @status-confirmed="onStatusUpdateConfirmed"
      >
        <template #footer>
          <footer class="py-6 text-center">
            <p class="font-body text-sm text-plum-muted">
              Want to manage with a dashboard?
              <router-link
                :to="{ name: 'login', query: { claim_queue_id: queueId } }"
                class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
              >
                Create a free account
              </router-link>
            </p>
          </footer>
        </template>
      </LiveQueueDashboardLayout>
    </div>
  </div>
</template>
