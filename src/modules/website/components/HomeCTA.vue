<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowRight, Sparkles } from 'lucide-vue-next'
import { useWebsiteData } from '@/modules/website/composables/useWebsiteData'
import BaseButton from '@/components/base/BaseButton.vue'

const { observeElement } = useWebsiteData()
const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
  observeElement(sectionRef.value)
})
</script>

<template>
  <section id="final-cta" ref="sectionRef" class="py-24 lg:py-40 relative overflow-hidden">
    <div class="container mx-auto px-6 relative z-10">
      <div
        class="relative bg-plum-deep rounded-[32px] md:rounded-[48px] lg:rounded-[64px] p-8 md:p-16 lg:p-24 text-center overflow-hidden shadow-[0_60px_100px_-20px_rgba(26,10,46,0.4)]"
      >
        <!-- Inner Atmosphere: Golden/Orange Glow -->
        <div
          class="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-orange-500/10 blur-[100px] md:blur-[140px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"
        />
        <div
          class="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-mint/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4"
        />

        <div class="relative z-10 max-w-3xl mx-auto">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 mb-8 backdrop-blur-md"
          >
            <Sparkles class="h-4 w-4 text-mint" />
            <span class="font-body text-xs font-bold text-mint uppercase tracking-widest"
              >Ready to orchestrate?</span
            >
          </div>

          <h2
            class="font-display text-4xl md:text-6xl lg:text-7xl font-black text-pure-white leading-[0.95] md:leading-[0.9] tracking-tighter mb-8"
          >
            Ditch the line. <br />
            <span class="text-mint">Claim your calm.</span>
          </h2>

          <p
            class="font-body text-base md:text-lg lg:text-xl text-plum-faint mb-12 leading-relaxed"
          >
            Join 1,200+ businesses delivering a waitless experience today. No credit card, no
            hardware, no more chaos.
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

        <!-- Floaties -->
        <div
          class="hidden md:block absolute top-20 left-20 h-24 w-24 bg-white/5 border border-white/10 rounded-[32px] rotate-12 backdrop-blur-3xl animate-float pointer-events-none"
          style="animation-duration: 8s"
        />
        <div
          class="hidden md:block absolute bottom-20 right-20 h-16 w-16 bg-mint/10 border border-mint/20 rounded-[24px] -rotate-12 backdrop-blur-xl animate-float pointer-events-none"
          style="animation-duration: 6s; animation-delay: -2s"
        />
      </div>
    </div>
  </section>
</template>
