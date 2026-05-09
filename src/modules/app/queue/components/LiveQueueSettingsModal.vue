<script setup lang="ts">
/**
 * @component LiveQueueSettingsModal
 * @description Modal for updating active queue settings.
 * Includes Queue Name and Avg. Service Time.
 */
import { useForm, useField } from 'vee-validate'
import { ref, computed, watch } from 'vue'
import * as yup from 'yup'

import TimeIcon from '@/assets/icons/clock-time.svg?component'
import CloseIcon from '@/assets/icons/close-x.svg?component'
import navSettingsIcon from '@/assets/icons/nav-settings.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'
import BaseToggle from '@/components/base/BaseToggle.vue'
import type { QueueRecord } from '@/modules/app/queue/types'

const props = defineProps<{
  isOpen: boolean
  queue: QueueRecord | null
  isLoading?: boolean
  manualPositioning?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', values: SubmitValues): void
  (e: 'update:is-open', value: boolean): void
}>()

interface SubmitValues {
  name: string
  avgServiceMins: number
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
  strictQueueMode: yup.boolean(),
})

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    queueName: props.queue?.name || '',
    avgServiceMins: props.queue?.avgServiceMins || 5,
    strictQueueMode: props.queue?.strictQueueMode || false,
  },
})

const { value: queueName } = useField<string>('queueName')
const { value: avgServiceMins } = useField<number>('avgServiceMins')
const { value: strictQueueMode } = useField<boolean>('strictQueueMode')

// Sync with prop updates
watch(
  () => props.queue,
  (newQueue) => {
    if (newQueue) {
      resetForm({
        values: {
          queueName: newQueue.name,
          avgServiceMins: newQueue.avgServiceMins,
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
  <BaseModal
    :is-open="isOpen"
    @update:is-open="$emit('update:is-open', $event)"
    @close="emit('close')"
  >
    <div class="relative w-full p-6">
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-plum/5 dark:bg-plum-faint/10"
          >
            <navSettingsIcon class="h-5 w-5 text-plum" />
          </div>
          <h2 class="font-display text-xl font-bold tracking-tight text-plum">Queue Settings</h2>
        </div>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full bg-sand dark:bg-plum-faint/20 text-plum/30 transition-colors hover:text-plum cursor-pointer"
          @click="emit('close')"
        >
          <CloseIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="px-1">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <!-- Queue Name -->
          <div
            class="rounded-card border border-plum/5 dark:border-plum-faint bg-white p-5 shadow-sm dark:shadow-none transition-all hover:border-plum/10 dark:hover:border-plum/20"
          >
            <label for="queueName" class="mb-3 block font-body text-sm font-semibold text-plum/50">
              Queue Name
            </label>
            <div class="relative">
              <input
                id="queueName"
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
                class="rounded-full border border-plum-faint dark:border-plum-faint/50 px-3 py-1 font-body text-xs font-medium text-plum/60 transition-colors hover:bg-plum-faint dark:hover:bg-plum-faint/20 hover:text-plum cursor-pointer"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Avg Service Time -->
          <div
            class="rounded-card border border-plum/5 dark:border-plum-faint bg-white p-5 shadow-sm dark:shadow-none transition-all hover:border-plum/10 dark:hover:border-plum/20"
          >
            <div class="flex items-center justify-between mb-4">
              <label
                for="avgServiceMins"
                class="block font-body text-sm font-semibold text-plum/50"
              >
                How long does it typically take to serve one guest? (This is only for estimation)
              </label>
              <div class="flex items-center gap-1.5 rounded-lg bg-mint/10 px-2 py-1">
                <TimeIcon class="h-3 w-3 text-mint" />
                <span class="font-body text-sm font-semibold text-mint">{{ avgServiceMins }}m</span>
              </div>
            </div>

            <div class="mt-2">
              <BaseSlider
                id="avgServiceMins"
                v-model="avgServiceMins"
                :min="1"
                :max="60"
                :step="1"
              />
              <div class="flex justify-between font-body text-xs text-plum/40 font-semibold mt-1">
                <span>Quick (1m)</span>
                <span>Relaxed (60m)</span>
              </div>
            </div>
          </div>

          <!-- Strict Calling Mode -->
          <div
            v-if="!manualPositioning"
            class="rounded-card border border-plum/5 dark:border-plum-faint bg-white p-5 shadow-sm dark:shadow-none transition-all hover:border-plum/10 dark:hover:border-plum/20"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1">
                <label
                  for="strictQueueMode"
                  class="block font-body text-sm font-semibold text-plum/50"
                >
                  Strict Calling Mode
                </label>
                <p class="font-body text-xs text-plum/40 leading-relaxed">
                  Call next guest only after marking current guest as served.
                </p>
              </div>
              <BaseToggle
                id="strictQueueMode"
                v-model="strictQueueMode"
                aria-label="Toggle strict queue mode"
              />
            </div>
          </div>

          <!-- Recovery Email section removed -->

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
