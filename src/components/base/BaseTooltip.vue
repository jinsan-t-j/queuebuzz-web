<script setup lang="ts">
/**
 * @component BaseTooltip
 * @description Hover-triggered tooltip. Shows after a configurable delay (default 600ms).
 *
 * @prop {String} text - Tooltip content.
 * @prop {Number} delay - Ms to wait before showing (default 600).
 */
import { ref } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  delay: { type: Number, default: 600 },
})

const visible = ref(false)
let timer = null

function onEnter() {
  timer = setTimeout(() => {
    visible.value = true
  }, props.delay)
}

function onLeave() {
  clearTimeout(timer)
  visible.value = false
}
</script>

<template>
  <div class="relative inline-flex items-center" @mouseenter="onEnter" @mouseleave="onLeave">
    <!-- Trigger -->
    <slot />

    <!-- Tooltip Panel -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[320px] -translate-x-1/2 rounded-xl border border-plum-faint bg-white px-3 py-2 text-xs font-body text-plum-muted shadow-[0_4px_16px_rgba(26,10,46,0.08)]"
      >
        {{ text }}
        <!-- Arrow -->
        <div
          class="absolute top-full left-1/2 -mt-[1px] -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-white drop-shadow-[0_1px_0_rgba(232,226,240,1)]"
        />
      </div>
    </Transition>
  </div>
</template>
