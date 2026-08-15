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
const HomeFeaturesSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeFeaturesSection.vue'),
)
const HomeHowItWorksSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeHowItWorksSection.vue'),
)
const HomeJoinShowcase = defineAsyncComponent(
  () => import('@/modules/website/components/HomeJoinShowcase.vue'),
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
const HomeFaqSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeFaqSection.vue'),
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
  FEATURE_TABS,
  USE_CASES,
  FAQ_LIST,
  INDUSTRY_CATEGORIES,
  testimonials,
  isPwa,
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

  <div v-else class="min-h-screen bg-sand text-plum selection:bg-mint/30">
    <!-- Active Queue Banner -->
    <!-- Active Queue Banner loaded asynchronously -->
    <ActiveQueueBanner
      :active-queue="isQueueValid ? activeQueue : null"
      :resume-link="resumeLink"
      :formatted-started-at="formattedStartedAt"
    />

    <!-- Active Waiting Banner for Customers -->
    <ActiveWaitingBanner :is-floating="true" />

    <HomeHeroSection
      id="hero"
      :is-visible="isVisible('hero')"
      :industry-categories="INDUSTRY_CATEGORIES"
    />

    <HomeFeaturesSection id="features" :is-visible="isVisible('features')" />

    <HomeHowItWorksSection id="how-it-works" :is-visible="isVisible('how-it-works')" />

    <HomeJoinShowcase :is-visible="isVisible('join-showcase')" />

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
    />

    <HomeFaqSection :faq-list="FAQ_LIST" :open-faq-idx="openFaqIdx" @toggle-faq="toggleFaq" />

    <HomeTestimonials :testimonials="testimonials" :is-visible="isVisible('testimonials')" />

    <HomeCTA :is-visible="isVisible('final-cta')" />
  </div>
</template>

<style>
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
