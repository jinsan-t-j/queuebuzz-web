<script setup lang="ts">
/**
 * @component HeadsUpBanner
 * @description Heads-up banner displayed to guests who are 2nd or 3rd in line.
 */
import { computed } from 'vue'

const props = defineProps({
  position: {
    type: Number,
    default: null,
  },
})

const isVisible = computed(() => props.position === 2 || props.position === 3)
</script>

<template>
  <div
    v-if="isVisible"
    class="bg-white border border-plum-faint rounded-3xl p-5 flex items-start gap-4 shadow-[0_8px_30px_rgba(26,10,46,0.04)] animate-in slide-in-from-top-4 duration-300 relative overflow-hidden"
  >
    <div class="absolute top-0 left-0 w-1.5 h-full bg-mint" />
    <div
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-light text-plum font-mono text-lg font-bold"
    >
      #{{ position }}
    </div>
    <div class="flex-1">
      <h4 class="font-display font-bold text-plum text-sm mb-1">Get Ready!</h4>
      <p class="font-body text-xs text-plum-muted leading-relaxed">
        You're currently {{ position === 2 ? 'second' : 'third' }} in line. Please start moving
        towards the service area.
      </p>
    </div>
  </div>
</template>
