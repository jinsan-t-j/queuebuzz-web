<script setup>
/**
 * @component CreateQueueView
 * @description Unified queue view. Shows the creation form initially,
 * then transitions to the live queue dashboard after successful creation.
 * Uses v-if to fully unmount the form once the queue is live.
 */

import { ref, defineAsyncComponent, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import { useToast } from '@/composables/useToast'

import ClaimConflictModal from '../components/ClaimConflictModal.vue'

const CreateQueueForm = defineAsyncComponent(
  () => import('@/modules/app/queue/components/CreateQueueForm.vue'),
)
const LiveQueueView = defineAsyncComponent(() => import('./LiveQueueView.vue'))
const InfoQueueModal = defineAsyncComponent(
  () => import('@/modules/app/queue/components/InfoQueueModal.vue'),
)

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

const {
  activeQueue,
  initializeHostQueue,
  disposeLiveQueue,
  claimAnonymousQueue,
  terminate: terminateQueue,
} = useLiveQueue()

const showSuccessModal = ref(false)
const showConflictModal = ref(false)

const claimQueueId = computed(() => route.query.claim_queue_id)

function handleQueueCreated() {
  showSuccessModal.value = true
}

const queueUrl = computed(() => {
  if (!activeQueue.value) return ''

  return router.resolve({ name: 'guest-host-live-queue', params: { id: activeQueue.value?.id } })
    .href
})

async function handleClaimIntent() {
  const id = claimQueueId.value
  if (!id) return

  // If already matches current active queue, just clean up query
  if (activeQueue.value?.id === id) {
    cleanClaimQuery()
    return
  }

  // If conflict with existing active queue
  if (activeQueue.value) {
    showConflictModal.value = true
  } else {
    // No conflict, safe to claim
    performClaim()
  }
}

function cleanClaimQuery() {
  router.replace({ query: { ...route.query, claim_queue_id: undefined } })
}

async function performClaim() {
  if (!claimQueueId.value) return
  const success = await claimAnonymousQueue(claimQueueId.value)
  if (success) {
    showToast('Queue claimed successfully!', { type: 'success' })
    cleanClaimQuery()
  }
}

async function onConfirmReplace() {
  showConflictModal.value = false
  const terminated = await terminateQueue()
  if (terminated) {
    await performClaim()
  }
}

function onCancelClaim() {
  showConflictModal.value = false
  cleanClaimQuery()
}

onMounted(async () => {
  await initializeHostQueue()

  if (claimQueueId.value) {
    await handleClaimIntent()
  }
})

// Also watch for query changes (e.g. if arriving on /queue directly)
watch(claimQueueId, (newId) => {
  if (newId) handleClaimIntent()
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

  <!-- ═══ Conflict modal ═══ -->
  <ClaimConflictModal
    :is-open="showConflictModal"
    :old-queue-name="activeQueue?.name"
    @confirm="onConfirmReplace"
    @cancel="onCancelClaim"
  />
</template>
