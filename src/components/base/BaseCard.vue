<script setup>
/**
 * @component BaseCard
 * @description Reusable card container with optional padding variants.
 *
 * @prop {String} padding - Padding size: 'none' | 'sm' | 'md' | 'lg'
 */

// 1. Vue core imports
import { computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports

// 6. Props
const props = defineProps({
  padding: {
    type: String,
    default: 'md',
    validator: (v) => ['none', 'sm', 'md', 'lg'].includes(v),
  },
})

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties
const paddingClasses = computed(() => {
  const map = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  return map[props.padding]
})

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div
    :class="[
      'rounded-card bg-white shadow-card',
      paddingClasses,
    ]"
  >
    <slot />
  </div>
</template>
