<script setup lang="ts">
/**
 * @component SettingsForm
 * @description Refactored Host settings form using settingsStore and Base components.
 */
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'

import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'
import BaseToggle from '@/components/base/BaseToggle.vue'
import { fetchSubscription, type Subscription } from '@/modules/app/billing/actions/billing.actions'
import { useSettingsStore } from '@/stores/settings.store'

const BaseImageCropper = defineAsyncComponent(
  () => import('@/components/base/BaseImageCropper.vue'),
)

const SettingsSubscriptionSection = defineAsyncComponent(
  () => import('./SettingsSubscriptionSection.vue'),
)

const SettingsDangerZone = defineAsyncComponent(() => import('./SettingsDangerZone.vue'))

const SettingsActionBar = defineAsyncComponent(() => import('./SettingsActionBar.vue'))

const settingsStore = useSettingsStore()
const { userSettings, isLoading, isSaving, error } = storeToRefs(settingsStore)

const subscription = ref<Subscription | null>(null)
const canCustomBranding = computed(() => subscription.value?.canCustomBranding ?? false)
const isFetchingSub = ref(false)

const form = ref({
  name: '',
  business_name: '',
  address: '',
  phone: '',
  default_queue_name: '',
  avg_service_mins: 5,
  email_notifications: true,
  push_notifications: true,
  collect_emails: true,
})

const isDirty = ref(false)

// Image state
const profileImageUrl = ref<string | null>(null)
const bannerImageUrl = ref<string | null>(null)
const profileImageError = ref<string | null>(null)
const bannerImageError = ref<string | null>(null)

const MAX_IMAGE_SIZE = 1024 * 1024 * 5 // 5MB (allowed for input, resized to <1MB by cropper)
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

// Cropper state
const isCropperOpen = ref(false)
const pendingImageSrc = ref<string | null>(null)
const cropType = ref<'profile' | 'banner'>('profile')
const cropAspectRatio = computed(() => (cropType.value === 'profile' ? 1 : 16 / 5))
const cropTitle = computed(() =>
  cropType.value === 'profile' ? 'Crop Profile Photo' : 'Crop Cover Banner',
)

// File input refs
const profileFileInput = ref<HTMLInputElement | null>(null)
const bannerFileInput = ref<HTMLInputElement | null>(null)

const hasProfileImage = computed(() => !!profileImageUrl.value)
const hasBannerImage = computed(() => !!bannerImageUrl.value)

onMounted(async () => {
  isFetchingSub.value = true
  try {
    const [sub] = await Promise.all([
      fetchSubscription(),
      userSettings.value ? Promise.resolve() : settingsStore.fetchSettings(),
    ])
    subscription.value = sub
  } catch {
    // Silently fail or use a toast
  } finally {
    isFetchingSub.value = false
  }

  if (userSettings.value) {
    syncForm()
  }
})

// Ensure form is synced if settings load after mount
watch(
  userSettings,
  (newSettings) => {
    if (newSettings && !isDirty.value) {
      syncForm()
    }
  },
  { immediate: true },
)

function syncForm() {
  if (!userSettings.value) return
  form.value = {
    name: userSettings.value.name,
    business_name: userSettings.value.business_name || '',
    address: userSettings.value.address || '',
    phone: userSettings.value.phone || '',
    default_queue_name: userSettings.value.settings?.defaultQueueName || 'Main Queue',
    avg_service_mins: userSettings.value.settings?.avgServiceMins || 5,
    email_notifications: userSettings.value.settings?.emailNotifications ?? false,
    push_notifications: userSettings.value.settings?.pushNotifications ?? true,
    collect_emails: userSettings.value.settings?.collectEmails ?? false,
  }
  profileImageUrl.value = userSettings.value.profileImageUrl || null
  bannerImageUrl.value = userSettings.value.bannerImageUrl || null
  isDirty.value = false
}

const profileInitial = computed(() => {
  const name = form.value.business_name || form.value.name
  return name?.charAt(0)?.toUpperCase() || '?'
})

