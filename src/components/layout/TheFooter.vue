<script setup lang="ts">
/**
 * @component TheFooter
 * @description Public website footer with links and copyright.
 * Used once inside WebsiteLayout.
 */
import { computed, ref, onMounted, onUnmounted } from 'vue'

const currentYear = computed(() => new Date().getFullYear())

const footerBrandingRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true
      } else {
        isVisible.value = false
      }
    },
    { threshold: 0.1 },
  )

  if (footerBrandingRef.value) {
    observer.observe(footerBrandingRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <footer class="border-t border-plum-faint bg-white py-12 md:py-16">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <!-- Brand Content -->
        <div class="md:col-span-5 lg:col-span-4">
          <router-link
            to="/"
            class="font-display text-2xl font-bold text-plum block mb-4 py-3 px-1"
          >
            QueueBuzz
          </router-link>
          <p class="font-body text-sm text-plum-soft leading-[1.7] max-w-sm">
            Let's make waiting feel like a breeze. The virtual queue management platform that
            requires no app downloads for your customers.
          </p>
        </div>

        <!-- Links Container -->
        <div
          class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7"
        >
          <!-- Product -->
          <div>
            <h2 class="font-display font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Product
            </h2>
            <ul class="space-y-1 font-body text-sm text-plum-soft flex flex-col items-start">
              <li>
                <router-link
                  to="/guest-host/queue/create"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Start Free Queue</router-link
                >
              </li>
              <li>
                <router-link
                  to="/pricing"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Pricing</router-link
                >
              </li>
              <li>
                <router-link
                  to="/premium"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Premium</router-link
                >
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h2 class="font-display font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Support
            </h2>
            <ul class="space-y-1 font-body text-sm text-plum-soft flex flex-col items-start">
              <li>
                <router-link
                  to="/support"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Contact Us</router-link
                >
              </li>
              <li>
                <a
                  href="mailto:support@queuebuzz.com"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Email Us</a
                >
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div class="col-span-2 sm:col-span-1">
            <h2 class="font-display font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Legal
            </h2>
            <ul class="space-y-1 font-body text-sm text-plum-soft flex flex-col items-start">
              <li>
                <router-link
                  to="/terms"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Terms & Conditions</router-link
                >
              </li>
              <li>
                <router-link
                  to="/privacy"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Privacy Policy</router-link
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="mt-12 pt-8 border-t border-plum-faint flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <p class="font-body text-sm text-plum-soft">
          © {{ currentYear }} QueueBuzz. All rights reserved.
        </p>
      </div>

      <!-- Huge Animated Branding -->
      <div
        ref="footerBrandingRef"
        class="mt-12 md:mt-20 flex justify-center overflow-visible py-8 md:py-16"
      >
        <div class="flex gap-1 sm:gap-2 md:gap-4 flex-nowrap items-center justify-center">
          <span
            v-for="(char, i) in 'QueueBuzz'.split('')"
            :key="i"
            :class="[
              'font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black transition-all duration-500 hover:text-plum cursor-default inline-block leading-none',
              isVisible ? 'animate-pop' : 'opacity-0',
              i === 1 || i === 2 ? 'text-mint-dark' : 'text-plum',
            ]"
            :style="{ animationDelay: `${i * 100}ms` }"
          >
            {{ char }}
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@keyframes wave {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-24px);
  }
}

.animate-pop {
  animation: wave 1s ease-in-out infinite;
}
</style>
