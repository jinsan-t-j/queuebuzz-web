<script setup lang="ts">
/**
 * @component JoinCodeModal
 * @description Modal for entering a queue join code.
 */

import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const props = defineProps<{
  isOpen: boolean
  isLoading: boolean
  error?: string
  initialCode?: string
}>()

const emit = defineEmits<{
  (e: 'submit', code: string): void
  (e: 'close'): void
}>()

const router = useRouter()
const codeInput = ref(props.initialCode || '')

watch(
  () => props.initialCode,
  (newVal) => {
    if (newVal) codeInput.value = newVal
  },
)

function handleSubmit() {
  emit('submit', codeInput.value)
}
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="p-8 sm:p-10 text-center">
      <p class="font-body text-xs font-bold uppercase tracking-[0.25em] text-plum-soft">
        Queue access
      </p>
      <h2 class="mt-3 font-display text-3xl font-bold text-plum">Enter join code</h2>
      <p class="mt-3 font-body text-sm leading-relaxed text-plum-muted">
        This queue requires a join code before the form can be opened.
      </p>

      <form class="mt-8 flex flex-col gap-4 text-left" @submit.prevent="handleSubmit">
        <BaseInput
          id="queue-code"
          v-model="codeInput"
          label="Join code"
          placeholder="ABC123"
          :error="error"
          :is-disabled="isLoading"
        />

        <BaseButton type="submit" variant="primary" class="w-full" :is-loading="isLoading">
          Verify code
        </BaseButton>

        <BaseButton type="button" variant="ghost" class="w-full" @click="router.back()">
          Go back
        </BaseButton>
      </form>
    </div>
  </BaseModal>
</template>
