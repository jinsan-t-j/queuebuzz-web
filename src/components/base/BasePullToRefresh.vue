<script setup lang="ts">
/**
 * @component BasePullToRefresh
 * @description A wrapper component that adds pull-to-refresh functionality.
 * Uses native touch events for smooth mobile interaction.
 *
 * @prop {Boolean} isRefreshing - Current refreshing state (manual control if needed).
 * @emits {refresh} - Emitted when pull distance exceeds threshold.
 */
import { RefreshCw } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isRefreshing: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh'])

const container = ref<HTMLElement | null>(null)
const pullDistance = ref(0)
const isPulling = ref(false)
const THRESHOLD = 70
const MAX_PULL = 120

let startY = 0

function handleTouchStart(e: TouchEvent) {
  if (props.disabled || props.isRefreshing) return
  // Only allow pull to refresh if we are at the top of the container
  const scrollContainer = container.value?.closest('.overflow-y-auto') || document.documentElement
  if (scrollContainer.scrollTop > 0) return

  startY = e.touches[0].pageY
  isPulling.value = true
}

function handleTouchMove(e: TouchEvent) {
  if (!isPulling.value) return

  const currentY = e.touches[0].pageY
  const diff = currentY - startY

  if (diff > 0) {
    // Prevent default scroll if pulling down
    if (e.cancelable) e.preventDefault()

    // Apply resistance
    pullDistance.value = Math.min(diff * 0.5, MAX_PULL)
  } else {
    pullDistance.value = 0
    isPulling.value = false
  }
}

function handleTouchEnd() {
  if (!isPulling.value) return

  if (pullDistance.value >= THRESHOLD) {
    emit('refresh')
  }

  isPulling.value = false
  pullDistance.value = 0
}

onMounted(() => {
  if (container.value) {
    container.value.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.value.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.value.addEventListener('touchend', handleTouchEnd)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('touchstart', handleTouchStart)
    container.value.removeEventListener('touchmove', handleTouchMove)
    container.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<template>
  <div ref="container" class="relative min-h-full">
    <!-- Pull Indicator -->
    <div
      class="pointer-events-none absolute left-0 right-0 z-50 flex justify-center transition-transform duration-200"
      :style="{
        transform: `translateY(${Math.min(pullDistance, THRESHOLD)}px)`,
        opacity: Math.min(pullDistance / THRESHOLD, 1),
        top: '-40px',
      }"
    >
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-plum-faint text-plum"
      >
        <RefreshCw
          class="h-5 w-5"
          :class="{ 'animate-spin': isRefreshing, 'transition-transform': !isRefreshing }"
          :style="{ transform: isRefreshing ? '' : `rotate(${pullDistance * 3}deg)` }"
        />
      </div>
    </div>

    <!-- Content -->
    <div
      class="transition-transform duration-200 ease-out"
      :style="{ transform: pullDistance > 0 ? `translateY(${pullDistance * 0.5}px)` : '' }"
    >
      <slot />
    </div>
  </div>
</template>
