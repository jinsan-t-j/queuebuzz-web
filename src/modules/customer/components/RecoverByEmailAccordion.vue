<script setup lang="ts">
/**
 * @component RecoverByEmailAccordion
 * @description Expandable accordion for email recovery on the waiting screen.
 * Matches Figma — mint border + mint-light bg when collapsed.
 *
 * @emits {submit-email} - Emitted with email value.
 */

// 1. Vue core imports
import { ref } from 'vue'

// 5. Component imports
import { ChevronDown } from 'lucide-vue-next'

// 7. Emits
const emit = defineEmits(['submit-email'])

// 9. Reactive state
const isExpanded = ref(false)
const email = ref('')
const isSubmitting = ref(false)

// 11. Methods
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

async function handleSubmit() {
  if (!email.value) return
  isSubmitting.value = true
  emit('submit-email', email.value)
  setTimeout(() => {
    isSubmitting.value = false
  }, 600)
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mint bg-mint-light">
    <!-- Collapsed header -->
    <button
      class="flex w-full cursor-pointer items-center justify-between px-4 py-4"
      @click="toggleExpanded"
    >
      <span class="font-body text-sm text-plum">Recover your queue via email?</span>
      <ChevronDown
        :class="[
          'h-2.5 w-2.5 text-plum transition-transform duration-200',
          isExpanded ? 'rotate-180' : '',
        ]"
      />
    </button>

    <!-- Expanded content -->
    <div v-show="isExpanded" class="border-t border-mint/30 px-4 pb-4">
      <input
        v-model="email"
        type="email"
        placeholder="your@email.com"
        class="mt-3 w-full rounded-[14px] border border-plum-faint bg-white px-[18px] py-3 font-body text-sm text-plum placeholder:text-plum-muted/60 focus:border-plum focus:outline-none focus:ring-0"
      />
      <button
        :disabled="!email || isSubmitting"
        :class="[
          'mt-3 flex h-10 w-full items-center justify-center rounded-full bg-mint font-body text-sm font-semibold text-on-mint transition-all',
          !email || isSubmitting ? 'cursor-not-allowed opacity-50' : '',
        ]"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Sending…' : 'Send recovery link →' }}
      </button>
    </div>
  </div>
</template>
