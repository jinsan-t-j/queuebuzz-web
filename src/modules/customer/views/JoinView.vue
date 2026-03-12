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
const { checkGeofence, joinQueue, isLoading } = useCustomerApi()

// 9. Reactive state
const isOutOfRange = ref(false)
const distanceMeters = ref(0)
const isCheckingGeofence = ref(true)

// Mock data
const queueName = ref('Chai Point · Koramangala')
const peopleInQueue = ref(23)
const estWaitMin = ref(35)

// 11. Methods
async function handleGeofenceCheck() {
  isCheckingGeofence.value = true
  const result = await checkGeofence()
  isOutOfRange.value = !result.isWithinRange
  distanceMeters.value = result.distanceMeters
  isCheckingGeofence.value = false
}

async function handleJoinQueue(payload) {
  const result = await joinQueue(payload)
  if (result) {
    emit('queue-joined', result)
  }
}

function handleRetryGeofence() {
  handleGeofenceCheck()
}

// 12. Lifecycle hooks
onMounted(() => {
  handleGeofenceCheck()
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Queue name header -->
    <h1 class="px-5 pb-2 pt-6 text-center font-display text-lg font-bold text-plum">
      {{ queueName }}
    </h1>

    <!-- Loading state -->
    <div v-if="isCheckingGeofence" class="flex flex-col gap-3 px-5 py-8">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-3xl bg-plum-faint" />
    </div>

    <!-- Geofence error -->
    <GeofenceError
      v-else-if="isOutOfRange"
      :distance-meters="distanceMeters"
      @retry-geofence="handleRetryGeofence"
    />

    <!-- Join form -->
    <JoinQueueForm
      v-else
      :queue-name="queueName"
      :people-in-queue="peopleInQueue"
      :est-wait-min="estWaitMin"
      @join-queue="handleJoinQueue"
      @go-to-join-by-code="emit('go-to-join-by-code')"
    />
  </div>
</template>
