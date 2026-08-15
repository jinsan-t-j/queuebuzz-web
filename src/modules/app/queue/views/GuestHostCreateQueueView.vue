<script setup lang="ts">
/**
 * @component GuestHostCreateQueueView
 * @description Anonymous (guest) host queue creation form. Same form layout
 * as CreateQueueView but without sidebar/auth chrome. Includes a footer
 * link nudging the user to create a free account for URL customization.
 */

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import CreateQueueForm from '@/modules/app/queue/components/CreateQueueForm.vue'
import type { QueueRecord } from '@/modules/app/queue/types'

import InfoQueueModal from '../components/InfoQueueModal.vue'

const router = useRouter()

const activeQueueData = ref<QueueRecord | null>(null)
const showSuccessModal = ref(false)

function handleQueueCreated(queueData: QueueRecord) {
  activeQueueData.value = queueData
  showSuccessModal.value = true
}

const queueUrl = computed(() => {
  if (!activeQueueData.value) return ''

  return router.resolve({
    name: 'guest-host-live-queue',
    params: { id: activeQueueData.value?.id },
  }).href
})

function goToSignup() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-[680px] px-6 py-6">
      <h1 class="font-display text-[40px] font-extrabold text-plum">Let's get started.</h1>

      <CreateQueueForm
        :role="'guest'"
        @create-account="goToSignup"
        @queue-created="handleQueueCreated"
      />
    </div>
  </div>

  <!-- ═══ Success modal (shown once after creation) ═══ -->
  <InfoQueueModal
    v-if="activeQueueData"
    :is-open="showSuccessModal"
    variant="success"
    :queue-name="activeQueueData.name"
    :redirect-url="queueUrl"
    :join-code="activeQueueData.joinCode"
    :queue-url="queueUrl"
    @close="showSuccessModal = false"
  />
</template>
