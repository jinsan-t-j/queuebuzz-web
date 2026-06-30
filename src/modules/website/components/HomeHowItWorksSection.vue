<script setup lang="ts">
import { Layers, QrCode, Zap } from 'lucide-vue-next'

import BaseBadge from '@/components/base/BaseBadge.vue'

defineProps<{ isVisible: boolean }>()
</script>

<template>
  <section id="how-it-works" class="py-16 lg:py-24 relative z-10 overflow-hidden">
    <!-- Section Local Splash: Pink Liquid Blob (Interactive Parallax) -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-400/5 blur-[160px] animate-pulse transition-transform duration-500 ease-out"
    />

    <div
      class="container mx-auto px-6 relative transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="text-center mb-16">
        <BaseBadge class="mb-4">THE WORKFLOW</BaseBadge>
        <h2 class="font-display text-4xl font-bold md:text-5xl">
          Three steps to <span class="text-mint-dark">zero lines.</span>
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        <!-- Step 1 -->
        <div class="flex flex-col items-center text-center group">
          <div
            class="h-20 w-20 rounded-[32px] bg-white shadow-xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-mint transition-colors"
          >
            <span
              class="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-plum text-sand font-display font-bold flex items-center justify-center text-lg"
              >1</span
            >
            <Layers class="h-8 w-8 text-plum group-hover:text-white" />
          </div>
          <h3 class="font-display text-2xl font-bold mb-4">Create your Queue</h3>
          <p class="font-body text-plum-soft text-sm leading-relaxed max-w-[280px]">
            Set your business name, logo, and service categories in under 60 seconds. No complex
            setup required.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col items-center text-center group">
          <div
            class="h-20 w-20 rounded-[32px] bg-white shadow-xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-mint transition-colors"
          >
            <span
              class="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-plum text-sand font-display font-bold flex items-center justify-center text-lg"
              >2</span
            >
            <QrCode class="h-8 w-8 text-plum group-hover:text-white" />
          </div>
          <h3 class="font-display text-2xl font-bold mb-4">Display &amp; Join</h3>
          <p class="font-body text-plum-soft text-sm leading-relaxed max-w-[280px]">
            Customers scan your unique QR code at the door. They join instantly on their phone—no
            apps, no accounts.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col items-center text-center group">
          <div
            class="h-20 w-20 rounded-[32px] bg-white shadow-xl flex items-center justify-center mb-8 relative z-10 group-hover:bg-mint transition-colors"
          >
            <span
              class="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-plum text-sand font-display font-bold flex items-center justify-center text-lg"
              >3</span
            >
            <Zap class="h-8 w-8 text-plum group-hover:text-white" />
          </div>
          <h3 class="font-display text-2xl font-bold mb-4">Call &amp; Serve</h3>
          <p class="font-body text-plum-soft text-sm leading-relaxed max-w-[280px]">
            Call the next person with one click. They receive a notification instantly, and your
            lobby stays perfectly clear.
          </p>
        </div>

        <!-- Connecting Lines (Desktop only) -->
        <div
          class="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] bg-plum/5 -z-0"
        />
      </div>
    </div>
  </section>
</template>
