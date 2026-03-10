<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useClipboard } from '@vueuse/core'

import QueueCreatedModal from '@/modules/app/queue/components/QueueCreatedModal.vue'
import CopyCodeIcon from '@/assets/icons/copy-code.svg?component'
import LockIcon from '@/assets/icons/lock.svg?component'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg?component'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (val) => ['host', 'guest'].includes(val)
  }
})

const emit = defineEmits(['queue-created', 'cancel', 'create-account'])

const router = useRouter()

// Suggestions for queue name
const suggestions = ref(['Consultation', 'Food Order', 'Token', 'Registration', 'Service'])

// Modal State
const showSuccessModal = ref(false)
const generatedJoinCode = ref('8X4K2F') // Using default prop for now

// Validation Schema based on role
const schema = computed(() => {
  const baseSchema = {
    queueName: yup.string().required('Queue name is required').max(50, 'Queue name must be at most 50 characters'),
    serviceTime: yup.number().required('Service time is required').min(1).max(30),
  }
  
  if (props.role === 'host') {
    return yup.object({
      ...baseSchema,
      slug: yup.string()
        .nullable()
        .matches(/^[a-z0-9-]+$/, { excludeEmptyString: true, message: 'Only lowercase letters, numbers, and hyphens allowed' })
    })
  } else {
    return yup.object({
      ...baseSchema,
      recoveryEmail: yup.string()
        .nullable()
        .email('Must be a valid email address')
    })
  }
})

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    queueName: '',
    serviceTime: 5,
    slug: '',
    recoveryEmail: ''
  }
})

// Fields setup
const { value: queueName } = useField('queueName')
const { value: serviceTime } = useField('serviceTime')
const { value: slug } = useField('slug')
const { value: recoveryEmail } = useField('recoveryEmail')

const showEmailSection = ref(true)

function selectSuggestion(suggestion) {
  queueName.value = suggestion
}

const onSubmit = handleSubmit((values) => {
  // In a real scenario, API call happens here. For now, open success modal.
  generatedJoinCode.value = Math.random().toString(36).substring(2, 8).toUpperCase()
  showSuccessModal.value = true
  emit('queue-created', values)
})

function handleCancel() {
  emit('cancel')
  router.back()
}

function goToDashboard() {
  showSuccessModal.value = false
  // Navigation fallback, depending on actual app routes
  router.push('/').catch(() => {})
}

// Clipboard setups for Host view's slug and Success Modal
const { copy: copyToClipboard } = useClipboard()
const isSlugCopied = ref(false)

function copyCustomLink() {
  const customLink = `https://queuebuzz.com/${slug.value || 'random-slug'}`
  copyToClipboard(customLink)
  isSlugCopied.value = true
  setTimeout(() => isSlugCopied.value = false, 2000)
}

