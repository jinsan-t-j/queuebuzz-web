<script setup lang="ts">
/**
 * @component JoinQueueForm
 * @description Join queue form with name input, buzz toggle, email recovery accordion,
 * and queue stats header.
 *
 * @prop {String} queueName - Name of the queue.
 * @prop {Number} peopleInQueue - Number of people currently in queue.
 * @prop {Number} estWaitMin - Estimated wait time in minutes.
 * @emits {join-queue} - Emitted with { name, buzzEnabled, email } payload.
 */

import { toTypedSchema } from '@vee-validate/yup'
import { AtSign, Info, User } from 'lucide-vue-next'
import { useField, useForm } from 'vee-validate'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as yup from 'yup'

import ArrowRightBoldIcon from '@/assets/icons/arrow-right-bold.svg?component'
import ClockFilledIcon from '@/assets/icons/clock-filled.svg?component'
import BaseToggle from '@/components/base/BaseToggle.vue'
import { useToast } from '@/composables/useToast'
import GeoPromptModal from '@/modules/customer/components/GeoPromptModal.vue'
import { useLocation } from '@/modules/customer/composables/useLocation'
import { phoneValidationSchema, normalizePhone } from '@/utils/validation'

const props = defineProps({
  queueName: { type: String, default: '' },
  peopleInQueue: { type: Number, default: 0 },
  estWaitMin: { type: Number, default: 0 },
  canJoinWithParty: { type: Boolean, default: false },
  maxAllowedPartySize: { type: Number, default: 10 },
  isLoading: { type: Boolean, default: false },
  isGeoLocked: { type: Boolean, default: false },
  venueLatitude: { type: Number, default: null },
  venueLongitude: { type: Number, default: null },
  geoRadiusMeters: { type: Number, default: 200 },
})

const emit = defineEmits(['join-queue', 'go-to-join-by-code'])

const schema = yup.object({
  displayName: yup.string().max(30, 'Name too long').optional(),
  email: yup.string().email('Invalid email address').optional(),
  phone: phoneValidationSchema,
  accompanying: yup
    .number()
    .min(0)
    .max(
      Math.max(0, (props.maxAllowedPartySize || 10) - 1),
      `Max ${(props.maxAllowedPartySize || 10) - 1} companions`,
    )
    .default(0),
})

const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    displayName: '',
    email: '',
    phone: '',
    accompanying: 0,
  },
})

const { value: displayName, errorMessage: nameError } = useField<string>('displayName', undefined, {
  validateOnValueUpdate: false,
})
const { value: email, errorMessage: emailError } = useField<string>('email', undefined, {
  validateOnValueUpdate: false,
})
const { value: phone, errorMessage: phoneError } = useField<string>('phone', undefined, {
  validateOnValueUpdate: false,
})
const { value: accompanying } = useField<number>('accompanying')

watch(displayName, () => {
  setFieldError('displayName', undefined)
})
watch(email, () => {
  setFieldError('email', undefined)
})
watch(phone, () => {
  setFieldError('phone', undefined)
})

const buzzEnabled = ref(
  typeof localStorage === 'undefined'
    ? true
    : localStorage.getItem('queuebuzz_buzz_enabled') !== 'false',
)

const showSetupGuide = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const isIOS = ref(false)
const isMac = ref(false)
const isAndroid = ref(false)
const isSafari = ref(false)
const isFirefox = ref(false)
const isChrome = ref(false)

const notificationPermission = ref<'default' | 'granted' | 'denied' | 'unsupported'>(
  typeof Notification === 'undefined'
    ? 'unsupported'
    : (Notification.permission as 'default' | 'granted' | 'denied'),
)

const updatePermission = () => {
  if (typeof Notification === 'undefined') {
    if (isIOS.value) {
      notificationPermission.value = 'denied'
    } else {
      notificationPermission.value = 'unsupported'
    }
  } else {
    notificationPermission.value = Notification.permission as 'default' | 'granted' | 'denied'
  }
}

