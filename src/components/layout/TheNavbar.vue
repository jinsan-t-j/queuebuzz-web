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
import { ref, onMounted, onUnmounted } from 'vue'
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

// 10. Computed properties

// 11. Methods
function handleToggleMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

let rafId = null
function handleScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    isScrolled.value = window.scrollY > 10
    rafId = null
  })
}

// 12. Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-all duration-300 border-b',
      isScrolled
        ? 'bg-white/85 backdrop-blur-md shadow-sm border-plum-faint/50'
        : 'bg-white border-plum-faint',
    ]"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <router-link to="/" class="font-display text-2xl font-bold text-plum py-4 px-2">
        QueueBuzz
      </router-link>

      <div class="hidden items-center gap-8 md:flex">
        <router-link
          to="/pricing"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Pricing
        </router-link>
        <router-link
          to="/support"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Support
        </router-link>
        <router-link
          to="/login"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Sign In
        </router-link>
        <router-link
          to="/login"
          class="rounded-pill bg-mint px-5 py-3.5 font-body text-sm font-semibold text-plum transition-colors hover:bg-mint-dark min-h-[48px] inline-flex items-center"
        >
          Get Started Free
        </router-link>
      </div>

      <button
        class="md:hidden flex items-center justify-center min-h-12 min-w-12"
        aria-label="Toggle menu"
        @click="handleToggleMenu"
      >
        <component :is="isMobileMenuOpen ? X : Menu" class="h-6 w-6 text-plum" />
      </button>
    </nav>

    <div v-show="isMobileMenuOpen" class="border-t border-plum-faint px-6 py-4 md:hidden">
      <div class="flex flex-col gap-4">
        <router-link
          to="/pricing"
          class="font-body text-sm font-medium text-plum-soft py-4 px-2"
          @click="isMobileMenuOpen = false"
        >
          Pricing
        </router-link>
        <router-link
          to="/support"
          class="font-body text-sm font-medium text-plum-soft py-4 px-2"
          @click="isMobileMenuOpen = false"
        >
          Support
        </router-link>
        <router-link
          to="/login"
          class="font-body text-sm font-medium text-plum-soft py-4 px-2"
          @click="isMobileMenuOpen = false"
        >
          Sign In
        </router-link>
        <router-link
          to="/login"
          class="rounded-pill bg-mint px-5 py-3.5 text-center font-body text-sm font-semibold text-plum min-h-[48px] flex items-center justify-center"
          @click="isMobileMenuOpen = false"
        >
          Get Started Free
        </router-link>
      </div>
    </div>
  </header>
</template>
