<script setup lang="ts">
/**
 * @component TheFooter
 * @description Public website footer with links and copyright.
 * Used once inside WebsiteLayout.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'

import InstagramIcon from '@/assets/icons/instagram.svg?component'
import Logo from '@/assets/icons/logo.svg?component'
import RedditIcon from '@/assets/icons/reddit.svg?component'
import XIcon from '@/assets/icons/x.svg?component'
import { ALTERNATIVES } from '@/modules/website/content/alternatives'

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
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
        <!-- Brand Content -->
        <div class="lg:col-span-4 xl:col-span-3">
          <router-link
            to="/"
            class="font-editorial text-2xl font-bold text-plum block mb-4 py-3 px-1"
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
          class="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:col-span-8 lg:gap-8 xl:col-span-9 xl:gap-10"
        >
          <!-- Product -->
          <div>
            <h2 class="font-editorial font-bold text-plum mb-4 text-sm tracking-wide uppercase">
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
            <h2 class="font-editorial font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Support
            </h2>
            <ul class="space-y-1 font-body text-sm text-plum-soft flex flex-col items-start">
              <li>
                <router-link
                  to="/help"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Help Center</router-link
                >
              </li>
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

          <!-- Resources -->
          <div>
            <h2 class="font-editorial font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Resources
            </h2>
            <ul class="space-y-1 font-body text-sm text-plum-soft flex flex-col items-start">
              <li>
                <router-link
                  to="/about"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >About</router-link
                >
              </li>
              <li>
                <router-link
                  to="/alternatives"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                  >Alternatives</router-link
                >
              </li>
              <li v-for="alt in ALTERNATIVES" :key="alt.slug">
                <router-link
                  :to="{ name: 'alternative', params: { slug: alt.slug } }"
                  class="transition-colors hover:text-mint-dark min-h-[48px] flex items-center"
                >
                  {{ alt.name }} comparison
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h2 class="font-editorial font-bold text-plum mb-4 text-sm tracking-wide uppercase">
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

        <!-- Social Links -->
        <div class="flex items-center gap-2">
          <a
            href="https://reddit.com/r/queuebuzz/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-plum-muted hover:text-plum transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Reddit"
          >
            <RedditIcon class="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com/queuebuzz"
            target="_blank"
            rel="noopener noreferrer"
            class="text-plum-muted hover:text-plum transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Instagram"
          >
            <InstagramIcon class="w-5 h-5" />
          </a>
          <a
            href="https://x.com/queuebuzz"
            target="_blank"
            rel="noopener noreferrer"
            class="text-plum-muted hover:text-plum transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="X (formerly Twitter)"
          >
            <XIcon class="w-4 h-4" />
          </a>
        </div>
      </div>

      <!-- Closing wordmark: quiet, static, single tone -->
      <div
        ref="footerBrandingRef"
        class="mt-12 md:mt-16 flex justify-center py-6 md:py-10 transition-opacity duration-700"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
      >
        <div class="flex items-center gap-3 sm:gap-4">
          <Logo class="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16" />
          <span
            class="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold text-plum leading-none"
          >
            ueueBuzz
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
