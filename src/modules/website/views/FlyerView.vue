<script setup lang="ts">
/**
 * @component FlyerView
 * @description Official 2-page marketing & launch flyer for QueueBuzz.
 * Built with the QueueBuzz design tokens, verified features from HomeFeaturesSection.vue,
 * and high-resolution QR codes for instant website launch.
 * Formatted for clean 2-page A4 / Letter double-sided printing and screen viewing.
 */
import { useSeoMeta } from '@unhead/vue'
import { ArrowRight, Bell, CheckCircle2, Printer, QrCode as QrCodeIcon } from 'lucide-vue-next'
import QRCode from 'qrcode'
import { onMounted, ref } from 'vue'

import Logo from '@/assets/icons/logo.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import LineIcon from '@/modules/website/components/icons/LineIcon.vue'

useSeoMeta({
  title: 'QueueBuzz Official Flyer — Zero Lines. Better Business.',
  description: 'Official printable launch flyer for QueueBuzz virtual queue management system.',
})

const qrDataUrl = ref('')
const launchUrl = 'https://queuebuzz.com'

onMounted(async () => {
  try {
    qrDataUrl.value = await QRCode.toDataURL(launchUrl, {
      width: 480,
      margin: 1,
      color: {
        dark: '#1A0A2E',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
  } catch {
    // Fallback if canvas/qrcode generation fails
  }
})

function printFlyer() {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

const steps = [
  {
    num: '01',
    icon: 'clipboard' as const,
    title: 'Create Your Queue',
    desc: 'Set your business name and service categories in under 60 seconds. Zero hardware or software installation required.',
  },
  {
    num: '02',
    icon: 'qr' as const,
    title: 'Display & Join',
    desc: 'Customers scan your unique QR code at the entrance or door. They join immediately on their phone browser without an app.',
  },
  {
    num: '03',
    icon: 'bell' as const,
    title: 'Call & Serve',
    desc: 'Call the next person with one click from any phone or PC. Guests receive instant vibration and sound buzz notifications.',
  },
]

const smallFeatures = [
  {
    icon: 'export' as const,
    title: 'Full Portability',
    text: 'Your data is yours. Export every session to CSV for internal auditing and deep-dive operational analytics.',
  },
  {
    icon: 'pin' as const,
    title: 'Geo Fence Protection',
    text: 'Keep queues honest. Restrict joining exclusively to customers who are physically present within your venue radius.',
  },
  {
    icon: 'screen' as const,
    title: 'TV Display Mode',
    text: 'Put "Now Serving" on a lobby screen, tablet, or monitor — fullscreen, with adjustable text sizes and audible chimes.',
  },
  {
    icon: 'bell' as const,
    title: 'Buzz Notifications',
    text: "A vibrating and sound alert the moment it's a guest's turn — installed straight to the home screen with zero SMS cost.",
  },
  {
    icon: 'clock' as const,
    title: 'Instant Push Delay',
    text: "Running behind? Add a 5, 10, or 15-minute buffer in one tap and every guest's wait estimate updates instantly.",
  },
  {
    icon: 'palette' as const,
    title: 'Custom Branding',
    text: 'Swap the default banner and logo for your own on paid plans, so the queue looks like your business, not ours.',
  },
]

const transformationItems = [
  { chaos: 'Manual Shouting', calm: 'Mobile Buzz Pings', icon: 'bell' as const },
  { chaos: 'Paper Waste & Tokens', calm: 'Live Digital Passes', icon: 'qr' as const },
  { chaos: 'Crowded Waiting Rooms', calm: 'Total Guest Freedom', icon: 'pin' as const },
  { chaos: 'Blind Waiting Anxiety', calm: 'Live Wait Countdown', icon: 'clock' as const },
]

const industries = [
  'Healthcare & Clinics',
  'Cafes & Food Trucks',
  'Retail & Fitting Rooms',
  'Salons & Spas',
  'Government Counters',
  'Service Centers',
  'Events & Ticket Desks',
  'Repair Shops',
]
</script>

<template>
  <div
    class="min-h-screen bg-sand text-plum selection:bg-mint/30 py-8 px-4 sm:px-6 print:min-h-0 print:py-0 print:px-0 print:bg-white print:text-plum"
  >
    <!-- Top Action Bar (Hidden on Print) -->
    <div class="max-w-[860px] mx-auto mb-6 flex items-center justify-between print:hidden">
      <router-link
        to="/"
        class="inline-flex items-center gap-2 font-body text-sm font-semibold text-plum-soft hover:text-plum transition-colors"
      >
        <ArrowRight class="w-4 h-4 rotate-180" />
        Back to Website
      </router-link>

      <div class="flex items-center gap-3">
        <BaseButton
          class="!rounded-xl bg-plum text-sand hover:bg-plum-soft px-5 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md"
          @click="printFlyer"
        >
          <Printer class="w-4 h-4" />
          Print / Save PDF (2-Page Deck)
        </BaseButton>
      </div>
    </div>

    <!-- Main Container -->
    <div
      class="max-w-[860px] mx-auto flex flex-col gap-8 print:gap-0 print:max-w-none print:w-full"
    >
      <!-- ========================================== -->
      <!-- PAGE 1: HERO & LAUNCH QR & WORKFLOW       -->
      <!-- ========================================== -->
      <section
        id="flyer-page-1"
        class="flyer-sheet bg-white rounded-3xl border border-plum-faint shadow-[0_12px_48px_rgba(26,10,46,0.08)] overflow-hidden flex flex-col justify-between print:border-none print:shadow-none print:rounded-none print:w-full print:m-0"
      >
        <!-- Top Gradient Accent -->
        <div class="h-3 w-full bg-gradient-to-r from-mint via-mint-dark to-plum" />

        <div class="p-8 sm:p-12 lg:p-14 print:p-8 flex flex-col justify-between flex-1">
          <!-- Header -->
          <div class="flex items-center justify-between pb-6 border-b border-plum-faint">
            <div class="flex items-center gap-1">
              <Logo class="h-11 w-11 shrink-0" />
              <div class="flex flex-col leading-none">
                <span class="font-editorial text-3xl font-bold tracking-tight text-plum"
                  >ueue<span class="text-plum">Buzz</span></span
                >
              </div>
            </div>
          </div>

          <!-- Hero Headline & Pitch -->
          <div class="py-8">
            <h1
              class="font-editorial text-4xl sm:text-5xl lg:text-[46px] font-bold text-plum leading-[1.12] tracking-tight"
            >
              Replace physical lines with <br class="hidden sm:inline" />
              <span
                class="text-mint-dark underline decoration-mint/40 decoration-4 underline-offset-4"
                >instant QR virtual queues.</span
              >
            </h1>
            <p class="mt-5 font-body text-base sm:text-lg text-plum-soft max-w-2xl leading-relaxed">
              QueueBuzz turns crowded waiting rooms into calm virtual queues. Display your QR code,
              let customers take a digital token on their phone, and track their turn in real time.
              No apps, no downloads, no hardware. Just scan, join, and buzz when it’s their turn.
            </p>
          </div>

          <!-- Launch QR Code & Action Center -->
          <div
            class="bg-sand/90 rounded-3xl border border-plum-faint p-6 sm:p-8 my-2 flex flex-col sm:flex-row items-center gap-6 sm:gap-8"
          >
            <!-- Scannable QR Frame -->
            <div
              class="bg-white p-4 rounded-2xl border border-plum-faint shadow-md shrink-0 flex flex-col items-center"
            >
              <img
                v-if="qrDataUrl"
                :src="qrDataUrl"
                alt="Scan to launch QueueBuzz"
                class="w-36 h-36 sm:w-40 sm:h-40 rounded-xl"
              />
              <div
                v-else
                class="w-36 h-36 sm:w-40 sm:h-40 rounded-xl bg-plum-faint flex items-center justify-center animate-pulse"
              >
                <QrCodeIcon class="w-12 h-12 text-plum-muted" />
              </div>
            </div>

            <!-- Context & Value Props -->
            <div class="flex-1 text-center sm:text-left">
              <span
                class="inline-block font-body text-xs font-bold uppercase tracking-wider text-plum-muted mb-1"
              >
                Ready in under 60 seconds
              </span>
              <h2 class="font-editorial text-2xl sm:text-3xl font-bold text-plum leading-tight">
                Scan & Start Your First Queue Free
              </h2>
              <p class="font-body text-sm sm:text-base text-plum-soft mt-2 leading-relaxed">
                Zero hardware to buy. No mobile app to download. Runs on any phone, tablet, or
                laptop browser immediately.
              </p>

              <div
                class="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-y-2.5 gap-x-5 pt-4 border-t border-plum-faint text-xs sm:text-sm font-body font-semibold text-plum-soft"
              >
                <div class="flex items-center gap-1.5">
                  <CheckCircle2 class="w-4 h-4 text-mint-dark" />
                  <span>Free Guest Host Tier</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <CheckCircle2 class="w-4 h-4 text-mint-dark" />
                  <span>No Credit Card</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3-Step Workflow -->
          <div class="pt-8 pb-4">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-editorial text-xl font-bold text-plum">How It Works in 3 Steps</h3>
              <span class="font-body text-xs font-semibold text-plum-muted"
                >Effortless for staff & customers</span
              >
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div
                v-for="step in steps"
                :key="step.num"
                class="bg-sand/60 rounded-2xl p-5 border border-plum-faint flex flex-col justify-between"
              >
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="font-editorial text-xs font-bold text-plum-muted">{{
                      step.num
                    }}</span>
                    <LineIcon :name="step.icon" class="h-5 w-5 text-plum" />
                  </div>
                  <h4 class="font-editorial text-base font-bold text-plum mb-1.5">
                    {{ step.title }}
                  </h4>
                  <p class="font-body text-xs text-plum-soft leading-relaxed">
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Target Industries -->
          <div
            class="pt-6 border-t border-plum-faint flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
          >
            <div>
              <span class="font-body text-xs font-bold text-plum uppercase tracking-wider"
                >Built for physical businesses:</span
              >
              <div class="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <span
                  v-for="ind in industries"
                  :key="ind"
                  class="px-3 py-1 rounded-lg bg-sand text-xs font-body font-semibold text-plum-soft border border-plum-faint"
                >
                  {{ ind }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- PAGE 2: CORE CAPABILITIES & TRANSFORMATION -->
      <!-- ========================================== -->
      <section
        id="flyer-page-2"
        class="flyer-sheet bg-white rounded-3xl border border-plum-faint shadow-[0_12px_48px_rgba(26,10,46,0.08)] overflow-hidden flex flex-col justify-between print:border-none print:shadow-none print:rounded-none print:w-full print:m-0"
      >
        <!-- Top Gradient Accent -->
        <div class="h-3 w-full bg-gradient-to-r from-plum via-mint-dark to-mint" />

        <div class="p-8 sm:p-12 lg:p-14 print:p-8 flex flex-col justify-between flex-1">
          <!-- Page 2 Header -->
          <div class="flex items-center justify-between pb-6 border-b border-plum-faint">
            <div class="flex items-center gap-1">
              <Logo class="h-9 w-9 shrink-0" />
              <span class="font-editorial text-2xl font-bold tracking-tight text-plum"
                >ueue<span class="text-plum">Buzz</span> Capabilities</span
              >
            </div>
          </div>

          <!-- 9 Core Capabilities Grid (Spacious & Clean) -->
          <div class="py-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div
                v-for="feat in smallFeatures"
                :key="feat.title"
                class="p-5 rounded-2xl bg-sand/40 border border-plum-faint hover:border-plum transition-all duration-200 flex flex-col"
              >
                <div class="flex items-center gap-3 mb-2.5">
                  <div
                    class="w-9 h-9 rounded-xl bg-mint-light flex items-center justify-center shrink-0 border border-mint/30"
                  >
                    <LineIcon :name="feat.icon" class="h-5 w-5 text-plum" />
                  </div>
                  <h4 class="font-editorial text-sm font-bold text-plum leading-snug">
                    {{ feat.title }}
                  </h4>
                </div>
                <p class="font-body text-xs text-plum-soft leading-relaxed">
                  {{ feat.text }}
                </p>
              </div>
            </div>
          </div>

          <!-- Why Physical Businesses Upgrade (Transformation Strip) -->
          <div class="py-6 border-t border-plum-faint">
            <div class="mb-4 text-center sm:text-left">
              <span class="font-body text-xs font-bold uppercase tracking-wider text-plum-muted"
                >Before & After QueueBuzz</span
              >
              <h3 class="font-editorial text-xl font-bold text-plum mt-0.5">
                From Waiting Chaos to Effortless Flow
              </h3>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div
                v-for="t in transformationItems"
                :key="t.chaos"
                class="p-3.5 rounded-xl bg-sand/80 border border-plum-faint flex flex-col justify-between"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="font-body text-[11px] text-danger font-semibold line-through">
                    {{ t.chaos }}
                  </span>
                  <LineIcon :name="t.icon" class="h-4 w-4 text-plum-muted" />
                </div>
                <div class="flex items-center gap-1.5">
                  <CheckCircle2 class="w-3.5 h-3.5 text-mint-dark shrink-0" />
                  <span class="font-body text-xs font-bold text-plum">{{ t.calm }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Page 2 Footer / Call to Action -->
          <div
            class="pt-6 border-t-2 border-plum-faint flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-2xl bg-plum flex items-center justify-center text-mint font-bold shrink-0"
              >
                <Bell class="w-5 h-5 text-mint" />
              </div>
              <div>
                <p class="font-editorial text-base font-bold text-plum">
                  Ready to eliminate your wait lines?
                </p>
                <p class="font-body text-xs text-plum-muted">
                  Create your first virtual queue in under 60 seconds with no credit card required.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <span
                class="font-mono text-sm font-bold text-plum bg-mint-light px-4 py-2 rounded-xl border border-mint/40"
              >
                https://queuebuzz.com
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
@media screen {
  .flyer-sheet {
    min-height: 1040px;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }

  html,
  body {
    background: #ffffff !important;
    color: #1a0a2e !important;
    padding: 0 !important;
    margin: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  header,
  footer,
  nav,
  .print\:hidden {
    display: none !important;
  }

  .flyer-sheet {
    box-shadow: none !important;
    border: 1px solid #e8e2f0 !important;
    border-radius: 16px !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    min-height: 275mm !important;
    height: 275mm !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  #flyer-page-1 {
    page-break-after: always !important;
    break-after: page !important;
  }

  #flyer-page-2 {
    page-break-before: always !important;
    break-before: page !important;
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
}
</style>
