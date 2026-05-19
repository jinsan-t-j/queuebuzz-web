<script setup lang="ts">
import { Layers, Locate } from 'lucide-vue-next'

import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'

defineProps({
  isSatellite: {
    type: Boolean,
    default: false,
  },
  isLocating: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-map-type', 'recapture'])
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-plum-faint shadow-[0_4px_20px_rgba(26,10,46,0.04)] bg-white animate-in fade-in zoom-in-95 duration-350"
  >
    <div class="h-44 w-full relative bg-sand overflow-hidden">
      <div
        id="leaflet-map"
        class="absolute inset-0 w-full h-[calc(100%+28px)] filter brightness-[0.98] contrast-[1.02]"
      />
      <!-- Floating Satellite Switch Button -->
      <button
        type="button"
        class="absolute top-3 left-3 z-[1000] h-9 px-3 rounded-full bg-white border border-plum-faint shadow-md flex items-center gap-1.5 font-body text-xs font-semibold text-plum hover:bg-sand hover:scale-105 active:scale-95 transition-all duration-200"
        title="Toggle Map View"
        @click="$emit('toggle-map-type')"
      >
        <Layers class="w-3.5 h-3.5 text-plum" />
        <span>{{ isSatellite ? 'Street Map' : 'Satellite' }}</span>
      </button>
      <!-- Floating Refocus Button -->
      <button
        type="button"
        class="absolute top-3 right-3 z-[1000] w-9 h-9 rounded-full bg-white border border-plum-faint shadow-md flex items-center justify-center text-plum hover:bg-sand hover:scale-105 active:scale-95 transition-all duration-200"
        title="Recapture Location"
        :disabled="isLocating"
        @click="$emit('recapture')"
      >
        <SpinnerLoadingIcon v-if="isLocating" class="w-4 h-4 animate-spin text-mint" />
        <Locate v-else class="w-4 h-4 text-plum" />
      </button>
    </div>
  </div>
</template>
