<script setup lang="ts">
/**
 * @component HistoryDetailTimeline
 * @description Renders an interleaved session timeline with collapsible groups for arrivals.
 */
import { ref } from 'vue'
import {
  PlusCircleIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  PowerIcon,
  ChevronDownIcon,
  ActivityIcon,
  FileTextIcon,
} from 'lucide-vue-next'

interface SubEvent {
  ticketNo: string
  name: string
  action: string
  time: string
}

interface TimelineEvent {
  type: string
  timestamp: string
  message: string
  color: string
  subEvents?: SubEvent[]
}

defineProps<{
  events: TimelineEvent[]
}>()

const openGroupIndices = ref<Set<number>>(new Set())

function toggleGroup(index: number) {
  if (openGroupIndices.value.has(index)) {
    openGroupIndices.value.delete(index)
  } else {
    openGroupIndices.value.add(index)
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'JOINED':
      return PlusCircleIcon
    case 'CALLED':
      return BellIcon
    case 'SERVED':
      return CheckCircleIcon
    case 'SKIPPED':
      return XCircleIcon
    case 'STATUS_CHANGE':
      return ActivityIcon
    default:
      return PowerIcon
  }
}

function getColorClass(color: string) {
  switch (color) {
    case 'mint':
      return 'text-mint bg-mint-light/20'
    case 'warning':
      return 'text-warning bg-warning/15'
    case 'danger':
      return 'text-danger bg-danger/15'
    case 'plum-soft':
      return 'text-plum-soft bg-plum-faint'
    default:
      return 'text-plum-muted bg-plum-faint'
  }
}
</script>

<template>
  <div
    v-if="events.length > 0"
    class="relative pl-8 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-plum-faint"
  >
    <div v-for="(event, index) in events" :key="index" class="relative">
      <!-- Timeline Dot/Icon -->
      <div
        class="absolute -left-[25px] w-5 h-5 rounded-full border border-plum-faint flex items-center justify-center z-10"
        :class="getColorClass(event.color)"
      >
        <component :is="getIcon(event.type)" class="w-3 h-3" />
      </div>

      <!-- Event Card -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="font-body font-black text-plum text-sm">{{ event.message }}</span>
            <button
              v-if="event.subEvents?.length"
              class="flex items-center gap-1 px-2 py-0.5 rounded-md border border-plum-faint hover:bg-sand transition-colors text-[10px] font-body text-plum font-black"
              @click="toggleGroup(index)"
            >
              {{ event.subEvents.length }} details
              <ChevronDownIcon
                class="w-3 h-3 transition-transform duration-200"
                :class="{ 'rotate-180': openGroupIndices.has(index) }"
              />
            </button>
          </div>
          <span
            class="font-mono text-[10px] text-plum-muted font-black px-2 py-0.5 border border-plum-faint rounded-md"
            >{{ event.timestamp }}</span
          >
        </div>

        <!-- Collapsible Details -->
        <div
          v-if="event.subEvents?.length && openGroupIndices.has(index)"
          class="ml-2 pl-4 py-2 border-l border-plum-faint space-y-2 bg-sand/30 rounded-r-lg"
        >
          <div
            v-for="(sub, sIdx) in event.subEvents"
            :key="sIdx"
            class="flex items-center justify-between text-[11px] font-body text-plum font-black"
          >
            <div class="flex items-center gap-2">
              <span class="font-mono text-plum-soft font-black">{{ sub.ticketNo }}</span>
              <span>{{ sub.name }}</span>
            </div>
            <span class="text-plum-muted">{{ sub.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="flex flex-col items-center justify-center py-12 text-center">
    <div
      class="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4 border border-plum-faint"
    >
      <FileTextIcon class="w-6 h-6 text-plum-muted" />
    </div>
    <p class="font-display font-black text-plum mb-1">No activity logged</p>
    <p class="font-body text-xs text-plum-muted max-w-[200px] font-medium">
      This queue ended without any recorded customer interactions or status changes.
    </p>
  </div>
</template>
