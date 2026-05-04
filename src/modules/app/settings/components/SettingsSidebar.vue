<script setup lang="ts">
import { User, Layers, Bell, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  activeSection: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['navigate'])

const navItems = [
  { id: 'profile', label: 'Profile & Branding', icon: User },
  { id: 'queue', label: 'Queue Configuration', icon: Layers },
  { id: 'preferences', label: 'Preferences', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
]
</script>

<template>
  <aside class="w-full lg:sticky lg:top-24 lg:h-fit lg:w-64">
    <div class="mb-8 hidden lg:block">
      <h1 class="font-display text-2xl font-bold text-plum">Account Settings</h1>
      <p class="mt-2 font-body text-sm text-plum-muted">
        Manage your account preferences, branding, and other settings.
      </p>
    </div>

    <nav class="flex flex-row gap-2 overflow-x-auto pb-4 lg:flex-col lg:overflow-visible lg:pb-0">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="flex items-center gap-3 cursor-pointer whitespace-nowrap rounded-2xl px-4 py-3 font-body text-sm font-medium transition-all duration-200"
        :class="[
          props.activeSection === item.id
            ? 'bg-plum text-sand shadow-lg dark:shadow-none shadow-plum/10'
            : 'text-plum-muted hover:bg-plum-faint hover:text-plum',
        ]"
        @click="emit('navigate', item.id)"
      >
        <component :is="item.icon" class="h-4 w-4" />
        {{ item.label }}
      </button>
    </nav>
  </aside>
</template>
