<script setup lang="ts">
/**
 * @component TheNavbar
 * @description Public website navigation bar. Displays the QueueBuzz logo,
 * nav links, and a CTA button. Used once inside WebsiteLayout.
 */
import { Menu, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import Logo from '@/assets/icons/logo.svg?component'
import { useAuthStore } from '@/stores/auth.store'
import { useQueueStore } from '@/stores/queue.store'

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
    isScrolled.value = globalThis.scrollY > 10
    rafId = null
  })
}

onMounted(() => {
  globalThis.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  globalThis.removeEventListener('scroll', handleScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-[box-shadow,background-color,border-color] duration-300 border-b',
      isScrolled
        ? 'bg-white border-plum-faint shadow-[0_4px_16px_rgba(26,10,46,0.06)]'
        : 'bg-transparent border-transparent',
    ]"
  >
    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <router-link to="/" class="group flex items-center gap-1.5 font-editorial text-2xl font-bold">
        <Logo class="h-10 w-10 transition-transform duration-500 group-hover:rotate-12" />
        <div class="flex flex-col justify-center leading-none text-plum">
          <span class="text-[24px] font-bold tracking-tight leading-none overflow-hidden"
            >ueue</span
          >
          <span class="text-[17px] font-bold tracking-tight leading-none mt-0.5 overflow-hidden"
            >Buzz</span
          >
        </div>
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
          class="rounded-lg bg-mint px-5 py-2.5 font-body text-sm font-bold text-plum transition-colors duration-200 hover:bg-mint-dark hover:text-white inline-flex items-center"
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
          class="rounded-lg bg-mint px-5 py-3.5 text-center font-body text-sm font-bold text-plum min-h-[48px] flex items-center justify-center"
          @click="isMobileMenuOpen = false"
        >
          {{ isAuthenticated ? 'Go to Dashboard' : 'Get Started Free' }}
        </router-link>
      </div>
    </div>
  </header>
</template>
