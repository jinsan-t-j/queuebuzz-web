<script setup lang="ts">
/**
 * @component EntryEndedView
 * @description View shown when a customer's queue session ends (left, skipped, or queue closed).
 */
import { computed, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useQueueStore } from '@/stores/queue.store'

// Icons
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'
import ErrorCircleIcon from '@/assets/icons/error-circle.svg?component'
import WarningTriangleIcon from '@/assets/icons/warning-triangle.svg?component'
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?component'

import BaseButton from '@/components/base/BaseButton.vue'
import CustomerHeader from '@/modules/customer/components/CustomerHeader.vue'

const props = defineProps({
  reason: {
    type: String,
    default: 'unknown',
  },
})

const router = useRouter()
const route = useRoute()
const queueStore = useQueueStore()
const { activeQueue } = storeToRefs(queueStore)

onBeforeMount(async () => {
  const queueId = route.params.queueId as string
  if (queueId) {
    await queueStore.initializeQueueById(queueId)
  }
})

const config = computed(() => {
  switch (props.reason?.toLowerCase()) {
    case 'left':
      return {
        title: "You've left the queue",
        description: 'Your spot has been released. We hope to see you again soon!',
        icon: CheckCircleIcon,
        iconColor: 'text-mint-dark',
        bgColor: 'bg-mint-light',
      }
    case 'expired':
    case 'terminated':
      return {
        title: 'Queue has ended',
        description:
          'The host has closed this queue session. All remaining entries have been cleared. Please Contact the host or administractor to know more.',
        icon: ErrorCircleIcon,
        iconColor: 'text-danger',
        bgColor: 'bg-[#FEF2F2]',
      }
    default:
      return {
        title: 'Session ended',
        description:
          'Your queue session is no longer active. You can join a new queue at any time.',
        icon: WarningTriangleIcon,
        iconColor: 'text-plum-muted',
        bgColor: 'bg-plum-faint',
      }
  }
})

function handleGoHome() {
  router.push('/')
}
</script>

<template>
  <div class="relative flex flex-col min-h-[80vh]">
    <CustomerHeader
      v-if="activeQueue"
      :name="activeQueue.name"
      :profile-url="activeQueue.hostProfileImageUrl"
      :banner-url="activeQueue.hostBannerImageUrl"
    />

    <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <!-- Blob decorations -->
      <div
        class="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-mint-light/30 blur-[100px] z-0"
      />
      <div
        class="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-warning/20 blur-[100px] z-0"
      />

      <div class="relative z-10 w-full max-w-sm">
        <!-- Status Icon -->
        <div
          :class="[
            'mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] shadow-sm',
            config.bgColor,
          ]"
        >
          <component :is="config.icon" :class="['h-12 w-12', config.iconColor]" />
        </div>

        <!-- Text Content -->
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-plum">
          {{ config.title }}
        </h1>
        <p class="mt-4 font-body text-base leading-relaxed text-plum-muted px-4">
          {{ config.description }}
        </p>

        <!-- Action -->
        <div class="mt-12">
          <BaseButton
            variant="primary"
            class="w-full py-4 text-base font-bold shadow-xl shadow-mint/20"
            @click="handleGoHome"
          >
            Find another queue
            <ArrowRightIcon class="ml-2 h-4 w-4" />
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
