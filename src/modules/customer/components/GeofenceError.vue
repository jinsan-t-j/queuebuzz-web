<script setup>
/**
 * @component GeofenceError
 * @description Shows a geofence error when the customer is too far from the queue location.
 * Matches the Figma "Location Error Screen" design.
 *
 * @prop {Number} distanceMeters - Distance from queue in meters.
 * @emits {retry-geofence} - Emitted when "Try Again" is clicked.
 */

// 5. Component imports
import LocationPinBrokenIcon from '@/assets/icons/location-pin-broken.svg?component'

// 6. Props
defineProps({
  distanceMeters: { type: Number, default: 450 },
})

// 7. Emits
const emit = defineEmits(['retry-geofence'])
</script>

<template>
  <div class="flex flex-col px-5 py-4">
    <!-- Error card with orange border -->
    <div class="rounded-3xl border border-warning bg-white p-6 text-center">
      <LocationPinBrokenIcon class="mx-auto h-6 w-6 text-plum-muted" />
      <h2 class="mt-3 font-body text-[22px] font-semibold text-plum-soft">You're too far away</h2>
      <p class="mt-2 font-body text-sm text-[#5d4c66]">
        Move closer to the queue location &amp; try again
      </p>
      <div class="mx-auto mt-4 w-fit rounded-full bg-plum-faint px-4 py-1.5">
        <span class="font-body text-sm text-[#5d4c66]">
          ~{{ distanceMeters }}m away · Need to be within 200m
        </span>
      </div>
    </div>

    <!-- Try Again CTA -->
    <button
      class="mt-8 flex h-[60px] w-full items-center justify-center rounded-2xl bg-mint font-body text-base font-bold text-plum shadow-[0_8px_24px_rgba(0,229,160,0.50)] transition-all hover:shadow-[0_12px_32px_rgba(0,229,160,0.60)]"
      @click="emit('retry-geofence')"
    >
      Try Again
    </button>
  </div>
</template>
