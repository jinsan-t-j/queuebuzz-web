<script setup lang="ts">
/**
 * @component HomeRoiCalculator
 * @description Interactive time-saved & productivity calculator based on daily visitors and service time per guest.
 */
import { ArrowRight, Clock, HeartHandshake, TrendingUp, Zap } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'

const dailyGuests = ref(50)
const avgMinsPerGuest = ref(8)

// Calculating weekly hours saved:
// QueueBuzz saves roughly 35% of manual waiting chaos & front-desk crowding overhead
const weeklyHoursSaved = computed(() => {
  const minsSavedPerGuest = avgMinsPerGuest.value * 0.35
  const totalMinsWeekly = minsSavedPerGuest * dailyGuests.value * 6
  return (totalMinsWeekly / 60).toFixed(1)
})

const extraWorkDaysSaved = computed(() => {
  const hours = Number(weeklyHoursSaved.value)
  return ((hours * 4) / 8).toFixed(1)
})

const walkoutReductionPercent = computed(() => {
  return Math.min(60, 25 + Math.floor(dailyGuests.value / 8))
})
</script>

<template>
  <section id="roi-calculator" class="py-16 lg:py-24 bg-sand/60 relative overflow-hidden">
    <div class="container mx-auto px-6 relative z-10">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <h2
          class="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-plum tracking-tight"
        >
          CALCULATE HOW MUCH TIME <br />
          <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            >YOU'LL SAVE EVERY WEEK.</span
          >
        </h2>
        <p class="mt-4 font-body text-base sm:text-lg text-plum-soft leading-relaxed">
          Adjust the sliders below based on your business volume to see how QueueBuzz calms your
          lobby, eliminates walkouts, and saves your staff hours every single day.
        </p>
      </div>

      <div class="max-w-4xl mx-auto">
        <BaseCard
          class="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border-plum-faint shadow-xl shadow-plum/5"
        >
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <!-- Left Controls -->
            <div class="lg:col-span-6 space-y-8">
              <!-- Slider 1: Daily Guests -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label
                    class="font-body text-xs font-bold text-plum-muted uppercase tracking-wider"
                  >
                    Daily Visitors / Guests
                  </label>
                  <span
                    class="font-mono font-bold text-lg text-plum bg-sand px-3 py-0.5 rounded-xl border border-plum-faint"
                  >
                    {{ dailyGuests }} guests / day
                  </span>
                </div>

                <BaseSlider v-model="dailyGuests" :min="10" :max="300" :step="5" class="mt-3" />
                <div class="flex justify-between font-body text-[11px] text-plum-muted mt-1">
                  <span>10 guests</span>
                  <span>150 guests</span>
                  <span>300+ guests</span>
                </div>
              </div>

              <!-- Slider 2: Average Service Time per Guest (Progress bar styling) -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label
                    class="font-body text-xs font-bold text-plum-muted uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Clock class="w-3.5 h-3.5 text-emerald-600" />
                    Time Taken Per Guest
                  </label>
                  <span
                    class="font-mono font-bold text-lg text-emerald-700 bg-mint-light px-3 py-0.5 rounded-xl"
                  >
                    {{ avgMinsPerGuest }} mins / guest
                  </span>
                </div>

                <BaseSlider v-model="avgMinsPerGuest" :min="1" :max="30" :step="1" class="mt-3" />

                <div class="flex justify-between font-body text-[11px] text-plum-muted mt-1.5">
                  <span>1 min (Quick checkout)</span>
                  <span>15 mins (Standard)</span>
                  <span>30 mins (Consultation)</span>
                </div>
              </div>
            </div>

            <!-- Right Results Card (Human-understandable statements) -->
            <div class="lg:col-span-6">
              <div
                class="bg-plum text-white rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                <!-- Ambient Glow accent -->
                <div
                  class="absolute -top-12 -right-12 w-40 h-40 bg-mint/20 rounded-full blur-3xl pointer-events-none"
                />

                <div class="flex items-center gap-2">
                  <Zap class="w-4 h-4 text-mint" />
                  <p class="font-body text-xs font-bold text-mint uppercase tracking-widest">
                    Your Weekly Savings
                  </p>
                </div>

                <!-- Big Result -->
                <div class="border-b border-white/10 pb-5">
                  <div class="flex items-baseline gap-2">
                    <span class="font-mono text-4xl sm:text-5xl font-black text-mint">
                      {{ weeklyHoursSaved }}
                    </span>
                    <span class="font-body text-lg font-bold text-sand/90"
                      >Hours saved every week</span
                    >
                  </div>
                  <p class="font-body text-xs text-sand/70 mt-2 leading-relaxed">
                    That's equivalent to gaining
                    <strong class="text-mint">+{{ extraWorkDaysSaved }} full working days</strong>
                    back every month for your business.
                  </p>
                </div>

                <!-- Human Understandable Highlights -->
                <div class="space-y-3">
                  <div
                    class="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10"
                  >
                    <div
                      class="w-8 h-8 rounded-xl bg-mint-light text-emerald-800 flex items-center justify-center shrink-0"
                    >
                      <HeartHandshake class="w-4 h-4" />
                    </div>
                    <div>
                      <p class="font-body text-xs font-bold text-white">Calm & Happy Customers</p>
                      <p class="font-body text-[11px] text-sand/70">
                        No standing in crowded, noisy lines
                      </p>
                    </div>
                  </div>

                  <div
                    class="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10"
                  >
                    <div
                      class="w-8 h-8 rounded-xl bg-mint-light text-emerald-800 flex items-center justify-center shrink-0"
                    >
                      <TrendingUp class="w-4 h-4" />
                    </div>
                    <div>
                      <p class="font-body text-xs font-bold text-white">
                        {{ walkoutReductionPercent }}% Fewer Lost Sales
                      </p>
                      <p class="font-body text-[11px] text-sand/70">
                        Stop losing visitors who walk away from physical queues
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Action button -->
                <router-link to="/guest-host/queue/create" class="block pt-2">
                  <BaseButton
                    size="lg"
                    class="w-full h-12 text-sm font-bold !rounded-2xl bg-mint text-plum hover:bg-mint-dark shadow-lg shadow-mint/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Start Free Queue Now
                    <ArrowRight class="w-4 h-4" />
                  </BaseButton>
                </router-link>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </section>
</template>
