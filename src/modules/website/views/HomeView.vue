<script setup lang="ts">
/**
 * @component HomeView
 * @description Landing page for QueueBuzz — composed from isolated section components
 * for faster page loading, better code-splitting, and maintainability.
 */
import { onMounted, computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useQueueStore } from '@/stores/queue.store'
import { useAuthStore } from '@/stores/auth.store'
import { useWebsiteData } from '@/modules/website/composables/useWebsiteData'
import PwaLauncher from '@/modules/website/components/PwaLauncher.vue'
import HomeHeroSection from '@/modules/website/components/HomeHeroSection.vue'
import HomeOsStrip from '@/modules/website/components/HomeOsStrip.vue'
import HomeFeaturesSection from '@/modules/website/components/HomeFeaturesSection.vue'
import HomeHowItWorksSection from '@/modules/website/components/HomeHowItWorksSection.vue'
import HomeDemoSection from '@/modules/website/components/HomeDemoSection.vue'
import HomeUseCasesSection from '@/modules/website/components/HomeUseCasesSection.vue'
import HomeTransformationSection from '@/modules/website/components/HomeTransformationSection.vue'
import HomeImpactSection from '@/modules/website/components/HomeImpactSection.vue'
import HomeFaqSection from '@/modules/website/components/HomeFaqSection.vue'
import HomeTestimonials from '@/modules/website/components/HomeTestimonials.vue'
import HomeCTA from '@/modules/website/components/HomeCTA.vue'

const ActiveQueueBanner = defineAsyncComponent(() => import('../components/ActiveQueueBanner.vue'))
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

onMounted(async () => {
  if (authStore.isHydrated) {
    // eslint-disable-next-line no-console
    try {
      await queueStore.fetchActiveQueue({ skipLogout: true })
    } catch {
      console.error('Failed to fetch active queue')
    }
  }
})

const formattedStartedAt = computed(() => {
  if (!activeQueue.value?.createdAt) return null
  return new Date(activeQueue.value.createdAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
})

const resumeLink = computed(() => {
  if (!activeQueue.value) return '/guest-host/queue/create'
  return authStore.isAuthenticated
    ? '/dashboard'
    : `/guest-host/queue/${activeQueue.value.slug || activeQueue.value.id}/live`
})
</script>

<template>
  <PwaLauncher v-if="isPwa" />

  <div v-else class="min-h-screen bg-sand text-plum selection:bg-mint/30 overflow-x-hidden">
    <!-- Floating Orbs Background (Global Interactive Parallax) -->
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

    <!-- Active Queue Banner -->
    <!-- Active Queue Banner loaded asynchronously -->
    <ActiveQueueBanner
      :active-queue="activeQueue"
      :resume-link="resumeLink"
      :formatted-started-at="formattedStartedAt"
    />

    <!-- Holi Background Atmosphere (Fixed Interactive Parallax) -->
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

    <!-- Sections -->
    <HomeHeroSection
      :hero-badge="HERO_DATA.badge"
      :scroll-y="scrollY"
      :is-visible="isVisible('hero')"
      :industry-categories="INDUSTRY_CATEGORIES"
    />

    <HomeOsStrip :scroll-y="scrollY" />

    <HomeFeaturesSection :is-visible="isVisible('features')" :scroll-y="scrollY" />

    <HomeHowItWorksSection :is-visible="isVisible('how-it-works')" />

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

/* Performance Optimizations */
#faq,
#comparison,
#use-cases {
  content-visibility: auto;
  contain-intrinsic-size: 1px 500px;
}
</style>
