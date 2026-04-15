<script setup lang="ts">
/**
 * @component LoginView
 * @description Simplified login page for QueueBuzz hosts.
 * Centered minimalist layout inspired by modern production apps.
 */
import LoginForm from '@/modules/app/auth/components/LoginForm.vue'
import QueueBuzzLogoBg from '@/assets/icons/queuebuzz-logo-bg.svg?component'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleMagicLinkSuccess() {
  void router.push({ name: 'magic-link' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-12">
    <!-- Logo -->
    <div class="mb-12 flex flex-col items-center gap-4">
      <QueueBuzzLogoBg class="h-12 w-12" />
      <span class="font-display text-xl font-bold text-plum tracking-tight"> QueueBuzz </span>
    </div>

    <!-- Centered Card -->
    <div
      class="w-full max-w-[440px] bg-white rounded-[32px] p-10 shadow-[0_8px_40px_rgba(26,10,46,0.06)]"
    >
      <div class="text-center mb-8">
        <h1 class="font-display text-3xl font-bold text-plum mb-3">Log in or sign up</h1>
        <p class="font-body text-plum-muted leading-relaxed">
          The simplest way to manage your physical queues and delight your customers.
        </p>
      </div>

      <!-- Combined Form + Socials -->
      <LoginForm @submit-success="handleMagicLinkSuccess" />

      <!-- Social Buttons & Divider are now inside LoginForm or moved here -->
      <!-- I'll put them in LoginForm to keep the "Form" self-contained for the auth logic -->
    </div>

    <!-- Legal footer -->
    <div class="mt-12 text-center max-w-xs">
      <p class="font-body text-xs text-plum-muted leading-relaxed">
        By continuing, you agree to our
        <router-link to="/terms" class="text-plum font-semibold hover:underline"
          >Terms of Service</router-link
        >
        &
        <router-link to="/privacy" class="text-plum font-semibold hover:underline"
          >Privacy Policy</router-link
        >.
      </p>
    </div>
  </div>
</template>
