<script setup lang="ts">
import { Smartphone, Laptop, Monitor, Globe } from 'lucide-vue-next'

defineProps<{ scrollY: number }>()
</script>

<template>
  <div
    class="relative py-12 border-y border-plum/5 bg-white/40 backdrop-blur-md overflow-hidden group/os"
  >
    <!-- Subtle Parallax Background Text -->
    <div
      aria-hidden="true"
      class="absolute inset-0 flex items-center justify-center opacity-[0.03] font-display text-9xl font-black whitespace-nowrap pointer-events-none transition-transform duration-1000"
      :style="{ transform: `translateX(${scrollY * 0.1}px)` }"
    >
      ANY OS • ANY BROWSER • ANY DEVICE • ANY OS • ANY BROWSER • ANY DEVICE
    </div>

    <div class="container mx-auto px-6 relative z-10">
      <div class="flex flex-wrap items-center justify-center gap-12 lg:gap-24">
        <div
          class="flex items-center gap-4 group cursor-default transition-all duration-500 hover:scale-105"
        >
          <div
            class="h-12 w-12 rounded-2xl bg-plum/5 flex items-center justify-center transition-colors group-hover:bg-mint/10"
          >
            <Smartphone class="h-6 w-6 text-plum-soft group-hover:text-mint" />
          </div>
          <div class="text-left">
            <p
              class="font-display text-[10px] font-black tracking-widest text-plum-soft uppercase leading-none mb-1"
            >
              Mobile
            </p>
            <p
              class="font-body text-sm font-bold text-plum group-hover:text-plum transition-colors"
            >
              iOS &amp; Android
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-4 group cursor-default transition-all duration-500 hover:scale-105"
        >
          <div
            class="h-12 w-12 rounded-2xl bg-plum/5 flex items-center justify-center transition-colors group-hover:bg-mint/10"
          >
            <Laptop class="h-6 w-6 text-plum-soft group-hover:text-mint" />
          </div>
          <div class="text-left">
            <p
              class="font-display text-[10px] font-black tracking-widest text-plum-soft uppercase leading-none mb-1"
            >
              Desktop
            </p>
            <p
              class="font-body text-sm font-bold text-plum group-hover:text-plum transition-colors"
            >
              Mac &amp; Windows
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-4 group cursor-default transition-all duration-500 hover:scale-105"
        >
          <div
            class="h-12 w-12 rounded-2xl bg-plum/5 flex items-center justify-center transition-colors group-hover:bg-mint/10"
          >
            <Monitor class="h-6 w-6 text-plum-soft group-hover:text-mint" />
          </div>
          <div class="text-left">
            <p
              class="font-display text-[10px] font-black tracking-widest text-plum-soft uppercase leading-none mb-1"
            >
              Legacy
            </p>
            <p
              class="font-body text-sm font-bold text-plum group-hover:text-plum transition-colors"
            >
              Linux &amp; Surface
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-4 group cursor-default transition-all duration-500 hover:scale-105"
        >
          <div
            class="h-12 w-12 rounded-2xl bg-plum/5 flex items-center justify-center transition-colors group-hover:bg-mint/10"
          >
            <Globe class="h-6 w-6 text-plum-soft group-hover:text-mint" />
          </div>
          <div class="text-left">
            <p
              class="font-display text-[10px] font-black tracking-widest text-plum-soft uppercase leading-none mb-1"
            >
              Universal
            </p>
            <p
              class="font-body text-sm font-bold text-plum group-hover:text-plum transition-colors"
            >
              Any Browser
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
