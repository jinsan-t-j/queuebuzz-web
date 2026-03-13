<script setup>
/**
 * @component CustomerFooter
 * @description Minimal legal footer shown at the bottom of every customer screen.
 *
 * @prop {Boolean} showFreeNotice - Whether to show "Free · No signup required" above copyright.
 */

import { computed } from 'vue'

// 5. Component imports
import ShieldVerifiedIcon from '@/assets/icons/shield-verified.svg?component'

// 6. Props
defineProps({
  showFreeNotice: {
    type: Boolean,
    default: false,
  },
})

const currentYear = computed(() => new Date().getFullYear())

</script>

<template>
  <footer class="bg-sand pb-6 pt-4">
    <div class="mx-auto flex max-w-[430px] flex-col items-center gap-1 px-5">
      <!-- Free notice (shown on join screen) -->
      <div v-if="showFreeNotice" class="flex items-center gap-2">
        <ShieldVerifiedIcon class="h-3 w-3 text-plum-muted" />
        <span class="font-body text-xs font-medium text-plum-muted">Free · No signup required</span>
      </div>

      <!-- Copyright -->
      <p class="text-center font-body text-[10px] capitalize tracking-tight text-plum-muted">
        © {{ currentYear }} queuebuzz. All rights reserved
      </p>
      <p class="text-center font-body text-[10px] capitalize tracking-tight text-plum-muted">
        <router-link to="/terms" class="hover:text-plum">Terms & Conditions</router-link> | <router-link to="/privacy" class="hover:text-plum">Privacy Policy</router-link>
      </p>
    </div>
  </footer>
</template>
