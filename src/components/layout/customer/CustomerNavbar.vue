<script setup>
/**
 * @component CustomerNavbar
 * @description Customer-facing top bar with QueueBuzz wordmark.
 */

// 5. Component imports
import QueueBuzzLogo from '@/assets/icons/queuebuzz-logo.svg?component'
</script>

<template>
  <header class="sticky top-0 z-20">
    <div class="mx-auto flex h-14 max-w-[430px] items-center px-5">
      <!-- Wordmark -->
      <div class="flex items-center gap-2">
        <QueueBuzzLogo class="h-5 w-6 text-mint" />
        <span class="font-display text-lg font-bold tracking-tight text-plum">QueueBuzz</span>
      </div>
    </div>
  </header>
</template>
