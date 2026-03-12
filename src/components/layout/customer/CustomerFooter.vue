<script setup>
/**
 * @component CustomerFooter
 * @description Minimal legal footer shown at the bottom of every customer screen.
 *
 * @emits {open-terms} - Emitted when "Terms & Conditions" is clicked.
 * @emits {open-privacy} - Emitted when "Privacy Policy" is clicked.
 */

// 7. Emits
const emit = defineEmits(['open-terms', 'open-privacy'])
</script>

<template>
  <footer class="bg-sand pb-6 pt-4">
    <div class="mx-auto max-w-[430px] px-5 text-center">
      <p class="font-body text-[10px] text-plum-muted">
        © All Copyrights Reserved 2026
      </p>
      <p class="mt-1 font-body text-[10px] text-plum-muted">
        <button class="cursor-pointer underline" @click="emit('open-terms')">Terms &amp; Conditions</button>
        <span class="mx-1">|</span>
        <button class="cursor-pointer underline" @click="emit('open-privacy')">Privacy Policy</button>
      </p>
    </div>
  </footer>
</template>
