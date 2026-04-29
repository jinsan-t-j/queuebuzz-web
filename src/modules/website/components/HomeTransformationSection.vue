<script setup lang="ts">
import type { Component } from 'vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'

defineProps<{
  upgradeData: { chaos: string; calm: string; icon: Component; delay: string }[]
  isVisible: boolean
  scrollY: number
}>()
</script>

<template>
  <section id="comparison" class="relative py-24 lg:py-32 z-10 overflow-hidden">
    <!-- Section Local Splashes: Saffron & Electric Blue Slant (Interactive Parallax) -->
    <div
      class="pointer-events-none absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-400/5 blur-[140px] animate-blob transition-transform duration-700 ease-out"
      :style="{
        clipPath: 'polygon(0 20%, 100% 0, 80% 100%, 0 80%)',
        transform: `translateY(${scrollY * 0.08}px)`,
      }"
    />
    <div
      class="pointer-events-none absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[140px] animate-blob animation-delay-2000 transition-transform duration-1000 ease-out"
      :style="{
        clipPath: 'polygon(20% 0, 100% 20%, 100% 100%, 0 80%)',
        transform: `translateY(${scrollY * -0.05}px)`,
      }"
    />

    <div
      class="container mx-auto px-6 relative transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="text-center mb-24">
        <BaseBadge class="mb-4">THE UPGRADE</BaseBadge>
        <h2 class="font-display text-4xl font-bold md:text-6xl">
          From <span class="text-plum-muted line-through opacity-30">chaos</span> to
          <span class="text-mint">calm.</span>
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="(item, i) in upgradeData"
          :key="i"
          class="relative group"
          :style="{ transitionDelay: item.delay }"
        >
          <BaseCard
            class="p-8 h-full bg-white/40 border-plum/5 backdrop-blur-md hover:bg-white transition-all duration-500 overflow-hidden group"
          >
            <!-- Chaos Side (Faded) -->
            <div class="mb-12 opacity-20 group-hover:opacity-10 transition-opacity">
              <p class="font-display text-xs font-bold uppercase tracking-widest text-plum mb-2">
                BEFORE
              </p>
              <p class="font-body text-lg line-through">{{ item.chaos }}</p>
            </div>

            <!-- Calm Side (Active) -->
            <div class="relative z-10">
              <div
                class="h-16 w-16 rounded-[24px] bg-mint-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500"
              >
                <component :is="item.icon" class="h-8 w-8 text-mint" />
              </div>
              <p class="font-display text-xs font-bold uppercase tracking-widest text-mint mb-2">
                THE QUEUEBUZZ WAY
              </p>
              <p class="font-display text-2xl font-bold text-plum">{{ item.calm }}</p>
            </div>

            <!-- Animated Background Wave -->
            <div
              class="absolute bottom-[-20%] right-[-10%] w-full h-1/2 bg-mint/5 rounded-full blur-3xl group-hover:bg-mint/10 transition-colors"
            />
          </BaseCard>
        </div>
      </div>
    </div>
  </section>
</template>