onMounted(() => {
  const ua = globalThis.navigator?.userAgent || ''
  const isAppleMobile =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && globalThis.navigator?.maxTouchPoints > 1)
  const isMacOs = /Macintosh|Mac OS X/.test(ua) && !isAppleMobile
  const isAndroidOs = /Android/i.test(ua)
  const isSafariBrowser = /Safari/.test(ua) && !/Chrome|CriOS|Android/.test(ua)
  const isFirefoxBrowser = /Firefox|FxiOS/.test(ua)
  const isChromeBrowser = /Chrome|CriOS/.test(ua)

  isIOS.value = isAppleMobile
  isMac.value = isMacOs
  isAndroid.value = isAndroidOs
  isSafari.value = isSafariBrowser
  isFirefox.value = isFirefoxBrowser
  isChrome.value = isChromeBrowser

  updatePermission()

  if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
    try {
      navigator.permissions.query({ name: 'notifications' }).then((status) => {
        status.onchange = () => {
          updatePermission()
        }
      })
    } catch {
      // Ignore unsupported browsers
    }
  }

  nameInput.value?.focus()
})

watch(buzzEnabled, async (val) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('queuebuzz_buzz_enabled', String(val))
  }

  if (val) {
    updatePermission()
    if (notificationPermission.value === 'denied') {
      showSetupGuide.value = true
    } else if (notificationPermission.value === 'default') {
      try {
        const permission = await Notification.requestPermission()
        notificationPermission.value = permission as 'default' | 'granted' | 'denied'
        if (permission === 'denied') {
          showSetupGuide.value = true
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error requesting permission:', err)
      }
    }
  }
})

const showGeoPromptModal = ref(false)

const {
  latitude,
  longitude,
  accuracy,
  isLocating,
  isRefreshingLocation,
  geoError,
  isSatellite,
  toggleMapType,
  initLeafletMap,
  destroyLeafletMap,
  refreshMyLocation,
  captureLocation,
} = useLocation()

/**
 * Handle Notification Permission
 */
async function ensureNotificationPermission() {
  if (!('Notification' in globalThis)) return true

  updatePermission()
  if (notificationPermission.value === 'granted') return true
  if (notificationPermission.value === 'denied') return false

  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission as 'default' | 'granted' | 'denied'
    return permission === 'granted'
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return false
  }
}

/**
 * Handle Notification Permission and Token Fetching
 */
async function prepareFCMToken(): Promise<string | null> {
  updatePermission()
  if (notificationPermission.value === 'unsupported' || notificationPermission.value === 'denied') {
    return null
  }

  const hasPermission = await ensureNotificationPermission()
  if (!hasPermission) {
    return null
  }

  // Lazy import Firebase only when needed to optimize bundle and unused JS
  try {
    const { getFCMTokenDetails } = await import('@/lib/firebase')
    const tokenResult = await getFCMTokenDetails()
    return tokenResult.token || null
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to import or fetch FCM token:', err)
    return null
  }
}

/**
 * Geolocation capture and submit
 */
async function captureLocationAndJoin() {
  const pos = await captureLocation()
  if (!pos) return

  showGeoPromptModal.value = false

  const notificationEnabled = buzzEnabled.value
  let fcmToken: string | null = null

  if (notificationEnabled) {
    fcmToken = await prepareFCMToken()
  }

  // Normalize phone number to digits only before submitting
  const formattedPhone = normalizePhone(phone.value)

  const payload = {
    name: displayName.value?.trim() || 'Guest',
    partySize: (accompanying.value || 0) + 1,
    notificationEnabled,
    fcmToken,
    email: email.value?.trim() || undefined,
    phone: formattedPhone,
    latitude: pos.latitude,
    longitude: pos.longitude,
  }

  emit('join-queue', payload)
}

const { showToast } = useToast()

const handleJoin = handleSubmit(async (values) => {
  if (props.isGeoLocked && (latitude.value === null || longitude.value === null)) {
    showGeoPromptModal.value = true
    return
  }

  const notificationEnabled = buzzEnabled.value
  let fcmToken: string | null = null

  if (notificationEnabled) {
    if (
      notificationPermission.value === 'denied' ||
      (typeof Notification !== 'undefined' && Notification.permission === 'denied')
    ) {
      showToast('Notifications are blocked in browser settings', { type: 'error' })
      return
    }
    fcmToken = await prepareFCMToken()
    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      showToast('Notifications are blocked in browser settings', { type: 'error' })
      return
    }
  }

  // Normalize phone number to digits only before submitting
  const formattedPhone = normalizePhone(values.phone)

  const payload = {
    name: values.displayName?.trim() || 'Guest',
    partySize: (values.accompanying || 0) + 1,
    notificationEnabled,
    fcmToken,
    email: values.email?.trim() || undefined,
    phone: formattedPhone,
    latitude: latitude.value || undefined,
    longitude: longitude.value || undefined,
  }

  emit('join-queue', payload)
})

