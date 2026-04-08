<script setup>
/**
 * @component TheFooter
 * @description Public website footer with links and copyright.
 * Used once inside WebsiteLayout.
 */
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
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
            <h3 class="font-display font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Product
            </h3>
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
            <h3 class="font-display font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Support
            </h3>
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
            <h3 class="font-display font-bold text-plum mb-4 text-sm tracking-wide uppercase">
              Legal
            </h3>
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
    </div>
  </footer>
</template>
