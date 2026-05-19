<script setup lang="ts">
/**
 * @component PremiumLimitBanner
 * @description Beautiful promotional banner shown when approaching or reaching capacity limits.
 *
 * @prop {Boolean} isLimitReached - True if maximum active capacity has been reached.
 * @prop {Number} waitingCount - Current active queue waiting count.
 * @prop {Boolean} isAuthenticated - True if the host is authenticated.
 * @prop {Number} maxGuests - Maximum guest limit based on current plan.
 * @emits {upgrade} - "Upgrade Now" or "Claim Queue" clicked.
 * @emits {login} - "Log In" clicked.
 */
import BaseButton from '@/components/base/BaseButton.vue'

withDefaults(
  defineProps<{
    isLimitReached: boolean
    waitingCount: number
    isAuthenticated: boolean
    maxGuests?: number
  }>(),
  {
    maxGuests: 25,
  },
)

defineEmits<{
  (e: 'upgrade'): void
  (e: 'login'): void
}>()
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[24px] border p-5 shadow-[0_8px_30px_rgba(26,10,46,0.04)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white"
    :class="[
      isLimitReached
        ? 'bg-[#FEF2F2] border-danger/20 text-[#991B1B]'
        : 'bg-[#FFFBEB] border-warning/20 text-[#92400E]',
    ]"
  >
    <!-- Decorative circle -->
    <div
      class="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20"
      :class="isLimitReached ? 'bg-danger' : 'bg-warning'"
    />

    <div class="flex items-start gap-4 relative z-10">
      <div
        class="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse"
        :class="isLimitReached ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'"
      >
        <svg
          v-if="isLimitReached"
          class="w-5 h-5"
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
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="text-left">
        <h3 class="font-display font-bold text-base text-plum leading-tight">
          {{ isLimitReached ? 'Queue Limit Reached!' : 'Approaching Guest Limit' }}
        </h3>
        <p class="font-body text-sm mt-1 text-plum-soft">
          {{
            isLimitReached
              ? `You have reached the maximum active guest capacity of ${maxGuests} for this session.`
              : `You have ${maxGuests - waitingCount} slots remaining before reaching the ${maxGuests} active guest limit.`
          }}
          <span class="font-semibold">Upgrade to Premium to get unlimited guests.</span>
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
