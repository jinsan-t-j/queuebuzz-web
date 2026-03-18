<script setup lang="ts">
/**
 * @component GuestHostExpiredQueueView
 * @description Page shown when a guest session has expired (e.g., reached 24h limit).
 * Encourages the user to create an account to avoid losing data in the future.
 */

// 1. Vue core imports
import { ref, computed } from 'vue'

// 2. Router / Pinia imports

// 3. Third-party composables

// 4. Local composables
import { useMutation } from '@tanstack/vue-query'
import { registerHost } from '@/modules/app/auth/actions/auth.actions'
import { useToast } from '@/composables/useToast'
// 5. Component imports
import ClockWarningOrangeIcon from '@/assets/icons/clock-warning-orange.svg?component'
import CheckCircleIcon from '@/assets/icons/check-circle.svg?component'
import CheckMintIcon from '@/assets/icons/check-mint.svg?component'
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?component'
import ArrowRightMutedIcon from '@/assets/icons/arrow-right-muted.svg?component'

// 6. Props
const props = defineProps({
  reason: {
    type: String,
    default: 'expired', // 'expired' | 'terminated'
  },
  email: {
    type: String,
    default: '',
  },
})

// 7. Emits
const emit = defineEmits(['send-sign-in-link', 'update:email'])

// 8. Composable destructuring
const { showToast } = useToast()

// 9. Reactive state
const localEmail = ref(props.email)

const { mutate: mutateRegisterHost, isPending } = useMutation({
  mutationFn: async (userEmail: string) => {
    return await registerHost({ email: userEmail })
  },
  onSuccess: (data: any) => {
    showToast(data?.message || 'Magic link sent. Check your email.')
  },
  onError: (error: any) => {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send magic link'
    showToast(errorMsg, { type: 'error' })
  }
})

const features = ref([
  '24h+ active queue duration',
  'Lifetime performance history',
  'Customizable queue branding',
  'Priority SMS notifications',
])

// 10. Computed properties
const isTerminated = computed(() => props.reason === 'terminated')

const content = computed(() => ({
  title: isTerminated.value ? 'Queue Terminated' : 'Session Expired',
  description: isTerminated.value
    ? "You've successfully ended this session. Sign up to save your history and performance analytics."
    : "Guest queue sessions last for 24 hours. Your session has ended to prevent data loss."
}))

// 11. Methods
function handleSendLink() {
  if (!localEmail.value) {
    showToast('Please enter your email address', { type: 'error' })
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(localEmail.value)) {
    showToast('Invalid email address', { type: 'error' })
    return
  }

  mutateRegisterHost(localEmail.value)
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Blob decorations -->
    <div class="absolute -right-16 -top-16 h-72 w-72 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-[#F97316]/10 opacity-50 blur-[80px]" />
    <div class="absolute -bottom-16 -left-16 h-64 w-64 rounded-[45%_55%_40%_60%/60%_40%_55%_45%] bg-plum-faint opacity-40 blur-[80px]" />

    <!-- ═══ Main Content ═══ -->
    <div class="relative z-10 mx-auto max-w-[1024px] px-6 py-12 md:py-24">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <!-- ═══ Status Card (Left Column) ═══ -->
        <div class="flex flex-col justify-center rounded-[40px] h-full bg-white px-10 py-12 text-center shadow-[0_4px_24px_rgba(26,10,46,0.06)] border border-plum-faint md:sticky md:top-24">
          <!-- Status Icon -->
          <div
            v-if="isTerminated"
            class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-mint-light"
          >
            <CheckCircleIcon class="h-12 w-12 text-mint" />
          </div>
          <div
            v-else
            class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#FFF7ED]"
          >
            <ClockWarningOrangeIcon class="h-12 w-12 text-[#F97316]" />
          </div>
 
          <h1 class="font-display text-4xl font-extrabold tracking-tight text-plum">
            {{ content.title }}
          </h1>
          <p class="mt-4 font-body text-lg leading-relaxed text-plum-muted">
            {{ content.description }}
          </p>
        </div>

        <!-- ═══ Registration CTA Card (Right Column) ═══ -->
        <div class="rounded-[40px] bg-plum p-10 shadow-[0_20px_50px_rgba(26,10,46,0.25)] border border-white/10">
          <p class="font-body text-xs font-bold uppercase tracking-[1.5px] text-mint">
            Upgrade Your Experience
          </p>
          <h2 class="mt-2 font-display text-2xl font-bold leading-tight text-sand">
            Keep your queues alive forever with a free account.
          </h2>

          <!-- Feature list -->
          <div class="mt-10 flex flex-col gap-5">
            <div
              v-for="feature in features"
              :key="feature"
              class="flex items-center gap-4"
            >
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/20">
                <CheckMintIcon class="h-3 w-3 text-mint" />
              </div>
              <span class="font-body text-base font-medium text-sand/90 tracking-tight">{{ feature }}</span>
            </div>
          </div>

          <!-- Email form -->
          <div class="mt-10 flex flex-col gap-4">
            <div class="flex flex-col gap-2.5">
              <label class="font-body text-xs font-bold uppercase tracking-wider text-sand/50 ml-1">
                Email address
              </label>
              <input
                v-model="localEmail"
                type="email"
                placeholder="you@company.com"
                class="w-full rounded-[24px] border border-white/10 bg-white/5 px-6 py-5 font-body text-lg text-sand placeholder:text-sand/30 outline-none transition-all focus:border-mint focus:bg-white/10"
                :disabled="isPending"
                @keyup.enter="handleSendLink"
              />
            </div>
            <button
              class="group mt-2 flex w-full items-center justify-center gap-3 rounded-[24px] bg-mint px-8 py-5 font-body text-lg font-bold text-plum transition-all hover:scale-[1.02] hover:bg-[#00FFB2] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              :disabled="isPending"
              @click="handleSendLink"
            >
              <span v-if="isPending">Sending...</span>
              <template v-else>
                Create My Account 
                <ArrowRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </button>
          </div>
        </div>
      </div>
      <div class="mt-12 md:mt-20">
        <router-link to="/" class="flex justify-center items-center gap-2 font-body text-sm font-medium text-plum-muted transition-colors hover:text-plum">
          Back to home
          <ArrowRightMutedIcon class="h-3 w-3" />
        </router-link>
      </div>
    </div>  
  </div>
</template>

<style scoped>
.rounded-card {
  border-radius: 40px;
}
</style>
