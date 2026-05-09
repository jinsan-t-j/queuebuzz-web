<script setup lang="ts">
import {
  Layout,
  ShieldCheck,
  Zap,
  Layers,
  FileDown,
  Globe,
  Users,
  BarChart3,
  Settings,
  Bell,
  Hourglass,
  Clock,
  MoreVertical,
  Mic,
} from 'lucide-vue-next'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'

defineProps<{
  isVisible: boolean
  scrollY: number
}>()
</script>

<template>
  <section id="features" class="relative py-16 lg:py-24 z-10">
    <!-- Section Local Splashes: Purple & Blue Shards (Interactive Parallax) -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 blur-[140px] animate-blob transition-transform duration-700 ease-out"
      :style="{
        clipPath: 'polygon(100% 0, 0 40%, 100% 100%)',
        transform: `translateY(${scrollY * 0.12}px)`,
      }"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/5 blur-[100px] animate-blob animation-delay-2000 transition-transform duration-1000 ease-out"
      :style="{
        clipPath: 'polygon(0 0, 100% 60%, 0 100%)',
        transform: `translateY(${scrollY * -0.08}px)`,
      }"
    />

    <div
      class="container mx-auto px-6 relative transition-all duration-1000 transform"
      :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
    >
      <div class="text-center mb-20">
        <BaseBadge class="mb-4">CORE CAPABILITIES</BaseBadge>
        <h2 class="font-display text-4xl font-bold leading-tight md:text-6xl">
          Everything you need, <br />
          <span class="text-mint-dark">nothing you don't.</span>
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <!-- Large Feature: Command Center -->
        <BaseCard
          class="md:col-span-2 row-span-2 p-10 bg-white/40 border-plum/5 hover:bg-white/60 transition-all group overflow-hidden relative"
        >
          <div class="relative z-10 max-w-sm">
            <div
              class="h-16 w-16 rounded-3xl bg-mint-light flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"
            >
              <Layout class="h-8 w-8 text-mint-dark" />
            </div>
            <h3 class="font-display text-3xl font-bold mb-4">Modern Command Center</h3>
            <p class="font-body text-plum-soft text-lg leading-relaxed mb-6">
              Manage every guest, check real-time wait analytics, and orchestrate your flow from a
              high-performance dashboard that runs on any tablet, phone, or laptop.
            </p>
            <div class="flex flex-wrap gap-x-6 gap-y-2 opacity-60">
              <div
                v-for="s in ['Cloud-Synced', 'Any Device Support', 'Real-time Analytics']"
                :key="s"
                class="flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-widest text-plum"
              >
                <div class="h-1 w-1 rounded-full bg-mint" />
                {{ s }}
              </div>
            </div>
          </div>

          <!-- High-Fidelity Dashboard Mockup -->
          <div
            aria-hidden="true"
            class="relative mt-12 lg:mt-0 lg:absolute lg:top-[10%] lg:right-[-15%] w-full lg:w-[85%] h-[500px] lg:h-[95%] bg-white/40 backdrop-blur-3xl rounded-[32px] lg:rounded-[48px] border border-white/60 shadow-[0_40px_80px_rgba(26,10,46,0.15)] transition-all duration-700 group-hover:rotate-0 rotate-0 lg:rotate-[-4deg] group-hover:scale-105 overflow-hidden flex scale-90 lg:scale-100 origin-top lg:origin-center"
          >
            <!-- Mini Sidebar -->
            <div
              class="hidden sm:flex w-16 border-r border-plum/5 flex-col items-center py-8 gap-8 bg-white/20"
            >
              <div class="w-8 h-8 rounded-xl bg-mint/20 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-mint" />
              </div>
              <Layout class="h-5 w-5 text-plum/20" />
              <Users class="h-5 w-5 text-mint-dark" />
              <BarChart3 class="h-5 w-5 text-plum/20" />
              <Settings class="h-5 w-5 text-plum/20" />
            </div>

            <!-- Content Area -->
            <div class="flex-1 p-6 sm:p-8 overflow-hidden flex flex-col">
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-mint" />
                  <h4 class="font-display text-2xl font-bold text-plum">Consultation</h4>
                </div>
                <div class="flex items-center gap-4">
                  <Bell class="h-4 w-4 text-plum/20" />
                  <div class="h-8 w-8 rounded-full bg-plum/5" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="bg-white/60 p-4 rounded-3xl border border-white">
                  <p class="font-body text-[10px] text-plum/40 uppercase tracking-widest mb-1">
                    Waiting Now
                  </p>
                  <div class="flex items-end gap-2">
                    <span class="font-display text-3xl font-black text-plum">04</span>
                    <Hourglass class="h-4 w-4 text-plum/20 mb-1" />
                  </div>
                </div>
                <div class="bg-white/60 p-4 rounded-3xl border border-white">
                  <p class="font-body text-[10px] text-plum/40 uppercase tracking-widest mb-1">
                    Avg. Wait
                  </p>
                  <div class="flex items-end gap-2">
                    <span class="font-display text-3xl font-black text-plum"
                      >20<span class="text-lg">m</span></span
                    >
                    <Clock class="h-4 w-4 text-plum/20 mb-1" />
                  </div>
                </div>
              </div>

              <!-- Code Card -->
              <div
                class="bg-white p-6 rounded-[32px] border border-plum/5 shadow-sm mb-8 text-center relative overflow-hidden"
              >
                <div
                  class="absolute top-0 right-0 w-24 h-24 bg-mint/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
                />
                <p class="font-body text-[10px] text-plum/40 uppercase tracking-widest mb-2">
                  Queue Code
                </p>
                <h5 class="font-display text-4xl font-black text-mint-dark tracking-[0.2em]">
                  H64XUF
                </h5>
              </div>

              <!-- Guest List -->
              <div class="space-y-3 flex-1">
                <div
                  v-for="(g, i) in [
                    { name: 'James', status: 'At the counter', active: true },
                    { name: 'Guest', status: '5 min wait', active: false },
                    { name: 'Susan John', status: '10 min wait', active: false },
                  ]"
                  :key="i"
                  :class="[
                    'p-4 rounded-2xl border transition-all flex items-center justify-between',
                    g.active
                      ? 'bg-mint-light border-mint/20 shadow-sm'
                      : 'bg-white/40 border-plum/5',
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs',
                        g.active ? 'bg-mint text-on-mint' : 'bg-plum/5 text-plum/40',
                      ]"
                    >
                      {{ i + 1 }}
                    </div>
                    <div>
                      <p class="font-body text-sm font-bold text-plum leading-none">{{ g.name }}</p>
                      <p
                        :class="[
                          'font-body text-[10px] mt-1',
                          g.active ? 'text-mint-dark font-bold' : 'text-plum-muted',
                        ]"
                      >
                        {{ g.status }}
                      </p>
                    </div>
                  </div>
                  <MoreVertical class="h-4 w-4 text-plum/20" />
                </div>
              </div>

              <!-- Call Next Button -->
              <div class="mt-8">
                <div
                  class="h-14 w-full rounded-2xl bg-plum text-white flex items-center justify-center gap-3 font-display text-sm font-bold shadow-lg shadow-plum/20 group-hover:scale-[1.02] transition-transform"
                >
                  <Mic class="h-4 w-4 text-mint" />
                  Call Next Guest
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Medium Feature: Privacy -->
        <BaseCard
          class="p-8 bg-white/40 border-plum/5 hover:bg-white/60 transition-all group relative"
        >
          <div
            class="absolute top-6 right-6 px-2 py-0.5 rounded-full bg-plum/5 font-mono text-[8px] font-bold text-plum/40 uppercase tracking-tighter"
          >
            AES-256
          </div>
          <div class="h-12 w-12 rounded-2xl bg-plum-faint flex items-center justify-center mb-6">
            <ShieldCheck class="h-6 w-6 text-plum" />
          </div>
          <h3 class="font-display text-xl font-bold mb-2">Privacy-First</h3>
          <p class="font-body text-sm text-plum-soft leading-relaxed">
            No tracking, no cookies, and no mandatory phone numbers. We protect your customers as
            much as you do.
          </p>
        </BaseCard>

        <!-- Medium Feature: PWA -->
        <BaseCard
          class="p-8 bg-white/40 border-plum/5 hover:bg-white/60 transition-all group relative"
        >
          <div
            class="absolute top-6 right-6 px-2 py-0.5 rounded-full bg-mint-light font-mono text-[8px] font-bold text-mint-dark uppercase tracking-tighter"
          >
            APP-LESS
          </div>
          <div class="h-12 w-12 rounded-2xl bg-mint-light flex items-center justify-center mb-6">
            <Zap class="h-6 w-6 text-mint-dark" />
          </div>
          <h3 class="font-display text-xl font-bold mb-2">Frictionless Entry</h3>
          <p class="font-body text-sm text-plum-soft leading-relaxed">
            A simple QR scan opens the portal. No app store hurdles or account creation standing in
            the way.
          </p>
        </BaseCard>

        <!-- Small Feature: Service Routing -->
        <BaseCard class="p-8 bg-white/40 border-plum/5 hover:bg-white/60 transition-all group">
          <div class="h-12 w-12 rounded-2xl bg-plum-faint flex items-center justify-center mb-6">
            <Layers class="h-6 w-6 text-plum" />
          </div>
          <h3 class="font-display text-xl font-bold mb-2">Smart Routing</h3>
          <p class="font-body text-sm text-plum-soft leading-relaxed">
            Manage multiple service categories under one roof. Departmentalize your flow with ease.
          </p>
        </BaseCard>

        <!-- Small Feature: CSV -->
        <BaseCard
          class="p-8 bg-white/40 border-plum/5 hover:bg-white/60 transition-all group relative"
        >
          <div
            class="absolute top-6 right-6 px-2 py-0.5 rounded-full bg-mint-light font-mono text-[8px] font-bold text-mint-dark uppercase tracking-tighter"
          >
            CSV EXPORT
          </div>
          <div class="h-12 w-12 rounded-2xl bg-mint-light flex items-center justify-center mb-6">
            <FileDown class="h-6 w-6 text-mint-dark" />
          </div>
          <h3 class="font-display text-xl font-bold mb-2">Full Portability</h3>
          <p class="font-body text-sm text-plum-soft leading-relaxed">
            Your data is yours. Export every session to CSV for internal auditing and deep-dive
            analytics.
          </p>
        </BaseCard>

        <!-- Small Feature: Sync -->
        <BaseCard
          class="p-8 bg-white/40 border-plum/5 hover:bg-white/60 transition-all group relative overflow-hidden"
        >
          <div class="absolute top-6 right-6 flex items-center gap-1.5">
            <div class="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
            <span class="font-mono text-[8px] font-bold text-plum/40 uppercase tracking-tighter"
              >WS_SYNC_ACTIVE</span
            >
          </div>
          <div class="h-12 w-12 rounded-2xl bg-plum-faint flex items-center justify-center mb-6">
            <Globe class="h-6 w-6 text-plum" />
          </div>
          <h3 class="font-display text-xl font-bold mb-2">Robust Sync</h3>
          <p class="font-body text-sm text-plum-soft leading-relaxed">
            State is preserved across signal drops. Your customers will never lose their spot in
            line.
          </p>
        </BaseCard>
      </div>
    </div>
  </section>
</template>
