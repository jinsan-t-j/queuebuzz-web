<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Component } from 'vue'
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Globe,
  Zap,
  Bot,
  BarChart3,
  TrendingUp,
  Coffee,
  Stethoscope,
  Scissors,
  ShoppingBag,
  Smartphone,
  Lock,
  Timer,
  Wifi,
} from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'

defineProps<{
  heroBadge: string
  scrollY: number
  isVisible: boolean
  industryCategories: { name: string; icon: Component }[][]
}>()
const row1Ref = ref<HTMLElement | null>(null)
const row2Ref = ref<HTMLElement | null>(null)

let isDraggingRow1 = false
let isDraggingRow2 = false
let row1ScrollPos = 0
let row2ScrollPos = 0

function makeDraggable(el: HTMLElement, rowId: 1 | 2) {
  let isDown = false
  let startX: number
  let scrollLeft: number

  el.addEventListener('mousedown', (e) => {
    isDown = true
    if (rowId === 1) isDraggingRow1 = true
    else isDraggingRow2 = true

    el.classList.add('cursor-grabbing')
    el.classList.remove('cursor-grab')
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
  })

  el.addEventListener(
    'touchstart',
    (e) => {
      isDown = true
      if (rowId === 1) isDraggingRow1 = true
      else isDraggingRow2 = true
      startX = e.touches[0].pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    },
    { passive: true },
  )

  el.addEventListener('mouseleave', () => {
    isDown = false
    if (rowId === 1) isDraggingRow1 = false
    else isDraggingRow2 = false
    el.classList.remove('cursor-grabbing')
    el.classList.add('cursor-grab')
  })

  el.addEventListener('mouseup', () => {
    isDown = false
    if (rowId === 1) isDraggingRow1 = false
    else isDraggingRow2 = false
    el.classList.remove('cursor-grabbing')
    el.classList.add('cursor-grab')
  })

  el.addEventListener('touchend', () => {
    isDown = false
    if (rowId === 1) isDraggingRow1 = false
    else isDraggingRow2 = false
  })

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX) * 1.5
    el.scrollLeft = scrollLeft - walk

    if (rowId === 1) row1ScrollPos = el.scrollLeft
    else row2ScrollPos = el.scrollLeft
  })

  el.addEventListener(
    'touchmove',
    (e) => {
      if (!isDown) return
      const x = e.touches[0].pageX - el.offsetLeft
      const walk = (x - startX) * 1.5
      el.scrollLeft = scrollLeft - walk

      if (rowId === 1) row1ScrollPos = el.scrollLeft
      else row2ScrollPos = el.scrollLeft
    },
    { passive: true },
  )
}

onMounted(() => {
  if (row1Ref.value) makeDraggable(row1Ref.value, 1)
  if (row2Ref.value) makeDraggable(row2Ref.value, 2)

  setInterval(() => {
    if (!isDraggingRow1 && row1Ref.value) {
      row1ScrollPos += 0.8
      if (row1ScrollPos >= row1Ref.value.scrollWidth / 2) {
        row1ScrollPos = 0
      }
      row1Ref.value.scrollLeft = row1ScrollPos
    }
    if (!isDraggingRow2 && row2Ref.value) {
      row2ScrollPos += 1.5
      if (row2ScrollPos >= row2Ref.value.scrollWidth / 2) {
        row2ScrollPos = 0
      }
      row2Ref.value.scrollLeft = row2ScrollPos
    }
  }, 16)
})
</script>

