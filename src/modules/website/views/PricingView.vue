<script setup lang="ts">
import { CheckCircle2, History, Loader2, Sparkles, Users, ZapOff } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import { useSchemaOrg } from '@/composables/useSchemaOrg'
import { useToast } from '@/composables/useToast'
import {
  comparisonFeatures,
  formatComparisonValue,
  useBilling,
} from '@/modules/app/billing/composables/useBilling'
import LineIcon from '@/modules/website/components/icons/LineIcon.vue'
import { useAuthStore } from '@/stores/auth.store'

const {
  isLoading,
  billingCycle,
  checkoutLoadingPlan,
  checkoutError,
  gridPlans,
  maxDiscount,
  fetchPlans,
  resolveTrialOffer,
  trialOffer,
  handleChoosePlan,
  isEliteTier,
  hasTrialOffer,
} = useBilling()

const route = useRoute()
const router = useRouter()

const { injectPricingSchema } = useSchemaOrg()

const pricingPlansData = computed(() =>
  gridPlans.value.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    isFree: p.isFree,
    currency: p.currencySymbol === '₹' ? 'INR' : 'USD',
  })),
)

injectPricingSchema(pricingPlansData)

const scrollY = ref(0)

const handleScroll = () => {
  scrollY.value = globalThis.scrollY
}

// Scroll-reveal for sections, mirroring the IntersectionObserver pattern
// used across the home page (useWebsiteData.ts) so both pages animate the
// same way on entry.
const visibleSections = ref(new Set<string>())
let sectionObserver: IntersectionObserver | null = null

function isVisible(id: string) {
  return visibleSections.value.has(id)
}

