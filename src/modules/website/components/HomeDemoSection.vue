<script setup lang="ts">
import { ArrowDownToLine, BarChart3, CheckCircle2, Clock } from 'lucide-vue-next'
import { ref } from 'vue'

import BaseCard from '@/components/base/BaseCard.vue'
import BasePillSelector from '@/components/base/BasePillSelector.vue'
import JoinViewPreview from '@/modules/website/components/JoinViewPreview.vue'

import type { Component } from 'vue'

defineProps<{
  activeTab: string
  featureTabs: { id: string; label: string }[]
  activeFeature: { icon: Component; heading: string; text: string } | undefined
}>()

defineEmits<{ (e: 'update:activeTab', val: string): void }>()

// ── Real-time tab state ──
const calledGuest = ref<number | null>(null)
const guests = ref([
  { name: 'Arjun K.', ticket: '001', wait: '0 min' },
  { name: 'Priya M.', ticket: '002', wait: '5 min' },
  { name: 'Rajan S.', ticket: '003', wait: '10 min' },
])
function callGuest(i: number) {
  calledGuest.value = i
  setTimeout(() => {
    calledGuest.value = null
  }, 1500)
}

// ── Analytics tab state ──
const chartBars = ref([40, 70, 50, 90, 60, 100])
const exportHovered = ref(false)
</script>

