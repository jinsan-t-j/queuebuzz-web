<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BellIcon, XIcon, CheckCircleIcon } from 'lucide-vue-next'
import { useLiveQueue } from '@/modules/app/queue/composables/useLiveQueue'
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  queueId?: string
}>()

const { handleEnableNotifications, hasHostFcmToken, isFcmRegistering } = useLiveQueue()

const isVisible = ref(false)
const isPermissionDenied = ref(false)
const isSuccess = ref(false)

onMounted(() => {
  if (!('Notification' in window)) return

  // Show banner if we don't have a token and permission isn't denied
  const needsToken = !hasHostFcmToken.value
  const isDenied = Notification.permission === 'denied'

  if (needsToken && !isDenied) {
    setTimeout(() => {
      isVisible.value = true
    }, 2000)
  } else if (isDenied) {
    isPermissionDenied.value = true
  }
})

async function handleEnable() {
  try {
    const ok = await handleEnableNotifications(props.queueId)

    if (ok) {
      isSuccess.value = true
      setTimeout(() => {
        isVisible.value = false
      }, 3000)
    } else {
      // Check permission status if registration failed
      if (Notification.permission === 'denied') {
        isPermissionDenied.value = true
      }
    }
  } catch (error) {
    console.error('Error in handleEnable:', error)
  }
}

function dismiss() {
  isVisible.value = false
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="transform translate-y-20 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-20 opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-lg"
    >
      <div
        class="bg-plum/95 backdrop-blur-xl border border-plum-faint/20 rounded-[32px] p-4 pr-12 shadow-[0_20px_50px_rgba(26,10,46,0.3)] relative overflow-hidden"
      >
        <div class="flex items-center gap-4">
          <!-- Icon -->
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            :class="isSuccess ? 'bg-mint text-plum' : 'bg-plum-soft text-mint'"
          >
            <CheckCircleIcon v-if="isSuccess" class="w-6 h-6" />
            <BellIcon v-else class="w-6 h-6" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h4 class="font-display font-bold text-sm text-sand">
              {{ isSuccess ? 'Alerts Enabled!' : 'Never miss a guest' }}
            </h4>
            <p class="font-body text-xs text-sand/60 mt-0.5 leading-relaxed">
              {{
                isSuccess
                  ? "You'll now receive push notifications for all queue updates."
                  : 'Receive real-time alerts when new guests join or arrive at your door.'
              }}
            </p>
          </div>

          <!-- Action -->
          <div v-if="!isSuccess" class="shrink-0">
            <BaseButton
              variant="primary"
              size="sm"
              class="!bg-mint !text-plum font-semibold px-4 min-w-[100px]"
              :disabled="isFcmRegistering"
              @click="handleEnable"
            >
              <template v-if="isFcmRegistering">
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 border-2 border-plum/30 border-t-plum rounded-full animate-spin"
                  />
                  <span>Working...</span>
                </div>
              </template>
              <template v-else>
                {{ isPermissionDenied ? 'Check Settings' : 'Enable' }}
              </template>
            </BaseButton>
          </div>
        </div>

        <!-- Close -->
        <button
          class="absolute top-4 right-4 text-sand/40 hover:text-sand transition-colors p-1"
          @click="dismiss"
        >
          <XIcon class="w-5 h-5" />
        </button>

        <!-- Success Progress Bar -->
        <div v-if="isSuccess" class="absolute bottom-0 left-0 h-1 bg-mint animate-progress" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-progress {
  animation: progress 3000ms linear forwards;
}

/* Glassmorphism subtle glow */
div::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 229, 160, 0.05) 0%, transparent 70%);
  pointer-events: none;
}
</style>
