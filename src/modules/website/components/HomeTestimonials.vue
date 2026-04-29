<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Quote } from 'lucide-vue-next'
import { useWebsiteData } from '@/modules/website/composables/useWebsiteData'

const { testimonials, scrollY, observeElement } = useWebsiteData()
const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
  observeElement(sectionRef.value)
})
</script>

<template>
  <section id="testimonials" ref="sectionRef" class="py-24 lg:py-32 relative overflow-hidden">
    <!-- Local Atmosphere: Blue Spill -->
    <div
      class="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[140px] rounded-full pointer-events-none"
      :style="{ transform: `translateY(${scrollY * -0.05}px)` }"
    />

    <div class="container mx-auto px-6 relative z-10">
      <div class="text-center mb-20">
        <h2 class="font-display text-4xl lg:text-5xl font-black text-plum tracking-tight">
          Voices from the <span class="text-mint-dark">New Flow.</span>
        </h2>
      </div>

      <div class="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
        <!-- Loading State -->
        <template v-if="testimonials.length === 0">
          <div
            v-for="i in 2"
            :key="i"
            class="bg-white/40 backdrop-blur-xl border border-plum-faint rounded-[40px] p-10 lg:p-12 h-[300px] animate-pulse"
          >
            <div class="h-6 w-3/4 bg-plum-faint rounded-full mb-6" />
            <div class="h-6 w-1/2 bg-plum-faint rounded-full mb-12" />
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 rounded-full bg-plum-faint" />
              <div class="space-y-2">
                <div class="h-4 w-24 bg-plum-faint rounded-full" />
                <div class="h-3 w-32 bg-plum-faint rounded-full" />
              </div>
            </div>
          </div>
        </template>

        <!-- Content -->
        <div
          v-for="t in testimonials"
          v-else
          :key="t.id"
          class="group relative bg-white/40 backdrop-blur-xl border border-plum-faint rounded-[40px] p-10 lg:p-12 transition-all duration-500 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(26,10,46,0.12)] hover:-translate-y-2"
        >
          <Quote
            class="absolute top-10 right-10 h-12 w-12 text-mint/20 group-hover:text-mint/40 transition-colors"
          />

          <p class="font-body text-xl lg:text-2xl text-plum-soft leading-relaxed mb-10 italic">
            "{{ t.quote }}"
          </p>

          <div class="flex items-center gap-4">
            <div
              class="h-14 w-14 rounded-full border-2 border-mint-light overflow-hidden flex items-center justify-center bg-sand text-plum font-display font-bold text-xl"
            >
              {{ t.avatar }}
            </div>
            <div>
              <h4 class="font-display font-bold text-plum text-lg">{{ t.name }}</h4>
              <p class="font-body text-sm text-plum-muted">{{ t.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
