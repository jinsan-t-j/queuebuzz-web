<script setup lang="ts">
import { useForm } from 'vee-validate'
import { watch, onMounted } from 'vue'
import * as yup from 'yup'

import SettingsIcon from '@/assets/icons/nav-settings.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useToast } from '@/composables/useToast'
import { useCustomer } from '@/modules/customer/composables/useCustomer'
import { useCustomerStore } from '@/modules/customer/stores/customer.store'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['update:isOpen'])

const { entry, canJoinWithParty, maxAllowedPartySize } = useCustomer()
const store = useCustomerStore()
const { showToast } = useToast()

// Validation Schema
const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name is too short'),
  email: yup.string().email('Please enter a valid email address').nullable().optional(),
  partySize: yup
    .number()
    .required('Party size is required')
    .min(1, 'Minimum 1')
    .max(maxAllowedPartySize.value, `Maximum party size is ${maxAllowedPartySize.value}`),
})

const { errors, defineField, handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    name: entry.value?.name || '',
    email: entry.value?.email || '',
    partySize: entry.value?.partySize || 1,
  },
})

// defineField for v4.14+ (replaces deprecated defineInputBinds)
const [name, nameProps] = defineField('name')
const [email, emailProps] = defineField('email')
const [partySize, _] = defineField('partySize')

// Handle Submission
const onSubmit = handleSubmit(async (formValues) => {
  const success = await store.updateEntry({
    name: formValues.name,
    email: formValues.email || undefined,
    partySize: formValues.partySize,
  })

  if (success) {
    showToast('Settings updated', { type: 'success' })
    emit('update:isOpen', false)
  } else {
    showToast(store.error || 'Failed to update details', { type: 'error' })
  }
})

// Sync initial values when entry changes
watch(
  () => entry.value,
  (newEntry) => {
    if (newEntry && !isSubmitting.value) {
      resetForm({
        values: {
          name: newEntry.name,
          email: newEntry.email || '',
          partySize: newEntry.partySize,
        },
      })
    }
  },
  { deep: true },
)

onMounted(() => {
  if (store.entry) {
    resetForm({
      values: {
        name: store.entry.name,
        email: store.entry.email || '',
        partySize: store.entry.partySize,
      },
    })
  }
})
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('update:isOpen', false)">
    <div class="bg-white p-8 sm:p-10">
      <!-- Header -->
      <div class="mb-8 flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-faint text-plum">
          <SettingsIcon class="h-6 w-6" />
        </div>
        <div>
          <h2 class="font-display text-2xl font-bold text-plum">Settings</h2>
          <p class="font-body text-sm text-plum-muted">Update your details in the queue</p>
        </div>
      </div>

      <form class="space-y-6" @submit.prevent="onSubmit">
        <!-- Name Field -->
        <div class="relative">
          <BaseInput
            v-model="name"
            v-bind="nameProps"
            label="Display Name"
            placeholder="How should the host call you?"
            :error="errors.name"
          />
        </div>

        <!-- Email Field -->
        <div class="relative">
          <BaseInput
            v-model="email"
            v-bind="emailProps"
            label="Recovery Email (Optional)"
            placeholder="To recover your session if disconnected"
            type="email"
            :error="errors.email"
          />
          <p class="mt-1 font-body text-sm text-plum-muted/70">
            Highly recommended to avoid losing your spot if you close the browser.
          </p>
        </div>

        <!-- Party Size Field (Stepper) -->
        <div v-if="canJoinWithParty" class="space-y-2">
          <p class="font-body text-sm font-medium text-plum">Party Size</p>
          <div
            class="flex items-center justify-between rounded-2xl border border-plum-faint bg-plum-faint/30 p-4"
          >
            <p class="font-body text-sm font-semibold text-plum">How many people with you?</p>
            <div class="flex items-center gap-4">
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-plum shadow-sm disabled:opacity-30 border border-plum-faint/10"
                :disabled="partySize <= 1"
                @click="partySize > 1 && partySize--"
              >
                −
              </button>
              <span class="min-w-[20px] text-center font-mono text-lg font-bold text-plum">
                {{ partySize - 1 }}
              </span>
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-plum shadow-sm disabled:opacity-30 border border-plum-faint/10"
                :disabled="partySize >= maxAllowedPartySize"
                @click="partySize < maxAllowedPartySize && partySize++"
              >
                +
              </button>
            </div>
          </div>
          <p v-if="errors.partySize" class="font-body text-sm text-danger">
            {{ errors.partySize }}
          </p>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex flex-col gap-3">
          <BaseButton
            type="submit"
            variant="primary"
            class="w-full py-4 text-base font-bold shadow-xl shadow-mint/20"
            :is-loading="isSubmitting"
          >
            Save Changes
          </BaseButton>

          <BaseButton
            type="button"
            variant="ghost"
            class="w-full text-plum-muted"
            @click="emit('update:isOpen', false)"
          >
            Cancel
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>
