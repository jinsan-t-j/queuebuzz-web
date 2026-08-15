<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  isVisible: boolean
}>()
</script>

<template>
  <section
    id="final-cta"
    class="py-20 lg:py-28 relative overflow-hidden transition-all duration-1000 transform"
    :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
  >
    <div class="container mx-auto px-6 relative z-10">
      <div
        class="relative bg-plum-deep rounded-[32px] md:rounded-[48px] lg:rounded-[64px] p-8 md:p-16 lg:p-24 text-center overflow-hidden shadow-[0_60px_100px_-20px_rgba(26,10,46,0.4)]"
      >
        <!-- Inner Atmosphere: single quiet glow -->
        <div
          class="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-mint/10 blur-[100px] md:blur-[140px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"
        />

        <div class="relative z-10 max-w-3xl mx-auto">
          <h2
            class="font-editorial text-4xl md:text-6xl lg:text-7xl font-black text-pure-white leading-[0.95] md:leading-[0.9] tracking-tighter mb-8"
          >
            Ditch the line. <br />
            <span class="text-mint">Claim your calm.</span>
          </h2>

          <p
            class="font-body text-base md:text-lg lg:text-xl text-plum-faint mb-12 leading-relaxed"
          >
            Start delivering a waitless experience today. No credit card, no hardware, no more
            chaos.
          </p>

          <div
            class="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center"
          >
            <router-link to="/guest-host/queue/create" class="w-full sm:w-auto">
              <BaseButton
                size="lg"
                class="h-16 md:h-20 px-8 md:px-12 text-base md:text-xl w-full group shadow-2xl shadow-mint/20"
              >
                Get Started Free
                <ArrowRight
                  class="ml-2 h-5 md:h-6 w-5 md:w-6 transition-transform group-hover:translate-x-2"
                />
              </BaseButton>
            </router-link>
            <router-link to="/pricing" class="w-full sm:w-auto">
              <BaseButton
                variant="ghost"
                size="lg"
                class="h-16 md:h-20 px-8 md:px-12 text-base md:text-xl text-pure-white border-2 border-white/10 hover:bg-white/5 w-full"
              >
                See Pricing
              </BaseButton>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
