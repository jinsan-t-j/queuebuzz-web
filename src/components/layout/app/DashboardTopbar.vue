<script setup lang="ts">
/**
 * @component TheTopbar
 * @description Host app top bar. Shows a page title, and the host's
 * avatar/name with a logout action. Used once inside AppLayout.
 */

// 1. Vue core imports
import { computed, ref } from 'vue'

// 2. Router / Pinia imports
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'

// 3. Third party imports
import { LogOut, User, Sun, Moon } from 'lucide-vue-next'
import router from '@/router'

// 4. Components imports
import HostNotificationCenter from '@/components/layout/HostNotificationCenter.vue'
import LogoutConfirmationModal from '@/modules/app/auth/components/LogoutConfirmationModal.vue'

// 5. Props

// 7. Emits

// 8. Composable destructuring
import { useTheme } from '@/composables/useTheme'
const { theme, toggleTheme } = useTheme()
const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { logout } = authStore

// 9. Reactive state
const isLogoutModalOpen = ref(false)

// 10. Computed properties
const pageTitle = computed(() => route.meta?.title || 'Dashboard')
const userName = computed(() => user.value?.name || formatName(user.value?.email))

// 11. Methods
function formatName(email?: string) {
  if (!email) return 'Host'

  const name = email.split('@')[0]
  return name.includes('.') ? name.split('.')[0] : name
}

function handleLogout() {
  isLogoutModalOpen.value = true
}

function confirmLogout() {
  isLogoutModalOpen.value = false
  logout()
  router.push({ name: 'home' })
}

// 12. Lifecycle hooks
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-plum-faint bg-white px-8">
    <h1 class="font-display text-xl font-bold text-plum">
      {{ pageTitle }}
    </h1>

    <div class="flex items-center gap-6">
      <button
        class="rounded-input p-2 text-plum-muted transition-colors hover:bg-sand hover:text-plum"
        aria-label="Toggle theme"
        @click="toggleTheme"
      >
        <Sun v-if="theme === 'dark'" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </button>

      <HostNotificationCenter />

      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sand">
          <img
            v-if="user?.avatar || user?.profileImageUrl"
            :src="user.avatar || user.profileImageUrl"
            :alt="userName"
            class="h-full w-full object-cover"
          />
          <User v-else class="h-4 w-4 text-plum-muted" />
        </div>
        <span class="font-body text-sm font-medium text-plum">{{ userName }}</span>
      </div>
      <button
        class="rounded-input p-2 text-plum-muted transition-colors hover:bg-sand hover:text-plum"
        aria-label="Sign out"
        @click="handleLogout"
      >
        <LogOut class="h-5 w-5" />
      </button>
    </div>

    <LogoutConfirmationModal
      :is-open="isLogoutModalOpen"
      @cancel="isLogoutModalOpen = false"
      @confirm="confirmLogout"
    />
  </header>
</template>
