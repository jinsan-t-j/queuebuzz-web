<script setup lang="ts">
/**
 * @component SettingsView
 * @description Host account settings page with category sidebar navigation.
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import SettingsForm from '@/modules/app/settings/components/SettingsForm.vue'
import SettingsSidebar from '@/modules/app/settings/components/SettingsSidebar.vue'

const route = useRoute()
const activeSection = ref('profile')

function scrollToSection(id: string) {
  activeSection.value = id
  const element = document.getElementById(id)
  const container = document.querySelector('main')

  if (element && container) {
    const yOffset = -24
    const y = element.offsetTop + yOffset
    container.scrollTo({ top: y, behavior: 'smooth' })
  }
}

watch(
  () => route.query.section,
  (newSection) => {
    if (newSection) {
      scrollToSection(String(newSection))
    }
  },
)

onMounted(() => {
  const container = document.querySelector('main')
  if (!container) return

  // Track scroll for active selection reset
  const handleScroll = () => {
    if (container.scrollTop < 40) {
      activeSection.value = 'profile'
    }
  }
  container.addEventListener('scroll', handleScroll)

  onUnmounted(() => {
    container.removeEventListener('scroll', handleScroll)
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    {
      root: container,
      rootMargin: '-20px 0px -60% 0px',
      threshold: 0,
    },
  )

  ;['profile', 'branding', 'queue', 'preferences', 'subscription', 'danger'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })

  if (route.query.section) {
    setTimeout(() => {
      scrollToSection(String(route.query.section))
    }, 150)
  }
})
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-4 sm:px-8 pb-34 md:pb-24">
    <div class="flex flex-col gap-8 sm:gap-12 pt-6 sm:pt-10 lg:flex-row">
      <!-- ═══ Sidebar Navigation ═══ -->
      <SettingsSidebar :active-section="activeSection" @navigate="scrollToSection" />

      <div class="flex-1">
        <!-- Mobile Header (hidden on desktop) -->
        <div class="mb-8 lg:hidden">
          <h1 class="font-display text-3xl font-bold text-plum">Account Settings</h1>
        </div>

        <SettingsForm />
      </div>
    </div>
  </div>
</template>
