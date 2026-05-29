<script setup lang="ts">
/**
 * @component ClaimContextChip
 * @description Resolves claim_queue_id from the URL and shows a contextual
 * mint pill so the host knows which queue they're about to claim.
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { getLiveQueueById } from '@/modules/app/queue/actions/queue.action'

const emit = defineEmits<{
  (e: 'close', payload: { id: string; name: string }): void
}>()

const route = useRoute()

const claimQueueId = computed(() => route.query.claim_queue_id as string | undefined)
const claimQueueName = ref<string | null>(null)

function handleClose() {
  if (claimQueueId.value && claimQueueName.value) {
    emit('close', { id: claimQueueId.value, name: claimQueueName.value })
  }
}

onMounted(async () => {
  if (claimQueueId.value) {
    try {
      const queue = await getLiveQueueById(claimQueueId.value)
      claimQueueName.value = queue.name
    } catch {
      // Silently ignore — chip is purely cosmetic context
    }
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
  >
    <div
      v-if="claimQueueName"
      class="mb-5 flex items-center gap-2 px-4 py-2 rounded-full bg-mint-light border border-mint/30"
    >
      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint">
        <svg
          class="h-3 w-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
          />
        </svg>
      </span>
      <p class="font-body text-sm text-plum">
        Claiming <span class="font-semibold">{{ claimQueueName }}</span> — log in to continue
      </p>
      <button
        type="button"
        class="ml-2 -mr-1 p-1 text-plum/60 hover:text-plum hover:bg-plum-faint/30 rounded-full transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
        aria-label="Dismiss claim"
        @click="handleClose"
      >
        <svg
          class="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>
