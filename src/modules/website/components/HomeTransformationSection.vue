<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'

import type { Component } from 'vue'

defineProps<{
  upgradeData: { chaos: string; calm: string; icon: Component; delay: string }[]
  isVisible: boolean
}>()
</script>

<template>
  <section id="comparison" class="relative py-20 lg:py-28 z-10 overflow-hidden">
    <div
      class="container mx-auto px-6 relative transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="max-w-2xl mb-16">
        <p class="font-body text-sm font-semibold text-plum-muted mb-3">The upgrade</p>
        <h2 class="font-editorial text-4xl font-bold md:text-5xl text-plum">
          From <span class="text-plum-muted line-through opacity-40">chaos</span> to
          <span class="text-mint-dark">calm.</span>
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(item, i) in upgradeData" :key="i" :style="{ transitionDelay: item.delay }">
          <BaseCard
            class="p-7 h-full bg-white border-plum-faint hover:border-plum/20 transition-colors"
          >
            <!-- Chaos Side (Faded) -->
            <div class="mb-8 opacity-40">
              <p class="font-body text-xs font-bold uppercase tracking-widest text-plum-muted mb-2">
                Before
              </p>
              <p class="font-body text-base line-through">{{ item.chaos }}</p>
            </div>

            <!-- Calm Side (Active) -->
            <div>
              <component :is="item.icon" class="h-6 w-6 text-mint-dark mb-4" />
              <p class="font-body text-xs font-bold uppercase tracking-widest text-mint-dark mb-2">
                The QueueBuzz way
              </p>
              <p class="font-editorial text-xl font-bold text-plum">{{ item.calm }}</p>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </section>
</template>