onMounted(async () => {
  globalThis.addEventListener('scroll', handleScroll, { passive: true })

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          visibleSections.value.add(entry.target.id)
        }
      })
    },
    { threshold: 0.1 },
  )
  document.querySelectorAll('section[id]').forEach((s) => sectionObserver?.observe(s))

  await fetchPlans()

  // Hidden entry point: resolve the "?trial=<token>" param server-side. An
  // invalid/missing/unsupported token just leaves the offer unset.
  const trialToken = route.query.trial as string
  if (trialToken) {
    await resolveTrialOffer(trialToken)
  }

  // Scroll to plans section if focus/plan query or hash is specified
  const focus = (route.query.focus ||
    route.query.plan ||
    (route.hash ? route.hash.replace('#', '') : '')) as string
  if (focus) {
    await nextTick()
    setTimeout(() => {
      const el = document.getElementById('plans')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Handle payment redirects
  if (route.query.checkout === 'error') {
    const { showToast } = useToast()
    showToast('Payment failed or was cancelled. Please try again.', {
      type: 'error',
    })
    // Clean up URL
    router.replace({ query: { ...route.query, checkout: undefined } })
  }

  // Auto-checkout after login redirect
  const authStore = useAuthStore()
  const planSlug = route.query.plan as string
  const cycleVal = route.query.cycle as 'monthly' | 'yearly'

  if (planSlug && cycleVal && authStore.isAuthenticated) {
    if (cycleVal === 'monthly' || cycleVal === 'yearly') {
      billingCycle.value = cycleVal
    }

    // Find the plan from gridPlans
    const plan = gridPlans.value.find(
      (p) =>
        p.slug === planSlug ||
        p.slug.toLowerCase().includes(planSlug.toLowerCase()) ||
        planSlug.toLowerCase().includes(p.tier.toLowerCase()),
    )
    if (plan) {
      // Clear plan and cycle queries to prevent repeated checks on page refresh
      router.replace({
        query: { ...route.query, plan: undefined, cycle: undefined },
      })
      await handleChoosePlan(plan, hasTrialOffer(plan))
    }
  }
})

onUnmounted(() => {
  globalThis.removeEventListener('scroll', handleScroll)
  sectionObserver?.disconnect()
})
</script>

<template>
  <div class="relative min-h-screen bg-sand text-plum selection:bg-mint/30">
    <!-- Hero -->
    <section
      id="pricing-hero"
      class="relative pt-20 pb-16 lg:pt-28 lg:pb-20 z-10 overflow-hidden bg-sand transition-all duration-1000 transform"
      :class="[
        isVisible('pricing-hero') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
      ]"
    >
      <div class="container mx-auto px-6 text-center">
        <h1
          class="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-plum tracking-tight leading-[1.05] max-w-4xl mx-auto mb-8"
        >
          Plans built to <br />
          <span class="text-mint-dark underline decoration-plum-faint underline-offset-8"
            >scale with you.</span
          >
        </h1>
        <p
          class="mx-auto max-w-2xl font-body text-lg md:text-xl text-plum-soft leading-relaxed opacity-80 mb-12"
        >
          From solo shops to global enterprises. Flexible plans for every stage.
        </p>

        <!-- Billing Toggle -->
        <div class="flex flex-col items-center gap-4">
          <div class="inline-flex items-center gap-1 rounded-lg bg-plum-faint/50 p-1">
            <button
              :class="[
                'px-8 py-3 rounded-md font-body text-sm font-bold transition-all',
                billingCycle === 'monthly'
                  ? 'bg-white text-plum shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                  : 'text-plum-muted hover:text-plum',
              ]"
              type="button"
              @click="billingCycle = 'monthly'"
            >
              Monthly
            </button>
            <button
              :class="[
                'px-8 py-3 rounded-md font-body text-sm font-bold transition-all relative',
                billingCycle === 'yearly'
                  ? 'bg-white text-plum shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                  : 'text-plum-muted hover:text-plum',
              ]"
              type="button"
              @click="billingCycle = 'yearly'"
            >
              Yearly
              <span
                v-if="maxDiscount > 0"
                class="absolute -top-3 -right-2 px-2.5 py-1 bg-mint text-on-mint text-[10px] font-bold rounded-full shadow-lg uppercase tracking-wider"
              >
                Save up to {{ maxDiscount }}%
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Cards Grid -->
    <section
      id="plans"
      class="relative py-8 lg:py-12 z-10 transition-all duration-1000 transform"
      :class="[isVisible('plans') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <template v-if="isLoading">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-white/60 border border-plum-faint/30 rounded-card p-10 md:p-12 flex flex-col h-[600px] justify-between animate-pulse"
            >
              <div>
                <!-- Title skeleton -->
                <div class="h-8 bg-plum-faint/80 rounded-2xl w-2/3 mb-4" />
                <!-- Description skeleton -->
                <div class="space-y-2 mb-8">
                  <div class="h-4 bg-plum-faint/50 rounded-lg w-full" />
                  <div class="h-4 bg-plum-faint/50 rounded-lg w-5/6" />
                </div>
                <!-- Price skeleton -->
                <div class="flex items-baseline gap-2 mb-12">
                  <div class="h-16 bg-plum-faint/80 rounded-2xl w-1/2" />
                  <div class="h-4 bg-plum-faint/50 rounded-lg w-1/4" />
                </div>
                <!-- Features header -->
                <div class="h-3 bg-plum-faint/60 rounded-md w-1/3 mb-6" />
                <!-- Feature items -->
                <div class="space-y-5">
                  <div v-for="j in 4" :key="j" class="flex items-center gap-4">
                    <div class="w-5 h-5 rounded-full bg-plum-faint/60" />
                    <div class="h-4 bg-plum-faint/50 rounded-lg w-1/2" />
                  </div>
                </div>
              </div>
              <!-- Button skeleton -->
              <div class="h-16 bg-plum-faint/80 rounded-2xl w-full" />
            </div>
          </template>

          <template v-else>
            <BaseCard
              v-for="plan in gridPlans"
              :key="plan.slug"
              class="relative flex flex-col p-10 md:p-12 transition-all duration-500 group overflow-hidden"
              :class="[
                isEliteTier(plan)
                  ? 'bg-mint text-on-mint ring-1 ring-mint/40'
                  : 'hover:border-mint',
              ]"
            >
              <!-- Popular Badge -->
              <div
                v-if="isEliteTier(plan)"
                class="absolute top-8 right-8 px-4 py-1.5 bg-plum-deep text-sand text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm"
              >
                Best Value
              </div>

              <div class="mb-8">
                <h3 class="font-editorial text-3xl font-bold mb-3">
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
                  <span class="font-editorial text-6xl font-bold tracking-tighter">
                    {{
                      plan.isFree
                        ? 'Free'
                        : plan.currencySymbol + Math.floor((plan.price || 0) / 100)
                    }}
                  </span>
                  <div v-if="!plan.isFree" class="flex flex-col">
                    <span
                      class="font-body text-xs font-bold text-plum-muted uppercase tracking-widest"
                    >
                      /{{ billingCycle === 'monthly' ? 'mo' : 'yr' }}
                    </span>
                    <span
                      :class="[
                        'text-[9px] font-bold uppercase tracking-wider mt-0.5',
                        isEliteTier(plan) ? 'text-on-mint/70' : 'text-plum-muted',
                      ]"
                    >
                      + GST / taxes
                    </span>
                    <span
                      v-if="billingCycle === 'yearly' && plan.discountPercent > 0"
                      class="text-mint-dark text-[11px] font-bold uppercase mt-0.5"
                    >
                      Save {{ plan.discountPercent }}%
                    </span>
                  </div>
                  <div v-else class="flex flex-col">
                    <span class="text-mint-dark text-[11px] font-bold uppercase tracking-wider">
                      No credit card
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex-1 mb-12">
                <div
                  :class="[
                    'font-body text-[11px] font-bold uppercase tracking-[0.2em] mb-6 block',
                    isEliteTier(plan) ? 'text-on-mint/60' : 'text-mint-dark',
                  ]"
                >
                  Features Included
                </div>
                <ul class="space-y-5">
                  <li class="flex items-start gap-4">
                    <LineIcon
                      name="stack"
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
                        class="text-[10px] uppercase font-bold tracking-tight mt-1 text-plum-muted"
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
                        class="text-[10px] uppercase font-bold tracking-tight mt-1 text-plum-muted"
                        >Per session</span
                      >
                    </div>
                  </li>
                  <li class="flex items-start gap-4">
                    <LineIcon
                      name="clock"
                      :class="['w-5 h-5 mt-0.5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']"
                    />
                    <div class="flex flex-col">
                      <span class="font-body text-sm font-bold leading-none">
                        {{
                          plan.limits.queueExpiryHours <= 0
                            ? 'No'
                            : plan.limits.queueExpiryHours + 'h'
                        }}
                        Expiry
                      </span>
                      <span
                        class="text-[10px] uppercase font-bold tracking-tight mt-1 text-plum-muted"
                        >Queue Lifetime</span
                      >
                    </div>
                  </li>

                  <li v-if="plan.limits.historyAccess" class="flex items-center gap-4">
                    <History
                      :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']"
                    />
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
                    <LineIcon
                      name="export"
                      :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint-dark']"
                    />
                    <span class="font-body text-sm font-bold">CSV/Excel Export</span>
                  </li>
                  <li v-if="plan.limits.customBranding" class="flex items-center gap-4">
                    <LineIcon
                      name="palette"
                      :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']"
                    />
                    <span class="font-body text-sm font-bold">Custom Branding</span>
                  </li>
                  <li v-if="plan.limits.allowGeoLock" class="flex items-center gap-4">
                    <LineIcon
                      name="pin"
                      :class="['w-5 h-5', isEliteTier(plan) ? 'text-on-mint' : 'text-mint']"
                    />
                    <span class="font-body text-sm font-bold">Geo Fence</span>
                  </li>

                  <li
                    v-if="!plan.limits.customBranding && !isEliteTier(plan)"
                    class="flex items-center gap-4 opacity-30"
                  >
                    <ZapOff class="w-5 h-5" />
                    <span class="font-body text-sm font-medium line-through">Custom Branding</span>
                  </li>
                  <li
                    v-if="!plan.limits.allowGeoLock && !isEliteTier(plan)"
                    class="flex items-center gap-4 opacity-30"
                  >
                    <ZapOff class="w-5 h-5" />
                    <span class="font-body text-sm font-medium line-through">Geo Fence</span>
                  </li>
                </ul>
              </div>

              <BaseButton
                :variant="isEliteTier(plan) ? 'secondary' : 'primary'"
                size="lg"
                class="w-full h-16 text-base"
                :disabled="checkoutLoadingPlan === plan.id"
                @click="handleChoosePlan(plan)"
              >
                <Loader2 v-if="checkoutLoadingPlan === plan.id" class="w-5 h-5 animate-spin mr-2" />
                {{
                  checkoutLoadingPlan === plan.id
                    ? 'Redirecting...'
                    : plan.isFree
                      ? 'Get Started'
                      : 'Choose Plan'
                }}
              </BaseButton>
              <BaseButton
                v-if="hasTrialOffer(plan)"
                variant="outline"
                size="lg"
                class="w-full h-16 text-base mt-3"
                :disabled="checkoutLoadingPlan === plan.id"
                @click="handleChoosePlan(plan, true)"
              >
                <Loader2 v-if="checkoutLoadingPlan === plan.id" class="w-5 h-5 animate-spin mr-2" />
                {{
                  checkoutLoadingPlan === plan.id
                    ? 'Redirecting...'
                    : `Try ${trialOffer?.trialDurationDays}-Day Free Trial`
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

        <!-- Enterprise Banner -->
        <BaseCard
          class="mt-16 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 group hover:border-plum-muted transition-all relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Sparkles class="w-48 h-48 text-plum" />
          </div>

          <div class="max-w-2xl text-center lg:text-left relative z-10">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 bg-plum-deep text-sand text-[10px] font-bold rounded-full uppercase tracking-widest mb-6"
            >
              Global Scale
            </div>
            <h3 class="font-editorial text-4xl md:text-5xl font-bold text-plum mb-4">Enterprise</h3>
            <p class="font-body text-lg text-plum-soft opacity-70 mb-0 leading-relaxed">
              For high-volume operations requiring advanced security, custom SLAs, and dedicated
              account management. Tailored limits for every business need.
            </p>
          </div>

          <div class="flex flex-col items-center lg:items-end gap-6 min-w-[280px] relative z-10">
            <div class="text-center lg:text-right">
              <span class="font-editorial text-4xl font-bold text-plum block mb-2"
                >Custom Pricing</span
              >
              <span class="font-body text-sm font-bold text-plum-muted uppercase tracking-widest"
                >No hidden fees</span
              >
            </div>
            <BaseButton variant="primary" size="lg" class="w-full lg:w-auto h-16 px-12 text-lg">
              Contact Sales
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- Full Comparison Table -->
    <section
      id="comparison"
      class="relative py-20 lg:py-28 z-10 transition-all duration-1000 transform"
      :class="[isVisible('comparison') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center mb-16">
          <p class="font-body text-sm font-semibold text-plum-muted mb-3">Full breakdown</p>
          <h2 class="font-editorial text-4xl font-bold md:text-5xl text-plum mb-4">
            Compare all features
          </h2>
          <p class="font-body text-plum-muted">Deep dive into every plan's capabilities.</p>
        </div>

        <BaseCard class="p-8 lg:p-12 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th
                    class="py-8 pr-6 font-body text-[10px] font-bold text-plum-muted uppercase tracking-[0.2em] border-b border-plum-faint"
                  >
                    Feature Set
                  </th>
                  <th
                    v-for="plan in gridPlans"
                    :key="plan.slug"
                    class="py-8 px-6 text-center border-b border-plum-faint"
                  >
                    <span
                      :class="[
                        'font-body text-sm font-bold uppercase tracking-widest',
                        isEliteTier(plan) ? 'text-mint-dark' : 'text-plum',
                      ]"
                      >{{ plan.name }}</span
                    >
                  </th>
                  <th
                    class="py-8 pl-6 text-center border-b border-plum-faint font-body text-sm font-bold text-plum-muted uppercase tracking-widest"
                  >
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="cat in comparisonFeatures" :key="cat.category">
                  <tr>
                    <td
                      :colspan="gridPlans.length + 2"
                      class="py-10 font-body text-sm font-bold text-mint-dark uppercase tracking-[0.1em]"
                    >
                      {{ cat.category }}
                    </td>
                  </tr>
                  <tr
                    v-for="item in cat.items"
                    :key="item.name"
                    class="group hover:bg-sand/30 transition-colors"
                  >
                    <td
                      class="py-5 pr-6 border-b border-plum-faint/30 font-body text-sm font-bold text-plum-soft group-hover:text-plum transition-colors"
                    >
                      {{ item.name }}
                    </td>
                    <td
                      v-for="plan in gridPlans"
                      :key="plan.slug"
                      class="py-5 px-6 text-center border-b border-plum-faint/30"
                    >
                      <div class="flex justify-center items-center">
                        <template v-if="formatComparisonValue(item, plan) === 'Yes'">
                          <div
                            class="w-8 h-8 rounded-full bg-mint/10 flex items-center justify-center"
                          >
                            <CheckCircle2 class="w-5 h-5 text-mint-dark" />
                          </div>
                        </template>
                        <template v-else-if="formatComparisonValue(item, plan) === 'No'">
                          <span class="text-plum/10 text-xl">—</span>
                        </template>
                        <template v-else>
                          <span class="font-body text-sm font-bold text-plum">{{
                            formatComparisonValue(item, plan)
                          }}</span>
                        </template>
                      </div>
                    </td>
                    <td
                      class="py-5 px-6 text-center border-b border-plum-faint/30 font-body text-[10px] font-bold text-plum-muted uppercase tracking-widest"
                    >
                      {{
                        item.key === 'maxGuestsPerQueue' ||
                        item.key === 'maxQueuesPerMonth' ||
                        item.key === 'historyRetentionDays'
                          ? 'Unlimited'
                          : 'Custom'
                      }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- Final CTA -->
    <section
      id="final-cta"
      class="py-20 lg:py-28 relative overflow-hidden transition-all duration-1000 transform"
      :class="[isVisible('final-cta') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="container mx-auto px-6 relative z-10">
        <div
          class="relative bg-plum-deep rounded-[32px] md:rounded-[48px] lg:rounded-[64px] p-8 md:p-16 lg:p-24 text-center overflow-hidden shadow-[0_60px_100px_-20px_rgba(26,10,46,0.4)]"
        >
          <!-- Inner Atmosphere: single quiet glow, matching the home page CTA -->
          <div
            class="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-mint/10 blur-[100px] md:blur-[140px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"
          />

          <div class="relative z-10 max-w-3xl mx-auto">
            <h2
              class="font-editorial text-4xl md:text-6xl lg:text-7xl font-black text-pure-white leading-[0.95] md:leading-[0.9] tracking-tighter mb-8"
            >
              Ready to reclaim <br />
              your business flow?
            </h2>
            <p
              class="font-body text-base md:text-lg lg:text-xl text-plum-faint mb-12 leading-relaxed"
            >
              Join thousands of businesses worldwide using QueueBuzz to eliminate physical lines and
              boost customer satisfaction.
            </p>
            <div
              class="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center"
            >
              <BaseButton
                size="lg"
                class="h-16 md:h-20 px-8 md:px-12 text-base md:text-xl w-full sm:w-auto shadow-2xl shadow-mint/20"
              >
                Get Started for Free
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="lg"
                class="h-16 md:h-20 px-8 md:px-12 text-base md:text-xl text-pure-white border-2 border-white/10 hover:bg-white/5 w-full sm:w-auto"
              >
                Talk to an Expert
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for the table container */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: var(--color-plum-faint);
  border-radius: 10px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: var(--color-mint);
}
</style>
