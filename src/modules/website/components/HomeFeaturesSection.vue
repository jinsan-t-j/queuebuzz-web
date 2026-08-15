<script setup lang="ts">
import LineIcon from '@/modules/website/components/icons/LineIcon.vue'

defineProps<{
  isVisible: boolean
}>()

const smallFeatures = [
  {
    icon: 'shield' as const,
    title: 'Privacy-first',
    text: 'No tracking, no cookies, and no mandatory phone numbers. We protect your customers as much as you do.',
  },
  {
    icon: 'bolt' as const,
    title: 'Frictionless entry',
    text: 'A simple QR scan opens the portal. No app store hurdles or account creation standing in the way.',
  },
  {
    icon: 'export' as const,
    title: 'Full portability',
    text: 'Your data is yours. Export every session to CSV for internal auditing and deep-dive analytics.',
  },
  {
    icon: 'sync' as const,
    title: 'Robust sync & recovery',
    text: 'State is preserved across signal drops. Guests can reclaim their spot from a recovery email or their browser, even after closing the tab.',
  },
  {
    icon: 'pin' as const,
    title: 'Geo fence',
    text: 'Keep queues honest. Restrict joining to customers physically present within your radius.',
  },
  {
    icon: 'screen' as const,
    title: 'TV display mode',
    text: 'Put "Now Serving" on a lobby screen or tablet — fullscreen, with adjustable text size and an audible chime.',
  },
  {
    icon: 'bell' as const,
    title: 'Buzz notifications',
    text: "A vibrating, sound alert the moment it's a guest's turn — installed straight to the home screen, no SMS bill.",
  },
  {
    icon: 'clock' as const,
    title: 'Push delay',
    text: "Running behind? Add a 5, 10, or 15-minute buffer in one tap and every guest's wait estimate updates instantly.",
  },
  {
    icon: 'palette' as const,
    title: 'Custom branding',
    text: 'Swap the default banner and logo for your own on paid plans, so the queue looks like your business, not ours.',
  },
]
</script>

<template>
  <section id="features" class="relative py-20 lg:py-28 z-10 bg-white">
    <div
      class="container mx-auto px-6 relative transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="max-w-2xl mb-16">
        <p class="font-body text-sm font-semibold text-plum-muted mb-3">Core capabilities</p>
        <h2 class="font-editorial text-4xl font-bold leading-tight md:text-5xl text-plum">
          Everything you need, nothing you don't.
        </h2>
      </div>

      <!-- Supporting feature grid: icon + text only, no invented UI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        <div v-for="f in smallFeatures" :key="f.title">
          <LineIcon :name="f.icon" class="h-7 w-7 text-plum mb-4" />
          <h3 class="font-editorial text-lg font-bold mb-2 text-plum">{{ f.title }}</h3>
          <p class="font-body text-sm text-plum-soft leading-relaxed">{{ f.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
