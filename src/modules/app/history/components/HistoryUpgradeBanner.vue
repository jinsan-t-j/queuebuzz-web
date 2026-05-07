<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles as SparklesIcon } from 'lucide-vue-next'
import { fetchSubscription, type Subscription } from '@/modules/app/billing/actions/billing.actions'
import { useBilling } from '@/modules/app/billing/composables/useBilling'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const { gridPlans, fetchPlans } = useBilling()

const subscription = ref<Subscription | null>(null)
const isSubLoading = ref(false)

const proPlan = computed(() => {
  return gridPlans.value.find((p) => p.tier === 'pro' || p.slug.includes('pro'))
})

const hasActiveSubscription = computed(() => {
  return (
    subscription.value &&
    subscription.value.tier !== 'free' &&
    subscription.value.status === 'active'
  )
})

onMounted(async () => {
  isSubLoading.value = true
  try {
    const [sub] = await Promise.all([fetchSubscription(), fetchPlans()])
    subscription.value = sub
  } finally {
    isSubLoading.value = false
  }
})

function goToUpgrade() {
  router.push({ name: 'go-premium' })
}
</script>

<template>
  <div
    v-if="!isSubLoading && !hasActiveSubscription"
    class="group relative overflow-hidden rounded-3xl bg-plum p-1 border border-plum-faint shadow-none"
  >
    <div class="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-5">
      <div class="flex items-center gap-5 text-center md:text-left">
        <div
          class="hidden sm:flex w-12 h-12 rounded-2xl bg-sand/10 items-center justify-center border border-sand/20 group-hover:scale-105 transition-transform duration-300"
        >
          <SparklesIcon class="w-6 h-6 text-mint" />
        </div>
        <div>
          <h3 class="font-display font-black text-sand text-lg">Unlock More Analytics</h3>
          <p class="font-body text-sand/60 text-sm mt-0.5">
            Upgrade to Pro to access your full session history and detailed reports.
          </p>
        </div>
      </div>
      <BaseButton
        variant="primary"
        class="bg-mint text-on-mint hover:bg-mint/90 font-black px-8 h-12 border-0 shadow-none"
        @click="goToUpgrade"
      >
        Upgrade for
        {{ proPlan ? proPlan.currencySymbol + Math.floor((proPlan.price || 0) / 100) : '₹499' }}/mo
      </BaseButton>
    </div>
  </div>
</template>
