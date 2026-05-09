<script setup lang="ts">
/**
 * @component TheTopbar
 * @description Host app top bar. Shows a page title, and the host's
 * avatar/name with a logout action. Used once inside AppLayout.
 */

// 1. Vue core imports
import { Menu } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DashboardUserMenu from '@/components/layout/app/DashboardUserMenu.vue'
import HostNotificationCenter from '@/components/layout/HostNotificationCenter.vue'
import LogoutConfirmationModal from '@/modules/app/auth/components/LogoutConfirmationModal.vue'
import { useAuthStore } from '@/stores/auth.store'

// 3. Third party imports

// 4. Components imports

// 5. Props

// 7. Emits
const emit = defineEmits(['toggle-menu'])

// 8. Composable destructuring
const route = useRoute()
const router = useRouter()
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
  <header
    class="flex h-16 items-center justify-between border-b border-plum-faint bg-white px-4 md:px-8"
  >
    <div class="flex items-center gap-3">
      <!-- Mobile Menu Toggle -->
      <button
        class="rounded-xl p-2 text-plum-muted transition-colors hover:bg-sand hover:text-plum lg:hidden"
        aria-label="Open menu"
        @click="emit('toggle-menu')"
      >
        <Menu class="h-6 w-6" />
      </button>

      <h1 class="hidden sm:block font-display text-xl font-bold text-plum truncate">
        {{ pageTitle }}
      </h1>
    </div>

    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Actions Group -->
      <div class="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-4 border-r border-plum-faint">
        <HostNotificationCenter />
      </div>

      <!-- User Menu Group -->
      <DashboardUserMenu
        :user-name="userName"
        :user-email="user?.email"
        :user-avatar="user?.avatar || user?.profileImageUrl"
        @logout="handleLogout"
      />
    </div>

    <LogoutConfirmationModal
      :is-open="isLogoutModalOpen"
      @cancel="isLogoutModalOpen = false"
      @close="isLogoutModalOpen = false"
      @confirm="confirmLogout"
    />
  </header>
</template>
