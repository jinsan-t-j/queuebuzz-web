<script setup lang="ts">
/**
 * @component GoPremiumView
 * @description Premium upgrade landing page. Highlights premium features
 * and provides a CTA to upgrade. Based on PricingView but focused on paid tiers.
 */

import {
  Sparkles,
  Layers,
  Users,
  History,
  FileSpreadsheet,
  Palette,
  Loader2,
  MapPin,
} from 'lucide-vue-next'
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import { useToast } from '@/composables/useToast'
import { useBilling } from '@/modules/app/billing/composables/useBilling'

const {
  isLoading,
  billingCycle,
  checkoutLoadingPlan,
  checkoutError,
  allPlans,
  maxDiscount,
  fetchPlans,
  handleChoosePlan,
  isEliteTier,
} = useBilling()

const route = useRoute()
const router = useRouter()

const scrollY = ref(0)

const handleScroll = () => {
  scrollY.value = globalThis.scrollY
}

onMounted(async () => {
  globalThis.addEventListener('scroll', handleScroll, { passive: true })
  await fetchPlans()

  // Handle payment redirects
  if (route.query.checkout === 'error') {
    const { showToast } = useToast()
    showToast('Payment failed or was cancelled. Please try again.', {
      type: 'error',
    })
    router.replace({ query: { ...route.query, checkout: undefined } })
  }
})

onUnmounted(() => {
  globalThis.removeEventListener('scroll', handleScroll)
})

// Filter out free plan and sort by tier
const displayPlans = computed(() => {
  const tiersOrder = ['pro', 'business_elite', 'elite', 'enterprise']
  const filtered = allPlans.value.filter((p) => !p.isFree)

  // Check if enterprise is missing from API and needs manual entry
  const hasEnterprise = filtered.some((p) => p.tier === 'enterprise')

  if (!hasEnterprise) {
    // Add a placeholder enterprise plan for display purposes if not in API
    // This matches the Enterprise banner data from PricingView.vue
    const enterprisePlaceholder = {
      id: 'enterprise-placeholder',
      slug: 'enterprise',
      tier: 'enterprise',
      name: 'Enterprise',
      description:
        'For high-volume operations requiring advanced security, custom SLAs, and dedicated management.',
      price: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      discountPercent: 0,
      currencySymbol: '$',
      isFree: false,
      limits: {
        maxQueuesPerMonth: 0, // Unlimited
        maxGuestsPerQueue: 0, // Unlimited
        historyAccess: true,
        customBranding: true,
        canExport: true,
        queueExpiryHours: 0, // No expiry
        canViewGuestData: true,
        historyRetentionDays: 0, // Unlimited
        allowGeoLock: true,
      },
    }
    filtered.push(enterprisePlaceholder)
  }

  return filtered.sort((a, b) => {
    const aOrder = tiersOrder.includes(a.tier) ? tiersOrder.indexOf(a.tier) : 99
    const bOrder = tiersOrder.includes(b.tier) ? tiersOrder.indexOf(b.tier) : 99
    return aOrder - bOrder
  })
})

function handleEnterpriseContact() {
  globalThis.location.href = 'mailto:sales@queuebuzz.com?subject=Enterprise%20Plan%20Inquiry'
}
</script>

