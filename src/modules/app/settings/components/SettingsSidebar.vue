<script setup lang="ts">
import { AlertCircle, ChevronDown, CreditCard, Layers, Settings, User } from 'lucide-vue-next'
import { defineAsyncComponent, ref } from 'vue'

const props = defineProps({
  activeSection: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['navigate'])

const isMobileMenuOpen = ref(false)

const SettingsSidebarSubscriptionCard = defineAsyncComponent(
  () => import('./SettingsSidebarSubscriptionCard.vue'),
)

const navItems = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'branding', label: 'Business Branding', icon: Layers },
  { id: 'queue', label: 'Queue Configuration', icon: Settings },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
]
function handleNavigate(id: string) {
  emit('navigate', id)
  isMobileMenuOpen.value = false
}
</script>

<template>
  <aside class="w-full lg:sticky lg:top-24 lg:h-fit lg:w-64">
    <!-- Desktop Header -->
    <div class="mb-8 hidden lg:block">
      <h1 class="font-display text-2xl font-bold text-plum">Account Settings</h1>
      <p class="mt-2 font-body text-sm text-plum-muted">
        Manage your account preferences, branding, and other settings.
      </p>
    </div>
    <!-- Mobile Contextual Header Pill -->
    <div class="sticky top-0 z-30 flex justify-center py-4 lg:hidden">
      <div class="relative">
        <!-- The Pill -->
        <button
          class="flex items-center rounded-full border border-plum/10 bg-white/95 px-2 py-2 shadow-xl backdrop-blur-xl transition-all active:scale-95"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <!-- Current Section (Visual Only) -->
          <div class="flex items-center gap-2.5 pl-3 pr-4">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full bg-mint-light text-mint"
            >
              <component
                :is="navItems.find((i) => i.id === props.activeSection)?.icon || User"
                class="h-3.5 w-3.5"
              />
            </div>
            <span class="font-body text-sm font-semibold text-plum">
              {{ navItems.find((i) => i.id === props.activeSection)?.label }}
            </span>
          </div>

          <!-- Trigger Area (Visual Hint) -->
          <div class="flex items-center gap-1.5 border-l border-plum/5 py-1 pl-3 pr-2 text-mint">
            <span class="font-body text-[10px] font-bold uppercase tracking-widest opacity-80"
              >Switch</span
            >
            <ChevronDown
              class="h-4 w-4 transition-transform duration-300"
              :class="{ 'rotate-180': isMobileMenuOpen }"
            />
          </div>
        </button>

        <!-- Expanded Menu Grid -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="scale-95 opacity-0 translate-y-2"
          enter-to-class="scale-100 opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="scale-100 opacity-100 translate-y-0"
          leave-to-class="scale-95 opacity-0 translate-y-2"
        >
          <div
            v-if="isMobileMenuOpen"
            class="absolute left-1/2 mt-4 w-[calc(100vw-2rem)] -translate-x-1/2 rounded-[32px] border border-plum/10 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div class="grid grid-cols-2 gap-4">
              <button
                v-for="item in navItems"
                :key="item.id"
                class="flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all"
                :class="[
                  props.activeSection === item.id
                    ? 'border-mint bg-mint/5 ring-1 ring-mint/20'
                    : 'border-plum/5 bg-sand/50 hover:bg-sand',
                ]"
                @click="handleNavigate(item.id)"
              >
                <component
                  :is="item.icon"
                  class="h-6 w-6"
                  :class="props.activeSection === item.id ? 'text-mint' : 'text-plum-muted'"
                />
                <span
                  class="font-body text-xs font-bold text-plum"
                  :class="{ 'text-mint-dark': props.activeSection === item.id }"
                >
                  {{ item.label }}
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <nav class="hidden flex-col gap-2 lg:flex">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="flex items-center gap-3 rounded-2xl px-5 py-3.5 font-body text-sm font-semibold transition-all duration-300"
        :class="[
          props.activeSection === item.id
            ? 'bg-plum text-sand shadow-lg shadow-plum/10'
            : 'text-plum-muted hover:bg-plum-faint hover:text-plum',
        ]"
        @click="emit('navigate', item.id)"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </button>
    </nav>

    <div class="hidden lg:block">
      <SettingsSidebarSubscriptionCard @navigate="emit('navigate', $event)" />
    </div>
  </aside>
</template>
