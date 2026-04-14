<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import {
  CheckCircleIcon,
  SparklesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MailIcon,
  BellRingIcon,
  ShieldCheckIcon,
  Loader2Icon,
} from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'

const {
  activeQueue,
  hasHostFcmToken,
  handleUpdateSettings,
  handleEnableNotifications,
  isFcmRegistering,
  isLoading,
} = useLiveQueue()

const HIDE_EMAIL_KEY = 'queuebuzz_hide_email_notice'
const HIDE_NOTIF_KEY = 'queuebuzz_hide_notif_nudge'
const HIDE_TIPS_KEY = 'queuebuzz_hide_strict_tip'

const isEmailNudgeDismissed = ref(false)
const isNotifNudgeDismissed = ref(false)
const isStrictTipDismissed = ref(false)
const isExpanded = ref(true)
const activeStepId = ref<string | null>(null)

const emailValue = ref('')
const emailError = ref<string | null>(null)
const isNotifPermissionDenied = ref(false)

const isRecoveryEmailMissing = computed(() => activeQueue.value && !activeQueue.value.recoveryEmail)
const isStrictModeOff = computed(() => activeQueue.value && !activeQueue.value.strictQueueMode)

const pendingSteps = computed(() => {
  const list = []
  if (isRecoveryEmailMissing.value && !isEmailNudgeDismissed.value) list.push('email')
  if (!hasHostFcmToken.value && !isNotifNudgeDismissed.value) list.push('notification')
  if (isStrictModeOff.value && !isStrictTipDismissed.value) list.push('strict')
  return list
})

const progressPercent = computed(() => {
  const total = 3
  const completed =
    (!isRecoveryEmailMissing.value || isEmailNudgeDismissed.value ? 1 : 0) +
    (hasHostFcmToken.value || isNotifNudgeDismissed.value ? 1 : 0) +
    (!isStrictModeOff.value || isStrictTipDismissed.value ? 1 : 0)
  return (completed / total) * 100
})

onMounted(() => {
  isEmailNudgeDismissed.value = localStorage.getItem(HIDE_EMAIL_KEY) === 'true'
  isNotifNudgeDismissed.value = localStorage.getItem(HIDE_NOTIF_KEY) === 'true'
  isStrictTipDismissed.value = localStorage.getItem(HIDE_TIPS_KEY) === 'true'

  if (pendingSteps.value.length > 0) {
    activeStepId.value = pendingSteps.value[0]
  }

  if (pendingSteps.value.length === 0) {
    setTimeout(() => {
      isExpanded.value = false
    }, 3000)
  }

  // Check if browser has already blocked notifications
  if (window.Notification && Notification.permission === 'denied') {
    isNotifPermissionDenied.value = true
  }
})

watch(
  pendingSteps,
  (newList, oldList) => {
    if (newList.length < oldList.length && newList.length > 0) {
      activeStepId.value = newList[0]
    }
  },
  { deep: true },
)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function selectStep(id: string) {
  if (!isExpanded.value) isExpanded.value = true
  activeStepId.value = id
}

async function handleEmailSubmit() {
  if (!emailValue.value) {
    emailError.value = 'Email is required'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue.value)) {
    emailError.value = 'Invalid email format'
    return
  }
  emailError.value = null
  await handleUpdateSettings({ recoveryEmail: emailValue.value })
}

async function handleEnableNotifs() {
  isNotifPermissionDenied.value = false
  const ok = await handleEnableNotifications(activeQueue.value?.id)
  if (!ok && Notification.permission === 'denied') {
    isNotifPermissionDenied.value = true
  }
}

async function handleToggleStrict() {
  await handleUpdateSettings({ strictQueueMode: true })
}

function dismissStrictTip() {
  isStrictTipDismissed.value = true
  localStorage.setItem(HIDE_TIPS_KEY, 'true')
}
</script>

