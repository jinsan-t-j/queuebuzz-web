<script setup>
/**
 * @component TheNavbar
 * @description Public website navigation bar. Displays the QueueBuzz logo,
 * nav links, and a CTA button. Used once inside WebsiteLayout.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import { Menu, X } from 'lucide-vue-next'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state
import { ref } from 'vue'
const isMobileMenuOpen = ref(false)

// 10. Computed properties

// 11. Methods
function handleToggleMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 12. Lifecycle hooks
</script>

<template>
  <header class="border-b border-plum-faint bg-white">
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <router-link to="/" class="font-display text-2xl font-bold text-plum">
        QueueBuzz
      </router-link>

      <div class="hidden items-center gap-8 md:flex">
        <router-link
          to="/pricing"
          class="font-body text-sm font-medium text-plum-muted transition-colors hover:text-plum"
        >
          Pricing
        </router-link>
        <router-link
          to="/login"
          class="font-body text-sm font-medium text-plum-muted transition-colors hover:text-plum"
        >
          Sign In
        </router-link>
        <router-link
          to="/login"
          class="rounded-pill bg-mint px-5 py-2.5 font-body text-sm font-semibold text-plum transition-colors hover:bg-mint-dark"
        >
          Get Started Free
        </router-link>
      </div>

      <button
        class="md:hidden"
        @click="handleToggleMenu"
        aria-label="Toggle menu"
      >
        <component :is="isMobileMenuOpen ? X : Menu" class="h-6 w-6 text-plum" />
      </button>
    </nav>

    <div
      v-show="isMobileMenuOpen"
      class="border-t border-plum-faint px-6 py-4 md:hidden"
    >
      <div class="flex flex-col gap-4">
        <router-link
          to="/pricing"
          class="font-body text-sm font-medium text-plum-muted"
          @click="isMobileMenuOpen = false"
        >
          Pricing
        </router-link>
        <router-link
          to="/login"
          class="font-body text-sm font-medium text-plum-muted"
          @click="isMobileMenuOpen = false"
        >
          Sign In
        </router-link>
        <router-link
          to="/login"
          class="rounded-pill bg-mint px-5 py-2.5 text-center font-body text-sm font-semibold text-plum"
          @click="isMobileMenuOpen = false"
        >
          Get Started Free
        </router-link>
      </div>
    </div>
  </header>
</template>
