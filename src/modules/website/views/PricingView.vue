<script setup lang="ts">
/**
 * @component PricingView
 * @description Public pricing page with free and premium plan comparison.
 */

// 1. Vue core imports
import { computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties
const plans = computed(() => [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'One active queue',
      'Up to 50 entries per session',
      'QR code + join code',
      'Basic queue management',
    ],
    cta: 'Get Started',
    isPrimary: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19',
    period: '/month',
    features: [
      'Unlimited active queues',
      'Unlimited entries',
      'Custom branding',
      'Analytics dashboard',
      'Priority support',
      'SMS notifications',
    ],
    cta: 'Go Premium',
    isPrimary: true,
  },
])

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-24">
    <h1 class="text-center font-display text-4xl font-black text-plum">
      Simple pricing, no surprises.
    </h1>
    <p class="mx-auto mt-4 max-w-xl text-center font-body text-lg text-plum-muted">
      Start free. Upgrade when your business grows.
    </p>

    <div class="mt-16 grid gap-8 md:grid-cols-2">
      <BaseCard
        v-for="plan in plans"
        :key="plan.id"
        padding="lg"
        :class="plan.isPrimary ? 'ring-2 ring-mint' : ''"
      >
        <h2 class="font-display text-2xl font-bold text-plum">{{ plan.name }}</h2>
        <div class="mt-4 flex items-baseline gap-1">
          <span class="font-display text-4xl font-black text-plum">{{ plan.price }}</span>
          <span class="font-body text-sm text-plum-muted">{{ plan.period }}</span>
        </div>
        <ul class="mt-8 flex flex-col gap-3">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center gap-2 font-body text-sm text-plum"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-mint" />
            {{ feature }}
          </li>
        </ul>
        <div class="mt-8">
          <router-link :to="plan.isPrimary ? '/premium' : '/login'">
            <BaseButton
              :variant="plan.isPrimary ? 'primary' : 'secondary'"
              size="lg"
              class="w-full"
            >
              {{ plan.cta }}
            </BaseButton>
          </router-link>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
