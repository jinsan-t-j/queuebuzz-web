<script setup>
/**
 * @component HomeView
 * @description Public landing page for QueueBuzz.
 * If running in PWA mode, shows a simplified App Launcher.
 * Otherwise shows the full marketing hero and features.
 */
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowRight } from 'lucide-vue-next'
import { useQueueStore } from '@/stores/queue.store'
import { useAuthStore } from '@/stores/auth.store'
import BaseButton from '@/components/base/BaseButton.vue'

const PwaLauncher = defineAsyncComponent(() => import('../components/PwaLauncher.vue'))

const queueStore = useQueueStore()
const authStore = useAuthStore()
const { activeQueue } = storeToRefs(queueStore)

const isPwa = ref(false)
const hasChecked = ref(false)

onMounted(async () => {
  isPwa.value = window.matchMedia('(display-mode: standalone)').matches

  // Initialize session if not hydrated to correctly identify authenticated hosts, skip logout on 401
  if (!authStore.isHydrated) {
    await authStore.initializeSession({ skipLogout: true })
  }

  // Check for live queue asynchronously, skip logout on 401
  try {
    await queueStore.fetchActiveQueue({ skipLogout: true })
  } finally {
    hasChecked.value = true
  }
})

const formattedStartedAt = computed(() => {
  if (!activeQueue.value?.createdAt) return null
  return new Date(activeQueue.value.createdAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
})

const resumeLink = computed(() => {
  if (!activeQueue.value) return '/guest-host/queue/create'

  // If authenticated host, go to app dashboard
  if (authStore.isAuthenticated) {
    return '/dashboard'
  }

  // If anonymous host, go to the public live dashboard
  return `/guest-host/queue/${activeQueue.value.slug || activeQueue.value.id}/live`
})
</script>

<template>
  <PwaLauncher v-if="isPwa" />

  <div v-else>
    <!-- Live Host Queue Banner (Floating Popover) -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="-translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-full opacity-0"
    >
      <div v-if="activeQueue" class="sticky top-24 z-[60] px-6 py-4 pointer-events-none">
        <div
          class="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-[40px] border border-plum/10 bg-white/90 p-2 pl-6 shadow-[0_20px_50px_-12px_rgba(26,10,46,0.18)] backdrop-blur-xl pointer-events-auto"
        >
          <div class="flex items-center gap-4">
            <!-- Pulsing dot exactly like QueueStatusBar -->
            <span class="relative flex h-3 w-3">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75"
              />
              <span class="relative inline-flex h-3 w-3 rounded-full bg-mint" />
            </span>

            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <p class="font-body text-sm font-bold text-plum">
                  {{ activeQueue.name }}
                </p>
                <div class="h-1 w-1 rounded-full bg-plum-muted/30" />
                <span class="font-body text-[10px] font-bold text-mint uppercase tracking-wider"
                  >Live</span
                >
              </div>
              <p v-if="formattedStartedAt" class="font-body text-[11px] text-plum-muted">
                Started at {{ formattedStartedAt }}
              </p>
            </div>
          </div>
          <router-link :to="resumeLink">
            <BaseButton
              variant="primary"
              size="sm"
              class="rounded-full bg-mint px-6 font-body text-xs font-bold text-plum transition-all hover:bg-mint-dark hover:scale-105 shadow-sm"
            >
              Resume Dashboard
              <ArrowRight class="ml-2 h-3.5 w-3.5" />
            </BaseButton>
          </router-link>
        </div>
      </div>
    </Transition>

    <!-- Hero Section -->
    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <h1 class="font-display text-5xl font-black leading-tight text-plum md:text-7xl">
        Let's make waiting
        <span class="text-mint">feel <br />like a breeze.</span>
      </h1>
      <p class="mx-auto mt-6 max-w-2xl font-body text-lg text-plum-muted">
        Create a virtual queue in seconds. Your customers join from their phone — no app download,
        no sign-up needed.
      </p>
      <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <router-link :to="resumeLink">
          <BaseButton variant="primary" size="lg" class="w-full px-10 sm:w-auto">
            {{ activeQueue ? 'Resume Active Queue' : 'Start Queue Instantly' }}
          </BaseButton>
        </router-link>
        <router-link to="/join">
          <BaseButton
            variant="ghost"
            size="lg"
            class="w-full border border-plum-faint px-10 sm:w-auto"
          >
            Join a Queue
          </BaseButton>
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section v-once class="mx-auto max-w-7xl px-6 py-16">
      <div class="grid gap-8 md:grid-cols-3">
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">01</span>
          </div>
          <h2 class="font-display text-lg font-bold text-plum">Create a Queue</h2>
          <p class="mt-2 font-body text-sm text-plum-soft">
            Open your dashboard, name your queue, and you're live in seconds.
          </p>
        </div>
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">02</span>
          </div>
          <h2 class="font-display text-lg font-bold text-plum">Customers Join</h2>
          <p class="mt-2 font-body text-sm text-plum-soft">
            Share a QR code or join code. Customers enter from their mobile browser.
          </p>
        </div>
        <div class="rounded-card bg-white p-8 shadow-card">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-light">
            <span class="font-mono text-lg font-semibold text-mint-dark">03</span>
          </div>
          <h2 class="font-display text-lg font-bold text-plum">Call Next</h2>
          <p class="mt-2 font-body text-sm text-plum-soft">
            Manage the line from your dashboard. Customers get notified instantly.
          </p>
        </div>
      </div>
    </section>

    <!-- Join by Code Section (Customer Focused) -->
    <section v-once class="mx-auto max-w-4xl px-6 py-24">
      <div
        class="relative overflow-hidden rounded-[40px] border border-plum-faint bg-white p-12 text-center shadow-[0_32px_64px_-16px_rgba(26,10,46,0.1)]"
      >
        <!-- Decoration -->
        <div
          class="absolute -right-20 -top-20 h-64 w-64 opacity-60 rounded-full bg-mint-light/50 blur-3xl"
        />
        <div
          class="absolute -bottom-20 -left-20 h-64 w-64 opacity-60 rounded-full bg-plum/5 blur-3xl"
        />

        <div class="relative z-10">
          <h2 class="font-display text-4xl font-bold text-plum">Are you a Guest?</h2>
          <p class="mx-auto mt-4 max-w-md font-body text-lg text-plum-soft">
            Scan a QR code at the business or enter a 6-character code below to join the line.
          </p>

          <div class="mt-10 mx-auto max-w-sm">
            <router-link to="/join">
              <div
                class="flex h-16 w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed border-plum-faint bg-sand/30 px-6 transition-all duration-300 hover:border-mint hover:bg-mint-light/10"
              >
                <span class="font-mono text-xl font-bold uppercase tracking-[0.25em] text-plum-soft"
                  >ENTER-CODE</span
                >
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-plum text-white shadow-lg"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-once class="bg-plum py-20 text-center">
      <h2 class="font-display text-3xl font-bold text-white md:text-4xl">
        No sign-up hassle. Just start.
      </h2>
      <p class="mx-auto mt-4 max-w-xl font-body text-plum-faint">
        QueueBuzz is free for single queues. Go Premium when you need more.
      </p>
      <div class="mt-8">
        <router-link to="/login-or-signup">
          <BaseButton variant="primary" size="lg"> Get Started Free </BaseButton>
        </router-link>
      </div>
    </section>
  </div>
</template>
