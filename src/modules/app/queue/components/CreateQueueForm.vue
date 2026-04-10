<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { useQueueStore } from '@/stores/queue.store'
import { useAuthStore } from '@/stores/auth.store'
import { createQueue, checkSlugAvailability } from '@/modules/app/queue/actions/queue.action'

import CopyCodeIcon from '@/assets/icons/copy-code.svg?component'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg?component'
import SpinnerLoadingIcon from '@/assets/icons/spinner-loading.svg?component'
import VerifiedCheckIcon from '@/assets/icons/verified-check.svg?component'
import LockIcon from '@/assets/icons/lock.svg?component'
import BaseToggle from '@/components/base/BaseToggle.vue'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (val) => ['host', 'guest'].includes(val),
  },
})

const emit = defineEmits(['queue-created'])

const router = useRouter()
const queueStore = useQueueStore()
const authStore = useAuthStore()

const suggestions = ref(['Consultation', 'Food Order', 'Token', 'Registration', 'Service'])

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
    return yup.object({
      ...baseSchema,
      recoveryEmail: yup.string().nullable().email('Must be a valid email address'),
    })
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
    recoveryEmail: null,
  },
})

// Fields setup
const { value: queueName } = useField('queueName')
const { value: serviceTime } = useField('serviceTime')
const { value: allowPartyJoining } = useField('allowPartyJoining')
const { value: maxPartySize } = useField('maxPartySize')
const { value: slug } = useField('slug')
const { value: recoveryEmail } = useField('recoveryEmail')

