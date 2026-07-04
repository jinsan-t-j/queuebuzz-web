<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  History,
  Layers,
  Loader2,
  MapPin,
  Palette,
  Sparkles,
  Users,
  ZapOff,
} from 'lucide-vue-next'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import { useToast } from '@/composables/useToast'
import {
  comparisonFeatures,
  formatComparisonValue,
  useBilling,
} from '@/modules/app/billing/composables/useBilling'
import { useAuthStore } from '@/stores/auth.store'

const {
  isLoading,
  billingCycle,
  checkoutLoadingPlan,
  checkoutError,
  gridPlans,
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
      await handleChoosePlan(plan)
    }
  }
})

onUnmounted(() => {
  globalThis.removeEventListener('scroll', handleScroll)
})
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
      <div id="plans" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        <template v-if="isLoading">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white/60 border border-plum-faint/30 rounded-[48px] p-10 md:p-12 flex flex-col h-[600px] justify-between animate-pulse"
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
            class="relative flex flex-col p-10 md:p-12 transition-all duration-500 group rounded-[48px] overflow-hidden"
            :class="[
              isEliteTier(plan)
                ? 'bg-mint text-on-mint ring-1 ring-plum/20 shadow-[0_40px_100px_-20px_rgba(0,229,160,0.3)] scale-105 z-10'
                : 'bg-white border-plum-faint hover:border-mint hover:shadow-2xl',
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
                <span class="font-display text-6xl font-black tracking-tighter">
                  {{
                    plan.isFree ? 'Free' : plan.currencySymbol + Math.floor((plan.price || 0) / 100)
                  }}
                </span>
                <div v-if="!plan.isFree" class="flex flex-col">
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
                <div v-else class="flex flex-col">
                  <span class="text-mint-dark text-[11px] font-black uppercase tracking-wider">
                    No credit card
                  </span>
                </div>
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
                <li class="flex items-start gap-4">
                  <Clock
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
                      class="text-[10px] uppercase font-black tracking-tight mt-1 text-plum-muted"
                      >Queue Lifetime</span
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
              class="w-full h-16 rounded-2xl font-black text-base shadow-xl group-hover:scale-[1.02] transition-transform"
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
      <div class="mb-32">
        <BaseCard
          class="bg-white border-2 border-plum-faint p-8 md:p-12 rounded-[48px] flex flex-col lg:flex-row items-center justify-between gap-12 group hover:border-plum transition-all shadow-xl relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Sparkles class="w-48 h-48 text-plum" />
          </div>

          <div class="max-w-2xl text-center lg:text-left relative z-10">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 bg-plum text-sand text-[10px] font-black rounded-full uppercase tracking-widest mb-6"
            >
              Global Scale
            </div>
            <h3 class="font-display text-4xl md:text-5xl font-black text-plum mb-4">Enterprise</h3>
            <p class="font-body text-lg text-plum-soft opacity-70 mb-0 leading-relaxed">
              For high-volume operations requiring advanced security, custom SLAs, and dedicated
              account management. Tailored limits for every business need.
            </p>
          </div>

          <div class="flex flex-col items-center lg:items-end gap-6 min-w-[280px] relative z-10">
            <div class="text-center lg:text-right">
              <span class="font-display text-4xl font-black text-plum block mb-2"
                >Custom Pricing</span
              >
              <span class="font-body text-sm font-bold text-plum-muted uppercase tracking-widest"
                >No hidden fees</span
              >
            </div>
            <BaseButton
              variant="primary"
              class="w-full lg:w-auto h-16 px-12 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform"
            >
              Contact Sales
            </BaseButton>
          </div>
        </BaseCard>
      </div>

      <!-- Full Comparison Table -->
      <div class="mb-32">
        <div class="text-center mb-16">
          <h2 class="font-display text-4xl md:text-5xl font-black text-plum mb-4">
            Compare all features
          </h2>
          <p class="font-body text-plum-muted">Deep dive into every plan's capabilities.</p>
        </div>

        <div
          class="bg-white rounded-[48px] border border-plum-faint p-8 lg:p-12 shadow-2xl overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th
                    class="py-8 pr-6 font-display text-[10px] font-black text-plum-muted uppercase tracking-[0.2em] border-b border-plum-faint"
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
                        'font-display text-sm font-black uppercase tracking-widest',
                        isEliteTier(plan) ? 'text-mint-dark' : 'text-plum',
                      ]"
                      >{{ plan.name }}</span
                    >
                  </th>
                  <th
                    class="py-8 pl-6 text-center border-b border-plum-faint font-display text-sm font-black text-plum-muted uppercase tracking-widest"
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
                      class="py-10 font-display text-sm font-black text-mint-dark uppercase tracking-[0.1em]"
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
                          <span class="font-display text-sm font-black text-plum">{{
                            formatComparisonValue(item, plan)
                          }}</span>
                        </template>
                      </div>
                    </td>
                    <td
                      class="py-5 px-6 text-center border-b border-plum-faint/30 font-display text-[10px] font-black text-plum-muted uppercase tracking-widest"
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
        </div>
      </div>

      <!-- Final CTA -->
      <div
        class="bg-plum rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_60px_120px_-30px_rgba(26,10,46,0.5)]"
      >
        <div class="absolute inset-0 pointer-events-none opacity-20">
          <div
            class="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-mint rounded-full blur-[140px]"
          />
          <div
            class="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-pink-500 rounded-full blur-[140px]"
          />
        </div>

        <div class="relative z-10 max-w-3xl mx-auto">
          <h2
            class="font-display text-4xl md:text-6xl lg:text-7xl font-black text-sand mb-8 tracking-tighter leading-none"
          >
            Ready to reclaim <br />
            your business flow?
          </h2>
          <p class="font-body text-sand/60 text-lg md:text-xl mb-12 leading-relaxed">
            Join thousands of businesses worldwide using QueueBuzz to eliminate physical lines and
            boost customer satisfaction.
          </p>
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <BaseButton
              variant="primary"
              size="lg"
              class="h-18 px-14 rounded-2xl text-xl font-black shadow-2xl hover:scale-105 transition-transform"
            >
              Get Started for Free
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="lg"
              class="h-18 px-14 rounded-2xl text-sand hover:bg-sand/10 font-bold border-sand/20"
            >
              Talk to an Expert
            </BaseButton>
          </div>
        </div>
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

/* Custom Scrollbar for the table container */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #e8e2f0;
  border-radius: 10px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #00e5a0;
}
</style>
