<script setup lang="ts">
/**
 * @component HomeView
 * @description Landing page for QueueBuzz — composed from isolated section components
 * for faster page loading, better code-splitting, and maintainability.
 */
import { useSeoMeta } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onMounted } from 'vue'

import { usePrefetch } from '@/composables/usePrefetch'
import { useSchemaOrg } from '@/composables/useSchemaOrg'
import seoConfig from '@/config/seo.constants.json'
import ActiveWaitingBanner from '@/modules/customer/components/ActiveWaitingBanner.vue'
import HomeHeroSection from '@/modules/website/components/HomeHeroSection.vue'
import { useWebsiteData } from '@/modules/website/composables/useWebsiteData'
import { useAuthStore } from '@/stores/auth.store'
import { useQueueStore } from '@/stores/queue.store'

// Lazy-load below-the-fold non-critical components to optimize initial bundle size & LCP
const HomeOsStrip = defineAsyncComponent(
  () => import('@/modules/website/components/HomeOsStrip.vue'),
)
const HomeFeaturesSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeFeaturesSection.vue'),
)
const HomeHowItWorksSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeHowItWorksSection.vue'),
)
const HomeDemoSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeDemoSection.vue'),
)
const HomeUseCasesSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeUseCasesSection.vue'),
)
const HomeTransformationSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeTransformationSection.vue'),
)
const HomeImpactSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeImpactSection.vue'),
)
const HomeFaqSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeFaqSection.vue'),
)
const HomeRoiCalculator = defineAsyncComponent(
  () => import('@/modules/website/components/HomeRoiCalculator.vue'),
)
const HomeTestimonials = defineAsyncComponent(
  () => import('@/modules/website/components/HomeTestimonials.vue'),
)
const HomeCTA = defineAsyncComponent(() => import('@/modules/website/components/HomeCTA.vue'))
const PwaLauncher = defineAsyncComponent(
  () => import('@/modules/website/components/PwaLauncher.vue'),
)

useSeoMeta(seoConfig['/'])

const ActiveQueueBanner = defineAsyncComponent(() => import('../components/ActiveQueueBanner.vue'))

// Background-prefetch page chunks during browser idle times to guarantee instant page transitions.
// Ordered by priority: Core CTAs -> Customer Entryway -> Auth -> Sales Funnel -> Support
usePrefetch({
  // 1. Core CTA destinations (Start Queue / Active Queue Dashboard)
  GuestHostCreateQueueView: () => import('@/modules/app/queue/views/GuestHostCreateQueueView.vue'),
  GuestHostLiveQueueView: () => import('@/modules/app/queue/views/GuestHostLiveQueueView.vue'),
  DashboardView: () => import('@/modules/app/dashboard/views/DashboardView.vue'),

  // 2. Primary customer entryway (Enter Join Code)
  JoinByCodeView: () => import('@/modules/customer/views/JoinByCodeView.vue'),

  // 3. User Authentication
  LoginView: () => import('@/modules/app/auth/views/LoginView.vue'),

  // 4. Sales Funnel
  PricingView: () => import('@/modules/website/views/PricingView.vue'),

  // 5. Support & FAQ
  SupportView: () => import('@/modules/website/views/SupportView.vue'),
})

const queueStore = useQueueStore()
const authStore = useAuthStore()
const { activeQueue } = storeToRefs(queueStore)

const {
  HERO_DATA,
  IMPACT_METRICS,
  FEATURE_TABS,
  USE_CASES,
  FAQ_LIST,
  INDUSTRY_CATEGORIES,
  isPwa,
  scrollY,
  activeTab,
  openFaqIdx,
  carouselIdx,
  itemsPerView,
  activeFeature,
  UPGRADE_DATA,
  nextSlide,
  prevSlide,
  isVisible,
  toggleFaq,
} = useWebsiteData()

const { injectHomeSchema } = useSchemaOrg()
injectHomeSchema(FAQ_LIST)

onMounted(async () => {
  if (authStore.user || authStore.anonymousQueueId) {
    try {
      await queueStore.fetchActiveQueue({ skipLogout: true })
    } catch {
      // Intentionally left empty
    }
  }
})

const isQueueValid = computed(() => {
  if (!activeQueue.value?.status) return false
  const status = activeQueue.value.status.toUpperCase()
  return status === 'ACTIVE' || status === 'PAUSED'
})

