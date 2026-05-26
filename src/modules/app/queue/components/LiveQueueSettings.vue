<script setup lang="ts">
/**
 * @component LiveQueueSettings
 * @description Modal for updating active queue settings.
 * Includes Queue Name and Avg. Service Time.
 */
import { useField, useForm } from 'vee-validate'
import { computed, onUnmounted, ref, watch } from 'vue'
import * as yup from 'yup'

import TimeIcon from '@/assets/icons/clock-time.svg?component'
import CloseIcon from '@/assets/icons/close-x.svg?component'
import navSettingsIcon from '@/assets/icons/nav-settings.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'
import BaseToggle from '@/components/base/BaseToggle.vue'
import LocationTroubleshooter from '@/components/common/LocationTroubleshooter.vue'
import { useToast } from '@/composables/useToast'
import { fetchCurrentPlan, type BillingPlan } from '@/modules/app/billing/actions/billing.actions'
import LocationVerifiedCard from '@/modules/app/queue/components/LocationVerifiedCard.vue'
import MapPreviewCard from '@/modules/app/queue/components/MapPreviewCard.vue'
import type { QueueRecord } from '@/modules/app/queue/types'
import { useLocation } from '@/modules/customer/composables/useLocation'

const props = defineProps<{
  isOpen: boolean
  queue: QueueRecord | null
  isLoading?: boolean
  manualPositioning?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', values: SubmitValues): void
  (e: 'update:is-open', value: boolean): void
}>()

interface SubmitValues {
  name: string
  avgServiceMins: number
  strictQueueMode: boolean
  isGeoLocked?: boolean
  latitude?: number
  longitude?: number
  geoRadiusMeters?: number
}

const suggestions = ref(['Consultation', 'Food Order', 'Token', 'Registration', 'Service'])
const { showToast } = useToast()
const currentPlan = ref<BillingPlan | null>(null)

const schema = yup.object({
  queueName: yup
    .string()
    .required('Queue name is required')
    .min(3, 'At least 3 characters')
    .max(50, 'At least 50 characters'),
  avgServiceMins: yup.number().required('Service time is required').min(1).max(60),
  strictQueueMode: yup.boolean(),
  isGeoLocked: yup.boolean(),
  latitude: yup
    .number()
    .nullable()
    .when('isGeoLocked', {
      is: true,
      then: (schema) => schema.required('Latitude is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  longitude: yup
    .number()
    .nullable()
    .when('isGeoLocked', {
      is: true,
      then: (schema) => schema.required('Longitude is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  geoRadiusMeters: yup.number().default(100),
})

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    queueName: props.queue?.name || '',
    avgServiceMins: props.queue?.avgServiceMins || 5,
    strictQueueMode: props.queue?.strictQueueMode || false,
    isGeoLocked: props.queue?.isGeoLocked || false,
    latitude: props.queue?.latitude || null,
    longitude: props.queue?.longitude || null,
    geoRadiusMeters: props.queue?.geoRadiusMeters || 100,
  },
})

const { value: queueName } = useField<string>('queueName')
const { value: avgServiceMins } = useField<number>('avgServiceMins')
const { value: strictQueueMode } = useField<boolean>('strictQueueMode')
const { value: isGeoLocked } = useField<boolean>('isGeoLocked')
const { value: latitude } = useField<number | null>('latitude')
const { value: longitude } = useField<number | null>('longitude')
const { value: geoRadiusMeters } = useField<number>('geoRadiusMeters')

const {
  isLocating,
  isSatellite,
  locationName,
  isFetchingPlace,
  fetchPlaceName,
  toggleMapType,
  initLeafletMap,
  destroyLeafletMap,
  captureLocation,
  geoError,
  accuracy,
} = useLocation(latitude, longitude)

const recaptureLocation = async () => {
  const pos = await captureLocation()
  if (pos) {
    showToast('Successfully captured business location coordinates!', { type: 'success' })
    fetchPlaceName(pos.latitude, pos.longitude)
    initLeafletMap('leaflet-map', null, null, 200, { draggable: true })
  } else {
    showToast(
      geoError.value ||
        'Location permission is required to enable Geo-Lockdown. Please allow location access in your browser.',
      { type: 'error' },
    )
  }
}

// Sync with prop updates
watch(
  () => props.queue,
  (newQueue) => {
    if (newQueue) {
      resetForm({
        values: {
          queueName: newQueue.name,
          avgServiceMins: newQueue.avgServiceMins,
          strictQueueMode: newQueue.strictQueueMode || false,
          isGeoLocked: newQueue.isGeoLocked || false,
          latitude: newQueue.latitude || null,
          longitude: newQueue.longitude || null,
          geoRadiusMeters: newQueue.geoRadiusMeters || 100,
        },
      })
      if (newQueue.isGeoLocked && newQueue.latitude && newQueue.longitude) {
        fetchPlaceName(newQueue.latitude, newQueue.longitude)
      } else {
        locationName.value = ''
      }
    }
  },
  { immediate: true },
)

watch(isGeoLocked, async (newValue) => {
  if (newValue) {
    if (!currentPlan.value?.limits?.allowGeoLock) {
      showToast(
        'Geo-Lockdown is a premium feature. Please upgrade your plan to unlock this feature.',
        { type: 'warning' },
      )
      isGeoLocked.value = false
      return
    }
    if (latitude.value !== null && longitude.value !== null) {
      fetchPlaceName(latitude.value, longitude.value)
      return
    }

    recaptureLocation()
  } else {
    latitude.value = null
    longitude.value = null
    locationName.value = ''
    destroyLeafletMap()
  }
})

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      try {
        currentPlan.value = await fetchCurrentPlan()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch current plan:', err)
      }
      if (isGeoLocked.value && latitude.value && longitude.value) {
        setTimeout(() => {
          initLeafletMap('leaflet-map', null, null, 200, { draggable: true })
        }, 150)
      }
    } else {
      destroyLeafletMap()
    }
  },
  { immediate: true },
)

