<script setup>
/**
 * @component TheNavbar
 * @description Public website navigation bar. Displays the QueueBuzz logo,
 * nav links, and a CTA button. Used once inside WebsiteLayout.
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { useQueueStore } from '@/stores/queue.store'

import { Menu, X } from 'lucide-vue-next'

import { ref, onMounted, onUnmounted } from 'vue'

const authStore = useAuthStore()
const queueStore = useQueueStore()

const { isAuthenticated } = storeToRefs(authStore)
const { activeQueue } = storeToRefs(queueStore)

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

/**
 * Computed login link to ensure anonymous queues are claimed
 * regardless of where the user clicks 'Sign In'
 */
const loginRoute = computed(() => ({
  name: 'login',
  query:
    !isAuthenticated.value && activeQueue.value?.id ? { claim_queue_id: activeQueue.value.id } : {},
}))

/**
 * Directs to guest creation if not logged in, or dashboard if they are.
 */
const ctaRoute = computed(() => {
  if (isAuthenticated.value) return { name: 'dashboard' }
  return { name: 'guest-host-create' }
})

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
          v-if="isAuthenticated"
          to="/dashboard"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Dashboard
        </router-link>
        <router-link
          v-else
          :to="loginRoute"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Sign In
        </router-link>
        <router-link
          :to="ctaRoute"
          class="rounded-pill bg-mint px-5 py-3.5 font-body text-sm font-semibold text-plum transition-colors hover:bg-mint-dark min-h-[48px] inline-flex items-center"
        >
          {{ isAuthenticated ? 'Go to Dashboard' : 'Get Started Free' }}
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
          v-if="isAuthenticated"
          to="/dashboard"
          class="font-body text-sm font-medium text-plum-soft py-4 px-2"
          @click="isMobileMenuOpen = false"
        >
          Dashboard
        </router-link>
        <router-link
          v-else
          :to="loginRoute"
          class="font-body text-sm font-medium text-plum-soft py-4 px-2"
          @click="isMobileMenuOpen = false"
        >
          Sign In
        </router-link>
        <router-link
          :to="ctaRoute"
          class="rounded-pill bg-mint px-5 py-3.5 text-center font-body text-sm font-semibold text-plum min-h-[48px] flex items-center justify-center"
          @click="isMobileMenuOpen = false"
        >
          {{ isAuthenticated ? 'Go to Dashboard' : 'Get Started Free' }}
        </router-link>
      </div>
    </div>
  </header>
</template>
