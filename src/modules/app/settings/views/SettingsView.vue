<script setup lang="ts">
/**
 * @component SettingsView
 * @description Host account settings page with category sidebar navigation.
 */

import { ref, onMounted } from 'vue'
import SettingsForm from '@/modules/app/settings/components/SettingsForm.vue'
import SettingsSidebar from '@/modules/app/settings/components/SettingsSidebar.vue'

const activeSection = ref('profile')

function scrollToSection(id: string) {
  activeSection.value = id
  const element = document.getElementById(id)
  const container = element?.closest('main')

  if (element && container) {
    const yOffset = -24 // Small padding
    const y = element.offsetTop + yOffset
    container.scrollTo({ top: y, behavior: 'smooth' })
  }
}

// Update active section on scroll
onMounted(() => {
  const container = document.querySelector('main')
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

  ;['profile', 'queue', 'preferences', 'danger'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })
})
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-8 pb-24">
    <div class="flex flex-col gap-12 pt-10 lg:flex-row">
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
