<script setup lang="ts">
/**
 * @component BasePillSelector
 * @description Segmented control / Pill group selector.
 * Standardizes timeframe/tab switching style across the app.
 *
 * @prop {Array} options - Array of { key, label }.
 * @prop {String|Number} modelValue - Current selected key (v-model).
 */

interface Option {
  key: string | number
  label: string
}

withDefaults(
  defineProps<{
    options?: Option[]
    modelValue?: string | number
    isLoading?: boolean
    skeletonCount?: number
  }>(),
  {
    options: () => [],
    modelValue: '',
    isLoading: false,
    skeletonCount: 2,
  },
)

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex gap-1 rounded-lg bg-plum-faint/50 p-0.5 w-fit h-fit">
    <template v-if="isLoading">
      <div
        v-for="i in skeletonCount"
        :key="i"
        class="h-[32px] w-16 animate-pulse rounded-md bg-white/50"
      />
    </template>
    <template v-else>
      <button
        v-for="option in options"
        :key="option.key"
        type="button"
        :class="[
          'flex items-center justify-center rounded-md px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wider transition-all duration-200 min-h-[32px]',
          modelValue === option.key
            ? 'bg-white text-plum shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
            : 'text-plum-muted hover:text-plum',
        ]"
        @click="emit('update:modelValue', option.key)"
      >
        {{ option.label }}
      </button>
    </template>
  </div>
</template>
