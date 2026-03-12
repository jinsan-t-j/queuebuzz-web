<script setup>
/**
 * @component CustomerNavbar
 * @description Customer-facing top bar with QueueBuzz wordmark and optional queue location pill.
 * This is NOT the host app topbar (TheTopbar.vue).
 *
 * @prop {String} queueLocation - Queue location text (e.g. "Chai Point · Koramangala").
 * @prop {Boolean} showLocation - Whether to show the location pill.
 */

// 5. Component imports
import QueueBuzzLogo from '@/assets/icons/queuebuzz-logo.svg?component'

// 6. Props
defineProps({
  queueLocation: {
    type: String,
    default: '',
  },
  showLocation: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <header class="sticky top-0 z-20 h-14 border-b border-plum-faint bg-white">
    <div class="mx-auto flex h-full max-w-[430px] items-center justify-between px-5">
      <!-- Left: Wordmark -->
      <div class="flex items-center gap-2">
        <QueueBuzzLogo class="h-5 w-6 text-mint" />
        <span class="font-display text-lg font-bold tracking-tight text-plum">QueueBuzz</span>
      </div>

      <!-- Right: Optional queue location pill -->
      <span
        v-if="showLocation && queueLocation"
        class="rounded-full bg-plum-faint px-3 py-1 font-body text-xs font-medium text-plum-muted"
      >
        {{ queueLocation }}
      </span>
    </div>
  </header>
</template>
