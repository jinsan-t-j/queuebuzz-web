<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useMutation } from '@tanstack/vue-query'
import { registerHost } from '@/modules/app/auth/actions/auth.actions'
import { useToast } from '@/composables/useToast'
import SparkleIcon from '@/assets/icons/sparkle.svg?component'
import type { ApiError } from '@/utils/api-response'

const emit = defineEmits<{
  (e: 'submit-success', email: string): void
}>()
const { showToast } = useToast()

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
})

const { value: email, errorMessage: emailError } = useField<string>('email')

const { mutate: mutateRegisterHost, isPending } = useMutation({
  mutationFn: async (userEmail: string) => {
    return await registerHost({ email: userEmail })
  },
  onSuccess: (data: { message?: string }) => {
    showToast(data?.message || 'Magic link sent. Check your email.')
    emit('submit-success', email.value)
  },
  onError: (error: ApiError) => {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    const errorMsg =
      data?.message || data?.error || (error as Error).message || 'Failed to send magic link'
    showToast(errorMsg, { type: 'error' })
  },
})

const onSubmit = handleSubmit((values) => {
  mutateRegisterHost(values.email)
})
</script>

<template>
  <div class="flex w-full max-w-[448px] flex-col gap-6">
    <!-- Label + Input -->
    <div>
      <label
        class="mb-2 block font-display text-sm font-bold uppercase tracking-[1.4px] text-[#64748b]"
      >
        Email Address
      </label>
      <input
        v-model="email"
        type="email"
        placeholder="name@yourcompany.com"
        class="w-full rounded-[14px] border bg-white px-[18px] py-4 font-display text-lg font-semibold text-plum placeholder:text-ash outline-none transition-colors"
        :class="
          emailError ? 'border-red-400 focus:border-red-500' : 'border-plum-faint focus:border-plum'
        "
        :disabled="isPending"
        @keyup.enter="onSubmit"
      />
      <p v-if="emailError" class="mt-2 text-sm text-red-500 font-body">{{ emailError }}</p>
    </div>

    <!-- Submit button -->
    <button
      class="flex w-full items-center justify-center gap-2 rounded-[32px] bg-[#00c48c] px-8 py-5 font-display text-lg font-extrabold text-white shadow-[0_8px_10px_rgba(0,229,160,0.20),0_20px_25px_rgba(0,229,160,0.20)] transition-colors hover:bg-mint-dark disabled:opacity-70 disabled:cursor-not-allowed"
      :disabled="isPending"
      @click="onSubmit"
    >
      <span v-if="isPending">Sending...</span>
      <template v-else>
        Receive Magic Link
        <SparkleIcon class="h-[21px] w-[21px] text-white" />
      </template>
    </button>
  </div>
</template>
