<script setup>
/**
 * @component LoginView
 * @description Login page for QueueBuzz hosts. Two-column glass card layout:
 * left side shows hero copy, right side shows email + magic link form
 * with social login options.
 *
 * @emits {form-submit} - User submitted the email magic-link form.
 * @emits {social-login} - User clicked a social login button.
 */

import { ref, computed } from 'vue'

import { useAuth } from '@/composables/useAuth'

import QueueBuzzLogoBg from '@/assets/icons/queuebuzz-logo-bg.svg?component'
import ShieldCheckIcon from '@/assets/icons/shield-check.svg?component'
import SparkleIcon from '@/assets/icons/sparkle.svg?component'
import { useRoute, useRouter } from 'vue-router'

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['form-submit', 'social-login'])

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const email = ref('')
const isLoading = ref(false)

const safeRedirect = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/dashboard'
})

function handleSubmit() {
  if (!email.value.trim()) return
  isLoading.value = true
  setTimeout(() => {
    login(email.value)
    isLoading.value = false
    router.push(safeRedirect.value)
  }, 500)

  emit('form-submit', { email: email.value })

}

function handleSocialLogin(provider) {
  emit('social-login', { provider })
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="main-bg flex min-h-screen items-center justify-center px-6 py-12">
    <!-- Glass card -->
    <div
      class="glass-card flex w-full max-w-[1152px] overflow-hidden rounded-login-card shadow-glass"
    >
      <!-- ═══ Left column — Hero ═══ -->
      <div
        class="flex w-[460px] shrink-0 flex-col justify-between border-r border-white/40 bg-white/10 px-16 pb-14 pt-16"
      >
        <div>
          <!-- Logo -->
          <div class="mb-16 flex items-center gap-3">
            <QueueBuzzLogoBg class="h-14 w-14 rounded-2xl border border-white" />
            <span class="font-display text-2xl font-extrabold tracking-tight text-[#1a1d1e]">
              QueueBuzz
            </span>
          </div>

          <!-- Heading -->
          <h1 class="font-display text-[60px] font-extrabold leading-none text-[#1a1d1e]">
            Welcome
            <br />
            <span class="text-mint">Back!</span>
          </h1>

          <!-- Subtitle -->
          <p class="mt-4 max-w-[315px] font-display text-xl font-medium leading-relaxed text-[#475569]">
            Step back into your workspace and
            keep the magic flowing.
          </p>
        </div>

        <!-- Secure badge -->
        <div class="flex items-center gap-3">
          <ShieldCheckIcon class="h-5 w-4 text-ash" />
          <span class="font-display text-sm font-semibold uppercase tracking-[0.35px] text-[#64748b]">
            Secure Portal Access
          </span>
        </div>
      </div>

      <!-- ═══ Right column — Form ═══ -->
      <div class="flex flex-1 flex-col items-center justify-center gap-10 px-16 py-16">
        <!-- Email form -->
        <div class="flex w-full max-w-[448px] flex-col gap-6">
          <!-- Label + Input -->
          <div>
            <label
              class="mb-2 block font-display text-sm font-bold uppercase tracking-[1.4px] text-[#64748b]"
            >
              Email Address
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="name@yourcompany.com"
              class="w-full rounded-[14px] border border-plum-faint bg-white px-[18px] py-4 font-display text-lg font-semibold text-plum placeholder:text-ash outline-none focus:border-plum"
              @keyup.enter="handleSubmit"
            />
          </div>

          <!-- Submit button -->
          <button
            class="flex w-full items-center justify-center gap-2 rounded-[32px] bg-[#00c48c] px-8 py-5 font-display text-lg font-extrabold text-white shadow-[0_8px_10px_rgba(0,229,160,0.20),0_20px_25px_rgba(0,229,160,0.20)] transition-colors hover:bg-mint-dark"
            :is-loading="isLoading"
            @click="handleSubmit"
          >
            Receive Magic Link
            <SparkleIcon class="h-[21px] w-[21px] text-white" />
          </button>
        </div>

        <!-- OR divider -->
        <div class="flex w-full max-w-[448px] items-center gap-4">
          <div class="flex-1 border-t border-ash-border" />
          <span class="font-display text-xs font-bold uppercase tracking-[3.6px] text-ash">
            Or continue with
          </span>
          <div class="flex-1 border-t border-ash-border" />
        </div>

        <!-- Social buttons -->
        <div class="flex items-center gap-6">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            aria-label="Sign in with Google"
            @click="handleSocialLogin('google')"
          >
            <img
              src="/icons/google-logo.png"
              alt="Google"
              class="h-10 w-10 object-contain"
            />
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            aria-label="Sign in with Apple"
            @click="handleSocialLogin('apple')"
          >
            <img
              src="/icons/apple-logo.png"
              alt="Apple"
              class="h-10 w-10 object-contain"
            />
          </button>
        </div>

        <!-- Legal footer -->
        <div class="text-center">
          <p class="font-display text-[11px] font-bold uppercase tracking-[1.1px] text-ash">
            By continuing, you agree to our
          </p>
          <p class="mt-1 font-display text-[11px] font-bold uppercase tracking-[1.1px]">
            <a href="#" class="text-mint border-b-2 border-mint/20 hover:text-mint-dark">Terms of Service</a>
            <span class="text-ash"> &amp; </span>
            <a href="#" class="text-mint border-b-2 border-mint/20 hover:text-mint-dark">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