function copySuccessLink() {
  // Assuming a generic join link format here
  copyToClipboard(`https://queuebuzz.com/join/${generatedJoinCode.value}`)
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="mt-8 flex flex-col gap-5">
      <!-- ═══ Card 1: Queue Name ═══ -->
      <div class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)]">
        <label class="mb-3 block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-[#5c5267]">
          Queue Name
        </label>
        <input
          v-model="queueName"
          placeholder=" What are people queuing for?"
          class="mb-2 w-full border-none bg-transparent font-display text-[22px] font-semibold text-plum placeholder:text-plum/20 outline-none"
          :class="{ 'placeholder:text-red-500/50 text-red-500': errors.queueName, 'text-plum': !errors.queueName }"
        />
        <div v-if="errors.queueName" class="mb-3 font-body text-xs text-red-500">{{ errors.queueName }}</div>
        
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="rounded-full border border-plum-faint px-4 py-1.5 font-body text-[13px] font-medium text-[#5c5267] transition-colors hover:bg-plum-faint"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- ═══ Card 2: Service Time ═══ -->
      <div class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)] relative">
        <label class="block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-[#5c5267]">
          Avg. Service Time Per Person
        </label>

        <div class="mt-8 flex flex-col gap-4 relative">
          <!-- Value callout tooltip over slider -->
          <div class="flex flex-col relative w-full">
            <div 
              class="absolute -top-[37px] -translate-x-1/2 rounded-[5px] border border-[#e8e6ea] px-3 py-1.5 font-body text-[13px] font-semibold text-plum shadow-[0_4px_6px_rgba(0,0,0,0.10),0_10px_15px_rgba(0,0,0,0.10)] transition-all bg-white whitespace-nowrap"
              :style="{ left: `calc(${((serviceTime - 1) / 29) * 100}% + (${12 - (((serviceTime - 1) / 29) * 24)}px))` }"
            >
              {{ serviceTime }} min
            </div>
            
            <input
              type="range"
              v-model="serviceTime"
              min="1"
              max="30"
              class="w-full accent-mint h-2 bg-plum/10 rounded-lg appearance-none cursor-pointer"
            />
            
            <div class="mt-2 flex justify-between font-body text-[13px] text-[#5c5267]">
              <span>1 min</span>
              <span>30 min</span>
            </div>
            <div v-if="errors.serviceTime" class="mt-1 font-body text-xs text-red-500">{{ errors.serviceTime }}</div>
          </div>
        </div>

        <p class="mt-6 font-body text-xs text-[#5c5267]">
          Used to calculate wait time estimates.
        </p>
      </div>

      <!-- ═══ Card 3: Host vs Guest Version ═══ -->
      <template v-if="role === 'host'">
        <div class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)]">
          <label class="mb-3 block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-[#5c5267]">
            Queue Link
          </label>
          <div class="inline-flex items-center bg-sand border border-sand-dark w-full p-3 rounded-xl transition-colors focus-within:border-plum/30">
            <span class="font-body text-[18px] text-plum hidden sm:inline">queuebuzz.com/</span>
            <input
              v-model="slug"
              placeholder="eenie-meenie"
              class="w-full border-none bg-transparent font-display text-[18px] text-plum placeholder:text-plum/30 font-body outline-none"
            />
            <button 
              type="button" 
              @click="copyCustomLink"
              class="inline-flex items-center text-center gap-2 rounded-xl bg-mint px-4 py-2 font-body text-base font-bold text-plum cursor-pointer transition-colors hover:bg-mint-dark min-w-[100px] justify-center"
            >
              <CopyCodeIcon v-if="!isSlugCopied" class="h-[17px] w-[14px] text-plum" />
              {{ isSlugCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <div v-if="errors.slug" class="mt-2 font-body text-xs text-red-500">{{ errors.slug }}</div>
          <p class="mt-4 font-body text-xs text-[#5c5267]">
            This is the address people use to find your queue. If empty, we’ll use a random version.
          </p>
        </div>
      </template>

      <template v-else>
        <div class="rounded-card border border-plum/5 bg-white shadow-[0_4px_24px_rgba(26,10,46,0.05)]">
          <button
            type="button"
            class="flex w-full items-center justify-between px-6 py-5"
            @click="showEmailSection = !showEmailSection"
          >
            <div class="flex items-center gap-3">
              <LockIcon class="h-[14px] w-[11px] text-[#5c5267]" />
              <span class="font-body text-[15px] font-medium text-[#5c5267]">
                Save access link to your email →
              </span>
            </div>
            <ChevronDownIcon
              class="h-[6px] w-[9px] text-[#5c5267] transition-transform duration-300"
              :class="{ 'rotate-180': showEmailSection }"
            />
          </button>

          <div v-show="showEmailSection" class="border-t border-[#e8e6ea] px-6 pb-6 pt-6 origin-top transition-all duration-300">
            <input
              v-model.lazy="recoveryEmail"
              type="email"
              placeholder="your@email.com"
              class="w-full border-none bg-transparent font-body text-base text-plum placeholder:text-[#5c5267]/40 outline-none"
              :class="{'text-red-500 placeholder:text-red-500/40': errors.recoveryEmail}"
            />
            <div v-if="errors.recoveryEmail" class="mt-2 font-body text-xs text-red-500">{{ errors.recoveryEmail }}</div>
            <p class="mt-4 font-body text-xs text-[#5c5267]">
              We'll email a link to manage from any device
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- ═══ Action row ═══ -->
    <div class="mt-8 flex items-center justify-between">
      <button
        type="button"
        class="font-body text-base font-semibold text-[#5c5267] transition-colors hover:text-plum"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="rounded-input bg-mint px-8 py-3 font-body text-lg font-bold text-plum shadow-[0_4px_14px_rgba(0,229,160,0.40)] transition-transform hover:bg-mint-dark active:scale-95"
      >
        Open Queue →
      </button>
    </div>

    <!-- ═══ Account nudge (Guest only) ═══ -->
    <p v-if="role === 'guest'" class="mt-6 text-center font-body text-sm text-[#6b7280]">
      Want to customize your URL?
      <button
        type="button"
        class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
        @click="emit('create-account')"
      >
        Create a free account
      </button>
    </p>

    <!-- ═══ Success Modal ═══ -->
    <QueueCreatedModal
      :is-open="showSuccessModal"
      :join-code="generatedJoinCode"
      @go-to-dashboard="goToDashboard"
      @copy-link="copySuccessLink"
    />
  </form>
</template>