<template>
  <section id="hero" class="relative pt-15 pb-20 lg:pb-32 z-10 overflow-hidden">
    <!-- Section Local Splash: Orange Spill (Interactive Parallax) -->
    <div
      class="pointer-events-none absolute top-1/2 left-0 w-[600px] h-[500px] bg-orange-500/5 blur-[120px] animate-pulse transition-transform duration-500 ease-out"
      :style="{
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        transform: `translateY(${scrollY * 0.15}px)`,
      }"
    />

    <div
      class="container mx-auto px-6 relative transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <!-- Left Column: Content -->
        <div class="text-left">
          <BaseBadge variant="mint" class="mb-6 inline-flex items-center gap-2">
            <Globe class="h-3 w-3" /> {{ heroBadge }}
          </BaseBadge>

          <h1
            class="font-display text-5xl font-black text-plum md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter"
          >
            ZERO LINES. <br />
            <span class="text-mint-dark">BETTER BUSINESS.</span>
          </h1>

          <p class="mt-8 font-body text-lg text-plum-soft max-w-xl leading-relaxed lg:text-xl">
            Stop managing crowds and start managing your business. Ditch the physical line and let
            your customers wander freely while you orchestrate the flow with
            <span class="font-bold text-plum">absolute precision.</span>
          </p>

          <div class="mt-12 flex flex-col sm:flex-row gap-4">
            <router-link to="/guest-host/queue/create" class="w-full sm:w-auto">
              <BaseButton
                size="lg"
                class="group h-14 px-8 text-base !rounded-2xl shadow-md shadow-mint/10 hover:shadow-xl hover:shadow-mint/20 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
              >
                Start Free Queue
                <ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </BaseButton>
            </router-link>
            <router-link to="/join" class="w-full sm:w-auto">
              <BaseButton
                variant="ghost"
                size="lg"
                class="h-14 px-8 text-base border border-plum-faint/80 bg-white/60 backdrop-blur-sm !rounded-2xl hover:bg-white hover:border-plum/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 w-full sm:w-auto text-plum"
              >
                Join a Queue
              </BaseButton>
            </router-link>
          </div>

          <!-- Trust & Proof Bar -->
          <div class="mt-16">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                v-for="item in [
                  { icon: Wifi, label: '99.9% Uptime', sub: 'Sync reliability' },
                  { icon: Smartphone, label: 'Any OS', sub: 'Works everywhere' },
                  { icon: Timer, label: 'Under 60s', sub: 'Setup time' },
                  { icon: Lock, label: 'Enterprise', sub: 'Privacy-first' },
                ]"
                :key="item.label"
                class="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/50 border border-plum/5 backdrop-blur-sm hover:bg-white hover:border-mint/20 hover:shadow-lg hover:shadow-mint/5 transition-all duration-300 cursor-default"
              >
                <div
                  class="flex-shrink-0 h-8 w-8 rounded-xl bg-mint-light flex items-center justify-center group-hover:bg-mint/20 transition-colors"
                >
                  <component :is="item.icon" class="h-4 w-4 text-mint" />
                </div>
                <div class="min-w-0">
                  <p class="font-body text-[11px] font-bold text-plum leading-none truncate">
                    {{ item.label }}
                  </p>
                  <p
                    class="font-body text-[9px] text-plum-soft uppercase tracking-widest mt-0.5 truncate"
                  >
                    {{ item.sub }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Liquid Glass "Fan" Stack + Micro-Particle Galaxy -->
        <div
          class="relative flex items-center justify-center h-[500px] lg:h-[750px] mt-12 lg:mt-0 lg:-mr-40 scale-[0.6] sm:scale-[0.8] lg:scale-110 origin-center transition-all duration-700"
        >
          <!-- Background Atmosphere Blobs -->
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mint/10 rounded-full blur-[140px] animate-pulse transition-transform duration-300 ease-out"
            :style="{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.15}px))` }"
          />
          <div
            class="absolute top-1/3 left-1/3 w-64 h-64 bg-plum/5 rounded-full blur-[100px] animate-bounce transition-transform duration-500 ease-out"
            style="animation-duration: 8s"
            :style="{ transform: `translateY(${scrollY * -0.1}px)` }"
          />

          <div class="relative w-full h-full flex items-center justify-center">
            <!-- Micro-Particle Galaxy -->
            <div
              class="absolute bottom-20 right-40 z-50 animate-float opacity-10 transition-transform duration-300"
              style="animation-duration: 10s; animation-delay: -2s"
              :style="{ transform: `translateY(${scrollY * -0.05}px)` }"
            >
              <ShieldCheck class="h-10 w-10 text-purple-600 blur-[1px]" />
            </div>
            <div
              class="absolute -top-10 left-1/2 z-0 animate-float opacity-20 transition-transform duration-200"
              style="animation-duration: 7s"
              :style="{ transform: `translateY(${scrollY * 0.3}px)` }"
            >
              <Smartphone class="h-12 w-12 text-plum" />
            </div>
            <div
              class="absolute top-1/3 -right-10 h-4 w-4 bg-mint/40 rounded-full blur-sm animate-pulse transition-transform duration-500"
              :style="{ transform: `translateY(${scrollY * -0.15}px)` }"
            />
            <div
              class="absolute bottom-1/3 -left-20 h-6 w-6 bg-plum/20 rounded-full blur-sm animate-pulse transition-transform duration-400"
              style="animation-delay: -3s"
              :style="{ transform: `translateY(${scrollY * 0.12}px)` }"
            />

            <!-- 1. Security (Quiet Pink Glass) -->
            <div
              class="group absolute w-[260px] h-[340px] z-10 -translate-x-48 translate-y-24 -rotate-[18deg] animate-float opacity-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:rotate-0 hover:opacity-100 hover:shadow-[0_30px_60px_rgba(236,72,153,0.25)] hover:[animation-play-state:paused] rounded-[40px] overflow-hidden"
              style="animation-delay: -4s; animation-duration: 8s"
            >
              <div
                class="w-full h-full bg-pink-500/10 backdrop-blur-3xl border border-pink-500/20 rounded-[40px] flex flex-col items-center justify-center p-10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-pink-500/20 group-hover:border-pink-500/40"
              >
                <div class="relative mb-8">
                  <ShieldCheck
                    class="h-20 w-20 text-pink-500 transition-all duration-500 group-hover:text-pink-500 group-hover:drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]"
                  />
                </div>
                <div class="space-y-2 w-full mt-auto">
                  <div
                    v-for="w in [70, 100, 85]"
                    :key="w"
                    class="h-1 bg-pink-500/10 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-pink-500/40 transition-all duration-500"
                      :style="{ width: w + '%' }"
                    />
                  </div>
                  <p
                    class="pt-6 font-mono text-[8px] font-black text-pink-500/40 transition-opacity duration-500 group-hover:text-pink-500 group-hover:opacity-100 uppercase tracking-[0.2em] text-center"
                  >
                    Encrypted Flux
                  </p>
                </div>
              </div>
            </div>

            <!-- 2. Automation (Quiet Teal Glass) -->
            <div
              class="group absolute w-[280px] h-[340px] z-10 translate-x-60 -translate-y-32 -rotate-12 animate-float opacity-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:rotate-0 hover:opacity-100 hover:shadow-[0_20px_50px_rgba(20,184,166,0.3)] hover:[animation-play-state:paused] rounded-[40px] overflow-hidden"
              style="animation-delay: -5s; animation-duration: 10s"
            >
              <div
                class="w-full h-full bg-teal-500/10 backdrop-blur-3xl rounded-[40px] border border-teal-500/20 p-8 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-teal-500/20 group-hover:border-teal-500/40"
              >
                <div class="relative mb-8">
                  <Bot
                    class="h-16 w-16 text-teal-500 transition-all duration-500 group-hover:text-teal-500 group-hover:drop-shadow-[0_0_20px_rgba(20,184,166,0.6)]"
                  />
                  <div
                    class="absolute -left-8 top-1/2 -translate-y-1/2 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0"
                  >
                    <div class="w-2 h-2 rounded-full bg-teal-500/40" />
                    <div class="w-4 h-px bg-teal-500/20" />
                    <div class="w-2 h-2 rounded-full bg-teal-500" />
                  </div>
                </div>
                <div
                  class="px-4 py-1 bg-teal-500/10 rounded-full border border-teal-500/20 group-hover:border-teal-500/40 transition-all"
                >
                  <p
                    class="font-mono text-[8px] font-black text-teal-600 transition-colors uppercase tracking-[0.2em]"
                  >
                    Auto-Sync
                  </p>
                </div>
              </div>
            </div>

            <!-- 3. Industry Grid -->
            <div
              class="group absolute w-[320px] h-[320px] z-20 -translate-x-40 translate-y-20 -rotate-12 animate-float opacity-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:rotate-0 hover:opacity-100 hover:shadow-[0_30px_60px_rgba(26,10,46,0.15)] hover:[animation-play-state:paused] rounded-[48px] overflow-hidden"
              style="animation-delay: -2s; animation-duration: 7s"
            >
              <div
                class="w-full h-full bg-plum/10 backdrop-blur-3xl border border-plum/20 rounded-[48px] flex flex-col p-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-plum/20 group-hover:border-plum/40"
              >
                <div class="grid grid-cols-2 gap-4 h-full relative">
                  <div
                    class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div class="h-px w-full bg-plum/20 absolute top-1/2" />
                    <div class="w-px h-full bg-plum/20 absolute left-1/2" />
                  </div>
                  <div
                    v-for="(icon, i) in [Coffee, Stethoscope, Scissors, ShoppingBag]"
                    :key="i"
                    class="bg-plum/10 rounded-2xl flex items-center justify-center border border-plum/20 transition-all duration-500 group-hover:bg-mint/40 group-hover:border-mint/60"
                  >
                    <component
                      :is="icon"
                      class="h-8 w-8 text-plum transition-all duration-500 group-hover:text-plum group-hover:scale-110"
                    />
                  </div>
                </div>
                <p
                  class="mt-4 font-display text-[9px] font-black text-plum transition-opacity duration-500 uppercase tracking-[0.3em] text-center"
                >
                  Verticals
                </p>
              </div>
            </div>

            <!-- 4. Community (Quiet Purple Glass) -->
            <div
              class="group absolute w-[260px] h-[320px] z-30 -translate-x-60 -translate-y-12 -rotate-6 animate-float opacity-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:rotate-0 hover:opacity-100 hover:shadow-[0_30px_60px_rgba(147,51,234,0.25)] rounded-[40px] overflow-hidden hover:[animation-play-state:paused]"
              style="animation-delay: -3.5s; animation-duration: 9s"
            >
              <div
                class="w-full h-full bg-purple-600/15 backdrop-blur-3xl border border-purple-600/30 rounded-[40px] flex flex-col items-center justify-center p-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-purple-600/30 group-hover:border-purple-600/60"
              >
                <div
                  class="flex -space-x-3 mb-8 transition-transform duration-500 group-hover:scale-110"
                >
                  <div v-for="i in 4" :key="i" class="relative">
                    <div
                      class="h-10 w-10 rounded-full border-2 border-plum/20 bg-purple-500/20 backdrop-blur-xl flex items-center justify-center text-[10px] font-bold text-plum shadow-sm transition-all group-hover:border-white/80"
                    >
                      {{ ['A', 'J', 'S', 'K'][i - 1] }}
                    </div>
                    <div
                      class="absolute -top-1 -right-1 h-2 w-2 bg-mint rounded-full border border-white opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                    />
                  </div>
                </div>
                <Users
                  class="h-12 w-12 text-purple-600 transition-all duration-500 group-hover:text-purple-600 group-hover:drop-shadow-[0_0_15px_rgba(147,51,234,0.6)]"
                />
                <p
                  class="mt-4 font-display text-[9px] font-black text-purple-600 transition-opacity duration-500 uppercase tracking-widest text-center"
                >
                  +1.2k Active
                </p>
              </div>
            </div>

            <!-- 5. Insights (Quiet Blue Glass) -->
            <div
              class="group absolute w-[300px] h-[380px] z-20 translate-x-24 -translate-y-12 rotate-[8deg] animate-float opacity-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:rotate-0 hover:opacity-100 hover:shadow-[0_30px_60px_rgba(37,99,235,0.25)] hover:[animation-play-state:paused] rounded-[40px] overflow-hidden"
              style="animation-delay: -1s; animation-duration: 6s"
            >
              <div
                class="w-full h-full bg-blue-600/10 backdrop-blur-3xl border border-blue-600/20 rounded-[40px] p-8 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-blue-600/20 group-hover:border-blue-600/40"
              >
                <div class="flex justify-between items-start">
                  <BarChart3
                    class="h-10 w-10 text-blue-500 transition-all duration-500 group-hover:text-blue-500 group-hover:scale-110"
                  />
                  <TrendingUp
                    class="h-6 w-6 text-mint opacity-0 group-hover:opacity-100 transition-all"
                  />
                </div>
                <div class="h-20 w-full flex items-end gap-1 mb-4">
                  <div
                    v-for="(h, i) in [40, 70, 50, 90, 60, 100]"
                    :key="i"
                    class="flex-1 bg-blue-500/10 rounded-t-lg transition-all duration-700 group-hover:bg-blue-500/40"
                    :style="{ height: h + '%', transitionDelay: i * 50 + 'ms' }"
                  />
                </div>
                <div class="space-y-1">
                  <p
                    class="font-display text-[9px] font-black text-blue-500 transition-opacity duration-500 uppercase tracking-widest text-center"
                  >
                    Peak Insights
                  </p>
                  <div
                    class="px-2 py-0.5 bg-blue-500/5 rounded text-[8px] font-bold text-blue-600 uppercase mx-auto w-fit"
                  >
                    Peak Flow
                  </div>
                </div>
              </div>
            </div>

            <!-- 6. Alerts (Quiet Orange Glass) -->
            <div
              class="group absolute w-[220px] h-[280px] z-40 translate-x-52 translate-y-32 rotate-12 animate-float opacity-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:rotate-0 hover:opacity-100 hover:shadow-[0_30px_60px_rgba(249,115,22,0.25)] hover:[animation-play-state:paused] rounded-[40px] overflow-hidden"
              style="animation-delay: -2.5s; animation-duration: 7.5s"
            >
              <div
                class="w-full h-full bg-orange-500/15 backdrop-blur-3xl border border-orange-500/30 rounded-[40px] flex flex-col items-center justify-center p-6 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-orange-500/30 group-hover:border-orange-500/60"
              >
                <div class="relative mb-6">
                  <Zap
                    class="h-10 w-10 text-orange-500 transition-all duration-500 group-hover:text-orange-500 group-hover:drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]"
                  />
                  <div
                    class="absolute inset-0 border border-orange-500/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"
                  />
                </div>
                <div class="space-y-1">
                  <div
                    class="h-1 w-12 bg-orange-500/20 transition-colors duration-500 group-hover:bg-orange-500 mx-auto rounded-full"
                  />
                  <p
                    class="font-display text-[9px] font-black text-orange-600 transition-opacity duration-500 uppercase tracking-widest"
                  >
                    Smart Alerts
                  </p>
                </div>
              </div>
            </div>

            <!-- 7. Global (Quiet Gold Glass) -->
            <div
              class="group absolute w-[240px] h-[300px] z-35 translate-x-32 -translate-y-52 rotate-[15deg] animate-float opacity-50 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:rotate-0 hover:shadow-[0_30px_60px_rgba(234,179,8,0.25)] hover:[animation-play-state:paused] rounded-[40px] overflow-hidden"
              style="animation-delay: -1.5s; animation-duration: 8.5s"
            >
              <div
                class="w-full h-full bg-yellow-500/15 backdrop-blur-3xl border border-yellow-500/30 rounded-[40px] flex flex-col items-center justify-center p-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-yellow-500/30 group-hover:border-yellow-500/60"
              >
                <div class="relative mb-6">
                  <Globe
                    class="h-14 w-14 text-yellow-600 transition-all duration-500 group-hover:text-yellow-600 group-hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]"
                  />
                  <div
                    class="absolute -top-2 -right-4 h-1.5 w-1.5 rounded-full bg-yellow-500 group-hover:animate-ping"
                  />
                  <div
                    class="absolute bottom-2 -left-4 h-1.5 w-1.5 rounded-full bg-yellow-500 group-hover:animate-ping"
                    style="animation-delay: 0.5s"
                  />
                </div>
                <div
                  class="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20 group-hover:border-yellow-500/50 transition-all"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  <span class="font-mono text-[8px] font-black text-yellow-600 uppercase"
                    >Live Edge</span
                  >
                </div>
              </div>
            </div>

            <!-- 8. Core Scanner (Hero Card) -->
            <div
              class="group absolute w-[460px] h-auto z-50 animate-float transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform cursor-pointer hover:z-[100] hover:scale-110 hover:opacity-100 hover:[animation-play-state:paused]"
              style="animation-duration: 5s"
            >
              <div class="relative">
                <div
                  class="bg-white/10 backdrop-blur-3xl rounded-[64px] p-12 shadow-[0_48px_96px_rgba(26,10,46,0.3)] border border-white/20 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-white/20 group-hover:border-white/40"
                >
                  <img
                    src="/images/hero-scanner.png"
                    alt="Core Scanner"
                    width="460"
                    height="460"
                    fetchpriority="high"
                    loading="eager"
                    class="w-full h-auto drop-shadow-2xl transition-opacity duration-500 mix-blend-multiply"
                  />
                </div>
                <!-- Glass Status Pill -->
                <div
                  class="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur-3xl px-10 py-5 rounded-[32px] shadow-[0_20px_50px_rgba(26,10,46,0.2)] border border-white flex items-center gap-5 whitespace-nowrap z-[60] transition-all duration-500 group-hover:bg-white group-hover:scale-105 group-hover:shadow-[0_30px_70px_rgba(26,10,46,0.4)]"
                >
                  <div
                    class="flex -space-x-4 transition-transform duration-500 group-hover:translate-x-1"
                  >
                    <div
                      v-for="i in 3"
                      :key="i"
                      class="h-10 w-10 rounded-full border-2 border-white bg-mint-light flex items-center justify-center font-display text-xs font-bold text-plum shadow-sm"
                    >
                      {{ ['A', 'B', 'C'][i - 1] }}
                    </div>
                  </div>
                  <div>
                    <p class="font-mono text-sm font-bold text-plum leading-none">128 ACTIVE</p>
                    <p
                      class="font-body text-[10px] text-plum-muted uppercase tracking-[0.2em] mt-1"
                    >
                      Live Global
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Industry Marquee -->
      <div class="mt-32 relative overflow-hidden">
        <p class="font-body text-xs font-bold uppercase tracking-[0.3em] text-plum-soft mb-12">
          Optimized for every industry
        </p>

        <div
          class="space-y-6 py-6 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
        >
          <!-- Row 1 -->
          <div
            ref="row1Ref"
            class="flex gap-4 overflow-x-hidden select-none cursor-grab active:cursor-grabbing whitespace-nowrap"
          >
            <div v-for="i in 3" :key="i" class="flex gap-4 flex-shrink-0">
              <div
                v-for="cat in industryCategories[0]"
                :key="cat.name"
                class="flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl border border-plum/5 bg-white/40 backdrop-blur-sm font-display text-[10px] font-black tracking-[0.2em] shadow-sm hover:bg-white transition-all"
              >
                <component :is="cat.icon" class="h-3.5 w-3.5 text-mint" />
                {{ cat.name }}
              </div>
            </div>
          </div>

          <!-- Row 2 -->
          <div
            ref="row2Ref"
            class="flex gap-4 pb-1 overflow-x-hidden select-none cursor-grab active:cursor-grabbing whitespace-nowrap"
          >
            <div v-for="i in 3" :key="i" class="flex gap-4 flex-shrink-0">
              <div
                v-for="cat in industryCategories[1]"
                :key="cat.name"
                class="flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl border border-plum/5 bg-white/40 backdrop-blur-sm font-display text-[10px] font-black tracking-[0.2em] shadow-sm hover:bg-white transition-all"
              >
                <component :is="cat.icon" class="h-3.5 w-3.5 text-mint" />
                {{ cat.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
