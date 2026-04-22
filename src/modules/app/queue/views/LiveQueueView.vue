<script setup lang="ts">
/**
 * @view LiveQueueView
 * @description Authenticated host live queue dashboard.
 * Focuses on business logic while delegating layout to LiveQueueDashboardLayout.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

import LiveQueueDashboardLayout from '../components/LiveQueueDashboardLayout.vue'

const router = useRouter()
const { initializeHostQueue } = useLiveQueue()

onMounted(async () => {
  await initializeHostQueue()
})

async function onStatusUpdateConfirmed({ mode, success }: { mode: string; success: boolean }) {
  if (success && mode === 'terminate') {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="mx-auto max-w-[1200px]">
    <LiveQueueDashboardLayout @status-confirmed="onStatusUpdateConfirmed" />
  </div>
</template>
