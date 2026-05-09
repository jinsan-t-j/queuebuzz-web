<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, ArrowRight, CreditCard } from 'lucide-vue-next'
import { fetchSubscription, type Subscription } from '@/modules/app/billing/actions/billing.actions'

const router = useRouter()
const subscription = ref<Subscription | null>(null)
const isLoading = ref(true)

const hasActiveSubscription = computed(() => {
  const sub = subscription.value
  if (!sub) return false
  return sub.tier !== 'free' && sub.status === 'active'
})

const planName = computed(() => {
  const sub = subscription.value
  if (!sub || sub.tier === 'free') return 'Free Plan'
  return sub.planName || 'Free Plan'
})

const statusLabel = computed(() => {
  const sub = subscription.value
  if (!sub) return ''
  if (sub.cancelAtPeriodEnd) return 'Cancelling'
  if (sub.status === 'active') return 'Active'
  return sub.status
})

const statusClass = computed(() => {
  const sub = subscription.value
  if (sub?.cancelAtPeriodEnd) return 'text-warning'
  return 'text-mint-dark'
})

onMounted(async () => {
  try {
    subscription.value = await fetchSubscription()
  } finally {
    isLoading.value = false
  }
})

function handleAction() {
  if (hasActiveSubscription.value) {
    router.push({ name: 'settings', query: { section: 'subscription' } })
  } else {
    router.push({ name: 'go-premium' })
  }
}
</script>

<template>
  <div v-if="!isLoading" class="p-4 transition-all duration-300">
    <button
      class="group flex w-full flex-col gap-4 rounded-3xl bg-white border border-plum-faint p-5 transition-all hover:border-mint text-left shadow-sm"
      @click="handleAction"
    >
      <div class="flex items-center justify-between">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-sand transition-transform group-hover:scale-110"
        >
          <component
            :is="hasActiveSubscription ? CreditCard : Sparkles"
            class="h-5 w-5"
            :class="hasActiveSubscription ? 'text-plum' : 'text-mint-dark'"
          />
        </div>
        <ArrowRight
          class="h-4 w-4 text-plum-muted transition-transform group-hover:translate-x-1"
        />
      </div>

      <div v-if="!hasActiveSubscription">
        <p class="font-body text-[13px] font-black text-plum">Upgrade to Pro</p>
        <p class="mt-1 font-body text-[11px] font-medium text-plum-muted">
          Unlimited queues & more
        </p>
      </div>

      <div v-else>
        <div class="flex items-center gap-2">
          <p class="font-body text-[13px] font-black text-plum">{{ planName }}</p>
          <span :class="['font-body text-[10px] font-bold uppercase tracking-wider', statusClass]">
            {{ statusLabel }}
          </span>
        </div>
        <p class="mt-1 font-body text-[11px] font-medium text-plum-muted">Manage subscription</p>
      </div>
    </button>
  </div>
</template>
