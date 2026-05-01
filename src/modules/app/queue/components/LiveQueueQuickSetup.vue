<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import {
  CheckCircleIcon,
  SparklesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BellRingIcon,
  ShieldCheckIcon,
} from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'

/**
 * @component LiveQueueQuickSetup
 * @description Centralized onboarding and optimization assistant for host dashboard.
 */

const {
  activeQueue,
  hasHostFcmToken,
  handleUpdateSettings,
  handleEnableNotifications,
  isFcmRegistering,
  isLoading,
  error,
} = useLiveQueue()

const LOCALSTORAGE_KEYS = {
  NOTIF: 'queuebuzz_hide_notif_nudge',
  STRICT: 'queuebuzz_hide_strict_tip',
}

const states = ref({
  isNotifDismissed: false,
  isStrictDismissed: false,
  isExpanded: true,
  activeStepId: null as string | null,
  isNotifDenied: false,
})

const browserPermission = ref(
  typeof Notification !== 'undefined' ? Notification.permission : 'default',
)

// Logic Flags
const isStrictModeOff = computed(() => activeQueue.value && !activeQueue.value.strictQueueMode)

/**
 * Step Configuration
 */
const STEPS_CONFIG = [
  {
    id: 'notification',
    num: 2,
    label: 'Push Notifications',
    icon: BellRingIcon,
    check: () => hasHostFcmToken.value && browserPermission.value === 'granted',
    dismissed: () => states.value.isNotifDismissed,
  },
  {
    id: 'strict',
    num: 3,
    label: 'Consistent Calling',
    icon: ShieldCheckIcon,
    check: () => !isStrictModeOff.value,
    dismissed: () => states.value.isStrictDismissed,
  },
]

const steps = computed(() =>
  STEPS_CONFIG.map((s) => ({
    ...s,
    isCompleted: s.check(),
    isDismissed: s.dismissed() && !s.check(),
    isActive: states.value.activeStepId === s.id,
  })),
)

const pendingSteps = computed(() => steps.value.filter((s) => !s.isCompleted && !s.isDismissed))

const visibleSteps = computed(() => steps.value.filter((s) => !s.isDismissed))

const progressPercent = computed(() => {
  const completed = steps.value.filter((s) => s.isCompleted || s.isDismissed).length
  return (completed / STEPS_CONFIG.length) * 100
})

function loadPreferences() {
  states.value.isNotifDismissed = localStorage.getItem(LOCALSTORAGE_KEYS.NOTIF) === 'true'
  states.value.isStrictDismissed = localStorage.getItem(LOCALSTORAGE_KEYS.STRICT) === 'true'
}

function updateBrowserPermission() {
  if (typeof Notification !== 'undefined') {
    browserPermission.value = Notification.permission
    states.value.isNotifDenied = Notification.permission === 'denied'
  }
}

onMounted(() => {
  loadPreferences()
  updateBrowserPermission()

  window.addEventListener('storage', loadPreferences)
  // Re-check permission if user switches back to this tab
  window.addEventListener('focus', updateBrowserPermission)

  if (pendingSteps.value.length > 0) {
    states.value.activeStepId = pendingSteps.value[0].id
  }

  if (pendingSteps.value.length === 0) {
    setTimeout(() => {
      states.value.isExpanded = false
    }, 3000)
  }

  if (window.Notification && Notification.permission === 'denied') {
    states.value.isNotifDenied = true
  }
})

watch(
  pendingSteps,
  (newList, oldList) => {
    // If a task was just finished, jump to next pending one
    if (newList.length < oldList.length && newList.length > 0) {
      states.value.activeStepId = newList[0].id
    }
  },
  { deep: true },
)

function selectStep(id: string) {
  if (!states.value.isExpanded) states.value.isExpanded = true
  states.value.activeStepId = id
}

async function handleEnableNotifs() {
  const queueId = activeQueue.value?.id
  if (!queueId) return

  states.value.isNotifDenied = false
  await handleEnableNotifications(queueId)

  updateBrowserPermission()
}
async function handleToggleStrict() {
  await handleUpdateSettings({ strictQueueMode: true })
  states.value.isStrictDismissed = false
  localStorage.removeItem(LOCALSTORAGE_KEYS.STRICT)
}

function dismissStrictTip() {
  states.value.isStrictDismissed = true
  localStorage.setItem(LOCALSTORAGE_KEYS.STRICT, 'true')
}

watch(activeQueue, () => {
  updateBrowserPermission()
})

function skipTask() {
  const next = pendingSteps.value.find((s) => s.id !== states.value.activeStepId)
  if (next) selectStep(next.id)
}
</script>

