<script setup lang="ts">
/**
 * @component BaseModal
 * @description Accessible presentational modal with v-if lazy-rendering, focus trapping, and scroll locking.
 */
import { useScrollLock } from '@vueuse/core'
import { ref, watch, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const modalRef = ref<HTMLElement | null>(null)
const isLocked = useScrollLock(typeof document === 'undefined' ? null : document.body)

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
    return
  }

  if (e.key === 'Tab' && modalRef.value) {
    const focusable = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return

    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    if (e.shiftKey && document.activeElement === first) {
      last.focus()
      e.preventDefault()
    } else if (
      !e.shiftKey &&
      (document.activeElement === last || !modalRef.value.contains(document.activeElement))
    ) {
      first.focus()
      e.preventDefault()
    }
  }
}

// Lock body scroll and handle focus when open
watch(
  () => props.isOpen,
  async (open) => {
    isLocked.value = open
    if (open) {
      globalThis.addEventListener('keydown', handleKeyDown)
      await nextTick()
      // Set initial focus to the first focusable element
      const first = modalRef.value?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )[0]
      first?.focus()
    } else {
      globalThis.removeEventListener('keydown', handleKeyDown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  isLocked.value = false
  globalThis.removeEventListener('keydown', handleKeyDown)
})
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
        />

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
          <dialog
            ref="modalRef"
            open
            class="relative w-full max-w-lg overflow-y-auto rounded-[32px] bg-white border border-plum-faint shadow-[0_40px_80px_rgba(26,10,46,0.18)] dark:shadow-none focus:outline-none m-0 p-0"
            aria-modal="true"
            @click.stop
          >
            <slot />
          </dialog>
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
