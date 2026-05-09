<script setup lang="ts">
/**
 * @component BaseSlider
 * @description Presentational range slider with custom styling.
 */
interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  ariaLabel?: string
  id?: string
}

withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  ariaLabel: 'Range slider',
  id: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', Number.parseInt(target.value, 10))
}
</script>

<template>
  <div class="relative w-full py-4">
    <div class="relative h-[6px] w-full rounded-full bg-plum/5">
      <!-- Active Track -->
      <div
        class="absolute left-0 top-0 h-full rounded-full bg-mint"
        :style="{ width: `${((modelValue - min) / (max - min)) * 100}%` }"
      />

      <!-- Input -->
      <input
        :id="id"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :aria-label="ariaLabel"
        class="absolute -top-[7px] left-0 h-5 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-mint-light [&::-webkit-slider-thumb]:bg-mint [&::-webkit-slider-thumb]:shadow-lg"
        @input="handleInput"
      />
    </div>
  </div>
</template>

<style scoped>
/* Slider baseline Reset */
input[type='range']::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  background: transparent;
  border-radius: 0;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -2px; /* Centers thumb vertically if track is thicker? */
  box-shadow: 0 4px 12px rgba(0, 229, 160, 0.4);
}
</style>
