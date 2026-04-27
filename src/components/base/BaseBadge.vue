<script setup lang="ts">
/**
 * @component BaseBadge
 * @description Small status badge for queue entry states.
 *
 * @prop {String} variant - Badge colour: 'mint' | 'warning' | 'danger' | 'muted'
 */

// 1. Vue core imports
import { computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports

// 6. Props
const props = withDefaults(
  defineProps<{
    variant?: 'mint' | 'warning' | 'danger' | 'muted'
  }>(),
  {
    variant: 'muted',
  },
)

// 7. Emits

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties
const variantClasses = computed(() => {
  const map = {
    mint: 'bg-mint-light text-mint-dark',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    muted: 'bg-plum-faint text-plum-muted',
  }
  return map[props.variant]
})

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-pill px-2.5 py-0.5 font-body text-sm font-semibold',
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>
