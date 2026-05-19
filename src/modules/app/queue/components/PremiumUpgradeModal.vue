<script setup lang="ts">
/**
 * @component PremiumUpgradeModal
 * @description Beautiful, premium marketing modal asking hosts to upgrade or log in.
 */
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  isLimitReached: { type: Boolean, default: false },
  queueId: { type: String, default: '' },
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const router = useRouter()

function handleAction() {
  emit('close')
  if (authStore.isAuthenticated) {
    // Navigate to settings with billing tab
    router.push({ name: 'settings', query: { tab: 'billing' } })
  } else {
    // Navigate to login/signup with claim queue query
    router.push({ name: 'login', query: { claim_queue_id: props.queueId } })
  }
}

function handleLoginRedirect() {
  emit('close')
  router.push({ name: 'login', query: { claim_queue_id: props.queueId } })
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="p-8 sm:p-10 font-body relative overflow-hidden">
      <!-- Decorative gradient shapes -->
      <div
        class="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-mint-light/40 blur-2xl pointer-events-none"
      />
      <div
        class="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-plum-faint/60 blur-2xl pointer-events-none"
      />

      <div class="relative z-10 text-center">
        <!-- Visual Badge -->
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300"
          :class="isLimitReached ? 'bg-danger/10 text-danger' : 'bg-mint-light text-plum'"
        >
          <svg
            v-if="isLimitReached"
            class="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <svg v-else class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>

        <h2 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-plum">
          {{ isLimitReached ? 'Unlock Active Capacity' : 'Go Premium with QueueBuzz' }}
        </h2>

        <p class="mt-3 text-sm sm:text-base leading-relaxed text-plum-soft">
          {{
            isLimitReached
              ? "You've reached the free tier limit of 25 active guests. Upgrade to Premium or create an account to admit more guests."
              : 'Scale your waitlist operations and elevate customer experience with professional features.'
          }}
        </p>

        <!-- Feature List -->
        <div
          class="my-8 rounded-3xl border border-plum-faint bg-sand/30 p-5 text-left flex flex-col gap-4"
        >
          <div class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-mint-light flex items-center justify-center mt-0.5">
              <svg
                class="w-3 h-3 text-plum font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-plum">Unlimited Active Guests</p>
              <p class="text-xs text-plum-muted">
                Admit as many waiting and served customers as you want.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-mint-light flex items-center justify-center mt-0.5">
              <svg
                class="w-3 h-3 text-plum font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-plum">Deep Analytics & Trends</p>
              <p class="text-xs text-plum-muted">
                Understand peak hours and queue efficiency with rich charts.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-mint-light flex items-center justify-center mt-0.5">
              <svg
                class="w-3 h-3 text-plum font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-plum">CSV Reports & History</p>
              <p class="text-xs text-plum-muted">
                Export customer details for CRM tools and full session logs.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-mint-light flex items-center justify-center mt-0.5">
              <svg
                class="w-3 h-3 text-plum font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-plum">Custom Banner & Branding</p>
              <p class="text-xs text-plum-muted">
                Personalize waitlist screens with your own shop brand identity.
              </p>
            </div>
          </div>
        </div>

        <!-- Action Area -->
        <div class="flex flex-col gap-3">
          <BaseButton
            variant="primary"
            size="lg"
            class="w-full bg-plum text-sand hover:bg-plum-soft font-bold shadow-lg"
            @click="handleAction"
          >
            {{
              authStore.isAuthenticated
                ? 'Upgrade to Premium'
                : isLimitReached
                  ? 'Claim Queue & Upgrade'
                  : 'Claim My Queue (Free)'
            }}
          </BaseButton>

          <BaseButton
            v-if="!authStore.isAuthenticated"
            variant="ghost"
            size="lg"
            class="w-full font-bold text-plum/60 hover:text-plum"
            @click="handleLoginRedirect"
          >
            Log in to existing account
          </BaseButton>

          <BaseButton
            variant="ghost"
            size="lg"
            class="w-full font-bold text-plum/40 hover:text-plum mt-1"
            @click="$emit('close')"
          >
            Cancel
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
