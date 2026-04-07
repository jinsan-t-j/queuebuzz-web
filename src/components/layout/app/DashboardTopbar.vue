<script setup>
/**
 * @component TheTopbar
 * @description Host app top bar. Shows a page title, and the host's
 * avatar/name with a logout action. Used once inside AppLayout.
 */

// 1. Vue core imports
import { computed, ref } from 'vue'

// 2. Router / Pinia imports
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// 3. Third party imports
import { LogOut, User } from 'lucide-vue-next'
import router from '@/router'

// 4. Components imports
import HostNotificationCenter from '@/components/layout/HostNotificationCenter.vue'
import LogoutConfirmationModal from '@/modules/app/auth/components/LogoutConfirmationModal.vue'

// 5. Props

// 7. Emits

// 8. Composable destructuring
const route = useRoute()
const { user, logout } = useAuthStore()

// 9. Reactive state
const isLogoutModalOpen = ref(false)

// 10. Computed properties
const pageTitle = computed(() => route.meta?.title || 'Dashboard')
const userName = computed(() => user?.name || formatName(user.email))

// 11. Methods
function formatName(email) {
  if (!email) return 'Host'

  const name = email.split('@')[0]
  return name.includes('.') ? name.split('.')[0] : name
}

function handleLogout() {
  isLogoutModalOpen.value = true
}

function confirmLogout() {
  isLogoutModalOpen.value = false
  void logout()
  void router.push({ name: 'home' })
}

// 12. Lifecycle hooks
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-plum-faint bg-white px-8">
    <h1 class="font-display text-xl font-bold text-plum">
      {{ pageTitle }}
    </h1>

    <div class="flex items-center gap-6">
      <HostNotificationCenter />

      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-plum-faint">
          <User class="h-4 w-4 text-plum-muted" />
        </div>
        <span class="font-body text-sm font-medium text-plum">{{ userName }}</span>
      </div>
      <button
        class="rounded-input p-2 text-plum-muted transition-colors hover:bg-plum-faint hover:text-plum"
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
