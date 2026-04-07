<script setup lang="ts">
/**
 * @component LoginView
 * @description Login page for QueueBuzz hosts. Two-column glass card layout:
 * left side shows hero copy, right side shows email + magic link form
 * with social login options.
 *
 * @emits {form-submit} - User submitted the email magic-link form.
 * @emits {social-login} - User clicked a social login button.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '@/modules/app/auth/components/LoginForm.vue'
import QueueBuzzLogoBg from '@/assets/icons/queuebuzz-logo-bg.svg?component'
import GoogleIcon from '@/assets/icons/google.svg?component'
import AppleIcon from '@/assets/icons/apple.svg?component'
import { AUTH_ROUTES } from '@/config/api.constants'
import type { SocialProvider } from '@/modules/app/auth/types'

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const isSocialLoading = ref(false)

function handleSocialLogin(provider: SocialProvider) {
  if (isSocialLoading.value) return

  isSocialLoading.value = true
  window.location.assign(AUTH_ROUTES.SOCIAL_START(provider))
}

function handleMagicLinkSuccess() {
  void router.push({ name: 'magic-link' })
}
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
        <div class="flex flex-col items-start">
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
            <span class="text-mint">Host!</span>
          </h1>

          <!-- Subtitle -->
          <p
            class="mt-4 max-w-[315px] font-display text-xl font-medium leading-relaxed text-[#475569]"
          >
            Step back into your workspace and keep the magic flowing through secure access.
          </p>
        </div>
      </div>

      <!-- ═══ Right column — Form ═══ -->
      <div class="flex flex-1 flex-col items-center justify-center gap-10 px-16 py-16">
        <!-- Email form -->
        <LoginForm @submit-success="handleMagicLinkSuccess" />

        <!-- OR divider -->
        <div class="flex w-full max-w-[448px] items-center gap-4">
          <div class="flex-1 border-t border-ash-border" />
          <span class="font-display text-xs font-bold uppercase tracking-[3.6px] text-ash">
            Or
          </span>
          <div class="flex-1 border-t border-ash-border" />
        </div>

        <!-- Social buttons -->
        <div class="flex items-center gap-6">
          <button
            class="cursor-pointer"
            aria-label="Sign in with Google"
            :disabled="isSocialLoading"
            @click="handleSocialLogin('google')"
          >
            <GoogleIcon class="object-contain" />
          </button>
          <button
            class="cursor-pointer"
            aria-label="Sign in with Apple"
            :disabled="isSocialLoading"
            @click="handleSocialLogin('apple')"
          >
            <AppleIcon class="object-contain" />
          </button>
        </div>

        <!-- Legal footer -->
        <div class="text-center">
          <p class="font-display text-[8px] font-bold uppercase tracking-[1.1px] text-ash">
            By continuing, you agree to our
          </p>
          <p class="mt-1 font-display text-[8px] font-bold uppercase tracking-[1.1px]">
            <router-link
              to="/terms"
              class="text-mint border-b-2 border-mint/20 hover:text-mint-dark"
              >Terms of Service</router-link
            >
            <span class="text-ash"> &amp; </span>
            <router-link
              to="/privacy"
              class="text-mint border-b-2 border-mint/20 hover:text-mint-dark"
              >Privacy Policy</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
