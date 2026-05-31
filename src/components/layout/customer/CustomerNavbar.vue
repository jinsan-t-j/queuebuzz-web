<script setup lang="ts">
/**
 * @component CustomerNavbar
 * @description Customer-facing top bar with QueueBuzz wordmark.
 */
import { onMounted, onUnmounted, ref } from 'vue'

// 5. Component imports
import Logo from '@/assets/icons/logo.svg?component'

const isScrolled = ref(false)
let rafId: number | null = null

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
      'sticky top-0 z-20 w-full transition-all duration-300 bg-sand/85 backdrop-blur-md',
      isScrolled
        ? 'border-b border-plum-faint shadow-[0_4px_20px_rgba(26,10,46,0.05)]'
        : 'border-b border-plum-faint/30',
    ]"
  >
    <div class="mx-auto flex h-14 max-w-[430px] items-center px-5">
      <!-- Wordmark -->
      <router-link to="/" class="flex items-center gap-1 cursor-pointer">
        <Logo class="h-7 w-7 transition-transform duration-500 hover:rotate-12" />
        <span class="font-display text-lg font-bold tracking-tight text-plum">ueueBuzz</span>
      </router-link>
    </div>
  </header>
</template>
