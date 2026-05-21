<script setup lang="ts">
import { Layers, Locate } from 'lucide-vue-next'

import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import BaseModal from '@/components/base/BaseModal.vue'
import LocationTroubleshooter from '@/components/common/LocationTroubleshooter.vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  venueLatitude: {
    type: Number,
    default: null,
  },
  venueLongitude: {
    type: Number,
    default: null,
  },
  isLocating: {
    type: Boolean,
    default: false,
  },
  isRefreshingLocation: {
    type: Boolean,
    default: false,
  },
  isSatellite: {
    type: Boolean,
    default: false,
  },
  geoError: {
    type: String,
    default: null,
  },
  accuracy: {
    type: Number,
    default: null,
  },
})

defineEmits(['close', 'toggle-map-type', 'refresh-location', 'confirm'])
</script>

<template>
  <BaseModal :is-open="isOpen" @close="$emit('close')">
    <div class="p-8 text-center">
      <!-- Padlock / Globe pulsing animation -->
      <div
        class="mx-auto mb-5 relative w-20 h-20 bg-mint-light rounded-full flex items-center justify-center"
      >
        <svg
          class="w-10 h-10 text-plum animate-pulse"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      <h3 class="font-display font-bold text-xl text-plum mb-3">On-Site Verification</h3>
      <p class="font-body text-sm text-plum-muted leading-relaxed mb-6">
        To ensure fair waiting times, this business requires guests to be physically present at the
        location to join the virtual queue.
      </p>

      <!-- Map Preview Card for Geofencing verification -->
      <div
        v-if="venueLatitude && venueLongitude"
        class="overflow-hidden rounded-2xl border border-plum-faint shadow-[0_4px_20px_rgba(26,10,46,0.04)] bg-white mb-6 animate-in fade-in zoom-in-95 duration-350"
      >
        <div class="h-44 w-full relative bg-sand overflow-hidden">
          <div
            id="leaflet-map"
            class="absolute inset-0 w-full h-[calc(100%+28px)] filter brightness-[0.98] contrast-[1.02]"
          />
          <!-- Floating Satellite Switch Button -->
          <button
            type="button"
            class="absolute top-3 left-3 z-[1000] h-8 px-2.5 rounded-full bg-white border border-plum-faint shadow-sm flex items-center gap-1 font-body text-[11px] font-semibold text-plum hover:bg-sand hover:scale-105 active:scale-95 transition-all duration-200"
            title="Toggle Map View"
            @click="$emit('toggle-map-type')"
          >
            <Layers class="w-3.5 h-3.5 text-plum" />
            <span>{{ isSatellite ? 'Street' : 'Satellite' }}</span>
          </button>
          <!-- Floating Recapture Button -->
          <button
            type="button"
            class="absolute top-3 right-3 z-[1000] w-8 h-8 rounded-full bg-white border border-plum-faint shadow-sm flex items-center justify-center text-plum hover:bg-sand hover:scale-105 active:scale-95 transition-all duration-200"
            title="Refresh My Location"
            :disabled="isRefreshingLocation"
            @click="$emit('refresh-location')"
          >
            <SpinnerLoadingIcon
              v-if="isRefreshingLocation"
              class="w-3.5 h-3.5 animate-spin text-mint"
            />
            <Locate v-else class="w-3.5 h-3.5 text-plum" />
          </button>
        </div>
      </div>

      <LocationTroubleshooter :geo-error="geoError" :accuracy="accuracy" class="mb-6" />

      <div class="flex flex-col gap-3 justify-center">
        <button
          type="button"
          class="rounded-xl border border-plum-faint font-body text-sm font-semibold text-plum hover:bg-sand transition-all h-12 w-full px-4 cursor-pointer"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isLocating"
          class="rounded-xl bg-mint font-body text-sm font-semibold text-on-mint shadow-[0_4px_12px_rgba(0,229,160,0.30)] hover:bg-mint-dark transition-all h-12 w-full px-4 cursor-pointer flex items-center justify-center gap-2"
          @click="$emit('confirm')"
        >
          <SpinnerLoadingIcon v-if="isLocating" class="w-4 h-4 animate-spin text-on-mint" />
          <span>{{ isLocating ? 'Verifying...' : 'Allow & Join' }}</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>
