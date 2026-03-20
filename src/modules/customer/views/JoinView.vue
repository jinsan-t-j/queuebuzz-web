<script setup>
/**
 * @component JoinView
 * @description Customer-facing queue join page. Shows JoinQueueForm or GeofenceError
 * based on geofence state. Accessed via QR code or direct URL.
 */

// 1. Vue core imports
import { ref, onMounted } from 'vue'

// 4. Local composables
import { useCustomerApi } from '@/modules/customer/composables/useCustomerApi'

// 5. Component imports
import JoinQueueForm from '@/modules/customer/components/JoinQueueForm.vue'
import GeofenceError from '@/modules/customer/components/GeofenceError.vue'

// 7. Emits
const emit = defineEmits(['queue-joined', 'go-to-join-by-code'])

// 8. Composable destructuring
const { joinQueue } = useCustomerApi()

// 9. Reactive state

// Mock data
const queueName = ref('Chai Point · Koramangala')
const peopleInQueue = ref(23)
const estWaitMin = ref(35)

// 11. Methods
async function handleJoinQueue(payload) {
  const result = await joinQueue(payload)
  if (result) {
    emit('queue-joined', result)
  }
}

</script>

<template>
  <div class="relative flex flex-col">
    <!-- Blob decorations — Join screen specific -->
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-[250px] w-[250px] rounded-[125px] bg-mint-light/50 blur-[40px]"
    />
    <div
      class="pointer-events-none absolute -bottom-16 -left-28 h-[238px] w-[238px] rounded-[100px] bg-warning/35 blur-[40px]"
    />

    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <JoinQueueForm
      :queue-name="queueName"
      :people-in-queue="peopleInQueue"
      :est-wait-min="estWaitMin"
      @join-queue="handleJoinQueue"
      @go-to-join-by-code="emit('go-to-join-by-code')"
    />
  </div>
</template>
