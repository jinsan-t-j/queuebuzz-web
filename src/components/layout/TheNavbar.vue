<script setup lang="ts">
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
      'sticky top-0 z-50 transition-all duration-500 border-b',
      isScrolled
        ? 'bg-white/60 backdrop-blur-3xl shadow-[0_8px_32px_rgba(26,10,46,0.08)] border-white/40 py-2'
        : 'bg-white/10 backdrop-blur-sm border-transparent py-4',
    ]"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <router-link
        to="/"
        class="group flex items-center gap-2 font-display text-2xl font-bold text-plum"
      >
        <div
          class="h-8 w-8 rounded-xl bg-mint flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
        >
          <div class="h-2 w-2 rounded-full bg-plum" />
        </div>
        <span class="tracking-tight">QueueBuzz</span>
      </router-link>

      <div class="hidden items-center gap-8 md:flex">
        <router-link
          to="/pricing"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Pricing
        </router-link>
        <router-link
          v-if="!isAuthenticated"
          to="/join"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Join Queue
        </router-link>
        <router-link
          to="/support"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Support
        </router-link>
        <router-link
          v-if="!isAuthenticated"
          :to="loginRoute"
          class="font-body text-sm font-medium text-plum-soft transition-colors hover:text-plum py-4 px-2"
        >
          Sign In
        </router-link>
        <router-link
          :to="ctaRoute"
          class="rounded-full bg-plum px-6 py-3 font-body text-sm font-bold text-white transition-all duration-300 hover:bg-mint hover:text-plum hover:shadow-[0_0_20px_rgba(0,229,160,0.4)] hover:-translate-y-0.5 active:scale-95 inline-flex items-center"
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
          v-if="!isAuthenticated"
          to="/join"
          class="font-body text-sm font-medium text-plum-soft py-4 px-2"
          @click="isMobileMenuOpen = false"
        >
          Join Queue
        </router-link>
        <router-link
          to="/support"
          class="font-body text-sm font-medium text-plum-soft py-4 px-2"
          @click="isMobileMenuOpen = false"
        >
          Support
        </router-link>
        <router-link
          v-if="!isAuthenticated"
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