<template>
  <div
    v-if="pendingSteps.length > 0"
    class="fixed bottom-18 right-6 z-50 flex flex-col items-end max-w-[340px] w-full"
  >
    <div
      class="w-full flex flex-col bg-white border border-plum/10 rounded-[32px] shadow-[0_24px_64px_rgba(26,10,46,0.16)] overflow-hidden transition-all duration-500"
      :class="states.isExpanded ? 'max-h-[600px]' : 'max-h-[56px]'"
    >
      <!-- Header / Accordion Trigger -->
      <button
        class="w-full flex items-center gap-3 px-5 py-3.5 bg-plum text-sand transition-all hover:bg-plum-soft active:scale-[0.99] group text-left"
        @click="states.isExpanded = !states.isExpanded"
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
          Queue Performance ({{ steps.filter((s) => s.isCompleted || s.isDismissed).length }}/2)
        </span>

        <component
          :is="states.isExpanded ? ChevronDownIcon : ChevronUpIcon"
          class="w-4 h-4 text-sand/40 group-hover:text-sand transition-transform duration-300"
          :class="{ 'rotate-180': states.isExpanded }"
        />
      </button>

      <!-- Content Area -->
      <div v-show="states.isExpanded" class="flex flex-col gap-4 p-4">
        <!-- Navigation Tabs -->
        <div class="flex flex-col gap-1.5">
          <button
            v-for="step in visibleSteps"
            :key="step.id"
            :class="[
              'group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-left w-full cursor-pointer overflow-hidden',
              step.isActive ? 'bg-white border-plum/10 shadow-sm' : 'bg-sand/30 hover:bg-sand/60',
            ]"
            @click="selectStep(step.id)"
          >
            <div
              v-if="step.isActive"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-mint rounded-r"
            />

            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 font-bold text-[9px]',
                step.isCompleted || step.isDismissed
                  ? 'bg-mint text-white'
                  : step.isActive
                    ? 'bg-plum text-sand'
                    : 'bg-plum/5 text-plum/30',
              ]"
            >
              <CheckCircleIcon v-if="step.isCompleted || step.isDismissed" class="w-3 h-3" />
              <span v-else>{{ step.num }}</span>
            </div>

            <div class="flex-1">
              <p
                :class="[
                  'font-body text-[10px] font-bold uppercase tracking-wider transition-colors',
                  step.isCompleted || step.isDismissed
                    ? 'text-plum/20 line-through'
                    : step.isActive
                      ? 'text-plum'
                      : 'text-plum-muted',
                ]"
              >
                {{ step.label }}
              </p>
            </div>

            <component
              :is="step.icon"
              v-if="step.isActive"
              class="w-3.5 h-3.5 text-plum/20"
              :class="step.id === 'notification' && 'animate-pulse'"
            />
            <ChevronUpIcon
              v-else-if="!step.isCompleted && !step.isDismissed"
              class="w-3 h-3 text-plum/10 rotate-90 group-hover:text-plum/30 transition-all font-bold"
            />
          </button>
        </div>

        <div class="h-px bg-plum-faint mx-1" />

        <!-- Detail Wizard -->
        <div class="min-h-[120px] px-1 overflow-hidden">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-x-4 opacity-0"
            enter-to-class="translate-x-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-x-0 opacity-100"
            leave-to-class="-translate-x-4 opacity-0"
          >
            <!-- Step Completed View -->
            <div
              v-if="steps.find((s) => s.id === states.activeStepId)?.isCompleted"
              key="completed"
              class="flex flex-col items-center justify-center py-4 text-center gap-2"
            >
              <div class="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center">
                <CheckCircleIcon class="w-5 h-5 text-mint" />
              </div>
              <p class="font-bold text-plum text-sm">Priority Completed</p>
              <p class="text-[11px] text-plum-muted max-w-[200px]">
                This optimization is already active for your queue.
              </p>
            </div>

            <!-- Email Tool -->

            <!-- Notification Tool -->
            <div v-else-if="states.activeStepId === 'notification'" key="notif" class="space-y-4">
              <div v-if="browserPermission === 'denied'" class="space-y-3">
                <p class="font-body text-xs text-plum-muted leading-relaxed">
                  <span class="font-bold text-danger">Action Required:</span> Your browser has
                  blocked notifications. To fix this:
                </p>
                <div
                  class="bg-sand rounded-2xl p-3 border border-plum/5 space-y-2 text-[11px] text-plum/60"
                >
                  <p class="flex items-center gap-2">
                    <span
                      class="flex-shrink-0 w-4 h-4 rounded-full bg-plum/5 flex items-center justify-center font-bold text-[9px]"
                      >1</span
                    >
                    Click the <span class="font-bold text-plum">Lock Icon</span> (🔒) next to URL
                  </p>
                  <p class="flex items-center gap-2">
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
                <p v-if="error" class="font-body text-[10px] font-bold text-danger px-1">
                  {{ error }}
                </p>
              </div>
            </div>

            <!-- Strict Mode Tool -->
            <div v-else-if="states.activeStepId === 'strict'" key="strict" class="space-y-4">
              <p class="font-body text-xs text-plum-muted leading-relaxed">
                Strict Mode prevents out-of-order guest calling, keeping your intake consistent and
                fair.
              </p>
              <div class="flex gap-2">
                <BaseButton
                  variant="primary"
                  class="flex-1 h-11"
                  :disabled="isLoading"
                  @click="handleToggleStrict"
                >
                  <div
                    class="flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-[11px]"
                  >
                    <ShieldCheckIcon class="w-3.5 h-3.5" />
                    <span>Turn it On</span>
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

        <!-- Skip Action -->
        <div v-if="pendingSteps.length > 1" class="px-1 pb-1">
          <button
            class="w-full py-2.5 rounded-xl border border-dashed border-plum/10 hover:border-plum/20 hover:bg-sand/30 transition-all group flex items-center justify-center"
            @click="skipTask"
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