const formattedStartedAt = computed(() => {
  if (!activeQueue.value?.createdAt || !isQueueValid.value) return null
  return new Date(activeQueue.value.createdAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
})

const resumeLink = computed(() => {
  if (!activeQueue.value || !isQueueValid.value) return '/guest-host/queue/create'
  return authStore.isAuthenticated
    ? '/dashboard'
    : `/guest-host/queue/${activeQueue.value.slug || activeQueue.value.id}/live`
})
</script>

<template>
  <PwaLauncher v-if="isPwa" />

  <div v-else class="min-h-screen bg-sand text-plum selection:bg-mint/30 overflow-x-hidden">
    <!-- Floating Orbs Background (Global Interactive Parallax) -->
    <div
      class="fixed inset-0 pointer-events-none z-0"
      style="overflow-anchor: none"
      aria-hidden="true"
    >
      <div
        class="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px] animate-blob"
        style="will-change: transform"
        :style="{ transform: `translateY(${scrollY * 0.04}px)` }"
      />
      <div
        class="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-plum/5 rounded-full blur-[120px] animate-blob animation-delay-2000"
        style="will-change: transform"
        :style="{ transform: `translateY(${scrollY * -0.06}px)` }"
      />
    </div>

    <!-- Active Queue Banner -->
    <!-- Active Queue Banner loaded asynchronously -->
    <ActiveQueueBanner
      :active-queue="isQueueValid ? activeQueue : null"
      :resume-link="resumeLink"
      :formatted-started-at="formattedStartedAt"
    />

    <!-- Active Waiting Banner for Customers -->
    <ActiveWaitingBanner :is-floating="true" />

    <!-- Holi Background Atmosphere (Fixed Interactive Parallax) -->
    <div
      class="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style="overflow-anchor: none"
      aria-hidden="true"
    >
      <div
        class="absolute top-[-5%] left-[-10%] w-[70%] h-[60%] bg-pink-500/5 blur-[160px] animate-blob"
        style="will-change: transform"
        :style="{
          clipPath: 'polygon(15% 0, 100% 10%, 85% 95%, 0 80%)',
          transform: `translateY(${scrollY * 0.08}px)`,
        }"
      />
      <div
        class="absolute bottom-[-5%] right-[-10%] w-[60%] h-[50%] bg-blue-500/5 blur-[140px] animate-blob animation-delay-2000"
        style="will-change: transform"
        :style="{
          clipPath: 'polygon(25% 15%, 90% 0, 100% 85%, 10% 100%)',
          transform: `translateY(${scrollY * -0.12}px)`,
        }"
      />
    </div>

    <HomeHeroSection
      id="hero"
      :hero-badge="HERO_DATA.badge"
      :scroll-y="scrollY"
      :is-visible="isVisible('hero')"
      :industry-categories="INDUSTRY_CATEGORIES"
    />

    <HomeOsStrip :scroll-y="scrollY" />

    <HomeFeaturesSection id="features" :is-visible="isVisible('features')" :scroll-y="scrollY" />

    <HomeHowItWorksSection id="how-it-works" :is-visible="isVisible('how-it-works')" />

    <HomeRoiCalculator />

    <HomeDemoSection
      v-model:active-tab="activeTab"
      :feature-tabs="FEATURE_TABS"
      :active-feature="activeFeature"
    />

    <HomeUseCasesSection
      :use-cases="USE_CASES"
      :carousel-idx="carouselIdx"
      :items-per-view="itemsPerView"
      @prev="prevSlide"
      @next="nextSlide"
    />

    <HomeTransformationSection
      id="comparison"
      :upgrade-data="UPGRADE_DATA"
      :is-visible="isVisible('comparison')"
      :scroll-y="scrollY"
    />

    <HomeImpactSection :metrics="IMPACT_METRICS" />

    <HomeFaqSection
      :faq-list="FAQ_LIST"
      :open-faq-idx="openFaqIdx"
      :scroll-y="scrollY"
      @toggle-faq="toggleFaq"
    />

    <HomeTestimonials />

    <HomeCTA />
  </div>
</template>

<style>
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
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
@keyframes marquee-reverse {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}
.animate-marquee {
  animation: marquee 50s linear infinite;
}
.animate-marquee-reverse {
  animation: marquee-reverse 60s linear infinite;
}

/* Accessibility: pause all infinite animations for motion-sensitive users */
@media (prefers-reduced-motion: reduce) {
  .animate-blob,
  .animate-float,
  .animate-marquee,
  .animate-marquee-reverse {
    animation: none;
  }
}

/* Performance Optimizations */
#faq,
#comparison,
#use-cases {
  content-visibility: auto;
  contain-intrinsic-size: 1px 500px;
}
</style>
