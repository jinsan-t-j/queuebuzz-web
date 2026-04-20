<script setup>
/**
 * @component CreateQueueView
 * @description Unified queue view. Shows the creation form initially,
 * then transitions to the live queue dashboard after successful creation.
 * Uses v-if to fully unmount the form once the queue is live.
 */

import { ref, defineAsyncComponent, onMounted, onUnmounted, computed } from 'vue'
import router from '@/router'

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'

const CreateQueueForm = defineAsyncComponent(
  () => import('@/modules/app/queue/components/CreateQueueForm.vue'),
)
const LiveQueueView = defineAsyncComponent(() => import('./LiveQueueView.vue'))
const InfoQueueModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/InfoQueueModal.vue'),
)

const { activeQueue, initializeHostQueue, disposeLiveQueue } = useLiveQueue()

const showSuccessModal = ref(false)

function handleQueueCreated() {
  showSuccessModal.value = true
}

const queueUrl = computed(() => {
  if (!activeQueue.value) return ''

  return router.resolve({ name: 'guest-host-live-queue', params: { id: activeQueue.value?.id } })
    .href
})

onMounted(async () => {
  await initializeHostQueue()
})

onUnmounted(() => {
  disposeLiveQueue()
})
</script>

<template>
  <!-- ═══ Create form (unmounted once queue is live) ═══ -->
  <div v-if="!activeQueue" class="mx-auto max-w-[680px]">
    <h1 class="font-display text-[40px] font-extrabold text-plum">Let's get started.</h1>

    <CreateQueueForm role="host" @queue-created="handleQueueCreated" />
  </div>

  <!-- ═══ Live queue dashboard ═══ -->
  <LiveQueueView v-if="activeQueue" />

  <!-- ═══ Success modal (shown once after creation) ═══ -->
  <InfoQueueModal
    v-if="activeQueue"
    :is-open="showSuccessModal"
    variant="success"
    :queue-name="activeQueue.name"
    :join-code="activeQueue.joinCode"
    :queue-url="queueUrl"
    @close="showSuccessModal = false"
  />
</template>