watch([latitude, longitude], ([newLat, newLng]) => {
  if (newLat && newLng && props.isOpen) {
    setTimeout(() => {
      initLeafletMap('leaflet-map', null, null, 200, { draggable: true })
    }, 150)
  } else {
    destroyLeafletMap()
  }
})

onUnmounted(() => {
  destroyLeafletMap()
})

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name: values.queueName,
    avgServiceMins: values.avgServiceMins,
    strictQueueMode: values.strictQueueMode,
    isGeoLocked: values.isGeoLocked,
    latitude: values.latitude || undefined,
    longitude: values.longitude || undefined,
    geoRadiusMeters: values.isGeoLocked ? Number(values.geoRadiusMeters) : undefined,
  })
})

const canSubmit = computed(() => {
  return meta.value.dirty && meta.value.valid && !props.isLoading
})

function selectSuggestion(suggestion: string) {
  queueName.value = suggestion
}
</script>

<template>
  <div class="fixed inset-0 z-[100] pointer-events-none" :class="{ 'pointer-events-auto': isOpen }">
    <!-- Overlay Backdrop -->
    <div
      class="absolute inset-0 bg-plum/20 backdrop-blur-[2px] transition-opacity duration-300 ease-out"
      :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      @click="emit('close')"
    />

    <!-- Right Sidebar Drawer Panel -->
    <div
      class="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-sand border-l border-plum-faint shadow-[-8px_0_40px_rgba(26,10,46,0.12)] flex flex-col transition-all duration-300 ease-out h-full overflow-hidden pointer-events-auto"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header (Sticky) -->
      <div
        class="px-6 py-5 bg-white border-b border-plum-faint flex items-center justify-between shrink-0"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-plum/5 dark:bg-plum-faint/10"
          >
            <navSettingsIcon class="h-5 w-5 text-plum" />
          </div>
          <h2 class="font-display text-xl font-bold tracking-tight text-plum">Queue Settings</h2>
        </div>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full bg-sand dark:bg-plum-faint/20 text-plum/30 transition-colors hover:text-plum cursor-pointer"
          @click="emit('close')"
        >
          <CloseIcon class="h-4 w-4" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <form id="settings-form" class="space-y-6" @submit.prevent="onSubmit">
          <!-- Queue Name -->
          <BaseCard padding="md" class="space-y-4">
            <BaseInput
              id="editQueueName"
              v-model="queueName"
              label="Queue Name"
              placeholder="What are people queuing for?"
              :error="errors.queueName"
            />

            <div class="flex flex-wrap gap-2 mt-2">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                type="button"
                class="rounded-full border border-plum-faint dark:border-plum-faint/50 px-3 py-1 font-body text-xs font-medium text-plum/60 transition-colors hover:bg-plum-faint dark:hover:bg-plum-faint/20 hover:text-plum cursor-pointer"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </BaseCard>

          <!-- Avg Service Time -->
          <BaseCard padding="md" class="space-y-4">
            <div class="flex items-center justify-between">
              <label for="avgServiceMins" class="block font-body text-sm font-semibold text-plum">
                Service Duration Estimator
              </label>
              <div class="flex items-center gap-1.5 rounded-lg bg-mint/10 px-2 py-1">
                <TimeIcon class="h-3 w-3 text-mint" />
                <span class="font-body text-sm font-semibold text-mint">{{ avgServiceMins }}m</span>
              </div>
            </div>
            <p class="font-body text-xs text-plum-muted leading-relaxed">
              How long does it typically take to serve one guest? This is only used for calculating
              estimated wait times.
            </p>
            <div class="mt-2">
              <BaseSlider
                id="avgServiceMins"
                v-model="avgServiceMins"
                :min="1"
                :max="60"
                :step="1"
              />
              <div class="flex justify-between font-body text-xs text-plum-muted mt-1">
                <span>Quick (1m)</span>
                <span>Relaxed (60m)</span>
              </div>
            </div>
          </BaseCard>

          <!-- Strict Calling Mode -->
          <BaseCard padding="md">
            <div class="flex items-center justify-between gap-4">
              <div class="flex flex-col gap-1">
                <label
                  for="strictQueueMode"
                  class="block font-body text-sm font-semibold text-plum"
                >
                  Strict Calling Mode
                </label>
                <p class="font-body text-xs text-plum-muted leading-relaxed">
                  Enforces strict ordering by preventing the host from calling the next guest until
                  the currently active guest is served or skipped.
                </p>
              </div>
              <BaseToggle
                id="strictQueueMode"
                v-model="strictQueueMode"
                aria-label="Toggle strict queue mode"
              />
            </div>
          </BaseCard>

          <!-- Geo Fence (Premium) -->
          <BaseCard
            padding="md"
            class="relative overflow-hidden transition-all duration-300"
            :class="{ 'border-mint/30 shadow-[0_4px_20px_rgba(0,229,160,0.05)]': isGeoLocked }"
          >
            <!-- Premium Sparkle Badge -->
            <div
              class="absolute top-0 right-0 bg-mint-light text-plum font-body text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider"
            >
              Premium
            </div>

            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 pr-12 space-y-1">
                <label
                  for="editIsGeoLocked"
                  class="block font-body text-sm font-semibold text-plum"
                >
                  Geo Fence
                </label>
                <p class="font-body text-xs text-plum-muted leading-relaxed">
                  Restrict queue entry strictly to customers physically present within a specific
                  radius of your coordinates. Prevents remote joining.
                </p>
              </div>
              <BaseToggle
                id="editIsGeoLocked"
                v-model="isGeoLocked"
                aria-label="Toggle Geo Fence"
                :class="{ 'opacity-50': isLocating }"
                :disabled="isLocating"
              />
            </div>

            <!-- Geolocation details / loading -->
            <div
              v-if="isLocating || isGeoLocked"
              class="mt-6 pt-6 border-t border-plum-faint animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <!-- Location Troubleshooter / Warning Panel -->
              <LocationTroubleshooter :geo-error="geoError" :accuracy="accuracy" class="mb-4" />

              <div
                v-if="isLocating && !latitude && !longitude"
                class="flex items-center gap-3 py-2 text-plum-muted font-body text-sm"
              >
                <SpinnerLoadingIcon class="h-5 w-5 animate-spin text-mint shrink-0" />
                <span>Fetching coordinates... Please allow location access in your browser.</span>
              </div>

              <div v-if="latitude && longitude" class="flex flex-col gap-5">
                <!-- Location Address Display -->
                <LocationVerifiedCard
                  :is-fetching-place="isFetchingPlace"
                  :location-name="locationName"
                />

                <!-- Map Preview Card -->
                <MapPreviewCard
                  :is-satellite="isSatellite"
                  :is-locating="isLocating"
                  @toggle-map-type="toggleMapType"
                  @recapture="recaptureLocation"
                />

                <!-- Lockdown Radius Customization -->
                <div class="space-y-4">
                  <label
                    for="editGeoRadiusMeters"
                    class="block font-body text-sm font-semibold text-plum"
                  >
                    Allowed Lockdown Radius:
                    <span class="text-mint font-bold">{{ geoRadiusMeters }} meters</span>
                  </label>

                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="radiusVal in [50, 100, 200, 500, 1000]"
                      :key="radiusVal"
                      type="button"
                      :class="[
                        'px-4 py-2 rounded-xl font-body text-sm transition-all cursor-pointer',
                        geoRadiusMeters === radiusVal
                          ? 'bg-plum text-sand font-semibold'
                          : 'border border-plum-faint text-plum-muted hover:border-plum hover:bg-sand',
                      ]"
                      @click="geoRadiusMeters = radiusVal"
                    >
                      {{ radiusVal }}m
                    </button>
                  </div>

                  <div class="relative w-full flex flex-col pt-2">
                    <input
                      id="editGeoRadiusMeters"
                      v-model.number="geoRadiusMeters"
                      type="range"
                      min="20"
                      max="1000"
                      step="10"
                      aria-label="Lockdown radius in meters"
                      class="w-full accent-mint h-2 bg-plum/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="mt-2 flex justify-between font-body text-xs text-plum-muted">
                      <span>20 meters</span>
                      <span>1,000 meters (1km)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </form>
      </div>

      <!-- Footer (Sticky) -->
      <div
        class="p-6 bg-white border-t border-plum-faint flex items-center justify-end gap-3 shrink-0"
      >
        <BaseButton type="button" variant="ghost" class="cursor-pointer" @click="$emit('close')">
          Cancel
        </BaseButton>
        <BaseButton
          type="submit"
          form="settings-form"
          variant="primary"
          :is-loading="isLoading"
          :disabled="!canSubmit"
          class="cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <SpinnerLoadingIcon v-if="isLoading" class="h-4 w-4 animate-spin" />
            <span>Save Changes</span>
          </div>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
