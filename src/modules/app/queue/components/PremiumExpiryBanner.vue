<script setup lang="ts">
/**
 * @component PremiumExpiryBanner
 * @description Beautiful promotional banner shown when the virtual queue session has expired or is expiring soon.
 *
 * @prop {Boolean} isExpired - True if the session has already expired.
 * @prop {String} timeLeftStr - Remaining time string (e.g., "14m 30s").
 * @prop {Boolean} isAuthenticated - True if the host is authenticated.
 * @emits {upgrade} - "Upgrade Now" or "Claim Queue" clicked.
 * @emits {login} - "Log In" clicked.
 */
import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  isExpired: boolean
  timeLeftStr: string
  isAuthenticated: boolean
}>()

defineEmits<{
  (e: 'upgrade'): void
  (e: 'login'): void
}>()
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[24px] border p-5 shadow-[0_8px_30px_rgba(26,10,46,0.04)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white"
    :class="[
      isExpired
        ? 'bg-[#FEF2F2] border-danger/20 text-[#991B1B]'
        : 'bg-[#FFFBEB] border-warning/20 text-[#92400E]',
    ]"
  >
    <!-- Decorative circle -->
    <div
      class="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20"
      :class="isExpired ? 'bg-danger' : 'bg-warning'"
    />

    <div class="flex items-start gap-4 relative z-10">
      <div
        class="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse"
        :class="isExpired ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'"
      >
        <svg v-if="isExpired" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="text-left">
        <h3 class="font-display font-bold text-base text-plum leading-tight">
          {{ isExpired ? 'Virtual Queue Session Expired!' : 'Session Expiring Soon' }}
        </h3>
        <p class="font-body text-sm mt-1 text-plum-soft">
          {{
            isExpired
              ? 'This active queue session has expired and is locked.'
              : `This free queue session is expiring in ${timeLeftStr}.`
          }}
          <span class="font-semibold">Upgrade to Premium to extend this session indefinitely.</span>
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3 relative z-10 sm:self-center">
      <BaseButton
        v-if="!isAuthenticated"
        variant="ghost"
        size="sm"
        class="hover:bg-plum-faint font-semibold !text-plum"
        @click="$emit('login')"
      >
        Log In
      </BaseButton>
      <BaseButton
        variant="primary"
        size="sm"
        class="!bg-plum !text-sand hover:!bg-plum-soft font-semibold shadow-[0_4px_12px_rgba(26,10,46,0.12)] border border-transparent"
        @click="$emit('upgrade')"
      >
        {{ isAuthenticated ? 'Upgrade Now' : 'Claim Queue' }}
      </BaseButton>
    </div>
  </div>
</template>
