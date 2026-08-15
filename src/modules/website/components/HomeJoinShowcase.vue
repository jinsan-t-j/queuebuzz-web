<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

import Logo from '@/assets/icons/logo.svg?component'

defineProps<{ isVisible: boolean }>()
</script>

<template>
  <section
    id="join-showcase"
    class="py-20 lg:py-28 bg-white relative overflow-hidden transition-all duration-1000 transform"
    :class="[isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
  >
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <!-- Collage of join-by-code + join screens, left on desktop -->
        <div
          class="order-2 lg:order-1 relative w-full max-w-[280px] sm:max-w-sm mx-auto lg:mx-0 aspect-[7/8]"
        >
          <!-- Back card: code entry screen (JoinByCodeView) -->
          <div
            class="absolute left-0 top-2 w-[70%] rounded-2xl border border-plum-faint bg-white shadow-[0_8px_30px_rgba(26,10,46,0.08)] overflow-hidden -rotate-6 transition-transform duration-700 ease-out animate-[collage-float-a_6s_ease-in-out_infinite]"
            :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
          >
            <!-- Mini navbar -->
            <div class="flex items-center gap-1 px-3 py-2 bg-sand/85 border-b border-plum-faint/30">
              <Logo class="h-3.5 w-3.5" />
              <span class="font-display text-[10px] font-bold tracking-tight text-plum"
                >ueueBuzz</span
              >
            </div>

            <div class="flex flex-col items-center px-4 pt-5 pb-5">
              <p class="font-display text-xs font-black text-plum text-center leading-tight">
                Joining a queue?
              </p>
              <p class="mt-1.5 font-body text-[7px] text-plum-muted text-center leading-relaxed">
                Enter the 6-character code from the signage or your friend's ticket.
              </p>
              <div class="mt-4 flex justify-center gap-1">
                <div
                  v-for="i in 6"
                  :key="i"
                  class="h-6 w-5 rounded-md border-2 border-plum-faint bg-white"
                  :class="i === 1 ? 'ring-1 ring-mint/40' : ''"
                />
              </div>
              <p
                class="mt-3 font-body text-[6px] font-semibold text-plum-soft uppercase tracking-[0.15em]"
              >
                Not case sensitive
              </p>
              <div
                class="mt-4 w-full rounded-xl bg-plum-faint py-2 text-center font-display text-[10px] font-bold text-plum-muted"
              >
                Proceed to Join
              </div>
              <div
                class="mt-2 w-full rounded-xl border border-dashed border-plum-faint py-2 text-center font-body text-[8px] font-bold text-plum"
              >
                Scan QR Instead
              </div>
            </div>
          </div>

          <!-- Front card: join form screen (JoinView) -->
          <div
            class="absolute right-0 bottom-0 w-[70%] rounded-2xl border border-plum-faint bg-sand shadow-[0_12px_40px_rgba(26,10,46,0.12)] overflow-hidden rotate-3 transition-transform duration-700 ease-out animate-[collage-float-b_7s_ease-in-out_infinite]"
            :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
          >
            <!-- Mini navbar -->
            <div class="flex items-center gap-1 px-3 py-2 bg-sand/85 border-b border-plum-faint/30">
              <Logo class="h-3.5 w-3.5" />
              <span class="font-display text-[10px] font-bold tracking-tight text-plum"
                >ueueBuzz</span
              >
            </div>

            <div class="px-3 pt-3 pb-4">
              <div class="flex items-center justify-center gap-1">
                <p class="font-editorial text-[10px] text-plum">Consultation</p>
                <div class="h-1.5 w-1.5 rounded-full bg-mint" />
              </div>

              <div class="mt-2 rounded-xl border border-plum-faint bg-white p-2.5 text-center">
                <p
                  class="font-body text-[6px] font-semibold uppercase tracking-widest text-plum-soft"
                >
                  People in Queue
                </p>
                <p class="font-display text-lg font-normal leading-none text-plum mt-0.5">1</p>
                <div
                  class="mx-auto mt-1 flex w-fit items-center gap-1 rounded-full bg-plum-faint/60 px-2 py-0.5"
                >
                  <span class="font-mono text-[8px] font-bold text-plum">~5 min</span>
                  <span class="font-body text-[8px] text-plum-soft">Wait</span>
                </div>
              </div>

              <p class="mt-2 font-display text-[10px] font-bold text-plum">Secure your spot</p>

              <div class="mt-1.5 rounded-lg border border-plum-faint bg-white p-1">
                <span class="font-body text-[7px] text-plum-muted/60">
                  What should we call you? (optional)
                </span>
              </div>

              <div
                class="mt-1.5 flex items-center justify-between rounded-lg border border-plum-faint bg-white px-2 py-1.5"
              >
                <div class="flex items-center gap-1.5">
                  <div class="h-4 w-4 rounded-full bg-warning/15" />
                  <span class="font-body text-[7px] font-semibold text-plum"
                    >Joining with others?</span
                  >
                </div>
                <div class="flex items-center gap-1">
                  <div class="h-3 w-3 rounded-full bg-plum-faint" />
                  <span class="font-mono text-[7px] font-bold text-plum">0</span>
                  <div class="h-3 w-3 rounded-full bg-plum-faint" />
                </div>
              </div>

              <div
                class="mt-1.5 flex items-center justify-between rounded-lg border border-plum-faint bg-white px-2 py-1.5"
              >
                <div class="flex items-center gap-1.5">
                  <div class="h-4 w-4 rounded-full bg-mint-light" />
                  <span class="font-body text-[7px] font-semibold text-plum"
                    >Buzz me when ready</span
                  >
                </div>
                <div class="h-2.5 w-4 rounded-full bg-mint" />
              </div>

              <div
                class="mt-2.5 w-full rounded-lg bg-mint py-2 text-center font-body text-[9px] font-semibold text-on-mint shadow-[0_4px_16px_rgba(0,229,160,0.4)]"
              >
                Join the Queue
              </div>
            </div>
          </div>
        </div>

        <!-- Text, right on desktop -->
        <div class="order-1 lg:order-2">
          <h2 class="font-editorial text-3xl lg:text-4xl font-bold text-plum mb-4">
            No line to stand in. Just a code to enter.
          </h2>
          <p class="font-body text-plum-soft text-base leading-relaxed mb-6">
            Customers scan a QR code or type the 6-character code from your signage. No app store,
            no account, no phone number required — they're in the queue in seconds and can walk away
            while it counts down.
          </p>
          <router-link
            to="/join"
            class="group inline-flex items-center gap-2 font-body text-base font-semibold text-mint-dark hover:text-mint transition-colors"
          >
            Try the join screen
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes collage-float-a {
  0%,
  100% {
    transform: rotate(-6deg) translateY(0);
  }
  50% {
    transform: rotate(-6deg) translateY(-8px);
  }
}
@keyframes collage-float-b {
  0%,
  100% {
    transform: rotate(3deg) translateY(0);
  }
  50% {
    transform: rotate(3deg) translateY(-10px);
  }
}
</style>
