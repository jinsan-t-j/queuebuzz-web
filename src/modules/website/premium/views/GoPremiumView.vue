<script setup>
/**
 * @component GoPremiumView
 * @description Premium upgrade landing page. Highlights premium features
 * and provides a CTA to upgrade. Mock only — no payment integration.
 */

// 1. Vue core imports

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

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="mx-auto max-w-lg px-6 py-24 text-center">
    <h1 class="font-display text-4xl font-black text-plum">
      How's the queue?
    </h1>
    <p class="mx-auto mt-4 max-w-md font-body text-lg text-plum-muted">
      Upgrade to Premium for unlimited queues, custom branding, and SMS notifications.
    </p>

    <BaseCard class="mt-12" padding="lg">
      <p class="font-display text-3xl font-black text-plum">$19<span class="font-body text-base font-normal text-plum-muted">/mo</span></p>
      <ul class="mt-6 flex flex-col gap-3 text-left">
        <li class="flex items-center gap-2 font-body text-sm text-plum">
          <span class="h-1.5 w-1.5 rounded-full bg-mint" />
          Unlimited active queues
        </li>
        <li class="flex items-center gap-2 font-body text-sm text-plum">
          <span class="h-1.5 w-1.5 rounded-full bg-mint" />
          SMS notifications
        </li>
        <li class="flex items-center gap-2 font-body text-sm text-plum">
          <span class="h-1.5 w-1.5 rounded-full bg-mint" />
          Custom branding
        </li>
        <li class="flex items-center gap-2 font-body text-sm text-plum">
          <span class="h-1.5 w-1.5 rounded-full bg-mint" />
          Analytics dashboard
        </li>
      </ul>
      <div class="mt-8">
        <BaseButton variant="primary" size="lg" class="w-full">
          Upgrade Now
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
