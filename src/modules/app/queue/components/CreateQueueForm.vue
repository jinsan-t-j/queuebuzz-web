<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useQueueStore } from '@/stores/queue.store'
import { useAuthStore } from '@/stores/auth.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useSettingsStore } from '@/stores/settings.store'
import { storeToRefs } from 'pinia'
import { useToast } from '@/composables/useToast'
import { createQueue, checkSlugAvailability } from '@/modules/app/queue/actions/queue.action'
import CopyCodeIcon from '@/assets/icons/copy-code.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import BaseToggle from '@/components/base/BaseToggle.vue'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (val: string) => ['host', 'guest'].includes(val),
  },
})

const emit = defineEmits(['queue-created'])

const { showToast } = useToast()

const router = useRouter()
const queueStore = useQueueStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { userSettings } = storeToRefs(settingsStore)

onMounted(async () => {
  if (props.role === 'host') {
    if (!userSettings.value) {
      await settingsStore.fetchSettings()
    }
    if (userSettings.value) {
      queueName.value = userSettings.value.settings?.defaultQueueName || 'Main Queue'
      serviceTime.value = userSettings.value.settings?.avgServiceMins || 5
      collectEmails.value = userSettings.value.settings?.collectEmails ?? false
    }
  }
})

const suggestions = ref(['Consultation', 'Food Order', 'Token', 'Registration', 'Service'])
const isSubmitting = ref(false)

const schema = computed(() => {
  const baseSchema = {
    queueName: yup
      .string()
      .required('Queue name is required')
      .max(50, 'Queue name must be at most 50 characters'),
    serviceTime: yup.number().required('Service time is required').min(1).max(30),
    allowPartyJoining: yup.boolean().default(false),
    maxPartySize: yup.number().when('allowPartyJoining', {
      is: true,
      then: (schema) => schema.required('Limit is required').min(1).max(50),
      otherwise: (schema) => schema.notRequired(),
    }),
    collectEmails: yup.boolean().default(false),
  }

  if (props.role === 'host') {
    return yup.object({
      ...baseSchema,
      slug: yup
        .string()
        .nullable()
        .matches(/^[a-z0-9-]+$/, {
          excludeEmptyString: true,
          message: 'Only lowercase letters, numbers, and hyphens allowed',
        }),
    })
  } else {
    return yup.object(baseSchema)
  }
})

const { handleSubmit, errors, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: {
    queueName: null,
    serviceTime: 5,
    allowPartyJoining: false,
    maxPartySize: 5,
    slug: null,
    collectEmails: false,
  },
})

// Fields setup
const { value: queueName } = useField<string | null>('queueName')
const { value: serviceTime } = useField<number>('serviceTime')
const { value: allowPartyJoining } = useField<boolean>('allowPartyJoining')
const { value: maxPartySize } = useField<number>('maxPartySize')
const { value: slug } = useField<string | null>('slug')
const { value: collectEmails } = useField<boolean>('collectEmails')

function selectSuggestion(suggestion) {
  queueName.value = suggestion
}

const isCheckingSlug = ref(false)

const checkSlug = useDebounceFn(async (currentSlug) => {
  if (!currentSlug) return
  try {
    const isAvailable = await checkSlugAvailability(currentSlug)
    if (!isAvailable) {
      setFieldError('slug', 'This link is already taken')
    }
  } finally {
    isCheckingSlug.value = false
  }
}, 500)

watch(slug, (newSlug) => {
  if (newSlug) {
    if (errors.value.slug) setFieldError('slug', undefined)
    isCheckingSlug.value = true
    checkSlug(newSlug)
  } else {
    isCheckingSlug.value = false
  }
})

const onSubmit = handleSubmit(async (values) => {
  if (errors.value.slug || isCheckingSlug.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const payload = {
      name: values.queueName,
      avgServiceMins: Number(values.serviceTime),
      slug: values.slug,
      allowPartyJoining: values.allowPartyJoining,
      maxPartySize: values.allowPartyJoining ? Number(values.maxPartySize) : 1,
      collectEmails: values.collectEmails,
    }
    const queue = await createQueue(payload)
    if (queue) {
      queueStore.setActiveQueue(queue)

      if (props.role === 'guest') {
        authStore.setGuestSession(queue.id)
      }

      useDashboardStore().setDirty()
      emit('queue-created', queue)
    }
  } catch (err) {
    const error = err as { response?: { data?: { error?: string } }; message?: string }
    const msg = error.response?.data?.error || error.message || 'Something went wrong'
    showToast(msg, { type: 'error' })
  } finally {
    isSubmitting.value = false
  }
})

