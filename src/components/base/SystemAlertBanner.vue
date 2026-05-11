<script setup lang="ts">
import { AlertCircle, X } from 'lucide-vue-next'
import { ref } from 'vue'

const alertMessage = import.meta.env.VITE_MAINTENANCE_MESSAGE || ''
const isVisible = ref(import.meta.env.VITE_SHOW_MAINTENANCE_BANNER === 'true')

function dismiss() {
  isVisible.value = false
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-full opacity-0"
  >
    <div
      v-if="isVisible && alertMessage"
      class="sticky top-0 z-[100] w-full bg-plum text-sand py-3 px-4 shadow-lg border-b border-plum-soft/20"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div
            class="flex-shrink-0 w-8 h-8 rounded-full bg-sand/10 flex items-center justify-center"
          >
            <AlertCircle class="w-5 h-5 text-warning" />
          </div>
          <p class="font-body text-sm md:text-base font-medium">
            {{ alertMessage }}
          </p>
        </div>

        <button
          class="p-1.5 rounded-full hover:bg-sand/10 transition-colors text-sand/60 hover:text-sand"
          aria-label="Dismiss alert"
          @click="dismiss"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>