watch(showGeoPromptModal, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      initLeafletMap(
        'leaflet-map',
        props.venueLatitude,
        props.venueLongitude,
        props.geoRadiusMeters,
      )
    }, 150)
  } else {
    destroyLeafletMap()
  }
})

onUnmounted(() => {
  destroyLeafletMap()
})
</script>

<template>
  <div class="flex flex-col px-5 py-4">
    <!-- Stats card -->
    <div class="rounded-3xl border border-plum-faint bg-white p-5 text-center">
      <p class="font-body text-sm font-semibold uppercase tracking-[2.4px] text-plum-soft">
        People in queue
      </p>
      <p class="mt-2.5 font-display text-[84px] font-normal leading-[84px] text-plum">
        {{ peopleInQueue }}
      </p>
      <div
        class="mx-auto mt-2.5 flex w-fit items-center gap-2 rounded-full border border-plum-faint/50 bg-sand px-4 py-2"
      >
        <ClockFilledIcon class="h-4 w-4 text-mint-dark" />
        <span v-if="estWaitMin === 0" class="font-body text-md font-medium text-plum"
          >Few moments</span
        >
        <span v-else class="font-mono text-lg font-bold text-plum">~{{ estWaitMin }} min</span>
        <span class="font-body text-lg text-plum-soft">Wait</span>
      </div>
      <p class="mt-2.5 font-body text-sm leading-snug text-plum-muted">
        Your wait time is estimated,<br />
        it may slightly shift as the queue moves.
      </p>
    </div>

    <!-- Section heading -->
    <h2 class="mt-8 font-body text-2xl font-bold text-plum">Secure your spot</h2>

    <!-- Name input card -->
    <div
      :class="[
        'mt-6 flex items-center gap-4 rounded-3xl border p-4 transition-colors',
        nameError ? 'border-danger bg-danger/5' : 'border-plum-faint bg-white',
      ]"
    >
      <div
        :class="[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          nameError ? 'bg-danger/10' : 'bg-plum-faint',
        ]"
      >
        <User :class="['h-4 w-4', nameError ? 'text-danger' : 'text-plum-muted']" />
      </div>
      <div class="flex-1">
        <input
          id="guest-name"
          ref="nameInput"
          v-model="displayName"
          type="text"
          placeholder="What should we call you? (optional)"
          class="w-full border-none bg-transparent font-body text-[17px] text-plum placeholder:text-plum-muted/40 focus:outline-none"
        />
        <p v-if="nameError" class="mt-1 font-body text-sm text-danger">{{ nameError }}</p>
      </div>
    </div>

    <!-- Party Joining Row -->
    <div
      v-if="canJoinWithParty"
      class="mt-6 flex min-h-[56px] items-center justify-between rounded-3xl border border-plum-faint bg-white p-4"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
          <svg
            class="h-5 w-5 text-warning"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div>
          <p class="font-body text-[15px] font-semibold text-plum">Joining with others?</p>
          <p class="font-body text-sm text-plum-muted">Add companions to your spot</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-plum-faint text-xl font-bold text-plum transition-opacity disabled:opacity-30"
          :disabled="accompanying <= 0"
          aria-label="Decrease party size"
          @click="accompanying--"
        >
          −
        </button>
        <span class="min-w-[20px] text-center font-mono text-base font-bold text-plum">
          {{ accompanying }}
        </span>
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-plum-faint text-xl font-bold text-plum transition-opacity disabled:opacity-30"
          :disabled="accompanying >= props.maxAllowedPartySize - 1"
          aria-label="Increase party size"
          @click="accompanying++"
        >
          +
        </button>
      </div>
    </div>

    <!-- Buzz toggle card -->
    <div
      class="mt-6 flex min-h-[56px] items-center justify-between rounded-3xl border border-plum-faint bg-white p-4"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-light">
          <svg class="h-5 w-5 text-mint" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C10.9 2 10 2.9 10 4V4.29C7.12 5.15 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.15 14 4.29V4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z"
            />
          </svg>
        </div>
        <div>
          <p class="font-body text-[15px] font-semibold text-plum">Buzz me when ready</p>
          <p class="font-body text-sm text-plum-muted">Get notified when it's your turn</p>
        </div>
      </div>
      <div class="flex items-center min-h-[44px]">
        <BaseToggle v-model="buzzEnabled" aria-label="Toggle haptic vibration buzz notifications" />
      </div>
    </div>

    <!-- Contact & Recovery Section -->
    <div class="mt-6 flex flex-col gap-4">
      <div class="rounded-3xl border border-plum-faint bg-white overflow-hidden">
        <!-- Email Input Row -->
        <div class="flex items-center gap-4 px-4 py-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum-faint">
            <AtSign class="h-4 w-4 text-plum-muted" />
          </div>
          <div class="flex-1">
            <input
              v-model="email"
              type="email"
              placeholder="Email (optional, for recovery)"
              class="w-full border-none bg-transparent font-body text-base text-plum placeholder:text-plum-muted/40 focus:outline-none"
            />
          </div>
        </div>
        <p v-if="emailError" class="px-4 pb-2 font-body text-xs text-danger">{{ emailError }}</p>

        <!-- Divider -->
        <div class="border-t border-plum-faint" />

        <!-- Phone Input Row -->
        <div class="flex items-center gap-4 px-4 py-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum-faint">
            <svg
              class="h-4 w-4 text-plum-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <input
              v-model="phone"
              type="tel"
              placeholder="Phone number (optional, for updates)"
              class="w-full border-none bg-transparent font-body text-base text-plum placeholder:text-plum-muted/40 focus:outline-none"
              @input="phone = phone.replace(/[^0-9+\-\s()]/g, '')"
            />
          </div>
        </div>
        <p v-if="phoneError" class="px-4 pb-2 font-body text-xs text-danger">{{ phoneError }}</p>
      </div>

      <!-- Info/Recovery Notice under Card -->
      <div class="flex items-start gap-2 px-1">
        <Info class="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-muted/80" />
        <p class="font-body text-xs leading-relaxed text-plum-muted/80">
          Email is used to recover your spot if you close the browser.
        </p>
      </div>
    </div>

    <!-- Geo Fence Notice -->
    <div
      v-if="isGeoLocked"
      class="mt-6 flex items-start gap-3 rounded-2xl bg-mint-light/40 border border-mint/20 p-4"
    >
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint-light text-plum"
      >
        <svg
          class="h-4 w-4 text-plum animate-pulse"
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
      <div>
        <p class="font-body text-xs font-semibold text-plum uppercase tracking-wider">
          On-Site Queue Only
        </p>
        <p class="font-body text-xs text-plum-soft mt-0.5 leading-relaxed">
          This business has enabled Geo-Lockdown. You must be physically present at the venue to
          join.
        </p>
      </div>
    </div>

    <!-- Join CTA -->
    <button
      :disabled="isSubmitting || isLoading"
      :class="[
        'mt-6 flex h-[64px] w-full items-center justify-center gap-2 rounded-2xl bg-mint font-body text-lg font-semibold text-on-mint shadow-[0_8px_24px_rgba(0,229,160,0.50)] transition-all',
        isSubmitting || isLoading
          ? 'cursor-not-allowed opacity-70'
          : 'hover:shadow-[0_12px_32px_rgba(0,229,160,0.60)]',
      ]"
      @click="handleJoin"
    >
      {{ isSubmitting || isLoading ? 'Joining…' : 'Join the Queue' }}
      <ArrowRightBoldIcon v-if="!(isSubmitting || isLoading)" class="h-4 w-4 text-on-mint" />
    </button>

    <!-- Geo Prompt Modal -->
    <GeoPromptModal
      :is-open="showGeoPromptModal"
      :venue-latitude="venueLatitude"
      :venue-longitude="venueLongitude"
      :is-locating="isLocating"
      :is-refreshing-location="isRefreshingLocation"
      :is-satellite="isSatellite"
      :geo-error="geoError"
      :accuracy="accuracy"
      @close="showGeoPromptModal = false"
      @toggle-map-type="toggleMapType"
      @refresh-location="refreshMyLocation"
      @confirm="captureLocationAndJoin()"
    />
  </div>
</template>
