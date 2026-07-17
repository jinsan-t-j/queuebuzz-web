<script setup lang="ts">
/**
 * @component PlanLimitsCard
 * @description Presentational component to show current subscription plan limits and warning indicators.
 */
import { computed } from 'vue'

import type { BillingPlan } from '@/modules/app/billing/actions/billing.actions'

const props = withDefaults(
  defineProps<{
    role: 'host' | 'guest'
    currentPlan?: BillingPlan | null
  }>(),
  {
    currentPlan: null,
  },
)

const emit = defineEmits<{
  (e: 'upgrade'): void
}>()

const activeLimits = computed(() => {
  if (props.currentPlan?.limits) {
    return props.currentPlan.limits
  }
  return {
    maxQueuesPerMonth: 1,
    maxGuestsPerQueue: 25,
    queueExpiryHours: 4,
  }
})
</script>

<template>
  <div
    class="rounded-card border border-plum-faint bg-white p-4 sm:p-5 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
  >
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div class="h-9 w-9 rounded-xl bg-mint-light flex items-center justify-center shrink-0">
        <svg
          class="h-5 w-5 text-plum"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <!-- Text details -->
      <div class="flex-1 min-w-0">
        <h4 class="font-body text-sm font-bold text-plum">
          {{ currentPlan ? `${currentPlan.name} Plan Limits` : 'Guest Queue Session' }}
        </h4>
        <div class="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-body text-xs text-plum-muted">
          <!-- Duration Limit -->
          <span class="flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-mint" />
            {{
              activeLimits.queueExpiryHours <= 0
                ? 'Unlimited duration'
                : `${activeLimits.queueExpiryHours}-hour session duration`
            }}
          </span>
          <!-- Guest Limit -->
          <span class="flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-mint" />
            {{
              activeLimits.maxGuestsPerQueue <= 0
                ? 'Unlimited guests'
                : `Max ${activeLimits.maxGuestsPerQueue} guests`
            }}
          </span>
          <!-- Queue Count Limit (Hosts only) -->
          <span v-if="role === 'host'" class="flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-mint" />
            {{
              activeLimits.maxQueuesPerMonth <= 0
                ? 'Unlimited queues'
                : `${activeLimits.maxQueuesPerMonth} queue${activeLimits.maxQueuesPerMonth > 1 ? 's' : ''} per month`
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Upgrade Action -->
    <div v-if="!currentPlan || currentPlan.tier === 'free'" class="shrink-0">
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center rounded-xl bg-mint px-4 font-body text-xs font-bold text-plum transition-all hover:bg-mint-dark active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,229,160,0.15)]"
        @click="emit('upgrade')"
      >
        {{ !currentPlan ? 'Go Premium for more features' : 'Upgrade for more features' }}
      </button>
    </div>
  </div>
</template>
