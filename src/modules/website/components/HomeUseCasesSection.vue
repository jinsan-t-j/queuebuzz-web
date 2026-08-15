<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { ref } from 'vue'

import BaseCard from '@/components/base/BaseCard.vue'

import type { Component } from 'vue'

defineProps<{
  useCases: { title: string; description: string; icon: Component }[]
  carouselIdx: number
  itemsPerView: number
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
}>()

const startX = ref(0)
const isDragging = ref(false)

function handleMouseDown(e: MouseEvent) {
  startX.value = e.clientX
  isDragging.value = true
}

function handleTouchStart(e: TouchEvent) {
  startX.value = e.touches[0].clientX
  isDragging.value = true
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const diffX = e.clientX - startX.value
  if (Math.abs(diffX) > 60) {
    if (diffX > 0) {
      emit('prev')
    } else {
      emit('next')
    }
    isDragging.value = false
  }
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  const diffX = e.touches[0].clientX - startX.value
  if (Math.abs(diffX) > 60) {
    if (diffX > 0) {
      emit('prev')
    } else {
      emit('next')
    }
    isDragging.value = false
  }
}

function stopDragging() {
  isDragging.value = false
}
</script>

<template>
  <section id="cases" class="bg-plum-deep py-16 lg:py-24 relative overflow-hidden">
    <div class="container mx-auto px-6 relative z-10">
      <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div class="text-left">
          <h2 class="font-editorial text-4xl font-bold text-pure-white md:text-5xl tracking-tight">
            Standardized for
            <span class="text-mint underline decoration-white/20 underline-offset-[12px]"
              >any industry.</span
            >
          </h2>
          <p class="mt-4 font-body text-plum-faint max-w-xl">
            From boutique cafes to enterprise healthcare, QueueBuzz fits your business like a glove.
          </p>
        </div>

        <div class="flex gap-4">
          <button
            class="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-pure-white hover:bg-white/10 transition-colors"
            aria-label="Previous slide"
            @click="$emit('prev')"
          >
            <ArrowRight class="rotate-180 h-6 w-6" />
          </button>
          <button
            class="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-pure-white hover:bg-white/10 transition-colors"
            aria-label="Next slide"
            @click="$emit('next')"
          >
            <ArrowRight class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="relative">
        <div
          class="flex transition-transform duration-700 ease-in-out gap-8 cursor-grab active:cursor-grabbing select-none"
          :style="{ transform: `translateX(-${carouselIdx * (100 / itemsPerView)}%)` }"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="stopDragging"
          @mouseleave="stopDragging"
          @touchstart.passive="handleTouchStart"
          @touchmove.passive="handleTouchMove"
          @touchend="stopDragging"
        >
          <div
            v-for="uc in useCases"
            :key="uc.title"
            class="min-w-[100%] md:min-w-[calc(50%-16px)] lg:min-w-[calc(33.333%-22px)]"
          >
            <BaseCard
              class="bg-white/5 border-white/10 p-10 h-full text-left hover:bg-white/10 transition-all hover:-translate-y-2 group"
            >
              <div
                class="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:bg-mint/20 transition-colors"
              >
                <component :is="uc.icon" class="h-8 w-8 text-mint" />
              </div>
              <h3 class="font-editorial text-2xl font-bold text-pure-white mb-4">{{ uc.title }}</h3>
              <p class="font-body text-plum-faint text-base leading-relaxed">
                {{ uc.description }}
              </p>
            </BaseCard>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
