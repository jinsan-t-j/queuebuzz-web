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

import { AtSign, ChevronDown, Info, User } from 'lucide-vue-next'
import { useField, useForm } from 'vee-validate'
import { onUnmounted, ref, watch } from 'vue'
import * as yup from 'yup'

import ArrowRightBoldIcon from '@/assets/icons/arrow-right-bold.svg?component'
import ClockFilledIcon from '@/assets/icons/clock-filled.svg?component'
import BaseToggle from '@/components/base/BaseToggle.vue'
import GeoPromptModal from '@/modules/customer/components/GeoPromptModal.vue'
import { useLocation } from '@/modules/customer/composables/useLocation'

const props = defineProps({
  queueName: { type: String, default: '' },
  peopleInQueue: { type: Number, default: 0 },
  estWaitMin: { type: Number, default: 0 },
  canJoinWithParty: { type: Boolean, default: false },
  maxAllowedPartySize: { type: Number, default: 10 },
  isLoading: { type: Boolean, default: false },
  collectEmails: { type: Boolean, default: false },
  isGeoLocked: { type: Boolean, default: false },
  venueLatitude: { type: Number, default: null },
  venueLongitude: { type: Number, default: null },
  geoRadiusMeters: { type: Number, default: 200 },
})

const emit = defineEmits(['join-queue', 'go-to-join-by-code'])

const schema = yup.object({
  displayName: yup.string().max(30, 'Name too long').optional(),
  email: yup.string().email('Invalid email address').optional(),
  accompanying: yup
    .number()
    .min(0)
    .max(
      Math.max(0, (props.maxAllowedPartySize || 10) - 1),
      `Max ${(props.maxAllowedPartySize || 10) - 1} companions`,
    )
    .default(0),
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    displayName: '',
    email: '',
    accompanying: 0,
  },
})

const { value: displayName, errorMessage: nameError } = useField<string>('displayName')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: accompanying } = useField<number>('accompanying')

const buzzEnabled = ref(true)
const isEmailExpanded = ref(false)
const isGuestsOpen = ref(false)

const showGeoPromptModal = ref(false)

