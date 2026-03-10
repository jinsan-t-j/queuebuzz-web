<script setup>
/**
 * @component GuestHostCreateQueueView
 * @description Anonymous (guest) host queue creation form. Same form layout
 * as CreateQueueView but without sidebar/auth chrome. Includes a footer
 * link nudging the user to create a free account for URL customization.
 */

import CreateQueueForm from '@/modules/app/queue/components/CreateQueueForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToSignup() {
  // Navigation fallback, depending on actual app routes
  router.push('/register').catch(() => {})
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-[680px] px-6 py-16">
      <!-- Page heading -->
      <h1 class="font-display text-[40px] font-extrabold text-plum">
        Let's get started.
      </h1>

      <CreateQueueForm role="guest" @create-account="goToSignup" />
    </div>
  </div>
</template>
