<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  testimonials: { id: number; name: string; role: string; quote: string; avatar: string }[]
  isVisible: boolean
}>()

const itemsPerView = ref(3)
const carouselIdx = ref(0)
const startX = ref(0)
const isDragging = ref(false)

const maxIdx = computed(() => Math.max(0, props.testimonials.length - itemsPerView.value))

function updateItemsPerView() {
  if (typeof globalThis === 'undefined') return
  if (globalThis.innerWidth < 768) itemsPerView.value = 1
  else if (globalThis.innerWidth < 1280) itemsPerView.value = 2
  else itemsPerView.value = 3
  carouselIdx.value = Math.min(carouselIdx.value, maxIdx.value)
}

function prevSlide() {
  carouselIdx.value = Math.max(0, carouselIdx.value - 1)
}

function nextSlide() {
  carouselIdx.value = Math.min(maxIdx.value, carouselIdx.value + 1)
}

function handleDragStart(e: MouseEvent | TouchEvent) {
  startX.value = 'touches' in e ? e.touches[0].clientX : e.clientX
  isDragging.value = true
}

function handleDragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const diffX = clientX - startX.value
  if (Math.abs(diffX) > 60) {
    if (diffX > 0) {
      prevSlide()
    } else {
      nextSlide()
    }
    isDragging.value = false
  }
}

function stopDragging() {
  isDragging.value = false
}

onMounted(() => {
  updateItemsPerView()
  globalThis.addEventListener?.('resize', updateItemsPerView)
})

onUnmounted(() => {
  globalThis.removeEventListener?.('resize', updateItemsPerView)
})
</script>

<template>
  <section
    id="testimonials"
    class="py-20 lg:py-28 relative overflow-hidden bg-sand transition-all duration-1000 transform"
    :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
  >
    <div class="container mx-auto px-6 relative z-10">
      <div class="text-center mb-16">
        <p class="font-body text-sm font-semibold text-plum-muted mb-3">Voices from the field</p>
        <h2 class="font-editorial text-4xl lg:text-5xl font-bold text-plum tracking-tight">
          What early hosts are saying.
        </h2>
      </div>

      <!-- Loading State -->
      <div
        v-if="testimonials.length === 0"
        class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="rounded-3xl border border-plum-faint bg-white p-8 h-[280px] animate-pulse"
        >
          <div class="h-4 w-full bg-plum-faint rounded-full mb-2" />
          <div class="h-4 w-4/5 bg-plum-faint rounded-full mb-10" />
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 rounded-full bg-plum-faint" />
            <div class="space-y-2">
              <div class="h-3 w-20 bg-plum-faint rounded-full" />
              <div class="h-3 w-28 bg-plum-faint rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Carousel -->
      <template v-else>
        <div class="max-w-6xl mx-auto overflow-hidden">
          <div
            class="flex gap-6 transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing select-none"
            :style="{
              transform: `translateX(calc(-${carouselIdx * (100 / itemsPerView)}% - ${carouselIdx * 1.5}rem / ${itemsPerView}))`,
            }"
            @mousedown="handleDragStart"
            @mousemove="handleDragMove"
            @mouseup="stopDragging"
            @mouseleave="stopDragging"
            @touchstart.passive="handleDragStart"
            @touchmove.passive="handleDragMove"
            @touchend="stopDragging"
          >
            <figure
              v-for="t in testimonials"
              :key="t.id"
              class="shrink-0 flex flex-col rounded-3xl border border-plum-faint bg-white p-8 lg:p-9"
              :style="{
                width: `calc(${100 / itemsPerView}% - ${(1.5 * (itemsPerView - 1)) / itemsPerView}rem)`,
              }"
            >
              <blockquote class="font-body text-plum-soft leading-relaxed flex-1">
                {{ t.quote }}
              </blockquote>

              <figcaption class="mt-8 flex items-center gap-3 pt-6 border-t border-plum-faint/70">
                <div
                  class="h-11 w-11 shrink-0 rounded-full flex items-center justify-center bg-mint-light text-plum font-editorial font-bold"
                >
                  {{ t.avatar }}
                </div>
                <div class="min-w-0">
                  <p class="font-body font-bold text-plum text-sm truncate">{{ t.name }}</p>
                  <p class="font-body text-xs text-plum-muted truncate">{{ t.role }}</p>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>

        <!-- Nav -->
        <div v-if="maxIdx > 0" class="flex justify-center items-center gap-4 mt-10">
          <button
            type="button"
            class="w-11 h-11 rounded-full border border-plum-faint flex items-center justify-center text-plum disabled:opacity-30 disabled:cursor-not-allowed hover:border-mint/40 hover:bg-mint-light/30 transition-colors"
            aria-label="Previous testimonials"
            :disabled="carouselIdx === 0"
            @click="prevSlide"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button
            type="button"
            class="w-11 h-11 rounded-full border border-plum-faint flex items-center justify-center text-plum disabled:opacity-30 disabled:cursor-not-allowed hover:border-mint/40 hover:bg-mint-light/30 transition-colors"
            aria-label="Next testimonials"
            :disabled="carouselIdx === maxIdx"
            @click="nextSlide"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
      </template>
    </div>
  </section>
</template>
