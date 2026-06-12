<script setup lang="ts">
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-vue-next'

import { useNotificationStore } from '@/stores/notification.store'

const store = useNotificationStore()

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertOctagon,
}

const colors = {
  info: 'bg-plum-faint text-plum border-plum/10',
  success: 'bg-mint-light text-plum border-mint/10',
  warning: 'bg-warning/10 text-warning-dark border-warning/20',
  error: 'bg-danger/10 text-danger border-danger/20',
}

const iconColors = {
  info: 'text-plum/40',
  success: 'text-mint',
  warning: 'text-warning',
  error: 'text-danger',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[calc(100%-32px)] sm:w-[360px] pointer-events-none"
    >
      <TransitionGroup
        enter-active-class="transform transition ease-out duration-500"
        enter-from-class="translate-x-full opacity-0 scale-95"
        enter-to-class="translate-x-0 opacity-100 scale-100"
        leave-active-class="transition ease-in duration-300 absolute"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
        move-class="transition duration-500"
      >
        <div
          v-for="n in store.notifications"
          :key="n.id"
          class="pointer-events-auto relative flex w-full flex-col overflow-hidden rounded-2xl border bg-white p-4 shadow-[0_12px_40px_rgba(26,10,46,0.12)] transition-all"
          :class="[colors[n.type] || 'border-plum-faint']"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center bg-white/50 border border-white"
              :class="[iconColors[n.type]]"
            >
              <component :is="icons[n.type] || Bell" class="h-5 w-5" />
            </div>

            <div class="flex-1 pr-4">
              <h4 class="font-display text-sm font-bold leading-tight">
                {{ n.title }}
              </h4>
              <p class="mt-1 font-body text-sm font-medium opacity-70 leading-relaxed">
                {{ n.message }}
              </p>
            </div>

            <button
              class="flex-shrink-0 rounded-lg p-1.5 hover:bg-black/5 transition-colors"
              @click="store.removeActiveNotification(n.id)"
            >
              <X class="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
            </button>
          </div>

          <!-- Animated Progress Bar -->
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-black/5">
            <div class="h-full bg-current opacity-20 notification-progress-fill" />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-progress-fill {
  width: 0%;
  animation: notification-progress 5s linear forwards;
  transform-origin: left;
}

@keyframes notification-progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
</style>
