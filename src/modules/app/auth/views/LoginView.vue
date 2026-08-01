<script setup lang="ts">
/**
 * @component LoginView
 * @description Simplified login page.
 */
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Logo from '@/assets/icons/logo.svg?component'
import LoginForm from '@/modules/app/auth/components/LoginForm.vue'

const route = useRoute()
const router = useRouter()

const claimQueueId = computed(() => route.query.claim_queue_id as string | undefined)
const hasClaimParam = computed(() => !!claimQueueId.value)

const dismissedQueue = ref<{ id: string; name: string } | null>(null)
const dismissedQueueName = ref<string | null>(null)

const ClaimContextChip = defineAsyncComponent(
  () => import('@/modules/app/auth/components/ClaimContextChip.vue'),
)

function handleDismissClaim(queueInfo: { id: string; name: string }) {
  dismissedQueue.value = queueInfo
  dismissedQueueName.value = queueInfo.name
  router.replace({ query: { ...route.query, claim_queue_id: undefined } })
}

function handleRestoreClaim() {
  if (dismissedQueue.value) {
    const queueId = dismissedQueue.value.id
    router.replace({ query: { ...route.query, claim_queue_id: queueId } })
    dismissedQueue.value = null
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-10 sm:py-12">
    <!-- Logo -->
    <router-link to="/" class="mb-8 sm:mb-12 flex flex-col items-center gap-4">
      <Logo class="h-10 w-10 sm:h-12 sm:w-12" />
      <span class="font-display text-lg sm:text-xl font-bold text-plum tracking-tight">
        QueueBuzz
      </span>
    </router-link>

    <ClaimContextChip
      v-if="hasClaimParam"
      :initial-name="dismissedQueueName || undefined"
      @close="handleDismissClaim"
    />

    <div
      class="w-full max-w-[440px] bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-[0_8px_40px_rgba(26,10,46,0.06)]"
    >
      <div class="text-center mb-6 sm:mb-8">
        <h1 class="font-display text-2xl sm:text-3xl font-bold text-plum mb-3">
          Log in or sign up
        </h1>
        <p class="font-body text-sm sm:text-base text-plum-muted leading-relaxed">
          The simplest way to manage your physical queues and delight your customers.
        </p>
      </div>

      <LoginForm />
    </div>

    <!-- Restore Claim Prompt -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="dismissedQueue"
        class="mt-6 flex flex-col items-center gap-2 px-5 py-4 rounded-3xl bg-white border border-plum-faint shadow-[0_4px_24px_rgba(26,10,46,0.04)] max-w-[440px] w-full text-center"
      >
        <p class="font-body text-sm text-plum-muted">
          Not claiming
          <span class="font-semibold text-plum">"{{ dismissedQueue.name }}"</span> anymore?
        </p>
        <button
          type="button"
          class="font-body text-xs font-semibold text-mint hover:underline flex items-center gap-1.5 focus:outline-none cursor-pointer"
          @click="handleRestoreClaim"
        >
          <svg
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add queue claim back
        </button>
      </div>
    </Transition>

    <!-- Legal footer -->
    <div class="mt-12 text-center max-w-xs">
      <p class="font-body text-xs text-plum-muted leading-relaxed">
        By continuing, you agree to our
        <router-link to="/terms" class="text-plum font-semibold hover:underline"
          >Terms of Service</router-link
        >
        &
        <router-link to="/privacy" class="text-plum font-semibold hover:underline"
          >Privacy Policy</router-link
        >.
      </p>
    </div>
  </div>
</template>
