<script setup>
/**
 * @component GuestHostCreateQueueView
 * @description Anonymous (guest) host queue creation form. Same form layout
 * as CreateQueueView but without sidebar/auth chrome. Includes a footer
 * link nudging the user to create a free account for URL customization.
 *
 * @prop {String} queueName - Current value of the queue name input.
 * @prop {Number} serviceTime - Current avg. service time in minutes.
 * @prop {String} recoveryEmail - Email for queue access recovery.
 * @prop {Boolean} showEmailSection - Whether the email section is expanded.
 * @prop {Boolean} showSuccessModal - Whether the "Queue is open!" modal is shown.
 * @prop {String} joinCode - Generated join code to display in the modal.
 * @emits {update:queue-name} - Queue name changed.
 * @emits {update:service-time} - Service time changed.
 * @emits {update:recovery-email} - Recovery email changed.
 * @emits {toggle-email-section} - Email section expand/collapse toggled.
 * @emits {select-suggestion} - User picked a queue name suggestion pill.
 * @emits {open-queue} - User clicked "Open Queue →".
 * @emits {cancel} - User clicked "Cancel".
 * @emits {create-account} - User clicked "Create a free account".
 * @emits {go-to-dashboard} - User clicked "Go to Dashboard" in the success modal.
 * @emits {copy-link} - User clicked "Copy Link Instead" in the success modal.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import QueueCreatedModal from '@/modules/app/queue/components/QueueCreatedModal.vue'
import LockIcon from '@/assets/icons/lock.svg?component'
import ChevronDownIcon from '@/assets/icons/chevron-down.svg?component'

// 6. Props
const props = defineProps({
  queueName: {
    type: String,
    default: '',
  },
  serviceTime: {
    type: Number,
    default: 5,
  },
  recoveryEmail: {
    type: String,
    default: '',
  },
  showEmailSection: {
    type: Boolean,
    default: true,
  },
  showSuccessModal: {
    type: Boolean,
    default: false,
  },
  joinCode: {
    type: String,
    default: '8X4K2F',
  },
})

// 7. Emits
const emit = defineEmits([
  'update:queue-name',
  'update:service-time',
  'update:recovery-email',
  'toggle-email-section',
  'select-suggestion',
  'open-queue',
  'cancel',
  'create-account',
  'go-to-dashboard',
  'copy-link',
])

// 8. Composable destructuring

// 9. Reactive state
const suggestions = ref(['Consultation', 'Food Order', 'Token', 'Registration', 'Service'])

// 10. Computed properties

// 11. Methods

// 12. Lifecycle hooks
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-[680px] px-6 py-16">
      <!-- Page heading -->
      <h1 class="font-display text-[40px] font-extrabold text-plum">
        Let's get started.
      </h1>

      <div class="mt-8 flex flex-col gap-5">
        <!-- ═══ Card 1: Queue Name ═══ -->
        <div class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)]">
          <label class="mb-3 block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-[#5c5267]">
            Queue Name
          </label>
          <input
            :value="queueName"
            placeholder=" What are people queuing for?"
            class="mb-4 w-full border-none bg-transparent font-display text-[22px] font-semibold text-plum/20 placeholder:text-plum/20 outline-none"
            @input="emit('update:queue-name', $event.target.value)"
          />
          <div class="flex flex-wrap gap-2">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              class="rounded-full border border-plum-faint px-4 py-1.5 font-body text-[13px] font-medium text-[#5c5267] transition-colors hover:bg-plum-faint"
              @click="emit('select-suggestion', suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- ═══ Card 2: Service Time ═══ -->
        <div class="rounded-card border border-plum/5 bg-white p-6 shadow-[0_4px_24px_rgba(26,10,46,0.05)]">
          <label class="block font-body text-[11px] font-bold uppercase tracking-[1.65px] text-[#5c5267]">
            Avg. Service Time Per Person
          </label>

          <div class="mt-4 flex flex-col gap-4">
            <div class="flex flex-col">
              <div class="mb-2 w-fit rounded-[5px] border border-[#e8e6ea] px-3 py-1.5 font-body text-[13px] font-semibold text-plum shadow-[0_4px_6px_rgba(0,0,0,0.10),0_10px_15px_rgba(0,0,0,0.10)]">
                {{ serviceTime }} min
              </div>
              <input
                type="range"
                :value="serviceTime"
                min="1"
                max="30"
                class="w-full accent-mint"
                @input="emit('update:service-time', Number($event.target.value))"
              />
              <div class="mt-1 flex justify-between font-body text-[13px] text-[#5c5267]">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>
          </div>

          <p class="mt-8 font-body text-xs text-[#5c5267]">
            Used to calculate wait time estimates
          </p>
        </div>

        <!-- ═══ Card 3: Save access link ═══ -->
        <div class="rounded-card border border-plum/5 bg-white shadow-[0_4px_24px_rgba(26,10,46,0.05)]">
          <button
            class="flex w-full items-center justify-between px-6 py-5"
            @click="emit('toggle-email-section')"
          >
            <div class="flex items-center gap-3">
              <LockIcon class="h-[14px] w-[11px] text-[#5c5267]" />
              <span class="font-body text-[15px] font-medium text-[#5c5267]">
                Save access link to your email →
              </span>
            </div>
            <ChevronDownIcon
              class="h-[6px] w-[9px] text-[#5c5267] transition-transform"
              :class="{ 'rotate-180': showEmailSection }"
            />
          </button>

          <div v-if="showEmailSection" class="border-t border-[#e8e6ea] px-6 pb-6 pt-10">
            <input
              :value="recoveryEmail"
              type="email"
              placeholder="your@email.com"
              class="w-full border-none bg-transparent font-body text-base text-[#5c5267]/40 placeholder:text-[#5c5267]/40 outline-none"
              @input="emit('update:recovery-email', $event.target.value)"
            />
            <p class="mt-4 font-body text-xs text-[#5c5267]">
              We'll email a link to manage from any device
            </p>
          </div>
        </div>
      </div>

      <!-- ═══ Action row ═══ -->
      <div class="mt-8 flex items-center justify-between">
        <button
          class="font-body text-base font-semibold text-[#5c5267] transition-colors hover:text-plum"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="rounded-input bg-mint px-8 py-3 font-body text-lg font-bold text-plum shadow-[0_4px_14px_rgba(0,229,160,0.40)] transition-colors hover:bg-mint-dark"
          @click="emit('open-queue')"
        >
          Open Queue →
        </button>
      </div>

      <!-- ═══ Account nudge ═══ -->
      <p class="mt-6 text-center font-body text-sm text-[#6b7280]">
        Want to customize your URL?
        <button
          class="font-semibold text-plum underline transition-colors hover:text-plum-soft"
          @click="emit('create-account')"
        >
          Create a free account
        </button>
      </p>
    </div>

    <!-- ═══ Success Modal ═══ -->
    <QueueCreatedModal
      :is-open="showSuccessModal"
      :join-code="joinCode"
      @go-to-dashboard="emit('go-to-dashboard')"
      @copy-link="emit('copy-link')"
    />
  </div>
</template>
