<script setup lang="ts">
import { ref } from 'vue'
import { X as XIcon } from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  activeQueue: { name: string } | null
  resumeLink: string
  formattedStartedAt: string | null
}>()

const isBannerDismissed = ref(false)
const bannerX = ref(0)
const bannerY = ref(0)
const isDragging = ref(false)
let startX = 0
let startY = 0

function startDrag(e: MouseEvent | TouchEvent) {
  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return

  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  startX = clientX - bannerX.value
  startY = clientY - bannerY.value

  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', handleDrag)
  window.addEventListener('touchend', stopDrag)
}

function handleDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  bannerX.value = clientX - startX
  bannerY.value = clientY - startY
}

function stopDrag() {
  isDragging.value = false
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', stopDrag)
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="activeQueue && !isBannerDismissed"
      class="fixed top-35 left-1/2 -translate-x-1/2 z-40 px-6 w-full max-w-2xl pointer-events-none"
    >
      <div
        class="mx-auto flex items-center justify-between gap-4 rounded-[40px] border border-mint-light/30 bg-mint p-2 pl-6 shadow-xl pointer-events-auto cursor-grab active:cursor-grabbing select-none"
        :style="{ transform: `translate(${bannerX}px, ${bannerY}px)` }"
        @mousedown="startDrag"
        @touchstart.passive="startDrag"
      >
        <div class="flex items-center gap-4">
          <span class="relative flex h-3 w-3">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-plum opacity-75"
            />
            <span class="relative inline-flex h-3 w-3 rounded-full bg-plum" />
          </span>
          <div class="flex flex-col">
            <p class="font-body text-sm font-bold text-plum">{{ activeQueue.name }}</p>
            <p v-if="formattedStartedAt" class="font-body text-[10px] text-plum-soft">
              Started at {{ formattedStartedAt }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <router-link :to="resumeLink">
            <BaseButton
              size="sm"
              class="rounded-full px-4 py-2 text-xs font-bold bg-plum text-white hover:bg-plum-soft border-none"
              >Resume Dashboard</BaseButton
            >
          </router-link>
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center bg-plum-soft/10 hover:bg-plum-soft/20 text-plum transition-colors pointer-events-auto mr-1"
            @click="isBannerDismissed = true"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
