<script setup>
/**
 * @component BaseToggle
 * @description On/off toggle switch with v-model support.
 * Maps to QueueBuzz design system using mint for active state.
 *
 * @prop {Boolean} modelValue - Current toggle state (v-model).
 * @emits {update:modelValue} - Emitted when toggled.
 */

// 6. Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// 7. Emits
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="props.modelValue"
    :class="[
      'relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint',
      'before:content-[\'\'] before:absolute before:-inset-3 before:z-10',
      props.modelValue ? 'bg-mint' : 'bg-plum-faint',
    ]"
    @click="emit('update:modelValue', !props.modelValue)"
  >
    <span
      :class="[
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
        props.modelValue ? 'translate-x-5' : 'translate-x-0',
      ]"
    />
  </button>
</template>
