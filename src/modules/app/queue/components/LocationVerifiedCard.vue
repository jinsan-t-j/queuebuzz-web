<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'

import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'

defineProps({
  isFetchingPlace: {
    type: Boolean,
    default: false,
  },
  locationName: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div
    v-if="isFetchingPlace || locationName"
    class="flex items-center gap-3 p-4 bg-mint-light/40 border border-[#B4FBE4] rounded-2xl text-plum text-left"
  >
    <div
      class="w-10 h-10 rounded-xl bg-white border border-[#B4FBE4] flex items-center justify-center shrink-0"
    >
      <MapPin class="w-5 h-5 text-plum" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-mint animate-pulse" />
        <span class="font-body text-sm font-medium text-plum">Location Verified</span>
      </div>
      <div v-if="isFetchingPlace" class="flex items-center gap-2 mt-0.5">
        <SpinnerLoadingIcon class="h-3.5 w-3.5 animate-spin text-plum-muted shrink-0" />
        <span class="font-body text-sm text-plum-muted animate-pulse"
          >Reverse geocoding address...</span
        >
      </div>
      <p
        v-else
        class="font-body text-sm font-semibold text-plum truncate mt-0.5"
        :title="locationName"
      >
        {{ locationName }}
      </p>
    </div>
  </div>
</template>
