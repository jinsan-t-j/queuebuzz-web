<script setup>
/**
 * @component BaseInput
 * @description Reusable text input with label, error state, and v-model support.
 *
 * @prop {String} modelValue - Current input value (v-model).
 * @prop {String} label - Label text displayed above the input.
 * @prop {String} placeholder - Placeholder text.
 * @prop {String} type - Input type attribute.
 * @prop {String} error - Error message to display below the input.
 * @prop {Boolean} isDisabled - Disables the input.
 * @emits {update:modelValue} - Emitted when the input value changes.
 */

// 1. Vue core imports
import { computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports

// 6. Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})

// 7. Emits
const emit = defineEmits(['update:modelValue'])

// 8. Composable destructuring

// 9. Reactive state

// 10. Computed properties
const hasError = computed(() => !!props.error)

// 11. Methods
function handleInput(event) {
  emit('update:modelValue', event.target.value)
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="font-body text-sm font-medium text-plum">
      {{ label }}
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :class="[
        'rounded-input border px-4 py-2.5 font-body text-sm text-plum outline-none transition-colors placeholder:text-plum-muted',
        hasError
          ? 'border-danger focus:ring-2 focus:ring-danger/20'
          : 'border-plum-faint focus:border-mint focus:ring-2 focus:ring-mint/20',
        { 'cursor-not-allowed opacity-50': isDisabled },
      ]"
      @input="handleInput"
    />
    <p v-if="hasError" class="font-body text-sm text-danger">
      {{ error }}
    </p>
  </div>
</template>
