<script setup>
/**
 * @component GuestHostQueueCompleteView
 * @description Queue session complete page for anonymous (guest) hosts.
 * Shows a session summary card with stats, and a registration CTA
 * card with feature list and email sign-up form.
 *
 * @prop {Number} servedCount - Number of guests served during the session.
 * @prop {String} totalTime - Total queue run time.
 * @prop {String} avgTime - Average service time per guest.
 * @prop {String} email - Current email input value.
 * @emits {send-sign-in-link} - User clicked "Send sign-in link".
 * @emits {continue-without-account} - User clicked "Continue without an account".
 * @emits {update:email} - Email input value changed.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import CheckMintIcon from '@/assets/icons/check-mint.svg?component'
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?component'
import ArrowRightMutedIcon from '@/assets/icons/arrow-right-muted.svg?component'

// 6. Props
const props = defineProps({
  servedCount: {
    type: Number,
    default: 20,
  },
  totalTime: {
    type: String,
    default: '47m',
  },
  avgTime: {
    type: String,
    default: '5m',
  },
  email: {
    type: String,
    default: '',
  },
})

// 7. Emits
const emit = defineEmits([
  'send-sign-in-link',
  'continue-without-account',
  'update:email',
])

// 8. Composable destructuring

// 9. Reactive state
const localEmail = ref(props.email)

const features = ref([
  'Lifetime performance history',
  'Customizable queue branding',
  'Priority SMS notifications',
])

// 10. Computed properties

// 11. Methods
function handleEmailInput(event) {
  localEmail.value = event.target.value
  emit('update:email', localEmail.value)
}

function handleSendLink() {
  emit('send-sign-in-link', localEmail.value)
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-mint-light opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <!-- ═══ Main Content ═══ -->
    <div class="relative z-10 mx-auto max-w-[512px] px-6 py-4">
      <!-- ═══ Session Summary Card ═══ -->
      <div class="rounded-card bg-white px-10 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <!-- Stats pills -->
        <div class="flex items-center justify-center gap-3">
          <span class="rounded-pill border border-plum-faint px-4 py-1.5 font-body text-sm font-bold text-plum">
            Served {{ servedCount }}
          </span>
          <span class="rounded-pill border border-plum-faint px-4 py-1.5 font-body text-sm font-bold text-plum">
            Total {{ totalTime }}
          </span>
          <span class="rounded-pill border border-plum-faint px-4 py-1.5 font-body text-sm font-bold text-plum">
            Avg {{ avgTime }}
          </span>
        </div>

        <!-- Heading -->
        <h1 class="mt-6 font-display text-4xl font-extrabold tracking-tight text-plum">
          Nice work today
        </h1>
      </div>

      <!-- ═══ Registration CTA Card ═══ -->
      <div class="mt-6 rounded-card bg-white p-10 shadow-[0_8px_10px_rgba(0,0,0,0.10),0_20px_25px_rgba(0,0,0,0.10)]">
        <p class="font-body text-xs font-bold uppercase tracking-[1.2px] text-plum/60">
          Save Your Work
        </p>
        <h2 class="mt-1 font-body text-2xl font-bold leading-8 text-plum">
          Create your free account to keep
          these stats and manage your next
          queue.
        </h2>

        <!-- Feature list -->
        <div class="mt-8 flex flex-col gap-4">
          <div
            v-for="feature in features"
            :key="feature"
            class="flex items-center gap-3"
          >
            <CheckMintIcon class="h-3 w-3 text-plum" />
            <span class="font-body text-base font-medium text-plum">{{ feature }}</span>
          </div>
        </div>

        <!-- Email form -->
        <div class="mt-8 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-body text-sm font-bold text-plum">
              Email address
            </label>
            <input
              :value="localEmail"
              type="email"
              placeholder="name@company.com"
              class="w-full rounded-input border border-plum-faint px-4 py-4 font-body text-lg text-plum placeholder:text-[#6b7280] outline-none transition-colors focus:border-mint"
              @input="handleEmailInput"
            />
          </div>
          <button
            class="flex w-full items-center justify-center gap-2 rounded-input bg-mint-light px-8 py-5 font-body text-lg font-extrabold text-plum transition-colors hover:bg-mint/40"
            @click="handleSendLink"
          >
            Send sign-in link
            <ArrowRightIcon class="h-[13px] w-[17px] text-plum" />
          </button>
        </div>
      </div>

      <!-- ═══ Ghost link ═══ -->
      <div class="mt-8 text-center">
        <router-link to="/">
          <a
            class="inline-flex items-center gap-2 font-body text-base font-bold text-plum/50 transition-colors hover:text-plum"
            @click="emit('continue-without-account')"
          >
            Continue without an account
            <ArrowRightMutedIcon class="h-[11px] w-[13px]" />
        </a>
      </router-link>
      </div>
    </div>
  </div>
</template>
