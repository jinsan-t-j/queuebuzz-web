<script setup lang="ts">
/**
 * @component GuestHostExpiredQueueView
 * @description Page shown when a guest session has expired (e.g., reached 24h limit).
 * Encourages the user to create an account to avoid losing data in the future.
 */

// 1. Vue core imports

import { useMutation } from '@tanstack/vue-query'
import { computed, ref } from 'vue'

// 5. Component imports
import ArrowRightMutedIcon from '@/assets/icons/arrow-right-muted.svg?component'
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?component'
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'
import CheckMintIcon from '@/assets/icons/check-mint.svg?component'
import ClockWarningOrangeIcon from '@/assets/icons/clock-warning-orange.svg?component'
import ErrorCircleIcon from '@/assets/icons/error-circle.svg?component'
import LockIcon from '@/assets/icons/lock.svg?component'
import WarningTriangleIcon from '@/assets/icons/warning-triangle.svg?component'
import { useToast } from '@/composables/useToast'
import { authenticate } from '@/modules/app/auth/actions/auth.actions'
import { QUEUE_ERROR_REASONS } from '@/modules/app/queue/constants'
import { getErrorMessage } from '@/utils/api-response'

const props = defineProps({
  reason: {
    type: String,
    default: QUEUE_ERROR_REASONS.SESSION_EXPIRED,
  },
  email: {
    type: String,
    default: '',
  },
})
const { showToast } = useToast()

const localEmail = ref(props.email)

const { mutate: mutateAuth, isPending } = useMutation({
  mutationFn: async (userEmail: string) => {
    return await authenticate(userEmail)
  },
  onSuccess: (data) => {
    if (data.redirectUrl) {
      showToast(`Account found. Redirecting to ${data.provider} login...`)
      globalThis.location.assign(data.redirectUrl)
    } else {
      showToast(data?.message || 'Check your email for the magic link.')
    }
  },
  onError: (error: unknown) => {
    showToast(getErrorMessage(error, 'Authentication failed'), { type: 'error' })
  },
})

const features = ref([
  '24h+ active queue duration',
  'Lifetime performance history',
  'Customizable queue branding',
  'Priority SMS notifications',
])

const config = computed(() => {
  switch (props.reason) {
    case QUEUE_ERROR_REASONS.TERMINATED:
      return {
        title: 'Queue Terminated',
        description:
          "You've successfully ended this session. Sign up to save your history and performance analytics.",
        icon: CheckCircleIcon,
        iconColor: 'text-mint',
        bgColor: 'bg-mint-light',
      }
    case QUEUE_ERROR_REASONS.QUEUE_ENDED:
      return {
        title: 'Queue Ended',
        description:
          'This queue has been successfully ended. Create an account to save your dashboard settings and history.',
        icon: CheckCircleIcon,
        iconColor: 'text-mint',
        bgColor: 'bg-mint-light',
      }
    case QUEUE_ERROR_REASONS.QUEUE_NOT_FOUND:
      return {
        title: 'Queue Not Found',
        description: "The queue you're looking for doesn't exist or has been deleted by the host.",
        icon: ErrorCircleIcon,
        iconColor: 'text-danger',
        bgColor: 'bg-danger/10',
      }
    case QUEUE_ERROR_REASONS.UNAUTHORIZED:
      return {
        title: 'Access Denied',
        description:
          "You don't have permission to manage this queue session. Please sign in with the correct account.",
        icon: LockIcon,
        iconColor: 'text-plum',
        bgColor: 'bg-plum-faint',
      }
    case QUEUE_ERROR_REASONS.UNKNOWN:
      return {
        title: 'Something Went Wrong',
        description:
          'We encountered an unexpected error while loading the queue. Please try again later.',
        icon: WarningTriangleIcon,
        iconColor: 'text-warning',
        bgColor: 'bg-warning/10',
      }
    case QUEUE_ERROR_REASONS.SESSION_EXPIRED:
    default:
      return {
        title: 'Session Expired',
        description:
          'Guest queue sessions last for 24 hours. Your session has ended to prevent data loss.',
        icon: ClockWarningOrangeIcon,
        iconColor: 'text-warning',
        bgColor: 'bg-warning/10',
      }
  }
})

