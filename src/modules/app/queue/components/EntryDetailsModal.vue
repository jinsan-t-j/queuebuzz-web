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
import { ENTRY_STATUS } from '@/modules/app/queue/constants'

// Icons
import CloseXIcon from '@/assets/icons/close-x.svg?component'
import CallNextIcon from '@/assets/icons/call-next.svg?component'
import ClockTimeIcon from '@/assets/icons/clock-time.svg?component'
import PartyIcon from '@/assets/icons/add-person.svg?component'
import CheckIcon from '@/assets/icons/check-mint.svg?component'

const props = defineProps<{
  entry: QueueEntry
  isOpen: boolean
  avgServiceMins: number
  showPartySize: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'call', id: string): void
  (e: 'serve', id: string): void
}>()

const statusConfig = computed(() => {
  if (!props.entry) return { label: '', color: '' }
  switch (props.entry.status) {
    case ENTRY_STATUS.WAITING:
      return { label: 'Waiting in line', color: 'bg-warning/10 text-warning' }
    case ENTRY_STATUS.CALLED:
      return { label: 'Currently Called', color: 'bg-mint text-plum font-bold' }
    case ENTRY_STATUS.SERVED:
      return { label: 'Successfully Served', color: 'bg-mint/10 text-mint' }
    case ENTRY_STATUS.ARRIVED:
      return { label: 'Confirmed Arrival', color: 'bg-mint text-plum font-bold' }
    default:
      return { label: props.entry.status.toUpperCase() as any, color: 'bg-plum/10 text-plum' }
  }
})

const formattedJoinedTime = computed(() => {
  if (!props.entry.createdAt) return ''
  try {
    return new Date(props.entry.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return ''
  }
})

const estWaitMin = computed(() => {
  if (props.entry.status !== ENTRY_STATUS.WAITING || !props.entry.position) return 0
  return Math.max(0, (props.entry.position - 1) * (props.avgServiceMins || 0))
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

        <!-- Quick Info Grid -->
        <div class="mb-8 grid grid-cols-2 gap-3">
          <!-- Party Size -->
          <div v-if="showPartySize" class="flex flex-col items-center justify-center rounded-2xl bg-sand p-5 text-center transition-all hover:bg-sand/80">
            <span class="font-body text-[10px] font-bold uppercase tracking-widest text-plum-muted">
              Party Size
            </span>
            <div class="mt-2 flex items-center gap-2">
              <PartyIcon class="h-5 w-5 text-plum/40" />
              <span class="font-body text-2xl font-bold text-plum">
                {{ entry.partySize }}
              </span>
            </div>
          </div>

          <!-- Est. Wait -->
          <div 
            class="flex flex-col items-center justify-center rounded-2xl bg-sand p-5 text-center transition-all hover:bg-sand/80"
            :class="{ 'col-span-2': !showPartySize }"
          >
            <span class="font-body text-[10px] font-bold uppercase tracking-widest text-plum-muted">
              Est. Wait
            </span>
            <div class="mt-2 flex items-center gap-2 text-plum">
              <ClockTimeIcon class="h-5 w-5 text-plum/40" />
              <span class="font-body text-2xl font-bold">
                {{ estWaitMin }}<span class="text-sm">m</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Details List -->
        <div class="space-y-4 border-t border-plum-faint pt-6 px-2">
          <div class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Guest Name</span>
            <span class="font-body text-base font-bold text-plum">{{ entry.name }}</span>
          </div>
          <div v-if="entry.createdBy" class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Source</span>
            <span class="font-body text-sm font-bold text-plum">Added by host</span>
          </div>
          <div v-if="formattedJoinedTime" class="flex items-center justify-between">
            <span class="font-body text-sm text-plum-muted">Joined At</span>
            <span class="font-body text-base font-bold text-plum">{{ formattedJoinedTime }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-10 flex flex-col gap-3">
          <!-- If called or arrived, show serve -->
          <div v-if="entry.status == ENTRY_STATUS.CALLED || entry.status == ENTRY_STATUS.ARRIVED" class="flex flex-col gap-3">
            <BaseButton
              variant="primary"
              class="w-full py-4 text-base font-bold"
              @click="emit('serve', entry.id)"
            >
              <CheckIcon class="mr-2 h-5 w-5" />
              Mark as Served
            </BaseButton>
            <BaseButton v-if="entry.status == ENTRY_STATUS.ARRIVED" variant="ghost" class="w-full text-danger" @click="emit('call', entry.id)">
              <CallNextIcon class="mr-2 h-4 w-4" />
              Re-call Guest
            </BaseButton>
            <BaseButton variant="ghost" class="w-full" @click="emit('close')">
              Close
            </BaseButton>
          </div>

          <!-- If waiting, show call -->
          <div v-else-if="entry.status == ENTRY_STATUS.WAITING" class="flex flex-col gap-3">
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