const showEmailSection = ref(false)

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
  if (errors.value.slug || isCheckingSlug.value) return

  try {
    const payload = {
      name: values.queueName,
      avgServiceMins: Number(values.serviceTime),
      slug: values.slug,
      recoveryEmail: values.recoveryEmail,
      allowPartyJoining: values.allowPartyJoining,
      maxPartySize: values.allowPartyJoining ? Number(values.maxPartySize) : 1,
    }
    const queue = await createQueue(payload)
    if (queue) {
      queueStore.setActiveQueue(queue)

      if (props.role === 'guest') {
        authStore.setGuestSession(queue.id)
      }

      emit('queue-created', queue)
    }
  } catch {
    // Error handling logic
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
      <div
        class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)]"
      >
        <label class="mb-3 block font-body text-sm font-medium text-[#5c5267]"> Queue Name </label>
        <input
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
            class="rounded-full border border-plum-faint px-4 py-1.5 font-body text-sm font-medium text-[#5c5267] transition-colors hover:bg-plum-faint cursor-pointer"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- ═══ Card 2: Service Time ═══ -->
      <div
        class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)] relative"
      >
        <label class="block font-body text-sm font-medium text-[#5c5267]">
          How long does it typically take to serve one guest?
        </label>

        <div class="mt-8 flex flex-col gap-4 relative">
          <!-- Value callout tooltip over slider -->
          <div class="flex flex-col relative w-full">
            <div
              class="absolute -top-[37px] -translate-x-1/2 rounded-[5px] border border-[#e8e6ea] px-3 py-1.5 font-body text-sm font-semibold text-plum shadow-[0_4px_6px_rgba(0,0,0,0.10),0_10px_15px_rgba(0,0,0,0.10)] transition-all bg-white whitespace-nowrap"
              :style="{
                left: `calc(${((serviceTime - 1) / 29) * 100}% + (${12 - ((serviceTime - 1) / 29) * 24}px))`,
              }"
            >
              {{ serviceTime }} min
            </div>

            <input
              v-model.number="serviceTime"
              type="range"
              min="1"
              max="30"
              class="w-full accent-mint h-2 bg-plum/10 rounded-lg appearance-none cursor-pointer"
            />

            <div class="mt-2 flex justify-between font-body text-sm text-[#5c5267]">
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
      <div
        class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)]"
      >
        <div class="flex items-center justify-between">
          <div>
            <label class="block font-body text-sm font-medium text-[#5c5267]">
              Would you like guests to be able to bring others with them?
            </label>
          </div>
          <BaseToggle v-model="allowPartyJoining" />
        </div>

        <div
          v-if="allowPartyJoining"
          class="mt-8 pt-6 border-t border-plum-faint animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <label class="block font-body text-sm font-medium text-[#5c5267] mb-6">
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
        <div
          class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)]"
        >
          <label class="mb-3 block font-body text-sm font-medium text-[#5c5267]">
            Queue Link
          </label>
          <div
            class="inline-flex items-center bg-sand border border-sand-dark w-full p-3 rounded-xl transition-colors focus-within:border-plum/30"
          >
            <span class="font-body text-[18px] text-plum hidden sm:inline">queuebuzz.com/</span>
            <input
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
              class="inline-flex items-center text-center gap-2 rounded-xl bg-mint px-4 py-2 font-body text-base font-medium text-plum cursor-pointer transition-colors hover:bg-mint-dark min-w-[100px] justify-center"
              @click="copyCustomLink"
            >
              <CopyCodeIcon v-if="!isSlugCopied" class="h-[17px] w-[14px] text-plum" />
              {{ isSlugCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <div v-if="errors.slug" class="mt-2 font-body text-sm text-red-500">
            {{ errors.slug }}
          </div>
          <p class="mt-4 font-body text-sm text-[#5c5267]">
            This is the address people use to find your queue. If empty, we’ll use a random version.
          </p>
        </div>
      </template>

      <template v-else>
        <div
          class="rounded-card border border-plum/5 bg-white shadow-[0_4px_24px_rgba(26,10,46,0.05)]"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between px-6 py-5 cursor-pointer"
            @click="showEmailSection = !showEmailSection"
          >
            <div class="flex items-center gap-3">
              <LockIcon class="h-[14px] w-[11px] text-[#5c5267]" />
              <span class="font-body text-sm font-medium text-[#5c5267]">
                Save this link now to ensure you can access it later →
              </span>
            </div>
            <ChevronDownIcon
              class="h-[6px] w-[9px] text-[#5c5267] transition-transform duration-300"
              :class="{ 'rotate-180': showEmailSection }"
            />
          </button>

          <div
            v-show="showEmailSection"
            class="border-t border-[#e8e6ea] px-6 pb-6 pt-6 origin-top transition-all duration-300"
          >
            <input
              v-model.lazy="recoveryEmail"
              type="email"
              placeholder="your@email.com"
              class="w-full border-none bg-transparent font-body text-base text-plum placeholder:text-[#5c5267]/40 outline-none"
              :class="{ 'text-red-500 placeholder:text-red-500/40': errors.recoveryEmail }"
            />
            <div v-if="errors.recoveryEmail" class="mt-2 font-body text-sm text-red-500">
              {{ errors.recoveryEmail }}
            </div>
            <p class="mt-4 font-body text-xs text-plum-muted">
              Email yourself a magic link so you don't lose access later
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- ═══ Action row ═══ -->
    <div class="mt-8 flex items-center justify-between">
      <button
        type="button"
        class="font-body text-base font-semibold text-[#5c5267] transition-colors hover:text-plum cursor-pointer"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="rounded-input bg-mint px-8 py-3 font-body text-lg font-medium text-plum shadow-[0_4px_14px_rgba(0,229,160,0.40)] transition-transform hover:bg-mint-dark active:scale-95 cursor-pointer"
      >
        Open Queue →
      </button>
    </div>

    <!-- ═══ Account nudge (Guest only) ═══ -->
    <p v-if="role === 'guest'" class="mt-6 text-center font-body text-sm text-[#6b7280]">
      Want to customize your URL?
      <router-link
        to="/login"
        class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
      >
        Create a free account
      </router-link>
    </p>
  </form>
</template>