const {
  latitude,
  longitude,
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

function toggleEmail() {
  isEmailExpanded.value = !isEmailExpanded.value
}

/**
 * Handle Notification Permission
 */
async function ensureNotificationPermission() {
  if (!('Notification' in globalThis)) return true

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Geolocation capture and submit
 */
async function captureLocationAndJoin() {
  const pos = await captureLocation()
  if (!pos) return

  showGeoPromptModal.value = false

  let notificationEnabled = buzzEnabled.value
  let fcmToken = null

  if (notificationEnabled) {
    const hasPermission = await ensureNotificationPermission()
    if (hasPermission) {
      const { getFCMTokenDetails } = await import('@/lib/firebase')
      const tokenResult = await getFCMTokenDetails()
      fcmToken = tokenResult.token
      if (!fcmToken) {
        notificationEnabled = false
      }
    } else {
      notificationEnabled = false
    }
  }

  const payload = {
    name: displayName.value?.trim() || 'Guest',
    partySize: (accompanying.value || 0) + 1,
    notificationEnabled,
    fcmToken,
    email: email.value?.trim() || undefined,
    latitude: pos.latitude,
    longitude: pos.longitude,
  }

  emit('join-queue', payload)
}

const handleJoin = handleSubmit(async (values) => {
  if (props.isGeoLocked && (latitude.value === null || longitude.value === null)) {
    showGeoPromptModal.value = true
    return
  }

  let notificationEnabled = buzzEnabled.value
  let fcmToken = null

  if (notificationEnabled) {
    const hasPermission = await ensureNotificationPermission()
    if (hasPermission) {
      // Lazy import Firebase only when needed to optimize bundle and unused JS
      const { getFCMTokenDetails } = await import('@/lib/firebase')
      const tokenResult = await getFCMTokenDetails()
      fcmToken = tokenResult.token

      if (!fcmToken) {
        notificationEnabled = false
        // eslint-disable-next-line no-console
        console.warn('Guest FCM token unavailable:', tokenResult.reason, tokenResult.detail)
      }
    } else {
      notificationEnabled = false
    }
  }

  const payload = {
    name: values.displayName?.trim() || 'Guest',
    partySize: (values.accompanying || 0) + 1,
    notificationEnabled,
    fcmToken,
    email: values.email?.trim() || undefined,
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
        'mt-6 flex items-start gap-4 rounded-3xl border p-4 transition-colors',
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
          v-model="displayName"
          type="text"
          placeholder="What should we call you?"
          class="w-full border-none bg-transparent font-body text-[17px] text-plum placeholder:text-plum-muted/40 focus:outline-none"
        />
        <p v-if="nameError" class="mt-1 font-body text-sm text-danger">{{ nameError }}</p>
        <p v-else class="mt-1 font-body text-sm text-plum-muted">Appears as Guest if skipped</p>
      </div>
    </div>

    <!-- Smart Progressive Disclosure Row: Party Joining -->
    <div v-if="canJoinWithParty" class="mt-6 flex flex-col gap-4">
      <button
        type="button"
        class="flex items-center gap-3 rounded-3xl border border-plum-faint bg-white p-4 transition-colors hover:border-plum/20"
        @click="isGuestsOpen = !isGuestsOpen"
      >
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
        <div class="flex-1 text-left">
          <p class="font-body text-[15px] font-semibold text-plum">Joining with others?</p>
          <p class="font-body text-sm text-plum-muted">Add companions to your spot</p>
        </div>
        <ChevronDown
          :class="[
            'h-4 w-4 text-plum-muted transition-transform duration-200',
            isGuestsOpen ? 'rotate-180' : '',
          ]"
        />
      </button>

      <!-- Expandable Stepper -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <div
          v-if="isGuestsOpen"
          class="flex items-center justify-between rounded-3xl border border-plum-faint bg-plum-faint/30 p-4"
        >
          <p class="font-body text-sm font-semibold text-plum">How many people with you?</p>

          <div class="flex items-center gap-4">
            <button
              type="button"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-plum shadow-sm disabled:opacity-30"
              :disabled="accompanying <= 0"
              aria-label="Decrease party size"
              @click="accompanying--"
            >
              −
            </button>
            <span class="min-w-[24px] text-center font-mono text-lg font-bold text-plum">
              {{ accompanying }}
            </span>
            <button
              type="button"
              class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-plum shadow-sm disabled:opacity-30"
              :disabled="accompanying >= props.maxAllowedPartySize - 1"
              aria-label="Increase party size"
              @click="accompanying++"
            >
              +
            </button>
          </div>
        </div>
      </transition>
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

    <!-- Email input card (Prominent if mandatory, accordion if optional) -->
    <div v-if="collectEmails" class="mt-6 flex flex-col gap-4">
      <div
        :class="[
          'flex items-start gap-4 rounded-3xl border p-4 transition-colors',
          emailError ? 'border-danger bg-danger/5' : 'border-plum-faint bg-white',
        ]"
      >
        <div
          :class="[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            emailError ? 'bg-danger/10' : 'bg-plum-faint',
          ]"
        >
          <AtSign :class="['h-4 w-4', emailError ? 'text-danger' : 'text-plum-muted']" />
        </div>
        <div class="flex-1">
          <input
            v-model="email"
            type="email"
            placeholder="What's your email?"
            class="w-full border-none bg-transparent font-body text-[17px] text-plum placeholder:text-plum-muted/40 focus:outline-none"
          />
          <p v-if="emailError" class="mt-1 font-body text-sm text-danger">{{ emailError }}</p>
          <p v-else class="mt-1 font-body text-sm text-plum-muted">
            For updates &amp; spot recovery
          </p>
        </div>
      </div>
    </div>

    <!-- Email recovery accordion (Only if optional) -->
    <div v-else class="mt-6">
      <!-- Header row -->
      <button
        class="flex w-full min-h-[48px] cursor-pointer items-center gap-4 py-3"
        @click="toggleEmail"
      >
        <AtSign class="h-4 w-4 shrink-0 text-plum-muted" />
        <span class="flex-1 text-left font-body text-sm font-medium text-plum-muted"
          >Add email for recovery</span
        >
        <ChevronDown
          :class="[
            'h-3 w-3 text-plum-muted transition-transform duration-200',
            isEmailExpanded ? 'rotate-180' : '',
          ]"
        />
      </button>

      <!-- Expanded panel -->
      <div
        v-show="isEmailExpanded"
        :class="[
          'rounded-2xl border p-4 transition-colors',
          emailError ? 'border-danger bg-danger/5' : 'border-plum-faint bg-plum-faint/30',
        ]"
      >
        <div class="bg-white p-3.5 rounded-xl">
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="w-full border-none bg-transparent font-body text-sm text-plum placeholder:text-plum-muted/60 focus:outline-none min-h-[32px]"
          />
        </div>
        <p v-if="emailError" class="mt-1 font-body text-sm text-danger">{{ emailError }}</p>
        <div class="mt-3 flex items-start gap-2">
          <Info class="mt-0.5 h-3 w-3 shrink-0 text-plum-muted/80" />
          <p class="font-body text-sm leading-relaxed text-plum-muted/80">
            Receive updates &amp; recover your spot if you close the browser.
          </p>
        </div>
      </div>
    </div>

    <!-- Geo-Location Lockdown Notice -->
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

    <!-- Join by code link -->
    <p class="mt-6 text-center font-body text-sm text-plum-muted">
      Already have a ticket?
      <button
        type="button"
        class="font-body text-sm text-plum-muted underline underline-offset-4 hover:text-plum transition-colors p-4"
        @click="emit('go-to-join-by-code')"
      >
        Enter your join code
      </button>
    </p>

    <!-- Geo Prompt Modal -->
    <GeoPromptModal
      :is-open="showGeoPromptModal"
      :venue-latitude="venueLatitude"
      :venue-longitude="venueLongitude"
      :is-locating="isLocating"
      :is-refreshing-location="isRefreshingLocation"
      :is-satellite="isSatellite"
      :geo-error="geoError"
      @close="showGeoPromptModal = false"
      @toggle-map-type="toggleMapType"
      @refresh-location="refreshMyLocation"
      @confirm="captureLocationAndJoin()"
    />
  </div>
</template>
