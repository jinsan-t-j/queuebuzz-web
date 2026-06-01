<script setup lang="ts">
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useField, useForm } from 'vee-validate'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'

import CopyCodeIcon from '@/assets/icons/copy-code.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import BaseToggle from '@/components/base/BaseToggle.vue'
import LocationTroubleshooter from '@/components/common/LocationTroubleshooter.vue'
import { useToast } from '@/composables/useToast'
import { APP_BASE_URL } from '@/config/api.constants'
import { fetchSubscription, type Subscription } from '@/modules/app/billing/actions/billing.actions'
import {
  checkSlugAvailability,
  createQueue,
  terminateQueue,
} from '@/modules/app/queue/actions/queue.action'
import ActiveQueueConflictModal from '@/modules/app/queue/components/ActiveQueueConflictModal.vue'
import LocationVerifiedCard from '@/modules/app/queue/components/LocationVerifiedCard.vue'
import MapPreviewCard from '@/modules/app/queue/components/MapPreviewCard.vue'
import { SLUG_REGEX } from '@/modules/app/queue/utils/validation'
import { useLocation } from '@/modules/customer/composables/useLocation'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useQueueStore } from '@/stores/queue.store'
import { useSettingsStore } from '@/stores/settings.store'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (val: string) => ['host', 'guest'].includes(val),
  },
})

const emit = defineEmits(['queue-created'])

const subscription = ref<Subscription | null>(null)

const { showToast } = useToast()

const router = useRouter()
const queueStore = useQueueStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { userSettings } = storeToRefs(settingsStore)

onMounted(async () => {
  if (props.role === 'host') {
    fetchSubscription().then((sub) => {
      subscription.value = sub
    })
    if (!userSettings.value) {
      await settingsStore.fetchSettings()
    }
    if (userSettings.value) {
      queueName.value = userSettings.value.settings?.defaultQueueName || 'Main Queue'
      serviceTime.value = userSettings.value.settings?.avgServiceMins || 5
      collectEmails.value = userSettings.value.settings?.collectEmails ?? false
      slug.value = userSettings.value.slug || ''
    }
  }

  queueNameInput.value?.focus()
})

const suggestions = ref(['Consultation', 'Food Order', 'Token', 'Registration', 'Service'])
const isSubmitting = ref(false)

const schema = computed(() => {
  const baseSchema = {
    queueName: yup
      .string()
      .required('Queue name is required')
      .max(50, 'Queue name must be at most 50 characters'),
    serviceTime: yup.number().required('Service time is required').min(1).max(30),
    allowPartyJoining: yup.boolean().default(false),
    maxPartySize: yup.number().when('allowPartyJoining', {
      is: true,
      then: (schema) => schema.required('Limit is required').min(1).max(50),
      otherwise: (schema) => schema.notRequired(),
    }),
    manualPositioning: yup.boolean().default(false),
    collectEmails: yup.boolean().default(false),
    isGeoLocked: yup.boolean().default(false),
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
  }

  if (props.role === 'host') {
    return yup.object({
      ...baseSchema,
      slug: yup.string().nullable().matches(SLUG_REGEX, {
        excludeEmptyString: true,
        message: 'Must be 3-30 lowercase alphanumeric characters or hyphens',
      }),
    })
  } else {
    return yup.object(baseSchema)
  }
})

const { handleSubmit, errors, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    queueName: null,
    serviceTime: 5,
    allowPartyJoining: false,
    maxPartySize: 5,
    manualPositioning: false,
    slug: null,
    collectEmails: false,
    isGeoLocked: false,
    latitude: null,
    longitude: null,
    geoRadiusMeters: 100,
  },
})

// Fields setup
const { value: queueName } = useField<string | null>('queueName')
const { value: serviceTime } = useField<number>('serviceTime')
const { value: allowPartyJoining } = useField<boolean>('allowPartyJoining')
const { value: maxPartySize } = useField<number>('maxPartySize')
const { value: manualPositioning } = useField<boolean>('manualPositioning')
const { value: slug } = useField<string | null>('slug')
const { value: collectEmails } = useField<boolean>('collectEmails')
const { value: isGeoLocked } = useField<boolean>('isGeoLocked')
const { value: latitude } = useField<number | null>('latitude')
const { value: longitude } = useField<number | null>('longitude')
const { value: geoRadiusMeters } = useField<number>('geoRadiusMeters')

