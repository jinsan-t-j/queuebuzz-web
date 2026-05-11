<script setup lang="ts">
/**
 * @component NotFoundView
 * @description Dedicated 404/Not Found view for the customer module.
 * Used when a queue slug is invalid, expired, or deactivated.
 */

import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

function goToJoinByCode() {
  router.push({ name: 'customer-join-by-code' })
}

function goToHome() {
  router.push('/')
}
</script>

<template>
  <div class="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
    <!-- Premium Blob Decorations -->
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-mint-light/40 blur-[50px] animate-pulse"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-warning/20 blur-[60px]"
    />

    <!-- Main Content Card -->
    <div class="z-10 flex w-full max-w-sm flex-col items-center">
      <!-- Icon/Illustration -->
      <div
        class="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_8px_30px_rgb(26,10,46,0.06)] border border-plum-faint"
      >
        <svg
          class="h-10 w-10 text-plum-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 4h.01"
          />
        </svg>
      </div>

      <h1 class="font-display text-2xl font-bold text-plum mb-4">Queue not found</h1>

      <p class="font-body text-plum-muted mb-10 leading-relaxed">
        This queue might have ended, or the link you're using is incorrect. Don't worry, you can
        still join using a code or browse other services.
      </p>

      <!-- Action Buttons -->
      <div class="flex w-full flex-col gap-3">
        <BaseButton
          variant="primary"
          class="w-full shadow-lg shadow-mint/20"
          @click="goToJoinByCode"
        >
          Join with a Code
        </BaseButton>

        <BaseButton variant="ghost" class="w-full" @click="goToHome"> Go to Home </BaseButton>
      </div>
    </div>

    <!-- Subtext/Hint -->
    <p class="mt-12 font-body text-sm text-plum-muted/60">
      Need help? Contact the business directly.
    </p>
  </div>
</template>

<style scoped>
/* Any additional micro-interactions could go here if needed */
</style>
