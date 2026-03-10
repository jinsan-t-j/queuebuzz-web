<script setup>
/**
 * @component SettingsView
 * @description Host account settings page. Multi-section form with
 * Profile Information, Queue Defaults, Notifications, Custom Branding (PRO),
 * Privacy & Data, Current Plan, and Danger Zone. Sticky footer with
 * Discard Changes / Save Changes actions.
 *
 * @prop {String} fullName - Host's full name.
 * @prop {String} publicUrl - Host's public URL slug.
 * @prop {String} email - Host's email address.
 * @prop {Boolean} isEmailVerified - Whether email is verified.
 * @prop {String} phone - Host's phone number.
 * @prop {String} defaultQueueName - Default queue name.
 * @prop {Number} estimatedServiceTime - Estimated service time in minutes.
 * @prop {String} idleTimeout - Selected idle timeout value.
 * @prop {String} gracePeriod - Selected grace period value.
 * @prop {Boolean} emailNotifications - Email notifications enabled.
 * @prop {Boolean} browserNotifications - Browser notifications enabled.
 * @prop {String} dataRetention - Selected data retention period.
 * @prop {Boolean} collectEmails - Whether collecting user emails is enabled.
 * @prop {String} currentPlan - Current plan name.
 * @prop {String} planLimit - Plan limit description.
 * @emits {update:full-name} - Full name changed.
 * @emits {update:public-url} - Public URL changed.
 * @emits {update:email} - Email changed.
 * @emits {update:phone} - Phone changed.
 * @emits {update:default-queue-name} - Default queue name changed.
 * @emits {update:estimated-service-time} - Service time changed.
 * @emits {select-idle-timeout} - Idle timeout pill selected.
 * @emits {select-grace-period} - Grace period pill selected.
 * @emits {toggle-email-notifications} - Email notifications toggled.
 * @emits {toggle-browser-notifications} - Browser notifications toggled.
 * @emits {select-data-retention} - Data retention period selected.
 * @emits {toggle-collect-emails} - Collect emails toggled.
 * @emits {upload-avatar} - Avatar upload area clicked.
 * @emits {unlock-pro} - "Unlock Pro Features" clicked.
 * @emits {upgrade-plan} - "Upgrade Plan" clicked.
 * @emits {clear-history} - "Clear History" clicked.
 * @emits {delete-account} - "Delete Account" clicked.
 * @emits {discard-changes} - "Discard Changes" clicked.
 * @emits {save-changes} - "Save Changes" clicked.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import CameraUploadIcon from '@/assets/icons/camera-upload.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import BrandingProIcon from '@/assets/icons/branding-pro.svg?component'
import PlanShieldIcon from '@/assets/icons/plan-shield.svg?component'

// 6. Props
const props = defineProps({
  fullName: {
    type: String,
    default: '',
  },
  publicUrl: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  isEmailVerified: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    default: '',
  },
  defaultQueueName: {
    type: String,
    default: '',
  },
  estimatedServiceTime: {
    type: Number,
    default: 5,
  },
  idleTimeout: {
    type: String,
    default: '5 mins',
  },
  gracePeriod: {
    type: String,
    default: '2 mins',
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  browserNotifications: {
    type: Boolean,
    default: false,
  },
  dataRetention: {
    type: String,
    default: '30 Days',
  },
  collectEmails: {
    type: Boolean,
    default: true,
  },
  currentPlan: {
    type: String,
    default: 'Free',
  },
  planLimit: {
    type: String,
    default: 'Up to 50 queue entries per month.',
  },
})

// 7. Emits
const emit = defineEmits([
  'update:full-name',
  'update:public-url',
  'update:email',
  'update:phone',
  'update:default-queue-name',
  'update:estimated-service-time',
  'select-idle-timeout',
  'select-grace-period',
  'toggle-email-notifications',
  'toggle-browser-notifications',
  'select-data-retention',
  'toggle-collect-emails',
  'upload-avatar',
  'unlock-pro',
  'upgrade-plan',
  'clear-history',
  'delete-account',
  'discard-changes',
  'save-changes',
])

// 8. Composable destructuring

// 9. Reactive state
const idleTimeoutOptions = ref(['None', '5 mins', '10 mins', '15 mins'])
const gracePeriodOptions = ref(['2 mins', '5 mins', '10 mins'])
const dataRetentionOptions = ref(['24 Hours', '30 Days', '90 Days', 'Forever'])

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="mx-auto max-w-[752px] pb-24">
    <!-- ═══ Page Title ═══ -->
    <div class="mb-10">
      <h1 class="font-display text-4xl text-plum">Host Settings</h1>
      <p class="mt-2 font-body text-base text-[#64748b]">
        Manage your account preferences and queue configurations.
      </p>
    </div>

    <div class="flex flex-col gap-10">
      <!-- ═══ Section: Profile Information ═══ -->
      <div class="rounded-card border border-ash-border/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 class="mb-6 font-display text-xl text-plum">Profile Information</h2>

        <!-- Avatar row -->
        <div class="mb-6 flex items-center gap-6">
          <button
            class="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-card border-2 border-dashed border-ash-light bg-[#f1f5f9]"
            @click="emit('upload-avatar')"
          >
            <CameraUploadIcon class="h-5 w-[22px] text-ash" />
            <span class="mt-1 font-body text-[10px] text-ash">Upload</span>
          </button>
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
              :value="fullName"
              placeholder="Enter your name"
              class="w-full rounded-[14px] border border-plum-faint px-[18px] py-3 font-body text-base text-plum placeholder:text-ash outline-none focus:border-plum"
              @input="emit('update:full-name', $event.target.value)"
            />
          </div>

          <!-- Public URL -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Public URL
            </label>
            <div class="flex overflow-hidden rounded-[14px] border border-plum-faint">
              <span class="flex items-center bg-transparent px-3 font-mono text-xs text-[#64748b]">qb.io/</span>
              <input
                :value="publicUrl"
                placeholder="example-domain"
                class="w-full border-none py-3 pr-[18px] font-body text-base text-ash placeholder:text-ash outline-none"
                @input="emit('update:public-url', $event.target.value)"
              />
            </div>
          </div>

          <!-- Email Address -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Email Address
            </label>
            <div class="relative">
              <input
                :value="email"
                placeholder="email@example.com"
                type="email"
                class="w-full rounded-[14px] border border-plum-faint px-[18px] py-3 font-body text-base text-ash placeholder:text-ash outline-none focus:border-plum"
                @input="emit('update:email', $event.target.value)"
              />
              <div
                v-if="isEmailVerified"
                class="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1"
              >
                <VerifiedCheckIcon class="h-3 w-[13px] text-[#4ade80]" />
                <span class="font-body text-[10px] font-bold text-[#4ade80]">VERIFIED</span>
              </div>
            </div>
          </div>

          <!-- Phone Number -->
          <div>
            <label class="mb-2 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Phone Number
            </label>
            <input
              :value="phone"
              placeholder="Enter your phone number"
              class="w-full rounded-[14px] border border-plum-faint px-[18px] py-3 font-body text-base text-ash placeholder:text-ash outline-none focus:border-plum"
              @input="emit('update:phone', $event.target.value)"
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
              :value="defaultQueueName"
              placeholder="e.g. Main Service Desk"
              class="w-full rounded-[14px] border border-plum-faint px-[18px] py-3 font-body text-base text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-plum"
              @input="emit('update:default-queue-name', $event.target.value)"
            />
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
              :value="estimatedServiceTime"
              min="1"
              max="30"
              class="w-full accent-[#6b21a8]"
              @input="emit('update:estimated-service-time', Number($event.target.value))"
            />
          </div>

          <!-- Idle Timeout -->
          <div>
            <label class="mb-4 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Idle Timeout
            </label>
            <div class="flex gap-2">
              <button
                v-for="option in idleTimeoutOptions"
                :key="option"
                class="rounded-full px-4 py-2 font-body text-xs font-bold transition-colors"
                :class="
                  idleTimeout === option
                    ? 'bg-plum text-white'
                    : 'border border-plum-faint text-plum hover:bg-plum-faint'
                "
                @click="emit('select-idle-timeout', option)"
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
                v-for="option in gracePeriodOptions"
                :key="option"
                class="rounded-full px-4 py-2 font-body text-xs font-bold transition-colors"
                :class="
                  gracePeriod === option
                    ? 'bg-mint text-white'
                    : 'border border-plum-faint text-plum hover:bg-plum-faint'
                "
                @click="emit('select-grace-period', option)"
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
          <!-- Email Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <p class="font-body text-base font-bold text-plum">Email Notifications</p>
              <p class="font-body text-sm text-[#64748b]">Receive alerts when the queue grows rapidly.</p>
            </div>
            <button
              class="relative h-6 w-11 rounded-full transition-colors"
              :class="emailNotifications ? 'bg-mint' : 'bg-ash-light'"
              @click="emit('toggle-email-notifications')"
            >
              <span
                class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                :class="emailNotifications ? 'left-[22px]' : 'left-0.5'"
              />
            </button>
          </div>

          <!-- Browser Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <p class="font-body text-base font-bold text-plum">Browser Notifications</p>
              <p class="font-body text-sm text-[#64748b]">Sound alerts for new customer arrivals.</p>
            </div>
            <button
              class="relative h-6 w-11 rounded-full transition-colors"
              :class="browserNotifications ? 'bg-mint' : 'bg-ash-light'"
              @click="emit('toggle-browser-notifications')"
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
        <!-- PRO badge -->
        <div class="mb-2 flex justify-end">
          <span class="rounded-sm bg-[#6b21a8] px-2 py-0.5 font-body text-[10px] font-black tracking-tight text-white">
            PRO
          </span>
        </div>

        <div class="flex items-start gap-6">
          <BrandingProIcon class="h-[25px] w-[25px] shrink-0 text-[#6b21a8]" />
          <div>
            <h3 class="font-display text-xl text-plum">Custom Branding</h3>
            <p class="mt-2 font-body text-sm text-[#64748b]">
              Set your own logos, colors, and custom domains to match your brand identity.
            </p>
            <button
              class="mt-4 rounded-lg bg-[#6b21a8] px-6 py-2 font-body text-sm font-bold text-white shadow-[0_4px_6px_rgba(107,33,168,0.20),0_10px_15px_rgba(107,33,168,0.20)] transition-colors hover:bg-[#581c87]"
              @click="emit('unlock-pro')"
            >
              Unlock Pro Features
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ Section: Privacy & Data ═══ -->
      <div class="rounded-card border border-ash-border/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 class="mb-6 font-display text-xl text-plum">Privacy & Data</h2>

        <div class="flex flex-col gap-8">
          <!-- Data Retention -->
          <div>
            <label class="mb-4 block font-body text-xs font-bold uppercase tracking-[0.6px] text-[#64748b]">
              Data Retention
            </label>
            <div class="flex gap-2">
              <button
                v-for="option in dataRetentionOptions"
                :key="option"
                class="rounded-full px-4 py-2 font-body text-xs font-bold transition-colors"
                :class="
                  dataRetention === option
                    ? 'border border-[#6b21a8] text-[#6b21a8]'
                    : 'border border-plum-faint text-plum hover:bg-plum-faint'
                "
                @click="emit('select-data-retention', option)"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Collect User Emails -->
          <div class="flex items-center justify-between">
            <div>
              <p class="font-body text-base font-bold text-plum">Collect User Emails</p>
              <p class="font-body text-sm text-[#64748b]">Ask users for their email when joining the queue.</p>
            </div>
            <button
              class="relative h-6 w-11 rounded-full transition-colors"
              :class="collectEmails ? 'bg-mint' : 'bg-ash-light'"
              @click="emit('toggle-collect-emails')"
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
        <button
          class="font-body text-base font-bold text-[#ec5b13] transition-colors hover:text-warning"
          @click="emit('upgrade-plan')"
        >
          Upgrade Plan →
        </button>
      </div>

      <!-- ═══ Section: Danger Zone ═══ -->
      <div class="rounded-card border border-[#fee2e2] bg-[#fef2f2] p-6">
        <h2 class="mb-6 font-display text-xl text-[#dc2626]">Danger Zone</h2>

        <div class="flex flex-col gap-4">
          <!-- Delete Queue History -->
          <div class="flex items-center justify-between rounded-input border border-[#fee2e2] bg-white px-4 py-4">
            <div>
              <p class="font-body text-base font-bold text-[#dc2626]">Delete Queue History</p>
              <p class="font-body text-sm text-[#64748b]">Permanently wipe all past queue records.</p>
            </div>
            <button
              class="rounded-full border border-[#dc2626] px-5 py-1.5 font-body text-sm font-bold text-[#dc2626] transition-colors hover:bg-[#fef2f2]"
              @click="emit('clear-history')"
            >
              Clear History
            </button>
          </div>

          <!-- Delete Account -->
          <div class="flex items-center justify-between rounded-input border border-[#fee2e2] bg-white px-4 py-4">
            <div>
              <p class="font-body text-base font-bold text-[#dc2626]">Delete Account</p>
              <p class="font-body text-sm text-[#64748b]">Permanently remove your host profile and all data.</p>
            </div>
            <button
              class="rounded-full bg-[#dc2626] px-5 py-1.5 font-body text-sm font-bold text-white transition-colors hover:bg-[#b91c1c]"
              @click="emit('delete-account')"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Sticky Footer ═══ -->
    <div class="fixed bottom-0 left-64 right-0 border-t border-plum-faint bg-sand px-10 py-4">
      <div class="mx-auto flex max-w-[752px] items-center justify-end gap-6">
        <button
          class="font-body text-base font-bold text-[#64748b] transition-colors hover:text-plum"
          @click="emit('discard-changes')"
        >
          Discard Changes
        </button>
        <button
          class="rounded-input bg-[#4ade80] px-8 py-3 font-body text-base font-black text-plum shadow-[0_4px_6px_rgba(74,222,128,0.20),0_10px_15px_rgba(74,222,128,0.20)] transition-colors hover:bg-[#22c55e]"
          @click="emit('save-changes')"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>