<template>
  <section id="demo" class="py-16 lg:py-24">
    <div class="container mx-auto px-6 text-center">
      <h2 class="font-display text-4xl font-bold md:text-5xl mb-12">
        Total control. <span class="text-plum">Pure simplicity.</span>
      </h2>
      <div class="mx-auto max-w-fit mb-16 overflow-x-auto scrollbar-hidden px-6">
        <BasePillSelector
          :model-value="activeTab"
          :options="featureTabs.map((t) => ({ key: t.id, label: t.label }))"
          class="p-1 scale-100 sm:scale-110 origin-center"
          @update:model-value="$emit('update:activeTab', $event)"
        />
      </div>

      <div class="mx-auto max-w-5xl">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-400 ease-out"
          enter-from-class="opacity-0 translate-y-6 scale-[0.98]"
          leave-to-class="opacity-0 -translate-y-4 scale-[0.98]"
        >
          <div :key="activeTab" class="grid gap-12 lg:grid-cols-2 items-center text-left">
            <!-- Left: Text -->
            <div>
              <div
                class="h-14 w-14 rounded-2xl bg-mint-light flex items-center justify-center mb-6"
              >
                <component :is="activeFeature?.icon" class="h-7 w-7 text-mint-dark" />
              </div>
              <h3 class="font-display text-3xl font-bold mb-4">{{ activeFeature?.heading }}</h3>
              <p class="font-body text-lg text-plum-soft leading-relaxed">
                {{ activeFeature?.text }}
              </p>
            </div>

            <!-- Right: Interactive demo card -->
            <BaseCard
              :class="[
                'flex flex-col bg-white shadow-2xl rounded-[40px] border-plum-faint overflow-hidden relative w-full',
                activeTab === 'branding'
                  ? 'p-0'
                  : 'aspect-auto lg:aspect-square justify-center p-6 sm:p-8 max-w-md mx-auto lg:max-w-none',
              ]"
            >
              <!-- ── REAL-TIME SYNC ── -->
              <div v-if="activeTab === 'real-time'" class="w-full space-y-3">
                <div class="flex items-center justify-between mb-4">
                  <p class="font-body text-xs font-bold text-plum-soft uppercase tracking-widest">
                    Live Queue
                  </p>
                  <span
                    class="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-plum-deep text-mint px-2.5 py-1 rounded-full shadow-sm"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-mint animate-pulse mr-0.5" />LIVE
                  </span>
                </div>
                <button
                  v-for="(g, i) in guests"
                  :key="g.ticket"
                  type="button"
                  :class="[
                    'relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-500 cursor-pointer select-none w-full text-left',
                    calledGuest === i
                      ? 'bg-mint-light border-mint scale-[1.02] shadow-lg shadow-mint/20'
                      : i === 0
                        ? 'bg-plum-deep text-white border-plum'
                        : 'bg-sand/50 border-plum-faint hover:bg-white hover:border-mint/30',
                  ]"
                  :tabindex="0"
                  :aria-label="`Call guest ${g.name}`"
                  @click="callGuest(i)"
                  @keydown.enter="callGuest(i)"
                  @keydown.space.prevent="callGuest(i)"
                >
                  <div
                    :class="[
                      'w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold flex-shrink-0',
                      i === 0 ? 'bg-mint text-on-mint' : 'bg-plum/5 text-plum-muted',
                    ]"
                  >
                    {{ g.ticket }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      :class="[
                        'font-body text-sm font-bold leading-none truncate',
                        i === 0 ? 'text-pure-white' : 'text-plum',
                      ]"
                    >
                      {{ g.name }}
                    </p>
                    <p
                      :class="[
                        'font-body text-[10px] mt-0.5',
                        i === 0 ? 'text-pure-white/60' : 'text-plum-soft',
                      ]"
                    >
                      <Clock class="inline h-2.5 w-2.5 mr-0.5" />{{ g.wait }}
                    </p>
                  </div>
                  <Transition
                    enter-active-class="transition duration-300"
                    enter-from-class="scale-0 opacity-0"
                    enter-to-class="scale-100 opacity-100"
                  >
                    <CheckCircle2
                      v-if="calledGuest === i"
                      class="h-5 w-5 text-mint flex-shrink-0"
                    />
                  </Transition>
                </button>
                <p class="text-center font-body text-[10px] text-plum-soft mt-3">
                  Tap a guest to call them ↑
                </p>
              </div>

              <!-- ── BRANDING: extracted reusable preview component ── -->
              <JoinViewPreview v-else-if="activeTab === 'branding'" />

              <!-- ── ANALYTICS ── -->
              <div v-else class="w-full space-y-5">
                <div class="flex items-center justify-between">
                  <p class="font-body text-xs font-bold text-plum-soft uppercase tracking-widest">
                    Peak Hours
                  </p>
                  <span
                    class="flex items-center gap-1 font-mono text-[10px] font-bold text-plum/40"
                  >
                    <BarChart3 class="h-3 w-3" />Today
                  </span>
                </div>
                <div
                  class="flex items-end gap-2 h-36 group"
                  @mouseenter="chartBars = [65, 45, 80, 100, 75, 90]"
                  @mouseleave="chartBars = [40, 70, 50, 90, 60, 100]"
                >
                  <div
                    v-for="(h, i) in chartBars"
                    :key="i"
                    class="flex-1 rounded-t-lg transition-all duration-700 relative group/bar"
                    :style="{
                      height: h + '%',
                      transitionDelay: i * 60 + 'ms',
                      backgroundColor: h === 100 ? '#00E5A0' : `rgba(26,10,46,${0.06 + h * 0.006})`,
                    }"
                  >
                    <span
                      class="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold text-plum/40 opacity-0 group-hover/bar:opacity-100 transition-opacity"
                      >{{ h }}%</span
                    >
                  </div>
                </div>
                <div class="flex justify-between font-body text-[9px] text-plum-soft px-1">
                  <span>9 AM</span><span>11 AM</span><span>1 PM</span><span>3 PM</span
                  ><span>5 PM</span><span>7 PM</span>
                </div>
                <button
                  type="button"
                  class="flex items-center justify-between w-full px-4 py-3 rounded-2xl border transition-all duration-200"
                  :class="
                    exportHovered
                      ? 'bg-mint-light border-mint/30 shadow-md'
                      : 'bg-sand border-plum-faint'
                  "
                  @mouseenter="exportHovered = true"
                  @mouseleave="exportHovered = false"
                >
                  <div class="flex items-center gap-2">
                    <ArrowDownToLine
                      :class="[
                        'h-4 w-4 transition-colors',
                        exportHovered ? 'text-plum' : 'text-plum-soft',
                      ]"
                    />
                    <span class="font-mono text-xs font-bold text-plum">EXPORT_DATA.CSV</span>
                  </div>
                  <span
                    :class="[
                      'font-body text-[10px] font-bold transition-colors',
                      exportHovered ? 'text-plum' : 'text-plum-soft',
                    ]"
                  >
                    {{ exportHovered ? 'Downloading…' : 'Export' }}
                  </span>
                </button>
              </div>
            </BaseCard>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>
