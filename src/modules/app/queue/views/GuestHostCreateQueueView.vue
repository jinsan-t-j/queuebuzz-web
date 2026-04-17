<script setup>
/**
 * @component GuestHostCreateQueueView
 * @description Anonymous (guest) host queue creation form. Same form layout
 * as CreateQueueView but without sidebar/auth chrome. Includes a footer
 * link nudging the user to create a free account for URL customization.
 */

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import CreateQueueForm from '@/modules/app/queue/components/CreateQueueForm.vue'
import QueueCreatedModal from '../components/QueueCreatedModal.vue'

const router = useRouter()

const activeQueueData = ref(null)
const showSuccessModal = ref(false)

function handleQueueCreated(queueData) {
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
  router.push('/login')
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div
      class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]"
    />
    <div
      class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]"
    />

    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-[680px] px-6 py-6">
      <h1 class="font-display text-[40px] font-extrabold text-plum">Let's get started.</h1>

      <CreateQueueForm
        role="guest"
        @create-account="goToSignup"
        @queue-created="handleQueueCreated"
      />
    </div>
  </div>

  <!-- ═══ Success modal (shown once after creation) ═══ -->
  <QueueCreatedModal
    v-if="activeQueue"
    :is-open="showSuccessModal"
    :join-code="activeQueueData.joinCode"
    :queue-url="queueUrl"
    @close="showSuccessModal = false"
  />
</template>
