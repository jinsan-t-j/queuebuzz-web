<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { fetchSubscription, type Subscription } from '../actions/billing.actions'

const emit = defineEmits(['navigate'])

const subscription = ref<Subscription | null>(null)
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    subscription.value = await fetchSubscription()
  } finally {
    isLoading.value = false
  }
})

const statusLabel = computed(() => {
  if (!subscription.value) return ''
  if (subscription.value.status === 'active' && subscription.value.cancelAtPeriodEnd) {
    return 'Cancelling'
  }
  const statusMap: Record<string, string> = {
    active: 'Active',
    in_grace: 'Overdue',
    cancelled: 'Cancelled',
    pending: 'Pending',
  }
  return statusMap[subscription.value.status] || subscription.value.status
})

const statusColor = computed(() => {
  if (!subscription.value) return ''
  if (subscription.value.status === 'active' && subscription.value.cancelAtPeriodEnd) {
    return 'bg-orange-100 text-warning'
  }

  const colorMap: Record<string, string> = {
    active: 'bg-mint text-plum',
    in_grace: 'bg-orange-100 text-warning',
    cancelled: 'bg-red-100 text-danger',
    pending: 'bg-plum-faint text-plum-muted',
  }
  return colorMap[subscription.value.status] || 'bg-plum-faint text-plum-muted'
})
</script>

<template>
  <div>
    <!-- Mini Subscription Status Card -->
    <div v-if="subscription && !isLoading" class="mt-8 hidden lg:block">
      <div
        class="rounded-3xl border border-plum-faint bg-white p-5 shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-md"
      >
        <div class="mb-3 flex items-center justify-between">
          <p class="font-body text-[10px] font-bold uppercase tracking-wider text-plum-muted">
            Your Plan
          </p>
          <span
            class="rounded-full px-2 py-0.5 font-body text-[10px] font-bold"
            :class="statusColor"
          >
            {{ statusLabel }}
          </span>
        </div>
        <p class="font-display text-lg font-bold text-plum">
          {{ subscription.planName || 'Free' }}
        </p>
        <p v-if="subscription.billingCycle" class="mt-1 font-body text-xs text-plum-muted">
          Billed {{ subscription.billingCycle }}
        </p>
        <button
          class="mt-4 w-full cursor-pointer rounded-xl border border-plum-faint py-2 font-body text-xs font-semibold text-plum transition-all hover:bg-plum hover:text-sand"
          @click="emit('navigate', 'subscription')"
        >
          Manage
        </button>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-else-if="isLoading" class="mt-8 hidden lg:block">
      <div class="h-32 w-full animate-pulse rounded-3xl bg-plum-faint" />
    </div>
  </div>
</template>