<template>
  <div class="relative min-h-screen bg-sand text-plum selection:bg-mint/30 overflow-x-hidden">
    <!-- Floating Orbs Background -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div
        class="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px] animate-blob transition-transform duration-1000 ease-out"
        :style="{ transform: `translateY(${scrollY * 0.04}px)` }"
      />
      <div
        class="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-plum/5 rounded-full blur-[120px] animate-blob animation-delay-2000 transition-transform duration-1000 ease-out"
        :style="{ transform: `translateY(${scrollY * -0.06}px)` }"
      />
    </div>

    <!-- Holi Background Atmosphere -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        class="absolute top-[-5%] left-[-10%] w-[70%] h-[60%] bg-pink-500/5 blur-[160px] animate-blob transition-transform duration-700 ease-out"
        :style="{
          clipPath: 'polygon(15% 0, 100% 10%, 85% 95%, 0 80%)',
          transform: `translateY(${scrollY * 0.08}px)`,
        }"
      />
      <div
        class="absolute bottom-[-5%] right-[-10%] w-[60%] h-[50%] bg-blue-500/5 blur-[140px] animate-blob animation-delay-2000 transition-transform duration-1000 ease-out"
        :style="{
          clipPath: 'polygon(25% 15%, 90% 0, 100% 85%, 10% 100%)',
          transform: `translateY(${scrollY * -0.12}px)`,
        }"
      />
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <!-- Header -->
      <div class="text-center mb-16 lg:mb-24">
        <h1
          class="font-display text-5xl font-black text-plum md:text-7xl lg:text-8xl tracking-tight leading-none mb-8"
        >
          Go <span class="text-mint-dark">Premium.</span>
        </h1>
        <p
          class="mx-auto max-w-2xl font-body text-lg md:text-xl text-plum-soft leading-relaxed opacity-80 mb-12"
        >
          Unlock the full power of QueueBuzz with advanced features and unlimited scale.
        </p>

        <!-- Billing Toggle -->
        <div class="flex flex-col items-center gap-4">
          <div
            class="inline-flex items-center p-1 bg-white rounded-2xl shadow-sm border border-plum-faint"
          >
            <button
              :class="[
                'px-8 py-3 rounded-xl font-body text-sm font-bold transition-all',
                billingCycle === 'monthly'
                  ? 'bg-plum text-white'
                  : 'text-plum-muted hover:text-plum',
              ]"
              type="button"
              @click="billingCycle = 'monthly'"
            >
              Monthly
            </button>
            <button
              :class="[
                'px-8 py-3 rounded-xl font-body text-sm font-bold transition-all relative',
                billingCycle === 'yearly'
                  ? 'bg-plum text-white'
                  : 'text-plum-muted hover:text-plum',
              ]"
              type="button"
              @click="billingCycle = 'yearly'"
            >
              Yearly
              <span
                v-if="maxDiscount > 0"
                class="absolute -top-3 -right-2 px-2.5 py-1 bg-mint text-on-mint text-[10px] font-black rounded-full shadow-lg uppercase tracking-wider animate-bounce"
              >
                Save up to {{ maxDiscount }}%
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pricing Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        <template v-if="isLoading">
          <div v-for="i in 3" :key="i" class="h-[600px] bg-white/40 rounded-[48px] animate-pulse" />
        </template>

        <template v-else>
          <BaseCard
            v-for="plan in displayPlans"
            :key="plan.slug"
            class="relative flex flex-col p-10 md:p-12 transition-all duration-500 group rounded-[48px] overflow-hidden"
            :class="[
              isEliteTier(plan)
                ? 'bg-mint text-on-mint ring-1 ring-plum/20 shadow-[0_40px_100px_-20px_rgba(0,229,160,0.3)] scale-105 z-10'
                : 'bg-white border-plum-faint hover:border-mint hover:shadow-2xl',
              plan.tier === 'enterprise' ? 'border-2' : '',
            ]"
          >
            <!-- Popular Badge -->
            <div
              v-if="isEliteTier(plan)"
              class="absolute top-8 right-8 px-4 py-1.5 bg-plum text-sand text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm"
            >
              Best Value
            </div>

            <div class="mb-8">
              <h3 class="font-display text-3xl font-black mb-3">
                {{ plan.name }}
              </h3>
              <p
                :class="[
                  'font-body text-sm leading-relaxed',
                  isEliteTier(plan) ? 'text-on-mint/80' : 'text-plum-muted',
                ]"
              >
                {{ plan.description }}
              </p>
            </div>

            <div class="mb-12">
              <div class="flex items-baseline gap-2">
                <template v-if="plan.tier === 'enterprise'">
                  <span class="font-display text-4xl font-black tracking-tighter">Custom</span>
                </template>
                <template v-else>
                  <span class="font-display text-6xl font-black tracking-tighter">
                    {{ plan.currencySymbol + Math.floor((plan.price || 0) / 100) }}
                  </span>
                  <div class="flex flex-col">
                    <span
                      class="font-body text-xs font-bold text-plum-muted uppercase tracking-widest"
                    >
                      /{{ billingCycle === 'monthly' ? 'mo' : 'yr' }}
                    </span>
                    <span
                      v-if="billingCycle === 'yearly' && plan.discountPercent > 0"
                      class="text-mint-dark text-[11px] font-black uppercase"
                    >
                      Save {{ plan.discountPercent }}%
                    </span>
                  </div>
                </template>
              </div>
            </div>

            <div class="flex-1 mb-12">
              <div
                :class="[
                  'font-display text-[11px] font-black uppercase tracking-[0.2em] mb-6 block',
                  isEliteTier(plan) ? 'text-on-mint/60' : 'text-mint-dark',
                ]"
              >
                Features Included
              </div>
              <ul class="space-y-5">
                <li class="flex items-start gap-4">
                  <Layers
                    :class="['w-5 h-5 mt-0.5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']"
                  />
                  <div class="flex flex-col">
                    <span class="font-body text-sm font-bold leading-none">
                      {{
                        plan.limits.maxQueuesPerMonth <= 0
                          ? 'Unlimited'
                          : plan.limits.maxQueuesPerMonth
                      }}
                      {{ plan.limits.maxQueuesPerMonth === 1 ? 'Queue' : 'Queues' }}
                    </span>
                    <span
                      class="text-[10px] uppercase font-black tracking-tight mt-1 text-plum-muted"
                      >Per Month</span
                    >
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <Users
                    :class="['w-5 h-5 mt-0.5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']"
                  />
                  <div class="flex flex-col">
                    <span class="font-body text-sm font-bold leading-none">
                      {{
                        plan.limits.maxGuestsPerQueue <= 0
                          ? 'Unlimited'
                          : plan.limits.maxGuestsPerQueue
                      }}
                      Guests
                    </span>
                    <span
                      class="text-[10px] uppercase font-black tracking-tight mt-1 text-plum-muted"
                      >Per session</span
                    >
                  </div>
                </li>

                <li v-if="plan.limits.historyAccess" class="flex items-center gap-4">
                  <History :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']" />
                  <span class="font-body text-sm font-bold"
                    >{{
                      plan.limits.historyRetentionDays <= 0
                        ? 'Unlimited'
                        : plan.limits.historyRetentionDays + ' Days'
                    }}
                    History</span
                  >
                </li>
                <li v-if="plan.limits.canExport" class="flex items-center gap-4">
                  <FileSpreadsheet
                    :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint-dark']"
                  />
                  <span class="font-body text-sm font-bold">CSV/Excel Export</span>
                </li>
                <li v-if="plan.limits.customBranding" class="flex items-center gap-4">
                  <Palette :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']" />
                  <span class="font-body text-sm font-bold">Custom Branding</span>
                </li>
                <li v-if="plan.limits.allowGeoLock" class="flex items-center gap-4">
                  <MapPin :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']" />
                  <span class="font-body text-sm font-bold">Geo-Location Lockdown</span>
                </li>
                <li v-if="plan.tier === 'enterprise'" class="flex items-center gap-4">
                  <Sparkles
                    :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']"
                  />
                  <span class="font-body text-sm font-bold">Dedicated Manager</span>
                </li>
              </ul>
            </div>

            <BaseButton
              :variant="isEliteTier(plan) ? 'secondary' : 'primary'"
              size="lg"
              class="w-full h-16 rounded-2xl font-black text-base shadow-xl group-hover:scale-[1.02] transition-transform"
              :disabled="checkoutLoadingPlan === plan.id"
              @click="
                plan.tier === 'enterprise' ? handleEnterpriseContact() : handleChoosePlan(plan)
              "
            >
              <Loader2 v-if="checkoutLoadingPlan === plan.id" class="w-5 h-5 animate-spin mr-2" />
              {{
                checkoutLoadingPlan === plan.id
                  ? 'Redirecting...'
                  : plan.tier === 'enterprise'
                    ? 'Contact Sales'
                    : 'Choose Plan'
              }}
            </BaseButton>
            <p
              v-if="checkoutError && checkoutLoadingPlan === null"
              class="mt-3 font-body text-xs text-danger text-center"
            >
              {{ checkoutError }}
            </p>
          </BaseCard>
        </template>
      </div>

      <!-- Comparison Table Link (Optional/Small) -->
      <div class="text-center">
        <p class="font-body text-plum-muted text-sm">
          Need more details?
          <router-link to="/pricing" class="text-mint-dark font-bold hover:underline">
            View full feature comparison
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
