<script setup lang="ts">
/**
 * @component PwaLauncher
 * @description Beautiful app launcher for users running QueueBuzz in PWA mode,
 * matching the Holi-inspired gradient aesthetic and premium visual styling of HomeView.
 */
import { ArrowRight, Key, LogIn, Sparkles, Users } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Logo from '@/assets/icons/logo.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import ActiveWaitingBanner from '@/modules/customer/components/ActiveWaitingBanner.vue'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'
import { useAuthStore } from '@/stores/auth.store'
import { useQueueStore } from '@/stores/queue.store'

const router = useRouter()
const authStore = useAuthStore()
const queueStore = useQueueStore()
const customerStore = useCustomerStore()

const showSyncModal = ref(false)
const recoveryInput = ref('')
const isSyncing = ref(false)
const syncError = ref('')

function parseToken(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('/q/')) {
    try {
      const url = new URL(trimmed)
      return url.searchParams.get('token') || url.searchParams.get('recovery_token') || ''
    } catch {
      const tokenMatch = trimmed.match(/[?&](?:token|recovery_token)=([^&]+)/)
      return tokenMatch ? decodeURIComponent(tokenMatch[1]) : ''
    }
  }

  return trimmed
}

async function performRecoveryAndRedirect(token: string): Promise<boolean> {
  const success = await customerStore.recoverGuestSessionByToken(token)
  if (success && customerStore.entry?.queueId) {
    const status = customerStore.entry.status
    let routeName = 'customer-waiting'
    if (status === 'CALLED' || status === 'ARRIVED') {
      routeName = 'customer-called'
    } else if (status === 'IDLE') {
      routeName = 'customer-idle'
    }
    router.replace({ name: routeName, params: { queueId: customerStore.entry.queueId } })
    return true
  }
  return false
}

async function handleSync() {
  const input = recoveryInput.value.trim()
  if (!input) return
  isSyncing.value = true
  syncError.value = ''
  try {
    const token = parseToken(input)
    if (!token) {
      syncError.value = 'Invalid recovery token or link. Please copy the full link or token.'
      return
    }

    const success = await performRecoveryAndRedirect(token)
    if (success) {
      showSyncModal.value = false
    } else {
      syncError.value = customerStore.error || 'Active ticket not found or link has expired'
    }
  } catch (err: unknown) {
    const error = err as Error
    syncError.value = error?.message || 'Sync failed. Please check the code and try again.'
  } finally {
    isSyncing.value = false
  }
}

async function checkClipboardForRecovery(isUserGesture = false) {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) return false

    // If not a user gesture, check permission first to prevent showing permission prompts on page load
    if (!isUserGesture && navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: 'clipboard-read' as any,
        })
        if (status.state !== 'granted') {
          return false
        }
      } catch {
        return false
      }
    }

    const text = await navigator.clipboard.readText()
    if (!text) return false

    const token = parseToken(text)
    if (token) {
      isSyncing.value = true
      const redirected = await performRecoveryAndRedirect(token)
      if (redirected) {
        return true
      }
    }
  } catch {
    // Fail silently (e.g. clipboard permission denied)
  } finally {
    isSyncing.value = false
  }
  return false
}

async function handleSyncButtonClick() {
  isSyncing.value = true
  syncError.value = ''
  try {
    // Attempt auto-read from clipboard (with user gesture context active)
    const success = await checkClipboardForRecovery(true)
    if (success) return
  } catch {
    // Ignore and fallback
  } finally {
    isSyncing.value = false
  }
  // Open manual sync modal fallback if clipboard auto-read didn't redirect
  showSyncModal.value = true
}

onMounted(async () => {
  // 1. Recover customer session if active
  let hasActiveCustomerSession = false
  if (customerStore.isJoined) {
    try {
      await customerStore.fetchEntry()
      hasActiveCustomerSession = customerStore.isJoined
    } catch {
      // Ignore recovery validation error
    }
  } else {
    hasActiveCustomerSession = await customerStore.attemptSessionRecovery()
  }

  // 2. Redirect active customer session
  if (hasActiveCustomerSession && customerStore.isJoined && customerStore.entry?.queueId) {
    const status = customerStore.entry.status
    let routeName = 'customer-waiting'
    if (status === 'CALLED' || status === 'ARRIVED') {
      routeName = 'customer-called'
    } else if (status === 'IDLE') {
      routeName = 'customer-idle'
    }
    router.replace({ name: routeName, params: { queueId: customerStore.entry.queueId } })
    return
  }

  // 3. Check for active host session
  if (authStore.user || authStore.anonymousQueueId) {
    try {
      await queueStore.fetchActiveQueue({ skipLogout: true })
    } catch {
      // Ignore active queue fetch error
    }
  }

  if (authStore.isAuthenticated) {
    router.replace('/dashboard')
    return
  }

  if (authStore.anonymousQueueId && queueStore.activeQueue) {
    router.replace(
      `/guest-host/queue/${queueStore.activeQueue.slug || queueStore.activeQueue.id}/live`,
    )
    return
  }

  // 4. Auto-sync if valid recovery link/token is in the clipboard
  await checkClipboardForRecovery()
})
</script>

