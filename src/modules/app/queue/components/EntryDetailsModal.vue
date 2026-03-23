<script setup lang="ts">
/**
 * @component EntryDetailsModal
 * @description Detailed information modal for a single queue entry.
 * Allows hosts to see guest details and take actions like Call, Serve, or Skip.
 */
import { computed } from 'vue'
import type { QueueEntry } from '../types'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseModal from '@/components/base/BaseModal.vue'

// Icons
import CloseXIcon from '@/assets/icons/close-x.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'
import ClockTimeIcon from '@/assets/icons/clock-time.svg?component'
import PartyIcon from '@/assets/icons/add-person.svg?component'
import CheckIcon from '@/assets/icons/check-mint.svg?component'

const props = defineProps<{
  entry: QueueEntry
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'call', id: string): void
  (e: 'serve', id: string): void
}>()

const statusConfig = computed(() => {
  if (!props.entry) return { label: '', color: '' }
  switch (props.entry.status) {
    case 'WAITING':
      return { label: 'Waiting in line', color: 'bg-warning/10 text-warning' }
    case 'CALLED':
      return { label: 'Currently Called', color: 'bg-mint text-plum font-bold' }
    case 'SERVED':
      return { label: 'Successfully Served', color: 'bg-mint/10 text-mint' }
    default:
      return { label: props.entry.status.toUpperCase() as any, color: 'bg-plum/10 text-plum' }
  }
})

const formattedJoinedTime = computed(() => {
  if (!props.entry.joinedAt) return ''
  try {
    return new Date(props.entry.joinedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return ''
  }
})
</script>

<template>
  <BaseModal :is-open="isOpen" @close="emit('close')">
    <div class="relative bg-white">
      <!-- Close button -->
      <button
        class="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-sand cursor-pointer transition-colors hover:bg-plum/5"
        @click="emit('close')"
      >
        <CloseXIcon class="h-4 w-4 text-plum/40" />
      </button>

      <div class="p-6">
        <!-- Header: Ticket & Status -->
        <div class="mb-8 pt-4 text-center">
          <span class="font-mono text-[64px] font-bold leading-none tracking-tight text-plum">
            #{{ entry.ticketNo.toString().padStart(3, '0') }}
          </span>
          <div class="mt-4 flex justify-center">
            <BaseBadge :class="statusConfig.color">
              {{ statusConfig.label }}
            </BaseBadge>
          </div>
        </div>

        <!-- Details List -->
        <div class="space-y-6">
          <div class="flex items-center justify-between rounded-2xl bg-sand p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-plum shadow-sm">
                <span class="font-display text-sm font-bold">Pos</span>
              </div>
              <div>
                <p class="font-body text-[10px] font-bold uppercase tracking-wider text-plum/40">
                  Position
                </p>
                <p class="font-body text-base font-bold text-plum">
                  {{ entry.position }} in line
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-plum shadow-sm">
                <ClockTimeIcon class="h-5 w-5 opacity-40" />
              </div>
              <div>
                <p class="font-body text-[10px] font-bold uppercase tracking-wider text-plum/40">
                  Est. Wait
                </p>
                <p class="font-body text-base font-bold text-plum">
                  {{ entry.estimatedWaitMin }} mins
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4 px-2">
            <div class="flex items-center justify-between">
              <span class="font-body text-sm text-plum/50">Guest Name</span>
              <span class="font-body text-base font-bold text-plum">{{ entry.name }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-body text-sm text-plum/50">Party Size</span>
              <span class="flex items-center gap-2 font-body text-base font-bold text-plum">
                <PartyIcon class="h-4 w-4 opacity-30" />
                {{ entry.partySize }} People
              </span>
            </div>
            <div v-if="formattedJoinedTime" class="flex items-center justify-between">
              <span class="font-body text-sm text-plum/50">Joined At</span>
              <span class="font-body text-base font-bold text-plum">{{ formattedJoinedTime }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-10 flex flex-col gap-3">
          <!-- If called, show serve -->
          <div v-if="entry.status == 'CALLED'" class="flex flex-col gap-3">
            <BaseButton
              variant="primary"
              class="w-full py-4 text-base font-bold"
              @click="emit('serve', entry.id)"
            >
              <CheckIcon class="mr-2 h-5 w-5" />
              Mark as Served
            </BaseButton>
            <BaseButton variant="ghost" class="w-full" @click="emit('close')">
              Close
            </BaseButton>
          </div>

          <!-- If waiting, show call -->
          <div v-else-if="entry.status == 'WAITING'" class="flex flex-col gap-3">
            <BaseButton
              variant="primary"
              class="w-full py-4 text-base font-bold"
              @click="emit('call', entry.id)"
            >
              <CallNextIcon class="mr-2 h-5 w-5" />
              Call Guest
            </BaseButton>
            <BaseButton variant="ghost" class="w-full" @click="emit('close')">
              Cancel
            </BaseButton>
          </div>

          <!-- Default close for other statuses -->
          <div v-else class="flex flex-col gap-3">
            <BaseButton variant="primary" class="w-full py-4" @click="emit('close')">
              Close
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