function handleSendLink() {
  if (!localEmail.value) {
    showToast('Please enter your email address', { type: 'error' })
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(localEmail.value)) {
    showToast('Invalid email address', { type: 'error' })
    return
  }

  mutateAuth(localEmail.value)
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div
      class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-warning/10 opacity-50 blur-[80px]"
    />
    <div
      class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]"
    />

    <!-- ═══ Main Content ═══ -->
    <div class="relative z-10 mx-auto max-w-[1024px] px-6 py-12 md:py-24">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <!-- ═══ Status Card (Left Column) ═══ -->
        <div
          class="flex flex-col justify-center rounded-[40px] h-full bg-white px-10 py-12 text-center shadow-sm dark:shadow-none border border-plum-faint md:sticky md:top-24"
        >
          <!-- Status Icon -->
          <div
            :class="[
              'mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px]',
              config.bgColor,
            ]"
          >
            <component :is="config.icon" :class="['h-12 w-12', config.iconColor]" />
          </div>

          <h1 class="font-display text-4xl font-extrabold tracking-tight text-plum">
            {{ config.title }}
          </h1>
          <p class="mt-4 font-body text-lg leading-relaxed text-plum-muted">
            {{ config.description }}
          </p>
        </div>

        <!-- ═══ Registration CTA Card (Right Column) ═══ -->
        <div class="rounded-[40px] bg-plum p-10 shadow-lg dark:shadow-none border border-white/10">
          <p class="font-body text-sm font-bold uppercase tracking-[1.5px] text-mint">
            Upgrade Your Experience
          </p>
          <h2 class="mt-2 font-display text-2xl font-bold leading-tight text-sand">
            Keep your queues alive forever with a free account.
          </h2>

          <!-- Feature list -->
          <div class="mt-10 flex flex-col gap-5">
            <div v-for="feature in features" :key="feature" class="flex items-center gap-4">
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/20"
              >
                <CheckMintIcon class="h-3 w-3 text-mint" />
              </div>
              <span class="font-body text-base font-medium text-sand/90 tracking-tight">{{
                feature
              }}</span>
            </div>
          </div>

          <!-- Email form -->
          <div class="mt-10 flex flex-col gap-4">
            <div class="flex flex-col gap-2.5">
              <label
                for="emailAddressEnded"
                class="font-body text-sm font-bold uppercase tracking-wider text-sand/50 ml-1"
              >
                Email address
              </label>
              <input
                id="emailAddressEnded"
                v-model="localEmail"
                type="email"
                placeholder="you@company.com"
                class="w-full rounded-[24px] border border-white/10 bg-white/5 px-6 py-5 font-body text-lg text-sand placeholder:text-sand/30 outline-none transition-all focus:border-mint focus:bg-white/10"
                :disabled="isPending"
                @keyup.enter="handleSendLink"
              />
            </div>
            <button
              class="group mt-2 flex w-full items-center justify-center gap-3 rounded-[24px] bg-mint px-8 py-5 font-body text-lg font-bold text-plum transition-all hover:scale-[1.02] hover:bg-mint active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              :disabled="isPending"
              @click="handleSendLink"
            >
              <span v-if="isPending">Sending...</span>
              <template v-else>
                Create My Account
                <ArrowRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>
          </div>
        </div>
      </div>
      <div class="mt-12 md:mt-20">
        <router-link
          to="/"
          class="flex justify-center items-center gap-2 font-body text-sm font-medium text-plum-muted transition-colors hover:text-plum"
        >
          Back to home
          <ArrowRightMutedIcon class="h-3 w-3" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rounded-card {
  border-radius: 40px;
}
</style>
