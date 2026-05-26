<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { useForm, useField } from 'vee-validate'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import * as yup from 'yup'

import GoogleIcon from '@/assets/icons/google.svg?component'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { AUTH_ROUTES } from '@/config/api.constants'
import { authenticate } from '@/modules/app/auth/actions/auth.actions'
import type { SocialProvider } from '@/modules/app/auth/types'
import type { ApiError } from '@/utils/api-response'

const emit = defineEmits(['submit-success'])

const route = useRoute()

const { showToast } = useToast()
const isSocialLoading = ref(false)

const claimQueueId = computed(() => route.query.claim_queue_id as string | undefined)
const redirectPath = computed(() => route.query.redirect as string | undefined)

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
})

const { value: email, errorMessage: emailError } = useField<string>('email')

const { mutate: mutateAuth, isPending } = useMutation({
  mutationFn: async (userEmail: string) => {
    return await authenticate(userEmail, claimQueueId.value, redirectPath.value)
  },
  onSuccess: (data) => {
    if (data?.redirectUrl) {
      globalThis.location.assign(data.redirectUrl)
    } else {
      showToast(data?.message || 'Check your email for the magic link.')
      emit('submit-success')
    }
  },
  onError: (error: ApiError) => {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    const errorMsg =
      data?.message || data?.error || (error as Error).message || 'Authentication failed'
    showToast(errorMsg, { type: 'error' })
  },
})

const onSubmit = handleSubmit((values) => {
  mutateAuth(values.email)
})

function handleSocialLogin(provider: SocialProvider) {
  if (isSocialLoading.value) return
  isSocialLoading.value = true
  globalThis.location.assign(
    AUTH_ROUTES.SOCIAL_START(provider, claimQueueId.value, redirectPath.value),
  )
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Email Section -->
    <div class="space-y-4">
      <BaseInput
        v-model="email"
        type="email"
        class="!rounded-pill"
        placeholder="Enter your email address"
        :error="emailError"
        :is-disabled="isPending"
        @keyup.enter="onSubmit"
      />

      <BaseButton
        class="w-full !rounded-pill !bg-plum !text-white hover:!bg-plum/90"
        size="lg"
        :is-loading="isPending"
        @click="onSubmit"
      >
        Continue
      </BaseButton>
    </div>

    <!-- Divider -->
    <div class="flex items-center gap-4 py-2">
      <div class="flex-1 border-t border-plum-faint" />
      <span class="font-body text-xs font-bold uppercase tracking-widest text-plum-muted">
        OR
      </span>
      <div class="flex-1 border-t border-plum-faint" />
    </div>

    <!-- Social Logins -->
    <div class="flex flex-col gap-3">
      <BaseButton
        variant="secondary"
        class="w-full !bg-white border border-plum-faint hover:!bg-plum-faint/30 !rounded-pill !text-plum font-medium"
        :is-disabled="isSocialLoading"
        @click="handleSocialLogin('google')"
      >
        <GoogleIcon class="w-5 h-5 mr-1" />
        Continue with Google
      </BaseButton>
    </div>
  </div>
</template>
