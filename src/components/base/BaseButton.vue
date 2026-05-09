<script setup lang="ts">
/**
 * @component BaseButton
 * @description Reusable button with variant, size, and loading support.
 *
 * @prop {String} variant - Visual style: 'primary' | 'secondary' | 'danger' | 'ghost'
 * @prop {String} size - Button size: 'sm' | 'md' | 'lg'
 * @prop {Boolean} isLoading - Disables button and shows loading state.
 * @prop {Boolean} isDisabled - Disables button without loading indicator.
 * @emits {click} - Emitted when button is clicked and not disabled.
 */

import { Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    isDisabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    isLoading: false,
    isDisabled: false,
  },
)

const emit = defineEmits(['click'])

const variantClasses = computed(() => {
  const map = {
    primary: 'bg-mint text-on-mint hover:bg-mint-dark',
    secondary: 'bg-plum-faint text-plum hover:bg-plum-faint/80',
    danger: 'bg-danger text-white hover:bg-danger/90',
    ghost: 'bg-transparent text-plum-muted hover:bg-plum-faint hover:text-plum',
    outline: 'bg-transparent text-plum border border-plum-faint hover:bg-plum-faint/50',
  }
  return map[props.variant]
})

const sizeClasses = computed(() => {
  const map = {
    sm: 'px-4 py-2 text-sm min-h-[48px]',
    md: 'px-6 py-2.5 text-sm min-h-[48px]',
    lg: 'px-8 py-3 text-base min-h-[56px]',
  }
  return map[props.size]
})

const isButtonDisabled = computed(() => props.isLoading || props.isDisabled)

function handleClick(event: MouseEvent) {
  if (!isButtonDisabled.value) {
    emit('click', event)
  }
}
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
