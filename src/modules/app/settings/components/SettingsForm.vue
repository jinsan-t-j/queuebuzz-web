<script setup>
/**
 * @component SettingsForm
 * @description Host account settings logic using vee-validate.
 */
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useDebounceFn } from '@vueuse/core'

import CameraUploadIcon from '@/assets/icons/camera-upload.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import BrandingProIcon from '@/assets/icons/branding-pro.svg?component'
import PlanShieldIcon from '@/assets/icons/plan-shield.svg?component'

import ClearQueueHistoryConfirmModal from './ClearQueueHistoryConfirmModal.vue'
import DeleteAccountConfirmModal from './DeleteAccountConfirmModal.vue'

// Basic Props to emulate user profile data load
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      fullName: 'John Doe',
      publicUrl: 'john-doe-queue',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
      defaultQueueName: 'Main Service Desk',
      estimatedServiceTime: 5,
      idleTimeout: '5 mins',
      gracePeriod: '2 mins',
      emailNotifications: true,
      browserNotifications: false,
      dataRetention: '30 Days',
      collectEmails: true,
    })
  },
  currentPlan: { type: String, default: 'Free' },
  planLimit: { type: String, default: 'Up to 50 queue entries per month.' },
})

const router = useRouter()

// --- Validation & Form Setup ---
const schema = yup.object({
  fullName: yup.string().required('Full name is required'),
  publicUrl: yup.string().required('Public URL is required').matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  phone: yup.string().nullable(),
  defaultQueueName: yup.string().required('Default queue name is required'),
  estimatedServiceTime: yup.number().required().min(1).max(30),
  idleTimeout: yup.string().required(),
  gracePeriod: yup.string().required(),
  emailNotifications: yup.boolean(),
  browserNotifications: yup.boolean(),
  dataRetention: yup.string().required(),
  collectEmails: yup.boolean(),
})

const { handleSubmit, resetForm, errors, meta, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: { ...props.initialData }
})

// --- Fields Setup ---
const { value: fullName } = useField('fullName')
const { value: publicUrl } = useField('publicUrl')
const { value: email } = useField('email')
const { value: phone } = useField('phone')
const { value: defaultQueueName } = useField('defaultQueueName')
const { value: estimatedServiceTime } = useField('estimatedServiceTime')
const { value: idleTimeout } = useField('idleTimeout')
const { value: gracePeriod } = useField('gracePeriod')
const { value: emailNotifications } = useField('emailNotifications')
const { value: browserNotifications } = useField('browserNotifications')
const { value: dataRetention } = useField('dataRetention')
const { value: collectEmails } = useField('collectEmails')

// Options
const idleTimeoutOptions = ['None', '5 mins', '10 mins', '15 mins']
const gracePeriodOptions = ['2 mins', '5 mins', '10 mins']
const dataRetentionOptions = ['24 Hours', '30 Days', '90 Days', 'Forever']

// --- Avatar Upload Logic ---
const avatarInput = ref(null)
const previewAvatarUrl = ref(null)

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function handleAvatarChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    if (previewAvatarUrl.value) URL.revokeObjectURL(previewAvatarUrl.value)
    previewAvatarUrl.value = URL.createObjectURL(file)
  }
}

// Cleanup object URLs to avoid memory leaks
onUnmounted(() => {
  if (previewAvatarUrl.value) {
    URL.revokeObjectURL(previewAvatarUrl.value)
  }
})

// --- Debounced Email Verification ---
const isEmailVerified = ref(true)
const isCheckingEmail = ref(false)
const emailCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const checkEmailVerification = useDebounceFn(async (currentEmail) => {
  if (!currentEmail || errors.value.email) {
    isEmailVerified.value = false
    return
  }
  
  // Check cache first
  const cachedResult = emailCache.get(currentEmail)
  if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_TTL_MS)) {
    isEmailVerified.value = cachedResult.verified
    return
  }

  isCheckingEmail.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))
  // Mock logic: consider domain '@verified.com' or the initial email as verified, rest unverified.
  const verified = currentEmail === props.initialData.email || currentEmail.endsWith('@example.com')
  
  emailCache.set(currentEmail, { verified, timestamp: Date.now() })
  isEmailVerified.value = verified
  isCheckingEmail.value = false
}, 500)

watch(email, (newVal) => {
  isEmailVerified.value = false // reset status while typing
  checkEmailVerification(newVal)
})

// --- Danger Zone Modals ---
const showClearHistoryModal = ref(false)
const showDeleteAccountModal = ref(false)

