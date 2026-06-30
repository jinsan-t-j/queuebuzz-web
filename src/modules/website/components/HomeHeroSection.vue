<script setup lang="ts">
/**
 * @component HomeHeroSection
 * @description Redesigned centered modern landing hero section for QueueBuzz.
 */
import { ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'

import type { Component } from 'vue'

const props = defineProps<{
  heroBadge: string
  scrollY: number
  isVisible: boolean
  industryCategories: { name: string; icon: Component }[][]
}>()

// Map categories and custom telemetry nodes into 3 detailed bands to match the reference
const marqueeRows = computed(() => {
  const catList1 = props.industryCategories?.[0] || []
  const catList2 = props.industryCategories?.[1] || []

  // Row 1: Coral Orange Band
  const row1 = [
    { type: 'text', label: 'WhatsApp Alerts' },
    { type: 'pill', label: 'ZERO WAIT' },
    { type: 'category', name: catList2[9]?.name || 'KIRANA STORES', icon: catList2[9]?.icon },
    { type: 'avatar', initials: 'AK' },
    { type: 'text', label: 'Scan to Join' },
    { type: 'pill', label: '100% SECURE' },
    { type: 'category', name: catList2[2]?.name || 'CLINICS', icon: catList2[2]?.icon },
    { type: 'category', name: catList1[9]?.name || 'TEA STALLS', icon: catList1[9]?.icon },
    { type: 'pill', label: 'MOBILE PIN' },
    { type: 'category', name: catList1[10]?.name || 'DRIVE-THRUS', icon: catList1[10]?.icon },
  ]

  // Row 2: Indigo/Royal Blue Band
  const row2 = [
    { type: 'text', label: 'Digital Ticket' },
    { type: 'pill', label: 'CALM LOBBY' },
    { type: 'category', name: catList2[1]?.name || 'SALONS', icon: catList2[1]?.icon },
    { type: 'avatar', initials: 'PS' },
    { type: 'text', label: 'Real-time Status' },
    { type: 'pill', label: 'SYNC ENGINE' },
    { type: 'category', name: catList2[5]?.name || 'FITTING ROOMS', icon: catList2[5]?.icon },
    { type: 'category', name: catList1[5]?.name || 'FOOD TRUCKS', icon: catList1[5]?.icon },
    { type: 'pill', label: 'FAST PASS' },
    { type: 'category', name: catList1[12]?.name || 'BARBERSHOPS', icon: catList1[12]?.icon },
  ]

  // Row 3: Mint/Teal Band
  const row3 = [
    { type: 'text', label: 'Peak Insights' },
    { type: 'pill', label: 'PUSH NOTIFY' },
    { type: 'category', name: catList2[14]?.name || 'MEGA MALLS', icon: catList2[14]?.icon },
    { type: 'avatar', initials: 'RJ' },
    { type: 'text', label: 'Paperless Queue' },
    { type: 'pill', label: 'PAPERLESS' },
    { type: 'category', name: catList1[13]?.name || 'TICKET COUNTERS', icon: catList1[13]?.icon },
    { type: 'text', label: 'Auto-Call Next' },
    { type: 'pill', label: 'LIVE FLOW' },
    { type: 'category', name: catList1[14]?.name || 'SOUQS', icon: catList1[14]?.icon },
  ]

  return [row1, row2, row3]
})
</script>

<template>
  <section id="hero" class="relative pt-20 pb-20 lg:pt-28 lg:pb-32 z-10 overflow-hidden bg-sand">
    <!-- Ambient Radial Background Glows -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-mint/10 rounded-full blur-[140px]"
      style="will-change: transform"
      :style="{
        transform: `translate(-50%, ${scrollY * 0.1}px)`,
      }"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[100px]"
      style="will-change: transform"
      :style="{
        transform: `translateY(${scrollY * -0.05}px)`,
      }"
    />

    <div
      class="container mx-auto px-6 relative text-center flex flex-col items-center transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <!-- Centered Modern Heading -->
      <h1
        class="mt-8 font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-plum tracking-tight leading-[0.95] max-w-5xl mx-auto uppercase"
      >
        ZERO LINES. <br />
        <span
          class="bg-gradient-to-r from-mint-dark to-emerald-700 dark:to-emerald-400 bg-clip-text text-transparent"
          >BETTER BUSINESS.</span
        >
      </h1>

      <!-- Description Text -->
      <p
        class="mt-8 font-body text-base sm:text-lg md:text-xl text-plum-soft max-w-2xl mx-auto leading-relaxed"
      >
        Ditch the physical line. Let your customers wait on their own terms. Scan, join, and track
        your turn in real time, keeping your lobby calm and your business moving with absolute
        precision.
      </p>

      <!-- Key Benefits List -->
      <div
        class="mt-10 flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-3.5 max-w-4xl mx-auto"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-5.5 h-5.5 rounded-full bg-mint-light flex items-center justify-center shrink-0"
          >
            <svg
              class="w-3.5 h-3.5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="font-body text-sm font-semibold text-plum-soft"
            >No app install required for customers</span
          >
        </div>
        <div class="flex items-center gap-2.5">
          <div
            class="w-5.5 h-5.5 rounded-full bg-mint-light flex items-center justify-center shrink-0"
          >
            <svg
              class="w-3.5 h-3.5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="font-body text-sm font-semibold text-plum-soft"
            >Real-time dashboard & notifications</span
          >
        </div>
        <div class="flex items-center gap-2.5">
          <div
            class="w-5.5 h-5.5 rounded-full bg-mint-light flex items-center justify-center shrink-0"
          >
            <svg
              class="w-3.5 h-3.5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="font-body text-sm font-semibold text-plum-soft"
            >Calm lobby, happier staff & peak insights</span
          >
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
      >
        <router-link to="/guest-host/queue/create" class="w-full sm:w-auto">
          <BaseButton
            size="lg"
            class="group h-14 px-8 text-base !rounded-2xl shadow-lg shadow-mint/10 hover:shadow-xl hover:shadow-mint/20 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto bg-mint text-plum font-bold"
          >
            Start Free Queue
            <ArrowRight class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </BaseButton>
        </router-link>
        <router-link to="/join" class="w-full sm:w-auto">
          <BaseButton
            variant="outline"
            size="lg"
            class="h-14 px-8 text-base bg-white/60 backdrop-blur-sm !rounded-2xl hover:bg-white hover:border-plum/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 w-full sm:w-auto text-plum font-bold border border-plum-faint"
          >
            Join a Queue
          </BaseButton>
        </router-link>
      </div>

      <!-- Industry Marquee -->
      <div class="mt-28 w-full text-center">
        <!-- Tilted Marquee Strip Container -->
        <div
          class="relative overflow-hidden w-full py-8 rotate-[-1.5deg] scale-[1.03] origin-center flex flex-col gap-5 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
        >
          <!-- Row 1: Orange Band -->
          <div
            class="flex overflow-x-hidden select-none bg-warning-dark py-4 shadow-[0_4px_12px_rgba(194,65,12,0.15)]"
          >
            <div
              class="flex gap-16 shrink-0 animate-marquee items-center whitespace-nowrap"
              style="will-change: transform"
            >
              <div v-for="loop in 2" :key="loop" class="flex gap-16 shrink-0 items-center">
                <div
                  v-for="(item, idx) in marqueeRows[0]"
                  :key="idx"
                  class="flex items-center gap-3"
                >
                  <span
                    v-if="item.type === 'pill'"
                    class="bg-plum text-white font-mono text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md"
                  >
                    {{ item.label }}
                  </span>

                  <div
                    v-else-if="item.type === 'avatar'"
                    class="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-inner"
                  >
                    {{ item.initials }}
                  </div>

                  <div v-else-if="item.type === 'category'" class="flex items-center gap-3">
                    <div
                      class="w-7.5 h-7.5 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"
                    >
                      <component :is="item.icon" class="w-4 h-4 text-warning-dark" />
                    </div>
                    <span class="font-body text-sm font-bold text-white tracking-wide">{{
                      item.name
                    }}</span>
                  </div>

                  <span v-else class="font-body text-sm font-bold text-white tracking-wide">{{
                    item.label
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Row 2: Vibrant Blue Band -->
          <div
            class="flex overflow-x-hidden select-none bg-blue-700 py-4 shadow-[0_4px_12px_rgba(29,78,216,0.15)]"
          >
            <div
              class="flex gap-16 shrink-0 animate-marquee-reverse items-center whitespace-nowrap"
              style="will-change: transform"
            >
              <div v-for="loop in 2" :key="loop" class="flex gap-16 shrink-0 items-center">
                <div
                  v-for="(item, idx) in marqueeRows[1]"
                  :key="idx"
                  class="flex items-center gap-3"
                >
                  <span
                    v-if="item.type === 'pill'"
                    class="bg-plum text-white font-mono text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md"
                  >
                    {{ item.label }}
                  </span>

                  <div
                    v-else-if="item.type === 'avatar'"
                    class="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-inner"
                  >
                    {{ item.initials }}
                  </div>

                  <div v-else-if="item.type === 'category'" class="flex items-center gap-3">
                    <div
                      class="w-7.5 h-7.5 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"
                    >
                      <component :is="item.icon" class="w-4 h-4 text-blue-700" />
                    </div>
                    <span class="font-body text-sm font-bold text-white tracking-wide">{{
                      item.name
                    }}</span>
                  </div>

                  <span v-else class="font-body text-sm font-bold text-white tracking-wide">{{
                    item.label
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Row 3: Mint Band -->
          <div
            class="flex overflow-x-hidden select-none bg-[#00E5A0] py-4 shadow-[0_4px_12px_rgba(0,229,160,0.15)]"
          >
            <div
              class="flex gap-16 shrink-0 animate-marquee items-center whitespace-nowrap"
              style="will-change: transform"
            >
              <div v-for="loop in 2" :key="loop" class="flex gap-16 shrink-0 items-center">
                <div
                  v-for="(item, idx) in marqueeRows[2]"
                  :key="idx"
                  class="flex items-center gap-3"
                >
                  <span
                    v-if="item.type === 'pill'"
                    class="bg-plum text-white font-mono text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md"
                  >
                    {{ item.label }}
                  </span>

                  <div
                    v-else-if="item.type === 'avatar'"
                    class="w-7 h-7 rounded-full bg-plum/10 border border-plum/20 flex items-center justify-center text-[10px] font-extrabold text-plum shrink-0 shadow-inner"
                  >
                    {{ item.initials }}
                  </div>

                  <div v-else-if="item.type === 'category'" class="flex items-center gap-3">
                    <div
                      class="w-7.5 h-7.5 rounded-full bg-[#1A0A2E] flex items-center justify-center shadow-sm shrink-0"
                    >
                      <component :is="item.icon" class="w-4 h-4 text-mint" />
                    </div>
                    <span class="font-body text-sm font-bold text-[#1A0A2E] tracking-wide">{{
                      item.name
                    }}</span>
                  </div>

                  <span v-else class="font-body text-sm font-bold text-[#1A0A2E] tracking-wide">{{
                    item.label
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