const queueNameInput = ref<HTMLInputElement | null>(null)

function selectSuggestion(suggestion) {
  queueName.value = suggestion
}

const isCheckingSlug = ref(false)

const checkSlug = useDebounceFn(async (currentSlug) => {
  if (!currentSlug) return
  try {
    const isAvailable = await checkSlugAvailability(currentSlug)
    if (isAvailable) {
      setFieldError('slug', undefined)
    } else {
      setFieldError('slug', 'This link is already taken')
    }
  } catch (err) {
    const error = err as Error
    if (error.message.includes('invalid slug format')) {
      setFieldError('slug', 'Must be 3-30 lowercase alphanumeric characters or hyphens')
    } else {
      setFieldError('slug', error.message)
    }
  } finally {
    isCheckingSlug.value = false
  }
}, 500)

watch(slug, (newSlug) => {
  if (newSlug) {
    if (errors.value.slug) setFieldError('slug', undefined)
    isCheckingSlug.value = true
    checkSlug(newSlug)
  } else {
    isCheckingSlug.value = false
  }
})

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

watch(isGeoLocked, async (newValue) => {
  if (newValue) {
    if (!subscription.value?.allowGeoLock) {
      showToast(
        'Geo-Lockdown is a premium feature. Please upgrade your plan to unlock this feature.',
        { type: 'warning' },
      )
      isGeoLocked.value = false
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

watch([latitude, longitude], ([newLat, newLng]) => {
  if (newLat && newLng) {
    setTimeout(() => {
      initLeafletMap('leaflet-map', null, null, 200, { draggable: true })
    }, 100)
  } else {
    destroyLeafletMap()
  }
})

onUnmounted(() => {
  destroyLeafletMap()
})

const showConflictModal = ref(false)
const conflictingQueueId = ref('')

interface FormValues {
  queueName: string | null
  serviceTime: number
  slug: string | null
  allowPartyJoining: boolean
  maxPartySize: number
  manualPositioning: boolean
  collectEmails: boolean
  isGeoLocked: boolean
  latitude: number | null
  longitude: number | null
  geoRadiusMeters: number
}

const pendingValues = ref<FormValues | null>(null)

async function handleResume() {
  showConflictModal.value = false
  if (props.role === 'guest') {
    router.push({
      name: 'guest-host-live-queue',
      params: { id: conflictingQueueId.value },
    })
  } else {
    router.push({ name: 'dashboard' })
  }
}

async function submitQueueCreation(formValues: FormValues) {
  const payload = {
    name: formValues.queueName || 'Main Queue',
    avgServiceMins: Number(formValues.serviceTime),
    slug: formValues.slug || undefined,
    allowPartyJoining: formValues.allowPartyJoining,
    maxPartySize: formValues.allowPartyJoining ? Number(formValues.maxPartySize) : 1,
    manualPositioning: formValues.manualPositioning,
    collectEmails: formValues.collectEmails,
    isGeoLocked: formValues.isGeoLocked,
    latitude: formValues.latitude || undefined,
    longitude: formValues.longitude || undefined,
    geoRadiusMeters: formValues.isGeoLocked ? Number(formValues.geoRadiusMeters) : undefined,
  }
  const queue = await createQueue(payload)
  if (queue) {
    if (props.role === 'guest') {
      authStore.setAnonymousHostSession(queue.id)
    }
    useDashboardStore().setDirty()
    return queue
  }
  return null
}

async function handleForceCreate() {
  showConflictModal.value = false
  isSubmitting.value = true
  try {
    await terminateQueue(conflictingQueueId.value)
    queueStore.clearQueue()
    if (pendingValues.value) {
      const queue = await submitQueueCreation(pendingValues.value)
      if (queue) {
        if (props.role === 'guest') {
          queueStore.setActiveQueue(queue)
          router.push({
            name: 'guest-host-live-queue',
            params: { id: queue.id },
          })
        } else {
          emit('queue-created', queue)
          queueStore.setActiveQueue(queue)
        }
      }
    }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string } }; message?: string }
    const msg = error.response?.data?.error || error.message || 'Something went wrong'
    showToast(msg, { type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const onSubmit = handleSubmit(async (values) => {
  if (errors.value.slug || isCheckingSlug.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const queue = await submitQueueCreation(values as FormValues)
    if (queue) {
      emit('queue-created', queue)
      queueStore.setActiveQueue(queue)
    }
  } catch (err: unknown) {
    const error = err as {
      response?: { data?: { error?: string; code?: string; queue_id?: string } }
      message?: string
    }
    if (error.response?.data?.code === 'ACTIVE_QUEUE_EXISTS' && error.response?.data?.queue_id) {
      pendingValues.value = values as FormValues
      conflictingQueueId.value = error.response.data.queue_id
      showConflictModal.value = true
    } else {
      const msg = error.response?.data?.error || error.message || 'Something went wrong'
      showToast(msg, { type: 'error' })
    }
  } finally {
    isSubmitting.value = false
  }
})

function handleCancel() {
  router.back()
}

// Clipboard setups for Host view's slug and Success Modal
const { copy: copyToClipboard } = useClipboard()
const isSlugCopied = ref(false)

function copyCustomLink() {
  const customLink = `${APP_BASE_URL}/${slug.value}`
  copyToClipboard(customLink)
  isSlugCopied.value = true
  setTimeout(() => (isSlugCopied.value = false), 2000)
}

const windowHost = globalThis.window === undefined ? '' : globalThis.location.host
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="mt-8 flex flex-col gap-5">
      <!-- ═══ Card 1: Queue Name ═══ -->
      <div
        class="rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-sm dark:shadow-none"
      >
        <label for="queueName" class="mb-3 block font-body text-sm font-medium text-plum-muted">
          Queue Name
        </label>
        <input
          id="queueName"
          ref="queueNameInput"
          v-model="queueName"
          placeholder="What are people queuing for?"
          class="mb-2 w-full border-none bg-transparent font-display text-base sm:text-xl font-semibold text-plum placeholder:text-plum-muted/30 outline-none"
          :class="{
            'placeholder:text-red-500/50 text-red-500': errors.queueName,
            'text-plum': !errors.queueName,
          }"
        />
        <div v-if="errors.queueName" class="mb-3 font-body text-sm text-red-500">
          {{ errors.queueName }}
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            class="rounded-full border border-plum-faint px-4 py-1.5 font-body text-sm font-medium text-plum-muted transition-colors hover:bg-plum-faint cursor-pointer"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- ═══ Card 2: Service Time ═══ -->
      <div
        class="rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-sm dark:shadow-none relative"
      >
        <label
          for="serviceTime"
          class="block font-body text-sm font-medium text-plum-muted leading-snug mb-4"
        >
          How many minutes on average does it take to serve one guest?
        </label>

        <div class="mt-8 flex flex-col gap-4 relative">
          <!-- Value callout tooltip over slider -->
          <div class="flex flex-col relative w-full">
            <div
              class="absolute -top-[37px] -translate-x-1/2 rounded-[5px] border border-plum-faint px-3 py-1.5 font-body text-sm font-semibold text-plum shadow-sm dark:shadow-none transition-all bg-white whitespace-nowrap"
              :style="{
                left: `calc(${((Number(serviceTime) - 1) / 29) * 100}% + (${12 - ((Number(serviceTime) - 1) / 29) * 24}px))`,
              }"
            >
              {{ serviceTime }} min
            </div>

            <input
              id="serviceTime"
              v-model.number="serviceTime"
              type="range"
              min="1"
              max="30"
              aria-label="Service time in minutes"
              class="w-full accent-mint h-2 bg-plum/10 rounded-lg appearance-none cursor-pointer"
            />

            <div class="mt-2 flex justify-between font-body text-sm text-plum-muted">
              <span>1 min</span>
              <span>30 min</span>
            </div>
            <div v-if="errors.serviceTime" class="mt-1 font-body text-sm text-red-500">
              {{ errors.serviceTime }}
            </div>
          </div>
        </div>
        <p class="mt-4 font-body text-xs text-plum-muted">
          This will help us estimate the wait times more accurately.
        </p>
      </div>

      <!-- ═══ Card 3: Party Settings ═══ -->
      <div
        class="rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-sm dark:shadow-none"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <label
              for="allowPartyJoining"
              class="block font-body text-sm font-medium text-plum-muted leading-snug"
            >
              Would you like to allow guests to book together as a group?
            </label>
            <p class="font-body text-xs text-plum-muted mt-1 leading-relaxed">
              This would allow guests to reserve spots for themselves and their entire party.
            </p>
            <div v-if="errors.allowPartyJoining" class="mt-1 font-body text-sm text-red-500">
              {{ errors.allowPartyJoining }}
            </div>
          </div>
          <BaseToggle
            id="allowPartyJoining"
            v-model="allowPartyJoining"
            aria-label="Toggle party joining mode"
          />
        </div>

        <div
          v-if="allowPartyJoining"
          class="mt-8 pt-6 border-t border-plum-faint animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <label
            for="maxPartySize"
            class="block font-body text-sm font-medium text-plum-muted leading-snug mb-4"
          >
            What is the maximum number of guests allowed in each group?
          </label>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in [2, 4, 6, 8, 10, 15, 20]"
              :key="size"
              type="button"
              :class="[
                'px-4 py-2 rounded-xl font-body text-sm transition-all',
                maxPartySize === size
                  ? 'bg-plum text-sand font-semibold cursor-pointer'
                  : 'border border-plum-faint text-plum-muted hover:border-plum cursor-pointer',
              ]"
              @click="maxPartySize = size"
            >
              {{ size }}
            </button>
            <div class="flex items-center gap-2">
              <span class="text-sm text-plum-muted font-body">Custom:</span>
              <input
                id="maxPartySize"
                v-model.number="maxPartySize"
                type="number"
                min="1"
                max="50"
                class="w-16 h-9 rounded-xl border border-plum-faint bg-sand text-center font-body text-base text-plum focus:border-plum outline-none"
              />
            </div>
          </div>
          <div v-if="errors.maxPartySize" class="mt-2 font-body text-sm text-red-500">
            {{ errors.maxPartySize }}
          </div>
        </div>
      </div>

      <div
        class="rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-sm dark:shadow-none"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <label
              for="manualPositioning"
              class="block font-body text-sm font-medium text-plum-muted leading-snug"
            >
              Would you like to control each guest’s position in the queue?
            </label>
            <p class="font-body text-xs text-plum-muted mt-1 leading-relaxed">
              This will disable automatic position assignment for guests while ensuring they only
              see “You’re on the list” instead of a position number.
            </p>
          </div>
          <BaseToggle
            id="manualPositioning"
            v-model="manualPositioning"
            aria-label="Toggle manual positioning"
          />
        </div>
      </div>

      <!-- ═══ Card 3: Host vs Guest Version ═══ -->
      <template v-if="role === 'host'">
        <div
          class="rounded-card border border-plu m-faint bg-white p-4 sm:p-6 shadow-sm dark:shadow-none"
        >
          <label for="slug" class="mb-3 block font-body text-sm font-medium text-plum-muted">
            Queue Link
          </label>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <div
              class="flex items-center flex-1 min-w-0 bg-sand border border-sand-light p-1.5 sm:p-2 rounded-xl transition-colors focus-within:border-plum/30 gap-1 px-3"
            >
              <span
                class="font-body text-sm sm:text-[18px] text-plum-muted shrink-0 whitespace-nowrap"
                >{{ windowHost + '/q/' }}</span
              >
              <input
                id="slug"
                v-model="slug"
                placeholder="your-queue-name"
                class="flex-1 min-w-0 border-none bg-transparent font-body text-base sm:text-[18px] text-plum placeholder:text-plum-muted/30 focus:ring-0 outline-none p-0"
              />
              <div class="mx-2 flex h-5 w-5 shrink-0 items-center justify-center">
                <SpinnerLoadingIcon
                  v-if="isCheckingSlug"
                  class="h-4 w-4 animate-spin text-plum/50"
                />
                <VerifiedCheckIcon v-else-if="slug && !errors.slug" class="h-4 w-4 text-mint" />
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-plum-soft h-11 sm:h-auto px-4 py-2.5 sm:py-2 font-body text-sm font-medium text-sand cursor-pointer transition-colors hover:bg-plum-soft w-full sm:w-auto sm:min-w-[100px] shrink-0"
              @click="copyCustomLink"
            >
              <CopyCodeIcon v-if="!isSlugCopied" class="h-3.5 w-3.5 text-sand" />
              <VerifiedCheckIcon v-else class="h-3.5 w-3.5 text-sand" />
              <span>
                {{ isSlugCopied ? 'Copied' : 'Copy' }}
              </span>
            </button>
          </div>
          <div v-if="errors.slug" class="mt-2 font-body text-sm text-red-500">
            {{ errors.slug }}
          </div>
        </div>

        <!-- ═══ Card 4: Guest Settings ═══ -->
        <div
          class="rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-sm dark:shadow-none"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <label
                for="collectEmails"
                class="font-body text-sm font-medium text-plum-muted leading-snug"
                >Would you like to collect email addresses from guests?</label
              >
              <p class="font-body text-xs text-plum-muted mt-0.5 leading-relaxed">
                If yes, guests will be required to provide an email address when joining the queue.
              </p>
            </div>
            <BaseToggle
              id="collectEmails"
              v-model="collectEmails"
              aria-label="Toggle collect emails from customers"
            />
          </div>
        </div>

        <!-- ═══ Card 5: Geo Fence (Premium) ═══ -->
        <div
          class="rounded-card border border-plum-faint bg-white p-4 sm:p-6 shadow-sm dark:shadow-none transition-all relative overflow-hidden"
          :class="{ 'border-mint/30 shadow-[0_4px_20px_rgba(0,229,160,0.05)]': isGeoLocked }"
        >
          <!-- Premium Sparkle Badge -->
          <div
            class="absolute top-0 right-0 bg-mint-light text-plum font-body text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider"
          >
            Premium
          </div>

          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 pr-12">
              <label
                for="isGeoLocked"
                class="font-body text-sm font-semibold text-plum flex items-center gap-2"
              >
                Geo Fence
              </label>
              <p class="font-body text-xs text-plum-muted mt-1 leading-relaxed">
                Restrict queue entry strictly to customers physically present within a specific
                radius of your business coordinates. Prevents remote joining.
              </p>
            </div>
            <BaseToggle
              id="isGeoLocked"
              v-model="isGeoLocked"
              aria-label="Toggle Geo Fence"
              :class="{ 'opacity-50': isLocating }"
              :disabled="isLocating"
            />
          </div>

          <!-- Geolocation active/loading state -->
          <div
            v-if="isLocating || isGeoLocked"
            class="mt-6 pt-6 border-t border-plum-faint animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <!-- Location Troubleshooter / Warning Panel -->
            <LocationTroubleshooter
              :geo-error="geoError"
              :accuracy="accuracy"
              :is-locating="isLocating"
              class="mb-4"
              @retry="recaptureLocation"
            />

            <div
              v-if="isLocating && !latitude && !longitude"
              class="flex items-center gap-3 py-2 text-plum-muted font-body text-sm"
            >
              <SpinnerLoadingIcon class="h-5 w-5 animate-spin text-mint shrink-0" />
              <span
                >Fetching precise device GPS coordinates... Please allow location access in your
                browser.</span
              >
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
                @destroy="destroyLeafletMap"
              />

              <!-- Lockdown Radius Customization -->
              <div>
                <label
                  for="geoRadiusMeters"
                  class="block font-body text-sm font-semibold text-plum mb-4"
                >
                  Allowed Lockdown Radius:
                  <span class="text-mint font-bold">{{ geoRadiusMeters }} meters</span>
                </label>

                <div class="flex flex-wrap gap-2 mb-4">
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

                <div class="relative w-full flex flex-col mt-6">
                  <input
                    id="geoRadiusMeters"
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
        </div>
      </template>

      <template v-else />
    </div>

    <!-- ═══ Action row ═══ -->
    <div class="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
      <button
        type="button"
        class="font-body text-sm font-semibold text-plum-muted transition-colors hover:text-plum cursor-pointer w-full sm:w-auto py-2"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || isCheckingSlug"
        class="rounded-input bg-mint px-6 py-2.5 font-body text-base font-semibold text-on-mint shadow-[0_4px_12px_rgba(0,229,160,0.30)] transition-all hover:bg-mint-dark active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:min-w-[140px] w-full sm:w-auto"
      >
        <SpinnerLoadingIcon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin text-on-mint" />
        {{ isSubmitting ? 'Creating...' : 'Create Queue' }}
      </button>
    </div>

    <!-- ═══ Account nudge (Guest only) ═══ -->
    <p v-if="role === 'guest'" class="mt-6 text-center font-body text-sm text-plum-muted">
      Secure your queue & customize your URL.
      <router-link
        to="/login"
        class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
      >
        Create a free account
      </router-link>
    </p>
  </form>

  <!-- Active Queue Conflict Resolution Modal -->
  <ActiveQueueConflictModal
    :is-open="showConflictModal"
    :queue-id="conflictingQueueId"
    @cancel="showConflictModal = false"
    @confirm-resume="handleResume"
    @confirm-terminate="handleForceCreate"
  />
</template>
