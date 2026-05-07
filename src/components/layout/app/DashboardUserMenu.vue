<script setup lang="ts">
/**
 * @component DashboardUserMenu
 * @description A unified user profile dropdown for the topbar.
 * Consolidates profile info, settings links, and logout action.
 */
import { useTheme } from '@/composables/useTheme'
import {
  ChevronDown,
  HelpCircle,
  Layers,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserCircle,
} from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'Host',
  },
  userEmail: {
    type: String,
    default: '',
  },
  userAvatar: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['logout'])

const { themeMode, setTheme } = useTheme()
const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const hasImageError = ref(false)

const userInitial = computed(() => {
  return props.userName.charAt(0).toUpperCase() || 'H'
})

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

function handleLogout() {
  isOpen.value = false
  emit('logout')
}

function onImageError() {
  hasImageError.value = true
}

onMounted(() => {
  globalThis.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  globalThis.removeEventListener('click', closeMenu)
})
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      class="flex items-center gap-2 rounded-full p-1 transition-all hover:bg-sand focus:outline-none group"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      <div
        class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-plum-faint border border-plum-faint group-hover:border-plum/20"
      >
        <img
          v-if="userAvatar && !hasImageError"
          :src="userAvatar"
          :alt="userName"
          class="h-full w-full object-cover"
          @error="onImageError"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-plum text-sand font-display text-xs font-bold"
        >
          {{ userInitial }}
        </div>
      </div>
      <span class="hidden font-body text-sm font-semibold text-plum sm:block">{{ userName }}</span>
      <ChevronDown
        class="hidden h-4 w-4 text-plum-muted transition-transform duration-300 sm:block"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-3 w-64 origin-top-right divide-y divide-plum-faint rounded-[20px] bg-white p-1.5 shadow-[0_20px_50px_rgba(26,10,46,0.15)] ring-1 ring-plum/5 focus:outline-none z-50 overflow-hidden"
      >
        <!-- User Info Header -->
        <div class="px-4 py-4 bg-sand/30 rounded-t-[14px]">
          <p class="font-body text-[10px] font-bold text-plum-muted uppercase tracking-widest">
            Signed in as
          </p>
          <div class="mt-2 flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white border border-plum-faint shadow-sm"
            >
              <img
                v-if="userAvatar && !hasImageError"
                :src="userAvatar"
                :alt="userName"
                class="h-full w-full object-cover"
                @error="onImageError"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-plum text-sand font-display text-base font-bold"
              >
                {{ userInitial }}
              </div>
            </div>
            <div class="min-w-0">
              <p class="font-display text-sm font-bold text-plum truncate">{{ userName }}</p>
              <p class="font-body text-xs text-plum-muted truncate">{{ userEmail }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="py-1.5">
          <router-link
            :to="{ name: 'settings', query: { section: 'profile' } }"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-plum hover:bg-sand transition-all"
            @click="isOpen = false"
          >
            <UserCircle class="h-4 w-4 text-plum-muted transition-colors group-hover:text-plum" />
            <span class="font-medium">My Profile</span>
          </router-link>
          <router-link
            :to="{ name: 'settings', query: { section: 'branding' } }"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-plum hover:bg-sand transition-all"
            @click="isOpen = false"
          >
            <Layers class="h-4 w-4 text-plum-muted transition-colors group-hover:text-plum" />
            <span class="font-medium">Business Branding</span>
          </router-link>
          <router-link
            :to="{ name: 'settings', query: { section: 'queue' } }"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-plum hover:bg-sand transition-all"
            @click="isOpen = false"
          >
            <Settings class="h-4 w-4 text-plum-muted transition-colors group-hover:text-plum" />
            <span class="font-medium">Account Settings</span>
          </router-link>

          <a
            href="mailto:support@queuebuzz.com"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-plum hover:bg-sand transition-all"
            @click="isOpen = false"
          >
            <HelpCircle class="h-4 w-4 text-plum-muted transition-colors group-hover:text-plum" />
            <span class="font-medium">Help & Support</span>
          </a>

          <!-- Theme Preference Section -->
          <div class="px-3 py-2.5">
            <p
              class="mb-2.5 px-1 font-body text-[10px] font-bold text-plum-muted uppercase tracking-widest"
            >
              Theme Preference
            </p>
            <div class="flex items-center gap-1 rounded-xl bg-sand p-1 border border-plum-faint">
              <button
                v-for="mode in ['light', 'dark', 'system'] as const"
                :key="mode"
                class="flex flex-1 items-center justify-center gap-2 py-1.5 rounded-lg transition-all"
                :class="[
                  themeMode === mode
                    ? 'bg-white text-plum shadow-sm ring-1 ring-plum/5'
                    : 'text-plum-muted hover:text-plum',
                ]"
                @click="setTheme(mode)"
              >
                <Sun v-if="mode === 'light'" class="h-3.5 w-3.5" />
                <Moon v-else-if="mode === 'dark'" class="h-3.5 w-3.5" />
                <Monitor v-else class="h-3.5 w-3.5" />
                <span class="font-body text-[10px] font-bold capitalize">{{ mode }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Logout Action -->
        <div class="py-1.5">
          <button
            class="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-danger hover:bg-red-50 transition-all text-left"
            @click="handleLogout"
          >
            <div class="flex h-4 w-4 items-center justify-center">
              <LogOut class="h-4 w-4 text-danger/60 transition-colors group-hover:text-danger" />
            </div>
            <span class="font-bold">Sign Out</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
