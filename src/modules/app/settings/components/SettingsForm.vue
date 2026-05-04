<script setup lang="ts">
/**
 * @component SettingsForm
 * @description Refactored Host settings form using settingsStore and Base components.
 */
import { ref, onMounted, computed, defineAsyncComponent, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useSettingsStore } from '@/stores/settings.store'

import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseToggle from '@/components/base/BaseToggle.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'
import BaseCard from '@/components/base/BaseCard.vue'

const BaseImageCropper = defineAsyncComponent(
  () => import('@/components/base/BaseImageCropper.vue'),
)

const ClearQueueHistoryConfirmModal = defineAsyncComponent(
  () => import('./ClearQueueHistoryConfirmModal.vue'),
)
const DeleteAccountConfirmModal = defineAsyncComponent(
  () => import('./DeleteAccountConfirmModal.vue'),
)
import router from '@/router'

const settingsStore = useSettingsStore()
const { userSettings, isLoading, isSaving, error } = storeToRefs(settingsStore)

// Local form state
const form = ref({
  name: '',
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
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Cropper state
const isCropperOpen = ref(false)
const pendingImageSrc = ref<string | null>(null)
const cropType = ref<'profile' | 'banner'>('profile')
const cropAspectRatio = computed(() => (cropType.value === 'profile' ? 1 : 16 / 5))
const cropTitle = computed(() =>
  cropType.value === 'profile' ? 'Crop Profile Photo' : 'Crop Cover Banner',
)

// Modals state
const showClearHistoryModal = ref(false)
const showDeleteAccountModal = ref(false)

// File input refs
const profileFileInput = ref<HTMLInputElement | null>(null)
const bannerFileInput = ref<HTMLInputElement | null>(null)

const hasProfileImage = computed(() => !!profileImageUrl.value)
const hasBannerImage = computed(() => !!bannerImageUrl.value)

onMounted(async () => {
  if (!userSettings.value) {
    await settingsStore.fetchSettings()
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
  if (!ACCEPTED_TYPES.includes(file.type)) {
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

function handleDiscard() {
  syncForm()
}

async function confirmClearHistory() {
  await settingsStore.clearAllHistory()
  showClearHistoryModal.value = false
}

async function confirmDeleteAccount() {
  await settingsStore.deleteHostAccount()
  showDeleteAccountModal.value = false
  if (!error.value) {
    router.push('/login')
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
      <!-- ═══ Section: Profile & Branding ═══ -->
      <BaseCard id="profile" class="overflow-hidden">
        <!-- Banner area (edge-to-edge, inside card border-radius) -->
        <div class="group relative cursor-pointer" @click="bannerFileInput?.click()">
          <!-- Banner Preview -->
          <div v-if="hasBannerImage" class="relative aspect-[16/5] w-full">
            <img :src="bannerImageUrl!" alt="Banner preview" class="h-full w-full object-cover" />
            <!-- Hover overlay -->
            <div
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

          <!-- Banner empty state -->
          <div
            v-else
            class="flex aspect-[16/5] w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-plum-faint/60 via-sand to-mint-light/30 transition-all duration-200 group-hover:from-plum-faint/80"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:shadow-none backdrop-blur-sm"
            >
              <svg
                class="h-5 w-5 text-plum-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p class="font-body text-xs font-medium text-plum-muted">Add a cover banner</p>
            <p class="font-body text-[10px] text-plum-muted">
              16:5 · JPEG, PNG, WebP, GIF · Max 5MB
            </p>
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

        <!-- Profile avatar + info — overlaps the banner bottom edge -->
        <div class="relative px-8 pb-8">
          <!-- Avatar row (pulled up to overlap banner) -->
          <div class="flex items-end gap-5 -mt-10">
            <!-- Uploadable avatar circle -->
            <div
              class="group/avatar relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-4 border-white dark:border-plum-faint bg-white shadow-lg dark:shadow-none transition-transform duration-200 hover:scale-105"
              @click="profileFileInput?.click()"
            >
              <img
                v-if="hasProfileImage"
                :src="profileImageUrl!"
                alt="Profile"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-plum-faint font-display text-2xl font-bold text-plum"
              >
                {{ form.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>

              <!-- Camera hover overlay -->
              <div
                class="absolute inset-0 flex items-center justify-center rounded-full bg-plum/0 transition-all duration-200 group-hover/avatar:bg-plum/50"
              >
                <svg
                  class="h-5 w-5 text-white opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100"
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

            <!-- Name + subtitle -->
            <div class="mb-1 min-w-0 flex-1">
              <p class="truncate font-display text-lg font-bold text-plum">
                {{ form.name || 'Your Name' }}
              </p>
              <div class="flex items-center gap-3">
                <p class="font-body text-xs text-plum-muted">
                  Your public profile seen by customers
                </p>
                <button
                  v-if="hasProfileImage"
                  class="font-body text-xs font-semibold text-danger-dark cursor-pointer transition-colors hover:text-danger-dark/80"
                  @click.stop="removeProfileImage"
                >
                  Remove photo
                </button>
              </div>
            </div>
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

          <!-- Divider -->
          <div class="my-8 h-px bg-plum-faint" />

          <!-- Form fields -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BaseInput
              v-model="form.name"
              label="Full Name"
              placeholder="e.g. Dr. Rajan Kalra"
              @update:model-value="onFieldChange"
            />
            <BaseInput
              :model-value="userSettings.email"
              label="Email Address"
              disabled
              helper="Email cannot be changed."
            />
            <BaseInput
              v-model="form.phone"
              label="Phone Number"
              placeholder="+91 98765 43210"
              @update:model-value="onFieldChange"
            />
          </div>
        </div>
      </BaseCard>

      <!-- ═══ Section: Queue Configuration ═══ -->
      <BaseCard id="queue" class="p-8">
        <h2 class="mb-8 font-display text-2xl font-bold text-plum">Queue Configuration</h2>

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
      <BaseCard id="preferences" class="p-8">
        <h2 class="mb-8 font-display text-2xl font-bold text-plum">Preferences</h2>

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

      <!-- ═══ Section: Danger Zone ═══ -->
      <div id="danger" class="rounded-[32px] border border-danger/20 bg-danger/5 p-8">
        <h2 class="mb-6 font-display text-2xl font-bold text-danger-dark">Danger Zone</h2>

        <div class="flex flex-col gap-4">
          <div
            class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm dark:shadow-none border border-danger/10"
          >
            <div>
              <p class="font-body font-bold text-plum">Clear Queue History</p>
              <p class="font-body text-sm text-plum-muted">
                Wipe all past session records permanently.
              </p>
            </div>
            <BaseButton variant="danger" size="sm" @click="showClearHistoryModal = true">
              Clear All
            </BaseButton>
          </div>

          <div
            class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm dark:shadow-none border border-danger/10"
          >
            <div>
              <p class="font-body font-bold text-plum text-danger-dark">Delete Account</p>
              <p class="font-body text-sm text-plum-muted">
                Permanently remove your profile and all data.
              </p>
            </div>
            <BaseButton variant="danger" size="sm" @click="showDeleteAccountModal = true">
              Delete Me
            </BaseButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div
      v-if="error"
      class="rounded-2xl bg-danger/10 p-4 text-center font-body text-sm text-danger-dark"
    >
      {{ error }}
    </div>

    <!-- Sticky Action Bar -->
    <div
      v-if="isDirty"
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-plum-faint bg-white/80 dark:bg-plum-soft/80 backdrop-blur-md px-6 py-4 md:left-64"
    >
      <div class="mx-auto flex max-w-3xl items-center justify-between">
        <p class="font-body text-sm font-medium text-plum">You have unsaved changes</p>
        <div class="flex gap-4">
          <BaseButton variant="ghost" @click="handleDiscard">Discard</BaseButton>
          <BaseButton :is-loading="isSaving" @click="handleSave">Save Changes</BaseButton>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ClearQueueHistoryConfirmModal
      :is-open="showClearHistoryModal"
      :is-loading="isLoading"
      @cancel="showClearHistoryModal = false"
      @confirm="confirmClearHistory"
    />
    <DeleteAccountConfirmModal
      :is-open="showDeleteAccountModal"
      :is-loading="isLoading"
      @cancel="showDeleteAccountModal = false"
      @confirm="confirmDeleteAccount"
    />

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
