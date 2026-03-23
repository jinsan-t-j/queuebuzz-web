<script setup lang="ts">
/**
 * @component BaseModal
 * @description Presentational modal component with Teleport and backdrop.
 */
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-plum/40 backdrop-blur-sm" 
          aria-hidden="true"
          @click="emit('close')"
        ></div>
        
        <!-- Modal Content Container -->
        <Transition
          appear
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-8 scale-95 opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-4 scale-95 opacity-0"
        >
          <div 
            class="relative w-full max-w-lg overflow-hidden rounded-[32px] shadow-[0_40px_80px_rgba(26,10,46,0.18)] focus:outline-none"
            role="dialog"
            aria-modal="true"
            @click.stop
          >
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Reset for body overflow during open? 
   Better to handle in composable or global watcher if needed.
*/
</style>