function onClearHistory() {
  // Call API to clear history, then close
  showClearHistoryModal.value = false
  // Optional: Add a toast notification here
}

function onDeleteAccount() {
  // Call API to delete account, then close and redirect
  showDeleteAccountModal.value = false
  router.push('/login')
}

// --- Form Actions ---
const onSubmit = handleSubmit((values) => {
  // Perform save API call here
  // After saving, you would typically reset the form with the new initial values
  resetForm({ values: { ...values } })
})

function discardChanges() {
  resetForm({ values: props.initialData })
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="pb-24">
    <div class="flex flex-col gap-10">
      <!-- ═══ Section: Profile Information ═══ -->
      <div class="rounded-card border border-ash-border/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 class="mb-6 font-display text-xl text-plum">Profile Information</h2>

        <!-- Avatar row -->
        <div class="mb-6 flex items-center gap-6">
          <button
            type="button"
            class="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-card border-2 border-dashed border-ash-light bg-[#f1f5f9] overflow-hidden relative group cursor-pointer"
            @click="triggerAvatarUpload"
          >
            <template v-if="previewAvatarUrl">
              <img :src="previewAvatarUrl" alt="Avatar Preview" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraUploadIcon class="h-5 w-[22px] text-white" />
              </div>
            </template>
            <template v-else>
              <CameraUploadIcon class="h-5 w-[22px] text-ash" />
              <span class="mt-1 font-body text-[10px] text-ash">Upload</span>
            </template>
          </button>
          
          <input 
            type="file" 
            ref="avatarInput" 
            class="hidden" 
            accept="image/*"
            @change="handleAvatarChange" 
          />

          <div>
            <p class="font-body text-sm font-bold text-plum">Avatar Image</p>
            <p class="font-body text-xs text-ash">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>

        <!-- Form grid -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-6">
          <!-- Full Name -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Full Name
            </label>
            <input
              v-model="fullName"
              placeholder="Enter your name"
              class="w-full rounded-[14px] border px-[18px] py-3 font-body text-base text-plum placeholder:text-ash outline-none transition-colors focus:border-plum"
              :class="errors.fullName ? 'border-red-500' : 'border-plum-faint'"
            />
            <span v-if="errors.fullName" class="text-xs text-red-500 font-body">{{ errors.fullName }}</span>
          </div>

          <!-- Public URL -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Public URL
            </label>
            <div 
              class="flex overflow-hidden rounded-[14px] border transition-colors focus-within:border-plum"
              :class="errors.publicUrl ? 'border-red-500' : 'border-plum-faint'"
            >
              <span class="flex items-center bg-transparent pl-3 font-mono text-xs text-[#64748b]">queuebuzz.com/</span>
              <input
                v-model="publicUrl"
                placeholder="example-domain"
                class="w-full border-none py-3 pr-[18px] font-body text-base text-plum placeholder:text-ash outline-none"
              />
            </div>
            <span v-if="errors.publicUrl" class="text-xs text-red-500 font-body">{{ errors.publicUrl }}</span>
          </div>

          <!-- Email Address -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Email Address
            </label>
            <div class="relative">
              <input
                v-model="email"
                placeholder="email@example.com"
                type="email"
                class="w-full rounded-[14px] border px-[18px] py-3 pr-24 font-body text-base text-plum placeholder:text-ash outline-none transition-colors focus:border-plum"
                :class="errors.email ? 'border-red-500' : 'border-plum-faint'"
              />
              
              <div
                v-if="isCheckingEmail"
                class="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1"
              >
                <div class="h-3 w-3 animate-spin rounded-full border-2 border-plum border-t-transparent"></div>
              </div>
              <div
                v-else-if="isEmailVerified"
                class="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1"
              >
                <VerifiedCheckIcon class="h-3 w-[13px] text-[#4ade80]" />
                <span class="font-body text-[10px] font-bold text-[#4ade80]">VERIFIED</span>
              </div>
            </div>
            <span v-if="errors.email" class="text-xs text-red-500 font-body">{{ errors.email }}</span>
          </div>

          <!-- Phone Number -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Phone Number
            </label>
            <input
              v-model="phone"
              placeholder="Enter your phone number"
              class="w-full rounded-[14px] border border-plum-faint px-[18px] py-3 font-body text-base text-plum placeholder:text-ash outline-none transition-colors focus:border-plum"
            />
          </div>
        </div>
      </div>

      <!-- ═══ Section: Queue Defaults ═══ -->
      <div class="rounded-card border border-ash-border/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 class="mb-6 font-display text-xl text-plum">Queue Defaults</h2>

        <div class="flex flex-col gap-8">
          <!-- Default Queue Name -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Default Queue Name
            </label>
            <input
              v-model="defaultQueueName"
              placeholder="e.g. Main Service Desk"
              class="w-full rounded-[14px] border px-[18px] py-3 font-body text-base text-plum placeholder:text-ash outline-none transition-colors focus:border-plum"
              :class="errors.defaultQueueName ? 'border-red-500' : 'border-plum-faint'"
            />
            <span v-if="errors.defaultQueueName" class="text-xs text-red-500 font-body">{{ errors.defaultQueueName }}</span>
          </div>

          <!-- Estimated Service Time -->
          <div>
            <div class="mb-4 flex items-center justify-between">
              <label class="font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
                Estimated Service Time
              </label>
              <span class="font-mono text-base font-bold text-[#6b21a8]">{{ estimatedServiceTime }}m</span>
            </div>
            <input
              type="range"
              v-model="estimatedServiceTime"
              min="1"
              max="30"
              class="w-full accent-[#6b21a8] h-2 bg-plum/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <!-- Idle Timeout -->
          <div>
            <label class="mb-4 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Idle Timeout
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                v-for="option in idleTimeoutOptions"
                :key="option"
                class="rounded-full px-4 py-2 font-body text-xs font-bold transition-colors"
                :class="
                  idleTimeout === option
                    ? 'bg-plum text-white shadow-sm'
                    : 'border border-plum-faint text-plum hover:bg-plum-faint'
                "
                @click="idleTimeout = option"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Grace Period -->
          <div>
            <label class="mb-4 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Grace Period
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                v-for="option in gracePeriodOptions"
                :key="option"
                class="rounded-full px-4 py-2 font-body text-xs font-bold transition-colors"
                :class="
                  gracePeriod === option
                    ? 'bg-mint text-white shadow-sm'
                    : 'border border-plum-faint text-plum hover:bg-plum-faint'
                "
                @click="gracePeriod = option"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Section: Notifications ═══ -->
      <div class="rounded-card border border-ash-border/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 class="mb-6 font-display text-xl text-plum">Notifications</h2>

        <div class="flex flex-col gap-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-body text-base font-bold text-plum">Email Notifications</p>
              <p class="font-body text-sm text-[#64748b]">Receive alerts when the queue grows rapidly.</p>
            </div>
            <button
              type="button"
              class="relative h-6 w-11 rounded-full transition-colors"
              :class="emailNotifications ? 'bg-mint' : 'bg-ash-light'"
              @click="emailNotifications = !emailNotifications"
            >
              <span
                class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                :class="emailNotifications ? 'left-[22px]' : 'left-0.5'"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-body text-base font-bold text-plum">Browser Notifications</p>
              <p class="font-body text-sm text-[#64748b]">Sound alerts for new customer arrivals.</p>
            </div>
            <button
              type="button"
              class="relative h-6 w-11 rounded-full transition-colors"
              :class="browserNotifications ? 'bg-mint' : 'bg-ash-light'"
              @click="browserNotifications = !browserNotifications"
            >
              <span
                class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                :class="browserNotifications ? 'left-[22px]' : 'left-0.5'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ Section: Custom Branding (PRO) ═══ -->
      <div class="rounded-card border-2 border-dashed border-[#6b21a8]/20 bg-[#f8fafc] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="mb-2 flex justify-end">
          <span class="rounded-sm bg-[#6b21a8] px-2 py-0.5 font-body text-[10px] font-black tracking-tight text-white">PRO</span>
        </div>
        <div class="flex items-start gap-6">
          <BrandingProIcon class="h-[25px] w-[25px] shrink-0 text-[#6b21a8]" />
          <div>
            <h3 class="font-display text-xl text-plum">Custom Branding</h3>
            <p class="mt-2 font-body text-sm text-[#64748b]">
              Set your own logos, colors, and custom domains to match your brand identity.
            </p>
            <router-link to="/premium">
                <button
                type="button"
                class="mt-4 rounded-lg bg-[#6b21a8] px-6 py-2 font-body text-sm font-bold text-white shadow-[0_4px_6px_rgba(107,33,168,0.20),0_10px_15px_rgba(107,33,168,0.20)] transition-colors hover:bg-[#581c87] cursor-pointer"
                >
                Unlock Pro Features
                </button>
            </router-link>
          </div>
        </div>
      </div>

      <!-- ═══ Section: Privacy & Data ═══ -->
      <div class="rounded-card border border-ash-border/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 class="mb-6 font-display text-xl text-plum">Privacy & Data</h2>

        <div class="flex flex-col gap-8">
          <div>
            <label class="mb-4 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Data Retention
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                v-for="option in dataRetentionOptions"
                :key="option"
                class="rounded-full px-4 py-2 font-body text-xs font-bold transition-colors"
                :class="
                  dataRetention === option
                    ? 'border border-[#6b21a8] text-[#6b21a8] bg-[#6b21a8]/5'
                    : 'border border-plum-faint text-plum hover:bg-plum-faint'
                "
                @click="dataRetention = option"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-body text-base font-bold text-plum">Collect User Emails</p>
              <p class="font-body text-sm text-[#64748b]">Ask users for their email when joining the queue.</p>
            </div>
            <button
              type="button"
              class="relative h-6 w-11 rounded-full transition-colors"
              :class="collectEmails ? 'bg-mint' : 'bg-ash-light'"
              @click="collectEmails = !collectEmails"
            >
              <span
                class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                :class="collectEmails ? 'left-[22px]' : 'left-0.5'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ Current Plan Row ═══ -->
      <div class="flex items-center justify-between rounded-card border border-ash-border/60 bg-white px-6 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="flex items-center gap-4">
          <PlanShieldIcon class="h-[21px] w-4 text-[#64748b]" />
          <div>
            <p class="font-body text-base font-bold text-plum">Current Plan: {{ currentPlan }}</p>
            <p class="font-body text-sm text-[#64748b]">{{ planLimit }}</p>
          </div>
        </div>
        <router-link class="font-body text-base font-bold text-[#ec5b13] transition-colors hover:text-warning" to="/premium">
          Upgrade Plan →
        </router-link>
      </div>

      <!-- ═══ Section: Danger Zone ═══ -->
      <div class="rounded-card border border-[#fee2e2] bg-[#fef2f2] p-6">
        <h2 class="mb-6 font-display text-xl text-[#dc2626]">Danger Zone</h2>

        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between rounded-input border border-[#fee2e2] bg-white px-4 py-4">
            <div>
              <p class="font-body text-base font-bold text-[#dc2626]">Delete Queue History</p>
              <p class="font-body text-sm text-[#64748b]">Permanently wipe all past queue records.</p>
            </div>
            <button
              type="button"
              class="rounded-full border border-[#dc2626] px-5 py-1.5 font-body text-sm font-bold text-[#dc2626] transition-colors hover:bg-[#fef2f2]"
              @click="showClearHistoryModal = true"
            >
              Clear History
            </button>
          </div>

          <div class="flex items-center justify-between rounded-input border border-[#fee2e2] bg-white px-4 py-4">
            <div>
              <p class="font-body text-base font-bold text-[#dc2626]">Delete Account</p>
              <p class="font-body text-sm text-[#64748b]">Permanently remove your host profile and all data.</p>
            </div>
            <button
              type="button"
              class="rounded-full bg-[#dc2626] px-5 py-1.5 font-body text-sm font-bold text-white transition-colors hover:bg-[#b91c1c]"
              @click="showDeleteAccountModal = true"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Sticky Footer ═══ -->
    <div class="fixed bottom-0 left-64 right-0 z-40 border-t border-plum-faint bg-sand px-10 py-4">
      <div class="mx-auto flex max-w-[752px] items-center justify-between">
        <div>
          <span v-show="meta.dirty" class="font-body text-sm font-medium text-plum/60 transition-opacity">You have unsaved changes</span>
        </div>
        <div class="flex items-center gap-6">
          <button
            type="button"
            class="font-body text-base font-bold text-[#64748b] transition-colors hover:text-plum disabled:opacity-50 disabled:cursor-not-allowed"
            @click="discardChanges"
            :disabled="isSubmitting || !meta.dirty"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            class="rounded-input bg-[#4ade80] px-8 py-3 font-body text-base font-black text-plum shadow-[0_4px_6px_rgba(74,222,128,0.20),0_10px_15px_rgba(74,222,128,0.20)] transition-colors hover:bg-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting || !meta.dirty"
          >
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ClearQueueHistoryConfirmModal 
      :is-open="showClearHistoryModal" 
      @cancel="showClearHistoryModal = false"
      @confirm="onClearHistory"
    />
    <DeleteAccountConfirmModal 
      :is-open="showDeleteAccountModal" 
      @cancel="showDeleteAccountModal = false"
      @confirm="onDeleteAccount"
    />
  </form>
</template>
