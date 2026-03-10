<script setup>
/**
 * @component JoinView
 * @description Customer-facing queue join page. Shows the business name,
 * a name input, and a join button. Accessed via QR code or direct URL.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 2. Router / Pinia imports
import { useRouter, useRoute } from 'vue-router'

// 3. Third-party composables

// 4. Local composables

// 5. Component imports
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

// 6. Props

// 7. Emits

// 8. Composable destructuring
const router = useRouter()
const route = useRoute()

// 9. Reactive state
const displayName = ref('')
const isJoining = ref(false)

// 10. Computed properties

// 11. Methods
function handleJoin() {
  if (!displayName.value.trim()) return
  isJoining.value = true
  setTimeout(() => {
    isJoining.value = false
    router.push({ name: 'host-waiting', params: { hostSlug: route.params.hostSlug } })
  }, 600)
}

// 12. Lifecycle hooks
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-6">
    <div class="w-full max-w-sm text-center">
      <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mint-light">
        <span class="font-display text-3xl text-mint-dark">Q</span>
      </div>
      <h1 class="font-display text-2xl font-bold text-plum">Join the Queue</h1>
      <p class="mt-2 font-body text-sm text-plum-muted">
        Enter your name to get in line.
      </p>

      <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleJoin">
        <BaseInput
          v-model="displayName"
          label="Your name"
          placeholder="e.g. Sarah"
        />
        <BaseButton
          variant="primary"
          size="lg"
          :is-loading="isJoining"
          class="w-full"
          @click="handleJoin"
        >
          Join Queue
        </BaseButton>
      </form>
    </div>
  </div>
</template>
