<script setup lang="ts">
/**
 * @component ErrorView
 * @description A generic, reusable error page for various application failures (404, 500, auth errors, etc.).
 * Standardized with QueueBuzz UI (Sand background, white card, plum text).
 */
import { computed } from 'vue'

import Logo from '@/assets/icons/logo.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  title?: string
  errorCode?: string
  message?: string
  requestId?: string
  actionText?: string
  actionPath?: string
  supportEmail?: string
  showContact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  errorCode: 'INTERNAL_ERROR',
  message:
    "We couldn't quite complete that action. This usually happens due to a temporary connection issue or an expired security session. Please try again in a moment.",
  requestId: undefined,
  actionText: 'Retry',
  actionPath: '/login-or-signup',
  supportEmail: 'support@queuebuzz.com',
  showContact: true,
})

const finalRequestId = computed(
  () => props.requestId || 'qb_' + Math.random().toString(36).substring(2, 12),
)
</script>

<template>
  <div
    class="min-h-screen bg-sand flex flex-col items-center justify-center p-6 text-plum selection:bg-mint selection:text-plum"
  >
    <!-- Branding Section -->
    <router-link to="/" class="mb-12 flex flex-col items-center gap-4 group">
      <Logo class="h-14 w-14" />
      <h1 class="font-display text-3xl font-bold tracking-tight text-plum">{{ title }}</h1>
    </router-link>

    <!-- Error Card -->
    <div
      class="w-full max-w-[480px] bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_40px_rgba(26,10,46,0.06)] animate-in fade-in zoom-in-95 duration-500"
    >
      <div class="space-y-6">
        <div class="text-center md:text-left">
          <p class="font-body text-base md:text-lg leading-relaxed text-plum whitespace-pre-line">
            {{ message }}
          </p>
          <p
            v-if="errorCode"
            class="mt-2 font-mono text-xs font-semibold text-plum-muted uppercase tracking-wider"
          >
            Error Code: {{ errorCode }}
          </p>
        </div>

        <div v-if="showContact" class="p-6 bg-sand rounded-2xl border border-plum-faint">
          <p class="font-body text-sm leading-relaxed text-plum-muted">
            You can contact us through our help center at
            <a :href="`mailto:${supportEmail}`" class="text-plum font-semibold hover:underline">
              {{ supportEmail }}
            </a>
            if you keep seeing this error. (Please include the request ID
            <span class="font-mono text-xs font-semibold text-plum">{{ finalRequestId }}</span>
            in your email).
          </p>
        </div>

        <div class="pt-4">
          <BaseButton
            variant="primary"
            class="w-full !rounded-pill"
            @click="$router.push(actionPath)"
          >
            {{ actionText }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Legal Footer -->
    <div class="mt-12 flex items-center gap-6 font-body text-xs text-plum-muted">
      <router-link to="/terms" class="hover:text-plum transition-colors font-medium"
        >Terms</router-link
      >
      <div class="h-1 w-1 rounded-full bg-plum-faint" />
      <router-link to="/privacy" class="hover:text-plum transition-colors font-medium"
        >Privacy</router-link
      >
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
