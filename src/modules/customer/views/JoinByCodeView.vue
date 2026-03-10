<script setup>
/**
 * @component JoinByCodeView
 * @description Allows customers to enter a 6-character join code manually
 * to find and join a queue without scanning a QR code.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports
import { useRouter } from 'vue-router'

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { isValidJoinCode } from '@/utils/validators'

// 6. Props

// 7. Emits

// 8. Composable destructuring
const router = useRouter()

// 9. Reactive state
const joinCode = ref('')
const error = ref('')
const isLoading = ref(false)

// 10. Computed properties

// 11. Methods
function handleSubmit() {
  const code = joinCode.value.trim().toUpperCase()
  if (!isValidJoinCode(code)) {
    error.value = 'Please enter a valid 6-character code.'
    return
  }
  error.value = ''
  isLoading.value = true
  // Mock: redirect to a demo queue
  setTimeout(() => {
    isLoading.value = false
    router.push({ name: 'host-join', params: { hostSlug: 'demo-business' } })
  }, 500)
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-6">
    <div class="w-full max-w-sm text-center">
      <h1 class="font-display text-2xl font-bold text-plum">Enter Queue Code</h1>
      <p class="mt-2 font-body text-sm text-plum-muted">
        Type the 6-character code displayed at the business.
      </p>

      <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="joinCode"
          placeholder="e.g. 8X4K2F"
          :error="error"
          class="text-center"
        />
        <BaseButton
          variant="primary"
          size="lg"
          :is-loading="isLoading"
          class="w-full"
          @click="handleSubmit"
        >
          Join Queue
        </BaseButton>
      </form>

      <p class="mt-6 font-body text-xs text-plum-muted">
        Don't have a code? Ask the business for their QR code or join link.
      </p>
    </div>
  </div>
</template>
