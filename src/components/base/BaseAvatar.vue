<script setup lang="ts">
/**
 * @component BaseAvatar
 * @description Circle avatar with initial letter fallback.
 */
import { computed } from 'vue'

const props = defineProps<{
  name?: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const initial = computed(() => {
  if (!props.name) return '?'
  return props.name.charAt(0).toUpperCase()
})

const sizeClasses = computed(() => {
  const map = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-20 w-20 text-2xl',
  }
  return map[props.size || 'md']
})
</script>

<template>
  <div
    class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-plum-faint font-body font-bold text-plum"
    :class="sizeClasses"
  >
    <img v-if="src" :src="src" :alt="name || 'Avatar'" class="h-full w-full object-cover" />
    <span v-else>{{ initial }}</span>
  </div>
</template>
