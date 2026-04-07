<script setup lang="ts">
/**
 * @component LiveQueueSettingsModal
 * @description Modal for updating active queue settings.
 * Includes Queue Name, Avg. Service Time, and Recovery Email.
 */
import { ref, computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import type { QueueRecord } from '@/modules/app/queue/types'

import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'
import BaseToggle from '@/components/base/BaseToggle.vue'
import navSettingsIcon from '@/assets/icons/nav-settings.svg?component'
import CloseIcon from '@/assets/icons/close-x.svg?component'
import TimeIcon from '@/assets/icons/clock-time.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'

const props = defineProps<{
  isOpen: boolean
  queue: QueueRecord | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', values: SubmitValues): void
}>()

interface SubmitValues {
  name: string
  avgServiceMins: number
  recoveryEmail: string | null
  strictQueueMode: boolean
}

const suggestions = ref(['Consultation', 'Food Order', 'Token', 'Registration', 'Service'])

const schema = yup.object({
  queueName: yup
    .string()
    .required('Queue name is required')
    .min(3, 'At least 3 characters')
    .max(50, 'At least 50 characters'),
  avgServiceMins: yup.number().required('Service time is required').min(1).max(60),
  recoveryEmail: yup
    .string()
    .nullable()
    .email('Invalid email address')
    .transform((value) => (value === '' ? null : value)),
  strictQueueMode: yup.boolean(),
})

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    queueName: props.queue?.name || '',
    avgServiceMins: props.queue?.avgServiceMins || 5,
    recoveryEmail: props.queue?.recoveryEmail || null,
    strictQueueMode: props.queue?.strictQueueMode || false,
  },
})

const { value: queueName } = useField<string>('queueName')
const { value: avgServiceMins } = useField<number>('avgServiceMins')
const { value: recoveryEmail } = useField<string | null>('recoveryEmail')
const { value: strictQueueMode } = useField<boolean>('strictQueueMode')

const isRecoveryEmailSet = computed(() => !!props.queue?.recoveryEmail)

// Sync with prop updates
watch(
  () => props.queue,
  (newQueue) => {
    if (newQueue) {
      resetForm({
        values: {
          queueName: newQueue.name,
          avgServiceMins: newQueue.avgServiceMins,
          recoveryEmail: newQueue.recoveryEmail || null,
          strictQueueMode: newQueue.strictQueueMode || false,
        },
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name: values.queueName,
    avgServiceMins: values.avgServiceMins,
    recoveryEmail: values.recoveryEmail,
    strictQueueMode: values.strictQueueMode,
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
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative w-full rounded-[32px] bg-white p-6 shadow-2xl">
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-plum/5">
            <navSettingsIcon class="h-5 w-5 text-plum" />
          </div>
          <h2 class="font-display text-xl font-bold tracking-tight text-plum">Queue Settings</h2>
        </div>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-plum/30 transition-colors hover:text-plum cursor-pointer"
          @click="emit('close')"
        >
          <CloseIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="px-1">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Queue Name -->
          <div
            class="rounded-card border border-plum/5 bg-white p-5 shadow-sm transition-all hover:border-plum/10"
          >
            <label
              class="mb-3 block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-plum/50"
            >
              Queue Name
            </label>
            <div class="relative">
              <input
                v-model="queueName"
                placeholder="What are people queuing for?"
                class="mb-2 w-full border-b border-plum/5 bg-transparent py-2 font-display text-xl font-semibold text-plum placeholder:text-plum/20 outline-none focus:border-mint transition-colors"
                :class="{ 'border-danger': errors.queueName, 'pr-8': queueName }"
              />
              <VerifiedCheckIcon
                v-if="queueName && !errors.queueName"
                class="absolute right-0 top-3 h-5 w-5 text-mint"
              />
            </div>
            <div v-if="errors.queueName" class="mb-3 font-body text-xs text-danger">
              {{ errors.queueName }}
            </div>

            <div class="flex flex-wrap gap-2 mt-4">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                type="button"
                class="rounded-full border border-plum-faint px-3 py-1 font-body text-xs font-medium text-plum/60 transition-colors hover:bg-plum-faint hover:text-plum cursor-pointer"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Avg Service Time -->
          <div
            class="rounded-card border border-plum/5 bg-white p-5 shadow-sm transition-all hover:border-plum/10"
          >
            <div class="flex items-center justify-between mb-4">
              <label
                class="block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-plum/50"
              >
                Avg. Service Time
              </label>
              <div class="flex items-center gap-1.5 rounded-lg bg-mint/10 px-2 py-1">
                <TimeIcon class="h-3 w-3 text-mint" />
                <span class="font-body text-xs font-bold text-mint">{{ avgServiceMins }}m</span>
              </div>
            </div>

            <div class="mt-2">
              <BaseSlider v-model="avgServiceMins" :min="1" :max="60" :step="1" />
              <div
                class="flex justify-between font-body text-[10px] text-plum/40 font-bold uppercase tracking-wider mt-1"
              >
                <span>Quick (1m)</span>
                <span>Relaxed (60m)</span>
              </div>
            </div>
          </div>

          <!-- Strict Calling Mode -->
          <div
            class="rounded-card border border-plum/5 bg-white p-5 shadow-sm transition-all hover:border-plum/10"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <label
                  class="block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-plum/50"
                >
                  Strict Calling Mode
                </label>
                <p class="font-body text-[10px] text-plum/40 leading-relaxed max-w-[200px]">
                  Call next guest only after marking current guest as served.
                </p>
              </div>
              <BaseToggle v-model="strictQueueMode" />
            </div>
          </div>

          <!-- Recovery Email -->
          <div
            class="rounded-card border border-plum/5 bg-white p-5 shadow-sm transition-all hover:border-plum/10"
            :class="{ 'bg-sand/50 opacity-80': isRecoveryEmailSet }"
          >
            <div class="flex items-center justify-between mb-3">
              <label
                class="block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-plum/50"
              >
                Recovery Email
              </label>
              <div v-if="isRecoveryEmailSet" class="flex items-center gap-1">
                <VerifiedCheckIcon class="h-3 w-3 text-mint" />
                <span class="font-body text-[10px] font-bold text-mint uppercase tracking-wider"
                  >Locked</span
                >
              </div>
            </div>

            <div class="relative">
              <input
                v-model="recoveryEmail"
                type="email"
                placeholder="email@example.com"
                :disabled="isRecoveryEmailSet"
                class="w-full border-b border-plum/5 bg-transparent py-2 font-body text-base font-semibold text-plum placeholder:text-plum/20 outline-none transition-all focus:border-mint disabled:cursor-not-allowed"
                :class="{ 'border-danger': errors.recoveryEmail }"
              />
              <p
                v-if="!isRecoveryEmailSet"
                class="mt-2 font-body text-[10px] text-plum/40 leading-relaxed italic"
              >
                * Needed to resume this queue if you close the browser. Cannot be changed once set.
              </p>
              <p v-else class="mt-2 font-body text-[10px] text-plum/40 leading-relaxed">
                Settings locked for security.
              </p>
            </div>
            <div v-if="errors.recoveryEmail" class="mt-2 font-body text-xs text-danger">
              {{ errors.recoveryEmail }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <BaseButton
              type="button"
              variant="ghost"
              class="cursor-pointer"
              @click="$emit('close')"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
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
        </form>
      </div>
    </div>
  </BaseModal>
</template>
