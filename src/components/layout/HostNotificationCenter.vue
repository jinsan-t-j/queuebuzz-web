<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification.store'
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertOctagon,
  Trash2,
  Clock,
} from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'

const store = useNotificationStore()
const isOpen = ref(false)

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertOctagon,
}

const colors = {
  info: 'bg-plum-faint text-plum',
  success: 'bg-mint-light text-plum',
  warning: 'bg-warning/10 text-warning-dark',
  error: 'bg-danger/10 text-danger',
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    store.markAllRead()
  }
}

// Close on escape — uses onCleanup to prevent listener accumulation
watch(isOpen, (val, _, onCleanup) => {
  if (val) {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        isOpen.value = false
      }
    }
    globalThis.addEventListener('keydown', handleEsc)
    onCleanup(() => globalThis.removeEventListener('keydown', handleEsc))
  }
})
</script>

<template>
  <div class="relative">
    <!-- Trigger Button -->
    <button
      class="relative cursor-pointer flex h-10 w-10 items-center justify-center rounded-2xl border border-plum-faint bg-white text-plum shadow-sm transition-all hover:border-plum hover:shadow-md"
      :class="{ 'ring-2 ring-plum/10': isOpen }"
      aria-label="Open notifications"
      @click="toggle"
    >
      <Bell class="h-5 w-5" />
      <span
        v-if="store.unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-plum font-mono text-sm font-bold text-sand shadow-sm animate-in zoom-in"
      >
        {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
      </span>
    </button>

    <!-- Drawer Overlay -->
    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex justify-end overflow-hidden">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-plum/20 backdrop-blur-sm transition-opacity"
          @click="isOpen = false"
        />

        <!-- Side Panel -->
        <div
          class="relative flex w-full max-w-sm flex-col bg-white shadow-[-8px_0_40px_rgba(26,10,46,0.15)] animate-in slide-in-from-right duration-300"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-plum-faint px-6 py-5">
            <div>
              <h2 class="font-display text-lg font-bold text-plum">Activity Logs</h2>
              <p class="font-body text-sm text-plum-muted">Track queue events in real-time</p>
            </div>
            <button
              class="cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl bg-plum-faint text-plum-muted transition-colors hover:bg-plum hover:text-sand"
              @click="isOpen = false"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Actions -->
          <div
            v-if="store.history.length > 0"
            class="flex items-center justify-between px-6 py-3 bg-sand/30"
          >
            <span class="font-body text-sm text-plum-muted font-medium">
              {{ store.history.length }} notification{{ store.history.length > 1 ? 's' : '' }}
            </span>
            <button
              class="flex items-center gap-1.5 font-body text-sm font-bold text-danger hover:underline"
              @click="store.clearHistory"
            >
              <Trash2 class="h-3 w-3" />
              Clear all
            </button>
          </div>

          <!-- List Section -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div
              v-if="store.history.length === 0"
              class="flex flex-col items-center justify-center py-20 text-center"
            >
              <div
                class="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-plum-faint"
              >
                <Bell class="h-8 w-8 text-plum/30" />
              </div>
              <p class="font-display text-base font-bold text-plum">No activity yet</p>
              <p class="mt-1 max-w-[200px] font-body text-sm text-plum-muted">
                Notifications for incoming guests and arrivals will appear here.
              </p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="n in store.history"
                :key="n.id"
                class="group relative overflow-hidden rounded-2xl border border-plum-faint bg-white p-4 transition-all hover:border-plum/20 hover:shadow-sm"
              >
                <!-- Unread Indicator -->
                <div v-if="!n.isRead" class="absolute left-0 top-0 h-full w-1 bg-plum" />

                <div class="flex items-start gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
                    :class="colors[n.type] || 'bg-plum-faint text-plum-muted'"
                  >
                    <component :is="icons[n.type] || Bell" class="h-4 w-4" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-display text-sm font-bold text-plum">
                      {{ n.title }}
                    </h4>
                    <p class="mt-0.5 font-body text-sm text-plum-muted leading-relaxed">
                      {{ n.message }}
                    </p>
                    <div
                      class="mt-2 flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-plum/30"
                    >
                      <Clock class="h-2.5 w-2.5" />
                      {{ formatDistanceToNow(n.createdAt, { addSuffix: true }) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Summary (Optional) -->
          <div class="border-t border-plum-faint p-6">
            <p class="text-center font-body text-sm text-plum-muted leading-relaxed">
              We preserve up to 50 recent events for your session. Recalculations might cause slight
              delays.
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.slide-in-from-right {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
