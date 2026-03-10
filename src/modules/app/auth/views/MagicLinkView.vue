<script setup>
/**
 * @component MagicLinkView
 * @description Confirmation screen shown after magic link is sent.
 * Tells the user to check their email.
 */

// 1. Vue core imports

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import BaseButton from '@/components/base/BaseButton.vue'

// 6. Props

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-6">
    <div class="w-full max-w-sm text-center">
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-mint-light">
        <span class="font-display text-2xl">✉️</span>
      </div>
      <h1 class="font-display text-2xl font-bold text-plum">Check your email</h1>
      <p class="mt-2 font-body text-sm text-plum-muted">
        We sent a magic link to your inbox. Click it to sign in.
      </p>
      <div class="mt-8">
        <router-link to="/login">
          <BaseButton variant="ghost" size="md">
            Back to Sign In
          </BaseButton>
        </router-link>
      </div>
    </div>
  </div>
</template>
