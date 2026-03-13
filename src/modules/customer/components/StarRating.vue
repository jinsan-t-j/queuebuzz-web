<script setup>
/**
 * @component StarRating
 * @description Interactive star rating component with hover and click support.
 * Matches Figma — filled stars in #00d1b2 (teal), unfilled with subtle border.
 *
 * @prop {Number} maxStars - Maximum number of stars.
 * @prop {Number} initialRating - Default selected rating.
 * @emits {update:rating} - Emitted when rating changes.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 6. Props
const props = defineProps({
  maxStars: { type: Number, default: 5 },
  initialRating: { type: Number, default: 3 },
})

// 7. Emits
const emit = defineEmits(['update:rating'])

// 9. Reactive state
const rating = ref(props.initialRating)
const hover = ref(0)

// 11. Methods
function setRating(val) {
  rating.value = val
  emit('update:rating', val)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      v-for="star in maxStars"
      :key="star"
      @click="setRating(star)"
      @mouseenter="hover = star"
      @mouseleave="hover = 0"
    >
      <!-- Filled star -->
      <svg
        v-if="(hover || rating) >= star"
        class="h-7 w-7 transition-colors"
        viewBox="0 0 24 24"
        fill="#00d1b2"
        stroke="#00d1b2"
        stroke-width="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <!-- Empty star -->
      <svg
        v-else
        class="h-7 w-7 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(26,10,46,0.10)"
        stroke-width="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  </div>
</template>
