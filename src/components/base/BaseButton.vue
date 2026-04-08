<script setup>
/**
 * @component BaseButton
 * @description Reusable button with variant, size, and loading support.
 * Maps to QueueBuzz design system colours and radii.
 *
 * @prop {String} variant - Visual style: 'primary' | 'secondary' | 'danger' | 'ghost'
 * @prop {String} size - Button size: 'sm' | 'md' | 'lg'
 * @prop {Boolean} isLoading - Disables button and shows loading state.
 * @prop {Boolean} isDisabled - Disables button without loading indicator.
 * @emits {click} - Emitted when button is clicked and not disabled.
 */

// 1. Vue core imports
import { computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import { Loader2 } from 'lucide-vue-next'

// 6. Props
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})

// 7. Emits
const emit = defineEmits(['click'])

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties
const variantClasses = computed(() => {
  const map = {
    primary: 'bg-mint text-plum hover:bg-mint-dark',
    secondary: 'bg-plum-faint text-plum hover:bg-plum-faint/80',
    danger: 'bg-danger text-white hover:bg-danger/90',
    ghost: 'bg-transparent text-plum-muted hover:bg-plum-faint hover:text-plum',
  }
  return map[props.variant]
})

const sizeClasses = computed(() => {
  const map = {
    sm: 'px-4 py-2 text-xs min-h-[48px]',
    md: 'px-6 py-2.5 text-sm min-h-[48px]',
    lg: 'px-8 py-3 text-base min-h-[56px]',
  }
  return map[props.size]
})

const isButtonDisabled = computed(() => props.isLoading || props.isDisabled)

// 11. Methods
function handleClick(event) {
  if (!isButtonDisabled.value) {
    emit('click', event)
  }
}

// 12. Lifecycle hooks
</script>

<template>
  <button
    :disabled="isButtonDisabled"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-pill font-body font-semibold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint',
      variantClasses,
      sizeClasses,
      { 'cursor-not-allowed opacity-50 !cursor-not-allowed': isButtonDisabled },
    ]"
    @click="handleClick"
  >
    <Loader2 v-show="isLoading" class="h-4 w-4 animate-spin" />
    <slot />
  </button>
</template>
