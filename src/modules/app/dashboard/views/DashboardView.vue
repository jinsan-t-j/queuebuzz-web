<script setup>
/**
 * @component DashboardView
 * @description Host dashboard showing active queue status, quick actions,
 * and recent queue history. Primary landing page after login.
 */

// 1. Vue core imports
import { computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables
import { useAuth } from '@/composables/useAuth'
import { useQueue } from '@/composables/useQueue'

// 5. Component imports
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'

// 6. Props

// 7. Emits

// 8. Composable destructuring
const { user } = useAuth()
const { hasActiveQueue, activeQueue, waitingCount } = useQueue()

// 9. Reactive state

// 10. Computed properties
const greeting = computed(() => {
  const name = user.value?.name?.split(' ')[0] || 'there'
  return `Hey, ${name}`
})

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <h2 class="font-display text-2xl font-bold text-plum">{{ greeting }}</h2>
      <p class="mt-1 font-body text-sm text-plum-muted">
        Here's what's happening with your queue today.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-6 md:grid-cols-3">
      <BaseCard>
        <p class="font-body text-sm font-medium text-plum-muted">Waiting Now</p>
        <p class="mt-2 font-display text-3xl font-black text-plum">
          {{ hasActiveQueue ? waitingCount : 0 }}
        </p>
      </BaseCard>
      <BaseCard>
        <p class="font-body text-sm font-medium text-plum-muted">Served Today</p>
        <p class="mt-2 font-display text-3xl font-black text-plum">0</p>
      </BaseCard>
      <BaseCard>
        <p class="font-body text-sm font-medium text-plum-muted">Avg Wait Time</p>
        <p class="mt-2 font-display text-3xl font-black text-plum">—</p>
      </BaseCard>
    </div>

    <!-- Quick Action -->
    <BaseCard>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-display text-lg font-bold text-plum">
            {{ hasActiveQueue ? activeQueue.name : "Open today's queue" }}
          </h3>
          <p class="mt-1 font-body text-sm text-plum-muted">
            {{ hasActiveQueue ? 'Queue is live and accepting entries.' : 'Start accepting customers in seconds.' }}
          </p>
        </div>
        <router-link :to="hasActiveQueue ? `/dashboard/queue/${activeQueue.id}` : '/dashboard/queue/new'">
          <BaseButton :variant="hasActiveQueue ? 'secondary' : 'primary'">
            {{ hasActiveQueue ? 'View Queue' : 'Create Queue' }}
          </BaseButton>
        </router-link>
      </div>
    </BaseCard>
  </div>
</template>
