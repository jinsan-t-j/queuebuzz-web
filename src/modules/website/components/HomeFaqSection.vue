<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  faqList: { question: string; answer: string }[]
  openFaqIdx: number | null
  scrollY: number
}>()

defineEmits<{ (e: 'toggle-faq', idx: number): void }>()
</script>

<template>
  <section id="faq" class="relative py-16 lg:py-24 overflow-hidden">
    <!-- Section Local Splash: Purple Paint Stroke (Interactive Parallax) -->
    <div
      class="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-500/5 blur-[120px] animate-pulse transition-transform duration-1000 ease-out"
      :style="{
        clipPath: 'polygon(0 40%, 100% 20%, 90% 100%, 10% 80%)',
        transform: `translate(-50%, ${scrollY * -0.04}px)`,
      }"
    />

    <div class="container mx-auto px-6 max-w-3xl relative z-10">
      <h2 class="font-display text-4xl font-bold text-center mb-16">Deep Dives &amp; Doubts</h2>
      <div class="space-y-4">
        <div
          v-for="(f, i) in faqList"
          :key="i"
          class="rounded-[32px] border border-plum-faint bg-white overflow-hidden transition-all duration-300"
          :class="openFaqIdx === i ? 'shadow-2xl border-plum/10' : ''"
        >
          <h3>
            <button
              type="button"
              class="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-sand/30 font-body font-bold text-lg text-plum"
              @click="$emit('toggle-faq', i)"
            >
              <span>{{ f.question }}</span>
              <ChevronDown
                class="h-5 w-5 text-plum-muted transition-transform"
                :class="openFaqIdx === i ? 'rotate-180' : ''"
              />
            </button>
          </h3>
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-show="openFaqIdx === i" class="px-8 pb-8">
              <div class="pt-4 border-t border-plum-faint font-body text-plum-soft leading-relaxed">
                {{ f.answer }}
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>