function onFieldChange() {
  isDirty.value = true
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function validateImageFile(file: File, maxSize: number): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, WebP, and GIF images are accepted.'
  }
  if (file.size > maxSize) {
    const sizeMb = (maxSize / 1024 / 1024).toFixed(0)
    return `Image must be under ${sizeMb}MB. (Detected: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
  }
  return null
}

async function handleProfileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  profileImageError.value = null
  const validationError = validateImageFile(file, MAX_IMAGE_SIZE)
  if (validationError) {
    profileImageError.value = validationError
    input.value = ''
    return
  }

  try {
    pendingImageSrc.value = await readFileAsDataUrl(file)
    cropType.value = 'profile'
    isCropperOpen.value = true
  } catch {
    profileImageError.value = 'Failed to process image.'
  }
  input.value = ''
}

async function handleBannerUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  bannerImageError.value = null
  const validationError = validateImageFile(file, MAX_IMAGE_SIZE)
  if (validationError) {
    bannerImageError.value = validationError
    input.value = ''
    return
  }

  try {
    pendingImageSrc.value = await readFileAsDataUrl(file)
    cropType.value = 'banner'
    isCropperOpen.value = true
  } catch {
    bannerImageError.value = 'Failed to process image.'
  }
  input.value = ''
}

function removeProfileImage() {
  profileImageUrl.value = null
  isDirty.value = true
}

function removeBannerImage() {
  bannerImageUrl.value = null
  isDirty.value = true
}

function handleCroppedImage(dataUrl: string) {
  if (cropType.value === 'profile') {
    profileImageUrl.value = dataUrl
  } else {
    bannerImageUrl.value = dataUrl
  }
  isDirty.value = true
  isCropperOpen.value = false
  pendingImageSrc.value = null
}

async function handleSave() {
  const formData = new FormData()

  // 1. Basic Fields
  formData.append('name', form.value.name)
  formData.append('business_name', form.value.business_name)
  formData.append('address', form.value.address)
  formData.append('phone', form.value.phone || '')

  // 2. Settings (nested as JSON string)
  formData.append(
    'settings',
    JSON.stringify({
      default_queue_name: form.value.default_queue_name,
      avg_service_mins: form.value.avg_service_mins,
      email_notifications: form.value.email_notifications,
      push_notifications: form.value.push_notifications,
      collect_emails: form.value.collect_emails,
    }),
  )

  // 3. Handle Images (Multipart Blobs)
  // Profile Image
  if (profileImageUrl.value) {
    if (profileImageUrl.value.startsWith('data:')) {
      const response = await fetch(profileImageUrl.value)
      const blob = await response.blob()
      formData.append('profile_image', blob, 'profile.jpg')
    }
  } else {
    // Cleared
    formData.append('profile_image_url', '')
  }

  // Banner Image
  if (bannerImageUrl.value) {
    if (bannerImageUrl.value.startsWith('data:')) {
      const response = await fetch(bannerImageUrl.value)
      const blob = await response.blob()
      formData.append('banner_image', blob, 'banner.jpg')
    }
  } else {
    // Cleared
    formData.append('banner_image_url', '')
  }

  await settingsStore.updateSettings(formData)
  isDirty.value = false
}

async function handleDiscard() {
  syncForm()
}

async function refreshSubscription() {
  isFetchingSub.value = true
  try {
    subscription.value = await fetchSubscription()
  } catch {
    // Silently fail
  } finally {
    isFetchingSub.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Loading State -->
    <div v-if="isLoading && !userSettings" class="space-y-6">
      <div v-for="i in 3" :key="i" class="h-48 w-full animate-pulse rounded-3xl bg-plum-faint" />
    </div>

    <template v-else-if="userSettings">
      <!-- ═══ Section: My Profile ═══ -->
      <BaseCard id="profile" class="scroll-mt-32 p-4 sm:p-8">
        <h2 class="mb-6 sm:mb-8 font-display text-xl sm:text-2xl font-bold text-plum">
          My Profile
        </h2>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <BaseInput
            v-model="form.name"
            label="Full Name"
            placeholder=""
            @update:model-value="onFieldChange"
          />
          <BaseInput
            :model-value="userSettings.email"
            label="Email Address"
            :is-disabled="true"
            helper="Email cannot be changed."
          />
          <BaseInput
            v-model="form.phone"
            label="Phone Number"
            placeholder=""
            @update:model-value="onFieldChange"
          />
        </div>
      </BaseCard>

      <!-- ═══ Section: Business Branding ═══ -->
      <div v-if="!canCustomBranding && !isFetchingSub" class="mb-4">
        <div
          class="flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-mint-light p-4 border border-mint/20 gap-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-plum"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div>
              <p class="font-display text-sm font-bold text-plum">Unlock Custom Branding</p>
              <p class="font-body text-xs text-plum-muted">
                Upgrade to Elite to set a custom business banner and appearance.
              </p>
            </div>
          </div>
          <router-link
            to="/pricing"
            class="w-full sm:w-auto px-6 py-2 bg-plum text-sand font-body text-xs font-bold rounded-xl hover:bg-plum/90 transition-colors"
          >
            Go Premium
          </router-link>
        </div>
      </div>

      <BaseCard
        id="branding"
        padding="none"
        class="scroll-mt-32 overflow-hidden transition-all duration-300"
        :class="{
          'opacity-60 pointer-events-none grayscale-[0.5]': !canCustomBranding && !isFetchingSub,
        }"
      >
        <!-- Banner area (edge-to-edge, inside card border-radius) -->
        <div
          class="group relative"
          :class="{ 'cursor-pointer': canCustomBranding }"
          @click="canCustomBranding && bannerFileInput?.click()"
        >
          <!-- Banner Preview (uploaded image) -->
          <div v-if="hasBannerImage" class="relative aspect-[16/5] w-full">
            <img :src="bannerImageUrl!" alt="Banner preview" class="h-full w-full object-cover" />
            <!-- Hover overlay -->
            <div
              v-if="canCustomBranding"
              class="absolute inset-0 flex items-center justify-center bg-plum/0 transition-all duration-200 group-hover:bg-plum/40"
            >
              <div
                class="flex gap-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <button
                  class="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 font-body text-xs font-semibold text-plum shadow-sm dark:shadow-none backdrop-blur-sm transition-transform hover:scale-105"
                  @click.stop="bannerFileInput?.click()"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Change
                </button>
                <button
                  class="flex items-center gap-1.5 rounded-full bg-danger/90 px-4 py-2 font-body text-xs font-semibold text-white shadow-sm dark:shadow-none backdrop-blur-sm transition-transform hover:scale-105"
                  @click.stop="removeBannerImage"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Empty banner placeholder (premium, no image uploaded) -->
          <div
            v-else-if="canCustomBranding"
            class="relative flex aspect-[16/5] w-full items-center justify-center bg-plum-faint/50"
          >
            <div class="flex flex-col items-center gap-2 text-plum/60">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p class="font-body text-xs font-semibold">Upload a cover banner</p>
            </div>
          </div>

          <!-- Default banner (non-premium fallback, decorative) -->
          <div v-else class="relative aspect-[16/5] w-full">
            <img
              src="/images/branding/default-banner.png"
              alt=""
              class="h-full w-full object-cover"
            />
          </div>

          <p
            v-if="bannerImageError"
            class="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-danger/90 px-3 py-1 font-body text-xs text-white shadow-sm dark:shadow-none backdrop-blur-sm"
          >
            {{ bannerImageError }}
          </p>

          <input
            ref="bannerFileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            @change="handleBannerUpload"
          />
        </div>

        <!-- Branding Details -->
        <div class="relative px-5 sm:px-8 pb-8">
          <!-- Logo overlapping banner -->
          <div
            class="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16 mb-8 px-2 sm:px-0"
          >
            <div
              class="group/avatar relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border-4 border-white dark:border-plum-faint bg-white shadow-xl transition-transform duration-200"
              :class="{ 'cursor-pointer hover:scale-105': canCustomBranding }"
              @click="canCustomBranding && profileFileInput?.click()"
            >
              <img
                v-if="hasProfileImage"
                :src="profileImageUrl!"
                alt="Business Logo"
                class="h-full w-full object-cover"
              />
              <div
                v-else-if="canCustomBranding"
                class="flex h-full w-full items-center justify-center bg-plum-faint"
              >
                <span class="font-display text-3xl font-bold text-plum-muted">{{
                  profileInitial
                }}</span>
              </div>
              <img
                v-else
                src="/images/branding/default-profile.png"
                alt=""
                class="h-full w-full object-cover"
              />
              <div
                v-if="canCustomBranding"
                class="absolute inset-0 flex items-center justify-center bg-plum/0 transition-all duration-200 group-hover/avatar:bg-plum/50"
              >
                <svg
                  class="h-6 w-6 text-white opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            <div class="mb-2">
              <h3 class="font-display text-lg sm:text-xl font-bold text-plum">Business Logo</h3>
              <div class="flex items-center gap-3">
                <p class="font-body text-xs text-plum-muted">Recommended: Square PNG/WebP</p>
                <button
                  v-if="hasProfileImage && canCustomBranding"
                  type="button"
                  class="font-body text-xs font-semibold text-danger cursor-pointer transition-colors hover:text-danger-dark"
                  @click.stop="removeProfileImage"
                >
                  Remove logo
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6">
            <BaseInput
              v-model="form.business_name"
              label="Business Name"
              placeholder="e.g. Kalra Dental Clinic"
              :disabled="!canCustomBranding"
              @update:model-value="onFieldChange"
            />
            <BaseInput
              v-model="form.address"
              label="Business Address"
              placeholder="e.g. 123, Park Avenue, Mumbai"
              :disabled="!canCustomBranding"
              @update:model-value="onFieldChange"
            />
          </div>

          <p v-if="profileImageError" class="mt-2 font-body text-xs text-danger-dark">
            {{ profileImageError }}
          </p>

          <input
            ref="profileFileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            @change="handleProfileUpload"
          />
        </div>
      </BaseCard>

      <!-- ═══ Section: Queue Configuration ═══ -->
      <BaseCard id="queue" class="scroll-mt-32 p-4 sm:p-8">
        <h2 class="mb-6 sm:mb-8 font-display text-xl sm:text-2xl font-bold text-plum">
          Queue Configuration
        </h2>

        <div class="flex flex-col gap-8">
          <BaseInput
            v-model="form.default_queue_name"
            label="Default Queue Name"
            placeholder="e.g. Consultation Room 1"
            @update:model-value="onFieldChange"
          />

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label for="avgServiceMins" class="font-body text-sm font-medium text-plum">
                How long does it typically take to serve one guest? (This is only for estimation)
              </label>
              <span class="font-mono text-lg font-bold text-plum"
                >{{ form.avg_service_mins }}m</span
              >
            </div>
            <BaseSlider
              id="avgServiceMins"
              v-model="form.avg_service_mins"
              :min="1"
              :max="60"
              @update:model-value="onFieldChange"
            />
          </div>
        </div>
      </BaseCard>

      <!-- ═══ Section: Preferences & Notifications ═══ -->
      <BaseCard id="preferences" class="scroll-mt-32 p-4 sm:p-8">
        <h2 class="mb-6 sm:mb-8 font-display text-xl sm:text-2xl font-bold text-plum">
          Preferences
        </h2>

        <div class="divide-y divide-plum-faint">
          <div class="flex items-center justify-between py-4 first:pt-0">
            <div>
              <p class="font-body font-semibold text-plum">Email Alerts</p>
              <p class="font-body text-sm text-plum-muted">Receive updates when queue is busy.</p>
            </div>
            <BaseToggle
              v-model="form.email_notifications"
              aria-label="Toggle email notifications"
              @update:model-value="onFieldChange"
            />
          </div>

          <div class="flex items-center justify-between py-4">
            <div>
              <p class="font-body font-semibold text-plum">Push Notifications</p>
              <p class="font-body text-sm text-plum-muted">Get browser alerts for new arrivals.</p>
            </div>
            <BaseToggle
              v-model="form.push_notifications"
              aria-label="Toggle push notifications"
              @update:model-value="onFieldChange"
            />
          </div>

          <div class="flex items-center justify-between py-4 last:pb-0">
            <div>
              <p class="font-body font-semibold text-plum">Collect Guest Emails</p>
              <p class="font-body text-sm text-plum-muted">Require email when customers join.</p>
            </div>
            <BaseToggle
              v-model="form.collect_emails"
              aria-label="Toggle collect emails from customers"
              @update:model-value="onFieldChange"
            />
          </div>
        </div>
      </BaseCard>

      <SettingsSubscriptionSection
        :subscription="subscription"
        :is-loading="isFetchingSub"
        @refresh="refreshSubscription"
      />

      <SettingsDangerZone />
    </template>

    <!-- Error State -->
    <div
      v-if="error"
      class="rounded-2xl bg-danger/10 p-4 text-center font-body text-sm text-danger-dark"
    >
      {{ error }}
    </div>

    <!-- Sticky Action Bar -->
    <Transition
      enter-active-class="transition duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      enter-from-class="translate-y-20 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-20 opacity-0"
    >
      <SettingsActionBar
        v-if="isDirty"
        :is-saving="isSaving"
        @discard="handleDiscard"
        @save="handleSave"
      />
    </Transition>

    <!-- Image Cropper Modal -->
    <BaseImageCropper
      :is-open="isCropperOpen"
      :image-src="pendingImageSrc"
      :aspect-ratio="cropAspectRatio"
      :title="cropTitle"
      @close="isCropperOpen = false"
      @crop="handleCroppedImage"
    />
  </div>
</template>
