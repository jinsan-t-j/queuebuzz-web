<script setup lang="ts">
/**
 * @component HomeHeroSection
 * @description Modernized hero section for QueueBuzz with embedded product demo and clean visual hierarchy.
 */
import { ArrowRight } from 'lucide-vue-next'
import { computed, defineAsyncComponent } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'

import type { Component } from 'vue'

const props = defineProps<{
  isVisible: boolean
  industryCategories: { name: string; icon: Component }[][]
}>()

const HomeVideoDemoSection = defineAsyncComponent(
  () => import('@/modules/website/components/HomeVideoDemoSection.vue'),
)

// Single quiet trust strip: a flat list of industries, no color-banded gimmicks
const industryStrip = computed(() => {
  const all = [...(props.industryCategories?.[0] || []), ...(props.industryCategories?.[1] || [])]
  return all.slice(0, 14)
})
</script>

<template>
  <section id="hero" class="relative pt-20 pb-16 lg:pt-28 lg:pb-20 z-10 overflow-hidden bg-sand">
    <div
      class="container mx-auto px-6 relative text-center flex flex-col items-center transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <!-- Core Headline -->
      <h1
        class="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold text-plum tracking-tight leading-[1.05] max-w-4xl mx-auto"
      >
        Replace physical lines with
        <span class="text-mint-dark">instant QR queues.</span>
      </h1>

      <!-- Supporting Copy -->
      <p
        class="mt-6 font-body text-base sm:text-lg md:text-xl text-plum-soft max-w-2xl mx-auto leading-relaxed"
      >
        QueueBuzz turns crowded waiting rooms into calm virtual queues. Display your QR code, let
        customers take a digital token on their phone, and track their turn in real time.
      </p>

      <!-- Primary Action Buttons -->
      <div class="mt-6 sm:mt-12 flex items-center justify-center gap-8">
        <router-link to="/guest-host/queue/create">
          <BaseButton
            class="group h-12 px-6 text-base !rounded-lg bg-mint text-plum font-bold hover:bg-mint-dark hover:text-white transition-colors duration-200"
          >
            Start Free Queue
            <ArrowRight class="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </BaseButton>
        </router-link>
        <router-link
          to="/join"
          class="group flex items-center gap-2 font-body text-base font-semibold text-plum hover:text-mint-dark transition-colors"
        >
          Join a Queue
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </router-link>
      </div>

      <!-- Integrated Product Demo Container (Immediately below primary CTAs) -->
      <div class="mt-14 sm:mt-16 w-full max-w-5xl">
        <HomeVideoDemoSection
          id="demo-video"
          youtube-url="https://youtu.be/BaNQZgFbSS4"
          :is-embedded="true"
        />
      </div>

      <!-- Quiet Trust Strip: one row, one tone, no carnival colors -->
      <div class="mt-20 sm:mt-24 w-full text-center">
        <p
          class="font-body text-xs sm:text-sm font-bold uppercase tracking-widest text-plum-muted mb-6"
        >
          Built for businesses where waiting matters
        </p>

        <div class="relative overflow-hidden w-full py-4 border-y border-plum-faint">
          <div
            class="flex gap-10 shrink-0 animate-marquee items-center whitespace-nowrap"
            style="will-change: transform"
          >
            <div v-for="loop in 2" :key="loop" class="flex gap-10 shrink-0 items-center">
              <div v-for="cat in industryStrip" :key="cat.name" class="flex items-center gap-2.5">
                <component :is="cat.icon" class="w-4 h-4 text-plum-muted shrink-0" />
                <span class="font-body text-sm font-semibold text-plum-soft tracking-wide">{{
                  cat.name
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