function handleCancel() {
  router.back()
}

// Clipboard setups for Host view's slug and Success Modal
const { copy: copyToClipboard } = useClipboard()
const isSlugCopied = ref(false)

function copyCustomLink() {
  const customLink = `https://queuebuzz.com/${slug.value}`
  copyToClipboard(customLink)
  isSlugCopied.value = true
  setTimeout(() => (isSlugCopied.value = false), 2000)
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="mt-8 flex flex-col gap-5">
      <!-- ═══ Card 1: Queue Name ═══ -->
      <div class="rounded-card border border-plum-faint bg-white p-6 shadow-sm dark:shadow-none">
        <label for="queueName" class="mb-3 block font-body text-sm font-medium text-plum-muted">
          Queue Name
        </label>
        <input
          id="queueName"
          v-model="queueName"
          placeholder=" What are people queuing for?"
          class="mb-2 w-full border-none bg-transparent font-display text-[22px] font-semibold text-plum placeholder:text-plum/20 outline-none"
          :class="{
            'placeholder:text-red-500/50 text-red-500': errors.queueName,
            'text-plum': !errors.queueName,
          }"
        />
        <div v-if="errors.queueName" class="mb-3 font-body text-sm text-red-500">
          {{ errors.queueName }}
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            class="rounded-full border border-plum-faint px-4 py-1.5 font-body text-sm font-medium text-plum-muted transition-colors hover:bg-plum-faint cursor-pointer"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- ═══ Card 2: Service Time ═══ -->
      <div
        class="rounded-card border border-plum-faint bg-white p-6 shadow-sm dark:shadow-none relative"
      >
        <label for="serviceTime" class="block font-body text-sm font-medium text-plum-muted">
          How long does it typically take to serve one guest?
        </label>

        <div class="mt-8 flex flex-col gap-4 relative">
          <!-- Value callout tooltip over slider -->
          <div class="flex flex-col relative w-full">
            <div
              class="absolute -top-[37px] -translate-x-1/2 rounded-[5px] border border-plum-faint px-3 py-1.5 font-body text-sm font-semibold text-plum shadow-sm dark:shadow-none transition-all bg-white whitespace-nowrap"
              :style="{
                left: `calc(${((Number(serviceTime) - 1) / 29) * 100}% + (${12 - ((Number(serviceTime) - 1) / 29) * 24}px))`,
              }"
            >
              {{ serviceTime }} min
            </div>

            <input
              id="serviceTime"
              v-model.number="serviceTime"
              type="range"
              min="1"
              max="30"
              aria-label="Service time in minutes"
              class="w-full accent-mint h-2 bg-plum/10 rounded-lg appearance-none cursor-pointer"
            />

            <div class="mt-2 flex justify-between font-body text-sm text-plum-muted">
              <span>1 min</span>
              <span>30 min</span>
            </div>
            <div v-if="errors.serviceTime" class="mt-1 font-body text-sm text-red-500">
              {{ errors.serviceTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Card 3: Party Settings ═══ -->
      <div class="rounded-card border border-plum-faint bg-white p-6 shadow-sm dark:shadow-none">
        <div class="flex items-center justify-between">
          <div>
            <label
              for="allowPartyJoining"
              class="block font-body text-sm font-medium text-plum-muted"
            >
              Would you like guests to be able to bring others with them?
            </label>
          </div>
          <BaseToggle
            id="allowPartyJoining"
            v-model="allowPartyJoining"
            aria-label="Toggle party joining mode"
          />
        </div>

        <div
          v-if="allowPartyJoining"
          class="mt-8 pt-6 border-t border-plum-faint animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <label
            for="maxPartySize"
            class="block font-body text-sm font-medium text-plum-muted mb-6"
          >
            How many people are allowed including guest?
          </label>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in [2, 4, 6, 8, 10, 15, 20]"
              :key="size"
              type="button"
              :class="[
                'px-4 py-2 rounded-xl font-body text-sm transition-all',
                maxPartySize === size
                  ? 'bg-plum text-sand font-semibold cursor-pointer'
                  : 'border border-plum-faint text-plum-muted hover:border-plum cursor-pointer',
              ]"
              @click="maxPartySize = size"
            >
              {{ size }}
            </button>
            <div class="flex items-center gap-2 ml-2">
              <span class="text-sm text-plum-muted font-body">Custom:</span>
              <input
                id="maxPartySize"
                v-model.number="maxPartySize"
                type="number"
                min="1"
                max="50"
                class="w-16 h-9 rounded-xl border border-plum-faint bg-sand text-center font-body text-sm text-plum focus:border-plum outline-none"
              />
            </div>
          </div>
          <div v-if="errors.maxPartySize" class="mt-2 font-body text-sm text-red-500">
            {{ errors.maxPartySize }}
          </div>
        </div>
      </div>

      <!-- ═══ Card 3: Host vs Guest Version ═══ -->
      <template v-if="role === 'host'">
        <div class="rounded-card border border-plum-faint bg-white p-6 shadow-sm dark:shadow-none">
          <label for="slug" class="mb-3 block font-body text-sm font-medium text-plum-muted">
            Queue Link
          </label>
          <div
            class="inline-flex items-center bg-sand border border-sand-dark w-full p-3 rounded-xl transition-colors focus-within:border-plum/30"
          >
            <span class="font-body text-[18px] text-plum hidden sm:inline">queuebuzz.com/</span>
            <input
              id="slug"
              v-model="slug"
              placeholder="eenie-meenie"
              class="w-full border-none bg-transparent font-display text-[18px] text-plum placeholder:text-plum/30 font-body outline-none"
            />
            <div class="mx-2 flex h-5 w-5 shrink-0 items-center justify-center">
              <SpinnerLoadingIcon v-if="isCheckingSlug" class="h-4 w-4 animate-spin text-plum/50" />
              <VerifiedCheckIcon v-else-if="slug && !errors.slug" class="h-4 w-4 text-mint" />
            </div>
            <button
              type="button"
              class="inline-flex items-center text-center gap-2 rounded-xl bg-mint px-4 py-2 font-body text-base font-medium text-on-mint cursor-pointer transition-colors hover:bg-mint-dark min-w-[100px] justify-center"
              @click="copyCustomLink"
            >
              <CopyCodeIcon v-if="!isSlugCopied" class="h-[17px] w-[14px] text-on-mint" />
              {{ isSlugCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <div v-if="errors.slug" class="mt-2 font-body text-sm text-red-500">
            {{ errors.slug }}
          </div>
          <p class="mt-4 font-body text-sm text-plum-muted">
            This is the address people use to find your queue. If empty, we’ll use a random version.
          </p>
        </div>

        <!-- ═══ Card 4: Guest Settings ═══ -->
        <div class="rounded-card border border-plum-faint bg-white p-6 shadow-sm dark:shadow-none">
          <div class="flex items-center justify-between">
            <div>
              <label for="collectEmails" class="font-body font-semibold text-plum"
                >Collect guest emails</label
              >
              <p class="font-body text-sm text-plum-muted mt-0.5">
                Require guests to provide an email address when they join.
              </p>
            </div>
            <BaseToggle
              id="collectEmails"
              v-model="collectEmails"
              aria-label="Toggle collect emails from customers"
            />
          </div>
        </div>
      </template>

      <template v-else />
    </div>

    <!-- ═══ Action row ═══ -->
    <div class="mt-8 flex items-center justify-between">
      <button
        type="button"
        class="font-body text-base font-semibold text-plum-muted transition-colors hover:text-plum cursor-pointer"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || isCheckingSlug"
        class="rounded-input bg-mint px-8 py-3 font-body text-lg font-medium text-on-mint shadow-[0_4px_14px_rgba(0,229,160,0.40)] transition-transform hover:bg-mint-dark active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
      >
        <SpinnerLoadingIcon v-if="isSubmitting" class="mr-2 h-5 w-5 animate-spin text-on-mint" />
        {{ isSubmitting ? 'Opening...' : 'Open Queue →' }}
      </button>
    </div>

    <!-- ═══ Account nudge (Guest only) ═══ -->
    <p v-if="role === 'guest'" class="mt-6 text-center font-body text-sm text-plum-muted">
      Secure your queue & customize your URL.
      <router-link
        to="/login"
        class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
      >
        Create a free account
      </router-link>
    </p>
  </form>
</template>
