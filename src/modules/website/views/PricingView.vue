<script setup lang="ts">
// 1. Vue core imports
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { CheckCircle2, ShieldCheck } from 'lucide-vue-next'

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
const scrollY = ref(0)
const handleScroll = () => {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

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
  <div class="relative min-h-screen overflow-hidden bg-sand">
    <!-- Global Atmospheric Splashes -->
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-mint/5 rounded-full blur-[140px] animate-blob transition-transform duration-1000 ease-out"
        :style="{ transform: `translateY(${scrollY * 0.05}px)` }"
      />
      <div
        class="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-plum/5 rounded-full blur-[140px] animate-blob animation-delay-2000 transition-transform duration-1000 ease-out"
        :style="{ transform: `translateY(${scrollY * -0.08}px)` }"
      />
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div class="text-center mb-20">
        <h1
          class="font-display text-5xl font-black text-plum md:text-7xl lg:text-8xl tracking-tight leading-none mb-8"
        >
          Simple pricing, <br />
          <span class="text-mint">no surprises.</span>
        </h1>
        <p
          class="mx-auto max-w-2xl font-body text-lg md:text-xl text-plum-soft leading-relaxed opacity-80"
        >
          Scale your business without the overhead. Start free, upgrade when you're ready to
          dominate the queue.
        </p>
      </div>

      <div class="mx-auto max-w-5xl grid gap-8 md:grid-cols-2 items-stretch">
        <BaseCard
          v-for="plan in plans"
          :key="plan.id"
          class="relative flex flex-col p-10 md:p-12 bg-white/40 backdrop-blur-3xl border-plum/5 hover:bg-white/60 transition-all duration-500 group overflow-hidden"
          :class="
            plan.isPrimary
              ? 'ring-2 ring-mint shadow-[0_32px_64px_rgba(0,229,160,0.15)] md:-translate-y-4'
              : 'shadow-xl'
          "
        >
          <!-- Premium Badge -->
          <div
            v-if="plan.isPrimary"
            class="absolute top-6 right-6 px-3 py-1 rounded-full bg-mint text-plum font-display text-[10px] font-black uppercase tracking-widest"
          >
            MOST POPULAR
          </div>

          <div class="flex-1">
            <h2 class="font-display text-3xl font-bold text-plum mb-2">{{ plan.name }}</h2>
            <div class="flex items-baseline gap-2 mb-10">
              <span class="font-display text-5xl font-black text-plum">{{ plan.price }}</span>
              <span class="font-body text-base text-plum-muted">{{ plan.period }}</span>
            </div>

            <ul class="space-y-5 mb-12">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-center gap-4 font-body text-sm text-plum group-hover:translate-x-1 transition-transform"
              >
                <div
                  class="h-6 w-6 rounded-lg bg-mint/10 flex items-center justify-center shrink-0"
                >
                  <CheckCircle2 class="h-4 w-4 text-mint" />
                </div>
                <span class="leading-snug">{{ feature }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-auto">
            <router-link :to="plan.isPrimary ? '/premium' : '/login'">
              <BaseButton
                :variant="plan.isPrimary ? 'primary' : 'secondary'"
                size="lg"
                class="w-full h-16 text-lg font-bold shadow-lg transition-all active:scale-95"
                :class="plan.isPrimary ? 'hover:shadow-mint/30' : ''"
              >
                {{ plan.cta }}
              </BaseButton>
            </router-link>
            <p
              class="text-center mt-4 font-body text-[10px] text-plum-muted uppercase tracking-[0.2em]"
            >
              {{ plan.id === 'free' ? 'No credit card required' : 'Cancel anytime' }}
            </p>
          </div>
        </BaseCard>
      </div>

      <!-- Trust Badges -->
      <div
        class="mt-32 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
      >
        <div
          v-for="t in ['Secure Payments', 'Cloud Hosted', 'GDPR Compliant', 'No Contracts']"
          :key="t"
          class="flex items-center gap-3"
        >
          <ShieldCheck class="h-5 w-5 text-plum" />
          <span class="font-display text-[11px] font-black uppercase tracking-widest">{{ t }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