<template>
  <div
    class="min-h-screen bg-sand text-plum selection:bg-mint/30 overflow-hidden relative flex flex-col items-center justify-center p-6 w-full"
  >
    <!-- Background Floating Orbs (Matches HomeView's aesthetic) -->
    <div class="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      <div
        class="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-mint/10 rounded-full blur-[80px] animate-blob"
      />
      <div
        class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-plum/5 rounded-full blur-[90px] animate-blob animation-delay-2000"
      />
      <div
        class="absolute top-[40%] left-[-15%] w-[300px] h-[300px] bg-pink-500/5 blur-[100px] animate-blob"
      />
      <div
        class="absolute bottom-[30%] right-[-15%] w-[300px] h-[300px] bg-blue-500/5 blur-[90px] animate-blob animation-delay-2000"
      />
    </div>

    <!-- Core Content Container (Glassmorphic Card) -->
    <div
      class="relative z-10 w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/30 rounded-[48px] p-8 md:p-12 shadow-[0_32px_64px_rgba(26,10,46,0.06)] flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700"
    >
      <!-- Logo Section with micro-floating effect -->
      <div class="mb-8 flex flex-col items-center gap-3 group">
        <div
          class="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-plum/5 border border-plum-faint group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-float"
        >
          <Logo class="h-10 w-10" />
        </div>
        <span class="font-display text-xl font-black text-plum tracking-tight mt-2 animate-pulse">
          QueueBuzz
        </span>
      </div>

      <!-- Hero Header -->
      <h1 class="font-display text-4xl font-black text-plum mb-4 leading-[1.1] tracking-tight">
        Ready to start<br />
        <span class="text-mint-dark">your session?</span>
      </h1>

      <p class="font-body text-sm text-plum-soft max-w-xs mb-10 leading-relaxed">
        Stop managing crowds and start managing your business. Ditch the physical line with ease.
      </p>

      <!-- Active Waiting Banner for Customers -->
      <ActiveWaitingBanner />

      <!-- CTAs & Actions Stack -->
      <div class="w-full flex flex-col gap-4">
        <!-- Log In / Sign Up (Primary) -->
        <router-link to="/login-or-signup" class="w-full">
          <BaseButton
            size="lg"
            class="group h-14 w-full text-base !rounded-2xl shadow-md shadow-mint/10 hover:shadow-xl hover:shadow-mint/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <LogIn class="mr-2 h-5 w-5" />
            Log in or sign up
            <ArrowRight class="ml-auto h-5 w-5 transition-transform group-hover:translate-x-1" />
          </BaseButton>
        </router-link>

        <!-- Try for Free (Secondary Outline) -->
        <router-link to="/guest-host/queue/create" class="w-full">
          <BaseButton
            variant="outline"
            size="lg"
            class="h-14 w-full text-base bg-white/80 backdrop-blur-sm !rounded-2xl border border-plum/10 hover:bg-white hover:border-plum/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
          >
            <Sparkles class="mr-2 h-5 w-5 text-mint-dark" />
            Try for free
          </BaseButton>
        </router-link>

        <!-- Sync Safari Ticket (PWA bridge fallback) -->
        <BaseButton
          variant="outline"
          size="lg"
          class="h-14 w-full text-base bg-white/80 backdrop-blur-sm !rounded-2xl border border-plum/10 hover:bg-white hover:border-plum/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
          @click="handleSyncButtonClick"
        >
          <Key class="mr-2 h-5 w-5 text-warning" />
          Sync Safari Ticket
        </BaseButton>

        <!-- Divider Line with soft styling -->
        <div class="flex items-center my-4 w-full">
          <div class="flex-grow h-px bg-plum-faint" />
          <span class="px-3 font-body text-xs text-plum-muted uppercase tracking-widest">or</span>
          <div class="flex-grow h-px bg-plum-faint" />
        </div>

        <!-- Join a Queue (Ghost / Accent Link) -->
        <router-link to="/join" class="w-full">
          <BaseButton
            variant="ghost"
            size="lg"
            class="h-14 w-full text-base text-plum hover:bg-plum-faint !rounded-2xl transition-all duration-300"
          >
            <Users class="mr-2 h-5 w-5 text-plum-soft" />
            Join a Queue
          </BaseButton>
        </router-link>
      </div>
    </div>

    <!-- Sync Safari Ticket Modal -->
    <BaseModal :is-open="showSyncModal" @close="showSyncModal = false">
      <div class="relative p-6 md:p-8 text-center max-w-sm w-full mx-auto">
        <div
          class="mx-auto mb-4 w-12 h-12 rounded-full bg-mint-light flex items-center justify-center"
        >
          <Key class="w-6 h-6 text-plum" />
        </div>
        <h2 class="font-display font-bold text-xl text-plum mb-2">Sync Safari Ticket</h2>
        <p class="font-body text-sm text-plum-muted mb-6 leading-relaxed">
          Paste the recovery link or token copied from your browser ticket page to transfer your
          session.
        </p>

        <form class="flex flex-col gap-4 text-left" @submit.prevent="handleSync">
          <BaseInput
            v-model="recoveryInput"
            label="Recovery Link or Token"
            placeholder="Paste recovery link or token..."
            required
          />

          <div v-if="syncError" class="text-danger text-sm font-body font-semibold mt-1">
            {{ syncError }}
          </div>

          <div class="flex gap-3 justify-end mt-4">
            <BaseButton variant="ghost" type="button" @click="showSyncModal = false"
              >Cancel</BaseButton
            >
            <BaseButton type="submit" :loading="isSyncing">Sync Now</BaseButton>
          </div>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(20px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-10px, 15px) scale(0.95);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
.animate-blob {
  animation: blob 8s infinite ease-in-out;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