<template>
  <div
    v-if="pendingSteps.length > 0"
    class="fixed bottom-6 right-6 z-50 flex flex-col items-end max-w-[340px] w-full"
  >
    <div
      class="w-full flex flex-col bg-white border border-plum/10 rounded-[32px] shadow-[0_24px_64px_rgba(26,10,46,0.16)] overflow-hidden transition-all duration-500"
      :class="isExpanded ? 'max-h-[600px]' : 'max-h-[56px]'"
    >
      <button
        class="w-full flex items-center gap-3 px-5 py-3.5 bg-plum text-sand transition-all hover:bg-plum-soft active:scale-[0.99] group text-left"
        @click="toggleExpand"
      >
        <div class="relative flex items-center justify-center w-6 h-6 shrink-0">
          <svg class="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              class="opacity-20"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-dasharray="62.83"
              :stroke-dashoffset="62.83 - (62.83 * progressPercent) / 100"
              class="transition-all duration-700 ease-out text-mint"
            />
          </svg>
          <SparklesIcon v-if="progressPercent < 100" class="w-3 h-3 text-mint" />
          <CheckCircleIcon v-else class="w-3.5 h-3.5 text-mint" />
        </div>

        <span class="font-body text-[11px] font-bold uppercase tracking-[2px] flex-1 text-mint">
          Queue Performance ({{ Math.floor(progressPercent / 33.3) }}/3)
        </span>

        <component
          :is="isExpanded ? ChevronDownIcon : ChevronUpIcon"
          class="w-4 h-4 text-sand/40 group-hover:text-sand transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
        />
      </button>

      <div v-show="isExpanded" class="flex flex-col gap-4 p-4">
        <div class="flex flex-col gap-1.5">
          <!-- Step 1: Email -->
          <button
            v-if="isRecoveryEmailMissing"
            :class="[
              'group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-left w-full cursor-pointer overflow-hidden',
              activeStepId === 'email'
                ? 'bg-white border-plum/10 shadow-sm'
                : 'bg-sand/30 hover:bg-sand/60',
            ]"
            @click="selectStep('email')"
          >
            <div
              v-if="activeStepId === 'email'"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-mint rounded-r"
            />

            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500',
                activeStepId === 'email' ? 'bg-plum text-sand' : 'bg-plum/5 text-plum/30',
              ]"
            >
              <span class="text-[9px] font-bold">1</span>
            </div>

            <div class="flex-1">
              <p
                :class="[
                  'font-body text-[10px] font-bold uppercase tracking-wider transition-colors',
                  activeStepId === 'email' ? 'text-plum' : 'text-plum-muted',
                ]"
              >
                Recovery Email
              </p>
            </div>

            <MailIcon v-if="activeStepId === 'email'" class="w-3.5 h-3.5 text-plum/20" />
            <ChevronUpIcon
              v-else
              class="w-3 h-3 text-plum/10 rotate-90 group-hover:text-plum/30 transition-all font-bold"
            />
          </button>

          <!-- Step 2: Notifications -->
          <button
            v-if="!hasHostFcmToken"
            :class="[
              'group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-left w-full cursor-pointer overflow-hidden',
              activeStepId === 'notification'
                ? 'bg-white border-plum/10 shadow-sm'
                : 'bg-sand/30 hover:bg-sand/60',
            ]"
            @click="selectStep('notification')"
          >
            <div
              v-if="activeStepId === 'notification'"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-mint rounded-r"
            />

            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500',
                activeStepId === 'notification' ? 'bg-plum text-sand' : 'bg-plum/5 text-plum/30',
              ]"
            >
              <span class="text-[9px] font-bold">2</span>
            </div>

            <div class="flex-1">
              <p
                :class="[
                  'font-body text-[10px] font-bold uppercase tracking-wider transition-colors',
                  activeStepId === 'notification' ? 'text-plum' : 'text-plum-muted',
                ]"
              >
                Push Notifications
              </p>
            </div>

            <BellRingIcon
              v-if="activeStepId === 'notification'"
              class="w-3.5 h-3.5 text-plum/20 animate-pulse"
            />
            <ChevronUpIcon
              v-else
              class="w-3 h-3 text-plum/10 rotate-90 group-hover:text-plum/30 transition-all font-bold"
            />
          </button>

          <!-- Step 3: Strict Mode (Discovery) -->
          <button
            v-if="isStrictModeOff"
            :class="[
              'group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-left w-full cursor-pointer overflow-hidden',
              activeStepId === 'strict'
                ? 'bg-white border-plum/10 shadow-sm'
                : 'bg-sand/30 hover:bg-sand/60',
            ]"
            @click="selectStep('strict')"
          >
            <div
              v-if="activeStepId === 'strict'"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-mint rounded-r"
            />

            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500',
                activeStepId === 'strict' ? 'bg-plum text-sand' : 'bg-plum/5 text-plum/30',
              ]"
            >
              <span class="text-[9px] font-bold">3</span>
            </div>

            <div class="flex-1">
              <p
                :class="[
                  'font-body text-[10px] font-bold uppercase tracking-wider transition-colors',
                  activeStepId === 'strict' ? 'text-plum' : 'text-plum-muted',
                ]"
              >
                Consistent Calling
              </p>
            </div>

            <ShieldCheckIcon v-if="activeStepId === 'strict'" class="w-3.5 h-3.5 text-plum/20" />
            <ChevronUpIcon
              v-else
              class="w-3 h-3 text-plum/10 rotate-90 group-hover:text-plum/30 transition-all font-bold"
            />
          </button>
        </div>

        <div class="h-px bg-plum-faint mx-1" />

        <div class="min-h-[120px] px-1">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-x-4 opacity-0"
            enter-to-class="translate-x-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-x-0 opacity-100"
            leave-to-class="-translate-x-4 opacity-0"
          >
            <!-- Email Wizard -->
            <div v-if="activeStepId === 'email' && isRecoveryEmailMissing" class="space-y-3">
              <p class="font-body text-xs text-plum-muted leading-relaxed">
                Add an email to recover your queue session if you accidentally close the browser.
              </p>
              <div class="space-y-2">
                <input
                  v-model="emailValue"
                  type="email"
                  placeholder="Enter recovery email"
                  class="w-full rounded-xl border border-plum/10 bg-sand px-4 py-2.5 font-body text-sm text-plum placeholder:text-plum/30 outline-none transition-all focus:border-mint focus:ring-4 focus:ring-mint/5"
                  :class="{ 'border-danger/50 focus:border-danger': emailError }"
                />
                <p v-if="emailError" class="font-body text-[10px] font-bold text-danger px-1">
                  {{ emailError }}
                </p>
                <BaseButton
                  variant="primary"
                  class="w-full h-11"
                  :disabled="isLoading"
                  @click="handleEmailSubmit"
                >
                  <div class="flex items-center justify-center gap-2">
                    <Loader2Icon v-if="isLoading" class="h-3.5 w-3.5 animate-spin" />
                    <span class="text-[11px] font-bold uppercase tracking-wider"
                      >Secure Access</span
                    >
                  </div>
                </BaseButton>
              </div>
            </div>

            <!-- Notifications Wizard -->
            <div v-else-if="activeStepId === 'notification' && !hasHostFcmToken" class="space-y-4">
              <div v-if="isNotifPermissionDenied" class="space-y-3">
                <p class="font-body text-xs text-plum-muted leading-relaxed">
                  <span class="font-bold text-danger">Action Required:</span> Your browser has
                  blocked notifications. To fix this:
                </p>
                <div class="bg-sand rounded-2xl p-3 border border-plum/5 space-y-2">
                  <p class="font-body text-[11px] text-plum/60 flex items-center gap-2">
                    <span
                      class="flex-shrink-0 w-4 h-4 rounded-full bg-plum/5 flex items-center justify-center font-bold text-[9px]"
                      >1</span
                    >
                    Click the <span class="font-bold text-plum">Lock Icon</span> (🔒) next to the
                    URL
                  </p>
                  <p class="font-body text-[11px] text-plum/60 flex items-center gap-2">
                    <span
                      class="flex-shrink-0 w-4 h-4 rounded-full bg-plum/5 flex items-center justify-center font-bold text-[9px]"
                      >2</span
                    >
                    Reset the <span class="font-bold text-plum">Notifications</span> permission
                  </p>
                </div>
                <BaseButton
                  variant="ghost"
                  class="w-full h-11 !border-plum/10"
                  @click="handleEnableNotifs"
                >
                  <span class="text-[11px] font-bold uppercase tracking-wider"
                    >Try Again After Reset</span
                  >
                </BaseButton>
              </div>
              <div v-else class="space-y-4">
                <p class="font-body text-xs text-plum-muted leading-relaxed">
                  Stay updated in real-time. We'll alert you when new guests join your queue.
                </p>
                <BaseButton
                  variant="primary"
                  class="w-full h-11 !bg-mint !text-plum"
                  :disabled="isFcmRegistering"
                  @click="handleEnableNotifs"
                >
                  <div class="flex items-center justify-center gap-2">
                    <div
                      v-if="isFcmRegistering"
                      class="w-3.5 h-3.5 border-2 border-plum/30 border-t-plum rounded-full animate-spin"
                    />
                    <BellRingIcon v-else class="w-3.5 h-3.5" />
                    <span class="text-[11px] font-bold uppercase tracking-wider"
                      >Enable Live Alerts</span
                    >
                  </div>
                </BaseButton>
              </div>
            </div>

            <!-- Strict Mode (Tip Step) -->
            <div v-else-if="activeStepId === 'strict' && isStrictModeOff" class="space-y-4">
              <p class="font-body text-xs text-plum-muted leading-relaxed">
                <span class="font-bold text-plum">Recommended:</span> Strict Mode prevents
                out-of-order guest calling, keeping your intake consistent and fair.
              </p>
              <div class="flex gap-2">
                <BaseButton
                  variant="primary"
                  class="flex-1 h-11"
                  :disabled="isLoading"
                  @click="handleToggleStrict"
                >
                  <div class="flex items-center justify-center gap-2">
                    <ShieldCheckIcon class="w-3.5 h-3.5" />
                    <span class="text-[11px] font-bold uppercase tracking-wider">Turn it On</span>
                  </div>
                </BaseButton>
                <BaseButton
                  variant="ghost"
                  class="h-11 px-4 !text-plum-muted"
                  @click="dismissStrictTip"
                >
                  <span class="text-[11px] font-bold uppercase">Maybe Later</span>
                </BaseButton>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Footer skip navigation -->
        <div v-if="pendingSteps.length > 1" class="px-1 pb-1">
          <button
            class="w-full py-2.5 rounded-xl border border-dashed border-plum/10 hover:border-plum/20 hover:bg-sand/30 transition-all group flex items-center justify-center gap-2"
            @click="selectStep(pendingSteps.find((id) => id !== activeStepId)!)"
          >
            <span
              class="font-body text-[10px] font-bold uppercase tracking-widest text-plum/40 group-hover:text-plum/60"
            >
              Skip to Next Priority
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
