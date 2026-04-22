<script setup>
/**
 * @component BaseTooltip
 * @description A clean, hover-triggered tooltip using pure Tailwind utility classes.
 *
 * @prop {String} text - The standard text content for the tooltip.
 */
defineProps({
  text: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="group/tooltip relative inline-flex items-center">
    <!-- Trigger -->
    <slot />

    <!-- Tooltip Panel -->
    <div
      class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 scale-95 rounded-lg bg-plum px-3 py-1.5 text-xs font-body tracking-wide text-white opacity-0 transition-all duration-200 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 shadow-[0_8px_24px_-4px_rgba(26,10,46,0.4)]"
    >
      {{ text }}
      <!-- Arrow -->
      <div
        class="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-plum"
      />
    </div>
  </div>
</template>
