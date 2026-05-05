<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import {
  fetchSubscription,
  cancelSubscription,
  getPaymentMethodUpdateLink,
  type Subscription,
} from '../actions/billing.actions'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const CancelSubscriptionConfirmModal = defineAsyncComponent(
  () => import('./CancelSubscriptionConfirmModal.vue'),
)

const subscription = ref<Subscription | null>(null)
const isSubLoading = ref(false)
const isCancelling = ref(false)
const isUpdatingPayment = ref(false)
const showCancelSubModal = ref(false)

onMounted(() => {
  loadSubscription()
})

async function loadSubscription() {
  isSubLoading.value = true
  try {
    subscription.value = await fetchSubscription()
  } finally {
    isSubLoading.value = false
  }
}

const subscriptionStatusLabel = computed(() => {
  if (!subscription.value) return ''
  if (subscription.value.status === 'active' && subscription.value.cancelAtPeriodEnd) {
    return 'Cancelling'
  }
  const statusMap: Record<string, string> = {
    active: 'Active',
    in_grace: 'Payment Overdue',
    cancelled: 'Cancelled',
    pending: 'Pending',
  }
  return statusMap[subscription.value.status] || subscription.value.status
})

const subscriptionStatusColor = computed(() => {
  if (!subscription.value) return ''
  if (subscription.value.status === 'active' && subscription.value.cancelAtPeriodEnd) {
    return 'bg-orange-100 text-warning'
  }
  const colorMap: Record<string, string> = {
    active: 'bg-mint-light text-[#00B87A]',
    in_grace: 'bg-orange-100 text-warning',
    cancelled: 'bg-red-100 text-danger',
    pending: 'bg-plum-faint text-plum-muted',
  }
  return colorMap[subscription.value.status] || 'bg-plum-faint text-plum-muted'
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function confirmCancelSubscription(data: { comment: string; feedback: string }) {
  isCancelling.value = true
  try {
    await cancelSubscription(data.comment, data.feedback)
    showCancelSubModal.value = false
    await loadSubscription()
  } finally {
    isCancelling.value = false
  }
}

async function handleUpdatePaymentMethod() {
  isUpdatingPayment.value = true
  try {
    const link = await getPaymentMethodUpdateLink(globalThis.location.href)
    globalThis.location.href = link
  } catch {
    // Silently fail — user stays on page
  } finally {
    isUpdatingPayment.value = false
  }
}
</script>

<template>
  <div>
    <!-- ═══ Section: Subscription Management ═══ -->
    <BaseCard v-if="subscription" id="subscription" class="p-8">
      <h2 class="mb-6 font-display text-2xl font-bold text-plum">Subscription</h2>

      <!-- Subscription Details -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-body text-sm text-plum-muted">Status</p>
            <span
              :class="[
                'mt-1 inline-block rounded-full px-3 py-1 font-body text-xs font-semibold',
                subscriptionStatusColor,
              ]"
            >
              {{ subscriptionStatusLabel }}
            </span>
          </div>
          <div class="text-right">
            <p class="font-body text-sm text-plum-muted">Billing Cycle</p>
            <p class="font-body font-semibold text-plum capitalize">
              {{ subscription.billingCycle || '—' }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-plum-faint pt-4">
          <div>
            <p class="font-body text-sm text-plum-muted">Current Period Ends</p>
            <p class="font-body font-semibold text-plum">
              {{ formatDate(subscription.currentPeriodEnd) }}
            </p>
          </div>
          <div v-if="subscription.cancelAtPeriodEnd" class="text-right">
            <p class="font-body text-sm font-semibold text-warning">Cancels at period end</p>
          </div>
        </div>

        <!-- Payment Method info -->
        <div
          v-if="subscription.cardLast4"
          class="flex items-center justify-between border-t border-plum-faint pt-4"
        >
          <div>
            <p class="font-body text-sm text-plum-muted">Payment Method</p>
            <p class="font-body font-semibold text-plum">•••• {{ subscription.cardLast4 }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-3 border-t border-plum-faint pt-6">
          <BaseButton
            variant="ghost"
            size="sm"
            :is-loading="isUpdatingPayment"
            @click="handleUpdatePaymentMethod"
          >
            Update Payment Method
          </BaseButton>
          <BaseButton
            v-if="subscription.status === 'active' && !subscription.cancelAtPeriodEnd"
            variant="danger"
            size="sm"
            @click="showCancelSubModal = true"
          >
            Cancel Subscription
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Subscription loading skeleton -->
    <BaseCard v-else-if="isSubLoading" id="subscription" class="p-8">
      <div class="h-6 w-40 animate-pulse rounded-lg bg-plum-faint mb-6" />
      <div class="space-y-3">
        <div class="h-10 animate-pulse rounded-2xl bg-plum-faint" />
        <div class="h-10 animate-pulse rounded-2xl bg-plum-faint" />
      </div>
    </BaseCard>

    <CancelSubscriptionConfirmModal
      :is-open="showCancelSubModal"
      :is-loading="isCancelling"
      @cancel="showCancelSubModal = false"
      @confirm="confirmCancelSubscription"
    />
  </div>
</template>
