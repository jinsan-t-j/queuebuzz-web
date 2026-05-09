<script setup lang="ts">
/**
 * @component PwaLauncher
 * @description Simplified app launcher for users running QueueBuzz in PWA mode.
 */
import QueueBuzzLogoBg from '@/assets/icons/queuebuzz-logo-bg.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <div
    class="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-700"
  >
    <!-- Logo Section -->
    <div class="mb-12 flex flex-col items-center gap-4">
      <QueueBuzzLogoBg class="h-16 w-16" />
      <span class="font-display text-2xl font-black text-plum tracking-tight"> QueueBuzz </span>
    </div>

    <!-- Hero Text -->
    <h1 class="font-display text-4xl font-bold text-plum mb-4 leading-tight">
      Ready to start <br />your session?
    </h1>
    <p class="font-body text-plum-muted max-w-xs mb-10 leading-relaxed">
      Manage your business queue with ease or join an existing line.
    </p>

    <!-- CTAs -->
    <div class="w-full max-w-xs flex flex-col gap-4">
      <router-link to="/login-or-signup">
        <BaseButton variant="primary" size="lg" class="w-full !rounded-pill">
          Log in or sign up
        </BaseButton>
      </router-link>

      <router-link to="/guest-host/queue/create">
        <BaseButton
          variant="secondary"
          size="lg"
          class="w-full !rounded-pill !bg-white border border-plum-faint"
        >
          Try for free
        </BaseButton>
      </router-link>

      <div class="h-4" />
      <!-- Spacer -->

      <router-link to="/join">
        <BaseButton
          variant="ghost"
          size="md"
          class="pointer-cursor w-full text-plum hover:underline"
        >
          Join a Queue
        </BaseButton>
      </router-link>
    </div>
  </div>
</template>
