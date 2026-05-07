<script setup lang="ts">
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

import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
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
  id: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()

const actualId = computed(() => props.id || `input-${generatedId}`)
const hasError = computed(() => !!props.error)

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="actualId" class="font-body text-sm font-medium text-plum">
      {{ label }}
    </label>
    <input
      :id="actualId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :class="[
        'rounded-input border bg-white px-4 py-3 sm:py-2.5 font-body text-base text-plum outline-none transition-colors placeholder:text-plum-muted',
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
